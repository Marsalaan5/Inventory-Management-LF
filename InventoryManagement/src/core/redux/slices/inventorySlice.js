


//TO DO from ALpi 

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks to fetch inventory data from backend APIs

export const fetchUnits = createAsyncThunk(
  'inventory/fetchUnits',
  async () => {
    const response = await fetch('/api/inventory/units');
    if (!response.ok) throw new Error('Failed to fetch units');
    return await response.json();
  }
);

export const fetchVariantAttributes = createAsyncThunk(
  'inventory/fetchVariantAttributes',
  async () => {
    const response = await fetch('/api/inventory/variant-attributes');
    if (!response.ok) throw new Error('Failed to fetch variant attributes');
    return await response.json();
  }
);

export const fetchWarrantyData = createAsyncThunk(
  'inventory/fetchWarrantyData',
  async () => {
    const response = await fetch('/api/inventory/warranty');
    if (!response.ok) throw new Error('Failed to fetch warranty data');
    return await response.json();
  }
);

export const fetchBarcodeData = createAsyncThunk(
  'inventory/fetchBarcodeData',
  async () => {
    const response = await fetch('/api/inventory/barcodes');
    if (!response.ok) throw new Error('Failed to fetch barcode data');
    return await response.json();
  }
);

export const fetchLowStockData = createAsyncThunk(
  'inventory/fetchLowStockData',
  async () => {
    const response = await fetch('/api/inventory/low-stock');
    if (!response.ok) throw new Error('Failed to fetch low stock data');
    return await response.json();
  }
);

export const fetchExpiredProductData = createAsyncThunk(
  'inventory/fetchExpiredProductData',
  async () => {
    const response = await fetch('/api/inventory/expired-products');
    if (!response.ok) throw new Error('Failed to fetch expired product data');
    return await response.json();
  }
);

export const fetchCategoryList = createAsyncThunk(
  'inventory/fetchCategoryList',
  async () => {
    const response = await fetch('/api/inventory/categories');
    if (!response.ok) throw new Error('Failed to fetch category list');
    return await response.json();
  }
);

export const fetchSubcategoryData = createAsyncThunk(
  'inventory/fetchSubcategoryData',
  async () => {
    const response = await fetch('/api/inventory/subcategories');
    if (!response.ok) throw new Error('Failed to fetch subcategory data');
    return await response.json();
  }
);

export const fetchManageStockData = createAsyncThunk(
  'inventory/fetchManageStockData',
  async () => {
    const response = await fetch('/api/inventory/manage-stocks');
    if (!response.ok) throw new Error('Failed to fetch manage stock data');
    return await response.json();
  }
);

export const fetchStockTransferData = createAsyncThunk(
  'inventory/fetchStockTransferData',
  async () => {
    const response = await fetch('/api/inventory/stock-transfers');
    if (!response.ok) throw new Error('Failed to fetch stock transfer data');
    return await response.json();
  }
);

// Initial state with data, status, and error for each piece
const initialState = {
  unit_data: [],
  variantattributes_data: [],
  warranty_data: [],
  barcode_data: [],
  lowstock_data: [],
  expiredproduct_data: [],
  categotylist_data: [],
  subcategory_data: [],
  managestockdata: [],
  stocktransferdata: [],

  unit_status: 'idle',
  variantattributes_status: 'idle',
  warranty_status: 'idle',
  barcode_status: 'idle',
  lowstock_status: 'idle',
  expiredproduct_status: 'idle',
  categotylist_status: 'idle',
  subcategory_status: 'idle',
  managestock_status: 'idle',
  stocktransfer_status: 'idle',

  unit_error: null,
  variantattributes_error: null,
  warranty_error: null,
  barcode_error: null,
  lowstock_error: null,
  expiredproduct_error: null,
  categotylist_error: null,
  subcategory_error: null,
  managestock_error: null,
  stocktransfer_error: null,
};

const inventorySlice = createSlice({
  name: 'inventory',
  initialState,
  reducers: {
    setUnits: (state, action) => {
      state.unit_data = action.payload;
    },
    setVariantAttributes: (state, action) => {
      state.variantattributes_data = action.payload;
    },
    setWarrantyData: (state, action) => {
      state.warranty_data = action.payload;
    },
    setBarcodeData: (state, action) => {
      state.barcode_data = action.payload;
    },
    setLowStockData: (state, action) => {
      state.lowstock_data = action.payload;
    },
    setExpiredProductData: (state, action) => {
      state.expiredproduct_data = action.payload;
    },
    setCategoryList: (state, action) => {
      state.categotylist_data = action.payload;
    },
    setSubcategoryData: (state, action) => {
      state.subcategory_data = action.payload;
    },
    setManageStockData: (state, action) => {
      state.managestockdata = action.payload;
    },
    setStockTransferData: (state, action) => {
      state.stocktransferdata = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Units
      .addCase(fetchUnits.pending, (state) => {
        state.unit_status = 'loading';
        state.unit_error = null;
      })
      .addCase(fetchUnits.fulfilled, (state, action) => {
        state.unit_status = 'succeeded';
        state.unit_data = action.payload;
      })
      .addCase(fetchUnits.rejected, (state, action) => {
        state.unit_status = 'failed';
        state.unit_error = action.error.message;
      })
      // Variant Attributes
      .addCase(fetchVariantAttributes.pending, (state) => {
        state.variantattributes_status = 'loading';
        state.variantattributes_error = null;
      })
      .addCase(fetchVariantAttributes.fulfilled, (state, action) => {
        state.variantattributes_status = 'succeeded';
        state.variantattributes_data = action.payload;
      })
      .addCase(fetchVariantAttributes.rejected, (state, action) => {
        state.variantattributes_status = 'failed';
        state.variantattributes_error = action.error.message;
      })
      // Warranty Data
      .addCase(fetchWarrantyData.pending, (state) => {
        state.warranty_status = 'loading';
        state.warranty_error = null;
      })
      .addCase(fetchWarrantyData.fulfilled, (state, action) => {
        state.warranty_status = 'succeeded';
        state.warranty_data = action.payload;
      })
      .addCase(fetchWarrantyData.rejected, (state, action) => {
        state.warranty_status = 'failed';
        state.warranty_error = action.error.message;
      })
      // Barcode Data
      .addCase(fetchBarcodeData.pending, (state) => {
        state.barcode_status = 'loading';
        state.barcode_error = null;
      })
      .addCase(fetchBarcodeData.fulfilled, (state, action) => {
        state.barcode_status = 'succeeded';
        state.barcode_data = action.payload;
      })
      .addCase(fetchBarcodeData.rejected, (state, action) => {
        state.barcode_status = 'failed';
        state.barcode_error = action.error.message;
      })
      // Low Stock Data
      .addCase(fetchLowStockData.pending, (state) => {
        state.lowstock_status = 'loading';
        state.lowstock_error = null;
      })
      .addCase(fetchLowStockData.fulfilled, (state, action) => {
        state.lowstock_status = 'succeeded';
        state.lowstock_data = action.payload;
      })
      .addCase(fetchLowStockData.rejected, (state, action) => {
        state.lowstock_status = 'failed';
        state.lowstock_error = action.error.message;
      })
      // Expired Product Data
      .addCase(fetchExpiredProductData.pending, (state) => {
        state.expiredproduct_status = 'loading';
        state.expiredproduct_error = null;
      })
      .addCase(fetchExpiredProductData.fulfilled, (state, action) => {
        state.expiredproduct_status = 'succeeded';
        state.expiredproduct_data = action.payload;
      })
      .addCase(fetchExpiredProductData.rejected, (state, action) => {
        state.expiredproduct_status = 'failed';
        state.expiredproduct_error = action.error.message;
      })
      // Category List
      .addCase(fetchCategoryList.pending, (state) => {
        state.categotylist_status = 'loading';
        state.categotylist_error = null;
      })
      .addCase(fetchCategoryList.fulfilled, (state, action) => {
        state.categotylist_status = 'succeeded';
        state.categotylist_data = action.payload;
      })
      .addCase(fetchCategoryList.rejected, (state, action) => {
        state.categotylist_status = 'failed';
        state.categotylist_error = action.error.message;
      })
      // Subcategory Data
      .addCase(fetchSubcategoryData.pending, (state) => {
        state.subcategory_status = 'loading';
        state.subcategory_error = null;
      })
      .addCase(fetchSubcategoryData.fulfilled, (state, action) => {
        state.subcategory_status = 'succeeded';
        state.subcategory_data = action.payload;
      })
      .addCase(fetchSubcategoryData.rejected, (state, action) => {
        state.subcategory_status = 'failed';
        state.subcategory_error = action.error.message;
      })
      // Manage Stock Data
      .addCase(fetchManageStockData.pending, (state) => {
        state.managestock_status = 'loading';
        state.managestock_error = null;
      })
      .addCase(fetchManageStockData.fulfilled, (state, action) => {
        state.managestock_status = 'succeeded';
        state.managestockdata = action.payload;
      })
      .addCase(fetchManageStockData.rejected, (state, action) => {
        state.managestock_status = 'failed';
        state.managestock_error = action.error.message;
      })
      // Stock Transfer Data
      .addCase(fetchStockTransferData.pending, (state) => {
        state.stocktransfer_status = 'loading';
        state.stocktransfer_error = null;
      })
      .addCase(fetchStockTransferData.fulfilled, (state, action) => {
        state.stocktransfer_status = 'succeeded';
        state.stocktransferdata = action.payload;
      })
      .addCase(fetchStockTransferData.rejected, (state, action) => {
        state.stocktransfer_status = 'failed';
        state.stocktransfer_error = action.error.message;
      });
  },
});

export const {
  setUnits,
  setVariantAttributes,
  setWarrantyData,
  setBarcodeData,
  setLowStockData,
  setExpiredProductData,
  setCategoryList,
  setSubcategoryData,
  setManageStockData,
  setStockTransferData,
} = inventorySlice.actions;

export default inventorySlice.reducer;
