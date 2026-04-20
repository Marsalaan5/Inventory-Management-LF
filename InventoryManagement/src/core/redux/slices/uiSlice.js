



import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunk to fetch UI settings from backend API
export const fetchUISettings = createAsyncThunk(
  'ui/fetchUISettings',
  async () => {
    const response = await fetch('/api/ui-settings'); // Your backend endpoint
    if (!response.ok) throw new Error('Failed to fetch UI settings');
    return await response.json(); // Expected to return something like { toggle_header: true, layoutstyledata: "dark" }
  }
);

const initialState = {
  toggle_header: false,
  layoutstyledata: '',  // default empty, or you can use localStorage fallback here too
  status: 'idle',
  error: null,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setToggleHeader: (state, action) => {
      state.toggle_header = action.payload;
    },
    setLayoutStyleData: (state, action) => {
      state.layoutstyledata = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUISettings.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchUISettings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.toggle_header = action.payload.toggle_header;
        state.layoutstyledata = action.payload.layoutstyledata;
        // Optional: also save to localStorage
        localStorage.setItem('layoutStyling', action.payload.layoutstyledata);
      })
      .addCase(fetchUISettings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { setToggleHeader, setLayoutStyleData } = uiSlice.actions;
export default uiSlice.reducer;
