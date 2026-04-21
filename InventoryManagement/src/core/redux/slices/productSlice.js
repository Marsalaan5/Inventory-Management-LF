
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from '../../../services/authService';

// Existing thunks...
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

// BULK CREATE PRODUCTS - NEW
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

export const scanProduct = createAsyncThunk(
  'products/scanProduct',
  async (code, { rejectWithValue }) => {
    try {
      const response = await AuthService.getProductByScan(code);
      console.log("++++++++++++",response.data)
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);
// 
const initialState = {
  product_list: [],
  currentProduct: null,
  scannedProduct: null,
  filters: {
    search: '',
    status: '',
    warehouse_id: '',
    article_profile_id: '',
    sortBy: 'created_at',
    sortOrder: 'DESC',
    page: 1,
    limit: 10,
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  status: 'idle',
  error: null,
  createStatus: 'idle',
  bulkCreateStatus: 'idle',
  updateStatus: 'idle',
  deleteStatus: 'idle',
  scanStatus: 'idle',
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
        action.payload.search !== undefined ||
        action.payload.status !== undefined ||
        action.payload.warehouse_id !== undefined ||
        action.payload.article_profile_id !== undefined ||
        action.payload.sortBy !== undefined ||
        action.payload.sortOrder !== undefined;

      const isPaginationChange =
        action.payload.page !== undefined ||
        action.payload.limit !== undefined;

      state.filters = { ...state.filters, ...action.payload };

      if (isNonPaginationChange && !isPaginationChange) {
        state.filters.page = 1;
        state.pagination.page = 1;
      }

      if (action.payload.page !== undefined) {
        state.pagination.page = action.payload.page;
      }

      if (action.payload.limit !== undefined) {
        state.pagination.limit = action.payload.limit;

        if (action.payload.page === undefined) {
          state.filters.page = 1;
          state.pagination.page = 1;
        }
      }
    },

    resetFilters: (state) => {
      state.filters = initialState.filters;
      state.pagination = initialState.pagination;
    },
    setCurrentProduct: (state, action) => {
      state.currentProduct = action.payload;
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null;
    },
    clearScannedProduct: (state) => {
      state.scannedProduct = null;
      state.scanStatus = 'idle';
    },
    resetCreateStatus: (state) => {
      state.createStatus = 'idle';
      state.error = null;
    },
    resetBulkCreateStatus: (state) => {
      state.bulkCreateStatus = 'idle';
      state.error = null;
    },
    resetUpdateStatus: (state) => {
      state.updateStatus = 'idle';
      state.error = null;
    },
    resetDeleteStatus: (state) => {
      state.deleteStatus = 'idle';
      state.error = null;
    },
    resetProductState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Products
      .addCase(fetchProducts.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.product_list = action.payload.data || [];

        if (action.payload.pagination) {
          state.pagination = {
            total: action.payload.pagination.total,
            page: action.payload.pagination.page,
            limit: action.payload.pagination.limit,
            totalPages: action.payload.pagination.totalPages,
          };
        }
        state.error = null;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // Fetch Product By ID
      .addCase(fetchProductById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchProductById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentProduct = action.payload;
      })
      .addCase(fetchProductById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Create Product
      .addCase(createProduct.pending, (state) => {
        state.createStatus = 'loading';
        state.error = null;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        if (action.payload.data) {
          state.product_list.unshift(action.payload.data);
        }
      })
      .addCase(createProduct.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = action.payload;
      })

      // BULK CREATE PRODUCTS - NEW
      .addCase(bulkCreateProducts.pending, (state) => {
        state.bulkCreateStatus = 'loading';
        state.error = null;
      })
      .addCase(bulkCreateProducts.fulfilled, (state, action) => {
        state.bulkCreateStatus = 'succeeded';
        // Optionally add the created products to the list
        if (action.payload.data?.products && Array.isArray(action.payload.data.products)) {
          // Add new products to the beginning of the list
          state.product_list = [...action.payload.data.products, ...state.product_list];
        }
      })
      .addCase(bulkCreateProducts.rejected, (state, action) => {
        state.bulkCreateStatus = 'failed';
        state.error = action.payload;
      })

      // Update Product
      .addCase(updateProduct.pending, (state) => {
        state.updateStatus = 'loading';
        state.error = null;
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        const index = state.product_list.findIndex(p => p.prod_uuid === action.payload.prod_id);
        if (index !== -1) {
          state.product_list[index] = { ...state.product_list[index], ...action.payload.data };
        }
      })
      .addCase(updateProduct.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload;
      })

      // Delete Product
      .addCase(deleteProduct.pending, (state) => {
        state.deleteStatus = 'loading';
        state.error = null;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded';
        state.product_list = state.product_list.filter(p => p.id !== action.payload);
      })
      .addCase(deleteProduct.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.error = action.payload;
      })

      // Scan Product
      .addCase(scanProduct.pending, (state) => {
        state.scanStatus = 'loading';
        state.error = null;
      })
      .addCase(scanProduct.fulfilled, (state, action) => {
        state.scanStatus = 'succeeded';
        state.scannedProduct = action.payload;
      })
      .addCase(scanProduct.rejected, (state, action) => {
        state.scanStatus = 'failed';
        state.error = action.payload;
      });
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