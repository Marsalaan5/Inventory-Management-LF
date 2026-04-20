


// import React, { useEffect, useState } from "react";
// import { Route, Routes } from "react-router-dom";
// import Header from "../InitialPage/Sidebar/Header";
// import Sidebar from "../InitialPage/Sidebar/Sidebar";
// import { pagesRoute, posRoutes, publicRoutes } from "./router.link";
// import { Outlet } from "react-router-dom";
// import { useSelector, useDispatch } from "react-redux";
// import ThemeSettings from "../InitialPage/themeSettings";
// import Loader from "../feature-module/loader/loader";
// import ProtectedRoute from './protectedroute.jsx';
// import { loginSuccess } from "../core/redux/slices/authSlice.js";
// import { fetchMenu } from "../core/redux/slices/menuSlice.js";

// const AllRoutes = () => {
//   const data = useSelector((state) => state.toggle_header);
//   const dispatch = useDispatch();
//   const { user } = useSelector(state => state.auth);
//   const { items } = useSelector(state => state.menu);
  
//   // Add loading state to prevent premature routing
//   const [isAuthChecked, setIsAuthChecked] = useState(false);

//   useEffect(() => {

//     const token = localStorage.getItem('token') || sessionStorage.getItem('token');
//     const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
//     const userId = localStorage.getItem('user_id') || sessionStorage.getItem('user_id');
    
//     console.log('Checking storage on app load...');
//     console.log('Token:', token ? 'Found' : 'Not found');
//     console.log('User:', userStr ? 'Found' : 'Not found');
//     console.log('User ID:', userId ? 'Found' : 'Not found');
    
//     if (token && userStr) {
//       try {
//         const user = JSON.parse(userStr);
        
//         // Restore Redux state
//         dispatch(loginSuccess({ user, token }));
        
//         console.log('Auth state restored from storage');
//       } catch (error) {
//         console.error('Failed to restore auth:', error);
        
//         // Clear corrupted data
//         localStorage.removeItem('token');
//         localStorage.removeItem('user');
//         localStorage.removeItem('user_id');
//         sessionStorage.removeItem('token');
//         sessionStorage.removeItem('user');
//         sessionStorage.removeItem('user_id');
//       }
//     } else {
//       console.log('No auth data found in storage');
//     }
    
//     // Mark auth check as complete
//     setIsAuthChecked(true);
//   }, [dispatch]);

//   useEffect(() => {
//     if (user && items.length === 0) {
//       dispatch(fetchMenu());
//     }
//   }, [user, items.length, dispatch]);

//   // Show loader while checking auth
//   if (!isAuthChecked) {
//     return <Loader />;
//   }

//   const HeaderLayout = () => (
//     <div className={`main-wrapper ${data ? "header-collapse" : ""}`}>
//       <Header />
//       <Sidebar />
//       <Outlet />
//       <ThemeSettings />
//       <Loader />
//     </div>
//   );

//   const Authpages = () => (
//     <div className={data ? "header-collapse" : ""}>
//       <Outlet />
//       <Loader />
//       <ThemeSettings />
//     </div>
//   );

//   const Pospages = () => (
//     <div>
//       <Header />
//       <Outlet />
//       <Loader />
//       <ThemeSettings />
//     </div>
//   );

//   return (
//     <div>
//       <Routes>
//         {/* POS Routes */}
//         <Route path="/pos" element={<Pospages />}>
//           {posRoutes.map((route, id) => (
//             <Route
//               key={id}
//               path={route.path}
//               element={<ProtectedRoute element={route.element} />}
//             />
//           ))}
//         </Route>

//         {/* Protected Routes */}
//         <Route path={"/"} element={<HeaderLayout />}>
//           {publicRoutes.map((route, id) => (
//             <Route
//               key={id}
//               path={route.path}
//               element={<ProtectedRoute element={route.element} />}
//             />
//           ))}
//         </Route>

//         {/* Auth Routes */}
//         <Route path={"/"} element={<Authpages />}>
//           {pagesRoute.map((route, id) => (
//             <Route path={route.path} element={route.element} key={id} />
//           ))}
//         </Route>
//       </Routes>
//     </div>
//   );
// };

// export default AllRoutes;



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
  const { items } = useSelector(state => state.menu);
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
  console.log("=== TOKEN/USER CHANGED ===");
  console.log("token:", token);
  console.log("user:", user);
  console.log("items:", items.length);
}, [token, user]);



   useEffect(() => {
    if (user?.id && token) {
      console.log('Fetching menu for user:', user.id, 'role:', user.role);
      dispatch(clearMenu());
      dispatch(fetchMenu());
    }
  }, [user?.id]);

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