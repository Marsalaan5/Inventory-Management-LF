// utils/exports.js
import axiosInstance from '../services/axiosInstance';
import Swal from 'sweetalert2';


export async function exportPDF(endpoint, filename = 'report.pdf', filters = {}) {
  try {

    Swal.fire({
      title: 'Exporting PDF...',
      text: 'Please wait while we generate your PDF',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

 
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

  
    const response = await axiosInstance.get(endpoint, {
      params: cleanFilters,
      responseType: 'blob',
    });


    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);


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


export async function exportExcel(endpoint, filename = 'report.xlsx', filters = {}) {
  try {
  
    Swal.fire({
      title: 'Exporting Excel...',
      text: 'Please wait while we generate your Excel file',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

   
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});


    const response = await axiosInstance.get(endpoint, {
      params: cleanFilters,
      responseType: 'blob',
    });


    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);


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


export function toggleHeader(dispatch, currentState, actionCreator) {
  dispatch(actionCreator(!currentState));
}

export function printData() {
  window.print();
}