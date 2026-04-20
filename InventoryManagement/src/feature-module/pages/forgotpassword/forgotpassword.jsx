// import React from "react";
// import ImageWithBasePath from "../../../core/img/imagewithbasebath";
// import { Link } from "react-router-dom";
// import { all_routes } from "../../../Router/all_routes";

// const Forgotpassword = () => {
//   const route = all_routes;
//   return (
//     <div className="main-wrapper">
//       <div className="account-content">
//         <div className="login-wrapper forgot-pass-wrap bg-img">
//           <div className="login-content">
//             <form>
//               <div className="login-userset">
//                 <div className="login-logo logo-normal">
//                   <ImageWithBasePath src="assets/img/logo.png" alt="img" />
//                 </div>
//                 <Link to={route.dashboard} className="login-logo logo-white">
//                   <ImageWithBasePath src="assets/img/logo-white.png" alt />
//                 </Link>
//                 <div className="login-userheading">
//                   <h3>Forgot password?</h3>
//                   <h4>
//                     If you forgot your password, well, then we’ll email you
//                     instructions to reset your password.
//                   </h4>
//                 </div>
//                 <div className="form-login">
//                   <label>Email</label>
//                   <div className="form-addons">
//                     <input type="email" className="form-control" />
//                     <ImageWithBasePath
//                       src="assets/img/icons/mail.svg"
//                       alt="img"
//                     />
//                   </div>
//                 </div>
//                 <div className="form-login">
//                   <Link tp={route.signin} className="btn btn-login">
//                     Sign Up
//                   </Link>
//                 </div>
//                 <div className="signinform text-center">
//                   <h4>
//                     Return to
//                     <Link to={route.signin} className="hover-a">
//                       {" "}
//                       login{" "}
//                     </Link>
//                   </h4>
//                 </div>
//                 <div className="form-setlogin or-text">
//                   <h4>OR</h4>
//                 </div>
//                 <div className="form-sociallink">
//                   <ul className="d-flex justify-content-center">
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

// export default Forgotpassword;



import React, { useState } from "react";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";
import { Link } from "react-router-dom";
import { all_routes } from "../../../Router/all_routes";
import AuthService from "../../../services/authService"; // ✅ import your axios-based service

const Forgotpassword = () => {
  const route = all_routes;

  // ✅ State
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) return setError("Please enter your email address.");

    try {
      setLoading(true);
      const { data } = await AuthService.forgotPassword({ email });
      setMessage(data.message || "Password reset instructions sent to your email.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-wrapper">
      <div className="account-content">
        <div className="login-wrapper forgot-pass-wrap bg-img">
          <div className="login-content">
            <form onSubmit={handleSubmit}>
              <div className="login-userset">
                {/* Logo */}
                <div className="login-logo logo-normal">
                  <ImageWithBasePath src="assets/img/logo.png" alt="img" />
                </div>
                <Link to={route.dashboard} className="login-logo logo-white">
                  <ImageWithBasePath src="assets/img/logo-white.png" alt="DreamsPOS" />
                </Link>

                {/* Header */}
                <div className="login-userheading">
                  <h3>Forgot password?</h3>
                  <h4>
                    If you forgot your password, we’ll email you instructions to reset it.
                  </h4>
                </div>

                {/* Email Input */}
                <div className="form-login">
                  <label>Email</label>
                  <div className="form-addons">
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <ImageWithBasePath src="assets/img/icons/mail.svg" alt="icon" />
                  </div>
                </div>

                {/* Success & Error Messages */}
                {message && <div className="alert alert-success mt-2">{message}</div>}
                {error && <div className="alert alert-danger mt-2">{error}</div>}

                {/* Submit Button */}
                <div className="form-login">
                  <button type="submit" className="btn btn-login" disabled={loading}>
                    {loading ? "Sending..." : "Send Reset Link"}
                  </button>
                </div>

                {/* Back to Sign In */}
                <div className="signinform text-center">
                  <h4>
                    Return to
                    <Link to={route.signin} className="hover-a">
                      {" "}login
                    </Link>
                  </h4>
                </div>

                {/* OR & Social Links */}
                <div className="form-setlogin or-text">
                  <h4>OR</h4>
                </div>

                <div className="form-sociallink">
                  <ul className="d-flex justify-content-center">
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

export default Forgotpassword;
