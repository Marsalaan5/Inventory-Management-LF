

import React, { useState, useEffect } from "react";
import { Modal } from "react-bootstrap";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import * as XLSX from "xlsx";
import {
  Upload,
  Download,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  Loader,
} from "feather-icons-react/build/IconComponents";
import { useDispatch, useSelector } from "react-redux";
import { bulkCreateProducts } from "../../core/redux/slices/productSlice";
import AuthService from "../../services/authService";
import PropTypes from "prop-types";

const BulkUploadProduct = ({ show, onHide, onSuccess }) => {
  const dispatch = useDispatch();
  const MySwal = withReactContent(Swal);
  const { user } = useSelector((state) => state.auth);

  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [validationResults, setValidationResults] = useState(null);
  const [parsedData, setParsedData] = useState([]);
  const [articleProfiles, setArticleProfiles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);

  useEffect(() => {
    if (show) {
      fetchFilterOptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  const fetchFilterOptions = async () => {
    try {
      const [warehousesRes, articleProfilesRes] = await Promise.all([
        AuthService.getWarehouse(),
        AuthService.getArticles(),
      ]);

      setWarehouses(warehousesRes.data.data || []);
      setArticleProfiles(articleProfilesRes.data.data || []);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        "Product Name": "Axioma Meter 01",
        "Article Profile Name": "Axioma Water Meter Q W1 B-Design",
        "Warehouse Name": "Main Warehouse",
        "Site Location (Optional)": "Greater Noida Site",
        "In WH Location (Optional)": "Rack !",
        "Quantity": 1,
        "Description (Optional)": "Sample product description",
        "Status": "new",
      },
      {
        "Product Name": "Led Driver 01",
        "Article Profile Name": "StreetLight",
        "Warehouse Name": "Moradabad Warehouse",
        "Site Location (Optional)": "Moradabad Site",
        "In WH Location (Optional)": "1st Floor, Rack-2",
        "Quantity": 1,
        "Description (Optional)": "Sample product description",
        "Status": "used",
      },
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    

    ws['!cols'] = [
        { wch: 25 }, // Product Name
        { wch: 40 }, // Article Profile
        { wch: 40 }, // Warehouse
        { wch: 20 }, // Site Location
        { wch: 20 }, // In WH Location
        { wch: 10 }, // Quantity
        { wch: 40 }, // Description
        { wch: 15 }, // Status
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Product Template");


    const instructions = [
        { Field: "Product Name ", Description: "Product title ", Example: "Axioma Water Meter" },
        { Field: "Article Profile Name", Description: "REQUIRED - Must match existing Article Profile exactly", Example: "Axioma Water Meter Q W1 B-Design" },
        { Field: "Warehouse Name", Description: "REQUIRED (except for 'installed' status) - Must match existing Warehouse exactly", Example: "Main Warehouse" },
        { Field: "Site Location (Optional)", Description: "REQUIRED for 'installed' status - Installation location", Example: "Moradabad Site" },
        { Field: "In WH Location (Optional)", Description: "Specific location within warehouse", Example: "1st Floor,Rack 2" },
        { Field: "Quantity", Description: "should be 1 only", Example: "1" },
        { Field: "Description (Optional)", Description: "Additional product details (max 500 characters)", Example: "Any" },
        { Field: "Status", Description: "Product status - options: new, used, repaired, broken, installed", Example: "new" },
    ];

    const wsInstructions = XLSX.utils.json_to_sheet(instructions);
    wsInstructions['!cols'] = [
      { wch: 30 },
      { wch: 60 },
      { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(wb, wsInstructions, "Instructions");

    XLSX.writeFile(wb, "Product_Bulk_Upload_Template.xlsx");

    MySwal.fire({
      icon: "success",
      title: "Template Downloaded",
      text: "Fill in the template and upload it back",
      timer: 2000,
      showConfirmButton: false,
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (
        !selectedFile.name.endsWith(".xlsx") &&
        !selectedFile.name.endsWith(".xls")
      ) {
        MySwal.fire({
          icon: "error",
          title: "Invalid File",
          text: "Please upload an Excel file (.xlsx or .xls)",
          timer: 2000,
        });
        return;
      }
      setFile(selectedFile);
      setValidationResults(null);
      setParsedData([]);
    }
  };

  const parseExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: "array" });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const json = XLSX.utils.sheet_to_json(worksheet);
          resolve(json);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  };

  const validateRow = (row) => {
    const errors = [];
    const warnings = [];

    // Validate Article Profile
    if (!row["Article Profile Name"] || row["Article Profile Name"].trim() === "") {
      errors.push("Article Profile Name is required");
    } else {
      const articleProfile = articleProfiles.find(
        (ap) =>
          (ap.name || ap.title).toLowerCase() ===
          row["Article Profile Name"].trim().toLowerCase()
      );
      if (!articleProfile) {
        errors.push(
          `Article Profile "${row["Article Profile Name"]}" not found`
        );
      }
    }

    // Validate Warehouse (required unless status is 'installed')
    const status = (row["Status"] || "new").toLowerCase().trim();
    if (status !== "installed") {
      if (!row["Warehouse Name"] || row["Warehouse Name"].trim() === "") {
        errors.push("Warehouse Name is required (except for 'installed' status)");
      } else {
        const warehouse = warehouses.find(
          (wh) =>
            (wh.name || wh.title).toLowerCase() ===
            row["Warehouse Name"].trim().toLowerCase()
        );
        if (!warehouse) {
          errors.push(`Warehouse "${row["Warehouse Name"]}" not found`);
        }
      }
    }

    // Validate Quantity
    const quantity = parseInt(row["Quantity"]);
    if (isNaN(quantity) || quantity < 0) {
      errors.push("Quantity must be a positive number");
    }

    // Validate Status
    const validStatuses = ["new", "used", "repaired", "broken", "installed"];
    if (!validStatuses.includes(status)) {
      errors.push(
        `Invalid status "${row["Status"]}". Must be one of: ${validStatuses.join(", ")}`
      );
    }

    // Warnings for optional fields
    if (!row["Product Name"] || row["Product Name"].trim() === "") {
      warnings.push("Product name is empty - will use Article Profile name");
    }

    return { errors, warnings };
  };

  const validateAndParseData = async () => {
    if (!file) {
      MySwal.fire({
        icon: "warning",
        title: "No File Selected",
        text: "Please select an Excel file to upload",
        timer: 2000,
      });
      return;
    }

    setUploading(true);

    try {
      const jsonData = await parseExcelFile(file);

      if (jsonData.length === 0) {
        MySwal.fire({
          icon: "error",
          title: "Empty File",
          text: "The Excel file contains no data",
          timer: 2000,
        });
        setUploading(false);
        return;
      }

      const results = {
        total: jsonData.length,
        valid: 0,
        invalid: 0,
        rows: [],
      };

      const validRows = [];

      jsonData.forEach((row, index) => {
        const { errors, warnings } = validateRow(row);

        const rowResult = {
          rowNumber: index + 2, // +2 because Excel starts at 1 and has header
          data: row,
          errors,
          warnings,
          isValid: errors.length === 0,
        };

        results.rows.push(rowResult);

        if (rowResult.isValid) {
          results.valid++;
          
          // Find matching article profile and warehouse
          const articleProfile = articleProfiles.find(
            (ap) =>
              (ap.name || ap.title).toLowerCase() ===
              row["Article Profile Name"].trim().toLowerCase()
          );

          let warehouse = null;
          const status = (row["Status"] || "new").toLowerCase().trim();
          if (status !== "installed") {
            warehouse = warehouses.find(
              (wh) =>
                (wh.name || wh.title).toLowerCase() ===
                row["Warehouse Name"].trim().toLowerCase()
            );
          }


         validRows.push({
              article_profile_id: articleProfile.uuid || articleProfile.art_prof_uuid,
              warehouse_id: warehouse ? (warehouse.id || warehouse.id) : undefined,
              count: parseInt(row["Quantity"]) || 0,
              status: status,
            title: row["Product Name"]?.trim() || undefined,
            location: row["Location (Optional)"]?.trim() || undefined,
            in_wh_location: row["In WH Location (Optional)"]?.trim() || undefined,
            description: row["Description (Optional)"]?.trim() || undefined,
            last_updated_by: user?.id || "System",
          });
        } else {
          results.invalid++;
        }
      });

      setValidationResults(results);
      setParsedData(validRows);
      setUploading(false);

      if (results.invalid > 0) {
        MySwal.fire({
          icon: "warning",
          title: "Validation Completed",
          html: `
            <div class="text-start">
              <p><strong>Total Rows:</strong> ${results.total}</p>
              <p class="text-success"><strong>Valid:</strong> ${results.valid}</p>
              <p class="text-danger"><strong>Invalid:</strong> ${results.invalid}</p>
              <hr>
              <p class="text-muted">Review the errors below and fix them in your Excel file.</p>
            </div>
          `,
        });
      } else {
        MySwal.fire({
          icon: "success",
          title: "Validation Successful",
          text: `All ${results.total} rows are valid and ready to upload`,
          timer: 2000,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      console.error("Error parsing file:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Failed to parse Excel file. Please check the file format.",
        timer: 3000,
      });
      setUploading(false);
    }
  };

  const handleBulkUpload = async () => {
    if (parsedData.length === 0) {
      MySwal.fire({
        icon: "warning",
        title: "No Valid Data",
        text: "Please validate your file first",
        timer: 2000,
      });
      return;
    }

    const result = await MySwal.fire({
      icon: "question",
      title: "Confirm Upload",
      html: `
        <div class="text-start">
          <p>You are about to upload <strong>${parsedData.length}</strong> products.</p>
          <p class="text-muted">This action cannot be undone. Continue?</p>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: "Yes, Upload",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
    });

    if (!result.isConfirmed) return;

    setUploading(true);

    try {
      console.log('Uploading products:', parsedData.length);
      console.log('Sample product:', parsedData[0]);
      
      const response = await dispatch(bulkCreateProducts(parsedData)).unwrap();

      MySwal.fire({
        icon: "success",
        title: "Upload Successful!",
        html: `
          <div class="text-start">
            <p><strong>Created:</strong> ${response.summary?.created || parsedData.length}</p>
            ${response.summary?.failed ? `<p class="text-danger"><strong>Failed:</strong> ${response.summary.failed}</p>` : ""}
            ${response.summary?.duplicates ? `<p class="text-warning"><strong>Duplicates:</strong> ${response.summary.duplicates}</p>` : ""}
          </div>
        `,
        timer: 3000,
      });

      // Reset state
      setFile(null);
      setValidationResults(null);
      setParsedData([]);
      
      // Call success callback
      if (onSuccess) onSuccess();
      
      // Close modal
      onHide();
    } catch (error) {
      console.error("Error uploading products:", error);
      MySwal.fire({
        icon: "error",
        title: "Upload Failed",
        text: error || "Failed to upload products",
        timer: 3000,
      });
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    if (!uploading) {
      setFile(null);
      setValidationResults(null);
      setParsedData([]);
      onHide();
    }
  };

  return (
    <Modal show={show} onHide={handleClose} size="xl" centered>
      <Modal.Header>
        <Modal.Title>Bulk Upload Products</Modal.Title>
        <button
          type="button"
          className="btn-close"
          onClick={handleClose}
          disabled={uploading}
        >
          <X />
        </button>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-12 mb-4">
            <div className="alert alert-info">
              <strong>📋 Instructions:</strong>
              <ol className="mb-0 mt-2">
                <li>Download the template Excel file</li>
                <li>Fill in your product data following the format</li>
                <li>Upload the completed file</li>
                <li>Review validation results</li>
                <li>Click "Upload Products" to add them to the system</li>
              </ol>
            </div>
          </div>

          <div className="col-12 mb-3">
            <button
              type="button"
              className="btn btn-primary w-100"
              onClick={downloadTemplate}
            >
              <Download className="me-2" size={16} />
              Download Excel Template
            </button>
          </div>

          <div className="col-12 mb-3">
            <label className="form-label">Upload Excel File</label>
            <input
              type="file"
              className="form-control"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              disabled={uploading}
            />
            {file && (
              <div className="mt-2 text-success">
                <FileText size={16} className="me-1" />
                Selected: {file.name}
              </div>
            )}
          </div>

          {file && !validationResults && (
            <div className="col-12 mb-3">
              <button
                type="button"
                className="btn btn-info w-100"
                onClick={validateAndParseData}
                disabled={uploading}
              >
                {uploading ? (
                  <>
                    <Loader className="me-2 spinner-border spinner-border-sm" />
                    Validating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="me-2" size={16} />
                    Validate File
                  </>
                )}
              </button>
            </div>
          )}

          {validationResults && (
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">Validation Results</h5>
                </div>
                <div className="card-body">
                  <div className="row mb-3">
                    <div className="col-4">
                      <div className="text-center p-3 border rounded">
                        <h3 className="mb-0">{validationResults.total}</h3>
                        <small className="text-muted">Total Rows</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="text-center p-3 border rounded bg-success-subtle">
                        <h3 className="mb-0 text-success">
                          {validationResults.valid}
                        </h3>
                        <small className="text-success">Valid</small>
                      </div>
                    </div>
                    <div className="col-4">
                      <div className="text-center p-3 border rounded bg-danger-subtle">
                        <h3 className="mb-0 text-danger">
                          {validationResults.invalid}
                        </h3>
                        <small className="text-danger">Invalid</small>
                      </div>
                    </div>
                  </div>

                  {validationResults.invalid > 0 && (
                    <div className="table-responsive" style={{ maxHeight: "300px", overflowY: "auto" }}>
                      <table className="table table-sm">
                        <thead className="sticky-top bg-white">
                          <tr>
                            <th>Row</th>
                            <th>Product Name</th>
                            <th>Errors</th>
                            <th>Warnings</th>
                          </tr>
                        </thead>
                        <tbody>
                          {validationResults.rows
                            .filter((row) => !row.isValid)
                            .map((row) => (
                              <tr key={row.rowNumber}>
                                <td>{row.rowNumber}</td>
                                <td>
                                  {row.data["Product Name"] ||
                                    row.data["Article Profile Name"] ||
                                    "-"}
                                </td>
                                <td>
                                  {row.errors.map((error, idx) => (
                                    <div key={idx} className="text-danger small">
                                      <AlertCircle size={12} className="me-1" />
                                      {error}
                                    </div>
                                  ))}
                                </td>
                                <td>
                                  {row.warnings.map((warning, idx) => (
                                    <div key={idx} className="text-warning small">
                                      {warning}
                                    </div>
                                  ))}
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleClose}
          disabled={uploading}
        >
          Cancel
        </button>
        {validationResults && validationResults.valid > 0 && (
          <button
            type="button"
            className="btn btn-success"
            onClick={handleBulkUpload}
            disabled={uploading}
          >
            {uploading ? (
              <>
                <Loader className="me-2 spinner-border spinner-border-sm" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="me-2" size={16} />
                Upload {validationResults.valid} Products
              </>
            )}
          </button>
        )}
      </Modal.Footer>
    </Modal>
  );
};

BulkUploadProduct.propTypes = {
  show: PropTypes.bool.isRequired,
  onHide: PropTypes.func.isRequired,
  onSuccess: PropTypes.func,
};

export default BulkUploadProduct;