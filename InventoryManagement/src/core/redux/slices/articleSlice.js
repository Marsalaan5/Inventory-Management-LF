import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AuthService from '../../../services/authService';

// Fetch all articles with filters
export const fetchArticles = createAsyncThunk(
  'articles/fetchArticles',
  async (filters = {}, { rejectWithValue }) => {
    try {
       const params = {
        ...filters,
        page: filters.page || 1,
        limit: filters.limit || 10,
      };
      const response = await AuthService.getArticles(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUnfilteredArticles = createAsyncThunk(
  'articles/fetchUnfilteredArticles',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const params = {
        ...filters,
        
        page: filters.page || 1,
        limit: filters.limit || 100,
      };
      const response = await AuthService.getUnfilteredArticles(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


export const fetchArticleById = createAsyncThunk(
  'articles/fetchArticleById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await AuthService.getArticleById(id);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Create new article
export const createArticle = createAsyncThunk(
  'articles/createArticle',
  async (articleData, { rejectWithValue }) => {
    try {
      const response = await AuthService.createArticle(articleData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Update article
export const updateArticle = createAsyncThunk(
  'articles/updateArticle',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await AuthService.updateArticleById(id, data);
      return { id, data: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Delete article
export const deleteArticle = createAsyncThunk(
  'articles/deleteArticle',
  async (id, { rejectWithValue }) => {
    try {
      await AuthService.deleteArticle(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const initialState = {
  article_list: [],
  currentArticle: null,
  filters: {
    search: '',
    category: '',
    brand: '',
    sortBy: 'created_at_desc',
  },
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0,
  },
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
  createStatus: 'idle',
  updateStatus: 'idle',
  deleteStatus: 'idle',
};

const articleSlice = createSlice({
  name: 'articles',
  initialState,
  reducers: {
    setArticleList: (state, action) => {
      state.article_list = action.payload;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
    setCurrentArticle: (state, action) => {
      state.currentArticle = action.payload;
    },
    clearCurrentArticle: (state) => {
      state.currentArticle = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetArticleState: () => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Articles
      .addCase(fetchArticles.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchArticles.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.article_list = action.payload.data || [];
        state.pagination = action.payload.pagination || state.pagination;
        state.error = null;
      })
      .addCase(fetchArticles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error.message;
      })

      // ADD these cases alongside fetchArticles cases in extraReducers:
.addCase(fetchUnfilteredArticles.pending, (state) => {
  state.status = 'loading';
  state.error = null;
})
.addCase(fetchUnfilteredArticles.fulfilled, (state, action) => {
  state.status = 'succeeded';
  state.article_list = Array.isArray(action.payload)
    ? action.payload
    : action.payload.data || action.payload.articles || [];
  state.error = null;
})
.addCase(fetchUnfilteredArticles.rejected, (state, action) => {
  state.status = 'failed';
  state.error = action.payload || action.error.message;
})

      // Fetch Article By ID
      .addCase(fetchArticleById.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchArticleById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.currentArticle = action.payload;
      })
      .addCase(fetchArticleById.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })

      // Create Article
      .addCase(createArticle.pending, (state) => {
        state.createStatus = 'loading';
      })
      .addCase(createArticle.fulfilled, (state, action) => {
        state.createStatus = 'succeeded';
        if (action.payload.data) {
          state.article_list.unshift(action.payload.data);
        }
      })
      .addCase(createArticle.rejected, (state, action) => {
        state.createStatus = 'failed';
        state.error = action.payload;
      })

      // Update Article
      .addCase(updateArticle.pending, (state) => {
        state.updateStatus = 'loading';
      })
      .addCase(updateArticle.fulfilled, (state, action) => {
        state.updateStatus = 'succeeded';
        const index = state.article_list.findIndex(
          (a) => a.id === action.payload.id
        );
        if (index !== -1) {
          state.article_list[index] = {
            ...state.article_list[index],
            ...action.payload.data,
          };
        }
      })
      .addCase(updateArticle.rejected, (state, action) => {
        state.updateStatus = 'failed';
        state.error = action.payload;
      })

      // Delete Article
      .addCase(deleteArticle.pending, (state) => {
        state.deleteStatus = 'loading';
      })
      .addCase(deleteArticle.fulfilled, (state, action) => {
        state.deleteStatus = 'succeeded';
        state.article_list = state.article_list.filter(
          (a) => a.id !== action.payload
        );
      })
      .addCase(deleteArticle.rejected, (state, action) => {
        state.deleteStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  setArticleList,
  setFilters,
  resetFilters,
  setCurrentArticle,
  clearCurrentArticle,
  clearError,
  resetArticleState,
} = articleSlice.actions;

export default articleSlice.reducer;