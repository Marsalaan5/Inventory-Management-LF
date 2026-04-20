
//Main Dashboard - Start

// import React, { useState, useEffect } from "react";
// import CountUp from "react-countup";
// import {
//   Activity,
//   Clock,
//   TrendingUp,
//   Package,
//   UserCheck,
//   RefreshCw,
//   Tag,
//   Layers,
//   Users,
//   Shield,
//   UserX,
//   AlertTriangle,
//   XCircle,
//   AlertCircle,
// } from "feather-icons-react/build/IconComponents";
// import { Warehouse } from "lucide-react";
// import Chart from "react-apexcharts";
// import { Link } from "react-router-dom";
// import AuthService from "../../services/authService";
// import Swal from "sweetalert2";

// const Dashboard = () => {
//   const [dashboardData, setDashboardData] = useState({
//     users: { total: 0, active: 0, inactive: 0 },
//     roles: { total: 0 },
//     warehouses: { total: 0, details: [] },
//     products: { total: 0 },
//     stocks: { total: 0, low: 0, outOfStock: 0, threshold: 10 },
//     lowStockProducts: [],
//     outOfStockProducts: [],
//     stockByStatus: [],
//     lowStockTrend: [],
//   });
// const [chartData, setChartData] = useState({
//   stockFlowMovement: [],
//   lowStockTrend: [],
//   lowStockTrendWarehouses: []
// });
//   const [activities, setActivities] = useState([]);
//   const [stockFlowStats, setStockFlowStats] = useState({
//     total: 0,
//     approved: 0,
//     in_transit: 0,
//     delivered: 0,
//     total_quantity: 0
//   });
//   const [loading, setLoading] = useState(true);

//   const fetchDashboardData = async () => {
//     try {
//       const response = await AuthService.getDashboard();
//       const data = response.data.data;

//       setDashboardData({
//         users: data.users || { total: 0, active: 0, inactive: 0 },
//         roles: { total: data.roles || 0 },
//         warehouses: data.warehouses || { total: 0, details: [] },
//         products: data.products || { total: 0 },
//         stocks: data.stocks || { total: 0, low: 0, outOfStock: 0, threshold: 10 },
//         lowStockProducts: data.lowStockProducts || [],
//         outOfStockProducts: data.outOfStockProducts || [],
//         stockByStatus: data.stockByStatus || [],
//         lowStockTrend: data.lowStockTrend || [],
//       });
//       if (data.charts) {
//       setChartData({
//         stockFlowMovement: data.charts.stockFlowMovement || [],
//         lowStockTrend: data.charts.lowStockTrend || [],
//         lowStockTrendWarehouses: data.charts.lowStockTrendWarehouses || []
//       });
//     }
//     } catch (error) {
//       console.error('Error fetching dashboard data:', error);
//       Swal.fire({
//         icon: 'error',
//         title: 'Error',
//         text: error.response?.data?.message || 'Failed to load dashboard data.',
//         confirmButtonText: 'OK'
//       });
//     }
//   };



//   const fetchActivities = async () => {
//   try {
//     const response = await AuthService.getActivities({ limit: 5 });
//     if (response.data.success) {
//       console.log('Fetched activities:', response.data.data);
//       setActivities(response.data.data || []);
//     }
//   } catch (error) {
//     console.error('Error fetching activities:', error);
//   }
// };


//   const fetchStockFlowStats = async () => {
//     try {
//       const response = await AuthService.getStockFlowStats();
//       if (response.data.success) {
//         setStockFlowStats(response.data.data || {
//           total: 0,
//           approved: 0,
//           in_transit: 0,
//           delivered: 0,
//           total_quantity: 0
//         });
//       }
//     } catch (error) {
//       console.error('Error fetching stock flow stats:', error);
//     }
//   };

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
//         fetchActivities(),
//         fetchStockFlowStats()
//       ]);
//       setLoading(false);
//     };
//     fetchAllData();
//   }, []);


//   const formatActivityTime = (createdAt) => {
//     const now = new Date();
//     const activityDate = new Date(createdAt);
//     const diffMs = now - activityDate;
//     const diffMins = Math.floor(diffMs / 60000);
    
//     if (diffMins < 1) return 'Just now';
//     if (diffMins < 60) return `${diffMins} min ago`;
    
//     const diffHours = Math.floor(diffMins / 60);
//     if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
//     const diffDays = Math.floor(diffHours / 24);
//     return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
//   };

//   const getActivityBadgeClass = (action) => {
//     const actionLower = (action || '').toLowerCase();
//     const actionMap = {
//       'create': 'badge-linesuccess',
//       'created': 'badge-linesuccess',
//       'update': 'badge-linewarning',
//       'updated': 'badge-linewarning',
//       'delete': 'badge-linedanger',
//       'deleted': 'badge-linedanger',
//       'inbound': 'badge-linesuccess',
//       'outbound': 'badge-lineprimary',
//       'transfer': 'badge-linewarning',
//       'approved': 'badge-linesuccess',
//       'in-transit': 'badge-linewarning',
//       'delivered': 'badge-linesuccess'
//     };
//     return actionMap[actionLower] || 'badge-secondary';
//   };

//   const formatLabel = (value) => {
//     if (!value) return '';
//     return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
//   };

  
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


//   const stockMovementChart = {
//   series: [
//     {
//       name: "Approved",
//       data: chartData.stockFlowMovement.map(d => d.approved || 0),
//     },
//     {
//       name: "In Transit",
//       data: chartData.stockFlowMovement.map(d => d['in-transit'] || 0),
//     },
//     {
//       name: "Delivered",
//       data: chartData.stockFlowMovement.map(d => d.delivered || 0),
//     },
//   ],
//   colors: ["#3B82F6", "#F59E0B", "#22C55E"],
//   chart: {
//     type: "line",
//     height: 320,
//     zoom: { enabled: true },
//     toolbar: { show: true },
//   },
//   dataLabels: { enabled: false },
//   stroke: { curve: 'smooth', width: 3 },
//   grid: { borderColor: '#e2e8f0' },
//   xaxis: {
//     categories: chartData.stockFlowMovement.map(d =>
//       new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
//     ),
//   },
//   legend: { position: 'top', horizontalAlign: 'right' },
//   tooltip: { 
//     shared: true, 
//     intersect: false,
//     y: {
//       formatter: (val) => val + " units"
//     }
//   },
// };

//   // Warehouse Distribution Chart
//   const warehouseChart = {
//     series: [{
//       name: "Stock Units",
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
//   const categoryChart = {
//     series: dashboardData.warehouses.details.map(wh => wh.products),
//     chart: { type: 'donut', height: 320 },
//     labels: dashboardData.warehouses.details.map(wh => wh.name),
//     colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'],
//     legend: { position: 'bottom' },

//     plotOptions: {
//       pie: {
//         donut: {
//           size: '65%',
//           labels: {
//             show: true,
//             total: {
//               show: true,
//               label: 'Total Products',
//               formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0),
//             },
//           },
//         },
//       },
//     },
//     dataLabels: { enabled: false },
//   };

//   const lowStockChart = {
//   series: chartData.lowStockTrendWarehouses.map(warehouse => ({
//     name: warehouse,
//     data: chartData.lowStockTrend.map(d => d[warehouse] || 0)
//   })),
//   colors: ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"], 
//   chart: { 
//     type: "bar", 
//     height: 320, 
//     toolbar: { show: true },
//     stacked: true 
//   },
//   plotOptions: {
//     bar: { 
//       horizontal: false, 
//       columnWidth: "55%",
//       borderRadius: 5
//     },
//   },
//   dataLabels: { enabled: false },
//   stroke: { show: true, width: 2, colors: ["transparent"] },
//   xaxis: {
//     categories: chartData.lowStockTrend.map(d =>
//       new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
//     ),
//   },
//   legend: { 
//     position: 'top',
//     horizontalAlign: 'right'
//   },
//   tooltip: {
//     shared: true,
//     intersect: false,
//     y: {
//       formatter: (val) => val + " products"
//     }
//   },
//   grid: { borderColor: '#e2e8f0' },
// };

//   // Stock Status Pie Chart
//   const stockStatusChart = {
//     series: dashboardData.stockByStatus.map(item => item.count),
//     chart: { type: 'pie', height: 320 },
//     labels: dashboardData.stockByStatus.map(item => formatLabel(item.status)),
//     colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
//     legend: { position: 'bottom' },
//     dataLabels: { enabled: true },
//   };

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

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="page-header mb-3">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>Dashboard</h4>
//               <h6>Real-time Management Overview</h6>
//             </div>
//           </div>
//           <div className="page-btn">
//             <button 
//               className="btn btn-primary"
//               onClick={() => {
//                 fetchDashboardData();
//                 fetchActivities();
//                 fetchStockFlowStats();
//               }}
//               disabled={loading}
//             >
//               <RefreshCw size={16} className="me-2" />
//               Refresh
//             </button>
//           </div>
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
//                 <h4>{dashboardData.products.total}</h4>
//                 <h5>Total Products</h5>
//               </div>
//               <div className="dash-imgs">
//                 <Tag />
//               </div>
//             </div>
//           </div>

//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-count das2">
//               <div className="dash-counts">
//                 <h4>{dashboardData.stocks.total}</h4>
//                 <h5>Total Stock Units</h5>
//               </div>
//               <div className="dash-imgs">
//                 <Layers />
//               </div>
//             </div>
//           </div>

//           <div className="col-xl-3 col-sm-6 col-12 d-flex">
//             <div className="dash-count das3">
//               <div className="dash-counts">
//                 <h4>{dashboardData.stocks.low}</h4>
//                 <h5>Low Stock Items</h5>
//               </div>
//               <div className="dash-imgs">
//                 <AlertTriangle color="#f59e0b" />
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Stock Alert Cards Row */}
//         <div className="row">
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
//         </div>

//         {/* Warehouse Details Cards */}
       
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
// </div>

//         {/* Charts Section */}
//         <div className="row">
//           <div className="col-xl-6 col-sm-12 col-12 d-flex">
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
//           </div>

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
//         </div>

//         <div className="row">
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
//         </div>

//         {/* Stock Status & Activity */}
//         <div className="row">
//           {dashboardData.stockByStatus.length > 0 && (
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
//           )}

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
//                   </span>
//                   {/* <Link to="/activities" className="btn btn-sm btn-light">View All</Link> */}
//                 </div>
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
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Dashboard;

//Main Dashboard - End



//Hidden items dashboard - Start
 
import React, { useState, useEffect } from "react";
import CountUp from "react-countup";
import {
  // Activity,
  // Clock,
  TrendingUp,
  // Package,
  UserCheck,
  // RefreshCw,
  Tag,
  Layers,
  Users,
  Shield,
  UserX,
  AlertTriangle,
  // XCircle,
  // AlertCircle,
} from "feather-icons-react/build/IconComponents";
import { Warehouse } from "lucide-react";
import Chart from "react-apexcharts";
// import { Link } from "react-router-dom";
import AuthService from "../../services/authService";
import Swal from "sweetalert2";
import { useSelector } from "react-redux";

const Dashboard = () => {

  const user = useSelector((state) => state.auth.user);


  const [dashboardData, setDashboardData] = useState({
    users: { total: 0, active: 0, inactive: 0 },
    roles: { total: 0 },
    warehouses: { total: 0, details: [] },
    articles: {total : 0 },
    // products: { total: 0},
    products: { total: 0 ,totalQuantity: 0  },
    
    stocks: { total: 0, low: 0, outOfStock: 0, threshold: 10 },
    lowStockProducts: [],
    outOfStockProducts: [],
    stockByStatus: [],
    lowStockTrend: [],
  });
// const [chartData, setChartData] = useState({
//   stockFlowMovement: [],
//   lowStockTrend: [],
//   lowStockTrendWarehouses: []
// });
  // const [activities, setActivities] = useState([]);
  // const [stockFlowStats, setStockFlowStats] = useState({
  //   total: 0,
  //   approved: 0,
  //   in_transit: 0,
  //   delivered: 0,
  //   total_quantity: 0
  // });
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const response = await AuthService.getDashboard();
      const data = response.data.data;

      setDashboardData({
        users: data.users || { total: 0, active: 0, inactive: 0 },
        roles: { total: data.roles || 0 },
        warehouses: data.warehouses || { total: 0, details: [] },
        articles: data.articles || { total: 0 },
        // products: data.products || { total: 0},
        products: data.products || { total: 0,totalQuantity: 0 },
        stocks: data.stocks || { total: 0, low: 0, outOfStock: 0, threshold: 10 },
        lowStockProducts: data.lowStockProducts || [],
        outOfStockProducts: data.outOfStockProducts || [],
        stockByStatus: data.stockByStatus || [],
        lowStockTrend: data.lowStockTrend || [],
      });
      //   if (data.charts) {
        //   setChartData({
          //     stockFlowMovement: data.charts.stockFlowMovement || [],
          //     lowStockTrend: data.charts.lowStockTrend || [],
          //     lowStockTrendWarehouses: data.charts.lowStockTrendWarehouses || []
          //   });
          // }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: error.response?.data?.message || 'Failed to load dashboard data.',
            confirmButtonText: 'OK'
          });
        }
      };
      
      console.log("lowstockkkkkkkkkkkkkkkkkkkk",dashboardData)


//   const fetchActivities = async () => {
//   try {
//     const response = await AuthService.getActivities({ limit: 5 });
//     if (response.data.success) {
//       console.log('Fetched activities:', response.data.data);
//       setActivities(response.data.data || []);
//     }
//   } catch (error) {
//     console.error('Error fetching activities:', error);
//   }
// };


  // const fetchStockFlowStats = async () => {
  //   try {
  //     const response = await AuthService.getStockFlowStats();
  //     if (response.data.success) {
  //       setStockFlowStats(response.data.data || {
  //         total: 0,
  //         approved: 0,
  //         in_transit: 0,
  //         delivered: 0,
  //         total_quantity: 0
  //       });
  //     }
  //   } catch (error) {
  //     console.error('Error fetching stock flow stats:', error);
  //   }
  // };

  useEffect(() => {
  // Fix scroll issue when navigating to dashboard
  window.scrollTo(0, 0);
  document.body.style.overflow = 'auto';
  
  return () => {
    document.body.style.overflow = 'auto';
  };
}, []);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchDashboardData(),
        // fetchActivities(),
        // fetchStockFlowStats()
      ]);
      setLoading(false);
    };
    fetchAllData();
  }, []);


  // const formatActivityTime = (createdAt) => {
  //   const now = new Date();
  //   const activityDate = new Date(createdAt);
  //   const diffMs = now - activityDate;
  //   const diffMins = Math.floor(diffMs / 60000);
    
  //   if (diffMins < 1) return 'Just now';
  //   if (diffMins < 60) return `${diffMins} min ago`;
    
  //   const diffHours = Math.floor(diffMins / 60);
  //   if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
  //   const diffDays = Math.floor(diffHours / 24);
  //   return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  // };

  // const getActivityBadgeClass = (action) => {
  //   const actionLower = (action || '').toLowerCase();
  //   const actionMap = {
  //     'create': 'badge-linesuccess',
  //     'created': 'badge-linesuccess',
  //     'update': 'badge-linewarning',
  //     'updated': 'badge-linewarning',
  //     'delete': 'badge-linedanger',
  //     'deleted': 'badge-linedanger',
  //     'inbound': 'badge-linesuccess',
  //     'outbound': 'badge-lineprimary',
  //     'transfer': 'badge-linewarning',
  //     'approved': 'badge-linesuccess',
  //     'in-transit': 'badge-linewarning',
  //     'delivered': 'badge-linesuccess'
  //   };
  //   return actionMap[actionLower] || 'badge-secondary';
  // };

  // const formatLabel = (value) => {
  //   if (!value) return '';
  //   return value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ');
  // };

  
  const today = new Date();


  const last30Days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    last30Days.push(new Date(d));
  }


  // const monthData = last30Days.map(date => {
  //   const dayData = dashboardData.lowStockTrend.find(item =>
  //     new Date(item.date).toDateString() === date.toDateString()
  //   );
  //   return {
  //     date,
  //     count: dayData ? dayData.count : 0
  //   };
  // });


//   const stockMovementChart = {
//   series: [
//     {
//       name: "Approved",
//       data: chartData.stockFlowMovement.map(d => d.approved || 0),
//     },
//     {
//       name: "In Transit",
//       data: chartData.stockFlowMovement.map(d => d['in-transit'] || 0),
//     },
//     {
//       name: "Delivered",
//       data: chartData.stockFlowMovement.map(d => d.delivered || 0),
//     },
//   ],
//   colors: ["#3B82F6", "#F59E0B", "#22C55E"],
//   chart: {
//     type: "line",
//     height: 320,
//     zoom: { enabled: true },
//     toolbar: { show: true },
//   },
//   dataLabels: { enabled: false },
//   stroke: { curve: 'smooth', width: 3 },
//   grid: { borderColor: '#e2e8f0' },
//   xaxis: {
//     categories: chartData.stockFlowMovement.map(d =>
//       new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
//     ),
//   },
//   legend: { position: 'top', horizontalAlign: 'right' },
//   tooltip: { 
//     shared: true, 
//     intersect: false,
//     y: {
//       formatter: (val) => val + " units"
//     }
//   },
// };

  // Warehouse Distribution Chart
  const warehouseChart = {
    series: [{
      name: "Product Units",
      data: dashboardData.warehouses.details.map(wh => wh.stock),
    }],
    colors: ["#8b5cf6"],
    chart: { type: "bar", height: 320, toolbar: { show: true } },
    plotOptions: {
      bar: { horizontal: false, columnWidth: "55%", borderRadius: 8 },
    },
    dataLabels: { enabled: false },
    stroke: { show: true, width: 2, colors: ["transparent"] },
    xaxis: {
      categories: dashboardData.warehouses.details.map(wh => wh.name),
    },
    fill: { opacity: 1 },
    tooltip: {
      y: { formatter: (val) => val + " units" },
    },
    grid: { borderColor: '#e2e8f0' },
  };

  // Product Category Distribution
  // const categoryChart = {
  //   series: dashboardData.warehouses.details.map(wh => wh.products),
  //   chart: { type: 'donut', height: 320 },
  //   labels: dashboardData.warehouses.details.map(wh => wh.name),
  //   colors: ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#ef4444'],
  //   legend: { position: 'bottom' },

  //   plotOptions: {
  //     pie: {
  //       donut: {
  //         size: '65%',
  //         labels: {
  //           show: true,
  //           total: {
  //             show: true,
  //             label: 'Total Products',
  //             formatter: (w) => w.globals.seriesTotals.reduce((a, b) => a + b, 0),
  //           },
  //         },
  //       },
  //     },
  //   },
  //   dataLabels: { enabled: false },
  // };

//   const lowStockChart = {
//   series: chartData.lowStockTrendWarehouses.map(warehouse => ({
//     name: warehouse,
//     data: chartData.lowStockTrend.map(d => d[warehouse] || 0)
//   })),
//   colors: ["#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6"], 
//   chart: { 
//     type: "bar", 
//     height: 320, 
//     toolbar: { show: true },
//     stacked: true 
//   },
//   plotOptions: {
//     bar: { 
//       horizontal: false, 
//       columnWidth: "55%",
//       borderRadius: 5
//     },
//   },
//   dataLabels: { enabled: false },
//   stroke: { show: true, width: 2, colors: ["transparent"] },
//   xaxis: {
//     categories: chartData.lowStockTrend.map(d =>
//       new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
//     ),
//   },
//   legend: { 
//     position: 'top',
//     horizontalAlign: 'right'
//   },
//   tooltip: {
//     shared: true,
//     intersect: false,
//     y: {
//       formatter: (val) => val + " products"
//     }
//   },
//   grid: { borderColor: '#e2e8f0' },
// };

  // Stock Status Pie Chart
  // const stockStatusChart = {
  //   series: dashboardData.stockByStatus.map(item => item.count),
  //   chart: { type: 'pie', height: 320 },
  //   labels: dashboardData.stockByStatus.map(item => formatLabel(item.status)),
  //   colors: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'],
  //   legend: { position: 'bottom' },
  //   dataLabels: { enabled: true },
  // };

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="content">
          <div className="text-center p-5">
            <div className="spinner-border text-primary" role="status" style={{ width: '3rem', height: '3rem' }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="mt-3">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }
//
  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header mb-3">
          <div className="add-item d-flex">
            <div className="page-title">
              {/* <h4>Dashboard</h4>
              <h6>Real-time Management Overview</h6> */}
               {user?.warehouse_name ? (
                  <>
                    <h4>{user.warehouse_name} Dashboard</h4>
                    <h6>Real-time Management Overview</h6>
                  </>
                ) : (
                  <>
                    <h4>Dashboard</h4>
                    <h6>Real-time Management Overview</h6>
                  </>
                )}
            </div>
          </div>


        {/* Gradient Header Style */}
           {/* <div className="content"> */}
        {/* <div className="dashboard-header">
          <div className="dashboard-header-content">
            <div className="d-flex align-items-center">
              {user?.warehouse_name && (
                <div className="warehouse-icon-wrapper">
                  <Warehouse size={18} />
                </div>
              )}
              <div className="flex-grow-1">
                {user?.warehouse_name ? (
                  <>
                    <h4>Welcome {user.warehouse_name}</h4>
                    <h6>Real-time Management Overview</h6>
                  </>
                ) : (
                  <>
                    <h4>Dashboard</h4>
                    <h6>Real-time Management Overview</h6>
                  </>
                )}
              </div>
              {user?.role && (
                <div className="dashboard-warehouse-badge">
                  <span>{user.role}</span>
                </div>
              )}
            </div> */}
          {/* <div className="page-btn">
            <button 
              className="btn btn-primary"
              onClick={() => {
                fetchDashboardData();
                // fetchActivities();
                // fetchStockFlowStats();
              }}
              disabled={loading}
            >
              <RefreshCw size={16} className="me-2" />
              Refresh
            </button>
          </div> */}
        </div>

        {/* User & System Stats Row */}
        <div className="row">
          <div className="col-xl-3 col-sm-6 col-12 d-flex">
            <div className="dash-widget w-100">
              <div className="dash-imgs">
                <Users size={24} color="#ff9f43" />
              </div>
              <div className="dash-widgetcontent">
                <h5><CountUp start={0} end={dashboardData.users.total} duration={2} /></h5>
                <h6>Total Users</h6>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-sm-6 col-12 d-flex">
            <div className="dash-widget dash1 w-100">
              <div className="dash-imgs">
                <UserCheck size={24} color="#22c55e" /> 
              </div>
              <div className="dash-widgetcontent">
                <h5><CountUp start={0} end={dashboardData.users.active} duration={2} /></h5>
                <h6>Active Users</h6>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-sm-6 col-12 d-flex">
            <div className="dash-widget dash2 w-100">
              <div className="dash-imgs">
                <UserX size={24} color="#ef4444" /> 
              </div>
              <div className="dash-widgetcontent">
                <h5><CountUp start={0} end={dashboardData.users.inactive} duration={2} /></h5>
                <h6>Inactive Users</h6>
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-sm-6 col-12 d-flex">
            <div className="dash-widget dash3 w-100">
              <div className="dash-imgs">
                <Shield size={24} color="#1b2850" />
              </div>
              <div className="dash-widgetcontent">
                <h5><CountUp start={0} end={dashboardData.roles.total} duration={2} /></h5>
                <h6>All Roles</h6>
              </div>
            </div>
          </div>
        </div>

        {/* Warehouse & Stock Stats Row */}
        <div className="row">
          <div className="col-xl-3 col-sm-6 col-12 d-flex">
            <div className="dash-count">
              <div className="dash-counts">
                <h4>{dashboardData.warehouses.total}</h4>
                <h5>Total Warehouses</h5>
              </div>
              <div className="dash-imgs">
                <Warehouse />
              </div>
            </div>
          </div>

          <div className="col-xl-3 col-sm-6 col-12 d-flex">
            <div className="dash-count das1">
              <div className="dash-counts">
                <h4>{dashboardData.articles.total}</h4>
                <h5>Total Articles</h5>
              </div>
              <div className="dash-imgs">
                <Tag />
              </div>
            </div>
          </div>


          <div className="col-xl-3 col-sm-6 col-12 d-flex">
            <div className="dash-count das2">
              <div className="dash-counts">
                <h4>{dashboardData.products.total}</h4>
                <h5>Total Products</h5>
              </div>
              <div className="dash-imgs">
                <Layers />
              </div>
            </div>
          </div>

          {/* <div className="col-xl-3 col-sm-6 col-12 d-flex">
            <div className="dash-count das2">
              <div className="dash-counts">
                <h4>{dashboardData.stocks.total}</h4>
                <h5>Total Stock Units</h5>
              </div>
              <div className="dash-imgs">
                <Layers />
              </div>
            </div>
          </div> */}

          <div className="col-xl-3 col-sm-6 col-12 d-flex">
            <div className="dash-count das3">
              <div className="dash-counts">
                <h4>{dashboardData.stocks.low}</h4>
                <h5>Total Articles Shortage</h5>
              </div>
              <div className="dash-imgs">
                <AlertTriangle color="#f59e0b" />
              </div>
            </div>
          </div>
        </div>

        {/* Stock Alert Cards Row */}
        {/* <div className="row">
          <div className="col-xl-8 col-12">
            <div className="card">
              <div className="card-header bg-warning bg-opacity-10 border-warning">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0 text-warning">
                    <AlertTriangle size={20} className="me-2" />
                    Low Stock Alert ({dashboardData.stocks.low})
                  </h5>
                  <Link to="/inventory/low-stocks" className="btn btn-sm btn-warning">
                    View All
                  </Link>
                </div>
              </div>
              <div className="card-body">
                {dashboardData.lowStockProducts.length === 0 ? (
                  <div className="text-center py-4">
                    <AlertCircle size={48} className="text-muted mb-2" />
                    <p className="text-muted">No low stock items</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Warehouse</th>
                          <th>Qty</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.lowStockProducts.map(product => (
                          <tr key={product.id}>
                            <td>
                              <div>
                                <strong>{product.title}</strong>
                                <br />
                                <small className="text-muted">{product.barcode}</small>
                              </div>
                            </td>
                            <td>{product.warehouse_name}</td>
                            <td>
                              <span className="badge badge-warning">{product.count}</span>
                            </td>
                            <td>
                              <span className={`badge badge-${
                                product.status === 'new' ? 'success' :
                                product.status === 'used' ? 'info' :
                                product.status === 'broken' ? 'danger' : 'secondary'
                              }`}>
                                {product.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-xl-4 col-12">
            <div className="card">
              <div className="card-header bg-danger bg-opacity-10 border-danger">
                <div className="d-flex justify-content-between align-items-center">
                  <h5 className="card-title mb-0 text-danger">
                    <XCircle size={20} className="me-2" />
                    Out of Stock ({dashboardData.stocks.outOfStock})
                  </h5>
                  <Link to="/inventory/low-stocks" className="btn btn-sm btn-danger">
                    View All
                  </Link>
                </div>
              </div>
              <div className="card-body">
                {dashboardData.outOfStockProducts.length === 0 ? (
                  <div className="text-center py-4">
                    <Package size={48} className="text-muted mb-2" />
                    <p className="text-muted">No out of stock items</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Warehouse</th>
                          <th>Last Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dashboardData.outOfStockProducts.map(product => (
                          <tr key={product.id}>
                            <td>
                              <div>
                                <strong>{product.title}</strong>
                                <br />
                                <small className="text-muted">{product.barcode}</small>
                              </div>
                            </td>
                            <td>{product.warehouse_name}</td>
                            <td>
                              <small>
                                {new Date(product.updated_at).toLocaleDateString()}
                              </small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div> */}

        {/* Warehouse Details Cards */}
{/*        
<div className="row">
  {dashboardData.warehouses.details.length > 0 ? (
    dashboardData.warehouses.details.map((wh) => (
      <div key={wh.id} className="col-xl-3 col-sm-6 col-12 d-flex">
        <div className="warehouse-card w-100">
          <div className="warehouse-card-body">
            <div className="warehouse-header">
              <h4>{wh.name}</h4>
              {(wh.lowStock > 0 || wh.outOfStock > 0) && (
                <AlertTriangle size={16} className="alert-icon" />
              )}
            </div>
            <div className="warehouse-stats">
              <div className="stat-row">
                <span className="stat-label">Products</span>
                <span className="stat-value">{wh.products}</span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Stock Units</span>
                <span className="stat-value">
                  {wh.stock.toLocaleString()}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Low Stock</span>
                <span className="stat-value low-stock">
                  {wh.lowStock}
                </span>
              </div>
              <div className="stat-row">
                <span className="stat-label">Out of Stock</span>
                <span className="stat-value out-of-stock">
                  {wh.outOfStock}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ))
  ) : (
    <div className="col-12">
      <div className="alert-info-custom">
        <p>No warehouse data available. Add warehouses and products to see statistics.</p>
      </div>
    </div>
  )}
</div> */}


{/* <div className="warehouse-cards-wrapper">
  <div className="row">
    {dashboardData.warehouses.details.length > 0 ? (
      dashboardData.warehouses.details.map((wh) => (
        <div key={wh.id} className="col-xl-3 col-sm-6 col-12 d-flex">
          <div className="warehouse-card w-100">
            <div className="warehouse-card-body">
              <div className="warehouse-header">
                <h4>{wh.name}</h4>
                {(wh.lowStock > 0 || wh.outOfStock > 0) && (
                  <AlertTriangle size={16} className="alert-icon" />
                )}
              </div>
              <div className="warehouse-stats">
                <div className="stat-row">
                  <span className="stat-label">Articles</span>
                  <span className="stat-value">{wh.articles}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Products</span>
                  <span className="stat-value">{wh.products.total}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Stock Units</span>
                  <span className="stat-value">{wh.stock.toLocaleString()}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Low Stock</span>
                  <span className="stat-value low-stock">{wh.lowStock}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Out of Stock</span>
                  <span className="stat-value out-of-stock">{wh.outOfStock}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="col-12">
        <div className="alert-info-custom">
          <p>No warehouse data available. Add warehouses and products to see statistics.</p>
        </div>
      </div>
    )}
  </div>
</div> */}


<div className="warehouse-cards-wrapper">
  <div className="row">
    {dashboardData.warehouses.details.length > 0 ? (
      dashboardData.warehouses.details.map((wh) => (
        <div key={wh.id} className="col-xl-3 col-sm-6 col-12 d-flex">
          <div className="warehouse-card w-100">
            <div className="warehouse-card-body">
              <div className="warehouse-header">
                <h4>{wh.name}</h4>
                {(wh.lowStock > 0 || wh.outOfStock > 0) && (
                  <AlertTriangle size={16} className="alert-icon" />
                )}
              </div>
              <div className="warehouse-stats">
                <div className="stat-row">
                  <span className="stat-label">Article Profiles</span>
                  <span className="stat-value">{wh.articles || 0}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Total Products</span>
                  <span className="stat-value">{wh.products || 0}</span>
                </div>
                <div className="stat-row">
                  <span className="stat-label">Low Stock Articles</span>
                  <span className="stat-value low-stock">{wh.lowStock || 0}</span>
                </div>
                {/* <div className="stat-row">
                  <span className="stat-label">Out of Stock</span>
                  <span className="stat-value out-of-stock">{wh.outOfStock || 0}</span>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className="col-12">
        <div className="alert-info-custom">
          <p>No warehouse data available. Add warehouses and products to see statistics.</p>
        </div>
      </div>
    )}
  </div>
</div>



        {/* Charts Section */}
        <div className="row">
          {/* <div className="col-xl-6 col-sm-12 col-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Stock Flow Movement</h5>
                <div className="d-flex gap-2">
                  <span className="badge bg-warning">{stockFlowStats.in_transit} In Transit</span>
                  <span className="badge bg-success">{stockFlowStats.delivered} Delivered</span>
                </div>
              </div>
              <div className="card-body">
                <Chart
                  options={stockMovementChart}
                  series={stockMovementChart.series}
                  type="line"
                  height={320}
                />
              </div>
            </div>
          </div> */}

          <div className="col-xl-6 col-sm-12 col-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Warehouse Stock Distribution</h5>
                <TrendingUp size={20} className="text-success" />
              </div>
              <div className="card-body">
                {dashboardData.warehouses.details.length > 0 ? (
                  <Chart
                    options={warehouseChart}
                    series={warehouseChart.series}
                    type="bar"
                    height={320}
                  />
                ) : (
                  <div className="text-center p-5">
                    <p>No warehouse data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>


             {/* <div className="col-xl-6 col-sm-12 col-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Product Distribution by Warehouse</h5>
                <Package size={20} className="text-primary" />
              </div>
              <div className="card-body">
                {dashboardData.warehouses.details.length > 0 ? (
                  <Chart
                    options={categoryChart}
                    series={categoryChart.series}
                    type="donut"
                    height={320}
                  />
                ) : (
                  <div className="text-center p-5">
                    <p>No product data available</p>
                  </div>
                )}
              </div>
            </div>
          </div> */}
        </div>

        {/* <div className="row">
          <div className="col-xl-6 col-sm-12 col-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Product Distribution by Warehouse</h5>
                <Package size={20} className="text-primary" />
              </div>
              <div className="card-body">
                {dashboardData.warehouses.details.length > 0 ? (
                  <Chart
                    options={categoryChart}
                    series={categoryChart.series}
                    type="donut"
                    height={320}
                  />
                ) : (
                  <div className="text-center p-5">
                    <p>No product data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="col-xl-6 col-sm-12 col-12 d-flex">
            <div className="card flex-fill">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0">Low Stock Alert Trend (Last 30 Days)</h5>
                <span className="badge bg-danger">
                  {dashboardData.stocks.low} Critical
                </span>
              </div>
              <div className="card-body">
                {dashboardData.lowStockTrend.length > 0 ? (
                  <Chart
                    options={lowStockChart}
                    series={lowStockChart.series}
                    type="area"
                    height={320}
                  />
                ) : (
                  <div className="text-center p-5">
                    <p>No trend data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div> */}

        {/* Stock Status & Activity */}
        <div className="row">
          {/* {dashboardData.stockByStatus.length > 0 && (
            <div className="col-xl-4 col-sm-8 col-8 d-flex">
              <div className="card flex-fill">
                <div className="card-header">
                  <h5 className="card-title mb-0">Stock by Status</h5>
                </div>
                <div className="card-body">
                  <Chart
                    options={stockStatusChart}
                    series={stockStatusChart.series}
                    type="pie"
                    height={320}
                  />
                </div>
              </div>
            </div>
          )} */}
{/* 
          <div className={`col-xl-${dashboardData.stockByStatus.length > 0 ? '8' : '12'} col-sm-12 col-12 d-flex`}>
            <div className="card flex-fill">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h4 className="card-title mb-0">
                  <Activity size={20} className="me-2" style={{ display: 'inline' }} />
                  Live Activity
                </h4>
                <div className="d-flex align-items-center gap-2">
                  <span className="badge bg-success">
                    <span className="pulse-dot"></span>
                    Live
                  </span> */}
                  {/* <Link to="/activities" className="btn btn-sm btn-light">View All</Link> */}
                {/* </div>
              </div>
              <div className="card-body">
                {activities.length === 0 ? (
                  <div className="text-center py-4">
                    <Activity size={48} className="text-muted mb-2" />
                    <p className="text-muted">No recent activities</p>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Action</th>
                          <th>Description</th>
                          <th>Performed By</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.map(activity => (
                          <tr key={activity.id}>
                            <td>
                              <span className={`badge ${getActivityBadgeClass(activity.action)}`}>
                                {formatLabel(activity.action)}
                              </span>
                            </td>
                            <td>
                              <strong>{activity.entity_name || 'N/A'}</strong>
                              <br />
                              <small className="text-muted">{activity.description}</small>
                            </td>
                            <td>
                              <small>{activity.user_name}</small>
                            </td>
                            <td>
                              <Clock size={14} className="me-1" />
                              <small>{formatActivityTime(activity.created_at)}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div> */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

//Hidden items dashboard - End


















