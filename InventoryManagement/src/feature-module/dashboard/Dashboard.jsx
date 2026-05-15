
//Hidden items dashboard - Start
 
// import React, { useState, useEffect } from "react";
// import CountUp from "react-countup";
// import {
//   // Activity,
//   // Clock,
//   TrendingUp,
//   // Package,
//   UserCheck,
//   // RefreshCw,
//   Tag,
//   Layers,
//   Users,
//   Shield,
//   UserX,
//   AlertTriangle,
//   // XCircle,
//   // AlertCircle,
// } from "feather-icons-react/build/IconComponents";
// import { Warehouse } from "lucide-react";
// import Chart from "react-apexcharts";
// // import { Link } from "react-router-dom";
// import AuthService from "../../services/authService";
// import Swal from "sweetalert2";
// import { useSelector } from "react-redux";

// const Dashboard = () => {

//   const user = useSelector((state) => state.auth.user);


//   const [dashboardData, setDashboardData] = useState({
//     users: { total: 0, active: 0, inactive: 0 },
//     roles: { total: 0 },
//     warehouses: { total: 0, details: [] },
//     articles: {total : 0 },
//     // products: { total: 0},
//     products: { total: 0 ,totalQuantity: 0  },
    
//     stocks: { total: 0, low: 0, outOfStock: 0, threshold: 10 },
//     lowStockProducts: [],
//     outOfStockProducts: [],
//     stockByStatus: [],
//     lowStockTrend: [],
//   });
// // const [chartData, setChartData] = useState({
// //   stockFlowMovement: [],
// //   lowStockTrend: [],
// //   lowStockTrendWarehouses: []
// // });
//   // const [activities, setActivities] = useState([]);
//   // const [stockFlowStats, setStockFlowStats] = useState({
//   //   total: 0,
//   //   approved: 0,
//   //   in_transit: 0,
//   //   delivered: 0,
//   //   total_quantity: 0
//   // });
//   const [loading, setLoading] = useState(true);

//   const fetchDashboardData = async () => {
//     try {
//       const response = await AuthService.getDashboard();
//       const data = response.data.data;

//       setDashboardData({
//         users: data.users || { total: 0, active: 0, inactive: 0 },
//         roles: { total: data.roles || 0 },
//         warehouses: data.warehouses || { total: 0, details: [] },
//         articles: data.articles || { total: 0 },
//         // products: data.products || { total: 0},
//         products: data.products || { total: 0,totalQuantity: 0 },
//         stocks: data.stocks || { total: 0, low: 0, outOfStock: 0, threshold: 10 },
//         lowStockProducts: data.lowStockProducts || [],
//         outOfStockProducts: data.outOfStockProducts || [],
//         stockByStatus: data.stockByStatus || [],
//         lowStockTrend: data.lowStockTrend || [],
//       });
//       //   if (data.charts) {
//         //   setChartData({
//           //     stockFlowMovement: data.charts.stockFlowMovement || [],
//           //     lowStockTrend: data.charts.lowStockTrend || [],
//           //     lowStockTrendWarehouses: data.charts.lowStockTrendWarehouses || []
//           //   });
//           // }
//         } catch (error) {
//           console.error('Error fetching dashboard data:', error);
//           Swal.fire({
//             icon: 'error',
//             title: 'Error',
//             text: error.response?.data?.message || 'Failed to load dashboard data.',
//             confirmButtonText: 'OK'
//           });
//         }
//       };
      
//       console.log("lowstockkkkkkkkkkkkkkkkkkkk",dashboardData)


// //   const fetchActivities = async () => {
// //   try {
// //     const response = await AuthService.getActivities({ limit: 5 });
// //     if (response.data.success) {
// //       console.log('Fetched activities:', response.data.data);
// //       setActivities(response.data.data || []);
// //     }
// //   } catch (error) {
// //     console.error('Error fetching activities:', error);
// //   }
// // };


//   // const fetchStockFlowStats = async () => {
//   //   try {
//   //     const response = await AuthService.getStockFlowStats();
//   //     if (response.data.success) {
//   //       setStockFlowStats(response.data.data || {
//   //         total: 0,
//   //         approved: 0,
//   //         in_transit: 0,
//   //         delivered: 0,
//   //         total_quantity: 0
//   //       });
//   //     }
//   //   } catch (error) {
//   //     console.error('Error fetching stock flow stats:', error);
//   //   }
//   // };

//   useEffect(() => {
//   // Fix scroll issue when navigating to dashboard
//   window.scrollTo(0, 0);
//   document.body.style.overflow = 'auto';
  
//   return () => {
//     document.body.style.overflow = 'auto';
//   };
// }, []);

//   useEffect(() => {
//     const fetchAllData = async () => {
//       setLoading(true);
//       await Promise.all([
//         fetchDashboardData(),
//         // fetchActivities(),
//         // fetchStockFlowStats()
//       ]);
//       setLoading(false);
//     };
//     fetchAllData();
//   }, []);


//   // const formatActivityTime = (createdAt) => {
//   //   const now = new Date();
//   //   const activityDate = new Date(createdAt);
//   //   const diffMs = now - activityDate;
//   //   const diffMins = Math.floor(diffMs / 60000);
    
//   //   if (diffMins < 1) return 'Just now';
//   //   if (diffMins < 60) return `${diffMins} min ago`;
    
//   //   const diffHours = Math.floor(diffMins / 60);
//   //   if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
//   //   const diffDays = Math.floor(diffHours / 24);
//   //   return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
//   // };

//   // const getActivityBadgeClass = (action) => {
//   //   const actionLower = (action || '').toLowerCase();
//   //   const actionMap = {
//   //     'create': 'badge-linesuccess',
//   //     'created': 'badge-linesuccess',
//   //     'update': 'badge-linewarning',
//   //     'updated': 'badge-linewarning',
//   //     'delete': 'badge-linedanger',
//   //     'deleted': 'badge-linedanger',
//   //     'inbound': 'badge-linesuccess',
//   //     'outbound': 'badge-lineprimary',
//   //     'transfer': 'badge-linewarning',
//   //     'approved': 'badge-linesuccess',
//   //     'in-transit': 'badge-linewarning',
//   //     'delivered': 'badge-linesuccess'
//   //   };
//   //   return actionMap[actionLower] || 'badge-secondary';
//   // };

//   // const formatLabel = (value) => {
//   //   if (!value) return '';
//   //   return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
//   // };

  
//   const today = new Date();


//   const last30Days = [];
//   for (let i = 29; i >= 0; i--) {
//     const d = new Date();
//     d.setDate(today.getDate() - i);
//     last30Days.push(new Date(d));
//   }


//   // const monthData = last30Days.map(date => {
//   //   const dayData = dashboardData.lowStockTrend.find(item =>
//   //     new Date(item.date).toDateString() === date.toDateString()
//   //   );
//   //   return {
//   //     date,
//   //     count: dayData ? dayData.count : 0
//   //   };
//   // });


// //   const stockMovementChart = {
// //   series: [
// //     {
// //       name: "Approved",
// //       data: chartData.stockFlowMovement.map(d => d.approved || 0),
// //     },
// //     {
// //       name: "In Transit",
// //       data: chartData.stockFlowMovement.map(d => d['in-transit'] || 0),
// //     },
// //     {
// //       name: "Delivered",
// //       data: chartData.stockFlowMovement.map(d => d.delivered || 0),
// //     },
// //   ],
// //   colors: ["#3B82F6", "#F59E0B", "#22C55E"],
// //   chart: {
// //     type: "line",
// //     height: 320,
// //     zoom: { enabled: true },
// //     toolbar: { show: true },
// //   },
// //   dataLabels: { enabled: false },
// //   stroke: { curve: 'smooth', width: 3 },
// //   grid: { borderColor: '#e2e8f0' },
// //   xaxis: {
// //     categories: chartData.stockFlowMovement.map(d =>
// //       new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
// //     ),
// //   },
// //   legend: { position: 'top', horizontalAlign: 'right' },
// //   tooltip: { 
// //     shared: true, 
// //     intersect: false,
// //     y: {
// //       formatter: (val) => val + " units"
// //     }
// //   },
// // };

//   // Warehouse Distribution Chart
//   const warehouseChart = {
//     series: [{
//       name: "Product Units",
//       data: dashboardData.warehouses.details.map(wh => wh.stock),
//     }],
//     colors: ["#8b5cf6"],
//     chart: { type: "bar", height: 320, toolbar: { show: true } },
//     plotOptions: {
//       bar: { horizontal: false, columnWidth: "55%", borderRadius: 8 },
//     },
//     dataLabels: { enabled: false },
//     stroke: { show: true, width: 2, colors: ["transparent"] },
//     xaxis: {
//       categories: dashboardData.warehouses.details.map(wh => wh.name),
//     },
//     fill: { opacity: 1 },
//     tooltip: {
//       y: { formatter: (val) => val + " units" },
//     },
//     grid: { borderColor: '#e2e8f0' },
//   };

//   // Product Category Distribution
//   // const categoryChart = {
//   //   series: dashboardData.warehouses.details.map(wh => wh.products),
//   //   chart: { type: 'donut', height: 320 },
//   //   labels: dashboardData.warehouses.details.map(wh => wh.name),
//   //   colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'],
//   //   legend: { position: 'bottom' },

//   //   plotOptions: {
//   //     pie: {
//   //       donut: {
//   //         size: '65%',
//   //         labels: {
//   //           show: true,
//   //           total: {
//   //             show: true,
//   //             label: 'Total Products',
//   //             formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0),
//   //           },
//   //         },
//   //       },
//   //     },
//   //   },
//   //   dataLabels: { enabled: false },
//   // };

// //   const lowStockChart = {
// //   series: chartData.lowStockTrendWarehouses.map(warehouse => ({
// //     name: warehouse,
// //     data: chartData.lowStockTrend.map(d => d[warehouse] || 0)
// //   })),
// //   colors: ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"], 
// //   chart: { 
// //     type: "bar", 
// //     height: 320, 
// //     toolbar: { show: true },
// //     stacked: true 
// //   },
// //   plotOptions: {
// //     bar: { 
// //       horizontal: false, 
// //       columnWidth: "55%",
// //       borderRadius: 5
// //     },
// //   },
// //   dataLabels: { enabled: false },
// //   stroke: { show: true, width: 2, colors: ["transparent"] },
// //   xaxis: {
// //     categories: chartData.lowStockTrend.map(d =>
// //       new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
// //     ),
// //   },
// //   legend: { 
// //     position: 'top',
// //     horizontalAlign: 'right'
// //   },
// //   tooltip: {
// //     shared: true,
// //     intersect: false,
// //     y: {
// //       formatter: (val) => val + " products"
// //     }
// //   },
// //   grid: { borderColor: '#e2e8f0' },
// // };

//   // Stock Status Pie Chart
//   // const stockStatusChart = {
//   //   series: dashboardData.stockByStatus.map(item => item.count),
//   //   chart: { type: 'pie', height: 320 },
//   //   labels: dashboardData.stockByStatus.map(item => formatLabel(item.status)),
//   //   colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
//   //   legend: { position: 'bottom' },
//   //   dataLabels: { enabled: true },
//   // };

//   if (loading) {
//     return (
//       <div className="page-wrapper">
//         <div className="content">
//           <div className="text-center p-5">
//             <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
//               <span className="visually-hidden">Loading...</span>
//             </div>
//             <p className="mt-3">Loading dashboard...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }
// //
//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="page-header mb-3">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               {/* <h4>Dashboard</h4>
//               <h6>Real-time Management Overview</h6> */}
//                {user?.warehouse_name ? (
//                   <>
//                     <h4>{user.warehouse_name} Dashboard</h4>
//                     <h6>Real-time Management Overview</h6>
//                   </>
//                 ) : (
//                   <>
//                     <h4>Dashboard</h4>
//                     <h6>Real-time Management Overview</h6>
//                   </>
//                 )}
//             </div>
//           </div>


//         {/* Gradient Header Style */}
//            {/* <div className="content"> */}
//         {/* <div className="dashboard-header">
//           <div className="dashboard-header-content">
//             <div className="d-flex align-items-center">
//               {user?.warehouse_name && (
//                 <div className="warehouse-icon-wrapper">
//                   <Warehouse size={18} />
//                 </div>
//               )}
//               <div className="flex-grow-1">
//                 {user?.warehouse_name ? (
//                   <>
//                     <h4>Welcome {user.warehouse_name}</h4>
//                     <h6>Real-time Management Overview</h6>
//                   </>
//                 ) : (
//                   <>
//                     <h4>Dashboard</h4>
//                     <h6>Real-time Management Overview</h6>
//                   </>
//                 )}
//               </div>
//               {user?.role && (
//                 <div className="dashboard-warehouse-badge">
//                   <span>{user.role}</span>
//                 </div>
//               )}
//             </div> */}
//           {/* <div className="page-btn">
//             <button 
//               className="btn btn-primary"
//               onClick={() => {
//                 fetchDashboardData();
//                 // fetchActivities();
//                 // fetchStockFlowStats();
//               }}
//               disabled={loading}
//             >
//               <RefreshCw size={16} className="me-2" />
//               Refresh
//             </button>
//           </div> */}
//         </div>

//         {/* User & System Stats Row */}
//         <div className="row">
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-widget w-100">
//               <div className="dash-imgs">
//                 <Users size={24} color="#ff9f43" />
//               </div>
//               <div className="dash-widgetcontent">
//                 <h5><CountUp start={0} end={dashboardData.users.total} duration={2} /></h5>
//                 <h6>Total Users</h6>
//               </div>
//             </div>
//           </div>

//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-widget dash1 w-100">
//               <div className="dash-imgs">
//                 <UserCheck size={24} color="#22c55e" /> 
//               </div>
//               <div className="dash-widgetcontent">
//                 <h5><CountUp start={0} end={dashboardData.users.active} duration={2} /></h5>
//                 <h6>Active Users</h6>
//               </div>
//             </div>
//           </div>

//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-widget dash2 w-100">
//               <div className="dash-imgs">
//                 <UserX size={24} color="#ef4444" /> 
//               </div>
//               <div className="dash-widgetcontent">
//                 <h5><CountUp start={0} end={dashboardData.users.inactive} duration={2} /></h5>
//                 <h6>Inactive Users</h6>
//               </div>
//             </div>
//           </div>

//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-widget dash3 w-100">
//               <div className="dash-imgs">
//                 <Shield size={24} color="#1b2850" />
//               </div>
//               <div className="dash-widgetcontent">
//                 <h5><CountUp start={0} end={dashboardData.roles.total} duration={2} /></h5>
//                 <h6>All Roles</h6>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Warehouse & Stock Stats Row */}
//         <div className="row">
//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-count">
//               <div className="dash-counts">
//                 <h4>{dashboardData.warehouses.total}</h4>
//                 <h5>Total Warehouses</h5>
//               </div>
//               <div className="dash-imgs">
//                 <Warehouse />
//               </div>
//             </div>
//           </div>

//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-count das1">
//               <div className="dash-counts">
//                 <h4>{dashboardData.articles.total}</h4>
//                 <h5>Total Articles</h5>
//               </div>
//               <div className="dash-imgs">
//                 <Tag />
//               </div>
//             </div>
//           </div>


//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-count das2">
//               <div className="dash-counts">
//                 <h4>{dashboardData.products.total}</h4>
//                 <h5>Total Products</h5>
//               </div>
//               <div className="dash-imgs">
//                 <Layers />
//               </div>
//             </div>
//           </div>

//           {/* <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-count das2">
//               <div className="dash-counts">
//                 <h4>{dashboardData.stocks.total}</h4>
//                 <h5>Total Stock Units</h5>
//               </div>
//               <div className="dash-imgs">
//                 <Layers />
//               </div>
//             </div>
//           </div> */}

//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-count das3">
//               <div className="dash-counts">
//                 <h4>{dashboardData.stocks.low}</h4>
//                 <h5>Total Articles Shortage</h5>
//               </div>
//               <div className="dash-imgs">
//                 <AlertTriangle color="#f59e0b" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stock Alert Cards Row */}
//         {/* <div className="row">
//           <div className="col-xl-8 col-12">
//             <div className="card">
//               <div className="card-header bg-warning bg-opacity-10 border-warning">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <h5 className="card-title mb-0 text-warning">
//                     <AlertTriangle size={20} className="me-2" />
//                     Low Stock Alert ({dashboardData.stocks.low})
//                   </h5>
//                   <Link to="/inventory/low-stocks" className="btn btn-sm btn-warning">
//                     View All
//                   </Link>
//                 </div>
//               </div>
//               <div className="card-body">
//                 {dashboardData.lowStockProducts.length === 0 ? (
//                   <div className="text-center py-4">
//                     <AlertCircle size={48} className="text-muted mb-2" />
//                     <p className="text-muted">No low stock items</p>
//                   </div>
//                 ) : (
//                   <div className="table-responsive">
//                     <table className="table table-sm">
//                       <thead>
//                         <tr>
//                           <th>Product</th>
//                           <th>Warehouse</th>
//                           <th>Qty</th>
//                           <th>Status</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {dashboardData.lowStockProducts.map(product => (
//                           <tr key={product.id}>
//                             <td>
//                               <div>
//                                 <strong>{product.title}</strong>
//                                 <br />
//                                 <small className="text-muted">{product.barcode}</small>
//                               </div>
//                             </td>
//                             <td>{product.warehouse_name}</td>
//                             <td>
//                               <span className="badge badge-warning">{product.count}</span>
//                             </td>
//                             <td>
//                               <span className={`badge badge-${
//                                 product.status === 'new' ? 'success' :
//                                 product.status === 'used' ? 'info' :
//                                 product.status === 'broken' ? 'danger' : 'secondary'
//                               }`}>
//                                 {product.status}
//                               </span>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="col-xl-4 col-12">
//             <div className="card">
//               <div className="card-header bg-danger bg-opacity-10 border-danger">
//                 <div className="d-flex justify-content-between align-items-center">
//                   <h5 className="card-title mb-0 text-danger">
//                     <XCircle size={20} className="me-2" />
//                     Out of Stock ({dashboardData.stocks.outOfStock})
//                   </h5>
//                   <Link to="/inventory/low-stocks" className="btn btn-sm btn-danger">
//                     View All
//                   </Link>
//                 </div>
//               </div>
//               <div className="card-body">
//                 {dashboardData.outOfStockProducts.length === 0 ? (
//                   <div className="text-center py-4">
//                     <Package size={48} className="text-muted mb-2" />
//                     <p className="text-muted">No out of stock items</p>
//                   </div>
//                 ) : (
//                   <div className="table-responsive">
//                     <table className="table table-sm">
//                       <thead>
//                         <tr>
//                           <th>Product</th>
//                           <th>Warehouse</th>
//                           <th>Last Updated</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {dashboardData.outOfStockProducts.map(product => (
//                           <tr key={product.id}>
//                             <td>
//                               <div>
//                                 <strong>{product.title}</strong>
//                                 <br />
//                                 <small className="text-muted">{product.barcode}</small>
//                               </div>
//                             </td>
//                             <td>{product.warehouse_name}</td>
//                             <td>
//                               <small>
//                                 {new Date(product.updated_at).toLocaleDateString()}
//                               </small>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div> */}

//         {/* Warehouse Details Cards */}
// {/*        
// <div className="row">
//   {dashboardData.warehouses.details.length > 0 ? (
//     dashboardData.warehouses.details.map((wh) => (
//       <div key={wh.id} className="col-xl-3 col-sm-6 col-12 d-flex">
//         <div className="warehouse-card w-100">
//           <div className="warehouse-card-body">
//             <div className="warehouse-header">
//               <h4>{wh.name}</h4>
//               {(wh.lowStock > 0 || wh.outOfStock > 0) && (
//                 <AlertTriangle size={16} className="alert-icon" />
//               )}
//             </div>
//             <div className="warehouse-stats">
//               <div className="stat-row">
//                 <span className="stat-label">Products</span>
//                 <span className="stat-value">{wh.products}</span>
//               </div>
//               <div className="stat-row">
//                 <span className="stat-label">Stock Units</span>
//                 <span className="stat-value">
//                   {wh.stock.toLocaleString()}
//                 </span>
//               </div>
//               <div className="stat-row">
//                 <span className="stat-label">Low Stock</span>
//                 <span className="stat-value low-stock">
//                   {wh.lowStock}
//                 </span>
//               </div>
//               <div className="stat-row">
//                 <span className="stat-label">Out of Stock</span>
//                 <span className="stat-value out-of-stock">
//                   {wh.outOfStock}
//                 </span>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>
//     ))
//   ) : (
//     <div className="col-12">
//       <div className="alert-info-custom">
//         <p>No warehouse data available. Add warehouses and products to see statistics.</p>
//       </div>
//     </div>
//   )}
// </div> */}


// {/* <div className="warehouse-cards-wrapper">
//   <div className="row">
//     {dashboardData.warehouses.details.length > 0 ? (
//       dashboardData.warehouses.details.map((wh) => (
//         <div key={wh.id} className="col-xl-3 col-sm-6 col-12 d-flex">
//           <div className="warehouse-card w-100">
//             <div className="warehouse-card-body">
//               <div className="warehouse-header">
//                 <h4>{wh.name}</h4>
//                 {(wh.lowStock > 0 || wh.outOfStock > 0) && (
//                   <AlertTriangle size={16} className="alert-icon" />
//                 )}
//               </div>
//               <div className="warehouse-stats">
//                 <div className="stat-row">
//                   <span className="stat-label">Articles</span>
//                   <span className="stat-value">{wh.articles}</span>
//                 </div>
//                 <div className="stat-row">
//                   <span className="stat-label">Products</span>
//                   <span className="stat-value">{wh.products.total}</span>
//                 </div>
//                 <div className="stat-row">
//                   <span className="stat-label">Stock Units</span>
//                   <span className="stat-value">{wh.stock.toLocaleString()}</span>
//                 </div>
//                 <div className="stat-row">
//                   <span className="stat-label">Low Stock</span>
//                   <span className="stat-value low-stock">{wh.lowStock}</span>
//                 </div>
//                 <div className="stat-row">
//                   <span className="stat-label">Out of Stock</span>
//                   <span className="stat-value out-of-stock">{wh.outOfStock}</span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       ))
//     ) : (
//       <div className="col-12">
//         <div className="alert-info-custom">
//           <p>No warehouse data available. Add warehouses and products to see statistics.</p>
//         </div>
//       </div>
//     )}
//   </div>
// </div> */}


// <div className="warehouse-cards-wrapper">
//   <div className="row">
//     {dashboardData.warehouses.details.length > 0 ? (
//       dashboardData.warehouses.details.map((wh) => (
//         <div key={wh.id} className="col-xl-3 col-sm-6 col-12 d-flex">
//           <div className="warehouse-card w-100">
//             <div className="warehouse-card-body">
//               <div className="warehouse-header">
//                 <h4>{wh.name}</h4>
//                 {(wh.lowStock > 0 || wh.outOfStock > 0) && (
//                   <AlertTriangle size={16} className="alert-icon" />
//                 )}
//               </div>
//               <div className="warehouse-stats">
//                 <div className="stat-row">
//                   <span className="stat-label">Article Profiles</span>
//                   <span className="stat-value">{wh.articles || 0}</span>
//                 </div>
//                 <div className="stat-row">
//                   <span className="stat-label">Total Products</span>
//                   <span className="stat-value">{wh.products || 0}</span>
//                 </div>
//                 <div className="stat-row">
//                   <span className="stat-label">Low Stock Articles</span>
//                   <span className="stat-value low-stock">{wh.lowStock || 0}</span>
//                 </div>
//                 {/* <div className="stat-row">
//                   <span className="stat-label">Out of Stock</span>
//                   <span className="stat-value out-of-stock">{wh.outOfStock || 0}</span>
//                 </div> */}
//               </div>
//             </div>
//           </div>
//         </div>
//       ))
//     ) : (
//       <div className="col-12">
//         <div className="alert-info-custom">
//           <p>No warehouse data available. Add warehouses and products to see statistics.</p>
//         </div>
//       </div>
//     )}
//   </div>
// </div>



//         {/* Charts Section */}
//         <div className="row">
//           {/* <div className="col-xl-6 col-sm-12 col-12 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header d-flex justify-content-between align-items-center">
//                 <h5 className="card-title mb-0">Stock Flow Movement</h5>
//                 <div className="d-flex gap-2">
//                   <span className="badge bg-warning">{stockFlowStats.in_transit} In Transit</span>
//                   <span className="badge bg-success">{stockFlowStats.delivered} Delivered</span>
//                 </div>
//               </div>
//               <div className="card-body">
//                 <Chart
//                   options={stockMovementChart}
//                   series={stockMovementChart.series}
//                   type="line"
//                   height={320}
//                 />
//               </div>
//             </div>
//           </div> */}

//           <div className="col-xl-6 col-sm-12 col-12 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header d-flex justify-content-between align-items-center">
//                 <h5 className="card-title mb-0">Warehouse Stock Distribution</h5>
//                 <TrendingUp size={20} className="text-success" />
//               </div>
//               <div className="card-body">
//                 {dashboardData.warehouses.details.length > 0 ? (
//                   <Chart
//                     options={warehouseChart}
//                     series={warehouseChart.series}
//                     type="bar"
//                     height={320}
//                   />
//                 ) : (
//                   <div className="text-center p-5">
//                     <p>No warehouse data available</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>


//              {/* <div className="col-xl-6 col-sm-12 col-12 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header d-flex justify-content-between align-items-center">
//                 <h5 className="card-title mb-0">Product Distribution by Warehouse</h5>
//                 <Package size={20} className="text-primary" />
//               </div>
//               <div className="card-body">
//                 {dashboardData.warehouses.details.length > 0 ? (
//                   <Chart
//                     options={categoryChart}
//                     series={categoryChart.series}
//                     type="donut"
//                     height={320}
//                   />
//                 ) : (
//                   <div className="text-center p-5">
//                     <p>No product data available</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div> */}
//         </div>

//         {/* <div className="row">
//           <div className="col-xl-6 col-sm-12 col-12 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header d-flex justify-content-between align-items-center">
//                 <h5 className="card-title mb-0">Product Distribution by Warehouse</h5>
//                 <Package size={20} className="text-primary" />
//               </div>
//               <div className="card-body">
//                 {dashboardData.warehouses.details.length > 0 ? (
//                   <Chart
//                     options={categoryChart}
//                     series={categoryChart.series}
//                     type="donut"
//                     height={320}
//                   />
//                 ) : (
//                   <div className="text-center p-5">
//                     <p>No product data available</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>

//           <div className="col-xl-6 col-sm-12 col-12 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header d-flex justify-content-between align-items-center">
//                 <h5 className="card-title mb-0">Low Stock Alert Trend (Last 30 Days)</h5>
//                 <span className="badge bg-danger">
//                   {dashboardData.stocks.low} Critical
//                 </span>
//               </div>
//               <div className="card-body">
//                 {dashboardData.lowStockTrend.length > 0 ? (
//                   <Chart
//                     options={lowStockChart}
//                     series={lowStockChart.series}
//                     type="area"
//                     height={320}
//                   />
//                 ) : (
//                   <div className="text-center p-5">
//                     <p>No trend data available</p>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div> */}

//         {/* Stock Status & Activity */}
//         <div className="row">
//           {/* {dashboardData.stockByStatus.length > 0 && (
//             <div className="col-xl-4 col-sm-8 col-8 d-flex">
//               <div className="card flex-fill">
//                 <div className="card-header">
//                   <h5 className="card-title mb-0">Stock by Status</h5>
//                 </div>
//                 <div className="card-body">
//                   <Chart
//                     options={stockStatusChart}
//                     series={stockStatusChart.series}
//                     type="pie"
//                     height={320}
//                   />
//                 </div>
//               </div>
//             </div>
//           )} */}
// {/* 
//           <div className={`col-xl-${dashboardData.stockByStatus.length > 0 ? '8' : '12'} col-sm-12 col-12 d-flex`}>
//             <div className="card flex-fill">
//               <div className="card-header d-flex justify-content-between align-items-center">
//                 <h4 className="card-title mb-0">
//                   <Activity size={20} className="me-2" style={{ display: 'inline' }} />
//                   Live Activity
//                 </h4>
//                 <div className="d-flex align-items-center gap-2">
//                   <span className="badge bg-success">
//                     <span className="pulse-dot"></span>
//                     Live
//                   </span> */}
//                   {/* <Link to="/activities" className="btn btn-sm btn-light">View All</Link> */}
//                 {/* </div>
//               </div>
//               <div className="card-body">
//                 {activities.length === 0 ? (
//                   <div className="text-center py-4">
//                     <Activity size={48} className="text-muted mb-2" />
//                     <p className="text-muted">No recent activities</p>
//                   </div>
//                 ) : (
//                   <div className="table-responsive">
//                     <table className="table table-hover">
//                       <thead>
//                         <tr>
//                           <th>Action</th>
//                           <th>Description</th>
//                           <th>Performed By</th>
//                           <th>Time</th>
//                         </tr>
//                       </thead>
//                       <tbody>
//                         {activities.map(activity => (
//                           <tr key={activity.id}>
//                             <td>
//                               <span className={`badge ${getActivityBadgeClass(activity.action)}`}>
//                                 {formatLabel(activity.action)}
//                               </span>
//                             </td>
//                             <td>
//                               <strong>{activity.entity_name || 'N/A'}</strong>
//                               <br />
//                               <small className="text-muted">{activity.description}</small>
//                             </td>
//                             <td>
//                               <small>{activity.user_name}</small>
//                             </td>
//                             <td>
//                               <Clock size={14} className="me-1" />
//                               <small>{formatActivityTime(activity.created_at)}</small>
//                             </td>
//                           </tr>
//                         ))}
//                       </tbody>
//                     </table>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div> */}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

// //Hidden items dashboard - End



// //Main current main  -  14-05-26
// import React, { useState, useEffect, useMemo } from "react";
// import CountUp from "react-countup";
// import {
//   TrendingUp, Package, UserCheck, Tag, Layers,
//   Users, Shield, UserX, AlertTriangle, PlusCircle,
//    Upload,
//    Camera,
// } from "feather-icons-react/build/IconComponents";
// import { Warehouse } from "lucide-react";
// import Chart from "react-apexcharts";
// import AuthService from "../../services/authService";
// import Swal from "sweetalert2";
// import { useSelector, useDispatch } from "react-redux";
// import { useNavigate } from "react-router-dom";
// import {
//   fetchStockFlowStats,
//   fetchStockFlowMovement,
//   fetchStockFlowWarehouseDist,
//   selectFlowStats,
//   selectFlowMovement,
//   // selectFlowWarehouseDist,
//   selectFlowMovementLoading,
//   selectFlowWarehouseDistLoading,
// } from "../../core/redux/slices/stockSlice";

// // ─── helpers ────────────────────────────────────────────────────────────────


// const MOVEMENT_RANGES = [
//   { label: "1D", days: 1 },
//   { label: "1W", days: 7 },
//   { label: "1M", days: 30 },
// ];

// const formatLabel = (v) =>
//   v ? v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, " ") : "";

// // ─── Dashboard ───────────────────────────────────────────────────────────────

// const Dashboard = () => {
//   const dispatch  = useDispatch();
//   const navigate  = useNavigate();
//   const user      = useSelector((state) => state.auth.user);

//   // ── Redux chart/stats ──────────────────────────────────────────────────────
//   const flowStats     = useSelector(selectFlowStats);
//   const movementData  = useSelector(selectFlowMovement);
//   // const warehouseDist = useSelector(selectFlowWarehouseDist);
//   const movLoading    = useSelector(selectFlowMovementLoading);
//   const distLoading   = useSelector(selectFlowWarehouseDistLoading);

//   // ── Local state ────────────────────────────────────────────────────────────
//   const [dashboardData, setDashboardData] = useState({
//     users:         { total: 0, active: 0, inactive: 0 },
//     roles:         { total: 0 },
//     warehouses:    { total: 0, details: [] },
//     articles:      { total: 0 },
//     products:      { total: 0, totalQuantity: 0 },
//     stocks:        { total: 0, low: 0, outOfStock: 0, threshold: 10 },
//     stockByStatus: [],
//   });
//   const [loading,       setLoading]       = useState(true);
//   const [movementRange, setMovementRange] = useState(30);  

// console.log("CONSOLEEEEEE",dashboardData.warehouses.details);
// //   const testData = [
// //   ...dashboardData.warehouses.details,
// //   ...dashboardData.warehouses.details,
// //   ...dashboardData.warehouses.details,
// // ];

//   // ── Fetch dashboard ────────────────────────────────────────────────────────
//   const fetchDashboardData = async () => {
//     try {
//       const { data } = await AuthService.getDashboard();
//       const d = data.data;
//       setDashboardData({
//         users:         d.users         || { total: 0, active: 0, inactive: 0 },
//         roles:         { total: d.roles || 0 },
//         warehouses:    d.warehouses    || { total: 0, details: [] },
//         articles:      d.articles      || { total: 0 },
//         products:      d.products      || { total: 0, totalQuantity: 0 },
//         stocks:        d.stocks        || { total: 0, low: 0, outOfStock: 0, threshold: 10 },
//         stockByStatus: d.stockByStatus || [],
//       });
//     } catch (err) {
//       Swal.fire({
//         icon: "error", title: "Error",
//         text: err.response?.data?.message || "Failed to load dashboard data.",
//         confirmButtonText: "OK",
//       });
//     }
//   };


//   useEffect(() => {
//     window.scrollTo(0, 0);
//     document.body.style.overflow = "auto";
//     return () => { document.body.style.overflow = "auto"; };
//   }, []);

//   useEffect(() => {
//     const load = async () => {
//       setLoading(true);
//       await Promise.all([
//         fetchDashboardData(),
//         dispatch(fetchStockFlowStats()),
//         dispatch(fetchStockFlowMovement(30)),
//         dispatch(fetchStockFlowWarehouseDist()),
//       ]);
//       setLoading(false);
//     };
//     load();
//     // eslint-disable-next-line
//   }, []);


//   useEffect(() => {
//     dispatch(fetchStockFlowMovement(movementRange));
//     // eslint-disable-next-line
//   }, [movementRange]);


//   const movKpis = useMemo(() => ({
//     approved:   movementData.reduce((s, d) => s + (d.approved   || 0), 0),
//     in_transit: movementData.reduce((s, d) => s + (d.in_transit || 0), 0),
//     delivered:  movementData.reduce((s, d) => s + (d.delivered  || 0), 0),
//   }), [movementData]);

//   // ── Alert conditions ───────────────────────────────────────────────────────
//   const alerts = useMemo(() => {
//     const list = [];
//     if (dashboardData.stocks.outOfStock > 0)
//       list.push({ label: `${dashboardData.stocks.outOfStock} out of stock`, icon: "📦", path: "/product-list", filter: "out_of_stock" });
//     if (dashboardData.stocks.low > 0)
//       list.push({ label: `${dashboardData.stocks.low} low stock articles`, icon: "⚠️", path: "/product-list", filter: "low" });
//     if (flowStats.in_transit > 0)
//       list.push({ label: `${flowStats.in_transit} transfers in transit`, icon: "🚚", path: "/stock-transfer" });
//     return list;
//   }, [dashboardData.stocks, flowStats]);

//   // ── Chart configs ──────────────────────────────────────────────────────────

//   const stockMovementChart = {
//     series: [
//       { name: "Approved",   data: movementData.map((d) => d.approved   || 0) },
//       { name: "In Transit", data: movementData.map((d) => d.in_transit || 0) },
//       { name: "Delivered",  data: movementData.map((d) => d.delivered  || 0) },
//     ],
//     colors: ["#3B82F6", "#F59E0B", "#22C55E"],
//     chart:  { type: "line", height: 260, zoom: { enabled: false }, toolbar: { show: false } },
//     dataLabels: { enabled: false },
//     stroke: { curve: "smooth", width: 2 },
//     grid:   { borderColor: "#e2e8f0", strokeDashArray: 4 },
//     xaxis: {
//       categories: movementData.map((d) =>
//         new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
//       ),
//       labels: { style: { fontSize: "11px" } },
//     },
//     yaxis:  { labels: { style: { fontSize: "11px" } } },
//     legend: { show: false },
//     tooltip: { shared: true, intersect: false, y: { formatter: (v) => `${v} flows` } },
//   };

//   const warehouseChart = {
//     series: [{ name: "Products", data: dashboardData.warehouses.details.map((wh) => wh.products || 0) }],
//     colors: ["#8b5cf6"],
//     chart:  { type: "bar", height: 260, toolbar: { show: false } },
//     plotOptions: { bar: { horizontal: false, columnWidth: "50%", borderRadius: 6 } },
//     dataLabels:  { enabled: false },
//     stroke:      { show: true, width: 2, colors: ["transparent"] },
//     xaxis:       { categories: dashboardData.warehouses.details.map((wh) => wh.name), labels: { style: { fontSize: "11px" } } },
//     fill:        { opacity: 1 },
//     // tooltip:     { y: { formatter: (v) => `${v} products` } },
// tooltip: {
//   y: {
//     formatter: (v, { dataPointIndex }) => {
//       const wh = dashboardData.warehouses.details[dataPointIndex];

//       return `${v} products | ${
//         (wh.stock || 0).toLocaleString()
//       } qty`;
//     },
//   },
// },

//     grid:        { borderColor: "#e2e8f0", strokeDashArray: 4 },
//   };

//   // Donut — product distribution by warehouse
//   const categoryChart = {
//     series: dashboardData.warehouses.details.map((wh) => wh.products || 0),
//     chart:  { type: "donut", height: 260 },
//     labels: dashboardData.warehouses.details.map((wh) => wh.name),
//     colors: ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"],
//     legend: { position: "bottom", fontSize: "12px" },
//     plotOptions: {
//       pie: {
//         donut: {
//           size: "65%",
//           labels: {
//             show: true,
//             total: {
//               show: true, label: "Total",
//               formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0),
//             },
//           },
//         },
//       },
//     },
//     dataLabels: { enabled: false },
//   };

//   // Status horizontal bar chart
//   const statusColors = {
//     new:      "#3b82f6",
//     used:     "#22c55e",
//     repaired: "#f59e0b",
//     broken:   "#ef4444",
//     installed:"#8b5cf6",
//   };

//   const maxStatusCount = Math.max(1, ...dashboardData.stockByStatus.map((i) => i.count));

//   // ── Loading gate ───────────────────────────────────────────────────────────
//   if (loading) {
//     return (
//       <div className="page-wrapper">
//         <div className="content">
//           <div className="text-center p-5">
//             <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
//               <span className="visually-hidden">Loading…</span>
//             </div>
//             <p className="mt-3 text-muted">Loading dashboard…</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // ── Render ─────────────────────────────────────────────────────────────────
//   return (
//     <div className="page-wrapper">
//       <div className="content">

//         {/* ── Page header ───────────────────────────────────────────── */}
//         <div className="page-header mb-3">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               {user?.warehouse_name ? (
//                 <><h4>{user.warehouse_name} Dashboard</h4><h6>Real-time Management Overview</h6></>
//               ) : (
//                 <><h4>Dashboard</h4><h6>Real-time Management Overview</h6></>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* ── Alert strip ───────────────────────────────────────────── */}
//         {alerts.length > 0 && (
//           <div
//             className="d-flex align-items-center gap-2 flex-wrap mb-3 p-3"
//             style={{
//               background: "var(--warning-bg, #fef9ec)",
//               border: "0.5px solid #f59e0b",
//               borderRadius: 8,
//             }}
//           >
//             <span className="fw-semibold" style={{ color: "#b45309", fontSize: 13 }}>
//               <AlertTriangle size={14} className="me-1" />
//               Needs attention
//             </span>
//             {alerts.map((a, i) => (
//               <span
//                 key={i}
//                 className="badge"
//                 style={{
//                   background: "#fff",
//                   border: "0.5px solid #f59e0b",
//                   color: "#b45309",
//                   fontSize: 12,
//                   padding: "4px 10px",
//                   borderRadius: 20,
//                   cursor: "pointer",
//                   fontWeight: 400,
//                 }}
//                 onClick={() => navigate(a.path)}
//               >
//                 {a.icon} {a.label}
//               </span>
//             ))}
//           </div>
//         )}

//         {/* ── Quick actions ──────────────────────────────────────────── */}
//         <div className="d-flex gap-2 flex-wrap mb-4">
//           <button className="btn btn-outline-success btn-sm" onClick={() => navigate("/add-new-stock-request")}>
//             <PlusCircle size={14} className="me-1" /> New stock request
//           </button>
//           <button className="btn btn-info btn-sm text-white" onClick={() => navigate("/add-stock-flow")}>
//             <TrendingUp size={14} className="me-1" /> Add stock flow
//           </button>
//           <button className="btn btn-secondary btn-sm" onClick={() => navigate("/product-list")}>
//             <Camera size={14} className="me-1" /> Scan product
//           </button>
//           <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/lot-product")}>
//             <Upload size={14} className="me-1" /> Lot upload
//           </button>
//         </div>

//         {/* ── Row 1: User stats ──────────────────────────────────────── */}
//         <p className="text-muted mb-2" style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em" }}>
//           Users &amp; Roles
//         </p>
//         <div className="row mb-1">
//           {[
//             {
//               cls: "", icon: <Users size={24} color="#ff9f43" />, val: dashboardData.users.total,
//               label: "Total Users", sub: "across all warehouses",
//               path: "/users",
//             },
//             {
//               cls: "dash1", icon: <UserCheck size={24} color="#22c55e" />, val: dashboardData.users.active,
//               label: "Active Users", badge: null,
//               path: "/users",
//             },
//             {
//               cls: "dash2", icon: <UserX size={24} color="#ef4444" />, val: dashboardData.users.inactive,
//               label: "Inactive Users", badge: dashboardData.users.inactive > 0 ? "needs review" : null,
//               badgeCls: "badge-linedanger",
//               path: "/users",
//             },
//             {
//               cls: "dash3", icon: <Shield size={24} color="#1b2850" />, val: dashboardData.roles.total,
//               label: "All Roles", sub: "permission sets",
//               path: "/roles-permissions",
//             },
//           ].map(({ cls, icon, val, label, sub, badge, badgeCls, path }) => (
//             <div key={label} className="col-xl-3 col-sm-6 col-12 d-flex">
//               <div
//                 className={`dash-widget ${cls} w-100`}
//                 style={{ cursor: "pointer", transition: "opacity .15s" }}
//                 onClick={() => navigate(path)}
//                 onMouseEnter={(e) => (e.currentTarget.style.opacity = ".85")}
//                 onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
//                 title={`Go to ${label}`}
//               >
//                 <div className="dash-imgs">{icon}</div>
//                 <div className="dash-widgetcontent">
//                   <h5><CountUp start={0} end={val} duration={2} /></h5>
//                   <h6>{label}</h6>
//                   {sub && <small className="text-muted" style={{ fontSize: 11 }}>{sub}</small>}
//                   {badge && <span className={`badge ${badgeCls} d-block mt-1`} style={{ fontSize: 10 }}>{badge}</span>}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
// {/*  */}
//         {/* ── Row 2: Inventory stats ─────────────────────────────────── */}
//         <p className="text-muted mb-2 mt-3" style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em" }}>
//           Inventory
//         </p>
//         <div className="row mb-1">
//           {[
//             {
//               cls: "", icon: <Warehouse />, val: dashboardData.warehouses.total,
//               label: "Total Warehouses", path: "/warehouse",
//             },
//             {
//               cls: "das1", icon: <Tag />, val: dashboardData.articles.total,
//               label: "Total Articles", path: "/article-profile",
//             },
//             {
//               cls: "das2", icon: <Layers />, val: dashboardData.products.total,
//               label: "Total Products",
//               sub: dashboardData.products.totalQuantity ? `${dashboardData.products.totalQuantity.toLocaleString()} units` : null,
//               path: "/product-list",
//             },
//             {
//               cls: "das9", icon: <AlertTriangle color="#f59e0b" />, val: dashboardData.stocks.low,
//               label: "Article Shortage",
//               badge: dashboardData.stocks.outOfStock > 0 ? `${dashboardData.stocks.outOfStock} out of stock` : null,
//               badgeCls: "badge-linedanger",
//               path: "/product-list",
//             },
//           ].map(({ cls, icon, val, label, sub, badge, badgeCls, path }) => (
//             <div key={label} className="col-xl-3 col-sm-6 col-12 d-flex">
//               <div
//                 className={`dash-count ${cls}`}
//                 style={{ cursor: "pointer", transition: "opacity .15s", width: "100%" }}
//                 onClick={() => navigate(path)}
//                 onMouseEnter={(e) => (e.currentTarget.style.opacity = ".85")}
//                 onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
//                 title={`Go to ${label}`}
//               >
//                 <div className="dash-counts">
//                   <h4>{val}</h4>
//                   <h5>{label}</h5>
//                   {sub  && <small className="text-muted" style={{ fontSize: 11 }}>{sub}</small>}
//                   {badge && <span className={`badge ${badgeCls} d-block mt-1`} style={{ fontSize: 10 }}>{badge}</span>}
//                 </div>
//                 <div className="dash-imgs">{icon}</div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* ── Stock request stats ────────────────────────────────────── */}
//         <p className="text-muted mb-2 mt-3" style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em" }}>
//           'Stock Transfer'
//         </p>
//         <div className="row mb-3">
//           {[
//             { cls: "das5", icon: <Package />,       val: flowStats.total      || 0, label: "Total Transfers",  path: "/stock-transfer" },
//             { cls: "das6", icon: <Package />,       val: flowStats.approved   || 0, label: "Approved",         path: "/stock-transfer" },
//             { cls: "das7", icon: <TrendingUp />,    val: flowStats.in_transit || 0, label: "In Transit",       path: "/stock-transfer", badge: flowStats.in_transit > 0 ? "active" : null, badgeCls: "badge-linewarning" },
//             { cls: "das8", icon: <UserCheck />,     val: flowStats.delivered  || 0, label: "Delivered",        path: "/stock-transfer" },
//           ].map(({ cls, icon, val, label, path, badge, badgeCls }) => (
//             <div key={label} className="col-xl-3 col-sm-6 col-12 d-flex">
//               <div
//                 className={`dash-count ${cls}`}
//                 style={{ cursor: "pointer", transition: "opacity .15s", width: "100%" }}
//                 onClick={() => navigate(path)}
//                 onMouseEnter={(e) => (e.currentTarget.style.opacity = ".85")}
//                 onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
//               >
//                 <div className="dash-counts">
//                   <h4>{val}</h4>
//                   <h5>{label}</h5>
//                   {badge && <span className={`badge ${badgeCls} d-block mt-1`} style={{ fontSize: 10 }}>{badge}</span>}
//                 </div>
//                 <div className="dash-imgs">{icon}</div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* ── Warehouse cards — horizontal scroll ───────────────────── */}
//         {/* <p className="text-muted mb-2" style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em" }}>
//           Warehouses <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>— scroll for more</span>
//         </p> */}
//         {/* <div
//           style={{ overflowX: "auto", paddingBottom: 8, marginBottom: 24, scrollbarWidth: "thin" }}
//         >
//           <div style={{ display: "flex", gap: 10, width: "max-content" }}>
          
//             {dashboardData.warehouses.details.length > 0 ? (
//               dashboardData.warehouses.details.map((wh) => {
//                 const hasAlert = (wh.lowStock || 0) > 0 || (wh.outOfStock || 0) > 0;
//                 return (
//                   <div
//                     key={wh.id}
//                     onClick={() => navigate(`/warehouse`)}
//                     style={{
//                       width: 185,
//                       flexShrink: 0,
//                       background: "var(--white)",
//                       border: hasAlert ? "none" : "0.5px solid var(--border-color)",
//                       borderLeft: hasAlert ? "3px solid #f59e0b" : undefined,
//                       borderRight: hasAlert ? "0.5px solid var(--border-color)" : undefined,
//                       borderTop: hasAlert ? "0.5px solid var(--border-color)" : undefined,
//                       borderBottom: hasAlert ? "0.5px solid var(--border-color)" : undefined,
//                       borderRadius: hasAlert ? "0 8px 8px 0" : 8,
//                       padding: "14px 14px",
//                       cursor: "pointer",
//                       transition: "box-shadow .15s",
//                     }}
//                     onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,.08)")}
//                     onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
//                   >
//                     <div className="d-flex align-items-center justify-content-between mb-2">
//                       <span style={{ fontWeight: 500, fontSize: 13 }}>{wh.name}</span>
//                       {hasAlert && <AlertTriangle size={13} color="#f59e0b" />}
//                     </div>
//                     {[
//                       { label: "Articles",    val: wh.articles  || 0, danger: false },
//                       { label: "Products",    val: wh.products  || 0, danger: false },
//                       { label: "Low stock",   val: wh.lowStock  || 0, danger: (wh.lowStock || 0) > 0 },
//                     ].map(({ label, val, danger }) => (
//                       <div
//                         key={label}
//                         className="d-flex justify-content-between align-items-center"
//                         style={{ padding: "4px 0", borderBottom: "0.5px solid var(--border-color)", fontSize: 12 }}
//                       >
//                         <span className="text-muted">{label}</span>
//                         <span style={{ fontWeight: 500, color: danger ? "#f59e0b" : "inherit" }}>{val}</span>
//                       </div>
//                     ))}
//                   </div>
//                 );
//               })
//             ) : (
//               <div className="alert-info-custom w-100">
//                 <p>No warehouse data available.</p>
//               </div>
//             )}
//           </div>
//         </div> */}

// <p
//   className="text-muted mb-2"
//   style={{
//     fontSize: 11,
//     fontWeight: 500,
//     textTransform: "uppercase",
//     letterSpacing: ".06em",
//   }}
// >
//   Warehouses{" "}
//   <span style={{ fontWeight: 400, textTransform: "none" }}>
//     — scroll down for more
//   </span>
// </p> 

// {/* GRID WRAPPER */}
// <div className="warehouse-section">
//   <div className="warehouse-scroll">
//     {dashboardData.warehouses.details.length > 0 ? (
//       dashboardData.warehouses.details.map((wh) => {
//         const hasAlert =
//           (wh.lowStock || 0) > 0 || (wh.outOfStock || 0) > 0;

//         return (
//           <div
//             key={wh.id}
//             className="warehouse-card"
//             onClick={() => navigate("/warehouse")}
//             style={{
//               borderLeft: hasAlert ? "4px solid #f59e0b" : undefined,
//             }}
//           >
//             <div className="warehouse-card-body">

//               {/* HEADER */}
//               <div className="warehouse-header">
//                 <h4>{wh.name}</h4>
//                 {hasAlert && (
//                   <AlertTriangle size={16} className="alert-icon" />
//                 )}
//               </div> 

//               {/* STATS */}
//                <div className="warehouse-stats">

//                 <div className="stat-row">
//                   <span className="stat-label">Articles</span>
//                   <span className="stat-value">
//                     {wh.articles || 0}
//                   </span>
//                 </div>

//                 <div className="stat-row">
//                   <span className="stat-label">Products</span>
//                   <span className="stat-value">
//                     {wh.products || 0}
//                   </span>
//                 </div>

//                 <div className="stat-row">
//                   <span className="stat-label">Low Stock</span>
//                   <span
//                     className={`stat-value ${
//                       (wh.lowStock || 0) > 0 ? "low-stock" : ""
//                     }`}
//                   >
//                     {wh.lowStock || 0}
//                   </span>
//                 </div>

//               </div>
//             </div>
//           </div>
//         );
//       })
//     ) : (
//       <div className="alert-info-custom w-100">
//         <p>No warehouse data available.</p>
//       </div>
//     )}
//   </div>
// </div> 


// {/* demo data for warehoue card scroll  */}
// {/* <p
//   className="text-muted mb-2"
//   style={{
//     fontSize: 11,
//     fontWeight: 500,
//     textTransform: "uppercase",
//     letterSpacing: ".06em",
//   }}
// >
//   Warehouses{" "}
//   <span style={{ fontWeight: 400, textTransform: "none" }}>
//     — scroll down for more
//   </span>
// </p>

// <div className="warehouse-section">
//   <div className="warehouse-scroll">

//     {testData.length > 0 ? (
//       testData.map((wh, index) => {
//         const hasAlert =
//           (wh.lowStock || 0) > 0 || (wh.outOfStock || 0) > 0;

//         return (
//           <div
//             key={`${wh.id}-${index}`}
//             className="warehouse-card"
//             onClick={() => navigate("/warehouse")}
//             style={{
//               borderLeft: hasAlert ? "4px solid #f59e0b" : undefined,
//             }}
//           >
//             <div className="warehouse-card-body">

           
//               <div className="warehouse-header">
//                 <h4>{wh.name}</h4>
//                 {hasAlert && (
//                   <AlertTriangle size={16} className="alert-icon" />
//                 )}
//               </div>

//               <div className="warehouse-stats">

//                 <div className="stat-row">
//                   <span className="stat-label">Articles</span>
//                   <span className="stat-value">
//                     {wh.articles || 0}
//                   </span>
//                 </div>

//                 <div className="stat-row">
//                   <span className="stat-label">Products</span>
//                   <span className="stat-value">
//                     {wh.products || 0}
//                   </span>
//                 </div>

//                 <div className="stat-row">
//                   <span className="stat-label">Low Stock</span>
//                   <span
//                     className={`stat-value ${
//                       (wh.lowStock || 0) > 0 ? "low-stock" : ""
//                     }`}
//                   >
//                     {wh.lowStock || 0}
//                   </span>
//                 </div>

//               </div>
//             </div>
//           </div>
//         );
//       })
//     ) : (
//       <div className="alert-info-custom w-100">
//         <p>No warehouse data available.</p>
//       </div>
//     )}

//   </div>
// </div> */}

//         {/* ── Charts row 1: Movement + Warehouse Distribution ───────── */}
//         <div className="row">

//           {/* Stock Flow Movement — with time toggle + KPI chips */}
//           <div className="col-xl-6 col-sm-12 col-12 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
//                 <h5 className="card-title mb-0">Stock Transfer Movement</h5>
//                 {/* Time range toggle */}
//                 <div
//                   className="d-flex"
//                   style={{ border: "0.5px solid var(--border-color)", borderRadius: 6, overflow: "hidden" }}
//                 >
//                   {MOVEMENT_RANGES.map(({ label, days }) => (
//                     <button
//                       key={days}
//                       onClick={() => setMovementRange(days)}
//                       style={{
//                         padding: "3px 12px",
//                         fontSize: 12,
//                         border: "none",
//                         borderRight: days !== 30 ? "0.5px solid var(--border-color)" : "none",
//                         background: movementRange === days ? "var(--primary-color, #3B82F6)" : "transparent",
//                         color: movementRange === days ? "#fff" : "inherit",
//                         cursor: "pointer",
//                         fontWeight: movementRange === days ? 500 : 400,
//                         transition: "background .15s",
//                       }}
//                     >
//                       {label}
//                     </button>
//                   ))}
//                 </div>
//               </div>

//               {/* KPI chips */}
//               <div className="d-flex gap-2 flex-wrap px-3 pt-2">
//                 {[
//                   { dot: "#3B82F6", label: "Approved",   val: movKpis.approved },
//                   { dot: "#F59E0B", label: "In Transit", val: movKpis.in_transit },
//                   { dot: "#22C55E", label: "Delivered",  val: movKpis.delivered },
//                 ].map(({ dot, label, val }) => (
//                   <div
//                     key={label}
//                     className="d-flex align-items-center gap-1"
//                     style={{
//                       background: "var(--light-gray, #f8f9fa)",
//                       borderRadius: 6,
//                       padding: "4px 10px",
//                       fontSize: 12,
//                     }}
//                   >
//                     <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot, display: "inline-block" }} />
//                     <strong>{val}</strong>
//                     <span className="text-muted">{label}</span>
//                   </div>
//                 ))}
//               </div>

//               <div className="card-body pt-2">
//                 {movLoading ? (
//                   <div className="text-center p-5"><div className="spinner-border text-primary" /></div>
//                 ) : movementData.length > 0 ? (
//                   <Chart options={stockMovementChart} series={stockMovementChart.series} type="line" height={260} />
//                 ) : (
//                   <div className="text-center p-5"><p className="text-muted">No movement data yet</p></div>
//                 )}
//               </div>
//             </div>
//           </div>
 
//           {/* Warehouse Product Distribution */}
//           <div className="col-xl-6 col-sm-12 col-12 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header d-flex justify-content-between align-items-center">
//                 <h5 className="card-title mb-0">Products per Warehouse</h5>
//                 <TrendingUp size={18} className="text-success" />
//               </div>
           
//               <div className="card-body">
//                 {distLoading ? (
//                   <div className="text-center p-5"><div className="spinner-border text-primary" /></div>
//                 ) : dashboardData.warehouses.details.length > 0 ? ( 
//                   <Chart options={warehouseChart} series={warehouseChart.series} type="bar" height={240} />
//                 ) : (
//                   <div className="text-center p-5"><p className="text-muted">No warehouse data available</p></div>
//                 )}
//               </div>
//             </div>
//           </div>

//         </div>

//         {/* ── Charts row 2: Donut + Status bars ─────────────────────── */}
//         <div className="row">

//           {/* Product Distribution donut */}
//           <div className="col-xl-6 col-sm-12 col-12 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header d-flex justify-content-between align-items-center">
//                 <h5 className="card-title mb-0">Product Distribution by Warehouse</h5>
//                 <Package size={18} className="text-primary" />
//               </div>
//               <div className="card-body">
//                 {dashboardData.warehouses.details.length > 0 ? (
//                   <Chart options={categoryChart} series={categoryChart.series} type="donut" height={260} />
//                 ) : (
//                   <div className="text-center p-5"><p className="text-muted">No product data available</p></div>
//                 )}
//               </div>
//             </div>
//           </div>

//           {/* Products by Status — horizontal bar chart (replaces pie) */}
//           <div className="col-xl-6 col-sm-12 col-12 d-flex">
//             <div className="card flex-fill">
//               <div className="card-header d-flex justify-content-between align-items-center">
//                 <h5 className="card-title mb-0">Products by Status</h5>
//                 <Layers size={18} className="text-primary" />
//               </div>
//               <div className="card-body">
//                 {dashboardData.stockByStatus.length > 0 ? (
//                   <div className="d-flex flex-column gap-3 pt-1">
//                     {dashboardData.stockByStatus.map((item) => {
//                       const pct = Math.round((item.count / maxStatusCount) * 100);
//                       const color = statusColors[item.status] || "#6c757d";
//                       return (
//                         <div
//                           key={item.status}
//                           style={{ cursor: "pointer" }}
//                           onClick={() => navigate(`/product-list`)}
//                         >
//                           <div className="d-flex justify-content-between align-items-center mb-1">
//                             <span style={{ fontSize: 13, fontWeight: 500 }}>{formatLabel(item.status)}</span>
//                             <span style={{ fontSize: 13, fontWeight: 500 }}>{item.count.toLocaleString()}</span>
//                           </div>
//                           <div style={{ height: 8, background: "#f1f3f5", borderRadius: 4, overflow: "hidden" }}>
//                             <div
//                               style={{
//                                 height: "100%",
//                                 width: `${pct}%`,
//                                 background: color,
//                                 borderRadius: 4,
//                                 transition: "width .6s ease",
//                               }}
//                             />
//                           </div>
//                         </div>
//                       );
//                     })}
//                   </div>
//                 ) : (
//                   <div className="text-center p-5"><p className="text-muted">No status data available</p></div>
//                 )}
//               </div>
//             </div>
//           </div>

//         </div>

//       </div>
//     </div>
//   );
// };

// export default Dashboard;


/* eslint-disable react/prop-types */

import React, { useState, useEffect, useMemo, useCallback } from "react";
import CountUp from "react-countup";
import {
  TrendingUp, Package, UserCheck, Tag, Layers,
  Users, Shield, UserX, AlertTriangle, PlusCircle,
  Upload, Camera, X, Maximize2,
} from "feather-icons-react/build/IconComponents";
import { Warehouse } from "lucide-react";
import Chart from "react-apexcharts";
import AuthService from "../../services/authService";
import Swal from "sweetalert2";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  fetchStockFlowStats,
  fetchStockFlowMovement,
  fetchStockFlowWarehouseDist,
  selectFlowStats,
  selectFlowMovement,
  selectFlowMovementLoading,
  selectFlowWarehouseDistLoading,
} from "../../core/redux/slices/stockSlice";


const MOVEMENT_RANGES = [
  { label: "1D", days: 1 },
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
];

const STATUS_COLORS = {
  new:       "#3b82f6",
  used:      "#22c55e",
  repaired:  "#f59e0b",
  broken:    "#ef4444",
  installed: "#8b5cf6",
};

const WAREHOUSE_PALETTE = ["#3b82f6", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#ef4444"];

const formatLabel = (v) =>
  v ? v.charAt(0).toUpperCase() + v.slice(1).replace(/_/g, " ") : "";



const ChartModal = ({ chart, onClose }) => {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose]);

  if (!chart) return null;

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px",
        backdropFilter: "blur(2px)",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        style={{
          background: "var(--white, #fff)",
          borderRadius: 12,
          width: "100%",
          maxWidth: 900,
          maxHeight: "90vh",
          overflow: "auto",
          boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* header for Modal */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: "0.5px solid var(--border-color, #e2e8f0)",
            flexShrink: 0,
          }}
        >
          <div>
            <h5 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>{chart.title}</h5>
            {chart.subtitle && (
              <small style={{ color: "#64748b", fontSize: 12 }}>{chart.subtitle}</small>
            )}
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none", border: "none", cursor: "pointer",
              padding: 6, borderRadius: 6,
              display: "flex", alignItems: "center",
              color: "#64748b",
            }}
            title="Close (Esc)"
          >
            <X size={20} />
          </button>
        </div>

   
        <div style={{ padding: "20px", flex: 1 }}>
          {chart.render()}
        </div>
      </div>
    </div>
  );
};



const ClickableChartCard = ({ title, icon, children, onExpand, headerExtra }) => (
  <div className="card flex-fill" style={{ cursor: "default" }}>
    <div
      className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2"
      style={{ paddingBottom: 12 }}
    >
      <h5 className="card-title mb-0">{title}</h5>
      <div className="d-flex align-items-center gap-2">
        {headerExtra}
        {icon}
        <button
          onClick={onExpand}
          title="View full chart"
          style={{
            background: "none", border: "0.5px solid var(--border-color, #e2e8f0)",
            borderRadius: 6, padding: "3px 8px",
            cursor: "pointer", display: "flex", alignItems: "center", gap: 4,
            fontSize: 11, color: "#64748b",
            transition: "background .15s, color .15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f1f5f9";
            e.currentTarget.style.color = "#1e293b";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "none";
            e.currentTarget.style.color = "#64748b";
          }}
        >
          <Maximize2 size={12} />
          <span>Expand</span>
        </button>
      </div>
    </div>
    {children}
  </div>
);



const Dashboard = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user     = useSelector((state) => state.auth.user);

  const flowStats    = useSelector(selectFlowStats);
  const movementData = useSelector(selectFlowMovement);
  const movLoading   = useSelector(selectFlowMovementLoading);
  const distLoading  = useSelector(selectFlowWarehouseDistLoading);

  const [dashboardData, setDashboardData] = useState({
    users:         { total: 0, active: 0, inactive: 0 },
    roles:         { total: 0 },
    warehouses:    { total: 0, details: [] },
    articles:      { total: 0 },
    products:      { total: 0, totalQuantity: 0 },
    stocks:        { total: 0, low: 0, outOfStock: 0, threshold: 10 },
    stockByStatus: [],
  });
  const [loading,       setLoading]       = useState(true);
  const [movementRange, setMovementRange] = useState(30);
  const [activeModal,   setActiveModal]   = useState(null); // { title, subtitle, render }

  const openModal  = useCallback((config) => setActiveModal(config), []);
  const closeModal = useCallback(() => setActiveModal(null), []);


//     const testData = [
//   ...dashboardData.warehouses.details,
//   ...dashboardData.warehouses.details,
//   ...dashboardData.warehouses.details,
// ];


//fetch from api 
  const fetchDashboardData = async () => {
    try {
      const { data } = await AuthService.getDashboard();
      const d = data.data;
      setDashboardData({
        users:         d.users         || { total: 0, active: 0, inactive: 0 },
        roles:         { total: d.roles || 0 },
        warehouses:    d.warehouses    || { total: 0, details: [] },
        articles:      d.articles      || { total: 0 },
        products:      d.products      || { total: 0, totalQuantity: 0 },
        stocks:        d.stocks        || { total: 0, low: 0, outOfStock: 0, threshold: 10 },
        stockByStatus: d.stockByStatus || [],
      });
    } catch (err) {
      Swal.fire({
        icon: "error", title: "Error",
        text: err.response?.data?.message || "Failed to load dashboard data.",
        confirmButtonText: "OK",
      });
    }
    
  };


  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = "auto"; };
  }, []);


  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardData(),
        dispatch(fetchStockFlowStats()),
        dispatch(fetchStockFlowMovement(30)),
        dispatch(fetchStockFlowWarehouseDist()),
      ]);
      setLoading(false);
    };
    load();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    dispatch(fetchStockFlowMovement(movementRange));
    // eslint-disable-next-line
  }, [movementRange]);


  const allWarehouses    = dashboardData.warehouses.details;
  const top6Warehouses   = allWarehouses.slice(0, 6);
  const allStatuses      = dashboardData.stockByStatus;
  const top6Statuses     = allStatuses.slice(0, 6);

  const movKpis = useMemo(() => ({
    approved:   movementData.reduce((s, d) => s + (d.approved   || 0), 0),
    in_transit: movementData.reduce((s, d) => s + (d.in_transit || 0), 0),
    delivered:  movementData.reduce((s, d) => s + (d.delivered  || 0), 0),
  }), [movementData]);

  const alerts = useMemo(() => {
    const list = [];
    // if (dashboardData.stocks.outOfStock > 0)
    //   list.push({ label: `${dashboardData.stocks.outOfStock} out of stock`, icon: "📦", path: "/product-list" });
    if (dashboardData.stocks.low > 0)
      list.push({ label: `${dashboardData.stocks.low} low stock articles`, icon: "⚠️", path: "/product-list" });
    if (flowStats.in_transit > 0)
      list.push({ label: `${flowStats.in_transit} transfers in transit`, icon: "🚚", path: "/stock-transfer" });
    return list;
  }, [dashboardData.stocks, flowStats]);


  const buildMovementChart = (data, height = 260) => ({
    series: [
      { name: "Approved",   data: data.map((d) => d.approved   || 0) },
      { name: "In Transit", data: data.map((d) => d.in_transit || 0) },
      { name: "Delivered",  data: data.map((d) => d.delivered  || 0) },
    ],
    options: {
      colors: ["#3B82F6", "#F59E0B", "#22C55E"],
      chart:  { type: "line", height, zoom: { enabled: false }, toolbar: { show: false } },
      dataLabels: { enabled: false },
      stroke: { curve: "smooth", width: 2 },
      grid:   { borderColor: "#e2e8f0", strokeDashArray: 4 },
      xaxis: {
        categories: data.map((d) =>
          new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        ),
        labels: { style: { fontSize: "11px" } },
      },
      yaxis:  { labels: { style: { fontSize: "11px" } } },
      legend: { show: false },
      tooltip: { shared: true, intersect: false, y: { formatter: (v) => `${v} flows` } },
    },
  });

  const buildWarehouseBarChart = (warehouses, height = 260) => ({
    series: [{ name: "Products", data: warehouses.map((wh) => wh.products || 0) }],
    options: {
      colors: ["#8b5cf6"],
      chart:  { type: "bar", height, toolbar: { show: false } },
      plotOptions: { bar: { horizontal: false, columnWidth: "50%", borderRadius: 6 } },
      dataLabels:  { enabled: false },
      stroke:      { show: true, width: 2, colors: ["transparent"] },
      xaxis:       {
        categories: warehouses.map((wh) => wh.name),
        labels: { style: { fontSize: "11px" }, rotate: -30 },
      },
      tooltip: {
        y: {
          formatter: (v, { dataPointIndex }) => {
            const wh = warehouses[dataPointIndex];
            return `${v} products | ${(wh?.stock || 0).toLocaleString()} units`;
          },
        },
      },
      grid: { borderColor: "#e2e8f0", strokeDashArray: 4 },
    },
  });

  const buildDonutChart = (warehouses, height = 260) => ({
    series: warehouses.map((wh) => wh.products || 0),
    options: {
      chart:  { type: "donut", height },
      labels: warehouses.map((wh) => wh.name),
      colors: WAREHOUSE_PALETTE,
      legend: { position: "bottom", fontSize: "12px" },
      plotOptions: {
        pie: {
          donut: {
            size: "65%",
            labels: {
              show: true,
              total: {
                show: true, label: "Total",
                formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0),
              },
            },
          },
        },
      },
      dataLabels: { enabled: false },
    },
  });

 


  const renderStatusBars = (statuses, navigate) => {
    const maxCount = Math.max(1, ...statuses.map((i) => i.count));
    return (
      <div className="d-flex flex-column gap-3 pt-1">
        {statuses.map((item) => {
          const pct   = Math.round((item.count / maxCount) * 100);
          const color = STATUS_COLORS[item.status] || "#6c757d";
          return (
            <div
              key={item.status}
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/product-list")}
            >
              <div className="d-flex justify-content-between align-items-center mb-1">
                <span style={{ fontSize: 13, fontWeight: 500 }}>{formatLabel(item.status)}</span>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{item.count.toLocaleString()}</span>
              </div>
              <div style={{ height: 8, background: "#f1f3f5", borderRadius: 4, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%", width: `${pct}%`,
                    background: color, borderRadius: 4,
                    transition: "width .6s ease",
                  }}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

 

  const openMovementModal = () => {
    const { series, options } = buildMovementChart(movementData, 420);
    openModal({
      title: "Stock Transfer Movement",
      subtitle: `Showing ${movementData.length} data points — last ${movementRange} day(s)`,
      render: () => (
        <div>
       
          <div className="d-flex gap-3 flex-wrap mb-4">
            {[
              { dot: "#3B82F6", label: "Approved",   val: movKpis.approved },
              { dot: "#F59E0B", label: "In Transit", val: movKpis.in_transit },
              { dot: "#22C55E", label: "Delivered",  val: movKpis.delivered },
            ].map(({ dot, label, val }) => (
              <div
                key={label}
                style={{
                  background: "#f8f9fa", borderRadius: 8, padding: "10px 18px",
                  display: "flex", alignItems: "center", gap: 8, minWidth: 140,
                }}
              >
                <span style={{ width: 10, height: 10, borderRadius: "50%", background: dot, display: "inline-block" }} />
                <div>
                  <div style={{ fontSize: 22, fontWeight: 600 }}>{val}</div>
                  <div style={{ fontSize: 12, color: "#64748b" }}>{label}</div>
                </div>
              </div>
            ))}
          </div>
          <Chart options={options} series={series} type="line" height={420} />
        </div>
      ),
    });
  };

  const openWarehouseBarModal = () => {
    const { series, options } = buildWarehouseBarChart(allWarehouses, 380);
    openModal({
      title: "Products per Warehouse",
      subtitle: `All ${allWarehouses.length} warehouses`,
      render: () => (
        <Chart options={options} series={series} type="bar" height={380} />
      ),
    });
  };

  const openDonutModal = () => {
    const { series, options } = buildDonutChart(allWarehouses, 420);
    openModal({
      title: "Product Distribution by Warehouse",
      subtitle: `All ${allWarehouses.length} warehouses`,
      render: () => (
        <div>
          <Chart options={options} series={series} type="donut" height={420} />
      
          <div style={{ marginTop: 24, overflowX: "auto" }}>
            <table style={{ width: "100%", fontSize: 13, borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f8f9fa" }}>
                  {["Warehouse", "Products", "Total Product Units", "Low Article"].map((h) => (
                    <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontWeight: 500, borderBottom: "1px solid #e2e8f0" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {allWarehouses.map((wh, i) => (
                  <tr key={wh.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                    <td style={{ padding: "8px 12px", borderBottom: "0.5px solid #e2e8f0", fontWeight: 500 }}>
                      <span style={{ display: "inline-block", width: 10, height: 10, borderRadius: "50%", background: WAREHOUSE_PALETTE[i % WAREHOUSE_PALETTE.length], marginRight: 8 }} />
                      {wh.name}
                    </td>
                    <td style={{ padding: "8px 12px", borderBottom: "0.5px solid #e2e8f0" }}>{wh.products || 0}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "0.5px solid #e2e8f0" }}>{(wh.stock || 0).toLocaleString()}</td>
                    <td style={{ padding: "8px 12px", borderBottom: "0.5px solid #e2e8f0", color: (wh.lowStock || 0) > 0 ? "#f59e0b" : "inherit", fontWeight: (wh.lowStock || 0) > 0 ? 600 : 400 }}>{wh.lowStock || 0}</td>
                    {/* <td style={{ padding: "8px 12px", borderBottom: "0.5px solid #e2e8f0", color: (wh.outOfStock || 0) > 0 ? "#ef4444" : "inherit", fontWeight: (wh.outOfStock || 0) > 0 ? 600 : 400 }}>{wh.outOfStock || 0}</td> */}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ),
    });
  };

  const openStatusModal = () => {
    openModal({
      title: "Products by Status",
      subtitle: `All ${allStatuses.length} status categories`,
      render: () => (
        <div>
        
          {renderStatusBars(allStatuses, navigate)}
       
          <div style={{ marginTop: 28, padding: "16px", background: "#f8f9fa", borderRadius: 8 }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 10, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".05em" }}>
              Summary
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {allStatuses.map((item) => {
                const color = STATUS_COLORS[item.status] || "#6c757d";
                const total = allStatuses.reduce((s, i) => s + i.count, 0);
                const pct   = total > 0 ? ((item.count / total) * 100).toFixed(1) : 0;
                return (
                  <div key={item.status} style={{ display: "flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "#fff", borderRadius: 6, border: "0.5px solid #e2e8f0" }}>
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 500 }}>{formatLabel(item.status)}</span>
                    <span style={{ fontSize: 13, color: "#64748b" }}>{item.count.toLocaleString()}</span>
                    <span style={{ fontSize: 11, color: "#94a3b8" }}>({pct}%)</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ),
    });
  };


  const dashMovementChart  = buildMovementChart(movementData, 260);
  const dashWarehouseChart = buildWarehouseBarChart(top6Warehouses, 240);
  const dashDonutChart     = buildDonutChart(top6Warehouses, 260);

 
  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading…</span>
            </div>
            <p className="mt-3 text-muted">Loading dashboard…</p>
          </div>
        </div>
      </div>
    );
  }


  return (
    <>
    
      {activeModal && <ChartModal chart={activeModal} onClose={closeModal} />}

      <div className="page-wrapper">
        <div className="content">

       
          <div className="page-header mb-3">
            <div className="add-item d-flex">
              <div className="page-title">
                {user?.warehouse_name ? (
                  <><h4>{user.warehouse_name} Dashboard</h4><h6>Real-time Management Overview</h6></>
                ) : (
                  <><h4>Dashboard</h4><h6>Real-time Management Overview</h6></>
                )}
              </div>
            </div>
          </div>

        
          {alerts.length > 0 && (
            <div
              className="d-flex align-items-center gap-2 flex-wrap mb-3 p-3"
              style={{ background: "var(--warning-bg, #fef9ec)", border: "0.5px solid #f59e0b", borderRadius: 8 }}
            >
              <span className="fw-semibold" style={{ color: "#b45309", fontSize: 13 }}>
                <AlertTriangle size={14} className="me-1" />
                Needs attention
              </span>
              {alerts.map((a, i) => (
                <span
                  key={i} className="badge"
                  style={{ background: "#fff", border: "0.5px solid #f59e0b", color: "#b45309", fontSize: 12, padding: "4px 10px", borderRadius: 20, cursor: "pointer", fontWeight: 400 }}
                  onClick={() => navigate(a.path)}
                >
                  {a.icon} {a.label}
                </span>
              ))}
            </div>
          )}

  
          <div className="d-flex gap-2 flex-wrap mb-4">
            <button className="btn btn-outline-success btn-sm" onClick={() => navigate("/add-new-stock-request")}>
              <PlusCircle size={14} className="me-1" /> New stock request
            </button>
            <button className="btn btn-info btn-sm text-white" onClick={() => navigate("/add-stock-flow")}>
              <TrendingUp size={14} className="me-1" /> Add stock flow
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => navigate("/product-list")}>
              <Camera size={14} className="me-1" /> Scan product
            </button>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => navigate("/lot-product")}>
              <Upload size={14} className="me-1" /> Lot upload
            </button>
          </div>

          {/* user stats */}
          <p className="text-muted mb-2" style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em" }}>
            Users &amp; Roles
          </p>
          <div className="row mb-1">
            {[
              { cls: "",      icon: <Users size={24} color="#ff9f43" />,    val: dashboardData.users.total,    label: "Total Users",    sub: "across all warehouses", path: "/users" },
              { cls: "dash1", icon: <UserCheck size={24} color="#22c55e" />, val: dashboardData.users.active,   label: "Active Users",   path: "/users" },
              { cls: "dash2", icon: <UserX size={24} color="#ef4444" />,    val: dashboardData.users.inactive, label: "Inactive Users", badge: dashboardData.users.inactive > 0 ? "needs review" : null, badgeCls: "badge-linedanger", path: "/users" },
              { cls: "dash3", icon: <Shield size={24} color="#1b2850" />,   val: dashboardData.roles.total,    label: "All Roles",      sub: "permission sets", path: "/roles-permissions" },
            ].map(({ cls, icon, val, label, sub, badge, badgeCls, path }) => (
              <div key={label} className="col-xl-3 col-sm-6 col-12 d-flex">
                <div
                  className={`dash-widget ${cls} w-100`}
                  style={{ cursor: "pointer", transition: "opacity .15s" }}
                  onClick={() => navigate(path)}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = ".85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  title={`Go to ${label}`}
                >
                  <div className="dash-imgs">{icon}</div>
                  <div className="dash-widgetcontent">
                    <h5><CountUp start={0} end={val} duration={2} /></h5>
                    <h6>{label}</h6>
                    {sub && <small className="text-muted" style={{ fontSize: 11 }}>{sub}</small>}
                    {badge && <span className={`badge ${badgeCls} d-block mt-1`} style={{ fontSize: 10 }}>{badge}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>

        {/* inventory stats */}
          <p className="text-muted mb-2 mt-3" style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em" }}>
            Inventory
          </p>
          <div className="row mb-1">
            {[
              { cls: "",     icon: <Warehouse />,              val: dashboardData.warehouses.total,   label: "Total Warehouses", path: "/warehouse" },
              { cls: "das1", icon: <Tag />,                    val: dashboardData.articles.total,     label: "Total Articles",   path: "/article-profile" },
              { cls: "das2", icon: <Layers />,                 val: dashboardData.products.total,     label: "Total Products", sub: dashboardData.products.totalQuantity ? `${dashboardData.products.totalQuantity.toLocaleString()} units` : null, path: "/product-list" },
              { cls: "das9", icon: <AlertTriangle color="#f59e0b" />, val: dashboardData.stocks.low, label: "Article Shortage", badge: dashboardData.stocks.outOfStock > 0 ? `${dashboardData.stocks.outOfStock} out of stock` : null, badgeCls: "badge-linedanger", path: "/product-list" },
            ].map(({ cls, icon, val, label, sub, badge, badgeCls, path }) => (
              <div key={label} className="col-xl-3 col-sm-6 col-12 d-flex">
                <div
                  className={`dash-count ${cls}`}
                  style={{ cursor: "pointer", transition: "opacity .15s", width: "100%" }}
                  onClick={() => navigate(path)}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = ".85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                  title={`Go to ${label}`}
                >
                  <div className="dash-counts">
                    <h4>{val}</h4>
                    <h5>{label}</h5>
                    {sub   && <small className="text-muted" style={{ fontSize: 11 }}>{sub}</small>}
                    {badge && <span className={`badge ${badgeCls} d-block mt-1`} style={{ fontSize: 10 }}>{badge}</span>}
                  </div>
                  <div className="dash-imgs">{icon}</div>
                </div>
              </div>
            ))}
          </div>

         {/* stock transfer stats */}
          <p className="text-muted mb-2 mt-3" style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em" }}>
            Stock Transfer
          </p>
          <div className="row mb-3">
            {[
              { cls: "das5", icon: <Package />,    val: flowStats.total      || 0, label: "Total Transfers", path: "/stock-transfer" },
              { cls: "das6", icon: <Package />,    val: flowStats.approved   || 0, label: "Approved",        path: "/stock-transfer" },
              { cls: "das7", icon: <TrendingUp />, val: flowStats.in_transit || 0, label: "In Transit",      path: "/stock-transfer", badge: flowStats.in_transit > 0 ? "active" : null, badgeCls: "badge-linewarning" },
              { cls: "das8", icon: <UserCheck />,  val: flowStats.delivered  || 0, label: "Delivered",       path: "/stock-transfer" },
            ].map(({ cls, icon, val, label, path, badge, badgeCls }) => (
              <div key={label} className="col-xl-3 col-sm-6 col-12 d-flex">
                <div
                  className={`dash-count ${cls}`}
                  style={{ cursor: "pointer", transition: "opacity .15s", width: "100%" }}
                  onClick={() => navigate(path)}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = ".85")}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
                >
                  <div className="dash-counts">
                    <h4>{val}</h4>
                    <h5>{label}</h5>
                    {badge && <span className={`badge ${badgeCls} d-block mt-1`} style={{ fontSize: 10 }}>{badge}</span>}
                  </div>
                  <div className="dash-imgs">{icon}</div>
                </div>
              </div>
            ))}
          </div>




          
{/* demo data for warehoue card scroll  */}
{/* <p
  className="text-muted mb-2"
  style={{
    fontSize: 11,
    fontWeight: 500,
    textTransform: "uppercase",
    letterSpacing: ".06em",
  }}
>
  Warehouses{" "}
  <span style={{ fontWeight: 400, textTransform: "none" }}>
    — scroll down for more
  </span>
</p>

<div className="warehouse-section">
  <div className="warehouse-scroll">

    {testData.length > 0 ? (
      testData.map((wh, index) => {
        const hasAlert =
          (wh.lowStock || 0) > 0 || (wh.outOfStock || 0) > 0;

        return (
          <div
            key={`${wh.id}-${index}`}
            className="warehouse-card"
            onClick={() => navigate("/warehouse")}
            style={{
              borderLeft: hasAlert ? "4px solid #f59e0b" : undefined,
            }}
          >
            <div className="warehouse-card-body">

           
              <div className="warehouse-header">
                <h4>{wh.name}</h4>
                {hasAlert && (
                  <AlertTriangle size={16} className="alert-icon" />
                )}
              </div>

              <div className="warehouse-stats">

                <div className="stat-row">
                  <span className="stat-label">Articles</span>
                  <span className="stat-value">
                    {wh.articles || 0}
                  </span>
                </div>

                <div className="stat-row">
                  <span className="stat-label">Products</span>
                  <span className="stat-value">
                    {wh.products || 0}
                  </span>
                </div>

                <div className="stat-row">
                  <span className="stat-label">Low Stock</span>
                  <span
                    className={`stat-value ${
                      (wh.lowStock || 0) > 0 ? "low-stock" : ""
                    }`}
                  >
                    {wh.lowStock || 0}
                  </span>
                </div>

              </div>
            </div>
          </div>
        );
      })
    ) : (
      <div className="alert-info-custom w-100">
        <p>No warehouse data available.</p>
      </div>
    )}

  </div>
</div>  */}

          {/* ── Warehouse cards ───────────────────────────────────────────── */}
          <p
            className="text-muted mb-2"
            style={{ fontSize: 11, fontWeight: 500, textTransform: "uppercase", letterSpacing: ".06em" }}
          >
            Warehouses{" "}
            <span style={{ fontWeight: 400, textTransform: "none", letterSpacing: 0 }}>
              — scroll down for more
            </span>
          </p>

          <div className="warehouse-section">
            <div className="warehouse-scroll">
              {dashboardData.warehouses.details.length > 0 ? (
                dashboardData.warehouses.details.map((wh) => {
                  const hasAlert = (wh.lowStock || 0) > 0 || (wh.outOfStock || 0) > 0;
                  return (
                    <div
                      key={wh.id}
                      className="warehouse-card"
                      onClick={() => navigate("/warehouse")}
                      style={{ borderLeft: hasAlert ? "4px solid #f59e0b" : undefined }}
                    >
                      <div className="warehouse-card-body">
                        <div className="warehouse-header">
                          <h4>{wh.name}</h4>
                          {hasAlert && <AlertTriangle size={16} className="alert-icon" />}
                        </div>
                        <div className="warehouse-stats">
                          <div className="stat-row">
                            <span className="stat-label">Articles</span>
                            <span className="stat-value">{wh.articles || 0}</span>
                          </div>
                          <div className="stat-row">
                            <span className="stat-label">Products</span>
                            <span className="stat-value">{wh.products || 0}</span>
                          </div>
                          <div className="stat-row">
                            <span className="stat-label">Low Stock</span>
                            <span className={`stat-value ${(wh.lowStock || 0) > 0 ? "low-stock" : ""}`}>
                              {wh.lowStock || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="alert-info-custom w-100">
                  <p>No warehouse data available.</p>
                </div>
              )}
            </div>
          </div> 

     
          <div className="row">

       
            <div className="col-xl-6 col-sm-12 col-12 d-flex">
              <ClickableChartCard
                title="Stock Transfer Movement"
                onExpand={openMovementModal}
                headerExtra={
                  <div
                    className="d-flex"
                    style={{ border: "0.5px solid var(--border-color)", borderRadius: 6, overflow: "hidden" }}
                  >
                    {MOVEMENT_RANGES.map(({ label, days }) => (
                      <button
                        key={days}
                        onClick={(e) => { e.stopPropagation(); setMovementRange(days); }}
                        style={{
                          padding: "3px 12px", fontSize: 12, border: "none",
                          borderRight: days !== 30 ? "0.5px solid var(--border-color)" : "none",
                          background: movementRange === days ? "var(--primary-color, #3B82F6)" : "transparent",
                          color: movementRange === days ? "#fff" : "inherit",
                          cursor: "pointer", fontWeight: movementRange === days ? 500 : 400,
                          transition: "background .15s",
                        }}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                }
              >
                <div className="d-flex gap-2 flex-wrap px-3 pt-2">
                  {[
                    { dot: "#3B82F6", label: "Approved",   val: movKpis.approved },
                    { dot: "#F59E0B", label: "In Transit", val: movKpis.in_transit },
                    { dot: "#22C55E", label: "Delivered",  val: movKpis.delivered },
                  ].map(({ dot, label, val }) => (
                    <div key={label} className="d-flex align-items-center gap-1"
                      style={{ background: "var(--light-gray, #f8f9fa)", borderRadius: 6, padding: "4px 10px", fontSize: 12 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: dot, display: "inline-block" }} />
                      <strong>{val}</strong>
                      <span className="text-muted">{label}</span>
                    </div>
                  ))}
                </div>
                <div className="card-body pt-2">
                  {movLoading ? (
                    <div className="text-center p-5"><div className="spinner-border text-primary" /></div>
                  ) : movementData.length > 0 ? (
                    <Chart options={dashMovementChart.options} series={dashMovementChart.series} type="line" height={260} />
                  ) : (
                    <div className="text-center p-5"><p className="text-muted">No movement data yet</p></div>
                  )}
                </div>
              </ClickableChartCard>
            </div>

           
            <div className="col-xl-6 col-sm-12 col-12 d-flex">
              <ClickableChartCard
                title={`Products per Warehouse${allWarehouses.length > 6 ? " (top 6)" : ""}`}
                icon={<TrendingUp size={18} className="text-success" />}
                onExpand={openWarehouseBarModal}
              >
                <div className="card-body">
                  {distLoading ? (
                    <div className="text-center p-5"><div className="spinner-border text-primary" /></div>
                  ) : top6Warehouses.length > 0 ? (
                    <Chart options={dashWarehouseChart.options} series={dashWarehouseChart.series} type="bar" height={240} />
                  ) : (
                    <div className="text-center p-5"><p className="text-muted">No warehouse data available</p></div>
                  )}
                </div>
              </ClickableChartCard>
            </div>
          </div>

        
          <div className="row">

            {/* Donut — top 6 */}
            <div className="col-xl-6 col-sm-12 col-12 d-flex">
              <ClickableChartCard
                title={`Product Distribution by Warehouse${allWarehouses.length > 6 ? " (top 6)" : ""}`}
                icon={<Package size={18} className="text-primary" />}
                onExpand={openDonutModal}
              >
                <div className="card-body">
                  {top6Warehouses.length > 0 ? (
                    <Chart options={dashDonutChart.options} series={dashDonutChart.series} type="donut" height={260} />
                  ) : (
                    <div className="text-center p-5"><p className="text-muted">No product data available</p></div>
                  )}
                </div>
              </ClickableChartCard>
            </div>

            {/* Status bars — top 6 */}
            <div className="col-xl-6 col-sm-12 col-12 d-flex">
              <ClickableChartCard
                title={`Products by Status${allStatuses.length > 6 ? " (top 6)" : ""}`}
                icon={<Layers size={18} className="text-primary" />}
                onExpand={openStatusModal}
              >
                <div className="card-body">
                  {top6Statuses.length > 0 ? (
                    renderStatusBars(top6Statuses, navigate)
                  ) : (
                    <div className="text-center p-5"><p className="text-muted">No status data available</p></div>
                  )}
                </div>
              </ClickableChartCard>
            </div>

          </div>

        </div>
      </div>
    </>
  );
};

export default Dashboard;