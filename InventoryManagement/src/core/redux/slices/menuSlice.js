



import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from '../../../services/authService';


export const fetchMenu = createAsyncThunk(
  'menu/fetchMenu',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.getMenu();
      console.log(' Sidebar menu fetched (active only):', response.data);
      return response.data;
    } catch (error) {
      console.error(' Error fetching sidebar menu:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch menu');
    }
  }
);


export const fetchAllMenuItems = createAsyncThunk(
  'menu/fetchAllMenuItems',
  async (_, { rejectWithValue }) => {
    try {
      const response = await AuthService.getAllMenuItems();
      console.log(' All menu items fetched (including inactive):', response.data);
      return response.data;
    } catch (error) {
      console.error(' Error fetching all menu items:', error);
      return rejectWithValue(error.response?.data || 'Failed to fetch all menu items');
    }
  }
);

const menuSlice = createSlice({
  name: 'menu',
  initialState: {
    items: [],
    allItems: [],
    loading: false,
    allItemsLoading: false,
    error: null,
  },
  reducers: {
    clearMenu: (state) => {
      state.items = [];
      state.allItems = [];
    },
  },
  extraReducers: (builder) => {
    builder
  
      .addCase(fetchMenu.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenu.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchMenu.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      
  
      .addCase(fetchAllMenuItems.pending, (state) => {
        state.allItemsLoading = true;
        state.error = null;
      })
      .addCase(fetchAllMenuItems.fulfilled, (state, action) => {
        state.allItemsLoading = false;
        state.allItems = action.payload;
      })
      .addCase(fetchAllMenuItems.rejected, (state, action) => {
        state.allItemsLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearMenu } = menuSlice.actions;
export default menuSlice.reducer;
