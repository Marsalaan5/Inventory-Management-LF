// import React from "react";
// import ImageWithBasePath from "../../../core/img/imagewithbasebath";
// import { Link } from "react-router-dom";
// import { all_routes } from "../../../Router/all_routes";

// const Resetpassword = () => {
//   const route = all_routes;
//   return (
//     <div className="main-wrapper">
//       <div className="account-content">
//         <div className="login-wrapper reset-pass-wrap bg-img">
//           <div className="login-content">
//             <form action="success-3">
//               <div className="login-userset">
//                 <div className="login-logo logo-normal">
//                   <ImageWithBasePath src="assets/img/logo.png" alt="img" />
//                 </div>
//                 <Link to={route.dashboard} className="login-logo logo-white">
//                   <ImageWithBasePath src="assets/img/logo-white.png" alt />
//                 </Link>
//                 <div className="login-userheading">
//                   <h3>Reset password?</h3>
//                   <h4>
//                     Enter New Password &amp; Confirm Password to get inside
//                   </h4>
//                 </div>
//                 <div className="form-login">
//                   <label> Old Password</label>
//                   <div className="pass-group">
//                     <input type="password" className="pass-input" />
//                     <span className="fas toggle-password fa-eye-slash" />
//                   </div>
//                 </div>
//                 <div className="form-login">
//                   <label>New Password</label>
//                   <div className="pass-group">
//                     <input type="password" className="pass-inputs" />
//                     <span className="fas toggle-passwords fa-eye-slash" />
//                   </div>
//                 </div>
//                 <div className="form-login">
//                   <label> New Confirm Passworrd</label>
//                   <div className="pass-group">
//                     <input type="password" className="pass-inputa" />
//                     <span className="fas toggle-passworda fa-eye-slash" />
//                   </div>
//                 </div>
//                 <div className="form-login">
//                   <Link to={route.dashboard} className="btn btn-login">
//                     Change Password
//                   </Link>
//                 </div>
//                 <div className="signinform text-center">
//                   <h4>
//                     Return to{" "}
//                     <Link to={route.signin} className="hover-a">
//                       {" "}
//                       login{" "}
//                     </Link>
//                   </h4>
//                 </div>
//                 <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
//                   <p>Copyright © 2023 DreamsPOS. All rights reserved</p>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Resetpassword;




import React, { useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";
import { all_routes } from "../../../Router/all_routes";
import AuthService from "../../../services/authService";

const Resetpassword = () => {
  const route = all_routes;
  const navigate = useNavigate();
  const { token } = useParams(); // ✅ read token from URL (like /reset-password/:token)

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword)
      return setError("Please fill in all password fields.");
    if (newPassword !== confirmPassword)
      return setError("Passwords do not match.");

    try {
      setLoading(true);
      const { data } = await AuthService.resetPassword({
        token,
        password: newPassword,
      });
      setMessage(data.message || "Password reset successfully!");
      setTimeout(() => navigate(route.signin), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="account-content">
        <div className="login-wrapper reset-pass-wrap bg-img">
          <div className="login-content">
            <form onSubmit={handleSubmit}>
              <div className="login-userset">
                {/* Logo */}
                <div className="login-logo logo-normal">
                  <ImageWithBasePath src="assets/img/logo.png" alt="DreamsPOS" />
                </div>
                <Link to={route.dashboard} className="login-logo logo-white">
                  <ImageWithBasePath src="assets/img/logo-white.png" alt="DreamsPOS" />
                </Link>

                {/* Heading */}
                <div className="login-userheading">
                  <h3>Reset Password</h3>
                  <h4>Enter and confirm your new password to access your account.</h4>
                </div>

                {/* New Password */}
                <div className="form-login">
                  <label>New Password</label>
                  <div className="pass-group">
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                    />
                    <span className="fas toggle-password fa-eye-slash" />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-login">
                  <label>Confirm Password</label>
                  <div className="pass-group">
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                    />
                    <span className="fas toggle-password fa-eye-slash" />
                  </div>
                </div>

                {/* Alerts */}
                {error && <div className="alert alert-danger mt-2">{error}</div>}
                {message && <div className="alert alert-success mt-2">{message}</div>}

                {/* Submit */}
                <div className="form-login">
                  <button type="submit" className="btn btn-login" disabled={loading}>
                    {loading ? "Updating..." : "Change Password"}
                  </button>
                </div>

                {/* Back to Login */}
                <div className="signinform text-center">
                  <h4>
                    Return to{" "}
                    <Link to={route.signin} className="hover-a">
                      login
                    </Link>
                  </h4>
                </div>

                <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
                  <p>Copyright © 2023 DreamsPOS. All rights reserved</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Resetpassword;
