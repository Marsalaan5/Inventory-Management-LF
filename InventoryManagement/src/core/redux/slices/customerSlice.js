

//TO DO from API 

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CustomerData } from '../../json/customer_data';

// Async thunk for fetching customer data from API
export const fetchCustomerData = createAsyncThunk(
  'customer/fetchCustomerData',
  async () => {
    const response = await fetch('https://your-api.com/customers');
    if (!response.ok) throw new Error('Failed to fetch customers');
    const data = await response.json();
    return data;
  }
);

const initialState = {
  customerdata: CustomerData, // static data initially
  status: 'idle',
  error: null,
};

const customerSlice = createSlice({
  name: 'customer',
  initialState,
  reducers: {
    setCustomerData: (state, action) => {
      state.customerdata = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCustomerData.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCustomerData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.customerdata = action.payload;
      })
      .addCase(fetchCustomerData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setCustomerData } = customerSlice.actions;
export default customerSlice.reducer;
