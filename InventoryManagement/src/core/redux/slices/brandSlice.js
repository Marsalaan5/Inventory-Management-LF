



//To DO 

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch brands from backend API
export const fetchBrands = createAsyncThunk(
  'brand/fetchBrands',
  async () => {
    const response = await fetch('https://your-backend-api.com/brands');
    if (!response.ok) throw new Error('Failed to fetch brands');
    const data = await response.json();
    return data;
  }
);

const initialState = {
  brand_list: [], 
  status: 'idle',
  error: null,
};

const brandSlice = createSlice({
  name: 'brand',
  initialState,
  reducers: {
    setBrandList: (state, action) => {
      state.brand_list = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state) => {
        
        state.status = 'loading';
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.brand_list = action.payload;
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setBrandList } = brandSlice.actions;
export default brandSlice.reducer;
