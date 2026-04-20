

//To Do 


import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Async thunks to fetch HR data from backend API endpoints

export const fetchDepartmentList = createAsyncThunk(
  'hr/fetchDepartmentList',
  async () => {
    const response = await fetch('/api/hr/departments');
    if (!response.ok) throw new Error('Failed to fetch departments');
    return await response.json();
  }
);

export const fetchDesignationData = createAsyncThunk(
  'hr/fetchDesignationData',
  async () => {
    const response = await fetch('/api/hr/designations');
    if (!response.ok) throw new Error('Failed to fetch designations');
    return await response.json();
  }
);

export const fetchShiftList = createAsyncThunk(
  'hr/fetchShiftList',
  async () => {
    const response = await fetch('/api/hr/shifts');
    if (!response.ok) throw new Error('Failed to fetch shifts');
    return await response.json();
  }
);

export const fetchEmployeeAttendance = createAsyncThunk(
  'hr/fetchEmployeeAttendance',
  async () => {
    const response = await fetch('/api/hr/employee-attendance');
    if (!response.ok) throw new Error('Failed to fetch employee attendance');
    return await response.json();
  }
);

export const fetchAdminAttendance = createAsyncThunk(
  'hr/fetchAdminAttendance',
  async () => {
    const response = await fetch('/api/hr/admin-attendance');
    if (!response.ok) throw new Error('Failed to fetch admin attendance');
    return await response.json();
  }
);

export const fetchAdminLeaves = createAsyncThunk(
  'hr/fetchAdminLeaves',
  async () => {
    const response = await fetch('/api/hr/admin-leaves');
    if (!response.ok) throw new Error('Failed to fetch admin leaves');
    return await response.json();
  }
);

export const fetchLeaveTypes = createAsyncThunk(
  'hr/fetchLeaveTypes',
  async () => {
    const response = await fetch('/api/hr/leave-types');
    if (!response.ok) throw new Error('Failed to fetch leave types');
    return await response.json();
  }
);

export const fetchHolidayData = createAsyncThunk(
  'hr/fetchHolidayData',
  async () => {
    const response = await fetch('/api/hr/holidays');
    if (!response.ok) throw new Error('Failed to fetch holidays');
    return await response.json();
  }
);

// Initial state with separate status and error for each data slice
const initialState = {
  departmentlist_data: [],
  designation_data: [],
  shiftlist_data: [],
  attendenceemployee_data: [],
  attendanceadmin_data: [],
  leavesadmin_data: [],
  leavetypes_data: [],
  holiday_data: [],

  department_status: 'idle',
  designation_status: 'idle',
  shiftlist_status: 'idle',
  attendanceemployee_status: 'idle',
  attendanceadmin_status: 'idle',
  leavesadmin_status: 'idle',
  leavetypes_status: 'idle',
  holiday_status: 'idle',

  department_error: null,
  designation_error: null,
  shiftlist_error: null,
  attendanceemployee_error: null,
  attendanceadmin_error: null,
  leavesadmin_error: null,
  leavetypes_error: null,
  holiday_error: null,
};

const hrSlice = createSlice({
  name: 'hr',
  initialState,
  reducers: {
    // Optionally add reducers to set data manually if needed
    setDepartmentList: (state, action) => {
      state.departmentlist_data = action.payload;
    },
    setDesignationData: (state, action) => {
      state.designation_data = action.payload;
    },
    setShiftList: (state, action) => {
      state.shiftlist_data = action.payload;
    },
    setEmployeeAttendance: (state, action) => {
      state.attendenceemployee_data = action.payload;
    },
    setAdminAttendance: (state, action) => {
      state.attendanceadmin_data = action.payload;
    },
    setAdminLeaves: (state, action) => {
      state.leavesadmin_data = action.payload;
    },
    setLeaveTypes: (state, action) => {
      state.leavetypes_data = action.payload;
    },
    setHolidayData: (state, action) => {
      state.holiday_data = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Department list
      .addCase(fetchDepartmentList.pending, (state) => {
        state.department_status = 'loading';
        state.department_error = null;
      })
      .addCase(fetchDepartmentList.fulfilled, (state, action) => {
        state.department_status = 'succeeded';
        state.departmentlist_data = action.payload;
      })
      .addCase(fetchDepartmentList.rejected, (state, action) => {
        state.department_status = 'failed';
        state.department_error = action.error.message;
      })
      // Designation data
      .addCase(fetchDesignationData.pending, (state) => {
        state.designation_status = 'loading';
        state.designation_error = null;
      })
      .addCase(fetchDesignationData.fulfilled, (state, action) => {
        state.designation_status = 'succeeded';
        state.designation_data = action.payload;
      })
      .addCase(fetchDesignationData.rejected, (state, action) => {
        state.designation_status = 'failed';
        state.designation_error = action.error.message;
      })
      // Shift list
      .addCase(fetchShiftList.pending, (state) => {
        state.shiftlist_status = 'loading';
        state.shiftlist_error = null;
      })
      .addCase(fetchShiftList.fulfilled, (state, action) => {
        state.shiftlist_status = 'succeeded';
        state.shiftlist_data = action.payload;
      })
      .addCase(fetchShiftList.rejected, (state, action) => {
        state.shiftlist_status = 'failed';
        state.shiftlist_error = action.error.message;
      })
      // Employee attendance
      .addCase(fetchEmployeeAttendance.pending, (state) => {
        state.attendanceemployee_status = 'loading';
        state.attendanceemployee_error = null;
      })
      .addCase(fetchEmployeeAttendance.fulfilled, (state, action) => {
        state.attendanceemployee_status = 'succeeded';
        state.attendenceemployee_data = action.payload;
      })
      .addCase(fetchEmployeeAttendance.rejected, (state, action) => {
        state.attendanceemployee_status = 'failed';
        state.attendanceemployee_error = action.error.message;
      })
      // Admin attendance
      .addCase(fetchAdminAttendance.pending, (state) => {
        state.attendanceadmin_status = 'loading';
        state.attendanceadmin_error = null;
      })
      .addCase(fetchAdminAttendance.fulfilled, (state, action) => {
        state.attendanceadmin_status = 'succeeded';
        state.attendanceadmin_data = action.payload;
      })
      .addCase(fetchAdminAttendance.rejected, (state, action) => {
        state.attendanceadmin_status = 'failed';
        state.attendanceadmin_error = action.error.message;
      })
      // Admin leaves
      .addCase(fetchAdminLeaves.pending, (state) => {
        state.leavesadmin_status = 'loading';
        state.leavesadmin_error = null;
      })
      .addCase(fetchAdminLeaves.fulfilled, (state, action) => {
        state.leavesadmin_status = 'succeeded';
        state.leavesadmin_data = action.payload;
      })
      .addCase(fetchAdminLeaves.rejected, (state, action) => {
        state.leavesadmin_status = 'failed';
        state.leavesadmin_error = action.error.message;
      })
      // Leave types
      .addCase(fetchLeaveTypes.pending, (state) => {
        state.leavetypes_status = 'loading';
        state.leavetypes_error = null;
      })
      .addCase(fetchLeaveTypes.fulfilled, (state, action) => {
        state.leavetypes_status = 'succeeded';
        state.leavetypes_data = action.payload;
      })
      .addCase(fetchLeaveTypes.rejected, (state, action) => {
        state.leavetypes_status = 'failed';
        state.leavetypes_error = action.error.message;
      })
      // Holiday data
      .addCase(fetchHolidayData.pending, (state) => {
        state.holiday_status = 'loading';
        state.holiday_error = null;
      })
      .addCase(fetchHolidayData.fulfilled, (state, action) => {
        state.holiday_status = 'succeeded';
        state.holiday_data = action.payload;
      })
      .addCase(fetchHolidayData.rejected, (state, action) => {
        state.holiday_status = 'failed';
        state.holiday_error = action.error.message;
      });
  },
});

export const {
  setDepartmentList,
  setDesignationData,
  setShiftList,
  setEmployeeAttendance,
  setAdminAttendance,
  setAdminLeaves,
  setLeaveTypes,
  setHolidayData,
} = hrSlice.actions;

export default hrSlice.reducer;
