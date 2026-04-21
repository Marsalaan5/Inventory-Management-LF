


// stockFlowSlice.js - need to fix for log activity during status update

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from '../../../services/authService';

// Async thunk to fetch stock flows
export const fetchStockFlows = createAsyncThunk(
  'stockFlow/fetchStockFlows',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await AuthService.getStockFlows(filters);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to fetch stock flow by ID
export const fetchStockFlowById = createAsyncThunk(
  'stockFlow/fetchStockFlowById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await AuthService.getStockFlowById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to create stock flow
export const createStockFlow = createAsyncThunk(
  'stockFlow/createStockFlow',
  async (stockFlowData, { rejectWithValue }) => {
    try {
      const response = await AuthService.createStockFlow(stockFlowData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to update stock flow
export const updateStockFlow = createAsyncThunk(
  'stockFlow/updateStockFlow',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await AuthService.updateStockFlowById(id, data);
      console.log('Update response:', response.data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to delete stock flow
export const deleteStockFlow = createAsyncThunk(
  'stockFlow/deleteStockFlow',
  async (id, { rejectWithValue }) => {
    try {
      await AuthService.deleteStockFlow(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to fetch statistics
export const fetchStockFlowStats = createAsyncThunk(
  'stockFlow/fetchStockFlowStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.getStockFlowStats();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Fetch dynamic options from backend
export const fetchStockFlowOptions = createAsyncThunk(
  'stockFlow/fetchStockFlowOptions',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.getStockFlowOptions();
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Dispatch stock flow
export const dispatchStockFlow = createAsyncThunk(
  "stockFlow/dispatchStockFlow",
  async (id, { rejectWithValue }) => {
    try {
      const res = await AuthService.dispatchStockFlow(id);
      console.log('🚀 Dispatch API response:', res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

// Receive stock flow
export const receiveStockFlow = createAsyncThunk(
  'stockFlow/receive',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await AuthService.receiveStockFlow(id, data);
      console.log('📦 Receive API response:', res.data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message);
    }
  }
);

const initialState = {
  stockFlows: [],
  currentStockFlow: null,
  stats: {
    total: 0,
    approved: 0,
    in_transit: 0,
    delivered: 0,
    total_quantity: 0,
  },
  filters: {
    search: '',
    status: '',
    transport: '',
    from_wh: '',
    to_wh: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  options: {
    transport: [],
    status: [],
    sort: [],
    loading: false,
    error: null,
  },
  status: 'idle',
  error: null,
  createStatus: 'idle',
  updateStatus: 'idle',
  deleteStatus: 'idle',
  statsStatus: 'idle',
};

const stockFlowSlice = createSlice({
  name: 'stockFlow',
  initialState,
  reducers: {
    setStockFlows: (state, action) => {
      state.stockFlows = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentStockFlow: (state, action) => {
      state.currentStockFlow = action.payload;
    },
    clearCurrentStockFlow: (state) => {
      state.currentStockFlow = null;
    },
    resetStockFlowState: () => {
      return initialState;
    },
    clearError: (state) => {
      state.error = null;
      state.options.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Stock Flows
      .addCase(fetchStockFlows.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchStockFlows.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.stockFlows = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchStockFlows.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // Fetch Stock Flow By ID
      .addCase(fetchStockFlowById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchStockFlowById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentStockFlow = action.payload;
      })
      .addCase(fetchStockFlowById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Create Stock Flow
      .addCase(createStockFlow.pending, (state) => {
        state.createStatus = 'loading';
      })
      .addCase(createStockFlow.fulfilled, (state) => {
        state.createStatus = 'succeeded';
      })
      .addCase(createStockFlow.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = action.payload;
      })

      // Update Stock Flow
      .addCase(updateStockFlow.pending, (state) => {
        state.updateStatus = 'loading';
        state.error = null;
      })
      .addCase(updateStockFlow.fulfilled, (state, action) => {
        console.log('✅ Update fulfilled with payload:', action.payload);
        
        state.updateStatus = 'succeeded';
        
        const index = state.stockFlows.findIndex(sf => sf.id === action.payload.id);
        
        if (index !== -1) {
          // Create a new array with the updated item
          state.stockFlows = [
            ...state.stockFlows.slice(0, index),
            { ...action.payload },
            ...state.stockFlows.slice(index + 1)
          ];
        }
        
        if (state.currentStockFlow && state.currentStockFlow.id === action.payload.id) {
          state.currentStockFlow = { ...action.payload };
        }
        
        state.error = null;
      })
      .addCase(updateStockFlow.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload;
        console.error('❌ Update rejected:', action.payload);
      })

      // Delete Stock Flow
      .addCase(deleteStockFlow.pending, (state) => {
        state.deleteStatus = 'loading';
      })
      .addCase(deleteStockFlow.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded';
        state.stockFlows = state.stockFlows.filter(sf => sf.id !== action.payload);
      })
      .addCase(deleteStockFlow.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.error = action.payload;
      })

      // Fetch Stats
      .addCase(fetchStockFlowStats.pending, (state) => {
        state.statsStatus = 'loading';
      })
      .addCase(fetchStockFlowStats.fulfilled, (state, action) => {
        state.statsStatus = 'succeeded';
        state.stats = action.payload;
      })
      .addCase(fetchStockFlowStats.rejected, (state, action) => {
        state.statsStatus = 'failed';
        state.error = action.payload;
      })

      // Fetch Stock Flow Options
      .addCase(fetchStockFlowOptions.pending, (state) => {
        state.options.loading = true;
        state.options.error = null;
      })
      .addCase(fetchStockFlowOptions.fulfilled, (state, action) => {
        state.options.loading = false;
        state.options.transport = action.payload.transport || [];
        state.options.status = action.payload.status || [];
        state.options.sort = action.payload.sort || [];
        state.options.error = null;
      })
      .addCase(fetchStockFlowOptions.rejected, (state, action) => {
        state.options.loading = false;
        state.options.error = action.payload;
      })

      // ✅ FIXED: Dispatch Stock Flow
      .addCase(dispatchStockFlow.pending, (state) => {
        state.updateStatus = 'loading';
        state.error = null;
      })
      .addCase(dispatchStockFlow.fulfilled, (state, action) => {
        console.log('✅ Dispatch fulfilled:', action.payload);
        
        state.updateStatus = 'succeeded';
        
        // Extract the updated stock flow from response
        const updatedStockFlow = action.payload.data;
        
        // Find the index
        const index = state.stockFlows.findIndex(sf => sf.id === updatedStockFlow.id);
        
        if (index !== -1) {
          // ✅ Create a NEW array with the updated item (this triggers React re-render)
          state.stockFlows = [
            ...state.stockFlows.slice(0, index),
            { ...updatedStockFlow },
            ...state.stockFlows.slice(index + 1)
          ];
          
          console.log('✅ Updated stock flow at index', index);
          console.log('✅ New status:', state.stockFlows[index].status);
          console.log('✅ New actions:', state.stockFlows[index].actions);
        }
        
        // Update current stock flow if viewing details
        if (state.currentStockFlow?.id === updatedStockFlow.id) {
          state.currentStockFlow = { ...updatedStockFlow };
        }
        
        state.error = null;
      })
      .addCase(dispatchStockFlow.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload || 'Failed to dispatch stock flow';
        console.error('❌ Dispatch rejected:', action.payload);
      })

      // ✅ FIXED: Receive Stock Flow
      .addCase(receiveStockFlow.pending, (state) => {
        state.updateStatus = 'loading';
        state.error = null;
      })
      .addCase(receiveStockFlow.fulfilled, (state, action) => {
        console.log('✅ Receive fulfilled:', action.payload);
        
        state.updateStatus = 'succeeded';
        
        // Extract the updated stock flow from response
        const updatedStockFlow = action.payload.data;
        
        // Find the index
        const index = state.stockFlows.findIndex(sf => sf.id === updatedStockFlow.id);
        
        if (index !== -1) {
          // ✅ Create a NEW array with the updated item (this triggers React re-render)
          state.stockFlows = [
            ...state.stockFlows.slice(0, index),
            { ...updatedStockFlow },
            ...state.stockFlows.slice(index + 1)
          ];
          
          console.log('✅ Updated stock flow at index', index);
          console.log('✅ New status:', state.stockFlows[index].status);
          console.log('✅ New actions:', state.stockFlows[index].actions);
        }
        
        // Update current stock flow if viewing details
        if (state.currentStockFlow?.id === updatedStockFlow.id) {
          state.currentStockFlow = { ...updatedStockFlow };
        }
        
        state.error = null;
      })
      .addCase(receiveStockFlow.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload || 'Failed to receive stock flow';
        console.error('❌ Receive rejected:', action.payload);
      });
  },
});

export const {
  setStockFlows,
  setFilters,
  resetFilters,
  setCurrentStockFlow,
  clearCurrentStockFlow,
  resetStockFlowState,
  clearError,
} = stockFlowSlice.actions;

export default stockFlowSlice.reducer;