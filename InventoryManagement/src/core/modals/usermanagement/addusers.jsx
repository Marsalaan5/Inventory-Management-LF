// import { PlusCircle } from 'feather-icons-react/build/IconComponents'
// import React, { useState } from 'react'
// import { Link } from 'react-router-dom'
// import Select from 'react-select'

// const AddUsers = () => {
//     const status = [
//         { value: 'Choose', label: 'Choose' },
//         { value: 'Manager', label: 'Manager' },
//         { value: 'Admin', label: 'Admin' },
//     ];
//     const [showPassword, setShowPassword] = useState(false);

//     const handleTogglePassword = () => {
//       setShowPassword((prevShowPassword) => !prevShowPassword);
//     };
//     const [showConfirmPassword, setConfirmPassword] = useState(false);
//     const handleToggleConfirmPassword = () => {
//         setConfirmPassword((prevShowPassword) => !prevShowPassword);
//     };

//     return (
//         <div>
//             {/* Add User */}
//             <div className="modal fade" id="add-units">
//                 <div className="modal-dialog modal-dialog-centered custom-modal-two">
//                     <div className="modal-content">
//                         <div className="page-wrapper-new p-0">
//                             <div className="content">
//                                 <div className="modal-header border-0 custom-modal-header">
//                                     <div className="page-title">
//                                         <h4>Add User</h4>
//                                     </div>
//                                     <button
//                                         type="button"
//                                         className="close"
//                                         data-bs-dismiss="modal"
//                                         aria-label="Close"
//                                     >
//                                         <span aria-hidden="true">×</span>
//                                     </button>
//                                 </div>
//                                 <div className="modal-body custom-modal-body">
//                                     <form>
//                                         <div className="row">
//                                             <div className="col-lg-12">
//                                                 <div className="new-employee-field">
//                                                     <span>Avatar</span>
//                                                     <div className="profile-pic-upload mb-2">
//                                                         <div className="profile-pic">
//                                                             <span>
//                                                                 <PlusCircle className="plus-down-add" />
//                                                                 Profile Photo
//                                                             </span>
//                                                         </div>
//                                                         <div className="input-blocks mb-0">
//                                                             <div className="image-upload mb-0">
//                                                                 <input type="file" />
//                                                                 <div className="image-uploads">
//                                                                     <h4>Change Image</h4>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="col-lg-6">
//                                                 <div className="input-blocks">
//                                                     <label>User Name</label>
//                                                     <input type="text" className="form-control" />
//                                                 </div>
//                                             </div>
//                                             <div className="col-lg-6">
//                                                 <div className="input-blocks">
//                                                     <label>Phone</label>
//                                                     <input type="text" className="form-control" />
//                                                 </div>
//                                             </div>
//                                             <div className="col-lg-6">
//                                                 <div className="input-blocks">
//                                                     <label>Email</label>
//                                                     <input type="email" className="form-control" />
//                                                 </div>
//                                             </div>
//                                             <div className="col-lg-6">
//                                                 <div className="input-blocks">
//                                                     <label>Role</label>

//                                                     <Select
//                                                         className="select"
//                                                         options={status}
//                                                         placeholder="Choose Status"
//                                                     />
//                                                 </div>
//                                             </div>
//                                             <div className="col-lg-6">
//                                                 <div className="input-blocks">
//                                                     <label>Password</label>
//                                                     <div className="pass-group">
//                                                         <input
//                                                             type={showPassword ? 'text' : 'password'}
//                                                             className="pass-input"
//                                                             placeholder="Enter your password"
//                                                         />
//                                                         <span
//                                                             className={`fas toggle-password ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}
//                                                             onClick={handleTogglePassword}
//                                                         />
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="col-lg-6">
//                                                 <div className="input-blocks">
//                                                     <label>Confirm Passworrd</label>
//                                                     <div className="pass-group">
//                                                         <input
//                                                             type={showConfirmPassword ? 'text' : 'password'}
//                                                             className="pass-input"
//                                                             placeholder="Enter your password"
//                                                         />
//                                                         <span
//                                                             className={`fas toggle-password ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'}`}
//                                                             onClick={handleToggleConfirmPassword}
//                                                         />
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                             <div className="col-lg-12">
//                                                 <div className="mb-0 input-blocks">
//                                                     <label className="form-label">Descriptions</label>
//                                                     <textarea
//                                                         className="form-control mb-1"
//                                                         defaultValue={"Type Message"}
//                                                     />
//                                                     <p>Maximum 600 Characters</p>
//                                                 </div>
//                                             </div>
//                                         </div>
//                                         <div className="modal-footer-btn">
//                                             <button
//                                                 type="button"
//                                                 className="btn btn-cancel me-2"
//                                                 data-bs-dismiss="modal"
//                                             >
//                                                 Cancel
//                                             </button>
//                                             <Link to="#" className="btn btn-submit">
//                                                 Submit
//                                             </Link>
//                                         </div>
//                                     </form>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             {/* /Add User */}
//         </div>
//     )
// }

// export default AddUsers






// import PropTypes from 'prop-types';
// import { PlusCircle } from 'feather-icons-react/build/IconComponents';
// import React, { useState, useEffect } from 'react';
// import Select from 'react-select';
// import AuthService from '../../../services/authService';
// import Swal from 'sweetalert2';
// import { getFilteredRoles } from '../../../utils/roleHierarchy';

// const AddUsers = ({ onSuccess, roles, currentUserRole }) => {
//     const [formData, setFormData] = useState({
//         name: '',
//         username: '',
//         email: '',
//         phone: '',
//         password: '',
//         confirmPassword: '',
//         role_id: '',
//         warehouse_id:'',
//         description: ''
//     });

//     const [showPassword, setShowPassword] = useState(false);
//     const [showConfirmPassword, setConfirmPassword] = useState(false);
//     const [avatarFile, setAvatarFile] = useState(null);
//     const [avatarPreview, setAvatarPreview] = useState(null);
//     const [loading, setLoading] = useState(false);
//     const [errors, setErrors] = useState({});

//     //  Use utility function to filter roles
//     const filteredRoles = getFilteredRoles(roles, currentUserRole);

//     const roleOptions = [
//         { value: '', label: 'Choose Role' },
//         ...filteredRoles.map(role => ({
//             value: role.id,
//             label: role.name
//         }))
//     ];


 
//     const handleInputChange = (e) => {
//         const { name, value } = e.target;
//         setFormData(prev => ({ ...prev, [name]: value }));
//         if (errors[name]) {
//             setErrors(prev => ({ ...prev, [name]: '' }));
//         }
//     };

//     const handleRoleChange = (selectedOption) => {
//         setFormData(prev => ({ ...prev, role_id: selectedOption.value }));
//         if (errors.role_id) {
//             setErrors(prev => ({ ...prev, role_id: '' }));
//         }
//     };

//     const handleWarehouseChange = (selectedOption) => {
//         setFormData(prev => ({ ...prev, warehouse_id: selectedOption.value }));
//         if (errors.warehouse_id) {
//             setErrors(prev => ({ ...prev, warehouse_id: '' }));
//         }
//     };

//     const handleAvatarChange = (e) => {
//         const file = e.target.files[0];
//         if (file) {
//             const allowedTypes = [
//             'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
//             if (!allowedTypes.includes(file.type)) {
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'Invalid File',
//                     text: 'Please select a valid image file'
//                 });
//                 return;
//             }

//             if (file.size > 5 * 1024 * 1024) {
//                 Swal.fire({
//                     icon: 'error',
//                     title: 'File Too Large',
//                     text: 'Image size must be less than 5MB'
//                 });
//                 return;
//             }

//             setAvatarFile(file);
//             const reader = new FileReader();
//             reader.onloadend = () => setAvatarPreview(reader.result);
//             reader.readAsDataURL(file);
//         }
//     };

//     const handleSubmit = async (e) => {
//         e.preventDefault();
//         setLoading(true);

//         try {
//             const submitData = new FormData();
//             submitData.append('name', formData.name);
//             submitData.append('email', formData.email);
//             submitData.append('password', formData.password);
//             submitData.append('phone', formData.phone);
//             submitData.append('username', formData.username || formData.email);
//             submitData.append('role_id', formData.role_id);

//             if (avatarFile) {
//                 submitData.append('avatar', avatarFile);
//             }

//             const response = await AuthService.createUser(submitData);

//             Swal.fire({
//                 icon: 'success',
//                 title: 'Success!',
//                 text: response.data.message || 'User created successfully',
//                 confirmButtonColor: '#00ff00',
//             });

//             resetForm();

//             const modal = document.getElementById('add-units');
//             const modalBackdrop = document.querySelector('.modal-backdrop');
//             if (modal) {
//                 modal.classList.remove('show');
//                 modal.style.display = 'none';
//                 document.body.classList.remove('modal-open');
//                 if (modalBackdrop) modalBackdrop.remove();
//             }

//             if (onSuccess) onSuccess();
//         } catch (error) {
//             console.error('Error creating user:', error);
//             Swal.fire({
//                 icon: 'error',
//                 title: 'Error',
//                 text: error.response?.data?.message || 'Failed to create user',
//             });
//         } finally {
//             setLoading(false);
//         }
//     };

//     const resetForm = () => {
//         setFormData({
//             name: '', username: '', email: '', phone: '',
//             password: '', confirmPassword: '', role_id: '', description: ''
//         });
//         setAvatarFile(null);
//         setAvatarPreview(null);
//         setErrors({});
//         setShowPassword(false);
//         setConfirmPassword(false);
//     };

//     useEffect(() => {
//         if (roles && roles.length > 0 && filteredRoles.length === 0) {
//             console.warn('No assignable roles for current user:', currentUserRole);
//         }
//     }, [roles, currentUserRole, filteredRoles.length]);

//     return (
//         <div className="modal fade" id="add-units">
//             <div className="modal-dialog modal-dialog-centered custom-modal-two">
//                 <div className="modal-content">
//                     <div className="page-wrapper-new p-0">
//                         <div className="content">
//                             <div className="modal-header border-0 custom-modal-header">
//                                 <div className="page-title">
//                                     <h4>Add User</h4>
//                                 </div>
//                                 <button
//                                     type="button"
//                                     className="close"
//                                     data-bs-dismiss="modal"
//                                     onClick={resetForm}
//                                 >
//                                     <span>×</span>
//                                 </button>
//                             </div>
//                             <div className="modal-body custom-modal-body">
//                                 {filteredRoles.length === 0 ? (
//                                     <div className="alert alert-warning">
//                                         <strong>No Roles Available</strong>
//                                         <p>You don&apost have permission to assign any roles.</p>
//                                     </div>
//                                 ) : (
//                                     <form onSubmit={handleSubmit}>
//                                         {/* Avatar Upload */}
//                                         <div className="row">
//                                             <div className="col-lg-12">
//                                                 <div className="new-employee-field">
//                                                     <span>Avatar</span>
//                                                     <div className="profile-pic-upload mb-2">
//                                                         <div className="profile-pic">
//                                                             {avatarPreview ? (
//                                                                 <img src={avatarPreview} alt="Avatar" 
//                                                                      style={{width: '100%', height: '100%', 
//                                                                              objectFit: 'cover', borderRadius: '50%'}} />
//                                                             ) : (
//                                                                 <span>
//                                                                     <PlusCircle className="plus-down-add" />
//                                                                     Profile Photo
//                                                                 </span>
//                                                             )}
//                                                         </div>
//                                                         <div className="input-blocks mb-0">
//                                                             <div className="image-upload mb-0">
//                                                                 <input type="file" accept="image/*" 
//                                                                        onChange={handleAvatarChange} />
//                                                                 <div className="image-uploads">
//                                                                     <h4>{avatarPreview ? 'Change Image' : 'Upload Image'}</h4>
//                                                                 </div>
//                                                             </div>
//                                                         </div>
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             {/* Form Fields */}
//                                             <div className="col-lg-6">
//                                                 <div className="input-blocks">
//                                                     <label>Name <span className="text-danger">*</span></label>
//                                                     <input type="text" className="form-control" name="name"
//                                                            value={formData.name} onChange={handleInputChange}
//                                                            placeholder="Enter name" />
//                                                 </div>
//                                             </div>

//                                             <div className="col-lg-6">
//                                                 <div className="input-blocks">
//                                                     <label>Username</label>
//                                                     <input type="text" className="form-control" name="username"
//                                                            value={formData.username} onChange={handleInputChange}
//                                                            placeholder="Enter username" />
//                                                 </div>
//                                             </div>

//                                             <div className="col-lg-6">
//                                                 <div className="input-blocks">
//                                                     <label>Email <span className="text-danger">*</span></label>
//                                                     <input type="email" className="form-control" name="email"
//                                                            value={formData.email} onChange={handleInputChange}
//                                                            placeholder="Enter email" />
//                                                 </div>
//                                             </div>

//                                             <div className="col-lg-6">
//                                                 <div className="input-blocks">
//                                                     <label>Phone</label>
//                                                     <input type="text" className="form-control" name="phone"
//                                                            value={formData.phone} onChange={handleInputChange}
//                                                            placeholder="Enter phone" />
//                                                 </div>
//                                             </div>

//                                             <div className="col-lg-6">
//                                                 <div className="input-blocks">
//                                                     <label>Role <span className="text-danger">*</span></label>
//                                                     <Select className="select" options={roleOptions}
//                                                             placeholder="Choose Role"
//                                                             value={roleOptions.find(opt => opt.value === formData.role_id)}
//                                                             onChange={handleRoleChange} />
//                                                     <small className="text-muted">
//                                                         You can only assign roles lower than {currentUserRole}
//                                                     </small>
//                                                 </div>
//                                             </div>

//                                             <div className="col-lg-6">
//                                                 <div className="input-blocks">
//                                                     <label>Warehouse <span className="text-danger">*</span></label>
//                                                     <Select className="select" options={warehouseOptions}
//                                                             placeholder="Choose Warehouse"
//                                                             value={warehouseOptions.find(opt => opt.value === formData.warehouse_id)}
//                                                             onChange={handleWarehouseChange} />
                                                    
//                                                 </div>
//                                             </div>

//                                             <div className="col-lg-6">
//                                                 <div className="input-blocks">
//                                                     <label>Password <span className="text-danger">*</span></label>
//                                                     <div className="pass-group">
//                                                         <input type={showPassword ? 'text' : 'password'}
//                                                                className="pass-input" name="password"
//                                                                value={formData.password} onChange={handleInputChange} />
//                                                         <span className={`fas toggle-password ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}
//                                                               onClick={() => setShowPassword(!showPassword)} />
//                                                     </div>
//                                                 </div>
//                                             </div>

//                                             <div className="col-lg-6">
//                                                 <div className="input-blocks">
//                                                     <label>Confirm Password <span className="text-danger">*</span></label>
//                                                     <div className="pass-group">
//                                                         <input type={showConfirmPassword ? 'text' : 'password'}
//                                                                className="pass-input" name="confirmPassword"
//                                                                value={formData.confirmPassword} onChange={handleInputChange} />
//                                                         <span className={`fas toggle-password ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'}`}
//                                                               onClick={() => setConfirmPassword(!showConfirmPassword)} />
//                                                     </div>
//                                                 </div>
//                                             </div>
//                                         </div>

//                                         <div className="modal-footer-btn">
//                                             <button type="button" className="btn btn-cancel me-2"
//                                                     data-bs-dismiss="modal" onClick={resetForm} disabled={loading}>
//                                                 Cancel
//                                             </button>
//                                             <button type="submit" className="btn btn-submit" disabled={loading}>
//                                                 {loading ? <><span className="spinner-border spinner-border-sm me-2"></span>Creating...</> : 'Create User'}
//                                             </button>
//                                         </div>
//                                     </form>
//                                 )}
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// AddUsers.propTypes = {
//     onSuccess: PropTypes.func,
//     roles: PropTypes.array.isRequired,
//     currentUserRole: PropTypes.string
// };

// export default AddUsers;


import PropTypes from 'prop-types';
import { PlusCircle } from 'feather-icons-react/build/IconComponents';
import React, { useState, useEffect } from 'react';
import Select from 'react-select';
import AuthService from '../../../services/authService';
import Swal from 'sweetalert2';
import { getFilteredRoles } from '../../../utils/roleHierarchy';

const AddUsers = ({ onSuccess, roles, currentUserRole }) => {
    const [formData, setFormData] = useState({
        name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role_id: '',
        warehouse_id: '',
        description: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setConfirmPassword] = useState(false);
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [warehouses, setWarehouses] = useState([]);
    const [warehousesLoading, setWarehousesLoading] = useState(true);


    const filteredRoles = getFilteredRoles(roles, currentUserRole);

    const roleOptions = [
        { value: '', label: 'Choose Role' },
        ...filteredRoles.map(role => ({
            value: role.id,
            label: role.name
        }))
    ];

    const warehouseOptions = [
        { value: '', label: 'Choose Warehouse' },
        ...warehouses.map(wh => ({
            value: wh.wh_uuid,
            label: wh.name || wh.title
        }))
    ];

    // Fetch warehouses on component mount
    useEffect(() => {
        fetchWarehouses();
    }, []);

    const fetchWarehouses = async () => {
        setWarehousesLoading(true);
        try {
           
            const response = await AuthService.getWarehouse();
            console.log('Warehouse Response:', response);
            
           
            const warehouseData = response.data?.data || [];
            
            setWarehouses(warehouseData);
            console.log('Warehouses loaded:', warehouseData.length);
        } catch (error) {
            console.error('Error fetching warehouses:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to load warehouses',
            });
            setWarehouses([]);
        } finally {
            setWarehousesLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleRoleChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, role_id: selectedOption?.value || '' }));
        if (errors.role_id) {
            setErrors(prev => ({ ...prev, role_id: '' }));
        }
    };

    const handleWarehouseChange = (selectedOption) => {
        setFormData(prev => ({ ...prev, warehouse_id: selectedOption?.value || '' }));
        if (errors.warehouse_id) {
            setErrors(prev => ({ ...prev, warehouse_id: '' }));
        }
    };

    const handleAvatarChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const allowedTypes = [
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
            if (!allowedTypes.includes(file.type)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Invalid File',
                    text: 'Please select a valid image file'
                });
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                Swal.fire({
                    icon: 'error',
                    title: 'File Too Large',
                    text: 'Image size must be less than 5MB'
                });
                return;
            }

            setAvatarFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setAvatarPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.role_id) {
            newErrors.role_id = 'Role is required';
        }

        if (!formData.warehouse_id) {
            newErrors.warehouse_id = 'Warehouse is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: 'Please fill in all required fields',
            });
            return;
        }

        setLoading(true);

        try {
            const submitData = new FormData();
            submitData.append('name', formData.name);
            submitData.append('email', formData.email);
            submitData.append('password', formData.password);
            submitData.append('phone', formData.phone);
            submitData.append('username', formData.username || formData.email);
            submitData.append('role_id', formData.role_id);
            submitData.append('warehouse_id', formData.warehouse_id);

            if (avatarFile) {
                submitData.append('avatar', avatarFile);
            }

            console.log('Submitting user data with warehouse_id:', formData.warehouse_id);

            const response = await AuthService.createUser(submitData);

            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: response.data.message || 'User created successfully',
                confirmButtonColor: '#00ff00',
            });

            resetForm();

            const modal = document.getElementById('add-units');
            const modalBackdrop = document.querySelector('.modal-backdrop');
            if (modal) {
                modal.classList.remove('show');
                modal.style.display = 'none';
                document.body.classList.remove('modal-open');
                if (modalBackdrop) modalBackdrop.remove();
            }

            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Error creating user:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to create user',
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFormData({
            name: '', username: '', email: '', phone: '',
            password: '', confirmPassword: '', role_id: '', warehouse_id: '', description: ''
        });
        setAvatarFile(null);
        setAvatarPreview(null);
        setErrors({});
        setShowPassword(false);
        setConfirmPassword(false);
    };

    useEffect(() => {
        if (roles && roles.length > 0 && filteredRoles.length === 0) {
            console.warn('No assignable roles for current user:', currentUserRole);
        }
    }, [roles, currentUserRole, filteredRoles.length]);

    return (
        <div className="modal fade" id="add-units">
            <div className="modal-dialog modal-dialog-centered custom-modal-two">
                <div className="modal-content">
                    <div className="page-wrapper-new p-0">
                        <div className="content">
                            <div className="modal-header border-0 custom-modal-header">
                                <div className="page-title">
                                    <h4>Add User</h4>
                                </div>
                                <button
                                    type="button"
                                    className="close"
                                    data-bs-dismiss="modal"
                                    onClick={resetForm}
                                >
                                    <span>×</span>
                                </button>
                            </div>
                            <div className="modal-body custom-modal-body">
                                {filteredRoles.length === 0 ? (
                                    <div className="alert alert-warning">
                                        <strong>No Roles Available</strong>
                                        <p>You don`&apos`t have permission to assign any roles.</p>
                                    </div>
                                ) : (
                                    <form onSubmit={handleSubmit}>
                                        {/* Avatar Upload */}
                                        <div className="row">
                                            <div className="col-lg-12">
                                                <div className="new-employee-field">
                                                    <span>Avatar</span>
                                                    <div className="profile-pic-upload mb-2">
                                                        <div className="profile-pic">
                                                            {avatarPreview ? (
                                                                <img src={avatarPreview} alt="Avatar" 
                                                                     style={{width: '100%', height: '100%', 
                                                                             objectFit: 'cover', borderRadius: '50%'}} />
                                                            ) : (
                                                                <span>
                                                                    <PlusCircle className="plus-down-add" />
                                                                    Profile Photo
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="input-blocks mb-0">
                                                            <div className="image-upload mb-0">
                                                                <input type="file" accept="image/*" 
                                                                       onChange={handleAvatarChange} />
                                                                <div className="image-uploads">
                                                                    <h4>{avatarPreview ? 'Change Image' : 'Upload Image'}</h4>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Form Fields */}
                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Name <span className="text-danger">*</span></label>
                                                    <input 
                                                        type="text" 
                                                        className={`form-control ${errors.name ? 'is-invalid' : ''}`}
                                                        name="name"
                                                        value={formData.name} 
                                                        onChange={handleInputChange}
                                                        placeholder="Enter name" 
                                                    />
                                                    {errors.name && <div className="invalid-feedback">{errors.name}</div>}
                                                </div>
                                            </div>

                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Username</label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        name="username"
                                                        value={formData.username} 
                                                        onChange={handleInputChange}
                                                        placeholder="Enter username" 
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Email <span className="text-danger">*</span></label>
                                                    <input 
                                                        type="email" 
                                                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                                        name="email"
                                                        value={formData.email} 
                                                        onChange={handleInputChange}
                                                        placeholder="Enter email" 
                                                    />
                                                    {errors.email && <div className="invalid-feedback">{errors.email}</div>}
                                                </div>
                                            </div>

                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Phone</label>
                                                    <input 
                                                        type="text" 
                                                        className="form-control" 
                                                        name="phone"
                                                        value={formData.phone} 
                                                        onChange={handleInputChange}
                                                        placeholder="Enter phone" 
                                                    />
                                                </div>
                                            </div>

                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Role <span className="text-danger">*</span></label>
                                                    <Select 
                                                        className="select" 
                                                        options={roleOptions}
                                                        placeholder="Choose Role"
                                                        value={roleOptions.find(opt => opt.value === formData.role_id)}
                                                        onChange={handleRoleChange} 
                                                    />
                                                    {errors.role_id && <small className="text-danger">{errors.role_id}</small>}
                                                    <small className="text-muted d-block mt-1">
                                                        You can only assign roles lower than {currentUserRole}
                                                    </small>
                                                </div>
                                            </div>

                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Warehouse <span className="text-danger">*</span></label>
                                                    <Select 
                                                        className="select" 
                                                        options={warehouseOptions}
                                                        placeholder={warehousesLoading ? "Loading..." : "Choose Warehouse"}
                                                        value={warehouseOptions.find(opt => opt.value === formData.warehouse_id)}
                                                        onChange={handleWarehouseChange}
                                                        isLoading={warehousesLoading}
                                                        isDisabled={warehousesLoading}
                                                    />
                                                    {errors.warehouse_id && <small className="text-danger">{errors.warehouse_id}</small>}
                                                </div>
                                            </div>

                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Password <span className="text-danger">*</span></label>
                                                    <div className="pass-group">
                                                        <input 
                                                            type={showPassword ? 'text' : 'password'}
                                                            className={`pass-input ${errors.password ? 'is-invalid' : ''}`}
                                                            name="password"
                                                            value={formData.password} 
                                                            onChange={handleInputChange} 
                                                        />
                                                        <span 
                                                            className={`fas toggle-password ${showPassword ? 'fa-eye' : 'fa-eye-slash'}`}
                                                            onClick={() => setShowPassword(!showPassword)} 
                                                        />
                                                    </div>
                                                    {errors.password && <small className="text-danger">{errors.password}</small>}
                                                </div>
                                            </div>

                                            <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Confirm Password <span className="text-danger">*</span></label>
                                                    <div className="pass-group">
                                                        <input 
                                                            type={showConfirmPassword ? 'text' : 'password'}
                                                            className={`pass-input ${errors.confirmPassword ? 'is-invalid' : ''}`}
                                                            name="confirmPassword"
                                                            value={formData.confirmPassword} 
                                                            onChange={handleInputChange} 
                                                        />
                                                        <span 
                                                            className={`fas toggle-password ${showConfirmPassword ? 'fa-eye' : 'fa-eye-slash'}`}
                                                            onClick={() => setConfirmPassword(!showConfirmPassword)} 
                                                        />
                                                    </div>
                                                    {errors.confirmPassword && <small className="text-danger">{errors.confirmPassword}</small>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="modal-footer-btn">
                                            <button 
                                                type="button" 
                                                className="btn btn-cancel me-2"
                                                data-bs-dismiss="modal" 
                                                onClick={resetForm} 
                                                disabled={loading}
                                            >
                                                Cancel
                                            </button>
                                            <button 
                                                type="submit" 
                                                className="btn btn-submit" 
                                                disabled={loading || warehousesLoading}
                                            >
                                                {loading ? (
                                                    <>
                                                        <span className="spinner-border spinner-border-sm me-2"></span>
                                                        Creating...
                                                    </>
                                                ) : (
                                                    'Create User'
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

AddUsers.propTypes = {
    onSuccess: PropTypes.func,
    roles: PropTypes.array.isRequired,
    currentUserRole: PropTypes.string
};

export default AddUsers;




// import PropTypes from "prop-types";
// import { PlusCircle } from "feather-icons-react/build/IconComponents";
// import React, { useState, useRef } from "react";
// import Select from "react-select";
// import Swal from "sweetalert2";
// import AuthService from "../../../services/authService";
// import { roleHierarchy } from "../../../utils/roleHierarchy";

// const AddUsers = ({ onSuccess, roles, currentUserRole }) => {
//   const modalRef = useRef(null);

//   // Form state
//   const [formData, setFormData] = useState({
//     name: "",
//     username: "",
//     email: "",
//     phone: "",
//     password: "",
//     confirmPassword: "",
//     role_id: "",
//   });

//   // UI state
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setConfirmPassword] = useState(false);
//   const [avatarFile, setAvatarFile] = useState(null);
//   const [avatarPreview, setAvatarPreview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   // Get current user's role hierarchy level
//   const currentUserLevel = roleHierarchy[currentUserRole] || 0;

//   // Filter roles: only show roles with LOWER hierarchy level than current user
//   const filteredRoles = (roles || []).filter((role) => {
//     const roleLevel = roleHierarchy[role.name] || 0;
//     return roleLevel < currentUserLevel;
//   });

//   console.log("Current User Role:", currentUserRole);
//   console.log("Current User Level:", currentUserLevel);
//   console.log("All Roles:", roles);
//   console.log("Filtered Roles:", filteredRoles);

//   // Role options for dropdown
//   const roleOptions = [
//     { value: "", label: "Choose Role" },
//     ...filteredRoles.map((role) => ({
//       value: role.id,
//       label: role.name,
//     })),
//   ];

//   // Handle input changes
//   const handleInputChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//     if (errors[name]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }));
//     }
//   };

//   // Handle role selection
//   const handleRoleChange = (selectedOption) => {
//     setFormData((prev) => ({
//       ...prev,
//       role_id: selectedOption ? selectedOption.value : "",
//     }));
//     if (errors.role_id) {
//       setErrors((prev) => ({
//         ...prev,
//         role_id: "",
//       }));
//     }
//   };

//   // Handle avatar file selection
//   const handleAvatarChange = (e) => {
//     const file = e.target.files[0];
//     if (file) {
//       const allowedTypes = [
//         "image/jpeg",
//         "image/jpg",
//         "image/png",
//         "image/gif",
//         "image/webp",
//       ];
//       if (!allowedTypes.includes(file.type)) {
//         Swal.fire({
//           icon: "error",
//           title: "Invalid File",
//           text: "Please select a valid image file (JPEG, PNG, GIF, WEBP)",
//         });
//         e.target.value = "";
//         return;
//       }

//       if (file.size > 5 * 1024 * 1024) {
//         Swal.fire({
//           icon: "error",
//           title: "File Too Large",
//           text: "Image size must be less than 5MB",
//         });
//         e.target.value = "";
//         return;
//       }

//       setAvatarFile(file);

//       const reader = new FileReader();
//       reader.onloadend = () => {
//         setAvatarPreview(reader.result);
//       };
//       reader.readAsDataURL(file);
//     }
//   };

//   // Toggle password visibility
//   const handleTogglePassword = () => {
//     setShowPassword((prev) => !prev);
//   };

//   const handleToggleConfirmPassword = () => {
//     setConfirmPassword((prev) => !prev);
//   };

//   // Close modal programmatically
//   const closeModal = () => {
//     const modal = modalRef.current;
//     if (modal) {
//       const bsModal = window.bootstrap?.Modal?.getInstance(modal);
//       if (bsModal) {
//         bsModal.hide();
//       } else {
//         modal.classList.remove("show");
//         modal.style.display = "none";
//         document.body.classList.remove("modal-open");

//         const backdrop = document.querySelector(".modal-backdrop");
//         if (backdrop) {
//           backdrop.remove();
//         }
//       }
//     }
//   };

//   // Handle form submission
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     setLoading(true);

//     try {
//       const submitData = new FormData();
//       submitData.append("name", formData.name);
//       submitData.append("email", formData.email);
//       submitData.append("password", formData.password);
//       submitData.append("phone", formData.phone);
//       submitData.append("username", formData.username || formData.email);
//       submitData.append("role_id", formData.role_id);

//       if (avatarFile) {
//         submitData.append("avatar", avatarFile);
//       }

//       const response = await AuthService.createUser(submitData);

//       Swal.fire({
//         icon: "success",
//         title: "Success!",
//         text: response.data?.message || "User created successfully",
//         confirmButtonColor: "#00ff00",
//       });

//       resetForm();
//       closeModal();

//       if (onSuccess) {
//         onSuccess();
//       }
//     } catch (error) {
//       console.error("Error creating user:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: error.response?.data?.message || "Failed to create user",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Reset form
//   const resetForm = () => {
//     setFormData({
//       name: "",
//       username: "",
//       email: "",
//       phone: "",
//       password: "",
//       confirmPassword: "",
//       role_id: "",
//     });
//     setAvatarFile(null);
//     setAvatarPreview(null);
//     setErrors({});
//     setShowPassword(false);
//     setConfirmPassword(false);

//     const fileInput = document.querySelector('#add-units input[type="file"]');
//     if (fileInput) fileInput.value = "";
//   };

//   // Handle modal close
//   const handleCancel = () => {
//     resetForm();
//   };

//   return (
//     <div>
//       <div
//         className="modal fade"
//         id="add-units"
//         ref={modalRef}
//         tabIndex="-1"
//         aria-labelledby="addUserLabel"
//         aria-hidden="true"
//       >
//         <div className="modal-dialog modal-dialog-centered custom-modal-two">
//           <div className="modal-content">
//             <div className="page-wrapper-new p-0">
//               <div className="content">
//                 <div className="modal-header border-0 custom-modal-header">
//                   <div className="page-title">
//                     <h4 id="addUserLabel">Add User</h4>
//                   </div>
//                   <button
//                     type="button"
//                     className="close"
//                     data-bs-dismiss="modal"
//                     aria-label="Close"
//                     onClick={handleCancel}
//                   >
//                     <span aria-hidden="true">×</span>
//                   </button>
//                 </div>
//                 <div className="modal-body custom-modal-body">
//                   <form onSubmit={handleSubmit}>
//                     <div className="row">
//                       <div className="col-lg-12">
//                         <div className="new-employee-field">
//                           <span>Avatar</span>
//                           <div className="profile-pic-upload mb-2">
//                             <div className="profile-pic">
//                               {avatarPreview ? (
//                                 <img
//                                   src={avatarPreview}
//                                   alt="Avatar Preview"
//                                   style={{
//                                     width: "100%",
//                                     height: "100%",
//                                     objectFit: "cover",
//                                     borderRadius: "50%",
//                                   }}
//                                 />
//                               ) : (
//                                 <span>
//                                   <PlusCircle className="plus-down-add" />
//                                   Profile Photo
//                                 </span>
//                               )}
//                             </div>
//                             <div className="input-blocks mb-0">
//                               <div className="image-upload mb-0">
//                                 <input
//                                   type="file"
//                                   accept="image/*"
//                                   onChange={handleAvatarChange}
//                                 />
//                                 <div className="image-uploads">
//                                   <h4>
//                                     {avatarPreview
//                                       ? "Change Image"
//                                       : "Upload Image"}
//                                   </h4>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>
//                       </div>

//                       <div className="col-lg-6">
//                         <div className="input-blocks">
//                           <label>
//                             Name <span className="text-danger">*</span>
//                           </label>
//                           <input
//                             type="text"
//                             className={`form-control ${
//                               errors.name ? "is-invalid" : ""
//                             }`}
//                             name="name"
//                             value={formData.name}
//                             onChange={handleInputChange}
//                             placeholder="Enter name"
//                           />
//                           {errors.name && (
//                             <div className="invalid-feedback d-block">
//                               {errors.name}
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       <div className="col-lg-6">
//                         <div className="input-blocks">
//                           <label>Username</label>
//                           <input
//                             type="text"
//                             className="form-control"
//                             name="username"
//                             value={formData.username}
//                             onChange={handleInputChange}
//                             placeholder="Enter username (optional)"
//                           />
//                         </div>
//                       </div>

//                       <div className="col-lg-6">
//                         <div className="input-blocks">
//                           <label>
//                             Email <span className="text-danger">*</span>
//                           </label>
//                           <input
//                             type="email"
//                             className={`form-control ${
//                               errors.email ? "is-invalid" : ""
//                             }`}
//                             name="email"
//                             value={formData.email}
//                             onChange={handleInputChange}
//                             placeholder="Enter email"
//                           />
//                           {errors.email && (
//                             <div className="invalid-feedback d-block">
//                               {errors.email}
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       <div className="col-lg-6">
//                         <div className="input-blocks">
//                           <label>
//                             Phone <span className="text-danger">*</span>
//                           </label>
//                           <input
//                             type="text"
//                             className={`form-control ${
//                               errors.phone ? "is-invalid" : ""
//                             }`}
//                             name="phone"
//                             value={formData.phone}
//                             onChange={handleInputChange}
//                             placeholder="Enter phone number"
//                           />
//                           {errors.phone && (
//                             <div className="invalid-feedback d-block">
//                               {errors.phone}
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       <div className="col-lg-12">
//                         <div className="input-blocks">
//                           <label>
//                             Role <span className="text-danger">*</span>
//                           </label>
//                           <Select
//                             className={`select ${
//                               errors.role_id ? "is-invalid" : ""
//                             }`}
//                             options={roleOptions}
//                             placeholder="Choose Role"
//                             value={roleOptions.find(
//                               (opt) => opt.value === formData.role_id
//                             )}
//                             onChange={handleRoleChange}
//                           />
//                           {errors.role_id && (
//                             <div className="invalid-feedback d-block">
//                               {errors.role_id}
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       <div className="col-lg-6">
//                         <div className="input-blocks">
//                           <label>
//                             Password <span className="text-danger">*</span>
//                           </label>
//                           <div className="pass-group">
//                             <input
//                               type={showPassword ? "text" : "password"}
//                               className={`pass-input ${
//                                 errors.password ? "is-invalid" : ""
//                               }`}
//                               name="password"
//                               value={formData.password}
//                               onChange={handleInputChange}
//                               placeholder="Enter password"
//                             />
//                             <span
//                               className={`fas toggle-password ${
//                                 showPassword ? "fa-eye" : "fa-eye-slash"
//                               }`}
//                               onClick={handleTogglePassword}
//                             />
//                           </div>
//                           {errors.password && (
//                             <div className="invalid-feedback d-block">
//                               {errors.password}
//                             </div>
//                           )}
//                         </div>
//                       </div>

//                       <div className="col-lg-6">
//                         <div className="input-blocks">
//                           <label>
//                             Confirm Password{" "}
//                             <span className="text-danger">*</span>
//                           </label>
//                           <div className="pass-group">
//                             <input
//                               type={showConfirmPassword ? "text" : "password"}
//                               className={`pass-input ${
//                                 errors.confirmPassword ? "is-invalid" : ""
//                               }`}
//                               name="confirmPassword"
//                               value={formData.confirmPassword}
//                               onChange={handleInputChange}
//                               placeholder="Confirm password"
//                             />
//                             <span
//                               className={`fas toggle-password ${
//                                 showConfirmPassword ? "fa-eye" : "fa-eye-slash"
//                               }`}
//                               onClick={handleToggleConfirmPassword}
//                             />
//                           </div>
//                           {errors.confirmPassword && (
//                             <div className="invalid-feedback d-block">
//                               {errors.confirmPassword}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>

//                     <div className="modal-footer-btn">
//                       <button
//                         type="button"
//                         className="btn btn-cancel me-2"
//                         data-bs-dismiss="modal"
//                         onClick={handleCancel}
//                         disabled={loading}
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         type="submit"
//                         className="btn btn-submit"
//                         disabled={loading}
//                       >
//                         {loading ? (
//                           <>
//                             <span
//                               className="spinner-border spinner-border-sm me-2"
//                               role="status"
//                               aria-hidden="true"
//                             ></span>
//                             Creating...
//                           </>
//                         ) : (
//                           "Create User"
//                         )}
//                       </button>
//                     </div>
//                   </form>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// AddUsers.propTypes = {
//   onSuccess: PropTypes.func,
//   roles: PropTypes.arrayOf(
//     PropTypes.shape({
//       id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
//       name: PropTypes.string.isRequired,
//     })
//   ).isRequired,
//   currentUserRole: PropTypes.string.isRequired,
// };

// export default AddUsers;