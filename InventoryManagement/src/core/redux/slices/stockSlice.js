// import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import AuthService from "../../../services/authService";

// // ═══════════════════════════════════════════════════════════════════
// //  STOCK FLOW  — Async Thunks
// // ═══════════════════════════════════════════════════════════════════

// export const fetchStockFlows = createAsyncThunk(
//   "stock/fetchStockFlows",
//   async (filters = {}, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.getStockTransfer(filters);
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// export const fetchStockFlowById = createAsyncThunk(
//   "stock/fetchStockFlowById",
//   async (id, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.getStockFlowById(id);
//       return res.data.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// export const fetchStockFlowProducts = createAsyncThunk(
//   "stock/fetchStockFlowProducts",
//   async (id, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.getStockFlowProducts(id);
//       return {
//         products: res.data.data || [],
//         total_qty: res.data.total_qty ?? 0,
//       };
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// export const createStockFlow = createAsyncThunk(
//   "stock/createStockFlow",
//   async (data, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.createStockFlow(data);
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// export const updateStockFlow = createAsyncThunk(
//   "stock/updateStockFlow",
//   async ({ id, data }, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.updateStockFlowById(id, data);
//       return res.data.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// export const deleteStockFlow = createAsyncThunk(
//   "stock/deleteStockFlow",
//   async (id, { rejectWithValue }) => {
//     try {
//       await AuthService.deleteStockFlow(id);
//       return id;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// export const fetchStockFlowStats = createAsyncThunk(
//   "stock/fetchStockFlowStats",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.getStockFlowStats();
//       return res.data.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// export const fetchStockFlowOptions = createAsyncThunk(
//   "stock/fetchStockFlowOptions",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.getStockFlowOptions();
//       return res.data.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// export const dispatchStockFlow = createAsyncThunk(
//   "stock/dispatchStockFlow",
//   async (id, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.dispatchStockFlow(id);
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// export const receiveStockFlow = createAsyncThunk(
//   "stock/receiveStockFlow",
//   async ({ id, data }, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.receiveStockFlow(id, data);
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// // ═══════════════════════════════════════════════════════════════════
// //  STOCK REQUEST  — Async Thunks
// // ═══════════════════════════════════════════════════════════════════

// export const fetchSentRequests = createAsyncThunk(
//   "stock/req/fetchSent",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.getStockRequests({ ...params });
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// export const fetchApprovedRequests = createAsyncThunk(
//   "stock/req/fetchApproved",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.getStockRequests({
//         ...params,
//         status: "approved",
//       });
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// export const fetchStarredRequests = createAsyncThunk(
//   "stock/req/fetchStarred",
//   async (params = {}, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.getStockRequests({
//         ...params,
//         starred: true,
//       });
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// export const fetchStockRequestStats = createAsyncThunk(
//   "stock/req/fetchStats",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.getStockRequestStats();
//       return res.data.data;
//     } catch (err) {
//       console.warn(
//         "getStockRequestStats not available, using fallback:",
//         err.message,
//       );
//       try {
//         const listRes = await AuthService.getStockRequests({
//           page_no: 1,
//           limit: 100,
//         });
//         const items = listRes.data.data || [];
//         const total = listRes.data.total_records || items.length;
//         const pending = items.filter((r) => !r.is_approved).length;
//         const approved = items.filter(
//           (r) => r.is_approved && !r.is_delivered,
//         ).length;
//         const received = items.filter((r) => r.is_delivered).length;
//         return { total, pending, approved, rejected: 0, received };
//       } catch (fallbackErr) {
//         return rejectWithValue(fallbackErr.message);
//       }
//     }
//   },
// );

// export const fetchStockRequestPriorities = createAsyncThunk(
//   "stock/req/fetchPriorities",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.getStockRequestPriorities?.();
//       return res?.data?.priorities || res?.data || [];
//     } catch {
//       return rejectWithValue([]);
//     }
//   },
// );

// // export const fetchStockRequestDropdown = createAsyncThunk(
// //   "stock/req/fetchDropdown",
// //   async (_, { rejectWithValue }) => {
// //     try {

// //       const res  = await AuthService.getActiveStockRequest();
// //       const data = res.data?.data || [];

// //       return data.map((r) => ({
// //         stock_req_id: r.stock_req_id,
// //         description:  r.description ?? null,
// //       }));
// //     } catch (err) {
// //       return rejectWithValue(err.response?.data?.message || err.message);
// //     }
// //   }
// // );

// export const fetchStockRequestDropdown = createAsyncThunk(
//   "stock/req/fetchDropdown",
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.getActiveStockRequests();
//       const data = res.data?.data || [];
//       return data.map((r) => ({
//         stock_req_id: r.stock_req_id,
//         req_status: r.req_status,
//         description: r.description ?? null,
//       }));
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// export const createStockRequest = createAsyncThunk(
//   "stock/req/create",
//   async (payload, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.createStockRequest(payload);
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// export const respondToStockRequest = createAsyncThunk(
//   "stock/req/respond",
//   async (
//     { id, action, scheduled_dispatch, description },
//     { rejectWithValue },
//   ) => {
//     try {
//       const res = await AuthService.respondToStockRequest(id, {
//         action,
//         scheduled_dispatch,
//         description,
//       });
//       return { id, ...res.data };
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// export const markStockRequestReceived = createAsyncThunk(
//   "stock/req/markReceived",
//   async ({ id, notes }, { rejectWithValue }) => {
//     try {
//       const res = await AuthService.markStockRequestReceived(id, { notes });
//       return { id, ...res.data };
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// export const toggleStockRequestStar = createAsyncThunk(
//   "stock/req/toggleStar",
//   async ({ id, starred }, { rejectWithValue }) => {
//     try {
//       await AuthService.toggleStockRequestStar(id, starred);
//       return { id, starred };
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// export const markStockRequestRead = createAsyncThunk(
//   "stock/req/markRead",
//   async (id, { rejectWithValue }) => {
//     try {
//       await AuthService.markStockRequestRead(id);
//       return id;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   },
// );

// // ═══════════════════════════════════════════════════════════════════
// //  SHARED HELPERS
// // ═══════════════════════════════════════════════════════════════════

// const patchFlow = (state, id, patch) => {
//   const idx = state.flow.list.findIndex((sf) => sf.id === id);
//   if (idx !== -1) state.flow.list[idx] = { ...state.flow.list[idx], ...patch };
//   if (state.flow.current?.id === id)
//     state.flow.current = { ...state.flow.current, ...patch };
// };

// const applyReqList = (state, viewKey, payload, sentFilters) => {
//   const items = payload.data || [];
//   const totalRecords = payload.total_records ?? items.length;
//   const page = sentFilters?.page_no ?? 1;
//   const limit = sentFilters?.limit ?? state.req.filters.limit;
//   const totalPages = limit > 0 ? Math.ceil(totalRecords / limit) : 1;

//   state.req[viewKey].items = items;
//   state.req[viewKey].pagination = {
//     currentPage: page,
//     totalPages,
//     total: totalRecords,
//   };
//   state.req[viewKey].loading = false;
//   state.req[viewKey].error = null;
// };

// const patchReq = (state, id, patch) => {
//   ["sent", "inbox", "approved", "starred"].forEach((key) => {
//     state.req[key].items = state.req[key].items.map((r) =>
//       r.req_id === id ? { ...r, ...patch } : r,
//     );
//   });
//   if (state.req.ui.selectedRequest?.req_id === id)
//     state.req.ui.selectedRequest = {
//       ...state.req.ui.selectedRequest,
//       ...patch,
//     };
// };

// const reqViewBucket = () => ({
//   items: [],
//   loading: false,
//   error: null,
//   pagination: { currentPage: 1, totalPages: 1, total: 0 },
// });

// // ═══════════════════════════════════════════════════════════════════
// //  INITIAL STATE
// // ═══════════════════════════════════════════════════════════════════

// const initialState = {
//   // ── Stock Flow ──────────────────────────────────────────────────
//   flow: {
//     list: [],
//     current: null,
//     products: [],
//     totalQty: 0,

//     stats: {
//       total: 0,
//       approved: 0,
//       in_transit: 0,
//       delivered: 0,
//       total_quantity: 0,
//     },

//     filters: {
//       search: "",
//       status: "",
//       transport: "",
//       from_wh: "",
//       to_wh: "",
//       sortBy: "created_at",
//       sortOrder: "DESC",
//       page: 1,
//       limit: 10,
//     },

//     pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },

//     options: { transport: [], status: [], sort: [] },

//     listStatus: "idle",
//     detailStatus: "idle",
//     productsStatus: "idle",
//     mutateStatus: "idle",
//     optionsStatus: "idle",
//     statsStatus: "idle",

//     error: null,
//   },

//   // ── Stock Request ───────────────────────────────────────────────
//   req: {
//     sent: reqViewBucket(),
//     inbox: reqViewBucket(),
//     approved: reqViewBucket(),
//     starred: reqViewBucket(),

//     // Dropdown for AddStockFlow: [{ stock_req_id, description }]
//     dropdown: [],
//     dropdownLoading: false,

//     stats: { total: 0, pending: 0, approved: 0, rejected: 0, received: 0 },
//     statsLoading: false,

//     priorities: [],
//     prioritiesLoading: false,

//     filters: {
//       priority: "",
//       status: "",
//       search: "",
//       sortBy: "created_at",
//       sortOrder: "DESC",
//       page: 1,
//       limit: 10,
//     },

//     ui: {
//       selectedRequest: null,
//       respondTarget: null,
//       receiveTarget: null,
//       showCompose: false,
//       // flowSourceRequest: null,  // { value, label } | null
//     },

//     createStatus: "idle",
//     respondStatus: "idle",
//     receiveStatus: "idle",

//     error: null,
//   },
// };

// // ═══════════════════════════════════════════════════════════════════
// //  SLICE
// // ═══════════════════════════════════════════════════════════════════

// const stockSlice = createSlice({
//   name: "stock",
//   initialState,
//   reducers: {
//     // ── Flow filter / UI ──────────────────────────────────────────
//     setFlowFilters(state, { payload }) {
//       state.flow.filters = { ...state.flow.filters, ...payload };
//     },
//     resetFlowFilters(state) {
//       state.flow.filters = initialState.flow.filters;
//     },
//     clearFlowError(state) {
//       state.flow.error = null;
//     },
//     clearFlowCurrent(state) {
//       state.flow.current = null;
//     },

//     removeDropdownEntry(state, { payload: reqId }) {
//       state.req.dropdown = state.req.dropdown.filter(
//         (r) => r.stock_req_id !== reqId,
//       );
//     },

//     // ── Request filter / UI ───────────────────────────────────────
//     setReqFilters(state, { payload }) {
//       state.req.filters = { ...state.req.filters, ...payload };
//     },
//     resetReqFilters(state) {
//       state.req.filters = initialState.req.filters;
//     },
//     clearReqError(state) {
//       state.req.error = null;
//     },
//     setSelectedRequest(state, { payload }) {
//       state.req.ui.selectedRequest = payload;
//     },
//     clearSelectedRequest(state) {
//       state.req.ui.selectedRequest = null;
//     },
//     setRespondTarget(state, { payload }) {
//       state.req.ui.respondTarget = payload;
//     },
//     clearRespondTarget(state) {
//       state.req.ui.respondTarget = null;
//     },
//     setReceiveTarget(state, { payload }) {
//       state.req.ui.receiveTarget = payload;
//     },
//     clearReceiveTarget(state) {
//       state.req.ui.receiveTarget = null;
//     },
//     setShowCompose(state, { payload }) {
//       state.req.ui.showCompose = payload;
//     },

//     // setFlowSourceRequest(state, { payload }) {
//     //   state.req.ui.flowSourceRequest = payload;
//     // },
//     // clearFlowSourceRequest(state) {
//     //   state.req.ui.flowSourceRequest = null;
//     // },

//     // Optimistic updates
//     optimisticStar(state, { payload }) {
//       patchReq(state, payload.id, { is_starred: payload.starred });
//     },
//     optimisticRead(state, { payload }) {
//       patchReq(state, payload, { is_read: true });
//     },
//   },

//   extraReducers: (builder) => {
//     // ════════════════════════════════════════════
//     //  STOCK FLOW
//     // ════════════════════════════════════════════

//     builder
//       .addCase(fetchStockFlows.pending, (s) => {
//         s.flow.listStatus = "loading";
//         s.flow.error = null;
//       })
//       .addCase(fetchStockFlows.fulfilled, (s, { payload }) => {
//         s.flow.listStatus = "succeeded";
//         s.flow.list = payload.data || [];
//         s.flow.pagination = payload.pagination || s.flow.pagination;
//       })
//       .addCase(fetchStockFlows.rejected, (s, { payload }) => {
//         s.flow.listStatus = "failed";
//         s.flow.error = payload;
//       })

//       .addCase(fetchStockFlowById.pending, (s) => {
//         s.flow.detailStatus = "loading";
//       })
//       .addCase(fetchStockFlowById.fulfilled, (s, { payload }) => {
//         s.flow.detailStatus = "succeeded";
//         s.flow.current = payload;
//       })
//       .addCase(fetchStockFlowById.rejected, (s, { payload }) => {
//         s.flow.detailStatus = "failed";
//         s.flow.error = payload;
//       })

//       .addCase(fetchStockFlowProducts.pending, (s) => {
//         s.flow.productsStatus = "loading";
//       })
//       .addCase(fetchStockFlowProducts.fulfilled, (s, { payload }) => {
//         s.flow.productsStatus = "succeeded";
//         s.flow.products = payload.products;
//         s.flow.totalQty = payload.total_qty;
//       })
//       .addCase(fetchStockFlowProducts.rejected, (s, { payload }) => {
//         s.flow.productsStatus = "failed";
//         s.flow.error = payload;
//       })

//       .addCase(createStockFlow.pending, (s) => {
//         s.flow.mutateStatus = "loading";
//       })
//       .addCase(createStockFlow.fulfilled, (s) => {
//         s.flow.mutateStatus = "succeeded";
//       })
//       .addCase(createStockFlow.rejected, (s, { payload }) => {
//         s.flow.mutateStatus = "failed";
//         s.flow.error = payload;
//       })

//       .addCase(updateStockFlow.pending, (s) => {
//         s.flow.mutateStatus = "loading";
//         s.flow.error = null;
//       })
//       .addCase(updateStockFlow.fulfilled, (s, { payload }) => {
//         s.flow.mutateStatus = "succeeded";
//         patchFlow(s, payload.id, payload);
//       })
//       .addCase(updateStockFlow.rejected, (s, { payload }) => {
//         s.flow.mutateStatus = "failed";
//         s.flow.error = payload;
//       })

//       .addCase(deleteStockFlow.pending, (s) => {
//         s.flow.mutateStatus = "loading";
//       })
//       .addCase(deleteStockFlow.fulfilled, (s, { payload: id }) => {
//         s.flow.mutateStatus = "succeeded";
//         s.flow.list = s.flow.list.filter((sf) => sf.id !== id);
//       })
//       .addCase(deleteStockFlow.rejected, (s, { payload }) => {
//         s.flow.mutateStatus = "failed";
//         s.flow.error = payload;
//       })

//       .addCase(fetchStockFlowStats.pending, (s) => {
//         s.flow.statsStatus = "loading";
//       })
//       .addCase(fetchStockFlowStats.fulfilled, (s, { payload }) => {
//         s.flow.statsStatus = "succeeded";
//         s.flow.stats = payload;
//       })
//       .addCase(fetchStockFlowStats.rejected, (s) => {
//         s.flow.statsStatus = "failed";
//       })

//       .addCase(fetchStockFlowOptions.pending, (s) => {
//         s.flow.optionsStatus = "loading";
//       })
//       .addCase(fetchStockFlowOptions.fulfilled, (s, { payload }) => {
//         s.flow.optionsStatus = "succeeded";
//         s.flow.options.transport = payload.transport || [];
//         s.flow.options.status = payload.status || [];
//         s.flow.options.sort = payload.sort || [];
//       })
//       .addCase(fetchStockFlowOptions.rejected, (s) => {
//         s.flow.optionsStatus = "failed";
//       })
//       // this exisitng stock flow is not working from frotned properly but getting response in
//       .addCase(dispatchStockFlow.pending, (s) => {
//         s.flow.mutateStatus = "loading";
//         s.flow.error = null;
//       })
//       .addCase(dispatchStockFlow.fulfilled, (s, { payload }) => {
//         s.flow.mutateStatus = "succeeded";
//         if (payload.data) patchFlow(s, payload.data.id, payload.data);
//       })
//       .addCase(dispatchStockFlow.rejected, (s, { payload }) => {
//         s.flow.mutateStatus = "failed";
//         s.flow.error = payload;
//       })

//       .addCase(receiveStockFlow.pending, (s) => {
//         s.flow.mutateStatus = "loading";
//         s.flow.error = null;
//       })
//       .addCase(receiveStockFlow.fulfilled, (s, { payload }) => {
//         s.flow.mutateStatus = "succeeded";
//         if (payload.data) patchFlow(s, payload.data.id, payload.data);
//       })
//       .addCase(receiveStockFlow.rejected, (s, { payload }) => {
//         s.flow.mutateStatus = "failed";
//         s.flow.error = payload;
//       })

//       // ════════════════════════════════════════════
//       //  STOCK REQUEST
//       // ════════════════════════════════════════════

//       .addCase(fetchSentRequests.pending, (s) => {
//         s.req.sent.loading = true;
//         s.req.sent.error = null;
//       })
//       .addCase(fetchSentRequests.fulfilled, (s, { payload, meta }) =>
//         applyReqList(s, "sent", payload, meta.arg),
//       )
//       .addCase(fetchSentRequests.rejected, (s, { payload }) => {
//         s.req.sent.loading = false;
//         s.req.sent.error = payload;
//       })

//       .addCase(fetchApprovedRequests.pending, (s) => {
//         s.req.approved.loading = true;
//         s.req.approved.error = null;
//       })
//       .addCase(fetchApprovedRequests.fulfilled, (s, { payload, meta }) =>
//         applyReqList(s, "approved", payload, meta.arg),
//       )
//       .addCase(fetchApprovedRequests.rejected, (s, { payload }) => {
//         s.req.approved.loading = false;
//         s.req.approved.error = payload;
//       })

//       .addCase(fetchStarredRequests.pending, (s) => {
//         s.req.starred.loading = true;
//         s.req.starred.error = null;
//       })
//       .addCase(fetchStarredRequests.fulfilled, (s, { payload, meta }) =>
//         applyReqList(s, "starred", payload, meta.arg),
//       )
//       .addCase(fetchStarredRequests.rejected, (s, { payload }) => {
//         s.req.starred.loading = false;
//         s.req.starred.error = payload;
//       })

//       // ── Dropdown (AddStockFlow) ───────────────────────────────────
//       .addCase(fetchStockRequestDropdown.pending, (s) => {
//         s.req.dropdownLoading = true;
//       })
//       .addCase(fetchStockRequestDropdown.fulfilled, (s, { payload }) => {
//         s.req.dropdownLoading = false;
//         s.req.dropdown = payload; // [{ stock_req_id, description }]
//       })
//       .addCase(fetchStockRequestDropdown.rejected, (s) => {
//         s.req.dropdownLoading = false;
//       })

//       .addCase(fetchStockRequestStats.pending, (s) => {
//         s.req.statsLoading = true;
//       })
//       .addCase(fetchStockRequestStats.fulfilled, (s, { payload }) => {
//         s.req.statsLoading = false;
//         s.req.stats = payload;
//       })
//       .addCase(fetchStockRequestStats.rejected, (s) => {
//         s.req.statsLoading = false;
//       })

//       .addCase(fetchStockRequestPriorities.pending, (s) => {
//         s.req.prioritiesLoading = true;
//       })
//       .addCase(fetchStockRequestPriorities.fulfilled, (s, { payload }) => {
//         s.req.priorities = payload;
//         s.req.prioritiesLoading = false;
//       })
//       .addCase(fetchStockRequestPriorities.rejected, (s) => {
//         s.req.prioritiesLoading = false;
//       })

//       .addCase(createStockRequest.pending, (s) => {
//         s.req.createStatus = "loading";
//         s.req.error = null;
//       })
//       .addCase(createStockRequest.fulfilled, (s) => {
//         s.req.createStatus = "succeeded";
//         s.req.ui.showCompose = false;
//       })
//       .addCase(createStockRequest.rejected, (s, { payload }) => {
//         s.req.createStatus = "failed";
//         s.req.error = payload;
//       })

//       .addCase(respondToStockRequest.pending, (s) => {
//         s.req.respondStatus = "loading";
//       })
//       .addCase(respondToStockRequest.fulfilled, (s, { payload }) => {
//         s.req.respondStatus = "succeeded";
//         s.req.ui.respondTarget = null;
//         patchReq(s, payload.id, {
//           approved_at: payload.approved_at,
//           rejected_at: payload.rejected_at,
//         });
//       })
//       .addCase(respondToStockRequest.rejected, (s, { payload }) => {
//         s.req.respondStatus = "failed";
//         s.req.error = payload;
//       })

//       .addCase(markStockRequestReceived.pending, (s) => {
//         s.req.receiveStatus = "loading";
//       })
//       .addCase(markStockRequestReceived.fulfilled, (s, { payload }) => {
//         s.req.receiveStatus = "succeeded";
//         s.req.ui.receiveTarget = null;
//         patchReq(s, payload.id, {
//           received_at: payload.received_at,
//           receiver_notes: payload.receiver_notes,
//         });
//       })
//       .addCase(markStockRequestReceived.rejected, (s, { payload }) => {
//         s.req.receiveStatus = "failed";
//         s.req.error = payload;
//       })

//       .addCase(toggleStockRequestStar.rejected, (s, { meta }) => {
//         patchReq(s, meta.arg.id, { is_starred: !meta.arg.starred });
//       })

//       .addCase(markStockRequestRead.fulfilled, (s, { payload }) => {
//         patchReq(s, payload, { is_read: true });
//       });
//   },
// });

// export const {
//   // flow
//   setFlowFilters,
//   resetFlowFilters,
//   clearFlowError,
//   clearFlowCurrent,
//   // req
//   setReqFilters,
//   resetReqFilters,
//   clearReqError,
//   setSelectedRequest,
//   clearSelectedRequest,
//   setRespondTarget,
//   clearRespondTarget,
//   setReceiveTarget,
//   clearReceiveTarget,
//   setShowCompose,
//   removeDropdownEntry,
//   // setFlowSourceRequest,
//   // clearFlowSourceRequest,
//   // optimistic
//   optimisticStar,
//   optimisticRead,
// } = stockSlice.actions;

// // ── Flow selectors ──────────────────────────────────────────────────────────
// export const selectFlowList = (s) => s.stock.flow.list;
// export const selectFlowCurrent = (s) => s.stock.flow.current;
// export const selectFlowProducts = (s) => s.stock.flow.products;
// export const selectFlowTotalQty = (s) => s.stock.flow.totalQty;
// export const selectFlowStats = (s) => s.stock.flow.stats;
// export const selectFlowFilters = (s) => s.stock.flow.filters;
// export const selectFlowPagination = (s) => s.stock.flow.pagination;
// export const selectFlowOptions = (s) => s.stock.flow.options;
// export const selectFlowListLoading = (s) =>
//   s.stock.flow.listStatus === "loading";
// export const selectFlowDetailLoading = (s) =>
//   s.stock.flow.detailStatus === "loading";
// export const selectFlowProductsLoading = (s) =>
//   s.stock.flow.productsStatus === "loading";
// export const selectFlowMutating = (s) =>
//   s.stock.flow.mutateStatus === "loading";
// export const selectFlowOptionsLoading = (s) =>
//   s.stock.flow.optionsStatus === "loading";
// export const selectFlowError = (s) => s.stock.flow.error;

// // ── Request selectors ────────────────────────────────────────────────────────
// export const selectReqView = (view) => (s) => s.stock.req[view];
// export const selectReqStats = (s) => s.stock.req.stats;
// export const selectReqFilters = (s) => s.stock.req.filters;
// export const selectReqPriorities = (s) => s.stock.req.priorities;
// export const selectReqUI = (s) => s.stock.req.ui;
// export const selectShowCompose = (s) => s.stock.req.ui.showCompose;
// export const selectSelectedRequest = (s) => s.stock.req.ui.selectedRequest;
// export const selectRespondTarget = (s) => s.stock.req.ui.respondTarget;
// export const selectReceiveTarget = (s) => s.stock.req.ui.receiveTarget;
// export const selectReqCreateStatus = (s) => s.stock.req.createStatus;
// export const selectReqRespondStatus = (s) => s.stock.req.respondStatus;
// export const selectReqReceiveStatus = (s) => s.stock.req.receiveStatus;
// export const selectReqError = (s) => s.stock.req.error;
// // export const selectFlowSourceRequest   = (s) => s.stock.req.ui.flowSourceRequest;
// export const selectReqDropdown = (s) => s.stock.req.dropdown;
// export const selectReqDropdownLoading = (s) => s.stock.req.dropdownLoading;

// export default stockSlice.reducer;




import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AuthService from "../../../services/authService";

// ═══════════════════════════════════════════════════════════════════
//  STOCK FLOW  — Async Thunks
// ═══════════════════════════════════════════════════════════════════

export const fetchStockFlows = createAsyncThunk(
  "stock/fetchStockFlows",
  async (filters = {}, { rejectWithValue }) => {
    try {
    
      const params = {
        page_no: filters.page ?? 1,
        limit: filters.limit ?? 10,
        // ...(filters.search    && { search: filters.search }),
        // ...(filters.status    && { status: filters.status }),
        // ...(filters.transport && { transport: filters.transport }),
        // ...(filters.from_wh   && { from_wh: filters.from_wh }),
        // ...(filters.to_wh     && { to_wh: filters.to_wh }),
        // ...(filters.sortBy    && { sort_by: filters.sortBy }),
        // ...(filters.sortOrder && { sort_order: filters.sortOrder }),
      };
      const res = await AuthService.getStockTransfer(params);
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchStockFlowById = createAsyncThunk(
  "stock/fetchStockFlowById",
  async (stock_id, { rejectWithValue }) => {
    try {
      // AuthService.getStockFlowById to be wired up later
      const res = await AuthService.getStockFlowById(stock_id);
      return res.data.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchStockFlowProducts = createAsyncThunk(
  "stock/fetchStockFlowProducts",
  async (stock_id, { rejectWithValue }) => {
    try {
      const res = await AuthService.getStockFlowProducts(stock_id);
      return {
        products: res.data.data || [],
        total_qty: res.data.total_qty ?? 0,
      };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
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
  },
);

// ═══════════════════════════════════════════════════════════════════
//  STOCK REQUEST  — Async Thunks
// ═══════════════════════════════════════════════════════════════════

export const fetchSentRequests = createAsyncThunk(
  "stock/req/fetchSent",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await AuthService.getStockRequests({ ...params });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchApprovedRequests = createAsyncThunk(
  "stock/req/fetchApproved",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await AuthService.getStockRequests({
        ...params,
        status: "approved",
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchStarredRequests = createAsyncThunk(
  "stock/req/fetchStarred",
  async (params = {}, { rejectWithValue }) => {
    try {
      const res = await AuthService.getStockRequests({
        ...params,
        starred: true,
      });
      return res.data;
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
);

export const fetchStockRequestStats = createAsyncThunk(
  "stock/req/fetchStats",
  async (_, { rejectWithValue }) => {
    try {
      const res = await AuthService.getStockRequestStats();
      return res.data.data;
    } catch (err) {
      console.warn("getStockRequestStats not available, using fallback:", err.message);
      try {
        const listRes = await AuthService.getStockRequests({
          page_no: 1,
          limit: 100,
        });
        const items = listRes.data.data || [];
        const total = listRes.data.total_records || items.length;
        const pending  = items.filter((r) => !r.is_approved).length;
        const approved = items.filter((r) => r.is_approved && !r.is_delivered).length;
        const received = items.filter((r) => r.is_delivered).length;
        return { total, pending, approved, rejected: 0, received };
      } catch (fallbackErr) {
        return rejectWithValue(fallbackErr.message);
      }
    }
  },
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
  },
);

export const fetchStockRequestDropdown = createAsyncThunk(
  "stock/req/fetchDropdown",
  async (_, { rejectWithValue }) => {
    try {
      const res = await AuthService.getActiveStockRequests();
      const data = res.data?.data || [];
      return data.map((r) => ({
        stock_req_id: r.stock_req_id,
        req_status: r.req_status,
        description: r.description ?? null,
      }));
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
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
  },
);

export const respondToStockRequest = createAsyncThunk(
  "stock/req/respond",
  async ({ id, action, scheduled_dispatch, description }, { rejectWithValue }) => {
    try {
      const res = await AuthService.respondToStockRequest(id, {
        action,
        scheduled_dispatch,
        description,
      });
      return { id, ...res.data };
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || err.message);
    }
  },
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
  },
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
  },
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
  },
);

// ═══════════════════════════════════════════════════════════════════
//  SHARED HELPERS
// ═══════════════════════════════════════════════════════════════════

/**
 * Patch a flow in the list and current by stock_id (string).
 * The API uses stock_id as the primary identifier — no numeric id.
 */
const patchFlow = (state, stock_id, patch) => {
  const idx = state.flow.list.findIndex((sf) => sf.stock_id === stock_id);
  if (idx !== -1) state.flow.list[idx] = { ...state.flow.list[idx], ...patch };
  if (state.flow.current?.stock_id === stock_id)
    state.flow.current = { ...state.flow.current, ...patch };
};

const applyReqList = (state, viewKey, payload, sentFilters) => {
  const items = payload.data || [];
  const totalRecords = payload.total_records ?? items.length;
  const page = sentFilters?.page_no ?? 1;
  const limit = sentFilters?.limit ?? state.req.filters.limit;
  const totalPages = limit > 0 ? Math.ceil(totalRecords / limit) : 1;

  state.req[viewKey].items = items;
  state.req[viewKey].pagination = {
    currentPage: page,
    totalPages,
    total: totalRecords,
  };
  state.req[viewKey].loading = false;
  state.req[viewKey].error = null;
};

const patchReq = (state, id, patch) => {
  ["sent", "inbox", "approved", "starred"].forEach((key) => {
    state.req[key].items = state.req[key].items.map((r) =>
      r.req_id === id ? { ...r, ...patch } : r,
    );
  });
  if (state.req.ui.selectedRequest?.req_id === id)
    state.req.ui.selectedRequest = {
      ...state.req.ui.selectedRequest,
      ...patch,
    };
};

const reqViewBucket = () => ({
  items: [],
  loading: false,
  error: null,
  pagination: { currentPage: 1, totalPages: 1, total: 0 },
});

// ═══════════════════════════════════════════════════════════════════
//  INITIAL STATE
// ═══════════════════════════════════════════════════════════════════

const initialState = {
  // ── Stock Flow ──────────────────────────────────────────────────
  flow: {
    list: [],      // items shaped exactly as API returns them
    current: null, // single record from getStockFlowById (to be wired)

    products: [],
    totalQty: 0,

    stats: {
      total: 0,
      approved: 0,
      in_transit: 0,
      delivered: 0,
      total_quantity: 0,
    },

    filters: {
      search: "",
      status: "",
      transport: "",
      from_wh: "",
      to_wh: "",
      sortBy: "created_at",
      sortOrder: "DESC",
      page: 1,
      limit: 10,
    },

    // Pagination derived from API's total_records
    pagination: { total: 0, page: 1, limit: 10, totalPages: 0 },

    options: { transport: [], status: [], sort: [] },

    listStatus: "idle",
    detailStatus: "idle",
    productsStatus: "idle",
    mutateStatus: "idle",
    optionsStatus: "idle",
    statsStatus: "idle",

    error: null,
  },

  // ── Stock Request ───────────────────────────────────────────────
  req: {
    sent: reqViewBucket(),
    inbox: reqViewBucket(),
    approved: reqViewBucket(),
    starred: reqViewBucket(),

    dropdown: [],
    dropdownLoading: false,

    stats: { total: 0, pending: 0, approved: 0, rejected: 0, received: 0 },
    statsLoading: false,

    priorities: [],
    prioritiesLoading: false,

    filters: {
      priority: "",
      status: "",
      search: "",
      sortBy: "created_at",
      sortOrder: "DESC",
      page: 1,
      limit: 10,
    },

    ui: {
      selectedRequest: null,
      respondTarget: null,
      receiveTarget: null,
      showCompose: false,
    },

    createStatus: "idle",
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
    // ── Flow filter / UI ──────────────────────────────────────────
    setFlowFilters(state, { payload }) {
      // Reset to page 1 whenever any non-page filter changes
      const isPageChange = "page" in payload || "limit" in payload;
      state.flow.filters = {
        ...state.flow.filters,
        ...payload,
        ...(isPageChange ? {} : { page: 1 }),
      };
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

    removeDropdownEntry(state, { payload: reqId }) {
      state.req.dropdown = state.req.dropdown.filter(
        (r) => r.stock_req_id !== reqId,
      );
    },

    // ── Request filter / UI ───────────────────────────────────────
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
    //  STOCK FLOW — fetchStockFlows
    //
    //  API shape:
    //  {
    //    success: true,
    //    data: [
    //      {
    //        stock_id: "STT-GNW-02526-5",   ← string PK (no numeric id)
    //        product_arr: [{ prod_uuid, partial_code,
    //                        article_profile_id, article_profile_name,
    //                        status, count }],
    //        transport: "bus" | "courier" | "employee",
    //        submitted_at, ack_status, status, created_at,
    //        stock_req_id,
    //        total_articles, total_items, total_products,
    //        requester_name, requester_wh,
    //        dispatcher_name, dispatcher_wh,
    //      }
    //    ],
    //    total_records: 5,
    //    message: "..."
    //  }
    //
    //  NOTE: there is no pagination object — total_records is at root.
    //  NOTE: there are no from_wh / to_wh UUID fields; use
    //        requester_wh / dispatcher_wh for display.
    //  NOTE: there is no actions {} object — derive can_dispatch /
    //        can_receive / can_edit / can_delete from status in the UI.
    // ════════════════════════════════════════════

    builder
      .addCase(fetchStockFlows.pending, (s) => {
        s.flow.listStatus = "loading";
        s.flow.error = null;
      })
      .addCase(fetchStockFlows.fulfilled, (s, { payload, meta }) => {
        s.flow.listStatus = "succeeded";
        s.flow.list = payload.data || [];

        // Derive pagination from total_records (API has no pagination object)
        const total = payload.total_records ?? (payload.data || []).length;
        const limit = meta.arg?.limit ?? s.flow.filters.limit;
        const page  = meta.arg?.page  ?? s.flow.filters.page;
        s.flow.pagination = {
          total,
          page,
          limit,
          totalPages: limit > 0 ? Math.ceil(total / limit) : 1,
        };
      })
      .addCase(fetchStockFlows.rejected, (s, { payload }) => {
        s.flow.listStatus = "failed";
        s.flow.error = payload;
      })

      // ── fetchStockFlowById ──────────────────────────────────────
      // Wire-up: AuthService.getStockFlowById(stock_id)
      // Expected response shape: { data: { ...same fields as list item } }
      .addCase(fetchStockFlowById.pending, (s) => {
        s.flow.detailStatus = "loading";
        s.flow.error = null;
      })
      .addCase(fetchStockFlowById.fulfilled, (s, { payload }) => {
        s.flow.detailStatus = "succeeded";
        s.flow.current = payload; // full record with product_arr etc.
      })
      .addCase(fetchStockFlowById.rejected, (s, { payload }) => {
        s.flow.detailStatus = "failed";
        s.flow.error = payload;
      })

      .addCase(fetchStockFlowProducts.pending, (s) => {
        s.flow.productsStatus = "loading";
      })
      .addCase(fetchStockFlowProducts.fulfilled, (s, { payload }) => {
        s.flow.productsStatus = "succeeded";
        s.flow.products = payload.products;
        s.flow.totalQty = payload.total_qty;
      })
      .addCase(fetchStockFlowProducts.rejected, (s, { payload }) => {
        s.flow.productsStatus = "failed";
        s.flow.error = payload;
      })

      .addCase(createStockFlow.pending, (s) => {
        s.flow.mutateStatus = "loading";
      })
      .addCase(createStockFlow.fulfilled, (s) => {
        s.flow.mutateStatus = "succeeded";
      })
      .addCase(createStockFlow.rejected, (s, { payload }) => {
        s.flow.mutateStatus = "failed";
        s.flow.error = payload;
      })

      .addCase(updateStockFlow.pending, (s) => {
        s.flow.mutateStatus = "loading";
        s.flow.error = null;
      })
      .addCase(updateStockFlow.fulfilled, (s, { payload }) => {
        s.flow.mutateStatus = "succeeded";
        // payload must contain stock_id (string) for patchFlow to work
        if (payload?.stock_id) patchFlow(s, payload.stock_id, payload);
      })
      .addCase(updateStockFlow.rejected, (s, { payload }) => {
        s.flow.mutateStatus = "failed";
        s.flow.error = payload;
      })

      .addCase(deleteStockFlow.pending, (s) => {
        s.flow.mutateStatus = "loading";
      })
      .addCase(deleteStockFlow.fulfilled, (s, { payload: stock_id }) => {
        s.flow.mutateStatus = "succeeded";
        // payload is the stock_id string passed to the thunk
        s.flow.list = s.flow.list.filter((sf) => sf.stock_id !== stock_id);
      })
      .addCase(deleteStockFlow.rejected, (s, { payload }) => {
        s.flow.mutateStatus = "failed";
        s.flow.error = payload;
      })

      .addCase(fetchStockFlowStats.pending, (s) => {
        s.flow.statsStatus = "loading";
      })
      .addCase(fetchStockFlowStats.fulfilled, (s, { payload }) => {
        s.flow.statsStatus = "succeeded";
        s.flow.stats = payload;
      })
      .addCase(fetchStockFlowStats.rejected, (s) => {
        s.flow.statsStatus = "failed";
      })

      .addCase(fetchStockFlowOptions.pending, (s) => {
        s.flow.optionsStatus = "loading";
      })
      .addCase(fetchStockFlowOptions.fulfilled, (s, { payload }) => {
        s.flow.optionsStatus = "succeeded";
        s.flow.options.transport = payload.transport || [];
        s.flow.options.status    = payload.status    || [];
        s.flow.options.sort      = payload.sort      || [];
      })
      .addCase(fetchStockFlowOptions.rejected, (s) => {
        s.flow.optionsStatus = "failed";
      })

      .addCase(dispatchStockFlow.pending, (s) => {
        s.flow.mutateStatus = "loading";
        s.flow.error = null;
      })
      .addCase(dispatchStockFlow.fulfilled, (s, { payload }) => {
        s.flow.mutateStatus = "succeeded";
        if (payload.data?.stock_id) patchFlow(s, payload.data.stock_id, payload.data);
      })
      .addCase(dispatchStockFlow.rejected, (s, { payload }) => {
        s.flow.mutateStatus = "failed";
        s.flow.error = payload;
      })

      .addCase(receiveStockFlow.pending, (s) => {
        s.flow.mutateStatus = "loading";
        s.flow.error = null;
      })
      .addCase(receiveStockFlow.fulfilled, (s, { payload }) => {
        s.flow.mutateStatus = "succeeded";
        if (payload.data?.stock_id) patchFlow(s, payload.data.stock_id, payload.data);
      })
      .addCase(receiveStockFlow.rejected, (s, { payload }) => {
        s.flow.mutateStatus = "failed";
        s.flow.error = payload;
      })

      // ════════════════════════════════════════════
      //  STOCK REQUEST
      // ════════════════════════════════════════════

      .addCase(fetchSentRequests.pending, (s) => {
        s.req.sent.loading = true;
        s.req.sent.error = null;
      })
      .addCase(fetchSentRequests.fulfilled, (s, { payload, meta }) =>
        applyReqList(s, "sent", payload, meta.arg),
      )
      .addCase(fetchSentRequests.rejected, (s, { payload }) => {
        s.req.sent.loading = false;
        s.req.sent.error = payload;
      })

      .addCase(fetchApprovedRequests.pending, (s) => {
        s.req.approved.loading = true;
        s.req.approved.error = null;
      })
      .addCase(fetchApprovedRequests.fulfilled, (s, { payload, meta }) =>
        applyReqList(s, "approved", payload, meta.arg),
      )
      .addCase(fetchApprovedRequests.rejected, (s, { payload }) => {
        s.req.approved.loading = false;
        s.req.approved.error = payload;
      })

      .addCase(fetchStarredRequests.pending, (s) => {
        s.req.starred.loading = true;
        s.req.starred.error = null;
      })
      .addCase(fetchStarredRequests.fulfilled, (s, { payload, meta }) =>
        applyReqList(s, "starred", payload, meta.arg),
      )
      .addCase(fetchStarredRequests.rejected, (s, { payload }) => {
        s.req.starred.loading = false;
        s.req.starred.error = payload;
      })

      .addCase(fetchStockRequestDropdown.pending, (s) => {
        s.req.dropdownLoading = true;
      })
      .addCase(fetchStockRequestDropdown.fulfilled, (s, { payload }) => {
        s.req.dropdownLoading = false;
        s.req.dropdown = payload;
      })
      .addCase(fetchStockRequestDropdown.rejected, (s) => {
        s.req.dropdownLoading = false;
      })

      .addCase(fetchStockRequestStats.pending, (s) => {
        s.req.statsLoading = true;
      })
      .addCase(fetchStockRequestStats.fulfilled, (s, { payload }) => {
        s.req.statsLoading = false;
        s.req.stats = payload;
      })
      .addCase(fetchStockRequestStats.rejected, (s) => {
        s.req.statsLoading = false;
      })

      .addCase(fetchStockRequestPriorities.pending, (s) => {
        s.req.prioritiesLoading = true;
      })
      .addCase(fetchStockRequestPriorities.fulfilled, (s, { payload }) => {
        s.req.priorities = payload;
        s.req.prioritiesLoading = false;
      })
      .addCase(fetchStockRequestPriorities.rejected, (s) => {
        s.req.prioritiesLoading = false;
      })

      .addCase(createStockRequest.pending, (s) => {
        s.req.createStatus = "loading";
        s.req.error = null;
      })
      .addCase(createStockRequest.fulfilled, (s) => {
        s.req.createStatus = "succeeded";
        s.req.ui.showCompose = false;
      })
      .addCase(createStockRequest.rejected, (s, { payload }) => {
        s.req.createStatus = "failed";
        s.req.error = payload;
      })

      .addCase(respondToStockRequest.pending, (s) => {
        s.req.respondStatus = "loading";
      })
      .addCase(respondToStockRequest.fulfilled, (s, { payload }) => {
        s.req.respondStatus = "succeeded";
        s.req.ui.respondTarget = null;
        patchReq(s, payload.id, {
          approved_at: payload.approved_at,
          rejected_at: payload.rejected_at,
        });
      })
      .addCase(respondToStockRequest.rejected, (s, { payload }) => {
        s.req.respondStatus = "failed";
        s.req.error = payload;
      })

      .addCase(markStockRequestReceived.pending, (s) => {
        s.req.receiveStatus = "loading";
      })
      .addCase(markStockRequestReceived.fulfilled, (s, { payload }) => {
        s.req.receiveStatus = "succeeded";
        s.req.ui.receiveTarget = null;
        patchReq(s, payload.id, {
          received_at: payload.received_at,
          receiver_notes: payload.receiver_notes,
        });
      })
      .addCase(markStockRequestReceived.rejected, (s, { payload }) => {
        s.req.receiveStatus = "failed";
        s.req.error = payload;
      })

      .addCase(toggleStockRequestStar.rejected, (s, { meta }) => {
        patchReq(s, meta.arg.id, { is_starred: !meta.arg.starred });
      })

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
  removeDropdownEntry,
  // optimistic
  optimisticStar,
  optimisticRead,
} = stockSlice.actions;

// ── Flow selectors ──────────────────────────────────────────────────────────
export const selectFlowList          = (s) => s.stock.flow.list;
export const selectFlowCurrent       = (s) => s.stock.flow.current;
export const selectFlowProducts      = (s) => s.stock.flow.products;
export const selectFlowTotalQty      = (s) => s.stock.flow.totalQty;
export const selectFlowStats         = (s) => s.stock.flow.stats;
export const selectFlowFilters       = (s) => s.stock.flow.filters;
export const selectFlowPagination    = (s) => s.stock.flow.pagination;
export const selectFlowOptions       = (s) => s.stock.flow.options;
export const selectFlowListLoading   = (s) => s.stock.flow.listStatus === "loading";
export const selectFlowDetailLoading = (s) => s.stock.flow.detailStatus === "loading";
export const selectFlowProductsLoading = (s) => s.stock.flow.productsStatus === "loading";
export const selectFlowMutating      = (s) => s.stock.flow.mutateStatus === "loading";
export const selectFlowOptionsLoading = (s) => s.stock.flow.optionsStatus === "loading";
export const selectFlowError         = (s) => s.stock.flow.error;

// ── Request selectors ────────────────────────────────────────────────────────
export const selectReqView           = (view) => (s) => s.stock.req[view];
export const selectReqStats          = (s) => s.stock.req.stats;
export const selectReqFilters        = (s) => s.stock.req.filters;
export const selectReqPriorities     = (s) => s.stock.req.priorities;
export const selectReqUI             = (s) => s.stock.req.ui;
export const selectShowCompose       = (s) => s.stock.req.ui.showCompose;
export const selectSelectedRequest   = (s) => s.stock.req.ui.selectedRequest;
export const selectRespondTarget     = (s) => s.stock.req.ui.respondTarget;
export const selectReceiveTarget     = (s) => s.stock.req.ui.receiveTarget;
export const selectReqCreateStatus   = (s) => s.stock.req.createStatus;
export const selectReqRespondStatus  = (s) => s.stock.req.respondStatus;
export const selectReqReceiveStatus  = (s) => s.stock.req.receiveStatus;
export const selectReqError          = (s) => s.stock.req.error;
export const selectReqDropdown       = (s) => s.stock.req.dropdown;
export const selectReqDropdownLoading = (s) => s.stock.req.dropdownLoading;

export default stockSlice.reducer;