
//TO Do 

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch sales returns data
export const fetchSalesReturnsData = createAsyncThunk(
  'sales/fetchSalesReturnsData',
  async () => {
    const response = await fetch('/api/sales/returns');
    if (!response.ok) throw new Error('Failed to fetch sales returns data');
    return await response.json();
  }
);

// Async thunk to fetch quotation list data
export const fetchQuotationListData = createAsyncThunk(
  'sales/fetchQuotationListData',
  async () => {
    const response = await fetch('/api/sales/quotations');
    if (!response.ok) throw new Error('Failed to fetch quotation list data');
    return await response.json();
  }
);

const initialState = {
  salesreturns_data: [], // start empty or keep your static data here
  quotationlist_data: [],

  salesreturns_status: 'idle',
  quotationlist_status: 'idle',

  salesreturns_error: null,
  quotationlist_error: null,
};

const salesSlice = createSlice({
  name: 'sales',
  initialState,
  reducers: {
    setSalesReturnsData: (state, action) => {
      state.salesreturns_data = action.payload;
    },
    setQuotationListData: (state, action) => {
      state.quotationlist_data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Sales returns
      .addCase(fetchSalesReturnsData.pending, (state) => {
        state.salesreturns_status = 'loading';
        state.salesreturns_error = null;
      })
      .addCase(fetchSalesReturnsData.fulfilled, (state, action) => {
        state.salesreturns_status = 'succeeded';
        state.salesreturns_data = action.payload;
      })
      .addCase(fetchSalesReturnsData.rejected, (state, action) => {
        state.salesreturns_status = 'failed';
        state.salesreturns_error = action.error.message;
      })

      // Quotation list
      .addCase(fetchQuotationListData.pending, (state) => {
        state.quotationlist_status = 'loading';
        state.quotationlist_error = null;
      })
      .addCase(fetchQuotationListData.fulfilled, (state, action) => {
        state.quotationlist_status = 'succeeded';
        state.quotationlist_data = action.payload;
      })
      .addCase(fetchQuotationListData.rejected, (state, action) => {
        state.quotationlist_status = 'failed';
        state.quotationlist_error = action.error.message;
      });
  },
});

export const {
  setSalesReturnsData,
  setQuotationListData,
} = salesSlice.actions;

export default salesSlice.reducer;
