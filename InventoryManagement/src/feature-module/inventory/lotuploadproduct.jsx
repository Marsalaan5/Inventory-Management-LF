import React, { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import * as XLSX from "xlsx";
import { all_routes } from "../../Router/all_routes";
import {
  ArrowLeft,
  ChevronUp,
  Download,
  Upload,
  File,
  Info,
//   CheckCircle,
  XCircle,
} from "feather-icons-react/build/IconComponents";
import { OverlayTrigger, Tooltip, Badge } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import AuthService from "../../services/authService";

const LotUploadInBulk = () => {
  const route = all_routes;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);
  const excelInputRef = useRef(null);

  const headerCollapsed = useSelector((s) => s.toggle_header);
  const { user } = useSelector((s) => s.auth);

  const [articleProfiles, setArticleProfiles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [statusOptions, setStatusOptions] = useState([]);
  const [selectedArticleProfile, setSelectedArticleProfile] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [inWhLocation, setInWhLocation] = useState("");
  const [currentStatus, setCurrentStatus] = useState(null);

  const [excelFileName, setExcelFileName] = useState("");
  const [processing, setProcessing] = useState(false);

  const [apiConfig, setApiConfig] = useState(null);

  
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchArticleProfiles();
    fetchWarehouses();
    fetchStatuses();
  }, []); // eslint-disable-line

  useEffect(() => {
    if (user?.warehouse_id && warehouses.length > 0) {
      const wh = warehouses.find((w) => w.value === user.warehouse_id);
      if (wh) 
        setSelectedWarehouse(wh);
    }
  }, [user, warehouses]);



  const fetchArticleProfiles = async () => {
    try {
      const res = await AuthService.getUnfilteredArticles();
      setArticleProfiles(
        res.data.data.map((i) => ({
          value: i.art_prof_uuid || i.uuid,
          label: i.title || i.name,
        }))
      );
    } catch (e) {
      console.error("Failed to load article profiles", e);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await AuthService.getWarehouse();
      setWarehouses(
        res.data.data.map((i) => ({
          value: i.wh_uuid || i.id,
          label: i.title || i.name,
        }))
      );
    } catch (e) {
      console.error("Failed to load warehouses", e);
    }
  };

  

  const fetchStatuses = async () => {
    try {
      const res = await AuthService.getProductStatuses();
      const raw = res.data?.data || res.data || [];
      const mapped = Array.isArray(raw)
        ? raw.map((s) =>
            typeof s === "object"
              ? s
              : { value: s, label: s.charAt(0).toUpperCase() + s.slice(1) }
          )
        : [];
      setStatusOptions(mapped);
    } catch (e) {
      setStatusOptions([
        { value: "good", label: "Good" },
        { value: "faulty", label: "Faulty" },
        { value: "broken/burnt", label: "Broken / Burnt" },
      ]);
    }
  };

  const validateConfigForDownload = useCallback(() => {
    if (!selectedWarehouse) {
      MySwal.fire({ icon: "warning", title: "Warehouse Required", text: "Please select a warehouse.", timer: 2000 });
      return false;
    }
    if (!selectedArticleProfile) {
      MySwal.fire({ icon: "warning", title: "Article Profile Required", text: "Please select an article profile.", timer: 2000 });
      return false;
    }
    if (!inWhLocation.trim()) {
      MySwal.fire({ icon: "warning", title: "WH Location Required", text: "Please enter In-Warehouse Location.", timer: 2000 });
      return false;
    }
    if (!currentStatus) {
      MySwal.fire({ icon: "warning", title: "Status Required", text: "Please select a product status.", timer: 2000 });
      return false;
    }
    return true;
  }, [selectedWarehouse, selectedArticleProfile, inWhLocation, currentStatus]); // eslint-disable-line

  const handleDownloadTemplate = () => {
    if (!validateConfigForDownload()) return;

    const safeName = (str) => str?.replace(/[^a-zA-Z0-9_-]/g, "_") ?? "template";
    const fileName = `bulk_upload__${safeName(selectedArticleProfile?.label)}__${safeName(inWhLocation)}__${currentStatus.value}.xlsx`;

    const configWs = XLSX.utils.aoa_to_sheet([
      [["# CONFIG — DO NOT EDIT THIS SHEET"]],
      ["article_profile_id", "article_profile_name", "in_wh_location", "status"],
      [selectedArticleProfile.value, selectedArticleProfile.label, inWhLocation.trim(), currentStatus.value],
    ]);
    configWs["!cols"] = [{ wch: 34 }, { wch: 32 }, { wch: 20 }, { wch: 12 }];

    const productWs = XLSX.utils.aoa_to_sheet([
      ["s_no", "barcode", "quantity", "description"],
    //   [1, "", 1, ""],
    ]);
    productWs["!cols"] = [{ wch: 8 }, { wch: 28 }, { wch: 12 }, { wch: 40 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, productWs, "Products");
    XLSX.utils.book_append_sheet(wb, configWs, "Config");
    XLSX.writeFile(wb, fileName);
  };


  const handleDownloadErrorReport = useCallback(() => {
    if (!apiConfig) return;

    const configWs = XLSX.utils.aoa_to_sheet([
      [["# CONFIG — DO NOT EDIT THIS SHEET"]],
      ["article_profile_id", "article_profile_name", "in_wh_location", "status"],
      [apiConfig.article_profile_id, apiConfig.article_profile_name, apiConfig.in_wh_location, apiConfig.status],
    ]);
    configWs["!cols"] = [{ wch: 34 }, { wch: 32 }, { wch: 20 }, { wch: 12 }];

    const productRows = results.map((row, idx) => [
      idx + 1,
      row.partial_code,
      row.quantity,
      row.description || "",
      row.message || "Unknown error",
    ]);
    const productWs = XLSX.utils.aoa_to_sheet([
      ["s_no", "barcode", "quantity", "description", "error_message"],
      ...productRows,
    ]);
    productWs["!cols"] = [{ wch: 8 }, { wch: 28 }, { wch: 12 }, { wch: 40 }, { wch: 50 }];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, productWs, "Products");
    XLSX.utils.book_append_sheet(wb, configWs, "Config");

    const ts = new Date().toISOString().slice(0, 16).replace("T", "_").replace(":", "-");
    XLSX.writeFile(wb, `error_report__${ts}.xlsx`);
  }, [apiConfig, results]);

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setProcessing(true);
    setExcelFileName(file.name);
    setResults([]);
    setApiConfig(null);

    try {
      const formData = new FormData();
      formData.append("products_import_sheet", file);

      const res = await AuthService.bulkImportSubmit(formData);
      const apiMessage = res.data?.message || "Something went wrong.";

      if (!res.data?.success && res.status !== 207) {
        MySwal.fire({ icon: "error", title: "Upload Failed", text: apiMessage });
        return;
      }

      const errorProducts = res.data?.error_data?.Products || [];
      const apiErrorCount = errorProducts.length;


      const configFromApi = res.data?.error_data?.Config?.[0] || null;
      setApiConfig(configFromApi);


      setResults(
        errorProducts.map((f) => ({
          partial_code: f.barcode,
          quantity: f.quantity ?? "—",
          description: f.description || "",
          status: "error",
          message: f.message,
        }))
      );

      if (apiErrorCount === 0) {
        MySwal.fire({
          icon: "success",
          title: "Upload Complete",
          text: apiMessage,
          timer: 3000,
          showConfirmButton: false,
        }).then(() => navigate(route.productlist));
      } else if (res.status === 422) {
        MySwal.fire({ icon: "error", title: "Upload Failed", text: apiMessage });
      } else {
        MySwal.fire({ icon: "warning", title: "Partial Upload", text: apiMessage });
      }

    } catch (err) {
      console.error("Upload/submit error:", err);
      MySwal.fire({
        icon: "error",
        title: "Submission Failed",
        text: err?.response?.data?.message || err?.message || "Please try again.",
      });
    } finally {
      setProcessing(false);
      if (excelInputRef.current) excelInputRef.current.value = "";
    }
  };

  const isConfigComplete =
    !!selectedWarehouse && !!selectedArticleProfile && !!inWhLocation.trim() && !!currentStatus;

  const errorCount = results.length; // results only contains errors now

  return (
    <div className="page-wrapper">
      <div className="content">

        {/* ── Page Header ── */}
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Bulk Product Upload</h4>
              <h6>Download Template → Fill → Upload (submits automatically)</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <li>
              <Link to={route.productlist} className="btn btn-secondary">
                <ArrowLeft className="me-2" />
                Back to Products
              </Link>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={<Tooltip id="collapse-tip">Collapse</Tooltip>}>
                <Link
                  id="collapse-header"
                  className={headerCollapsed ? "active" : ""}
                  onClick={() => dispatch(setToogleHeader(!headerCollapsed))}
                >
                  <ChevronUp className="feather-chevron-up" />
                </Link>
              </OverlayTrigger>
            </li>
          </ul>
        </div>

        {/* ── Workflow hint ── */}
        <div className="alert alert-light border d-flex align-items-start mb-3">
          <Info className="me-2 mt-1 flex-shrink-0" size={18} />
          <div className="small">
            <strong>How it works: </strong>
            <span className="text-primary fw-semibold">Step 1 —</span> Fill all fields &amp; click <strong>Download Template</strong>. &nbsp;
            <span className="text-primary fw-semibold">Step 2 —</span> Fill in barcodes &amp; quantities. &nbsp;
            <span className="text-primary fw-semibold">Step 3 —</span> Click <strong>Upload &amp; Submit</strong> — config is read from the file automatically.
          </div>
        </div>
{/*  */}
        {/* ── Step 1: Configure & Download Template ── */}
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="mb-1">
              <span className="badge bg-primary me-2" style={{ fontSize: "0.7rem" }}>Step 1</span>
              Configure &amp; Download Template
            </h5>
            <p className="text-muted small mb-3">
              Fill all fields to enable template download. Config is embedded in the file.
            </p>

            <div className="row g-3">
              <div className="col-lg-3">
                <label className="form-label">Warehouse <span className="text-danger">*</span></label>
                {user?.warehouse_id ? (
                  <input className="form-control" value={selectedWarehouse?.label || "Loading…"} disabled />
                ) : (
                  <Select className="select" options={warehouses} placeholder="Select warehouse" value={selectedWarehouse} onChange={setSelectedWarehouse} />
                )}
              </div>

              <div className="col-lg-3">
                <label className="form-label">Article Profile <span className="text-danger">*</span></label>
                <Select
                  className="select"
                  options={articleProfiles}
                  placeholder="Select article profile"
                  value={selectedArticleProfile}
                  onChange={setSelectedArticleProfile}
                  styles={{ control: (b) => ({ ...b, borderColor: selectedArticleProfile ? "#28a745" : b.borderColor, borderWidth: selectedArticleProfile ? 2 : 1 }) }}
                />
              </div>

              <div className="col-lg-3">
                <label className="form-label">In-WH Location <span className="text-danger">*</span></label>
                <input type="text" className="form-control" placeholder="e.g., A-12 / Ground Floor" value={inWhLocation} onChange={(e) => setInWhLocation(e.target.value)} />
              </div>

              <div className="col-lg-3">
                <label className="form-label">Product Status <span className="text-danger">*</span></label>
                <Select
                  className="select"
                  options={statusOptions}
                  placeholder="Select status"
                  value={currentStatus}
                  onChange={setCurrentStatus}
                  styles={{ control: (b) => ({ ...b, borderColor: currentStatus ? "#ffc107" : b.borderColor, borderWidth: currentStatus ? 2 : 1 }) }}
                />
                <small className="text-warning">⚠ Applied to all uploaded products</small>
              </div>
            </div>

            <div className="mt-3 pt-3 border-top">
              {isConfigComplete ? (
                <div>
                  <div className="d-flex flex-wrap gap-2">
                    <Badge bg="success">{selectedArticleProfile.label}</Badge>
                    <Badge bg="secondary">{inWhLocation}</Badge>
                    <Badge bg="warning" text="dark">{currentStatus.label}</Badge>
                  </div>
                  <button className="btn btn-outline-primary btn-sm mt-3" onClick={handleDownloadTemplate}>
                    <Download size={14} className="me-2" />Download Excel Template
                  </button>
                  <p className="text-muted small mt-2">Fill <em>QR/Barcode</em> &amp; <em>Quantity</em> in the Products sheet. Do not edit the Config sheet.</p>
                </div>
              ) : (
                <div>
                  <button className="btn btn-outline-secondary btn-sm" disabled>
                    <Download size={14} className="me-2" />Download Excel Template
                  </button>
                  <p className="text-muted small mt-2">⚠ Fill all required fields above to enable download.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Step 2: Upload & Submit ── */}
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="mb-1">
              <span className="badge bg-success me-2" style={{ fontSize: "0.7rem" }}>Step 2</span>
              Upload &amp; Submit
            </h5>
            <p className="text-muted small mt-2">
              Upload your filled template anytime — <strong>no need to re-select fields.</strong> Config is read from the file automatically.
            </p>

            <input ref={excelInputRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: "none" }} onChange={handleExcelUpload} />

            <div>
              <button
                className="btn btn-primary"
                onClick={() => { setResults([]); excelInputRef.current?.click(); }}
                disabled={processing}
              >
                {processing ? (
                  <><span className="spinner-border spinner-border-sm me-2" />Processing &amp; Submitting…</>
                ) : (
                  <><Upload size={15} className="me-2" />Upload &amp; Submit</>
                )}
              </button>

              {excelFileName && !processing && (
                <span className="small text-muted ms-3">
                  <File size={13} className="me-1 text-success" />
                  Last uploaded: {excelFileName}
                </span>
              )}

              <p className="text-muted small mt-2">
                💡 You can upload on a different device — no form setup needed.
              </p>
            </div>
          </div>
        </div>

        {/* ── Error Results Table — only shown when there are failures ── */}
        {errorCount > 0 && (
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Failed Rows</h5>
                <Badge bg="danger">{errorCount} failed</Badge>
              </div>

              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 mb-3">
                <XCircle size={16} />
                <span className="small">
                  Review the errors below, fix your file, and re-upload.
                </span>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: "4%" }}>#</th>
                      <th style={{ width: "25%" }}>QR / Barcode</th>
                      <th style={{ width: "10%" }}>Qty</th>
                      <th style={{ width: "25%" }}>Description</th>
                      <th style={{ width: "36%" }}>Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, idx) => (
                      <tr key={idx} className="table-danger">
                        <td className="text-muted small">{idx + 1}</td>
                        <td><code className="small">{row.partial_code}</code></td>
                        <td>{row.quantity}</td>
                        <td className="small text-muted">{row.description || "—"}</td>
                        <td className="small text-danger fw-semibold">{row.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {results.length === 0 && !processing && (
          <div className="card">
            <div className="card-body text-center py-5">
              <Upload size={46} className="text-muted mb-3" />
              <h5>No File Uploaded Yet</h5>
              <p className="text-muted mb-0">
                Download the template (Step 1), fill in your barcodes and quantities, then click <strong>Upload &amp; Submit</strong>.
              </p>
            </div>
          </div>
        )}

        {/* ── Bottom actions ── */}
        <div className="col-lg-12 mt-3">
          <div className="btn-addproduct mb-4 d-flex gap-2 flex-wrap align-items-center">
            <Link to={route.productlist} className="btn btn-cancel">Cancel</Link>

            {errorCount > 0 && (
              <>
                {/* Only shown when API returned Config in error_data (207 or 422) */}
                {apiConfig && (
                  <button className="btn btn-outline-danger btn-sm" onClick={handleDownloadErrorReport}>
                    <Download size={14} className="me-2" />
                    Download Error Report ({errorCount} failed)
                  </button>
                )}
                <button
                  className="btn btn-outline-primary btn-sm"
                  onClick={() => { setResults([]); setExcelFileName(""); excelInputRef.current?.click(); }}
                  disabled={processing}
                >
                  <Upload size={14} className="me-2" />
                  Upload a Corrected File
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LotUploadInBulk;