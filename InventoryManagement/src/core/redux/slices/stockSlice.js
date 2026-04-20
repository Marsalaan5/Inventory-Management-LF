

// // stockFlowSlice.js 

// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import AuthService from '../../../services/authService';

// // Async thunk to fetch stock flows
// export const fetchStockFlows = createAsyncThunk(
//   'stockFlow/fetchStockFlows',
//   async (filters = {}, { rejectWithValue }) => {
//     try {
//       const response = await AuthService.getStockFlows(filters);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// // Async thunk to fetch stock flow by ID
// export const fetchStockFlowById = createAsyncThunk(
//   'stockFlow/fetchStockFlowById',
//   async (id, { rejectWithValue }) => {
//     try {
//       const response = await AuthService.getStockFlowById(id);
//       return response.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// // Async thunk to create stock flow
// export const createStockFlow = createAsyncThunk(
//   'stockFlow/createStockFlow',
//   async (stockFlowData, { rejectWithValue }) => {
//     try {
//       const response = await AuthService.createStockFlow(stockFlowData);
//       return response.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// // Async thunk to update stock flow
// export const updateStockFlow = createAsyncThunk(
//   'stockFlow/updateStockFlow',
//   async ({ id, data }, { rejectWithValue }) => {
//     try {
//       const response = await AuthService.updateStockFlowById(id, data);
//       console.log('Update response:', response.data);
//       return response.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// // Async thunk to delete stock flow
// export const deleteStockFlow = createAsyncThunk(
//   'stockFlow/deleteStockFlow',
//   async (id, { rejectWithValue }) => {
//     try {
//       await AuthService.deleteStockFlow(id);
//       return id;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// // Async thunk to fetch statistics
// export const fetchStockFlowStats = createAsyncThunk(
//   'stockFlow/fetchStockFlowStats',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await AuthService.getStockFlowStats();
//       return response.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// // NEW: Fetch dynamic options from backend
// export const fetchStockFlowOptions = createAsyncThunk(
//   'stockFlow/fetchStockFlowOptions',
//   async (_, { rejectWithValue }) => {
//     try {
//       const response = await AuthService.getStockFlowOptions();
//       return response.data.data;
//     } catch (error) {
//       return rejectWithValue(error.response?.data?.message || error.message);
//     }
//   }
// );

// export const dispatchStockFlow = createAsyncThunk(
//   "stockFlow/dispatchStockFlow",
//   async (id, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.dispatchStockFlow(id); 
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message);
//     }
//   }
// );


// export const receiveStockFlow = createAsyncThunk(
//   'stockFlow/receive',
//   async ({ id, data }, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.receiveStockFlow(id, data);
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message);
//     }
//   }
// );

 
// const initialState = {
//   stockFlows: [],
//   currentStockFlow: null,
//   stats: {
//     total: 0,
//     approved: 0,
//     in_transit: 0,
//     delivered: 0,
//     total_quantity: 0,
//   },
//   filters: {
//     search: '',
//     status: '',
//     transport: '',
//     from_wh: '',
//     to_wh: '',
//     sortBy: 'created_at',
//     sortOrder: 'DESC',
//   },
//   pagination: {
//     total: 0,
//     page: 1,
//     limit: 10,
//     totalPages: 0,
//   },
//   // FIXED: Separate options state with loading flag
//   options: {
//     transport: [],
//     status: [],
//     sort: [], // Will be populated from backend
//     loading: false,
//     error: null,
//   },
//   status: 'idle',
//   error: null,
//   createStatus: 'idle',
//   updateStatus: 'idle',
//   deleteStatus: 'idle',
//   statsStatus: 'idle',
// };

// const stockFlowSlice = createSlice({
//   name: 'stockFlow',
//   initialState,
//   reducers: {
//     setStockFlows: (state, action) => {
//       state.stockFlows = action.payload;
//     },
//     setFilters: (state, action) => {
//       state.filters = { ...state.filters, ...action.payload };
//     },
//     resetFilters: (state) => {
//       state.filters = initialState.filters;
//     },
//     setCurrentStockFlow: (state, action) => {
//       state.currentStockFlow = action.payload;
//     },
//     clearCurrentStockFlow: (state) => {
//       state.currentStockFlow = null;
//     },
//     resetStockFlowState: () => {
//       return initialState;
//     },
//     clearError: (state) => {
//       state.error = null;
//       state.options.error = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       // Fetch Stock Flows
//       .addCase(fetchStockFlows.pending, (state) => {
//         state.status = 'loading';
//         state.error = null;
//       })
//       .addCase(fetchStockFlows.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.stockFlows = action.payload.data || [];
//         state.pagination = action.payload.pagination || state.pagination;
//         state.error = null;
//       })
//       .addCase(fetchStockFlows.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload || action.error.message;
//       })

//       // Fetch Stock Flow By ID
//       .addCase(fetchStockFlowById.pending, (state) => {
//         state.status = 'loading';
//       })
//       .addCase(fetchStockFlowById.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.currentStockFlow = action.payload;
//       })
//       .addCase(fetchStockFlowById.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       })

//       // Create Stock Flow
//       .addCase(createStockFlow.pending, (state) => {
//         state.createStatus = 'loading';
//       })
//       .addCase(createStockFlow.fulfilled, (state) => {
//         state.createStatus = 'succeeded';
//       })
//       .addCase(createStockFlow.rejected, (state, action) => {
//         state.createStatus = 'failed';
//         state.error = action.payload;
//       })

//       // Update Stock Flow
//       .addCase(updateStockFlow.pending, (state) => {
//         state.updateStatus = 'loading';
//         state.error = null;
//       })
//       .addCase(updateStockFlow.fulfilled, (state, action) => {
//         console.log('Update fulfilled with payload:', action.payload);
        
//         state.updateStatus = 'succeeded';
        
//         const index = state.stockFlows.findIndex(sf => sf.id === action.payload.id);
        
//         if (index !== -1) {
//          state.stockFlows[index] = {
//   ...state.stockFlows[index],
//   ...action.payload,   // description, transport, locations etc
//   actions: action.payload.actions, // keep actions fresh
// };

          
//           console.log('Updated stockFlows[' + index + ']:', state.stockFlows[index]);
//         }
        
//         if (state.currentStockFlow && state.currentStockFlow.id === action.payload.id) {
//           state.currentStockFlow = { ...action.payload };
//         }
        
//         state.error = null;
//       })
//       .addCase(updateStockFlow.rejected, (state, action) => {
//         state.updateStatus = 'failed';
//         state.error = action.payload;
//         console.error('Update rejected:', action.payload);
//       })

//       // Delete Stock Flow
//       .addCase(deleteStockFlow.pending, (state) => {
//         state.deleteStatus = 'loading';
//       })
//       .addCase(deleteStockFlow.fulfilled, (state, action) => {
//         state.deleteStatus = 'succeeded';
//         state.stockFlows = state.stockFlows.filter(sf => sf.id !== action.payload);
//       })
//       .addCase(deleteStockFlow.rejected, (state, action) => {
//         state.deleteStatus = 'failed';
//         state.error = action.payload;
//       })

//       // Fetch Stats
//       .addCase(fetchStockFlowStats.pending, (state) => {
//         state.statsStatus = 'loading';
//       })
//       .addCase(fetchStockFlowStats.fulfilled, (state, action) => {
//         state.statsStatus = 'succeeded';
//         state.stats = action.payload;
//       })
//       .addCase(fetchStockFlowStats.rejected, (state, action) => {
//         state.statsStatus = 'failed';
//         state.error = action.payload;
//       })

//       // FIXED: Fetch Stock Flow Options
//       .addCase(fetchStockFlowOptions.pending, (state) => {
//         state.options.loading = true;
//         state.options.error = null;
//       })
//       .addCase(fetchStockFlowOptions.fulfilled, (state, action) => {
//         state.options.loading = false;
//         state.options.transport = action.payload.transport || [];
//         state.options.status = action.payload.status || [];
//         state.options.sort = action.payload.sort || [];
//         state.options.error = null;
//       })
//       .addCase(fetchStockFlowOptions.rejected, (state, action) => {
//         state.options.loading = false;
//         state.options.error = action.payload;
//       })
//     // Dispatch Stock Flow
// .addCase(dispatchStockFlow.pending, (state) => {
//   state.updateStatus = 'loading';
//   state.error = null; // ✅ Clear previous errors
// })
// .addCase(dispatchStockFlow.fulfilled, (state, action) => {
//   console.log('✅ Dispatch fulfilled:', action.payload);
  
//   state.updateStatus = 'succeeded';
  
//   // ✅ Extract the full stock flow object
//   const updatedStockFlow = action.payload.data;
  
//   // ✅ Update in the list
//   const index = state.stockFlows.findIndex(sf => sf.id === updatedStockFlow.id);
//   if (index !== -1) {
//     state.stockFlows[index] = {
//       ...state.stockFlows[index],  // Keep existing data
//       ...updatedStockFlow,          // Overwrite with updated data
//     };
//   }
  
//   // ✅ Update current stock flow if viewing details
//   if (state.currentStockFlow?.id === updatedStockFlow.id) {
//     state.currentStockFlow = updatedStockFlow;
//   }
  
//   state.error = null;
// })
// .addCase(dispatchStockFlow.rejected, (state, action) => {
//   state.updateStatus = 'failed';
//   state.error = action.payload || 'Failed to dispatch stock flow';
//   console.error('❌ Dispatch rejected:', action.payload);
// })

// // Receive Stock Flow
// .addCase(receiveStockFlow.pending, (state) => {
//   state.updateStatus = 'loading';
//   state.error = null; // ✅ Clear previous errors
// })
// .addCase(receiveStockFlow.fulfilled, (state, action) => {
//   console.log('✅ Receive fulfilled:', action.payload);
  
//   state.updateStatus = 'succeeded';
  
//   // ✅ Extract the full stock flow object
//   const updatedStockFlow = action.payload.data;
  
//   // ✅ Update in the list
//   const index = state.stockFlows.findIndex(sf => sf.id === updatedStockFlow.id);
//   if (index !== -1) {
//     state.stockFlows[index] = {
//       ...state.stockFlows[index],
//       ...updatedStockFlow,
//     };
//   }
  
//   // ✅ Update current stock flow if viewing details
//   if (state.currentStockFlow?.id === updatedStockFlow.id) {
//     state.currentStockFlow = updatedStockFlow;
//   }
  
//   state.error = null;
// })
// .addCase(receiveStockFlow.rejected, (state, action) => {
//   state.updateStatus = 'failed';
//   state.error = action.payload || 'Failed to receive stock flow';
//   console.error('❌ Receive rejected:', action.payload);
// })


//   },
// });

// export const {
//   setStockFlows,
//   setFilters,
//   resetFilters,
//   setCurrentStockFlow,
//   clearCurrentStockFlow,
//   resetStockFlowState,
//   clearError,
// } = stockFlowSlice.actions;

// export default stockFlowSlice.reducer;




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



export const discardDraft = createAsyncThunk(
  'stockFlow/discardDraft',
  async (_, { rejectWithValue }) => {
    try {
      const res = await AuthService.discardDraft();
      return res.data;
    } catch (err) {
      // 404 = no draft found — that's acceptable, not a real error
      if (err.response?.status === 404) return { success: true, already_gone: true };
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);




export const removeStockProduct = createAsyncThunk(
  'stockFlow/removeStockProduct',
  async (partial_code, { rejectWithValue }) => {
    try {
      const res = await AuthService.removeStockProduct(partial_code);
      return res.data; // { success, draft_deleted, message }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);
 
// ── Fetch existing draft (GET /auth/getExistingStockFlow) ────────────────────
export const fetchExistingDraft = createAsyncThunk(
  'stockFlow/fetchExistingDraft',
  async (_, { rejectWithValue }) => {
    try {
      const res = await AuthService.get_existing_stock_flow();
      return res.data; // { success, is_found, data }
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
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
    from_warehouse: '',
    to_warehouse: '',
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
        console.log(' Update fulfilled with payload:', action.payload);
        
        state.updateStatus = 'succeeded';
        
        const index = state.stockFlows.findIndex(sf => sf.stock_id === action.payload.id);
        
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
        console.error(' Update rejected:', action.payload);
      })

      // Delete Stock Flow
      .addCase(deleteStockFlow.pending, (state) => {
        state.deleteStatus = 'loading';
      })
      .addCase(deleteStockFlow.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded';
        state.stockFlows = state.stockFlows.filter(sf => sf.stock_id !== action.payload);
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

      
      .addCase(dispatchStockFlow.pending, (state) => {
        state.updateStatus = 'loading';
        state.error = null;
      })
      .addCase(dispatchStockFlow.fulfilled, (state, action) => {
        console.log(' Dispatch fulfilled:', action.payload);
        
        state.updateStatus = 'succeeded';
        
        // Extract the updated stock flow from response
        const updatedStockFlow = action.payload.data;
        
        // Find the index
        const index = state.stockFlows.findIndex(sf => sf.stock_id === updatedStockFlow.id);
        
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
        const index = state.stockFlows.findIndex(sf => sf.stock_id === updatedStockFlow.id);
        
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
      })

      .addCase(fetchExistingDraft.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchExistingDraft.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // The component handles the actual state restoration locally —
        // we just store the raw response so it can be read if needed.
        state.existingDraft = action.payload.is_found ? action.payload.data : null;
      })
      .addCase(fetchExistingDraft.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
 
      // Remove single product from draft
      .addCase(removeStockProduct.fulfilled, (state, action) => {
        // draft_deleted = true means the server removed the whole row
        if (action.payload.draft_deleted) {
          state.existingDraft = null;
        }
      })
      .addCase(removeStockProduct.rejected, (state, action) => {
        state.error = action.payload;
      })
 
      // Discard whole draft
      .addCase(discardDraft.fulfilled, (state) => {
        state.existingDraft = null;
      })
      .addCase(discardDraft.rejected, (state, action) => {
        state.error = action.payload;
      })
 

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