// utils/exports.js
import axiosInstance from '../services/axiosInstance';
import Swal from 'sweetalert2';

/**
 * Generic PDF export function
 * @param {string} endpoint - API endpoint for PDF export (e.g., '/auth/export/products/pdf')
 * @param {string} filename - Download filename
 * @param {object} filters - Optional filters to pass as query params
 */
export async function exportPDF(endpoint, filename = 'report.pdf', filters = {}) {
  try {
    // Show loading message
    Swal.fire({
      title: 'Exporting PDF...',
      text: 'Please wait while we generate your PDF',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Clean filters - remove empty values
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Make API call with axiosInstance
    const response = await axiosInstance.get(endpoint, {
      params: cleanFilters,
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'PDF exported successfully',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (err) {
    console.error('PDF export failed:', err);
    Swal.fire({
      icon: 'error',
      title: 'Export Failed',
      text: err.response?.data?.message || 'Failed to export PDF',
      timer: 3000
    });
  }
}

/**
 * Generic Excel export function
 * @param {string} endpoint - API endpoint for Excel export (e.g., '/auth/export/products/excel')
 * @param {string} filename - Download filename
 * @param {object} filters - Optional filters to pass as query params
 */
export async function exportExcel(endpoint, filename = 'report.xlsx', filters = {}) {
  try {
    // Show loading message
    Swal.fire({
      title: 'Exporting Excel...',
      text: 'Please wait while we generate your Excel file',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Clean filters - remove empty values
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    // Make API call with axiosInstance
    const response = await axiosInstance.get(endpoint, {
      params: cleanFilters,
      responseType: 'blob',
    });

    // Create download link
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    // Show success message
    Swal.fire({
      icon: 'success',
      title: 'Success!',
      text: 'Excel file exported successfully',
      timer: 2000,
      showConfirmButton: false
    });
  } catch (err) {
    console.error('Excel export failed:', err);
    Swal.fire({
      icon: 'error',
      title: 'Export Failed',
      text: err.response?.data?.message || 'Failed to export Excel file',
      timer: 3000
    });
  }
}

/**
 * Refresh data function
 * @param {Function} fetchFunction - Function to call for refreshing data
 */
export async function refreshData(fetchFunction) {
  try {
    Swal.fire({
      title: 'Refreshing...',
      text: 'Please wait',
      timer: 1000,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    await fetchFunction();

    Swal.fire({
      icon: 'success',
      title: 'Refreshed!',
      timer: 1000,
      showConfirmButton: false
    });
  } catch (err) {
    console.error('Refresh failed:', err);
    Swal.fire({
      icon: 'error',
      title: 'Refresh Failed',
      text: 'Failed to refresh data',
      timer: 2000
    });
  }
}

/**
 * Toggle header visibility
 * @param {Function} dispatch - Redux dispatch function
 * @param {boolean} currentState - Current header state
 * @param {Function} actionCreator - Redux action creator
 */
export function toggleHeader(dispatch, currentState, actionCreator) {
  dispatch(actionCreator(!currentState));
}

/**
 * Print function (optional - if you want to add print functionality)
 */
export function printData() {
  window.print();
}