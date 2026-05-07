

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from '../../../services/authService';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = {
        ...filters,
        page: filters.page || 1,
        limit: filters.limit || 10,
      };
      const response = await AuthService.getProduct(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchProductById = createAsyncThunk(
  'products/fetchProductById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await AuthService.getProductById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const createProduct = createAsyncThunk(
  'products/createProduct',
  async (productData, { rejectWithValue }) => {
    try {
      const response = await AuthService.createProduct(productData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const bulkCreateProducts = createAsyncThunk(
  'products/bulkCreateProducts',
  async (productsArray, { rejectWithValue }) => {
    try {
      const response = await AuthService.bulkCreateProducts(productsArray);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const updateProduct = createAsyncThunk(
  'products/updateProduct',
  async ({ prod_id, data }, { rejectWithValue }) => {
    try {
      const response = await AuthService.updateProductById(prod_id, data);
      return { prod_id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const deleteProduct = createAsyncThunk(
  'products/deleteProduct',
  async (id, { rejectWithValue }) => {
    try {
      await AuthService.deleteProduct(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


// export const scanProduct = createAsyncThunk(
//   "product/scan",
//   async ({ code, product_id = null }, { rejectWithValue }) => {
//     try {

//       if (!product_id) {
//         return rejectWithValue(
//           "Product ID is required to scan for transfer. Please select an article profile first."
//         );
//       }
//       const res = await AuthService.getScanForTransfer(code, { product_id });

  
//       return res.data;
//     } catch (err) {
//       return rejectWithValue(err.response?.data?.message || err.message);
//     }
//   }
// );

export const scanProductFromDb = createAsyncThunk(
  "product/scanSimple",
  async (code, { rejectWithValue }) => {
    try {
      const res = await AuthService.getProductByScan(code);
      return res.data?.data;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);



// export const scanProduct = createAsyncThunk(
//   "product/scan",
//   async ({ code, product_id }, { rejectWithValue }) => {
//     try {
//       if (!product_id) {
//         return rejectWithValue("Product ID is required");
//       }

//       const res = await AuthService.getScanForTransfer({
//         partial_code: code,
//         product_id,
//       });

//       return res.data?.data;
//     } catch (err) {
//       return rejectWithValue(
//         err.response?.data?.message || err.message
//       );
//     }
//   }
// );



export const scanProduct = createAsyncThunk(
  "product/scan",
  async ({ code, product_id }, { rejectWithValue }) => {
    try {
      if (!product_id) {
        return rejectWithValue("Product ID is required");
      }

      const res = await AuthService.getScanForTransfer({
        partial_code: code,
        product_id,
      });

      return {
        data: res.data?.data,
        message: res.data?.message,
      };
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || err.message
      );
    }
  }
);



const initialState = {
  product_list:    [],
  currentProduct:  null,
  scannedProduct:  null,
  filters: {
    search:             '',
    status:             '',
    warehouse_id:       '',
    article_profile_id: '',
    sortBy:             'created_at',
    sortOrder:          'DESC',
    page:               1,
    limit:              10,
  },
  pagination: {
    total:      0,
    page:       1,
    limit:      10,
    totalPages: 0,
  },
  status:           'idle',
  error:            null,
  createStatus:     'idle',
  bulkCreateStatus: 'idle',
  updateStatus:     'idle',
  deleteStatus:     'idle',
  scanStatus:       'idle',
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProductList: (state, action) => {
      state.product_list = action.payload;
    },

    setFilters: (state, action) => {
      const isNonPaginationChange =
        action.payload.search             !== undefined ||
        action.payload.status             !== undefined ||
        action.payload.warehouse_id       !== undefined ||
        action.payload.article_profile_id !== undefined ||
        action.payload.sortBy             !== undefined ||
        action.payload.sortOrder          !== undefined;

      const isPaginationChange =
        action.payload.page  !== undefined ||
        action.payload.limit !== undefined;

      state.filters = { ...state.filters, ...action.payload };

      if (isNonPaginationChange && !isPaginationChange) {
        state.filters.page    = 1;
        state.pagination.page = 1;
      }

      if (action.payload.page !== undefined) {
        state.pagination.page = action.payload.page;
      }

      if (action.payload.limit !== undefined) {
        state.pagination.limit = action.payload.limit;
        if (action.payload.page === undefined) {
          state.filters.page    = 1;
          state.pagination.page = 1;
        }
      }
    },

    resetFilters: (state) => {
      state.filters     = initialState.filters;
      state.pagination  = initialState.pagination;
    },
    setCurrentProduct:    (state, action) => { state.currentProduct = action.payload; },
    clearCurrentProduct:  (state) => { state.currentProduct = null; },
    clearScannedProduct:  (state) => { state.scannedProduct = null; state.scanStatus = 'idle'; },
    resetCreateStatus:    (state) => { state.createStatus = 'idle'; state.error = null; },
    resetBulkCreateStatus:(state) => { state.bulkCreateStatus = 'idle'; state.error = null; },
    resetUpdateStatus:    (state) => { state.updateStatus = 'idle'; state.error = null; },
    resetDeleteStatus:    (state) => { state.deleteStatus = 'idle'; state.error = null; },
    resetProductState:    ()      => initialState,
  },

  extraReducers: (builder) => {
    builder
      // fetchProducts
      .addCase(fetchProducts.pending,   (state) => { state.status = 'loading'; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status       = 'succeeded';
        state.product_list = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = {
            total:      action.payload.pagination.total,
            page:       action.payload.pagination.page,
            limit:      action.payload.pagination.limit,
            totalPages: action.payload.pagination.totalPages,
          };
        }
        state.error = null;
      })
      .addCase(fetchProducts.rejected,  (state, action) => { state.status = 'failed'; state.error = action.payload || action.error.message; })

      // fetchProductById
      .addCase(fetchProductById.pending,   (state) => { state.status = 'loading'; })
      .addCase(fetchProductById.fulfilled, (state, action) => { state.status = 'succeeded'; state.currentProduct = action.payload; })
      .addCase(fetchProductById.rejected,  (state, action) => { state.status = 'failed'; state.error = action.payload; })

      // createProduct
      .addCase(createProduct.pending,   (state) => { state.createStatus = 'loading'; state.error = null; })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        if (action.payload.data) state.product_list.unshift(action.payload.data);
      })
      .addCase(createProduct.rejected,  (state, action) => { state.createStatus = 'failed'; state.error = action.payload; })

      // bulkCreateProducts
      .addCase(bulkCreateProducts.pending,   (state) => { state.bulkCreateStatus = 'loading'; state.error = null; })
      .addCase(bulkCreateProducts.fulfilled, (state, action) => {
        state.bulkCreateStatus = 'succeeded';
        if (action.payload.data?.products && Array.isArray(action.payload.data.products)) {
          state.product_list = [...action.payload.data.products, ...state.product_list];
        }
      })
      .addCase(bulkCreateProducts.rejected,  (state, action) => { state.bulkCreateStatus = 'failed'; state.error = action.payload; })

      // updateProduct
      .addCase(updateProduct.pending,   (state) => { state.updateStatus = 'loading'; state.error = null; })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        const index = state.product_list.findIndex(p => p.prod_uuid === action.payload.prod_id);
        if (index !== -1) state.product_list[index] = { ...state.product_list[index], ...action.payload.data };
      })
      .addCase(updateProduct.rejected,  (state, action) => { state.updateStatus = 'failed'; state.error = action.payload; })

      // deleteProduct
      .addCase(deleteProduct.pending,   (state) => { state.deleteStatus = 'loading'; state.error = null; })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded';
        state.product_list  = state.product_list.filter(p => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected,  (state, action) => { state.deleteStatus = 'failed'; state.error = action.payload; })

      // scanProduct
      .addCase(scanProduct.pending,   (state) => { state.scanStatus = 'loading'; state.error = null; })
      .addCase(scanProduct.fulfilled, (state, action) => { state.scanStatus = 'succeeded'; state.scannedProduct = action.payload; })
      .addCase(scanProduct.rejected,  (state, action) => { state.scanStatus = 'failed'; state.error = action.payload; });
  },
});

export const {
  setProductList,
  setFilters,
  resetFilters,
  setCurrentProduct,
  clearCurrentProduct,
  clearScannedProduct,
  resetCreateStatus,
  resetBulkCreateStatus,
  resetUpdateStatus,
  resetDeleteStatus,
  resetProductState,
} = productSlice.actions;

export default productSlice.reducer;