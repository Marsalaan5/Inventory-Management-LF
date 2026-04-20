


// userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../../../services/axiosInstance'; 

const initialState = {
  userlist_data: [],
  rolesandpermission_data: [],
  deleteaccount_data: [],
  status: 'idle',
  error: null,
};


export const fetchUserList = createAsyncThunk(
  'user/fetchUserList',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/users');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user list');
    }
  }
);


export const fetchRolesAndPermission = createAsyncThunk(
  'user/fetchRolesAndPermission',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/roles-permissions');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch roles and permissions');
    }
  }
);


export const fetchDeleteAccountData = createAsyncThunk(
  'user/fetchDeleteAccountData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axiosInstance.get('/delete-account');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch delete account data');
    }
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserList: (state, action) => {
      state.userlist_data = action.payload;
    },
    setRolesAndPermission: (state, action) => {
      state.rolesandpermission_data = action.payload;
    },
    setDeleteAccountData: (state, action) => {
      state.deleteaccount_data = action.payload;
    },
    clearUserError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // User List
      .addCase(fetchUserList.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUserList.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.userlist_data = action.payload;
        state.error = null;
      })
      .addCase(fetchUserList.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // Roles & Permission
      .addCase(fetchRolesAndPermission.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRolesAndPermission.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.rolesandpermission_data = action.payload;
        state.error = null;
      })
      .addCase(fetchRolesAndPermission.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })
      // Delete Account Data
      .addCase(fetchDeleteAccountData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDeleteAccountData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.deleteaccount_data = action.payload;
        state.error = null;
      })
      .addCase(fetchDeleteAccountData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      });
  },
});

export const {
  setUserList,
  setRolesAndPermission,
  setDeleteAccountData,
  clearUserError,
} = userSlice.actions;

export default userSlice.reducer;