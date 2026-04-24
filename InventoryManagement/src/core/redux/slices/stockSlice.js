


// // stockFlowSlice.js - need to fix for log activity during status update

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

// // Fetch dynamic options from backend
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

// // Dispatch stock flow
// export const dispatchStockFlow = createAsyncThunk(
//   "stockFlow/dispatchStockFlow",
//   async (id, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.dispatchStockFlow(id);
//       console.log('🚀 Dispatch API response:', res.data);
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message);
//     }
//   }
// );

// // Receive stock flow
// export const receiveStockFlow = createAsyncThunk(
//   'stockFlow/receive',
//   async ({ id, data }, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.receiveStockFlow(id, data);
//       console.log('📦 Receive API response:', res.data);
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
//   options: {
//     transport: [],
//     status: [],
//     sort: [],
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
//         console.log('✅ Update fulfilled with payload:', action.payload);
        
//         state.updateStatus = 'succeeded';
        
//         const index = state.stockFlows.findIndex(sf => sf.id === action.payload.id);
        
//         if (index !== -1) {
//           // Create a new array with the updated item
//           state.stockFlows = [
//             ...state.stockFlows.slice(0, index),
//             { ...action.payload },
//             ...state.stockFlows.slice(index + 1)
//           ];
//         }
        
//         if (state.currentStockFlow && state.currentStockFlow.id === action.payload.id) {
//           state.currentStockFlow = { ...action.payload };
//         }
        
//         state.error = null;
//       })
//       .addCase(updateStockFlow.rejected, (state, action) => {
//         state.updateStatus = 'failed';
//         state.error = action.payload;
//         console.error('❌ Update rejected:', action.payload);
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

//       // Fetch Stock Flow Options
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

//       // ✅ FIXED: Dispatch Stock Flow
//       .addCase(dispatchStockFlow.pending, (state) => {
//         state.updateStatus = 'loading';
//         state.error = null;
//       })
//       .addCase(dispatchStockFlow.fulfilled, (state, action) => {
//         console.log('✅ Dispatch fulfilled:', action.payload);
        
//         state.updateStatus = 'succeeded';
        
//         // Extract the updated stock flow from response
//         const updatedStockFlow = action.payload.data;
        
//         // Find the index
//         const index = state.stockFlows.findIndex(sf => sf.id === updatedStockFlow.id);
        
//         if (index !== -1) {
//           // ✅ Create a NEW array with the updated item (this triggers React re-render)
//           state.stockFlows = [
//             ...state.stockFlows.slice(0, index),
//             { ...updatedStockFlow },
//             ...state.stockFlows.slice(index + 1)
//           ];
          
//           console.log('✅ Updated stock flow at index', index);
//           console.log('✅ New status:', state.stockFlows[index].status);
//           console.log('✅ New actions:', state.stockFlows[index].actions);
//         }
        
//         // Update current stock flow if viewing details
//         if (state.currentStockFlow?.id === updatedStockFlow.id) {
//           state.currentStockFlow = { ...updatedStockFlow };
//         }
        
//         state.error = null;
//       })
//       .addCase(dispatchStockFlow.rejected, (state, action) => {
//         state.updateStatus = 'failed';
//         state.error = action.payload || 'Failed to dispatch stock flow';
//         console.error('❌ Dispatch rejected:', action.payload);
//       })

//       // ✅ FIXED: Receive Stock Flow
//       .addCase(receiveStockFlow.pending, (state) => {
//         state.updateStatus = 'loading';
//         state.error = null;
//       })
//       .addCase(receiveStockFlow.fulfilled, (state, action) => {
//         console.log('✅ Receive fulfilled:', action.payload);
        
//         state.updateStatus = 'succeeded';
        
//         // Extract the updated stock flow from response
//         const updatedStockFlow = action.payload.data;
        
//         // Find the index
//         const index = state.stockFlows.findIndex(sf => sf.id === updatedStockFlow.id);
        
//         if (index !== -1) {
//           // ✅ Create a NEW array with the updated item (this triggers React re-render)
//           state.stockFlows = [
//             ...state.stockFlows.slice(0, index),
//             { ...updatedStockFlow },
//             ...state.stockFlows.slice(index + 1)
//           ];
          
//           console.log('✅ Updated stock flow at index', index);
//           console.log('✅ New status:', state.stockFlows[index].status);
//           console.log('✅ New actions:', state.stockFlows[index].actions);
//         }
        
//         // Update current stock flow if viewing details
//         if (state.currentStockFlow?.id === updatedStockFlow.id) {
//           state.currentStockFlow = { ...updatedStockFlow };
//         }
        
//         state.error = null;
//       })
//       .addCase(receiveStockFlow.rejected, (state, action) => {
//         state.updateStatus = 'failed';
//         state.error = action.payload || 'Failed to receive stock flow';
//         console.error('❌ Receive rejected:', action.payload);
//       });
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














import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AuthService from "../../../services/authService";

// ═══════════════════════════════════════════════════════════════════
//  STOCK FLOW  — Async Thunks
// ═══════════════════════════════════════════════════════════════════

export const fetchStockFlows = createAsyncThunk(
  "stock/fetchStockFlows",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const res = await AuthService.getStockFlows(filters);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchStockFlowById = createAsyncThunk(
  "stock/fetchStockFlowById",
  async (id, { rejectWithValue }) => {
    try {
      const res = await AuthService.getStockFlowById(id);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchStockFlowProducts = createAsyncThunk(
  "stock/fetchStockFlowProducts",
  async (id, { rejectWithValue }) => {
    try {
      const res = await AuthService.getStockFlowProducts(id);
      return { products: res.data.data || [], total_qty: res.data.total_qty ?? 0 };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const createStockFlow = createAsyncThunk(
  "stock/createStockFlow",
  async (data, { rejectWithValue }) => {
    try {
      const res = await AuthService.createStockFlow(data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const updateStockFlow = createAsyncThunk(
  "stock/updateStockFlow",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await AuthService.updateStockFlowById(id, data);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const deleteStockFlow = createAsyncThunk(
  "stock/deleteStockFlow",
  async (id, { rejectWithValue }) => {
    try {
      await AuthService.deleteStockFlow(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchStockFlowStats = createAsyncThunk(
  "stock/fetchStockFlowStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await AuthService.getStockFlowStats();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchStockFlowOptions = createAsyncThunk(
  "stock/fetchStockFlowOptions",
  async (_, { rejectWithValue }) => {
    try {
      const res = await AuthService.getStockFlowOptions();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const dispatchStockFlow = createAsyncThunk(
  "stock/dispatchStockFlow",
  async (id, { rejectWithValue }) => {
    try {
      const res = await AuthService.dispatchStockFlow(id);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const receiveStockFlow = createAsyncThunk(
  "stock/receiveStockFlow",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const res = await AuthService.receiveStockFlow(id, data);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ═══════════════════════════════════════════════════════════════════
//  STOCK REQUEST  — Async Thunks
// ═══════════════════════════════════════════════════════════════════

export const fetchSentRequests = createAsyncThunk(
  "stock/req/fetchSent",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await AuthService.getStockRequests({ ...params, role: "requester" });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchInboxRequests = createAsyncThunk(
  "stock/req/fetchInbox",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await AuthService.getStockRequestInbox({ ...params, role: "dispatcher" });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchApprovedRequests = createAsyncThunk(
  "stock/req/fetchApproved",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await AuthService.getStockRequests({ ...params, role: "requester", status: "approved" });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchStarredRequests = createAsyncThunk(
  "stock/req/fetchStarred",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await AuthService.getStockRequests({ ...params, starred: true });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchStockRequestStats = createAsyncThunk(
  "stock/req/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await AuthService.getStockRequestStats();
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const fetchStockRequestPriorities = createAsyncThunk(
  "stock/req/fetchPriorities",
  async (_, { rejectWithValue }) => {
    try {
      const res = await AuthService.getStockRequestPriorities?.();
      return res?.data?.priorities || res?.data || [];
    } catch {
      return rejectWithValue([]);
    }
  }
);

export const createStockRequest = createAsyncThunk(
  "stock/req/create",
  async (payload, { rejectWithValue }) => {
    try {
      const res = await AuthService.createStockRequest(payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const respondToStockRequest = createAsyncThunk(
  "stock/req/respond",
  async ({ id, action, scheduled_dispatch, description }, { rejectWithValue }) => {
    try {
      const res = await AuthService.respondToStockRequest(id, { action, scheduled_dispatch, description });
      return { id, ...res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const markStockRequestReceived = createAsyncThunk(
  "stock/req/markReceived",
  async ({ id, notes }, { rejectWithValue }) => {
    try {
      const res = await AuthService.markStockRequestReceived(id, { notes });
      return { id, ...res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const toggleStockRequestStar = createAsyncThunk(
  "stock/req/toggleStar",
  async ({ id, starred }, { rejectWithValue }) => {
    try {
      await AuthService.toggleStockRequestStar(id, starred);
      return { id, starred };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

export const markStockRequestRead = createAsyncThunk(
  "stock/req/markRead",
  async (id, { rejectWithValue }) => {
    try {
      await AuthService.markStockRequestRead(id);
      return id;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  }
);

// ═══════════════════════════════════════════════════════════════════
//  SHARED HELPERS
// ═══════════════════════════════════════════════════════════════════

/** Patch a stock-flow record inside the flows list + currentStockFlow */
const patchFlow = (state, id, patch) => {
  const idx = state.flow.list.findIndex((sf) => sf.id === id);
  if (idx !== -1) state.flow.list[idx] = { ...state.flow.list[idx], ...patch };
  if (state.flow.current?.id === id) state.flow.current = { ...state.flow.current, ...patch };
};

/** Apply paginated list response into a req view bucket */
const applyReqList = (state, viewKey, payload) => {
  state.req[viewKey].items = payload.data || [];
  if (payload.pagination) {
    state.req[viewKey].pagination = {
      currentPage: payload.pagination.page,
      totalPages:  payload.pagination.totalPages,
      total:       payload.pagination.total,
    };
  }
  state.req[viewKey].loading = false;
  state.req[viewKey].error   = null;
};

/** Patch a request in every req view bucket */
const patchReq = (state, id, patch) => {
  ["sent", "inbox", "approved", "starred"].forEach((key) => {
    state.req[key].items = state.req[key].items.map((r) =>
      r.stock_req_id === id ? { ...r, ...patch } : r
    );
  });
  if (state.req.ui.selectedRequest?.stock_req_id === id)
    state.req.ui.selectedRequest = { ...state.req.ui.selectedRequest, ...patch };
};

const reqViewBucket = () => ({
  items:      [],
  loading:    false,
  error:      null,
  pagination: { currentPage: 1, totalPages: 1, total: 0 },
});

// ═══════════════════════════════════════════════════════════════════
//  INITIAL STATE
// ═══════════════════════════════════════════════════════════════════

const initialState = {
  // ── Stock Flow ────────────────────────────────────────────────
  flow: {
    list:    [],
    current: null,            // detail view / edit target
    products: [],             // StockFlowDetails products
    totalQty: 0,

    stats: { total: 0, approved: 0, in_transit: 0, delivered: 0, total_quantity: 0 },

    filters: {
      search:    "",
      status:    "",
      transport: "",
      from_wh:   "",
      to_wh:     "",
      sortBy:    "created_at",
      sortOrder: "DESC",
      page:      1,
      limit:     10,
    },

    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },

    options: {
      transport: [],
      status:    [],
      sort:      [],
    },

    // granular async statuses
    listStatus:    "idle",   // loading | succeeded | failed
    detailStatus:  "idle",
    productsStatus:"idle",
    mutateStatus:  "idle",   // create | update | delete | dispatch | receive
    optionsStatus: "idle",
    statsStatus:   "idle",

    error: null,
  },

  // ── Stock Request ─────────────────────────────────────────────
  req: {
    sent:     reqViewBucket(),
    inbox:    reqViewBucket(),
    approved: reqViewBucket(),
    starred:  reqViewBucket(),

    stats: { total: 0, pending: 0, approved: 0, rejected: 0, received: 0 },
    statsLoading: false,

    priorities:       [],
    prioritiesLoading: false,

    filters: {
      priority: "",
      status:   "",
      search:   "",
      sortBy:   "created_at",
      sortOrder:"DESC",
      page:     1,
      limit:    10,
    },

    // UI state (modal targets live in Redux so any component can open them)
    ui: {
      selectedRequest: null,
      respondTarget:   null,
      receiveTarget:   null,
      showCompose:     false,
    },

    createStatus:  "idle",
    respondStatus: "idle",
    receiveStatus: "idle",

    error: null,
  },
};

// ═══════════════════════════════════════════════════════════════════
//  SLICE
// ═══════════════════════════════════════════════════════════════════

const stockSlice = createSlice({
  name: "stock",
  initialState,
  reducers: {
    // ── Flow filter / UI ────────────────────────────────────────
    setFlowFilters(state, { payload }) {
      state.flow.filters = { ...state.flow.filters, ...payload };
    },
    resetFlowFilters(state) {
      state.flow.filters = initialState.flow.filters;
    },
    clearFlowError(state) {
      state.flow.error = null;
    },
    clearFlowCurrent(state) {
      state.flow.current = null;
    },

    // ── Request filter / UI ─────────────────────────────────────
    setReqFilters(state, { payload }) {
      state.req.filters = { ...state.req.filters, ...payload };
    },
    resetReqFilters(state) {
      state.req.filters = initialState.req.filters;
    },
    clearReqError(state) {
      state.req.error = null;
    },
    setSelectedRequest(state, { payload }) {
      state.req.ui.selectedRequest = payload;
    },
    clearSelectedRequest(state) {
      state.req.ui.selectedRequest = null;
    },
    setRespondTarget(state, { payload }) {
      state.req.ui.respondTarget = payload;
    },
    clearRespondTarget(state) {
      state.req.ui.respondTarget = null;
    },
    setReceiveTarget(state, { payload }) {
      state.req.ui.receiveTarget = payload;
    },
    clearReceiveTarget(state) {
      state.req.ui.receiveTarget = null;
    },
    setShowCompose(state, { payload }) {
      state.req.ui.showCompose = payload;
    },
    // Optimistic updates
    optimisticStar(state, { payload }) {
      patchReq(state, payload.id, { is_starred: payload.starred });
    },
    optimisticRead(state, { payload }) {
      patchReq(state, payload, { is_read: true });
    },
  },

  extraReducers: (builder) => {
    // ════════════════════════════════════════════
    //  STOCK FLOW  extra reducers
    // ════════════════════════════════════════════

    // fetchStockFlows
    builder
      .addCase(fetchStockFlows.pending,    (s) => { s.flow.listStatus = "loading"; s.flow.error = null; })
      .addCase(fetchStockFlows.fulfilled,  (s, { payload }) => {
        s.flow.listStatus  = "succeeded";
        s.flow.list        = payload.data || [];
        s.flow.pagination  = payload.pagination || s.flow.pagination;
      })
      .addCase(fetchStockFlows.rejected,   (s, { payload }) => { s.flow.listStatus = "failed"; s.flow.error = payload; })

    // fetchStockFlowById
      .addCase(fetchStockFlowById.pending,   (s) => { s.flow.detailStatus = "loading"; })
      .addCase(fetchStockFlowById.fulfilled, (s, { payload }) => { s.flow.detailStatus = "succeeded"; s.flow.current = payload; })
      .addCase(fetchStockFlowById.rejected,  (s, { payload }) => { s.flow.detailStatus = "failed"; s.flow.error = payload; })

    // fetchStockFlowProducts
      .addCase(fetchStockFlowProducts.pending,   (s) => { s.flow.productsStatus = "loading"; })
      .addCase(fetchStockFlowProducts.fulfilled, (s, { payload }) => {
        s.flow.productsStatus = "succeeded";
        s.flow.products       = payload.products;
        s.flow.totalQty       = payload.total_qty;
      })
      .addCase(fetchStockFlowProducts.rejected,  (s, { payload }) => { s.flow.productsStatus = "failed"; s.flow.error = payload; })

    // createStockFlow
      .addCase(createStockFlow.pending,   (s) => { s.flow.mutateStatus = "loading"; })
      .addCase(createStockFlow.fulfilled, (s) => { s.flow.mutateStatus = "succeeded"; })
      .addCase(createStockFlow.rejected,  (s, { payload }) => { s.flow.mutateStatus = "failed"; s.flow.error = payload; })

    // updateStockFlow
      .addCase(updateStockFlow.pending,   (s) => { s.flow.mutateStatus = "loading"; s.flow.error = null; })
      .addCase(updateStockFlow.fulfilled, (s, { payload }) => {
        s.flow.mutateStatus = "succeeded";
        patchFlow(s, payload.id, payload);
      })
      .addCase(updateStockFlow.rejected,  (s, { payload }) => { s.flow.mutateStatus = "failed"; s.flow.error = payload; })

    // deleteStockFlow
      .addCase(deleteStockFlow.pending,   (s) => { s.flow.mutateStatus = "loading"; })
      .addCase(deleteStockFlow.fulfilled, (s, { payload: id }) => {
        s.flow.mutateStatus = "succeeded";
        s.flow.list = s.flow.list.filter((sf) => sf.id !== id);
      })
      .addCase(deleteStockFlow.rejected,  (s, { payload }) => { s.flow.mutateStatus = "failed"; s.flow.error = payload; })

    // fetchStockFlowStats
      .addCase(fetchStockFlowStats.pending,   (s) => { s.flow.statsStatus = "loading"; })
      .addCase(fetchStockFlowStats.fulfilled, (s, { payload }) => { s.flow.statsStatus = "succeeded"; s.flow.stats = payload; })
      .addCase(fetchStockFlowStats.rejected,  (s) => { s.flow.statsStatus = "failed"; })

    // fetchStockFlowOptions
      .addCase(fetchStockFlowOptions.pending,   (s) => { s.flow.optionsStatus = "loading"; })
      .addCase(fetchStockFlowOptions.fulfilled, (s, { payload }) => {
        s.flow.optionsStatus    = "succeeded";
        s.flow.options.transport = payload.transport || [];
        s.flow.options.status    = payload.status    || [];
        s.flow.options.sort      = payload.sort       || [];
      })
      .addCase(fetchStockFlowOptions.rejected,  (s) => { s.flow.optionsStatus = "failed"; })

    // dispatchStockFlow
      .addCase(dispatchStockFlow.pending,   (s) => { s.flow.mutateStatus = "loading"; s.flow.error = null; })
      .addCase(dispatchStockFlow.fulfilled, (s, { payload }) => {
        s.flow.mutateStatus = "succeeded";
        if (payload.data) patchFlow(s, payload.data.id, payload.data);
      })
      .addCase(dispatchStockFlow.rejected,  (s, { payload }) => { s.flow.mutateStatus = "failed"; s.flow.error = payload; })

    // receiveStockFlow
      .addCase(receiveStockFlow.pending,   (s) => { s.flow.mutateStatus = "loading"; s.flow.error = null; })
      .addCase(receiveStockFlow.fulfilled, (s, { payload }) => {
        s.flow.mutateStatus = "succeeded";
        if (payload.data) patchFlow(s, payload.data.id, payload.data);
      })
      .addCase(receiveStockFlow.rejected,  (s, { payload }) => { s.flow.mutateStatus = "failed"; s.flow.error = payload; })

    // ════════════════════════════════════════════
    //  STOCK REQUEST  extra reducers
    // ════════════════════════════════════════════

    // fetchSentRequests
      .addCase(fetchSentRequests.pending,   (s) => { s.req.sent.loading = true;     s.req.sent.error = null; })
      .addCase(fetchSentRequests.fulfilled, (s, { payload }) => applyReqList(s, "sent", payload))
      .addCase(fetchSentRequests.rejected,  (s, { payload }) => { s.req.sent.loading = false; s.req.sent.error = payload; })

    // fetchInboxRequests
      .addCase(fetchInboxRequests.pending,   (s) => { s.req.inbox.loading = true;   s.req.inbox.error = null; })
      .addCase(fetchInboxRequests.fulfilled, (s, { payload }) => applyReqList(s, "inbox", payload))
      .addCase(fetchInboxRequests.rejected,  (s, { payload }) => { s.req.inbox.loading = false; s.req.inbox.error = payload; })

    // fetchApprovedRequests
      .addCase(fetchApprovedRequests.pending,   (s) => { s.req.approved.loading = true; s.req.approved.error = null; })
      .addCase(fetchApprovedRequests.fulfilled, (s, { payload }) => applyReqList(s, "approved", payload))
      .addCase(fetchApprovedRequests.rejected,  (s, { payload }) => { s.req.approved.loading = false; s.req.approved.error = payload; })

    // fetchStarredRequests
      .addCase(fetchStarredRequests.pending,   (s) => { s.req.starred.loading = true; s.req.starred.error = null; })
      .addCase(fetchStarredRequests.fulfilled, (s, { payload }) => applyReqList(s, "starred", payload))
      .addCase(fetchStarredRequests.rejected,  (s, { payload }) => { s.req.starred.loading = false; s.req.starred.error = payload; })

    // fetchStockRequestStats
      .addCase(fetchStockRequestStats.pending,   (s) => { s.req.statsLoading = true; })
      .addCase(fetchStockRequestStats.fulfilled, (s, { payload }) => { s.req.stats = payload; s.req.statsLoading = false; })
      .addCase(fetchStockRequestStats.rejected,  (s) => { s.req.statsLoading = false; })

    // fetchStockRequestPriorities
      .addCase(fetchStockRequestPriorities.pending,   (s) => { s.req.prioritiesLoading = true; })
      .addCase(fetchStockRequestPriorities.fulfilled, (s, { payload }) => { s.req.priorities = payload; s.req.prioritiesLoading = false; })
      .addCase(fetchStockRequestPriorities.rejected,  (s) => { s.req.prioritiesLoading = false; })

    // createStockRequest
      .addCase(createStockRequest.pending,   (s) => { s.req.createStatus = "loading"; s.req.error = null; })
      .addCase(createStockRequest.fulfilled, (s) => { s.req.createStatus = "succeeded"; s.req.ui.showCompose = false; })
      .addCase(createStockRequest.rejected,  (s, { payload }) => { s.req.createStatus = "failed"; s.req.error = payload; })

    // respondToStockRequest
      .addCase(respondToStockRequest.pending,   (s) => { s.req.respondStatus = "loading"; })
      .addCase(respondToStockRequest.fulfilled, (s, { payload }) => {
        s.req.respondStatus        = "succeeded";
        s.req.ui.respondTarget     = null;
        patchReq(s, payload.id, { approved_at: payload.approved_at, rejected_at: payload.rejected_at });
      })
      .addCase(respondToStockRequest.rejected,  (s, { payload }) => { s.req.respondStatus = "failed"; s.req.error = payload; })

    // markStockRequestReceived
      .addCase(markStockRequestReceived.pending,   (s) => { s.req.receiveStatus = "loading"; })
      .addCase(markStockRequestReceived.fulfilled, (s, { payload }) => {
        s.req.receiveStatus      = "succeeded";
        s.req.ui.receiveTarget   = null;
        patchReq(s, payload.id, { received_at: payload.received_at, receiver_notes: payload.receiver_notes });
      })
      .addCase(markStockRequestReceived.rejected,  (s, { payload }) => { s.req.receiveStatus = "failed"; s.req.error = payload; })

    // toggleStockRequestStar — rollback on failure
      .addCase(toggleStockRequestStar.rejected, (s, { meta }) => {
        patchReq(s, meta.arg.id, { is_starred: !meta.arg.starred });
      })

    // markStockRequestRead
      .addCase(markStockRequestRead.fulfilled, (s, { payload }) => {
        patchReq(s, payload, { is_read: true });
      });
  },
});


export const {
  // flow
  setFlowFilters,
  resetFlowFilters,
  clearFlowError,
  clearFlowCurrent,
  // req
  setReqFilters,
  resetReqFilters,
  clearReqError,
  setSelectedRequest,
  clearSelectedRequest,
  setRespondTarget,
  clearRespondTarget,
  setReceiveTarget,
  clearReceiveTarget,
  setShowCompose,
  optimisticStar,
  optimisticRead,
} = stockSlice.actions;


// ── Flow selectors ──────────────────────────────────────────────
export const selectFlowList        = (s) => s.stock.flow.list;
export const selectFlowCurrent     = (s) => s.stock.flow.current;
export const selectFlowProducts    = (s) => s.stock.flow.products;
export const selectFlowTotalQty    = (s) => s.stock.flow.totalQty;
export const selectFlowStats       = (s) => s.stock.flow.stats;
export const selectFlowFilters     = (s) => s.stock.flow.filters;
export const selectFlowPagination  = (s) => s.stock.flow.pagination;
export const selectFlowOptions     = (s) => s.stock.flow.options;
export const selectFlowListLoading = (s) => s.stock.flow.listStatus === "loading";
export const selectFlowDetailLoading = (s) => s.stock.flow.detailStatus === "loading";
export const selectFlowProductsLoading = (s) => s.stock.flow.productsStatus === "loading";
export const selectFlowMutating    = (s) => s.stock.flow.mutateStatus === "loading";
export const selectFlowOptionsLoading = (s) => s.stock.flow.optionsStatus === "loading";
export const selectFlowError       = (s) => s.stock.flow.error;

export const selectReqView         = (view) => (s) => s.stock.req[view];
export const selectReqStats        = (s) => s.stock.req.stats;
export const selectReqFilters      = (s) => s.stock.req.filters;
export const selectReqPriorities   = (s) => s.stock.req.priorities;
export const selectReqUI           = (s) => s.stock.req.ui;
export const selectShowCompose     = (s) => s.stock.req.ui.showCompose;
export const selectSelectedRequest = (s) => s.stock.req.ui.selectedRequest;
export const selectRespondTarget   = (s) => s.stock.req.ui.respondTarget;
export const selectReceiveTarget   = (s) => s.stock.req.ui.receiveTarget;
export const selectReqCreateStatus = (s) => s.stock.req.createStatus;
export const selectReqRespondStatus= (s) => s.stock.req.respondStatus;
export const selectReqReceiveStatus= (s) => s.stock.req.receiveStatus;
export const selectReqError        = (s) => s.stock.req.error;

export default stockSlice.reducer;