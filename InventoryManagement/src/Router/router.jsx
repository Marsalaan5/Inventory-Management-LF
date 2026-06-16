

import React, { useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import Header from "../InitialPage/Sidebar/Header";
import Sidebar from "../InitialPage/Sidebar/Sidebar";
import { pagesRoute, posRoutes, publicRoutes } from "./router.link";
import { Outlet } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import ThemeSettings from "../InitialPage/themeSettings";
import Loader from "../feature-module/loader/loader";
import ProtectedRoute from './protectedroute.jsx';
import { loginSuccess } from "../core/redux/slices/authSlice.js";
import { fetchMenu, clearMenu } from "../core/redux/slices/menuSlice.js"; 

const AllRoutes = () => {
  const data = useSelector((state) => state.toggle_header);
  const dispatch = useDispatch();
  const { user, token } = useSelector(state => state.auth); 

  const [isAuthChecked, setIsAuthChecked] = useState(false);


  useEffect(() => {
    const storedToken = localStorage.getItem('token') || sessionStorage.getItem('token');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');

    if (storedToken && userStr) {
      try {
        const storedUser = JSON.parse(userStr);
        dispatch(loginSuccess({ user: storedUser, token: storedToken }));
      } catch (error) {
        console.error('Failed to restore auth:', error);
        localStorage.clear();
        sessionStorage.clear();
      }
    }
    setIsAuthChecked(true);
  }, [dispatch]); 





   useEffect(() => {
    if (user?.id && token) {

      dispatch(clearMenu());
      dispatch(fetchMenu());
    }
  }, [user?.id,token,dispatch]);

  if (!isAuthChecked) {
    return <Loader />;
  }

  const HeaderLayout = () => (
    <div className={`main-wrapper ${data ? "header-collapse" : ""}`}>
      <Header />
      <Sidebar />
      <Outlet />
      <ThemeSettings />
      <Loader />
    </div>
  );

  const Authpages = () => (
    <div className={data ? "header-collapse" : ""}>
      <Outlet />
      <Loader />
      <ThemeSettings />
    </div>
  );

  const Pospages = () => (
    <div>
      <Header />
      <Outlet />
      <Loader />
      <ThemeSettings />
    </div>
  );

  return (
    <div>
      <Routes>
        <Route path="/pos" element={<Pospages />}>
          {posRoutes.map((route, id) => (
            <Route key={id} path={route.path} element={<ProtectedRoute element={route.element} />} />
          ))}
        </Route>
        <Route path={"/"} element={<HeaderLayout />}>
          {publicRoutes.map((route, id) => (
            <Route key={id} path={route.path} element={<ProtectedRoute element={route.element} />} />
          ))}
        </Route>
        <Route path={"/"} element={<Authpages />}>
          {pagesRoute.map((route, id) => (
            <Route path={route.path} element={route.element} key={id} />
          ))}
        </Route>
      </Routes>
    </div>
  );
};

export default AllRoutes;