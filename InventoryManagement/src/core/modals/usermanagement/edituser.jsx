
import PropTypes from "prop-types";
import { PlusCircle } from "feather-icons-react/build/IconComponents";
import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import Swal from "sweetalert2";
import AuthService from "../../../services/authService";
import { getFilteredRoles } from '../../../utils/roleHierarchy';


const EditUser = ({ user, onSuccess, roles, currentUserRole }) => {
  const modalRef = useRef(null);

  
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    role_id: "",
    warehouse_id:"",
    status: "Active",
  });


  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [warehouses,setWarehouses] = useState([]);
  const [warehousesLoading,setWarehousesLoading] = useState([]);


  const filteredRoles = getFilteredRoles(roles, currentUserRole);


  const roleOptions = [
        { value: '', label: 'Choose Role' },
        ...filteredRoles.map(role => ({
            value: role.id,
            label: role.name
        }))
    ];

  const warehouseOptions = [
    { value: '',label: 'Choose Warehouse'},
    ...warehouses.map(wh => ({
      value:wh.wh_uuid,
      label:wh.name || wh.title
    }))
  ]

  useEffect(() => {
    fetchWarehouses();
  },[])


  const fetchWarehouses = async() => {
    setWarehousesLoading(true);
    try {
      const response = await AuthService.getWarehouse();
      console.log('Warehpuse Response:',response)

      const warehouseData = response.data?.data || [];

      setWarehouses(warehouseData);
      console.log('Warehopuse loaded:',warehouseData.length);
    } catch (error) {
      console.error('Error Fetching warehouses:',error)
      Swal.fire({
        icon:'error',
        title:'Error',
        text:'Failed to load warehouses',
      })
      setWarehouses([]);
    }finally{
      setWarehousesLoading(false)
    }
  };



  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Inactive", label: "Inactive" },
  ];


  useEffect(() => {
    if (user) {
      console.log("User selected for editing:", user);
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        role_id: user.role_id || "",
        status: user.status || "Active",
        warehouse_id: user.warehouse_id || ""

      });

    
      if (user.avatar) {
        const baseUrl = "http://13.234.253.16:7000";
        setAvatarPreview(`${baseUrl}/${user.avatar}`);
      } else if (user.img) {
        setAvatarPreview(user.img);
      } else {
        setAvatarPreview(null);
      }

      // Reset file input and errors
      setAvatarFile(null);
      setErrors({});
    }
  }, [user]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  // Handle role selection
  const handleRoleChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      role_id: selectedOption.value }));
    if (errors.role_id) {
      setErrors((prev) => ({
        ...prev,
        role_id: '',
      }));
    }
  };

  const handleWarehouseChange = (selectedOptions) => {
    setFormData(prev => ({...prev,warehouse_id:selectedOptions?.value || ''}));
    if(errors.warehouse_id){
      setErrors(prev=> ({...prev,warehouse_id: ''}));
    }
  }

  // Handle status selection
  const handleStatusChange = (selectedOption) => {
    setFormData((prev) => ({
      ...prev,
      status: selectedOption ? selectedOption.value : "Active",
    }));
  };

  // Handle avatar file selection
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      if (!allowedTypes.includes(file.type)) {
        Swal.fire({
          icon: "error",
          title: "Invalid File",
          text: "Please select a valid image file (JPEG, PNG, GIF, WEBP)",
        });
        e.target.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        Swal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Image size must be less than 5MB",
        });
        e.target.value = "";
        return;
      }

      setAvatarFile(file);

      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Close modal programmatically
  const closeModal = () => {
    const modal = modalRef.current;
    if (modal) {
      const bsModal = window.bootstrap?.Modal?.getInstance(modal);
      if (bsModal) {
        bsModal.hide();
      } else {
        modal.classList.remove("show");
        modal.style.display = "none";
        document.body.classList.remove("modal-open");

        const backdrop = document.querySelector(".modal-backdrop");
        if (backdrop) {
          backdrop.remove();
        }
      }
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user || !user.id) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "No user selected for editing",
      });
      return;
    }

    setLoading(true);

    try {
      const submitData = new FormData();
      submitData.append("name", formData.name);
      submitData.append("email", formData.email);
      submitData.append("phone", formData.phone || "");
      submitData.append("username", formData.username || formData.email);
      submitData.append("role_id", formData.role_id);
      submitData.append('warehouse_id',formData.warehouse_id);
      submitData.append("status", formData.status);

      if (avatarFile) {
        submitData.append("avatar", avatarFile);
      }

      const response = await AuthService.editUserById(user.id, submitData);

      Swal.fire({
        icon: "success",
        title: "Success!",
        text: response.data?.message || "User updated successfully",
        confirmButtonColor: "#00ff00",
      });

      closeModal();

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Failed to update user",
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle modal close/cancel
  const handleCancel = () => {
    setErrors({});
    setAvatarFile(null);
    
    const fileInput = modalRef.current?.querySelector('input[type="file"]');
    if (fileInput) {
      fileInput.value = "";
    }

    if (user) {
      setFormData({
        name: user.name || "",
        username: user.username || "",
        email: user.email || "",
        phone: user.phone || "",
        role_id: user.role_id || "",
        warehouse_id: user.warehouse_id || "",
        status: user.status || "Active",
      });

      if (user.avatar) {
        const baseUrl = "http://13.234.253.16:7000";
        setAvatarPreview(`${baseUrl}/${user.avatar}`);
      } else if (user.img) {
        setAvatarPreview(user.img);
      } else {
        setAvatarPreview(null);
      }
    }
  };


  
      useEffect(() => {
          if (roles && roles.length > 0 && filteredRoles.length === 0) {
              console.warn('No assignable roles for current user:', currentUserRole);
          }
      }, [roles, currentUserRole, filteredRoles.length]);

  return (
    <div
      className="modal fade"
      id="edit-units"
      ref={modalRef}
      tabIndex={-1}
      aria-labelledby="editUserLabel"
      aria-hidden="true"
    >
      <div className="modal-dialog modal-dialog-centered custom-modal-two">
        <div className="modal-content">
          <div className="page-wrapper-new p-0">
            <div className="content">
              <div className="modal-header border-0 custom-modal-header">
                <div className="page-title">
                  <h4 id="editUserLabel">Edit User</h4>
                </div>
                <button
                  type="button"
                  className="close"
                  data-bs-dismiss="modal"
                  aria-label="Close"
                  onClick={handleCancel}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </div>
              <div className="modal-body custom-modal-body">
                {user ? (
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="new-employee-field">
                          <span>Avatar</span>
                          <div className="profile-pic-upload mb-2">
                            <div className="profile-pic">
                              {avatarPreview ? (
                                <img
                                  src={avatarPreview}
                                  alt="Avatar Preview"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    borderRadius: "50%",
                                  }}
                                />
                              ) : (
                                <span>
                                  <PlusCircle className="plus-down-add" />
                                  Profile Photo
                                </span>
                              )}
                            </div>
                            <div className="input-blocks mb-0">
                              <div className="image-upload mb-0">
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleAvatarChange}
                                />
                                <div className="image-uploads">
                                  <h4>Change Image</h4>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>
                            Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className={`form-control ${
                              errors.name ? "is-invalid" : ""
                            }`}
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Enter name"
                          />
                          {errors.name && (
                            <div className="invalid-feedback d-block">
                              {errors.name}
                            </div>
                          )}
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
                          <label>
                            Email <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className={`form-control ${
                              errors.email ? "is-invalid" : ""
                            }`}
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Enter email"
                          />
                          {errors.email && (
                            <div className="invalid-feedback d-block">
                              {errors.email}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Phone</label>
                          <input
                            type="text"
                            className={`form-control ${
                              errors.phone ? "is-invalid" : ""
                            }`}
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Enter phone number"
                          />
                          {errors.phone && (
                            <div className="invalid-feedback d-block">
                              {errors.phone}
                            </div>
                          )}
                        </div>
                      </div>

                       <div className="col-lg-6">
                                                <div className="input-blocks">
                                                    <label>Role <span className="text-danger">*</span></label>
                                                    <Select className="select" options={roleOptions}
                                                            placeholder="Choose Role"
                                                            value={roleOptions.find(opt => opt.value === formData.role_id)}
                                                            onChange={handleRoleChange} />
                                                    <small className="text-muted">
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
                          placeholder={warehousesLoading ?
                          "Loading..." : "Choose Warehouse"}
                          value={warehouseOptions.find(opt =>
                          opt.value === formData.warehouse_id)}
                          onChange={handleWarehouseChange}
                          isLoading={warehousesLoading}
                          isDisabled={warehousesLoading}
                          />
                        {errors.warehouse_id && <small
                        className="text-danger">{errors.warehouse_id}</small>
                        }
                        </div>
                      </div>

                      <div className="col-lg-6">
                        <div className="input-blocks">
                          <label>Status</label>
                          <Select
                            className="select"
                            options={statusOptions}
                            placeholder="Choose Status"
                            value={statusOptions.find(
                              (opt) => opt.value === formData.status
                            )}
                            onChange={handleStatusChange}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer-btn">
                      <button
                        type="button"
                        className="btn btn-cancel me-2"
                        data-bs-dismiss="modal"
                        onClick={handleCancel}
                        disabled={loading}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="btn btn-submit"
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Updating...
                          </>
                        ) : (
                          "Update User"
                        )}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="text-center p-4">
                    <p>No user selected</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

EditUser.propTypes = {
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    name: PropTypes.string,
    username: PropTypes.string,
    email: PropTypes.string,
    phone: PropTypes.string,
    role_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    status: PropTypes.string,
    avatar: PropTypes.string,
    img: PropTypes.string,
  }),
  onSuccess: PropTypes.func,
  roles: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      name: PropTypes.string.isRequired,
    })
  ).isRequired,
};

EditUser.propTypes = {
  user: null,
  onSuccess: PropTypes.func,
  currentUserRole: PropTypes.string


};

export default EditUser;


// import PropTypes from "prop-types";
// import { PlusCircle } from "feather-icons-react/build/IconComponents";
// import React, { useState, useEffect, useRef } from "react";
// import Select from "react-select";
// import Swal from "sweetalert2";
// import AuthService from "../../../services/authService";
// import { roleHierarchy } from "../../../utils/roleHierarchy";

// const EditUser = ({ user, onSuccess, roles, currentUserRole }) => {
//   const modalRef = useRef(null);

//   const [formData, setFormData] = useState({
//     name: "",
//     username: "",
//     email: "",
//     phone: "",
//     role_id: "",
//     status: "Active",
//   });

//   // UI state
//   const [avatarFile, setAvatarFile] = useState(null);
//   const [avatarPreview, setAvatarPreview] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [errors, setErrors] = useState({});

//   // Get current user's role hierarchy level
//   const currentUserLevel = currentUserRole ? (roleHierarchy[currentUserRole] || 0) : 0;

//   // Get the role being edited
//   const editingUserRole = roles.find(r => r.id === user?.role_id);
//   const editingUserLevel = editingUserRole ? (roleHierarchy[editingUserRole.name] || 0) : 0;

//   // Check if current user can edit this user
//   const canEditUserRole = editingUserLevel < currentUserLevel;

//   console.log("✅ EditUser - Current User Role:", currentUserRole);
//   console.log("✅ EditUser - Current User Level:", currentUserLevel);
//   console.log("✅ EditUser - Editing User:", user?.name);
//   console.log("✅ EditUser - Editing User Role:", editingUserRole?.name);
//   console.log("✅ EditUser - Editing User Level:", editingUserLevel);
//   console.log("✅ EditUser - Can Edit Role:", canEditUserRole);

//   // Filter roles: Show ALL roles LOWER than current user's level
//   const filteredRoles = (roles || []).filter((role) => {
//     const roleLevel = roleHierarchy[role.name] || 0;
//     return roleLevel < currentUserLevel; // Only show roles with lower hierarchy
//   });

//   console.log("✅ EditUser - All Roles:", roles);
//   console.log("✅ EditUser - Filtered Roles (< current level):", filteredRoles);

//   // Status options
//   const statusOptions = [
//     { value: "Active", label: "Active" },
//     { value: "Inactive", label: "Inactive" },
//   ];

//   // Populate form when user prop changes
//   useEffect(() => {
//     if (user) {
//       console.log("✏️ User selected for editing:", user);
//       setFormData({
//         name: user.name || "",
//         username: user.username || "",
//         email: user.email || "",
//         phone: user.phone || "",
//         role_id: user.role_id || "",
//         status: user.status || "Active",
//       });

//       if (user.avatar) {
//         const baseUrl = "http://13.234.253.16:7000";
//         setAvatarPreview(`${baseUrl}/${user.avatar}`);
//       } else if (user.img) {
//         setAvatarPreview(user.img);
//       } else {
//         setAvatarPreview(null);
//       }

//       setAvatarFile(null);
//       setErrors({});
//     }
//   }, [user]);

//   // Create role options
//   const roleOptions = [
//     { value: "", label: "Choose Role", isDisabled: true },
//     ...filteredRoles.map((role) => ({
//       value: role.id,
//       label: role.name,
//       isDisabled: false, // All filtered roles can be selected
//     })),
//   ];

//   console.log("✅ EditUser - Role Options:", roleOptions);

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

//   // Handle role selection with validation
//   const handleRoleChange = (selectedOption) => {
//     if (!selectedOption) {
//       return;
//     }

//     console.log("🔄 Role change attempted:", selectedOption);

//     // Check if user can edit roles at all
//     if (!canEditUserRole) {
//       Swal.fire({
//         icon: "error",
//         title: "Insufficient Permissions",
//         text: "You cannot change the role of a user with equal or higher privileges.",
//       });
//       return;
//     }

//     const selectedRole = roles.find(r => r.id === selectedOption.value);
//     const selectedRoleLevel = selectedRole ? (roleHierarchy[selectedRole.name] || 0) : 0;

//     // Prevent selecting a role >= current user's level
//     if (selectedRoleLevel >= currentUserLevel) {
//       Swal.fire({
//         icon: "error",
//         title: "Insufficient Permissions",
//         text: "You cannot assign a role equal to or higher than your own role.",
//       });
//       return;
//     }

//     console.log("✅ Role change allowed:", selectedOption);

//     setFormData((prev) => ({
//       ...prev,
//       role_id: selectedOption.value,
//     }));
    
//     if (errors.role_id) {
//       setErrors((prev) => ({
//         ...prev,
//         role_id: "",
//       }));
//     }
//   };

//   // Handle status selection
//   const handleStatusChange = (selectedOption) => {
//     setFormData((prev) => ({
//       ...prev,
//       status: selectedOption ? selectedOption.value : "Active",
//     }));
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

//     if (!user || !user.id) {
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: "No user selected for editing",
//       });
//       return;
//     }

//     // Final validation before submission
//     if (!canEditUserRole) {
//       Swal.fire({
//         icon: "error",
//         title: "Insufficient Permissions",
//         text: "You cannot edit a user with equal or higher privileges.",
//       });
//       return;
//     }

//     const selectedRole = roles.find(r => r.id === formData.role_id);
//     const selectedRoleLevel = selectedRole ? (roleHierarchy[selectedRole.name] || 0) : 0;

//     if (selectedRoleLevel >= currentUserLevel) {
//       Swal.fire({
//         icon: "error",
//         title: "Insufficient Permissions",
//         text: "You cannot assign a role equal to or higher than your own role.",
//       });
//       return;
//     }

//     setLoading(true);

//     try {
//       const submitData = new FormData();
//       submitData.append("name", formData.name);
//       submitData.append("email", formData.email);
//       submitData.append("phone", formData.phone || "");
//       submitData.append("username", formData.username || formData.email);
//       submitData.append("role_id", formData.role_id);
//       submitData.append("status", formData.status);

//       if (avatarFile) {
//         submitData.append("avatar", avatarFile);
//       }

//       const response = await AuthService.editUserById(user.id, submitData);

//       Swal.fire({
//         icon: "success",
//         title: "Success!",
//         text: response.data?.message || "User updated successfully",
//         confirmButtonColor: "#00ff00",
//       });

//       closeModal();

//       if (onSuccess) {
//         onSuccess();
//       }
//     } catch (error) {
//       console.error("Error updating user:", error);
//       Swal.fire({
//         icon: "error",
//         title: "Error",
//         text: error.response?.data?.message || "Failed to update user",
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Handle modal close/cancel
//   const handleCancel = () => {
//     setErrors({});
//     setAvatarFile(null);

//     const fileInput = modalRef.current?.querySelector('input[type="file"]');
//     if (fileInput) {
//       fileInput.value = "";
//     }

//     if (user) {
//       setFormData({
//         name: user.name || "",
//         username: user.username || "",
//         email: user.email || "",
//         phone: user.phone || "",
//         role_id: user.role_id || "",
//         status: user.status || "Active",
//       });

//       if (user.avatar) {
//         const baseUrl = "http://13.234.253.16:7000";
//         setAvatarPreview(`${baseUrl}/${user.avatar}`);
//       } else if (user.img) {
//         setAvatarPreview(user.img);
//       } else {
//         setAvatarPreview(null);
//       }
//     }
//   };

//   return (
//     <div
//       className="modal fade"
//       id="edit-units"
//       ref={modalRef}
//       tabIndex={-1}
//       aria-labelledby="editUserLabel"
//       aria-hidden="true"
//     >
//       <div className="modal-dialog modal-dialog-centered custom-modal-two">
//         <div className="modal-content">
//           <div className="page-wrapper-new p-0">
//             <div className="content">
//               <div className="modal-header border-0 custom-modal-header">
//                 <div className="page-title">
//                   <h4 id="editUserLabel">Edit User</h4>
//                 </div>
//                 <button
//                   type="button"
//                   className="close"
//                   data-bs-dismiss="modal"
//                   aria-label="Close"
//                   onClick={handleCancel}
//                 >
//                   <span aria-hidden="true">×</span>
//                 </button>
//               </div>
//               <div className="modal-body custom-modal-body">
//                 {user ? (
//                   <>
//                     {!canEditUserRole && (
//                       <div className="alert alert-warning" role="alert">
//                         <strong>Limited Access:</strong> You cannot modify this user role as they have equal or higher privileges than you.
//                       </div>
//                     )}
//                     <form onSubmit={handleSubmit}>
//                       <div className="row">
//                         <div className="col-lg-12">
//                           <div className="new-employee-field">
//                             <span>Avatar</span>
//                             <div className="profile-pic-upload mb-2">
//                               <div className="profile-pic">
//                                 {avatarPreview ? (
//                                   <img
//                                     src={avatarPreview}
//                                     alt="Avatar Preview"
//                                     style={{
//                                       width: "100%",
//                                       height: "100%",
//                                       objectFit: "cover",
//                                       borderRadius: "50%",
//                                     }}
//                                   />
//                                 ) : (
//                                   <span>
//                                     <PlusCircle className="plus-down-add" />
//                                     Profile Photo
//                                   </span>
//                                 )}
//                               </div>
//                               <div className="input-blocks mb-0">
//                                 <div className="image-upload mb-0">
//                                   <input
//                                     type="file"
//                                     accept="image/*"
//                                     onChange={handleAvatarChange}
//                                     disabled={!canEditUserRole}
//                                   />
//                                   <div className="image-uploads">
//                                     <h4>Change Image</h4>
//                                   </div>
//                                 </div>
//                               </div>
//                             </div>
//                           </div>
//                         </div>

//                         <div className="col-lg-6">
//                           <div className="input-blocks">
//                             <label>
//                               Name <span className="text-danger">*</span>
//                             </label>
//                             <input
//                               type="text"
//                               className={`form-control ${
//                                 errors.name ? "is-invalid" : ""
//                               }`}
//                               name="name"
//                               value={formData.name}
//                               onChange={handleInputChange}
//                               placeholder="Enter name"
//                               disabled={!canEditUserRole}
//                             />
//                             {errors.name && (
//                               <div className="invalid-feedback d-block">
//                                 {errors.name}
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         <div className="col-lg-6">
//                           <div className="input-blocks">
//                             <label>Username</label>
//                             <input
//                               type="text"
//                               className="form-control"
//                               name="username"
//                               value={formData.username}
//                               onChange={handleInputChange}
//                               placeholder="Enter username"
//                               disabled={!canEditUserRole}
//                             />
//                           </div>
//                         </div>

//                         <div className="col-lg-6">
//                           <div className="input-blocks">
//                             <label>
//                               Email <span className="text-danger">*</span>
//                             </label>
//                             <input
//                               type="email"
//                               className={`form-control ${
//                                 errors.email ? "is-invalid" : ""
//                               }`}
//                               name="email"
//                               value={formData.email}
//                               onChange={handleInputChange}
//                               placeholder="Enter email"
//                               disabled={!canEditUserRole}
//                             />
//                             {errors.email && (
//                               <div className="invalid-feedback d-block">
//                                 {errors.email}
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         <div className="col-lg-6">
//                           <div className="input-blocks">
//                             <label>Phone</label>
//                             <input
//                               type="text"
//                               className={`form-control ${
//                                 errors.phone ? "is-invalid" : ""
//                               }`}
//                               name="phone"
//                               value={formData.phone}
//                               onChange={handleInputChange}
//                               placeholder="Enter phone number"
//                               disabled={!canEditUserRole}
//                             />
//                             {errors.phone && (
//                               <div className="invalid-feedback d-block">
//                                 {errors.phone}
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         <div className="col-lg-6">
//                           <div className="input-blocks">
//                             <label>
//                               Role <span className="text-danger">*</span>
//                             </label>
//                             <Select
//                               className={`select ${
//                                 errors.role_id ? "is-invalid" : ""
//                               }`}
//                               options={roleOptions}
//                               placeholder="Choose Role"
//                               value={roleOptions.find(
//                                 (opt) => opt.value === formData.role_id
//                               )}
//                               onChange={handleRoleChange}
//                               isDisabled={!canEditUserRole}
//                             />
//                             {errors.role_id && (
//                               <div className="invalid-feedback d-block">
//                                 {errors.role_id}
//                               </div>
//                             )}
//                           </div>
//                         </div>

//                         <div className="col-lg-6">
//                           <div className="input-blocks">
//                             <label>Status</label>
//                             <Select
//                               className="select"
//                               options={statusOptions}
//                               placeholder="Choose Status"
//                               value={statusOptions.find(
//                                 (opt) => opt.value === formData.status
//                               )}
//                               onChange={handleStatusChange}
//                               isDisabled={!canEditUserRole}
//                             />
//                           </div>
//                         </div>
//                       </div>

//                       <div className="modal-footer-btn">
//                         <button
//                           type="button"
//                           className="btn btn-cancel me-2"
//                           data-bs-dismiss="modal"
//                           onClick={handleCancel}
//                           disabled={loading}
//                         >
//                           Cancel
//                         </button>
//                         <button
//                           type="submit"
//                           className="btn btn-submit"
//                           disabled={loading || !canEditUserRole}
//                         >
//                           {loading ? (
//                             <>
//                               <span
//                                 className="spinner-border spinner-border-sm me-2"
//                                 role="status"
//                                 aria-hidden="true"
//                               ></span>
//                               Updating...
//                             </>
//                           ) : (
//                             "Update User"
//                           )}
//                         </button>
//                       </div>
//                     </form>
//                   </>
//                 ) : (
//                   <div className="text-center p-4">
//                     <p>No user selected</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// EditUser.propTypes = {
//   user: PropTypes.shape({
//     id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
//     name: PropTypes.string,
//     username: PropTypes.string,
//     email: PropTypes.string,
//     phone: PropTypes.string,
//     role_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
//     status: PropTypes.string,
//     avatar: PropTypes.string,
//     img: PropTypes.string,
//   }),
//   onSuccess: PropTypes.func,
//   roles: PropTypes.arrayOf(
//     PropTypes.shape({
//       id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
//       name: PropTypes.string.isRequired,
//     })
//   ).isRequired,
//   currentUserRole: PropTypes.string,
// };

// EditUser.defaultProps = {
//   user: null,
//   onSuccess: () => {},
//   currentUserRole: null,
// };

// export default EditUser;















