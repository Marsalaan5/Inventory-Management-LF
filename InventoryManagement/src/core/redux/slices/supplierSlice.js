


// TO DO


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch supplier data from backend
export const fetchSupplierData = createAsyncThunk(
  'supplier/fetchSupplierData',
  async () => {
    const response = await fetch('/api/suppliers'); // Update with your real API endpoint
    if (!response.ok) throw new Error('Failed to fetch supplier data');
    return await response.json();
  }
);

const initialState = {
  supplierdata: [],  // Start with empty array or keep SupplierData for fallback
  status: 'idle',
  error: null,
};

const supplierSlice = createSlice({
  name: 'supplier',
  initialState,
  reducers: {
    setSupplierData: (state, action) => {
      state.supplierdata = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSupplierData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchSupplierData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.supplierdata = action.payload;
      })
      .addCase(fetchSupplierData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setSupplierData } = supplierSlice.actions;
export default supplierSlice.reducer;
