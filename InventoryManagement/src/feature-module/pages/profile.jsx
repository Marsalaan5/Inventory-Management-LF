// import React from "react";
// import ImageWithBasePath from "../../core/img/imagewithbasebath";
// import { Link } from "react-router-dom";

// const Profile = () => {
//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="page-header">
//           <div className="page-title">
//             <h4>Profile</h4>
//             <h6>User Profile</h6>
//           </div>
//         </div>
//         {/* /product list */}
//         <div className="card">
//           <div className="card-body">
//             <div className="profile-set">
//               <div className="profile-head"></div>
//               <div className="profile-top">
//                 <div className="profile-content">
//                   <div className="profile-contentimg">
//                     <ImageWithBasePath
//                       src="assets/img/customer/customer5.jpg"
//                       alt="img"
//                       id="blah"
//                     />
//                     <div className="profileupload">
//                       <input type="file" id="imgInp" />
//                      <Link to="#">
//                         <ImageWithBasePath src="assets/img/icons/edit-set.svg" alt="img" />
//                       </Link>
//                     </div>
//                   </div>
//                   <div className="profile-contentname">
//                     <h2>William Castillo</h2>
//                     <h4>Updates Your Photo and Personal Details.</h4>
//                   </div>
//                 </div>
                
//               </div>
//             </div>
//             <div className="row">
//               <div className="col-lg-6 col-sm-12">
//                 <div className="input-blocks">
//                   <label className="form-label">First Name</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     defaultValue="William"
//                   />
//                 </div>
//               </div>
//               <div className="col-lg-6 col-sm-12">
//                 <div className="input-blocks">
//                   <label className="form-label">Last Name</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     defaultValue="Castilo"
//                   />
//                 </div>
//               </div>
//               <div className="col-lg-6 col-sm-12">
//                 <div className="input-blocks">
//                   <label>Email</label>
//                   <input
//                     type="email"
//                     className="form-control"
//                     defaultValue="william@example.com"
//                   />
//                 </div>
//               </div>
//               <div className="col-lg-6 col-sm-12">
//                 <div className="input-blocks">
//                   <label className="form-label">Phone</label>
//                   <input type="text" defaultValue="+1452 876 5432" />
//                 </div>
//               </div>
//               <div className="col-lg-6 col-sm-12">
//                 <div className="input-blocks">
//                   <label className="form-label">User Name</label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     defaultValue="William Castilo"
//                   />
//                 </div>
//               </div>
//               <div className="col-lg-6 col-sm-12">
//                 <div className="input-blocks">
//                   <label className="form-label">Password</label>
//                   <div className="pass-group">
//                     <input
//                       type="password"
//                       className="pass-input form-control"
//                     />
//                     <span className="fas toggle-password fa-eye-slash" />
//                   </div>
//                 </div>
//               </div>
//               <div className="col-12">
//                <Link to="#" className="btn btn-submit me-2">
//                   Submit
//                 </Link>
//                <Link to="#" className="btn btn-cancel">
//                   Cancel
//                 </Link>
//               </div>
//             </div>
//           </div>
//         </div>
//         {/* /product list */}
//       </div>
//     </div>
//   );
// };

// export default Profile;







import React, { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import ImageWithBasePath from "../../core/img/imagewithbasebath";
import AuthService, { updateUser } from "../../services/authService";

const Profile = () => {
  const [user, setUser] = useState({
    id: "",
    name: "",
    role: "",
    avatar: "",
    email: "",
    phone: "",
    username: "",
    firstName: "",
    lastName: "",
  });
  const [originalUser, setOriginalUser] = useState(null);
  const [newAvatar, setNewAvatar] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Fetch user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data } = await AuthService.getProfile();
        const fetchedUser = data;
        console.log("User data:", fetchedUser);

        const nameParts = fetchedUser.name ? fetchedUser.name.split(" ") : [];
        const firstName = nameParts[0] || "";
        const lastName = nameParts.slice(1).join(" ") || "";

        
        // let avatarUrl = fetchedUser.avatar || "assets/img/customer/customer5.jpg";
        // if (fetchedUser.avatar && fetchedUser.avatar.startsWith('uploads/')) {
        //   avatarUrl = `http://localhost:5000/${fetchedUser.avatar}`;
        //   console.log("Formatted avatar URL on load:", avatarUrl);
        // }

        const userData = {
          id: fetchedUser.id || fetchedUser._id || "",
          name: fetchedUser.name || "",
          role: fetchedUser.role || "",
          // avatar: avatarUrl,
          email: fetchedUser.email || "",
          phone: fetchedUser.phone || "",
          username: fetchedUser.username || fetchedUser.name || "",
          firstName,
          lastName,
        };

        console.log("User data set:", userData);
        setUser(userData);
        setOriginalUser(userData);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError("Failed to load user profile");
      }
    };

    fetchUserProfile();
  }, []);

  // Handle image file selection and preview
  // const handleImageChange = (e) => {
  //   const file = e.target.files[0];
  //   if (file) {
  //     // Validate file type
  //     if (!file.type.startsWith("image/")) {
  //       setError("Please select a valid image file");
  //       return;
  //     }

  //     // Validate file size (e.g., max 5MB)
  //     if (file.size > 5 * 1024 * 1024) {
  //       setError("Image size should be less than 5MB");
  //       return;
  //     }

  //     setNewAvatar(file);
  //     setError("");
      
  //     const reader = new FileReader();
  //     reader.onloadend = () => {
  //       setUser((prevState) => ({
  //         ...prevState,
  //         avatar: reader.result,
  //       }));
  //     };
  //     reader.readAsDataURL(file);
  //   }
  // };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Validation
    if (!user.firstName || !user.lastName) {
      setError("First name and last name are required");
      setLoading(false);
      return;
    }

    if (!user.email) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    // Check if anything has changed
    const fullName = `${user.firstName} ${user.lastName}`.trim();
    const hasNameChanged = originalUser && fullName !== originalUser.name;
    const hasEmailChanged = originalUser && user.email !== originalUser.email;
    const hasPhoneChanged = originalUser && user.phone !== originalUser.phone;
    const hasUsernameChanged = originalUser && user.username !== originalUser.username;
    const hasAvatarChanged = newAvatar !== null;

    if (!hasNameChanged && !hasEmailChanged && !hasPhoneChanged && !hasUsernameChanged && !hasAvatarChanged) {
      setError("No changes detected. Please modify at least one field.");
      setLoading(false);
      return;
    }

    // Create FormData object
    const formData = new FormData();
    formData.append("name", fullName);
    formData.append("email", user.email);
    formData.append("phone", user.phone || "");
    formData.append("username", user.username);
    
    // Add role if it exists
    if (user.role) {
      formData.append("role", user.role);
    }

    // Only append avatar if a new one was selected
    if (newAvatar) {
      formData.append("avatar", newAvatar);
    }

    // Debug: Log FormData contents
    console.log("=== FormData Contents ===");
    for (let pair of formData.entries()) {
      console.log(pair[0], pair[1]);
    }
    console.log("User ID:", user.id);

    try {
      if (!user.id) {
        throw new Error("User ID is missing");
      }

      const response = await updateUser(user.id, formData);
      console.log("Update response:", response);
      console.log("Response avatar path:", response.data?.user?.avatar);
      
      // Format the avatar URL from response if it was updated
      let updatedAvatar = user.avatar;
      if (response.data?.user?.avatar) {
        const avatarPath = response.data.user.avatar;
        if (avatarPath.startsWith('uploads/')) {
          updatedAvatar = `http://localhost:5000/${avatarPath}`;
        } else {
          updatedAvatar = avatarPath;
        }
        console.log("Formatted avatar URL:", updatedAvatar);
      }
      
      // Update original user data after successful save
      const updatedUserData = {
        ...user,
        name: fullName,
        avatar: updatedAvatar,
      };
      console.log("Updated user data:", updatedUserData);
      setUser(updatedUserData);
      setOriginalUser(updatedUserData);
      setNewAvatar(null);
      setIsEditing(false);
      
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("=== Error Details ===");
      console.error("Full error:", err);
      console.error("Response data:", err.response?.data);
      console.error("Response status:", err.response?.status);
      console.error("Response headers:", err.response?.headers);
      
      const errorMessage = err.response?.data?.message 
        || err.response?.data?.error 
        || err.message 
        || "Failed to update profile";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  
  const handleCancel = () => {
    if (originalUser) {
      setUser(originalUser);
    }
    setNewAvatar(null);
    setError("");
    setIsEditing(false);
  };


  const handleEdit = () => {
    setError("");
    setIsEditing(true);
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="page-title">
            <h4>Profile</h4>
            <h6>User Profile</h6>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <div className="profile-set">
              <div className="profile-top">
                <div className="profile-content">
                  {/* <div className="profile-contentimg">
                    {/* {user.avatar && (user.avatar.startsWith('http://') || user.avatar.startsWith('https://') || user.avatar.startsWith('data:')) ? (
                    
                      <img 
                        src={user.avatar} 
                        alt="User Avatar" 
                        id="blah"
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e) => {
                          console.error("Image load error for URL:", user.avatar);
                          e.target.src = "assets/img/customer/customer5.jpg";
                        }}
                        onLoad={() => {
                          console.log("Image loaded successfully:", user.avatar);
                        }}
                      />
                    ) : (
                   
                      <ImageWithBasePath 
                        src={user.avatar || "assets/img/customer/customer5.jpg"} 
                        alt="User Avatar" 
                        id="blah" 
                      />
                    )} */}
                    {/* <div className="profileupload">
                      <input
                        type="file"
                        id="imgInp"
                        accept="image/*"
                        onChange={handleImageChange}
                        disabled={!isEditing}
                      />
                      {isEditing && (
                        <Link to="#">
                          <ImageWithBasePath
                            src="assets/img/icons/edit-set.svg"
                            alt="Edit Icon"
                          />
                        </Link>
                      )}
                    </div> */}
                  {/* </div> */} 
                  <div className="profile-contentname">
                    <h2>{user.name}</h2>
                    <h4>Update your photo and personal details.</h4>
                  </div>
                </div>
              </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="row">
                {/* First Name */}
                <div className="col-lg-6 col-sm-12">
                  <div className="input-blocks">
                    <label className="form-label">First Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user.firstName}
                      onChange={(e) =>
                        setUser({ ...user, firstName: e.target.value })
                      }
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>

              
                <div className="col-lg-6 col-sm-12">
                  <div className="input-blocks">
                    <label className="form-label">Last Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user.lastName}
                      onChange={(e) =>
                        setUser({ ...user, lastName: e.target.value })
                      }
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>

              
                <div className="col-lg-6 col-sm-12">
                  <div className="input-blocks">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={user.email}
                      onChange={(e) =>
                        setUser({ ...user, email: e.target.value })
                      }
                      disabled={!isEditing}
                      required
                    />
                  </div>
                </div>

              
                <div className="col-lg-6 col-sm-12">
                  <div className="input-blocks">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user.phone}
                      onChange={(e) =>
                        setUser({ ...user, phone: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                
                <div className="col-lg-6 col-sm-12">
                  <div className="input-blocks">
                    <label className="form-label">User Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user.username}
                      onChange={(e) =>
                        setUser({ ...user, username: e.target.value })
                      }
                      disabled={!isEditing}
                    />
                  </div>
                </div>

              
                <div className="col-lg-6 col-sm-12">
                  <div className="input-blocks">
                    <label className="form-label">Password</label>
                    <div className="pass-group">
                      <input
                        type="password"
                        className="pass-input form-control"
                        disabled
                        value="********"
                      />
                      <span className="fas toggle-password fa-eye-slash" />
                    </div>
                  </div>
                </div>

              
                {isEditing ? (
                  <div className="col-12">
                    <button
                      type="submit"
                      className="btn btn-submit me-2"
                      disabled={loading}
                    >
                      {loading ? "Updating..." : "Submit"}
                    </button>
                    <button
                      type="button"
                      className="btn btn-cancel"
                      onClick={handleCancel}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="col-12">
                    <button
                      type="button"
                      className="btn btn-edit"
                      onClick={handleEdit}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;