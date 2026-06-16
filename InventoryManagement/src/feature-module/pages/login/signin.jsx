


import React, { useState } from "react";
import ImageWithBasePath from "../../../core/img/imagewithbasebath";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { all_routes } from "../../../Router/all_routes";
import AuthService from "../../../services/authService";
import { loginSuccess } from "../../../core/redux/slices/authSlice";
import { fetchMenu, clearMenu } from "../../../core/redux/slices/menuSlice";

const Signin = () => {
  const route = all_routes;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) return setError("Please enter both email and password");

    try {
      setLoading(true);
      const { data } = await AuthService.login({ email, password });

      const userData = {
        name: data.user.name,
        role: data.user.role,
        role_id: data.user.role_id,
        warehouse_id: data.user.warehouse_id,
        warehouse_name: data.user.warehouse_name,
        avatar: data.user.avatar,
        id: data.user.id,
        permissions: data.user.permissions || {},
      };

    
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("user_id", data.user.id.toString());
      localStorage.setItem("login-event", Date.now().toString());

 
      dispatch(clearMenu());


      dispatch(loginSuccess({ user: userData, token: data.token }));

     
      const menuResult = await dispatch(fetchMenu());
      console.log('=== LOGIN MENU FETCH ===');
      console.log('Status:', menuResult.meta.requestStatus);
      console.log('Payload length:', menuResult?.payload?.length);
      console.log('Payload:', menuResult?.payload);
      console.log('=== END ===');

 
      navigate(route.dashboard);

    } catch (err) {
      console.error('Login error:', err);
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="main-wrapper">
      <div className="account-content">
        <div className="login-wrapper bg-img">
          <div className="login-content">
            <form onSubmit={handleLogin}>
              <div className="login-userset">
                <div className="login-logo logo-normal">
                  <ImageWithBasePath src="assets/img/logo.png" alt="StockWise" />
                </div>

                <Link to={route.dashboard} className="login-logo logo-white">
                  <ImageWithBasePath src="assets/img/logo-white.png" alt="StockWise" />
                </Link>

                <div className="login-userheading">
                  <h3>Sign In</h3>
                  <h4>Access the StockWISE panel using your email and passcode.</h4>
                </div>

                <div className="form-login mb-3">
                  <label className="form-label">Email Address</label>
                  <div className="form-addons">
                    <input
                      type="email"
                      className="form-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <ImageWithBasePath src="assets/img/icons/mail.svg" alt="icon" />
                  </div>
                </div>

                {/* <div className="form-login mb-3">
                  <label className="form-label">Password</label>
                  <div className="pass-group">
                    <input
                      type="password"
                      className="pass-input form-control"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={loading}
                    />
                    <span className="fas toggle-password fa-eye-slash" />
                  </div>
                </div> */}
                <div className="form-login mb-3">
  <label className="form-label">Password</label>

  <div className="pass-group" style={{ position: "relative" }}>
    <input
      type={showPassword ? "text" : "password"}
      className="pass-input form-control"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
      disabled={loading}
    />

    <span
      className={`fas toggle-password ${
        showPassword ? "fa-eye" : "fa-eye-slash"
      }`}
      onClick={() => setShowPassword(!showPassword)}
      style={{
        position: "absolute",
        right: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        cursor: "pointer"
      }}
    />
  </div>
</div>


                <div className="form-login authentication-check">
                  <div className="row">
                    <div className="col-12 d-flex align-items-center justify-content-between">
                      <div className="custom-control custom-checkbox">
                        <label className="checkboxs ps-4 mb-0 pb-0 line-height-1">
                          <input
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRememberMe(e.target.checked)}
                            disabled={loading}
                          />
                          <span className="checkmarks" />
                          Remember me
                        </label>
                      </div>
                      <div className="text-end">
                        <Link className="forgot-link" to={route.forgotPassword}>
                          Forgot Password?
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="alert alert-danger mt-2" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {error}
                  </div>
                )}

                <div className="form-login">
                  <button
                    type="submit"
                    className="btn btn-login"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Signing In...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>
                </div>

                <div className="signinform">
                  <h4>
                    New on our platform?
                    <Link to={route.register} className="hover-a">
                      {" "}
                      Create an account
                    </Link>
                  </h4>
                </div>

                {/* <div className="form-setlogin or-text">
                  <h4>OR</h4>
                </div> */}

                {/* <div className="form-sociallink">
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
                </div> */}

                <div className="my-4 d-flex justify-content-center align-items-center copyright-text">
                  <p>Copyright © 2025 InventoryManagement Livefibre. All rights reserved</p>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signin;

