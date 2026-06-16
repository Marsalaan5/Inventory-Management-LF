
import React, { useState, useEffect } from 'react';
import ImageWithBasePath from '../../core/img/imagewithbasebath';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ChevronUp, Filter, Zap } from 'react-feather';
import { setToogleHeader } from '../../core/redux/action';
import { useDispatch, useSelector } from 'react-redux';
import Select from 'react-select';
import { RotateCcw } from 'feather-icons-react/build/IconComponents';
import AuthService from '../../services/authService';

const Permissions = () => {
  const dispatch = useDispatch();
  const data = useSelector((state) => state.toggle_header);
  
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [permissions, setPermissions] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchRoles();
    fetchModules();
  }, []);

  useEffect(() => {
    if (selectedRole && modules.length > 0) {
      console.log('useEffect triggered - fetching permissions');
      console.log('selectedRole:', selectedRole);
      console.log('modules:', modules);
      console.log('modules.length:', modules.length);
      fetchPermissions(selectedRole.value);
    } else {
      console.log('useEffect - NOT fetching permissions');
      console.log('selectedRole:', selectedRole);
      console.log('modules:', modules);
      console.log('modules.length:', modules.length);
    }
    // eslint-disable-next-line
  }, [selectedRole, modules]);

  const fetchRoles = async () => {
    try {
      const response = await AuthService.getRoles();
    
      const rolesData = response.data.roles || response.data;
      
      const roleOptions = rolesData.map(role => ({
        value: role.id,
        label: role.name
      }));
      setRoles(roleOptions);
      
     
      if (roleOptions.length > 0) {
        setSelectedRole(roleOptions[0]);
      }
    } catch (error) {
      console.error('Error fetching roles:', error);
      alert('Failed to fetch roles: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchModules = async () => {
    try {
      console.log('Fetching modules...');
      const response = await AuthService.getModules();
      console.log('Modules response:', response);
      
     
      let modulesData = [];
      
      if (response.data && response.data.data) {
      
        modulesData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
       
        modulesData = response.data;
      } else if (Array.isArray(response)) {
        
        modulesData = response;
      }
      
      console.log('Processed modules:', modulesData);
      
    
      if (!Array.isArray(modulesData)) {
        console.error('Modules data is not an array:', modulesData);
        modulesData = [];
      }
      
      setModules(modulesData);
    } catch (error) {
      console.error('Error fetching modules:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to fetch modules: ' + (error.response?.data?.error || error.response?.data?.message || error.message));
    }
  };

  const fetchPermissions = async (roleId) => {
    if (!roleId || modules.length === 0) return;
    
    try {
      setLoading(true);
      console.log('Fetching permissions for roleId:', roleId);
      console.log('Available modules:', modules);
      
      const response = await AuthService.getPermissionsByRole(roleId);
      console.log('Raw response:', response);
      
     
      let permissionsData = [];
      
      if (response.data && response.data.data) {
       
        permissionsData = response.data.data;
      } else if (response.data && Array.isArray(response.data)) {
      
        permissionsData = response.data;
      } else if (Array.isArray(response)) {
  
        permissionsData = response;
      }
      
      console.log('Processed permissions data:', permissionsData);
      
    
      if (!Array.isArray(permissionsData)) {
        console.error('Permissions data is not an array:', permissionsData);
        permissionsData = [];
      }
      
    
      const permMap = {};
      permissionsData.forEach(perm => {
        permMap[perm.module] = {
          module: perm.module,
          can_create: Boolean(perm.can_create),
          can_edit: Boolean(perm.can_edit),
          can_delete: Boolean(perm.can_delete),
          can_view: Boolean(perm.can_view),
          can_review: Boolean(perm.can_review)
        };
      });

      console.log('Permission map:', permMap);

    
      const allPerms = modules.map(module => {
        if (permMap[module]) {
          return permMap[module];
        }
        return {
          module,
          can_create: false,
          can_edit: false,
          can_delete: false,
          can_view: false,
          can_review: false
        };
      });

      console.log('Final permissions:', allPerms);
      setPermissions(allPerms);
    } catch (error) {
      console.error('Error fetching permissions:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to fetch permissions: ' + (error.response?.data?.error || error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePermissionChange = (module, action, value) => {
    setPermissions(prev => 
      prev.map(perm => 
        perm.module === module 
          ? { ...perm, [action]: value }
          : perm
      )
    );
  };

  const handleAllowAll = (module, checked) => {
    setPermissions(prev =>
      prev.map(perm =>
        perm.module === module
          ? {
              ...perm,
              can_create: checked,
              can_edit: checked,
              can_delete: checked,
              can_view: checked,
              can_review: checked
            }
          : perm
      )
    );
  };

  const handleSelectAll = (checked) => {
    setPermissions(prev =>
      prev.map(perm => ({
        ...perm,
        can_create: checked,
        can_edit: checked,
        can_delete: checked,
        can_view: checked,
        can_review: checked
      }))
    );
  };

  const handleSave = async () => {
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }

    try {
      setSaving(true);
      
    
      const formattedPermissions = permissions.map(perm => ({
        module: perm.module,
        can_create: Boolean(perm.can_create),
        can_edit: Boolean(perm.can_edit),
        can_delete: Boolean(perm.can_delete),
        can_view: Boolean(perm.can_view),
        can_review: Boolean(perm.can_review)
      }));

      await AuthService.updatePermissions(selectedRole.value, formattedPermissions);
      alert('Permissions updated successfully!');
      
    
      fetchPermissions(selectedRole.value);
    } catch (error) {
      console.error('Error updating permissions:', error);
      alert('Failed to update permissions: ' + (error.response?.data?.message || error.message));
    } finally {
      setSaving(false);
    }
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible(!isFilterVisible);
  };

 
  const filteredPermissions = searchTerm
    ? permissions.filter(p => p.module.toLowerCase().includes(searchTerm.toLowerCase()))
    : permissions;

  // Tooltip renders
  const renderTooltip = (props) => <Tooltip {...props}>Pdf</Tooltip>;
  const renderExcelTooltip = (props) => <Tooltip {...props}>Excel</Tooltip>;
  const renderPrinterTooltip = (props) => <Tooltip {...props}>Printer</Tooltip>;
  const renderRefreshTooltip = (props) => <Tooltip {...props}>Refresh</Tooltip>;
  const renderCollapseTooltip = (props) => <Tooltip {...props}>Collapse</Tooltip>;

  return (
    <div>
      <div className="page-wrapper">
        <div className="content">
          <div className="page-header">
            <div className="add-item d-flex">
              <div className="page-title">
                <h4>Permission</h4>
                <h6>Manage your permissions</h6>
              </div>
            </div>
            <ul className="table-top-head">
              <li>
                <OverlayTrigger placement="top" overlay={renderTooltip}>
                  <Link>
                    <ImageWithBasePath src="assets/img/icons/pdf.svg" alt="img" />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderExcelTooltip}>
                  <Link>
                    <ImageWithBasePath src="assets/img/icons/excel.svg" alt="img" />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderPrinterTooltip}>
                  <Link>
                    <i data-feather="printer" className="feather-printer" />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderRefreshTooltip}>
                  <Link onClick={() => fetchPermissions(selectedRole?.value)}>
                    <RotateCcw />
                  </Link>
                </OverlayTrigger>
              </li>
              <li>
                <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                  <Link
                    className={data ? "active" : ""}
                    onClick={() => dispatch(setToogleHeader(!data))}
                  >
                    <ChevronUp />
                  </Link>
                </OverlayTrigger>
              </li>
            </ul>
          </div>

          <div className="card table-list-card">
            <div className="card-body">
              <div className="table-top">
                <div className="search-set">
                  <div className="search-input">
                    <input
                      type="text"
                      placeholder="Search Module"
                      className="form-control form-control-sm formsearch"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
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
              </div>

              {/* Filter */}
              <div
                className={`card${isFilterVisible ? ' visible' : ''}`}
                style={{ display: isFilterVisible ? 'block' : 'none' }}
              >
                <div className="card-body pb-0">
                  <div className="row">
                    <div className="col-lg-4 col-sm-6 col-12">
                      <div className="input-blocks">
                        <Zap className="info-img" />
                        <Select
                          className="select"
                          options={roles}
                          value={selectedRole}
                          onChange={setSelectedRole}
                          placeholder="Choose Role"
                        />
                      </div>
                    </div>
                    <div className="col-lg-3 col-sm-6 col-12">
                      <div className="input-blocks">
                        <button
                          className="btn btn-primary"
                          onClick={handleSave}
                          disabled={saving || !selectedRole}
                        >
                          {saving ? 'Saving...' : 'Save Permissions'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Table */}
              <div className="table-responsive">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : (
                  <table className="table datanew">
                    <thead>
                      <tr>
                        <th className="no-sort">
                          <label className="checkboxs">
                            <input
                              type="checkbox"
                              onChange={(e) => handleSelectAll(e.target.checked)}
                            />
                            <span className="checkmarks" />
                          </label>
                        </th>
                        <th>Modules</th>
                        <th>Create</th>
                        <th>Edit</th>
                        <th>Delete</th>
                        <th>View</th>
                        <th>Review</th>
                        <th className="no-sort">Allow all</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPermissions.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="text-center py-4">
                            {searchTerm ? 'No modules found matching your search' : 'Please select a role'}
                          </td>
                        </tr>
                      ) : (
                        filteredPermissions.map((perm, index) => (
                          <tr key={index}>
                            <td>
                              <label className="checkboxs">
                                <input type="checkbox" />
                                <span className="checkmarks" />
                              </label>
                            </td>
                            <td>{perm.module}</td>
                            <td>
                              <label className="checkboxs">
                                <input
                                  type="checkbox"
                                  checked={perm.can_create}
                                  onChange={(e) =>
                                    handlePermissionChange(perm.module, 'can_create', e.target.checked)
                                  }
                                />
                                <span className="checkmarks" />
                              </label>
                            </td>
                            <td>
                              <label className="checkboxs">
                                <input
                                  type="checkbox"
                                  checked={perm.can_edit}
                                  onChange={(e) =>
                                    handlePermissionChange(perm.module, 'can_edit', e.target.checked)
                                  }
                                />
                                <span className="checkmarks" />
                              </label>
                            </td>
                            <td>
                              <label className="checkboxs">
                                <input
                                  type="checkbox"
                                  checked={perm.can_delete}
                                  onChange={(e) =>
                                    handlePermissionChange(perm.module, 'can_delete', e.target.checked)
                                  }
                                />
                                <span className="checkmarks" />
                              </label>
                            </td>
                            <td>
                              <label className="checkboxs">
                                <input
                                  type="checkbox"
                                  checked={perm.can_view}
                                  onChange={(e) =>
                                    handlePermissionChange(perm.module, 'can_view', e.target.checked)
                                  }
                                />
                                <span className="checkmarks" />
                              </label>
                            </td>
                            <td>
                              <label className="checkboxs">
                                <input
                                  type="checkbox"
                                  checked={perm.can_review}
                                  onChange={(e) =>
                                    handlePermissionChange(perm.module, 'can_review', e.target.checked)
                                  }
                                />
                                <span className="checkmarks" />
                              </label>
                            </td>
                            <td>
                              <label className="checkboxs">
                                <input
                                  type="checkbox"
                                  checked={
                                    perm.can_create &&
                                    perm.can_edit &&
                                    perm.can_delete &&
                                    perm.can_view &&
                                    perm.can_review
                                  }
                                  onChange={(e) =>
                                    handleAllowAll(perm.module, e.target.checked)
                                  }
                                />
                                <span className="checkmarks" />
                              </label>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Permissions;