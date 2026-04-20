// import React from 'react'
// import { Link } from 'react-router-dom'

// const AddRole = () => {
//     return (
//         <div>
//             {/* Add Role */}
//             <div className="modal fade" id="add-units">
//                 <div className="modal-dialog modal-dialog-centered custom-modal-two">
//                     <div className="modal-content">
//                         <div className="page-wrapper-new p-0">
//                             <div className="content">
//                                 <div className="modal-header border-0 custom-modal-header">
//                                     <div className="page-title">
//                                         <h4>Create Role</h4>
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
//                                             <input type="text" className="form-control" />
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
//                                                 Create Role
//                                             </Link>
//                                         </div>
//                                     </form>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//             {/* /Add Role */}
//         </div>
//     )
// }

// export default AddRole







import React, { useState } from "react";
import AuthService from "../../../services/authService";
import PropTypes from 'prop-types';

const AddRole = ({ onSuccess }) => {
  const [roleName, setRoleName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleCreateRole = async (e) => {
    e.preventDefault();

    if (!roleName.trim()) {
      alert("Role name is required");
      return;
    }

    setLoading(true);

    try {
      const response = await AuthService.createRole({ name: roleName });

      console.log("Role created:", response.data);

      // Close modal
      document.getElementById("add-role-close-btn")?.click();

      // Refresh roles list
      if (onSuccess) onSuccess();

      // Reset form
      setRoleName("");

    } catch (error) {
      console.error("Create role error:", error);
      alert(error.response?.data?.message || "Failed to create role");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="modal fade" id="add-units">
        <div className="modal-dialog modal-dialog-centered custom-modal-two">
          <div className="modal-content">
            <div className="page-wrapper-new p-0">
              <div className="content">
                <div className="modal-header border-0 custom-modal-header">
                  <div className="page-title">
                    <h4>Create Role</h4>
                  </div>
                  <button
                    type="button"
                    id="add-role-close-btn"
                    className="close"
                    data-bs-dismiss="modal"
                  >
                    <span aria-hidden="true">×</span>
                  </button>
                </div>

                <div className="modal-body custom-modal-body">
                  <form onSubmit={handleCreateRole}>
                    <div className="mb-0">
                      <label className="form-label">Role Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
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
                        {loading ? "Creating..." : "Create Role"}
                      </button>
                    </div>
                  </form>
                </div>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

AddRole.propTypes= {
    onSuccess : PropTypes.func,
}

export default AddRole;
