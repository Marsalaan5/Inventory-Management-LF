// import React from 'react'
// import { Link } from 'react-router-dom'

// const EditRole = () => {
//     return (
//         <div>
//             {/* Edit Role */}
//             <div className="modal fade" id="edit-units">
//                 <div className="modal-dialog modal-dialog-centered custom-modal-two">
//                     <div className="modal-content">
//                         <div className="page-wrapper-new p-0">
//                             <div className="content">
//                                 <div className="modal-header border-0 custom-modal-header">
//                                     <div className="page-title">
//                                         <h4>Edit Role</h4>
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
//                                         <div className="mb-0">
//                                             <label className="form-label">Role Name</label>
//                                             <input
//                                                 type="text"
//                                                 className="form-control"
//                                                 defaultValue="sales Man"
//                                             />
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
//                                                 Save Changes
//                                             </Link>
//                                         </div>
//                                     </form>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             {/* /Edit Role */}
//         </div>
//     )
// }

// export default EditRole



import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Swal from 'sweetalert2';
import AuthService from '../../../services/authService';

const EditRole = ({ role, onSuccess }) => {
    const [roleName, setRoleName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (role) {
            setRoleName(role.name || '');
        }
    }, [role]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!roleName.trim()) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Role name is required'
            });
            return;
        }

        if (!role || !role.id) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'No role selected for editing'
            });
            return;
        }

        setLoading(true);

        try {
            await AuthService.updateRoleById(role.id, { name: roleName });
            
            Swal.fire({
                icon: 'success',
                title: 'Success!',
                text: 'Role updated successfully'
            });

            document.getElementById('edit-role-close-btn')?.click();
            
            if (onSuccess) onSuccess();
            
            setRoleName('');
        } catch (error) {
            console.error('Update role error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.response?.data?.message || 'Failed to update role'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal fade" id="edit-units">
            <div className="modal-dialog modal-dialog-centered custom-modal-two">
                <div className="modal-content">
                    <div className="page-wrapper-new p-0">
                        <div className="content">
                            <div className="modal-header border-0 custom-modal-header">
                                <div className="page-title">
                                    <h4>Edit Role</h4>
                                </div>
                                <button
                                    type="button"
                                    id="edit-role-close-btn"
                                    className="close"
                                    data-bs-dismiss="modal"
                                    aria-label="Close"
                                >
                                    <span aria-hidden="true">×</span>
                                </button>
                            </div>
                            <div className="modal-body custom-modal-body">
                                <form onSubmit={handleSubmit}>
                                    <div className="mb-0">
                                        <label className="form-label">Role Name</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={roleName}
                                            onChange={(e) => setRoleName(e.target.value)}
                                            placeholder="Enter role name"
                                        />
                                    </div>
                                    <div className="modal-footer-btn mt-3">
                                        <button
                                            type="button"
                                            className="btn btn-cancel me-2"
                                            data-bs-dismiss="modal"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            className="btn btn-submit"
                                            disabled={loading}
                                        >
                                            {loading ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

EditRole.propTypes = {
    role: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string
    }),
    onSuccess: PropTypes.func
};

export default EditRole;