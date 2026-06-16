

//TO DO 


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { dashboarrecentproductddata } from '../../json/dashboarddata';
import { expiredproductdata } from '../../json/dashboardexpiredproduct';
import { salestransaction } from '../../json/salesdashboardrecenttranscation';


export const fetchRecentProducts = createAsyncThunk(
  'dashboard/fetchRecentProducts',
  async () => {
    const response = await fetch('/api/dashboard/recent-products');
    if (!response.ok) throw new Error('Failed to fetch recent products');
    return await response.json();
  }
);

export const fetchExpiredProducts = createAsyncThunk(
  'dashboard/fetchExpiredProducts',
  async () => {
    const response = await fetch('/api/dashboard/expired-products');
    if (!response.ok) throw new Error('Failed to fetch expired products');
    return await response.json();
  }
);

export const fetchSalesTransactions = createAsyncThunk(
  'dashboard/fetchSalesTransactions',
  async () => {
    const response = await fetch('/api/dashboard/sales-transactions');
    if (!response.ok) throw new Error('Failed to fetch sales transactions');
    return await response.json();
  }
);

const initialState = {
  dashboard_recentproduct: dashboarrecentproductddata,
  dashboard_expiredproduct: expiredproductdata,
  saleshdashboard_recenttransaction: salestransaction,
  status: 'idle',
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setRecentProducts: (state, action) => {
      state.dashboard_recentproduct = action.payload;
    },
    setExpiredProducts: (state, action) => {
      state.dashboard_expiredproduct = action.payload;
    },
    setSalesTransactions: (state, action) => {
      state.saleshdashboard_recenttransaction = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecentProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchRecentProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.dashboard_recentproduct = action.payload;
      })
      .addCase(fetchRecentProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchExpiredProducts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchExpiredProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.dashboard_expiredproduct = action.payload;
      })
      .addCase(fetchExpiredProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchSalesTransactions.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchSalesTransactions.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.saleshdashboard_recenttransaction = action.payload;
      })
      .addCase(fetchSalesTransactions.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const {
  setRecentProducts,
  setExpiredProducts,
  setSalesTransactions,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
