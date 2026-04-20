// import React from "react";
// import ImageWithBasePath from "../../../core/img/imagewithbasebath";
// import { Link } from "react-router-dom";
// import { all_routes } from "../../../Router/all_routes";

// const Register = () => {
//   const route = all_routes;
//   return (
//     <div className="main-wrapper">
//       <div className="account-content">
//         <div className="login-wrapper register-wrap bg-img">
//           <div className="login-content">
//             <form action="signin">
//               <div className="login-userset">
//                 <div className="login-logo logo-normal">
//                   <ImageWithBasePath src="assets/img/logo.png" alt="img" />
//                 </div>
//                 <Link to={route.dashboard} className="login-logo logo-white">
//                   <ImageWithBasePath src="assets/img/logo-white.png" alt />
//                 </Link>
//                 <div className="login-userheading">
//                   <h3>Register</h3>
//                   <h4>Create New Dreamspos Account</h4>
//                 </div>
//                 <div className="form-login">
//                   <label>Name</label>
//                   <div className="form-addons">
//                     <input type="text" className="form-control" />
//                     <ImageWithBasePath
//                       src="assets/img/icons/user-icon.svg"
//                       alt="img"
//                     />
//                   </div>
//                 </div>
//                 <div className="form-login">
//                   <label>Email Address</label>
//                   <div className="form-addons">
//                     <input type="text" className="form-control" />
//                     <ImageWithBasePath
//                       src="assets/img/icons/mail.svg"
//                       alt="img"
//                     />
//                   </div>
//                 </div>
//                 <div className="form-login">
//                   <label>Password</label>
//                   <div className="pass-group">
//                     <input type="password" className="pass-input" />
//                     <span className="fas toggle-password fa-eye-slash" />
//                   </div>
//                 </div>
//                 <div className="form-login">
//                   <label>Confirm Passworrd</label>
//                   <div className="pass-group">
//                     <input type="password" className="pass-inputs" />
//                     <span className="fas toggle-passwords fa-eye-slash" />
//                   </div>
//                 </div>
//                 <div className="form-login authentication-check">
//                   <div className="row">
//                     <div className="col-sm-8">
//                       <div className="custom-control custom-checkbox justify-content-start">
//                         <div className="custom-control custom-checkbox">
//                           <label className="checkboxs ps-4 mb-0 pb-0 line-height-1">
//                             <input type="checkbox" />
//                             <span className="checkmarks" />I agree to the{" "}
//                             <Link to="#" className="hover-a">
//                               Terms &amp; Privacy
//                             </Link>
//                           </label>
//                         </div>
//                       </div>
//                     </div>
//                   </div>
//                 </div>
//                 <div className="form-login">
//                   <Link to={route.signup} className="btn btn-login">
//                     Sign Up
//                   </Link>
//                 </div>
//                 <div className="signinform">
//                   <h4>
//                     Already have an account ?{" "}
//                     <Link to={route.signin} className="hover-a">
//                       Sign In Instead
//                     </Link>
//                   </h4>
//                 </div>
//                 <div className="form-setlogin or-text">
//                   <h4>OR</h4>
//                 </div>
//                 <div className="form-sociallink">
//                   <ul className="d-flex">
//                     <li>
//                       <Link to="#" className="facebook-logo">
//                         <ImageWithBasePath
//                           src="assets/img/icons/facebook-logo.svg"
//                           alt="Facebook"
//                         />
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#">
//                         <ImageWithBasePath
//                           src="assets/img/icons/google.png"
//                           alt="Google"
//                         />
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="apple-logo">
//                         <ImageWithBasePath
//                           src="assets/img/icons/apple-logo.svg"
//                           alt="Apple"
//                         />
//                       </Link>
//                     </li>
//                   </ul>
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

// export default Register;




// import React, { useState } from "react";
// import ImageWithBasePath from "../../../core/img/imagewithbasebath";
// import { Link, useNavigate } from "react-router-dom";
// import { all_routes } from "../../../Router/all_routes"; 
// import AuthService from "../../../services/authService";

// const Register = () => {
//   const route = all_routes;
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     name: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//     agree: false,
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [success, setSuccess] = useState("");

//   const handleChange = (e) => {
//     const { name, value, type, checked } = e.target;
//     setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setSuccess("");

//     if (!formData.name || !formData.email || !formData.password) {
//       return setError("Please fill in all fields.");
//     }

//     if (formData.password !== formData.confirmPassword) {
//       return setError("Passwords do not match.");
//     }

//     if (!formData.agree) {
//       return setError("Please agree to Terms & Privacy.");
//     }

//     try {
//       setLoading(true);
//       await AuthService.register({
//         name: formData.name,
//         email: formData.email,
//         password: formData.password,

//       });
//       setSuccess("Registration successful! Redirecting...");
//       setTimeout(() => navigate(route.signin), 1500);
//     } catch (err) {
//       setError(err.response?.data?.message || "Something went wrong!");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="main-wrapper">
//       <div className="account-content">
//         <div className="login-wrapper register-wrap bg-img">
//           <div className="login-content">
//             <form onSubmit={handleSubmit}>
//               <div className="login-userset">
//                 <div className="login-logo logo-normal">
//                   <ImageWithBasePath src="assets/img/logo.png" alt="img" />
//                 </div>
//                 <Link to={route.dashboard} className="login-logo logo-white">
//                   <ImageWithBasePath src="assets/img/logo-white.png" alt="logo" />
//                 </Link>
//                 <div className="login-userheading">
//                   <h3>Register</h3>
//                   <h4>Create New DreamsPOS Account</h4>
//                 </div>

//                 {/* Name */}
//                 <div className="form-login">
//                   <label>Name</label>
//                   <div className="form-addons">
//                     <input
//                       type="text"
//                       name="name"
//                       value={formData.name}
//                       onChange={handleChange}
//                       className="form-control"
//                       required
//                     />
//                     <ImageWithBasePath src="assets/img/icons/user-icon.svg" alt="img" />
//                   </div>
//                 </div>

//                 {/* Email */}
//                 <div className="form-login">
//                   <label>Email Address</label>
//                   <div className="form-addons">
//                     <input
//                       type="email"
//                       name="email"
//                       value={formData.email}
//                       onChange={handleChange}
//                       className="form-control"
//                       required
//                     />
//                     <ImageWithBasePath src="assets/img/icons/mail.svg" alt="img" />
//                   </div>
//                 </div>

//                 {/* Password */}
//                 <div className="form-login">
//                   <label>Password</label>
//                   <div className="pass-group">
//                     <input
//                       type="password"
//                       name="password"
//                       value={formData.password}
//                       onChange={handleChange}
//                       className="pass-input"
//                       required
//                     />
//                     <span className="fas toggle-password fa-eye-slash" />
//                   </div>
//                 </div>

//                 {/* Confirm Password */}
//                 <div className="form-login">
//                   <label>Confirm Password</label>
//                   <div className="pass-group">
//                     <input
//                       type="password"
//                       name="confirmPassword"
//                       value={formData.confirmPassword}
//                       onChange={handleChange}
//                       className="pass-inputs"
//                       required
//                     />
//                     <span className="fas toggle-passwords fa-eye-slash" />
//                   </div>
//                 </div>

//                 {/* Checkbox */}
//                 <div className="form-login authentication-check">
//                   <label className="checkboxs ps-4 mb-0 pb-0 line-height-1">
//                     <input
//                       type="checkbox"
//                       name="agree"
//                       checked={formData.agree}
//                       onChange={handleChange}
//                     />
//                     <span className="checkmarks" />I agree to the{" "}
//                     <Link to="#" className="hover-a">
//                       Terms & Privacy
//                     </Link>
//                   </label>
//                 </div>

//                 {/* Feedback */}
//                 {error && <div className="alert alert-danger mt-2">{error}</div>}
//                 {success && <div className="alert alert-success mt-2">{success}</div>}

//                 {/* Submit Button */}
//                 <div className="form-login">
//                   <button type="submit" className="btn btn-login" disabled={loading}>
//                     {loading ? "Signing Up..." : "Sign Up"}
//                   </button>
//                 </div>

//                 {/* Already have account */}
//                 <div className="signinform">
//                   <h4>
//                     Already have an account?{" "}
//                     <Link to={route.signin} className="hover-a">
//                       Sign In Instead
//                     </Link>
//                   </h4>
//                 </div>

//                 {/* OR + Social Links */}
//                 <div className="form-setlogin or-text">
//                   <h4>OR</h4>
//                 </div>
//                 <div className="form-sociallink">
//                   <ul className="d-flex">
//                     <li>
//                       <Link to="#" className="facebook-logo">
//                         <ImageWithBasePath
//                           src="assets/img/icons/facebook-logo.svg"
//                           alt="Facebook"
//                         />
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#">
//                         <ImageWithBasePath
//                           src="assets/img/icons/google.png"
//                           alt="Google"
//                         />
//                       </Link>
//                     </li>
//                     <li>
//                       <Link to="#" className="apple-logo">
//                         <ImageWithBasePath
//                           src="assets/img/icons/apple-logo.svg"
//                           alt="Apple"
//                         />
//                       </Link>
//                     </li>
//                   </ul>
//                 </div>

//                 <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
//                   <p>Copyright © 2025 StockWise. All rights reserved</p>
//                 </div>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Register;



import React, { useState } from "react";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";
import { Link, useNavigate } from "react-router-dom";
import { all_routes } from "../../../Router/all_routes"; 
import AuthService from "../../../services/authService";

const Register = () => {
  const route = all_routes;
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agree: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({ ...formData, [name]: type === "checkbox" ? checked : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.name || !formData.email || !formData.password) {
      return setError("Please fill in all fields.");
    }

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match.");
    }

    if (formData.password.length < 6) {
      return setError("Password must be at least 6 characters long.");
    }

    if (!formData.agree) {
      return setError("Please agree to Terms & Privacy.");
    }

    try {
      setLoading(true);
      console.log(' Registering user...');
      
      // Call signup API (not register)
      const response = await AuthService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      console.log('Registration successful:', response.data);

      // Redirect to email verification page with user's email
      navigate(route.emailverification, { 
        state: { email: formData.email }
      });

    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="account-content">
        <div className="login-wrapper register-wrap bg-img">
          <div className="login-content">
            <form onSubmit={handleSubmit}>
              <div className="login-userset">
                <div className="login-logo logo-normal">
                  <ImageWithBasePath src="assets/img/logo.png" alt="StockWise" />
                </div>
                <Link to={route.dashboard} className="login-logo logo-white">
                  <ImageWithBasePath src="assets/img/logo-white.png" alt="StockWise" />
                </Link>
                <div className="login-userheading">
                  <h3>Register</h3>
                  <h4>Create New StockWise Account</h4>
                </div>

                {/* Name */}
                <div className="form-login mb-3">
                  <label className="form-label">Name</label>
                  <div className="form-addons">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter your full name"
                      required
                      disabled={loading}
                    />
                    <ImageWithBasePath src="assets/img/icons/user-icon.svg" alt="icon" />
                  </div>
                </div>

                {/* Email */}
                <div className="form-login mb-3">
                  <label className="form-label">Email Address</label>
                  <div className="form-addons">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="form-control"
                      placeholder="Enter your email"
                      required
                      disabled={loading}
                    />
                    <ImageWithBasePath src="assets/img/icons/mail.svg" alt="icon" />
                  </div>
                </div>

                {/* Password */}
                <div className="form-login mb-3">
                  <label className="form-label">Password</label>
                  <div className="pass-group">
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className="pass-input form-control"
                      placeholder="Enter password (min. 6 characters)"
                      required
                      disabled={loading}
                    />
                    <span className="fas toggle-password fa-eye-slash" />
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-login mb-3">
                  <label className="form-label">Confirm Password</label>
                  <div className="pass-group">
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pass-inputs form-control"
                      placeholder="Re-enter password"
                      required
                      disabled={loading}
                    />
                    <span className="fas toggle-passwords fa-eye-slash" />
                  </div>
                </div>

                {/* Checkbox */}
                <div className="form-login authentication-check mb-3">
                  <label className="checkboxs ps-4 mb-0 pb-0 line-height-1">
                    <input
                      type="checkbox"
                      name="agree"
                      checked={formData.agree}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <span className="checkmarks" />
                    I agree to the{" "}
                    <Link to="#" className="hover-a">
                      Terms & Privacy
                    </Link>
                  </label>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="alert alert-danger mt-2" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <div className="form-login">
                  <button 
                    type="submit" 
                    className="btn btn-login" 
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Creating Account...
                      </>
                    ) : (
                      "Sign Up"
                    )}
                  </button>
                </div>

                {/* Already have account */}
                <div className="signinform">
                  <h4>
                    Already have an account?{" "}
                    <Link to={route.signin} className="hover-a">
                      Sign In Instead
                    </Link>
                  </h4>
                </div>

                {/* OR + Social Links */}
                <div className="form-setlogin or-text">
                  <h4>OR</h4>
                </div>
                <div className="form-sociallink">
                  <ul className="d-flex">
                    <li>
                      <Link to="#" className="facebook-logo">
                        <ImageWithBasePath
                          src="assets/img/icons/facebook-logo.svg"
                          alt="Facebook"
                        />
                      </Link>
                    </li>
                    <li>
                      <Link to="#">
                        <ImageWithBasePath
                          src="assets/img/icons/google.png"
                          alt="Google"
                        />
                      </Link>
                    </li>
                    <li>
                      <Link to="#" className="apple-logo">
                        <ImageWithBasePath
                          src="assets/img/icons/apple-logo.svg"
                          alt="Apple"
                        />
                      </Link>
                    </li>
                  </ul>
                </div>

                <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
                  <p>Copyright © 2025 StockWise. All rights reserved</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;