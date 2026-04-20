
import React, { useState, useEffect } from 'react';

import { Link, useNavigate } from 'react-router-dom';
import ImageWithBasePath from '../../core/img/imagewithbasebath';

import { setToogleHeader } from '../../core/redux/action';
import { useDispatch, useSelector } from 'react-redux';
import { Filter, PlusCircle, Sliders, StopCircle, User, Zap } from 'react-feather';
import Select from 'react-select';
import withReactContent from 'sweetalert2-react-content';
import Swal from 'sweetalert2';
import Table from '../../core/pagination/datatable';
import AddUsers from '../../core/modals/usermanagement/addusers';
import EditUser from '../../core/modals/usermanagement/edituser';
import AuthService from '../../services/authService';
import TableHeaderActions from '../tableheader'
import { usePermissions } from '../../hooks/usePermission';


const Users = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const data = useSelector((state) => state.toggle_header);
    const {hasPermission} = usePermissions();

    // State management
    const [currentUser, setCurrentUser] = useState(null);
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    
    const [filters, setFilters] = useState({
        search: '',
        username: '',
        status: '',
        role: '',
        sortBy: 'date'
    });

  
    useEffect(() => {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        if (!token || token === 'undefined' || token === 'null') {
            navigate('/signin');
        }
    }, [navigate]);




    
    const fetchCurrentUser = async () => {
        try {
            const response = await AuthService.getCurrentUser(); 
            const userData = response.data;
            
            console.log(" Current user API response:", userData);
            
            const roleName = userData.role || userData.role_name || 'User';
            
            const currentUserWithRole = {
                ...userData,
                role: roleName,
                role_id: userData.role_id
            };
            
            console.log("Setting Current User:", {
                id: currentUserWithRole.id,
                email: currentUserWithRole.email,
                role: currentUserWithRole.role,
                role_id: currentUserWithRole.role_id
            });
            
            setCurrentUser(currentUserWithRole);
            return currentUserWithRole;
        } catch (error) {
            console.error(" Error fetching current user:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load user information. Please refresh the page.',
            });
            return null;
        }
    };

    
    const fetchRoles = async () => {
        try {
            const response = await AuthService.getRoles();
            const rolesData = response.data.roles || [];
            
            console.log(" Roles fetched:", rolesData.map(r => `${r.name}(id:${r.id})`).join(', '));
            
            setRoles(rolesData);
            return rolesData;
        } catch (error) {
            console.error(' Error fetching roles:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load roles. Please refresh the page.',
            });
            return [];
        }
    };

    const fetchUsers = async () => {
    if (roles.length === 0) {
        console.log("Roles not loaded yet, skipping user fetch");
        return;
    }

    setLoading(true);
    try {
        const response = await AuthService.getUser();
        const usersData = Array.isArray(response.data)
            ? response.data
            : response.data.users || [];

        const processedUsers = usersData.map((user) => {
            let roleName = user.role_name;
            
            if (!roleName && user.role_id) {
                const userRole = roles.find(r => r.id === user.role_id);
                roleName = userRole ? userRole.name : 'N/A';
            }
            
            return {
                ...user,
                username: user.username || user.name,
                role_name: roleName || 'N/A',
                warehouse: user.warehouse_name || 'N/A',
                img: user.avatar
                    ? `http://13.234.253.16:7000/${user.avatar}`
                    : 'assets/img/avatar/avatar-default.jpg',
                createdon: new Date(user.created_at).toLocaleDateString(),
                status: user.status || 'Active'
            };
        });


        let filteredUsers = processedUsers;

        if (filters.search) {
            filteredUsers = filteredUsers.filter(user =>
                user.username?.toLowerCase().includes(filters.search.toLowerCase()) ||
                user.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
                user.phone?.includes(filters.search) ||
                user.warehouse?.toLowerCase().includes(filters.search.toLowerCase())
            );
        }

        if (filters.username) {
            filteredUsers = filteredUsers.filter(
                user => user.username?.toLowerCase() === filters.username.toLowerCase()
            );
        }

        if (filters.status) {
            filteredUsers = filteredUsers.filter(user => user.status === filters.status);
        }

        if (filters.role) {
            filteredUsers = filteredUsers.filter(user => user.role_name === filters.role);
        }

        if (filters.sortBy === 'newest') {
            filteredUsers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        } else if (filters.sortBy === 'oldest') {
            filteredUsers.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        }

        setUsers(filteredUsers);
    } catch (error) {
        console.error('Error fetching users:', error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Failed to fetch users'
        });
    } finally {
        setLoading(false);
    }
};




    // Initialize in correct order
    useEffect(() => {
        const initializeData = async () => {
            console.log(" Starting initialization...");
            setInitializing(true);
            
            try {
                const rolesData = await fetchRoles();
                
                if (!rolesData || rolesData.length === 0) {
                    console.error(" No roles loaded, cannot proceed");
                    Swal.fire({
                        icon: 'warning',
                        title: 'Warning',
                        text: 'No roles found in system. Please contact administrator.',
                    });
                    setInitializing(false);
                    return;
                }
                
                const userData = await fetchCurrentUser();
                
                if (!userData) {
                    console.error(" Failed to load current user");
                    setInitializing(false);
                    return;
                }
                
                console.log(" Initialization complete");
                
            } catch (error) {
                console.error(" Initialization failed:", error);
            } finally {
                setInitializing(false);
            }
        };
        
        initializeData();
    }, []);

    // Fetch users after roles and currentUser are loaded
    useEffect(() => {
        if (roles.length > 0 && currentUser && !initializing) {
            console.log("Fetching users...");
            fetchUsers();
        }
        // eslint-disable-next-line
    }, [roles, currentUser, initializing]);

 
    useEffect(() => {
        if (roles.length > 0 && !initializing) {
            const timeoutId = setTimeout(() => {
                fetchUsers();
            }, 500);
            return () => clearTimeout(timeoutId);
        }
        // eslint-disable-next-line
    }, [filters.search]);

    // IMMEDIATE FILTER - Other filters trigger immediately
    useEffect(() => {
        if (roles.length > 0 && !initializing) {
            fetchUsers();
        }
        // eslint-disable-next-line
    }, [filters.username, filters.status, filters.role, filters.sortBy]);

    const toggleFilterVisibility = () => {
        setIsFilterVisible(prev => !prev);
    };

    // Delete user
    const handleDelete = async (userId) => {
        const MySwal = withReactContent(Swal);

        MySwal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            showCancelButton: true,
            confirmButtonColor: '#00ff00',
            confirmButtonText: 'Yes, delete it!',
            cancelButtonColor: '#ff0000',
            cancelButtonText: 'Cancel',
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await AuthService.deleteUserById(userId);
                    MySwal.fire({
                        title: 'Deleted!',
                        text: 'User has been deleted.',
                        icon: 'success',
                        confirmButtonText: 'OK',
                        customClass: { confirmButton: 'btn btn-success' },
                    });
                    fetchUsers();
                } catch (error) {
                    MySwal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: error.response?.data?.message || 'Failed to delete user'
                    });
                }
            }
        });
    };


 

    const handleSearch = (e) => {
        setFilters(prev => ({ ...prev, search: e.target.value }));
    };

    const handleFilterChange = (field, value) => {
        setFilters(prev => ({ ...prev, [field]: value }));
    };

const resetFiltersHandler = () => {
    console.log(' Resetting all filters...');
    
    setFilters({
        search: '',
        username: '',
        status: '',
        role: '',
        sortBy: 'date'
    });
    
 
    setIsFilterVisible(false);
    
    console.log(' Filters reset complete');
};



    const handleEdit = (user) => {
        console.log("✏️ Opening edit modal for user:", user);
        setSelectedUser(user);
    };

    // Dropdown options
    const sortOptions = [
        { value: 'date', label: 'Sort by Date' },
        { value: 'newest', label: 'Newest' },
        { value: 'oldest', label: 'Oldest' },
    ];

    const userOptions = [
        { value: '', label: 'Choose Name' },
        ...Array.from(new Set(users.map(user => user.username)))
            .map(username => ({ value: username, label: username }))
    ];

    const statusOptions = [
        { value: '', label: 'Choose Status' },
        { value: 'Active', label: 'Active' },
        { value: 'Inactive', label: 'Inactive' },
    ];

    const roleOptions = [
        { value: '', label: 'Choose Role' },
        ...roles.map(role => ({ value: role.name, label: role.name }))
    ];


    // Table columns
    const columns = [
        {
            title: "Name",
            dataIndex: "name",
            render: (text, record) => (
                <span className="userimgname">
                    <Link to="#" className="userslist-img bg-img">
                        <ImageWithBasePath alt="" src={record.img} />
                    </Link>
                    <div><Link to="#">{text}</Link></div>
                </span>
            ),
            sorter: (a, b) => (a.name || '').localeCompare(b.name || ''),
        },
        {
            title: "User Name",
            dataIndex: "username",
            render: (text, record) => (
                <span className="userimgname">
                    <Link to="#" className="userslist-img bg-img">
                        <ImageWithBasePath alt="" src={record.img} />
                    </Link>
                    <div><Link to="#">{text}</Link></div>
                </span>
            ),
            sorter: (a, b) => (a.username || '').localeCompare(b.username || ''),
        },
        {
            title: "Phone",
            dataIndex: "phone",
            render: (text) => text || 'N/A',
            sorter: (a, b) => (a.phone || '').localeCompare(b.phone || ''),
        },
        {
            title: "Email",
            dataIndex: "email",
            sorter: (a, b) => (a.email || '').localeCompare(b.email || ''),
        },
        {
            title: "Warehouse",
            dataIndex: "warehouse",
            sorter: (a, b) => (a.warehouse || '').localeCompare(b.warehouse || ''),
        },
        {
            title: "Role",
            dataIndex: "role_name",
            render: (text) => text || 'N/A',
            sorter: (a, b) => (a.role_name || '').localeCompare(b.role_name || ''),
        },
        {
            title: "Created On",
            dataIndex: "createdon",
            sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
        },
        {
            title: "Status",
            dataIndex: "status",
            render: (text) => (
                <div>
                    {text === "Active" && <span className="badge badge-linesuccess">{text}</span>}
                    {text === "Inactive" && <span className="badge badge-linedanger">{text}</span>}
                </div>
            ),
            sorter: (a, b) => (a.status || '').localeCompare(b.status || ''),
        },
    ...(hasPermission('User','view') ? [{
            title: 'Actions',
            dataIndex: 'actions',
            key: 'actions',
            render: (_, record) => (
                <td className="action-table-data">
                    <div className="edit-delete-action">
                        <Link className="me-2 p-2" to={`/users/${record.id}`}>
                            <i data-feather="eye" className="feather feather-eye action-eye"></i>
                        </Link>
                        <a
                            className="me-2 p-2"
                            href="#"
                            data-bs-toggle="modal"
                            data-bs-target="#edit-units"
                            onClick={(e) => {
                                e.preventDefault();
                                handleEdit(record);
                            }}
                            style={{ cursor: 'pointer' }}
                        >
                            <i data-feather="edit" className="feather-edit"></i>
                        </a>
                        <Link
                            className="confirm-text p-2"
                            to="#"
                            onClick={() => handleDelete(record.id)}
                        >
                            <i data-feather="trash-2" className="feather-trash-2"></i>
                        </Link>
                    </div>
                </td>
              )
}] : [])
    ]


     if (initializing) {
        return (
            <div className="page-wrapper">
                <div className="content">
                    <div className="text-center p-5">
                        <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3">Loading user management system...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (!currentUser) {
        return (
            <div className="page-wrapper">
                <div className="content">
                    <div className="alert alert-danger text-center p-5">
                        <h4>Error Loading User Information</h4>
                        <p>Unable to load your user profile. Please refresh the page or contact support.</p>
                        <button className="btn btn-primary" onClick={() => window.location.reload()}>
                            Refresh Page
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page-wrapper">
            <div className="content">
                <div className="page-header">
                    <div className="add-item d-flex">
                        <div className="page-title">
                            <h4>User List</h4>
                            <h6>Manage Your Users</h6>
                        </div>
                    </div>
                       <TableHeaderActions
                        onRefresh={fetchUsers}
                        pdfEndpoint="/auth/export/users/pdf"
                        excelEndpoint="/auth/export/users/excel"
                        filters={{
                            search: filters.search,
                            status: filters.status,
                            role: filters.role,
                        }}
                        entityName="users"
                        dispatch={dispatch}
                        headerState={data}
                        headerAction={setToogleHeader}
                        showPrint={true}
                    />

                  
                   {hasPermission('User','view') && <div className="page-btn">
                        <a to="#" className="btn btn-added" data-bs-toggle="modal" data-bs-target="#add-units">
                            <PlusCircle className="me-2" /> Add New User
                        </a>
                    </div>}
                </div>

                <div className="card table-list-card">
                    <div className="card-body">
                        <div className="table-top">
                            <div className="search-set">
                                <div className="search-input">
                                    <input
                                        type="text"
                                        placeholder="Search"
                                        className="form-control form-control-sm formsearch"
                                        value={filters.search}
                                        onChange={handleSearch}
                                    />
                                    <Link to="#" className="btn btn-searchset">
                                        <i data-feather="search" className="feather-search" />
                                    </Link>
                                </div>
                            </div>
                            <div className="search-path">
                                <Link className={`btn btn-filter ${isFilterVisible ? "setclose" : ""}`}>
                                    <Filter className="filter-icon" onClick={toggleFilterVisibility} />
                                    <span onClick={toggleFilterVisibility}>
                                        <ImageWithBasePath src="assets/img/icons/closes.svg" alt="img" />
                                    </span>
                                </Link>
                            </div>
                            <div className="form-sort">
                                <Sliders className="info-img" />
                                <Select
                                    className="select"
                                    options={sortOptions}
                                    placeholder="Sort by Date"
                                    value={sortOptions.find(opt => opt.value === filters.sortBy)}
                                    onChange={(opt) => handleFilterChange('sortBy', opt.value)}
                                />
                            </div>
                        </div>

                        {/* Filter Section */}
                        <div className={`card${isFilterVisible ? ' visible' : ''}`} id="filter_inputs" style={{ display: isFilterVisible ? 'block' : 'none' }}>
                            <div className="card-body pb-0">
                                <div className="row">
                                    <div className="col-lg-3 col-sm-6 col-12">
                                        <div className="input-blocks">
                                            <User className="info-img" />
                                            <Select
                                                className="select"
                                                options={userOptions}
                                                placeholder="Choose Name"
                                                value={userOptions.find(opt => opt.value === filters.username)}
                                                onChange={(opt) => handleFilterChange('username', opt.value)}
                                                isClearable
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-sm-6 col-12">
                                        <div className="input-blocks">
                                            <StopCircle className="info-img" />
                                            <Select
                                                className="select"
                                                options={statusOptions}
                                                placeholder="Choose Status"
                                                value={statusOptions.find(opt => opt.value === filters.status)}
                                                onChange={(opt) => handleFilterChange('status', opt.value)}
                                                isClearable
                                            />
                                        </div>
                                    </div>
                                    <div className="col-lg-3 col-sm-6 col-12">
                                        <div className="input-blocks">
                                            <Zap className="info-img" />
                                            <Select
                                                className="select"
                                                options={roleOptions}
                                                placeholder="Choose Role"
                                                value={roleOptions.find(opt => opt.value === filters.role)}
                                                onChange={(opt) => handleFilterChange('role', opt.value)}
                                                isClearable
                                            />
                                        </div>
                                    </div>
                                     <div className="col-lg-3 col-sm-6 col-12">
                    <div className="input-blocks">
                      <a
                        className="btn btn-filters ms-auto w-100"
                        onClick={resetFiltersHandler}
                      >
                        Reset Filters
                      </a>
                    </div>
                  </div>
                                </div>
                            </div>
                        </div>

                        {/* Table */}
                        <div className="table-responsive">
                            {loading ? (
                                <div className="text-center p-4">
                                    <div className="spinner-border text-primary" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            ) : users.length > 0 ? (
                                <Table columns={columns} dataSource={users} />
                            ) : (
                                <div className="text-center p-4">
                                    <p>No users found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {currentUser && roles.length > 0 && (
                <>
                    <AddUsers 
                        onSuccess={fetchUsers} 
                        roles={roles} 
                        currentUserRole={currentUser.role}  
                    />
                    <EditUser 
                        user={selectedUser} 
                        onSuccess={fetchUsers} 
                        roles={roles} 
                        currentUserRole={currentUser.role}  
                    />
                </>
            )}
        </div>
    );
};

export default Users;