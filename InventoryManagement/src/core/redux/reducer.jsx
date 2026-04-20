
import { combineReducers } from 'redux';
import productReducer from './slices/productSlice';
import brandReducer from './slices/brandSlice'; 
import customerReducer from './slices/customerSlice'
import dashboardReducer from './slices/dashboardSlice';
import hrReducer from './slices/hrSlice';
import inventoryReducer from './slices/inventorySlice';
import reportReducer from './slices/reportSlice';
import salesReducer from './slices/salesSlice';
import supplierReducer from './slices/supplierSlice';
import uiReducer from './slices/uiSlice'
import userReducer from './slices/userSlice'
import authReducer from './slices/authSlice'
import menuReducer from './slices/menuSlice'
import warehouseReducer from './slices/warehouseSlice'
import stockFlowReducer from './slices/stockSlice'
import articleReducer from './slices/articleSlice'


const rootReducer = combineReducers({
  auth:authReducer,
  user:userReducer,
  dashboard:dashboardReducer,
  articles:articleReducer,
  products: productReducer,
  warehouse:warehouseReducer,
  stockFlow:stockFlowReducer,
  customer: customerReducer,
  hr:hrReducer,
  inventory:inventoryReducer,
  report:reportReducer,
  sales:salesReducer,
  supplier: supplierReducer,
  ui:uiReducer,
  brand:brandReducer,
  menu:menuReducer
});

export default rootReducer;
