import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AuthService from "../../../services/authService";


export const fetchWarehouses = createAsyncThunk(
  "warehouse/fetchWarehouses",
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await AuthService.getWarehouse(params);
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch warehouses"
      );
    }
  }
);

export const fetchWarehouseById = createAsyncThunk(
  "warehouse/fetchWarehouseById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await AuthService.getWarehouseById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch warehouse"
      );
    }
  }
);

export const createWarehouse = createAsyncThunk(
  "warehouse/createWarehouse",
  async (warehouseData, { rejectWithValue }) => {
    try {
      await AuthService.createWarehouse(warehouseData);
    
      const response = await AuthService.getWarehouse();
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to create warehouse"
      );
    }
  }
);

export const updateWarehouseById = createAsyncThunk(
  "warehouse/updateWarehouse",
  async ({ id, warehouseData }, { rejectWithValue }) => {
    try {
      await AuthService.updateWarehouseById(id, warehouseData);
    
      const response = await AuthService.getWarehouse();
      return response.data.data || [];
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update warehouse"
      );
    }
  }
);

export const deleteWarehouse = createAsyncThunk(
  "warehouse/deleteWarehouse",
  async (id, { rejectWithValue }) => {
    try {
      await AuthService.deleteWarehouse(id);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete warehouse"
      );
    }
  }
);

const initialState = {
  warehouses: [],
  selectedWarehouse: null,
  currentWarehouse: null, 
  loading: false,
  error: null,
  searchTerm: "",
  sortBy: null,
};

const warehouseSlice = createSlice({
  name: "warehouse",
  initialState,
  reducers: {
    setSelectedWarehouse: (state, action) => {
      state.selectedWarehouse = action.payload;
      if (action.payload) {
        localStorage.setItem(
          "selectedWarehouse",
          JSON.stringify(action.payload)
        );
      } else {
        localStorage.removeItem("selectedWarehouse");
      }
    },
    clearSelectedWarehouse: (state) => {
      state.selectedWarehouse = null;
      localStorage.removeItem("selectedWarehouse");
    },
    initializeWarehouse: (state) => {
      const savedWarehouse = localStorage.getItem("selectedWarehouse");
      if (savedWarehouse) {
        try {
          state.selectedWarehouse = JSON.parse(savedWarehouse);
        } catch (error) {
          console.error("Error parsing warehouse data:", error);
          state.selectedWarehouse = null;
        }
      }
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    setSortBy: (state, action) => {
      state.sortBy = action.payload;
    },
    clearCurrentWarehouse: (state) => {
      state.currentWarehouse = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
    
      .addCase(fetchWarehouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouses.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload;

        if (!state.selectedWarehouse && action.payload.length > 0) {
          state.selectedWarehouse = action.payload[0];
          localStorage.setItem(
            "selectedWarehouse",
            JSON.stringify(action.payload[0])
          );
        }
      })
      .addCase(fetchWarehouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    
      .addCase(fetchWarehouseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWarehouseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentWarehouse = action.payload;
      })
      .addCase(fetchWarehouseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      
      .addCase(createWarehouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createWarehouse.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload;
      })
      .addCase(createWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

     
      .addCase(updateWarehouseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWarehouseById.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = action.payload;
        state.currentWarehouse = null;


        if (state.selectedWarehouse) {
          const updated = action.payload.find(
            (w) => w.id === state.selectedWarehouse.id
          );
          if (updated) {
            state.selectedWarehouse = updated;
            localStorage.setItem("selectedWarehouse", JSON.stringify(updated));
          }
        }
      })
      .addCase(updateWarehouseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      
      .addCase(deleteWarehouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWarehouse.fulfilled, (state, action) => {
        state.loading = false;
        state.warehouses = state.warehouses.filter(
          (w) => w.id !== action.payload
        );

        
        if (state.selectedWarehouse?.id === action.payload) {
          state.selectedWarehouse =
            state.warehouses.length > 0 ? state.warehouses[0] : null;
          if (state.selectedWarehouse) {
            localStorage.setItem(
              "selectedWarehouse",
              JSON.stringify(state.selectedWarehouse)
            );
          } else {
            localStorage.removeItem("selectedWarehouse");
          }
        }
      })
      .addCase(deleteWarehouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  setSelectedWarehouse,
  clearSelectedWarehouse,
  initializeWarehouse,
  setSearchTerm,
  setSortBy,
  clearCurrentWarehouse,
  clearError,
} = warehouseSlice.actions;

export default warehouseSlice.reducer;
