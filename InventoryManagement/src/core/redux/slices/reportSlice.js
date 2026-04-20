

//TO DO 


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch invoice report data
export const fetchInvoiceReportData = createAsyncThunk(
  'report/fetchInvoiceReportData',
  async () => {
    const response = await fetch('/api/reports/invoice');
    if (!response.ok) throw new Error('Failed to fetch invoice report data');
    return await response.json();
  }
);

// Async thunk to fetch call history data
export const fetchCallHistoryData = createAsyncThunk(
  'report/fetchCallHistoryData',
  async () => {
    const response = await fetch('/api/reports/call-history');
    if (!response.ok) throw new Error('Failed to fetch call history data');
    return await response.json();
  }
);

const initialState = {
  invoicereport_data: [],  // start empty or you can keep your static data if you want
  callhistory_data: [],

  invoice_status: 'idle',
  callhistory_status: 'idle',

  invoice_error: null,
  callhistory_error: null,
};

const reportSlice = createSlice({
  name: 'report',
  initialState,
  reducers: {
    setInvoiceReportData: (state, action) => {
      state.invoicereport_data = action.payload;
    },
    setCallHistoryData: (state, action) => {
      state.callhistory_data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Invoice report
      .addCase(fetchInvoiceReportData.pending, (state) => {
        state.invoice_status = 'loading';
        state.invoice_error = null;
      })
      .addCase(fetchInvoiceReportData.fulfilled, (state, action) => {
        state.invoice_status = 'succeeded';
        state.invoicereport_data = action.payload;
      })
      .addCase(fetchInvoiceReportData.rejected, (state, action) => {
        state.invoice_status = 'failed';
        state.invoice_error = action.error.message;
      })
      // Call history
      .addCase(fetchCallHistoryData.pending, (state) => {
        state.callhistory_status = 'loading';
        state.callhistory_error = null;
      })
      .addCase(fetchCallHistoryData.fulfilled, (state, action) => {
        state.callhistory_status = 'succeeded';
        state.callhistory_data = action.payload;
      })
      .addCase(fetchCallHistoryData.rejected, (state, action) => {
        state.callhistory_status = 'failed';
        state.callhistory_error = action.error.message;
      });
  },
});

export const { setInvoiceReportData, setCallHistoryData } = reportSlice.actions;
export default reportSlice.reducer;





