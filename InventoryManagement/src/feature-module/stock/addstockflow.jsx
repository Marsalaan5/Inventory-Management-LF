
// import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Select from "react-select";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import {
//   ArrowLeft, ChevronUp, Camera, Plus, Package, Send, Info,
//   Trash2, Upload, File, X, RefreshCw, AlertTriangle,
// } from "feather-icons-react/build/IconComponents";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import { setToogleHeader } from "../../core/redux/action";
// import { scanProduct } from "../../core/redux/slices/productSlice";
// import AuthService from "../../services/authService";
// import Table from "../../core/pagination/datatable";

// const MySwal = withReactContent(Swal);

// const toast = (icon, title, text, timer = 2000) =>
//   MySwal.fire({ icon, title, text, timer, showConfirmButton: false, toast: true, position: "top-end" });

// const STATUS_BADGE = {
//   new:      "badge-success",
//   used:     "badge-info",
//   repaired: "badge-warning",
//   damaged:  "badge-secondary",
//   burnt:    "badge-danger",
// };

// const INITIAL_FORM = {
//   from_warehouse: null,
//   to_warehouse:   null,
//   transport:      null,
//   status:         null,
//   description:    "",
//   invoice:        "",
// };

// // =============================================================================
// const AddStockFlow = () => {
//   const dispatch     = useDispatch();
//   const navigate     = useNavigate();
//   const headerToggle = useSelector((s) => s.toggle_header);
//   const currentUser  = useSelector((s) => s.user?.currentUser);

//   const [warehouses,       setWarehouses]       = useState([]);
//   const [allWarehouses,    setAllWarehouses]    = useState([]);
//   const [transportOptions, setTransportOptions] = useState([]);
//   const [statusOptions,    setStatusOptions]    = useState([]);

//   const [formData, setFormData] = useState(INITIAL_FORM);
//   const setField = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

//   const [scannedProducts, setScannedProducts] = useState([]);
//   const scannedProductsRef = useRef([]);

//   const [currentStockId,  setCurrentStockId]  = useState(null);

//   const [loadingDraft,   setLoadingDraft]   = useState(true);
//   const [isScanning,     setIsScanning]     = useState(false);
//   const [isSyncing,      setIsSyncing]      = useState(false);
//   const [submitting,     setSubmitting]     = useState(false);
//   const [productErrors,  setProductErrors]  = useState([]);

//   const [barcodeInput, setBarcodeInput] = useState("");
//   const barcodeRef  = useRef(null);
//   const scanBuffer  = useRef("");
//   const lastKeyTime = useRef(0);

//   const [billPreview,    setBillPreview]    = useState(null);
//   const [excelFile,      setExcelFile]      = useState(null);
//   const [importingExcel, setImportingExcel] = useState(false);
//   const excelInputRef = useRef(null);


//   const totalQty = useMemo(
//     () => scannedProducts.reduce((s, p) => s + (parseInt(p.quantity_to_transfer) || 0), 0),
//     [scannedProducts]
//   );

//   const fromWarehouseOptions = useMemo(() => {
//     if (currentUser?.warehouse_id)
//       return warehouses.filter((w) => w.value === currentUser.warehouse_id);
//     return warehouses;
//   }, [warehouses, currentUser]);


//   const canSync = !!(formData.from_warehouse && formData.to_warehouse);

 
//   const effectiveTransport = formData.transport || transportOptions[0] || null;
//   const effectiveStatus    = formData.status    || statusOptions[0]    || null;

//   // ─────────────────────────────────────────────────────────────────────────
//   // Mount
//   // ─────────────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     (async () => {
//       await Promise.all([loadWarehouses(), loadAllWarehouses(), loadTransportOptions()]);
//       await restoreDraft();
//     })();
//     // eslint-disable-next-line
//   }, []);



//   useEffect(() => {
//     if (currentUser?.warehouse_id && warehouses.length && !formData.from_warehouse) {
//       const wh = warehouses.find((w) => w.value === currentUser.warehouse_id);
//       if (wh) setField("from_warehouse", wh);
//     }
//     // eslint-disable-next-line
//   }, [currentUser, warehouses]);

//   // Re-sync when routing fields change and we already have products
//   useEffect(() => {
//     if (scannedProducts.length > 0 && canSync && effectiveTransport) {
//       syncToDb(scannedProducts, formData);
//     }
//     // eslint-disable-next-line
//   }, [formData.from_warehouse, formData.to_warehouse, formData.transport]);

//   // Hardware scanner listener
//   useEffect(() => {
//     const handleKey = (e) => {
//       const now = Date.now();
//       if (now - lastKeyTime.current > 80) scanBuffer.current = "";
//       lastKeyTime.current = now;

//       const tag          = e.target.tagName;
//       const isOtherInput = (tag === "INPUT" || tag === "TEXTAREA") && e.target !== barcodeRef.current;
//       if (isOtherInput) return;

//       if (e.key === "Enter" && scanBuffer.current.length >= 4) {
//         e.preventDefault();
//         const code = scanBuffer.current.trim();
//         setBarcodeInput(code);
//         handleScan(code);
//         scanBuffer.current = "";
//         return;
//       }
//       if (e.key.length === 1) scanBuffer.current += e.key;
//     };
//     window.addEventListener("keypress", handleKey);
//     return () => window.removeEventListener("keypress", handleKey);
//     // eslint-disable-next-line
//   }, [formData, scannedProducts, transportOptions, statusOptions]);



//   const setScanned = (val) => {
//   setScannedProducts((prev) => {
//     const next = typeof val === "function" ? val(prev) : val;
//     scannedProductsRef.current = next;
//     return next;
//   });
// };
//   // ─────────────────────────────────────────────────────────────────────────
//   // Loade rs
//   // ─────────────────────────────────────────────────────────────────────────
//   const loadWarehouses = async () => {
//     try {
//       const res  = await AuthService.getWarehouse();
//       const list = (res.data.data || res.data || []).map((w) => ({ value: w.wh_uuid, label: w.name || w.title }));
//       setWarehouses(list);
//     } catch (e) { console.error("loadWarehouses:", e); }
//   };

//   const loadAllWarehouses = async () => {
//     try {
//       const res  = await AuthService.getWarehouseDropdown();
//       const list = (res.data.data || res.data || []).map((w) => ({ value: w.wh_uuid, label: w.name || w.title }));
//       setAllWarehouses(list);
//     } catch (e) { console.error("loadAllWarehouses:", e); }
//   };


//   const loadTransportOptions = async () => {
//     try {
//       const res = await AuthService.getStockFlowOptions();
//       console.log(" getStockFlowOptions raw response:", res.data);

//       const options = res.data?.data;
//       if (!options) {
//         console.error(" getStockFlowOptions: res.data.data is empty. Full response:", res.data);
//         toast("error", "Options Error", "Failed to load transport/status options from server.", 5000);
//         return;
//       }


//       const toOpt = (v) =>
//         typeof v === "object" && v !== null && v.value !== undefined
//           ? v
//           : { value: String(v), label: String(v).split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") };

//       const transportOpts = (options.transport || []).map(toOpt);
//       const statusOpts    = (options.status    || []).map(toOpt);

//       console.log("Transport options:", transportOpts);
//       console.log("Status options:", statusOpts);

//       if (!transportOpts.length) console.warn("⚠ Transport options are empty — check stock_flow.transport enum in DB.");
//       if (!statusOpts.length)    console.warn("⚠ Status options are empty — check stock_flow.status enum in DB.");

//       setTransportOptions(transportOpts);
//       setStatusOptions(statusOpts);

     
//       const defaultStatus = statusOpts.find((s) => s.value === "approved") || statusOpts[0] || null;
//       if (defaultStatus) setField("status", defaultStatus);
//     } catch (e) {
//       console.error("loadTransportOptions error:", e);
//       toast("error", "Options Error", `Could not load transport/status: ${e.message}`, 5000);
//     }
//   };

//   // ─────────────────────────────────────────────────────────────────────────
//   // Restore draft
//   // ─────────────────────────────────────────────────────────────────────────
//   const restoreDraft = async () => {
//     setLoadingDraft(true);
//     try {
//       const res  = await AuthService.getExistingLot();
//       const body = res.data;
//       if (!body.is_found || !body.data) return;

//       const lot = body.data;
//       setCurrentStockId(lot.stock_id);
//       setFormData((prev) => ({ ...prev, description: lot.bulk_imp_desc || "", invoice: lot.invoice || "" }));

//       if (lot.prod_arr?.length) {
//         const restored = lot.prod_arr.map((p) => ({
//           id:                   p.id || p.barcode,
//           barcode:              p.barcode,
//           title:                p.title || "—",
//           article_profile_id:   p.article_profile_id,
//           article_profile_name: p.article_profile_name || "—",
//           warehouse_name:       p.warehouse_name || "—",
//           warehouse_id:         p.warehouse_id,
//           in_wh_location:       p.in_wh_location ?? "",
//           count:                p.count || 0,
//           status:               p.status,
//           quantity_to_transfer: p.count || 1,
//         }));
//         setScannedProducts(restored);
//         MySwal.fire({
//           icon: "info", title: "Draft Restored",
//           html: `<p><strong>${restored.length}</strong> product(s) from your previous session.</p>
//                  <small class="text-muted">Stock ID: ${lot.stock_id}</small>`,
//           timer: 3500, showConfirmButton: false,
//         });
//       }
//     } catch (err) {
//       console.warn("No draft found:", err.message);
//     } finally {
//       setLoadingDraft(false);
//     }
//   };

//   // ─────────────────────────────────────────────────────────────────────────
//   // syncToDb
//   // ─────────────────────────────────────────────────────────────────────────
//   const syncToDb = useCallback(async (products, fd) => {
//     if (!fd.from_warehouse || !fd.to_warehouse) return;
//     if (!products.length) return;

 
//     const transport = fd.transport || null;

//     if (!transport) {
   
//       console.warn("syncToDb called without transport in fd — caller should pass override.");
//     }

//     setIsSyncing(true);
//     try {
//       const prod_arr = products.map((p) => ({
//         title:              p.title,
//         article_profile_id: p.article_profile_id,
//         in_wh_location:     p.in_wh_location ?? "",
//         status:             p.status,
//         count:              p.quantity_to_transfer || 1,
//         barcode:            p.barcode,
//       }));

//       const payload = {
//         from_warehouse: fd.from_warehouse.value,
//         to_warehouse:   fd.to_warehouse.value,
//         transportation: (fd.transport || fd._effectiveTransport)?.value,
//         status:         (fd.status || fd._effectiveStatus)?.value || "approved",
//         prod_arr,
//         invoice:        fd.invoice     || undefined,
//         description:    fd.description || undefined,
//       };

//       if (!payload.transportation) {
//         console.error("syncToDb: transportation is undefined — aborting sync");
//         toast("warning", "Transport Required", "Please select a transport method before syncing.", 3000);
//         return;
//       }

//       console.log(" syncToDb payload:", payload);
//       const res = await AuthService.stockFlowSync(payload);
//       if (res.data?.data?.stock_id) {
//         setCurrentStockId(res.data.data.stock_id);
//         console.log("Draft saved. Stock ID:", res.data.data.stock_id);
//       }
//     } catch (err) {
//       const msg = err.response?.data?.message || "Failed to sync draft";
//       if (err.response?.status === 409) {
//         toast("warning", "Already in Draft", msg);
//       } else {
//         toast("error", "Sync Error", msg, 3000);
//       }
//       console.error("syncToDb error:", err.response?.data || err);
//     } finally {
//       setIsSyncing(false);
//     }
//   }, []);


//   // ─────────────────────────────────────────────────────────────────────────
//   // handleScan — ALWAYS ACTIVE
//   // ─────────────────────────────────────────────────────────────────────────
  
//   // const handleScan = useCallback(async (barcode) => {
//   //   const code = (barcode || "").trim();
//   //   if (!code) return;

//   //   if (scannedProducts.find((p) => p.barcode === code)) {
//   //     toast("warning", "Already Scanned", `Barcode "${code}" is already in the list.`);
//   //     setBarcodeInput("");
//   //     return;
//   //   }

//   //   setIsScanning(true);
//   //   try {
//   //     const res     = await dispatch(scanProduct(code)).unwrap();
//   //     const product = res.data;
//   //     if (!product || !product.barcode) throw new Error(res.message || "Product not found");

//   //     if (formData.from_warehouse && product.warehouse_id !== formData.from_warehouse.value) {
//   //       MySwal.fire({
//   //         icon: "error", title: "Wrong Warehouse",
//   //         text: `This product belongs to "${product.warehouse_name}", not "${formData.from_warehouse.label}".`,
//   //       });
//   //       setBarcodeInput("");
//   //       return;
//   //     }

//   //     const ALLOWED = ["new", "used", "repaired"];
//   //     if (!ALLOWED.includes(product.status)) {
//   //       MySwal.fire({
//   //         icon: "error", title: "Invalid Status",
//   //         text: `"${product.title}" has status "${product.status}". Only ${ALLOWED.join(", ")} can be transferred.`,
//   //       });
//   //       setBarcodeInput("");
//   //       return;
//   //     }

//   //     const newProd = {
//   //       id:                   product.id,
//   //       barcode:              product.barcode,
//   //       title:                product.title,
//   //       article_profile_id:   product.article_profile_id,
//   //       article_profile_name: product.article_profile_name || "—",
//   //       warehouse_name:       product.warehouse_name,
//   //       warehouse_id:         product.warehouse_id,
//   //       in_wh_location:       product.in_wh_location ?? "",
//   //       count:                product.count || 0,
//   //       status:               product.status,
//   //       quantity_to_transfer: 1,
//   //     };

//   //     const updated = [...scannedProducts, newProd];
//   //     setScannedProducts(updated);
//   //     setBarcodeInput("");

//   //     if (canSync) {
//   //       // Inject _effectiveTransport/_effectiveStatus so syncToDb always gets a transport
//   //       // even when the user hasn't explicitly picked one yet from the dropdown.
//   //       const fdWithDefaults = {
//   //         ...formData,
//   //         _effectiveTransport: formData.transport || transportOptions[0] || null,
//   //         _effectiveStatus:    formData.status    || statusOptions[0]    || null,
//   //       };

//   //       if (!fdWithDefaults._effectiveTransport) {
//   //         toast("warning", "Options Loading",
//   //           "Transport options are still loading. Please try again in a moment.", 3000);
//   //         return;
//   //       }

//   //       await syncToDb(updated, fdWithDefaults);
//   //       toast("success", "✓ Scanned & Saved", product.title);
//   //     } else {
//   //       toast("info", "✓ Scanned (Local)",
//   //         `"${product.title}" added. Select From & To warehouse to save to draft.`);
//   //     }
//   //   } catch (err) {
//   //     const msg = err.response?.data?.message || err.message || "Product not found";
//   //     MySwal.fire({ icon: "error", title: "Not Found", text: msg });
//   //   } finally {
//   //     setIsScanning(false);
//   //     barcodeRef.current?.focus();
//   //   }
//   //   // eslint-disable-next-line
//   // }, [dispatch, formData, scannedProducts, canSync, syncToDb, transportOptions, statusOptions]);


//   const handleScan = useCallback(async (barcode) => {
//   const code = (barcode || "").trim();
//   if (!code) return;


//   if (scannedProductsRef.current.find((p) => p.barcode === code)) {
//     toast("warning", "Already Scanned", `Barcode "${code}" is already in the list.`);
//     setBarcodeInput("");
//     return;
//   }

//   setIsScanning(true);
//   try {
//     const res     = await dispatch(scanProduct(code)).unwrap();
//     const product = res.data;
//     if (!product?.barcode) throw new Error(res.message || "Product not found");

//     if (formData.from_warehouse && product.warehouse_id !== formData.from_warehouse.value) {
//       MySwal.fire({ icon: "error", title: "Wrong Warehouse",
//         text: `This product belongs to "${product.warehouse_name}", not "${formData.from_warehouse.label}".` });
//       setBarcodeInput(""); return;
//     }

//     const ALLOWED = ["new", "used", "repaired"];
//     if (!ALLOWED.includes(product.status)) {
//       MySwal.fire({ icon: "error", title: "Invalid Status",
//         text: `"${product.title}" has status "${product.status}". Only ${ALLOWED.join(", ")} can be transferred.` });
//       setBarcodeInput(""); return;
//     }

//     const newProd = {
//       id: product.id, barcode: product.barcode, title: product.title,
//       article_profile_id: product.article_profile_id,
//       article_profile_name: product.article_profile_name || "—",
//       warehouse_name: product.warehouse_name,
//       warehouse_id: product.warehouse_id,
//       in_wh_location: product.in_wh_location ?? "",
//       count: product.count || 0,
//       status: product.status,
//       quantity_to_transfer: 1,
//     };


//     const updated = [...scannedProductsRef.current, newProd];
//     setScanned(updated); 
//     setBarcodeInput("");

//     if (canSync) {
//       const fdWithDefaults = {
//         ...formData,
//         _effectiveTransport: formData.transport || transportOptions[0] || null,
//         _effectiveStatus:    formData.status    || statusOptions[0]    || null,
//       };
//       if (!fdWithDefaults._effectiveTransport) {
//         toast("warning", "Options Loading", "Transport options still loading. Try again.", 3000);
//         return;
//       }
//       await syncToDb(updated, fdWithDefaults);  
//       toast("success", "✓ Scanned & Saved", product.title);
//     } else {
//       toast("info", "✓ Scanned (Local)",
//         `"${product.title}" added. Select warehouses to save to draft.`);
//     }
//   } catch (err) {
//     const msg = err.response?.data?.message || err.message || "Product not found";
//     MySwal.fire({ icon: "error", title: "Not Found", text: msg });
//   } finally {
//     setIsScanning(false);
//     barcodeRef.current?.focus();
//   }
// }, [dispatch, formData, canSync, syncToDb, transportOptions, statusOptions]);

//   // ─────────────────────────────────────────────────────────────────────────
//   // Remove
//   // ─────────────────────────────────────────────────────────────────────────
//   const handleRemoveProduct = useCallback((productId, barcode) => {
//     MySwal.fire({
//       title: "Remove Product?", text: "This will remove it from your draft.",
//       icon: "warning", showCancelButton: true,
//       confirmButtonColor: "#d33", confirmButtonText: "Remove",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       try {
//         if (currentStockId) {
//           const res = await AuthService.removeLotProduct(barcode);
//           setScannedProducts((prev) => prev.filter((p) => p.id !== productId));
//           if (res.data?.draft_deleted) {
//             setCurrentStockId(null);
//             toast("info", "Draft Cleared", "Last product removed. Draft deleted.");
//           } else {
//             toast("success", "Removed", `"${barcode}" removed.`);
//           }
//         } else {
//           setScannedProducts((prev) => prev.filter((p) => p.id !== productId));
//           toast("success", "Removed", `"${barcode}" removed.`);
//         }
//       } catch (err) {
//         toast("error", "Error", err.response?.data?.message || "Failed to remove.", 3000);
//       }
//     });
//   }, [currentStockId]);

//   const handleRemoveSelected = useCallback((selectedIds) => {
//     MySwal.fire({
//       title: `Remove ${selectedIds.length} product(s)?`,
//       icon: "warning", showCancelButton: true,
//       confirmButtonColor: "#d33", confirmButtonText: "Remove All",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       const toRemove = scannedProducts.filter((p) => selectedIds.includes(p.id));
//       if (currentStockId) {
//         for (const p of toRemove) {
//           try { await AuthService.removeLotProduct(p.barcode); } catch { /* continue */ }
//         }
//       }
//       const remaining = scannedProducts.filter((p) => !selectedIds.includes(p.id));
//       setScannedProducts(remaining);
//       if (remaining.length === 0) setCurrentStockId(null);
//       toast("success", "Removed", `${toRemove.length} product(s) removed.`);
//     });
//   }, [scannedProducts, currentStockId]);

//   const handleDiscardDraft = () => {
//     MySwal.fire({
//       title: "Discard entire draft?", text: "All scanned products will be removed.",
//       icon: "warning", showCancelButton: true,
//       confirmButtonColor: "#d33", confirmButtonText: "Yes, discard",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       try {
//         if (currentStockId) await AuthService.discardDraft();
//         setScannedProducts([]);
//         setCurrentStockId(null);
//         toast("info", "Draft Discarded", "All products cleared.");
//       } catch (err) {
//         toast("error", "Error", err.response?.data?.message || "Failed to discard.", 3000);
//       }
//     });
//   };

//   // ─────────────────────────────────────────────────────────────────────────
//   // Qty change
//   // ─────────────────────────────────────────────────────────────────────────
//   const handleQtyChange = useCallback((productId, newQty) => {
//     setScannedProducts((prev) =>
//       prev.map((p) => {
//         if (p.id !== productId) return p;
//         const qty = parseInt(newQty) || 0;
//         if (qty > p.count) { toast("warning", "Insufficient Stock", `Only ${p.count} units available.`); return p; }
//         return { ...p, quantity_to_transfer: qty };
//       })
//     );
//   }, []);

//   // ─────────────────────────────────────────────────────────────────────────
//   // Excel import — ALWAYS ACTIVE
//   // ─────────────────────────────────────────────────────────────────────────
//   const handleExcelImport = async () => {
//     if (!excelFile) return;
//     setImportingExcel(true);
//     try {
//       const fd = new FormData();
//       fd.append("excel_file", excelFile);
//       if (formData.from_warehouse) fd.append("from_warehouse", formData.from_warehouse.value);
//       if (formData.to_warehouse)   fd.append("to_warehouse",   formData.to_warehouse.value);
//       if (effectiveTransport)      fd.append("transportation",  effectiveTransport.value);
//       fd.append("status", effectiveStatus?.value || "approved");
//       if (formData.invoice)     fd.append("invoice",     formData.invoice);
//       if (formData.description) fd.append("description", formData.description);

//       const res  = await AuthService.importStockFlowFromExcel(fd);
//       const data = res.data;

//       if (data.data?.stock_id) setCurrentStockId(data.data.stock_id);

//       if (!data.data?.draft_saved && data.data?.products?.length) {
//         // No draft saved — populate locally
//         const localProds = data.data.products.map((p) => ({
//           id: p.barcode, barcode: p.barcode, title: p.title || "—",
//           article_profile_id: p.article_profile_id, article_profile_name: p.article_profile_name || "—",
//           warehouse_name: p.warehouse_name || "—", warehouse_id: p.warehouse_id,
//           in_wh_location: p.in_wh_location ?? "", count: p.count || 1,
//           status: p.status, quantity_to_transfer: p.count || 1,
//         }));
//         setScannedProducts((prev) => {
//           const ex = new Set(prev.map((x) => x.barcode));
//           return [...prev, ...localProds.filter((x) => !ex.has(x.barcode))];
//         });
//       } else {
//         await restoreDraft();
//       }

//       setExcelFile(null);
//       if (excelInputRef.current) excelInputRef.current.value = "";

//       const errorLines = (data.data?.error_details || [])
//         .map((e) => `<li><code>${e.barcode}</code>: ${e.error}</li>`).join("");

//       MySwal.fire({
//         icon: data.data?.errors > 0 ? "warning" : "success",
//         title: data.message,
//         html: `
//           <p> Added: <strong>${data.data?.added || 0}</strong></p>
//           <p>⏭ Skipped: <strong>${data.data?.skipped || 0}</strong></p>
//           ${data.data?.errors > 0 ? `<p> Errors: <strong>${data.data.errors}</strong></p><ul class="text-start">${errorLines}</ul>` : ""}
//           ${!data.data?.draft_saved ? `<p class="text-warning mt-2 small">⚠ Select From & To warehouse to persist draft.</p>` : ""}
//         `,
//       });
//     } catch (err) {
//       MySwal.fire({ icon: "error", title: "Import Failed", text: err.response?.data?.message || "Import failed." });
//     } finally {
//       setImportingExcel(false);
//     }
//   };

//   // Bill handlers
//   const handleBillChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (!["application/pdf","image/jpeg","image/jpg","image/png"].includes(file.type)) {
//       toast("warning", "Invalid File", "PDF, JPG, or PNG only."); return;
//     }
//     if (file.size > 5 * 1024 * 1024) { toast("warning", "Too Large", "Max 5 MB."); return; }
//     setBillPreview({ name: file.name, size: (file.size / 1024).toFixed(2) + " KB" });
//   };
//   const handleRemoveBill = () => {
//     setBillPreview(null);
//     const el = document.getElementById("billFileInput");
//     if (el) el.value = "";
//   };

//   // ─────────────────────────────────────────────────────────────────────────
//   // Submit
//   // ─────────────────────────────────────────────────────────────────────────
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setProductErrors([]);

//     if (!scannedProducts.length)  { toast("warning", "No Products", "Scan at least one product."); return; }
//     if (!formData.from_warehouse) { toast("warning", "Missing", "From Warehouse is required."); return; }
//     if (!formData.to_warehouse)   { toast("warning", "Missing", "To Warehouse is required."); return; }
//     if (formData.from_warehouse.value === formData.to_warehouse.value) {
//       toast("warning", "Invalid", "From and To warehouses cannot be the same."); return;
//     }
//     if (!effectiveTransport) { toast("warning", "Missing", "No transport options available yet."); return; }
//     if (scannedProducts.some((p) => p.quantity_to_transfer <= 0)) {
//       toast("warning", "Invalid Qty", "All quantities must be > 0."); return;
//     }

//     // Final sync with effective defaults
//     const fdWithDefaults = {
//       ...formData,
//       _effectiveTransport: effectiveTransport,
//       _effectiveStatus:    effectiveStatus,
//     };
//     await syncToDb(scannedProducts, fdWithDefaults);

//     setSubmitting(true);
//     try {
//       const res  = await AuthService.stockFlowSubmit();
//       const body = res.data;

//       if (!body.is_submitted) {
//         if (body.product_errors?.length) {
//           setProductErrors(body.product_errors);
//           MySwal.fire({
//             icon: "error", title: "Submission Failed",
//             html: `<p>${body.message}</p><p class="text-muted small">Errors are highlighted below.</p>`,
//           });
//           return;
//         }
//         throw new Error(body.message || "Submission failed.");
//       }

//       MySwal.fire({
//         icon: "success", title: "Stock Flow Created!",
//         html: `
//           <p><strong>Stock ID:</strong> ${body.data?.stock_id || currentStockId}</p>
//           <p><strong>Products:</strong> ${body.data?.total_products || scannedProducts.length}</p>
//           <p><strong>From:</strong> ${body.data?.from_warehouse}</p>
//           <p><strong>To:</strong> ${body.data?.to_warehouse}</p>
//         `,
//         confirmButtonText: "View Stock Flows",
//       }).then(() => navigate("/stock-transfer"));
//     } catch (err) {
//       const msg = err.response?.data?.message || err.message || "Failed to create stock flow.";
//       if (err.response?.data?.product_errors?.length) setProductErrors(err.response.data.product_errors);
//       MySwal.fire({ icon: "error", title: "Error", text: msg });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ─────────────────────────────────────────────────────────────────────────
//   // Columns
//   // ─────────────────────────────────────────────────────────────────────────
//   const columns = useMemo(() => {
//     const errorMap = Object.fromEntries(productErrors.map((e) => [e.barcode, e.errors]));
//     return [
//       { title: "#", render: (_, __, i) => i + 1, width: "50px" },
//       {
//         title: "Barcode", dataIndex: "barcode",
//         render: (text) => (
//           <span>
//             <span className="badge badge-primary">{text}</span>
//             {errorMap[text] && (
//               <div className="mt-1">
//                 {errorMap[text].map((err, i) => (
//                   <div key={i} className="text-danger small"><AlertTriangle size={12} className="me-1" />{err}</div>
//                 ))}
//               </div>
//             )}
//           </span>
//         ),
//       },
//       { title: "Product Name",    dataIndex: "title" },
//       { title: "Article Profile", dataIndex: "article_profile_name" },
//       { title: "Warehouse",       dataIndex: "warehouse_name" },
//       {
//         title: "Status", dataIndex: "status",
//         render: (t) => <span className={`badge ${STATUS_BADGE[t] || "badge-info"}`}>{t?.toUpperCase() || "N/A"}</span>,
//       },
//       {
//         title: "Available", dataIndex: "count",
//         render: (t) => <span className="badge badge-info">{t}</span>,
//       },
//       {
//         title: "Transfer Qty", dataIndex: "quantity_to_transfer",
//         render: (text, record) => (
//           <input type="number" className="form-control form-control-sm" style={{ width: "80px" }}
//             value={text} min="1" max={record.count}
//             onChange={(e) => handleQtyChange(record.id, e.target.value)} />
//         ),
//       },
//       {
//         title: "Action", width: "80px",
//         render: (_, record) => (
//           <button type="button" className="btn btn-sm btn-danger"
//             onClick={() => handleRemoveProduct(record.id, record.barcode)} title="Remove">
//             <Trash2 size={14} />
//           </button>
//         ),
//       },
//     ];
//   }, [productErrors, handleQtyChange, handleRemoveProduct]);

//   // ─────────────────────────────────────────────────────────────────────────
//   // Render
//   // ─────────────────────────────────────────────────────────────────────────
//   return (
//     <div className="page-wrapper">
//       <div className="content">

//         {/* Page Header */}
//         <div className="page-header">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>Create Stock Flow</h4>
//               <h6>Scan or import products to create a stock transfer</h6>
//             </div>
//           </div>
//           <ul className="table-top-head">
//             <li>
//               <Link to="/stock-transfer" className="btn btn-secondary btn-sm">
//                 <ArrowLeft size={16} className="me-1" />Back
//               </Link>
//             </li>
//             <li>
//               <OverlayTrigger placement="top" overlay={<Tooltip>Collapse</Tooltip>}>
//                 <Link id="collapse-header" className={headerToggle ? "active" : ""}
//                   onClick={() => dispatch(setToogleHeader(!headerToggle))}>
//                   <ChevronUp className="feather-chevron-up" />
//                 </Link>
//               </OverlayTrigger>
//             </li>
//           </ul>
//         </div>

//         {/* Draft loading */}
//         {loadingDraft && (
//           <div className="alert alert-light d-flex align-items-center mb-3">
//             <span className="spinner-border spinner-border-sm me-2" />Checking for saved draft…
//           </div>
//         )}

//         {/* Active draft banner */}
//         {!loadingDraft && currentStockId && (
//           <div className="alert alert-warning d-flex align-items-center justify-content-between mb-3">
//             <div className="d-flex align-items-center">
//               <RefreshCw size={16} className="me-2" />
//               <strong>Active Draft:</strong>
//               <span className="ms-2 badge badge-warning">{currentStockId}</span>
//               {isSyncing && <span className="spinner-border spinner-border-sm ms-2 text-muted" />}
//             </div>
//             {scannedProducts.length > 0 && (
//               <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleDiscardDraft}>
//                 <Trash2 size={14} className="me-1" />Discard Draft
//               </button>
//             )}
//           </div>
//         )}

//         {/* Product errors */}
//         {productErrors.length > 0 && (
//           <div className="alert alert-danger mb-3">
//             <h6 className="mb-2">
//               <AlertTriangle size={16} className="me-2" />
//               {productErrors.length} product(s) have errors — please correct them and resubmit.
//             </h6>
//             <ul className="mb-0">
//               {productErrors.map((e, i) => (
//                 <li key={i}><strong>{e.title || e.barcode}</strong> ({e.barcode}): {e.errors.join("; ")}</li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* ── Stock Flow Details ── */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <h5 className="mb-4">Stock Flow Details</h5>

//             <div className="row mb-3">
//               <div className="col-lg-6">
//                 <label className="form-label">From Warehouse <span className="text-danger">*</span></label>
//                 <Select options={fromWarehouseOptions} value={formData.from_warehouse}
//                   onChange={(opt) => setField("from_warehouse", opt)}
//                   placeholder="Select source warehouse"
//                   isClearable={!currentUser?.warehouse_id}
//                   isDisabled={!!currentUser?.warehouse_id && fromWarehouseOptions.length === 1} />
//                 {currentUser?.warehouse_id && (
//                   <small className="text-muted">ℹ️ You can only transfer from your assigned warehouse</small>
//                 )}
//               </div>
//               <div className="col-lg-6">
//                 <label className="form-label">To Warehouse <span className="text-danger">*</span></label>
//                 <Select options={allWarehouses} value={formData.to_warehouse}
//                   onChange={(opt) => setField("to_warehouse", opt)}
//                   placeholder="Select destination warehouse" isClearable />
//               </div>
//             </div>

//             <div className="row mb-3">
//               <div className="col-lg-4">
//                 <label className="form-label">
//                   Transport <span className="text-danger">*</span>
//                   {transportOptions.length === 0 && <span className="spinner-border spinner-border-sm ms-2" />}
//                 </label>
//                 <Select
//                   options={transportOptions}
//                   value={formData.transport}
//                   onChange={(opt) => setField("transport", opt)}
//                   placeholder={transportOptions.length === 0 ? "Loading…" : "Select transport method"}
//                   isLoading={transportOptions.length === 0}
//                 />
//                 {/* Show which value will be used as default when nothing is explicitly chosen */}
//                 {transportOptions.length > 0 && !formData.transport && (
//                   <small className="text-muted">
//                     Defaults to <strong>{transportOptions[0]?.label}</strong> if not selected
//                   </small>
//                 )}
//               </div>
//               <div className="col-lg-4">
//                 <label className="form-label">
//                   Status
//                   {statusOptions.length === 0 && <span className="spinner-border spinner-border-sm ms-2" />}
//                 </label>
//                 <Select
//                   options={statusOptions}
//                   value={formData.status}
//                   onChange={(opt) => setField("status", opt)}
//                   placeholder={statusOptions.length === 0 ? "Loading…" : "Select status"}
//                   isLoading={statusOptions.length === 0}
//                 />
//               </div>
//               <div className="col-lg-4">
//                 <label className="form-label">Total Quantity</label>
//                 <input type="number" className="form-control bg-light" value={totalQty}
//                   readOnly disabled style={{ fontWeight: "bold", fontSize: "1.1rem" }} />
//                 <small className="text-muted">Auto-calculated</small>
//               </div>
//             </div>

//             <div className="row mb-3">
//               <div className="col-lg-6">
//                 <label className="form-label">Invoice Reference (Optional)</label>
//                 <input type="text" className="form-control" value={formData.invoice}
//                   onChange={(e) => setField("invoice", e.target.value)} placeholder="e.g. INV-2026-0042" />
//               </div>
//               <div className="col-lg-6">
//                 <label className="form-label">Description</label>
//                 <textarea className="form-control" value={formData.description}
//                   onChange={(e) => setField("description", e.target.value)} rows="2"
//                   placeholder="Notes about this transfer…" />
//               </div>
//             </div>

//             <div className="row">
//               <div className="col-lg-6">
//                 <label className="form-label"><File size={16} className="me-1" />Bill / Invoice (Optional)</label>
//                 {!billPreview ? (
//                   <div className="border border-dashed rounded p-3 text-center">
//                     <input type="file" id="billFileInput" className="d-none"
//                       accept=".pdf,.jpg,.jpeg,.png" onChange={handleBillChange} />
//                     <label htmlFor="billFileInput" className="mb-0" style={{ cursor: "pointer" }}>
//                       <Upload size={40} className="text-muted mb-2 d-block mx-auto" />
//                       <span className="text-muted">Click to upload — PDF, JPG, PNG max 5 MB</span>
//                     </label>
//                   </div>
//                 ) : (
//                   <div className="border rounded p-3 d-flex align-items-center justify-content-between">
//                     <div className="d-flex align-items-center">
//                       <File size={28} className="text-primary me-3" />
//                       <div>
//                         <p className="mb-0 fw-semibold">{billPreview.name}</p>
//                         <small className="text-muted">{billPreview.size}</small>
//                       </div>
//                     </div>
//                     <button type="button" className="btn btn-sm btn-danger" onClick={handleRemoveBill}>
//                       <X size={14} />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ── Scan Card — ALWAYS ACTIVE ── */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <div className="d-flex align-items-center mb-3">
//               <Camera size={22} className="text-primary me-2" />
//               <h5 className="mb-0">Scan Barcode</h5>
//               <span className="badge badge-success ms-2" style={{ fontSize: "0.7rem" }}>Always Active</span>
//             </div>

//             {!canSync ? (
//               <div className="alert alert-info d-flex align-items-center mb-3">
//                 <Info size={18} className="me-2 flex-shrink-0" />
//                 <div>
//                   <strong>Scanning is available now.</strong> Products will be held locally.
//                   <span className="d-block mt-1 text-muted small">
//                     Select <strong>From Warehouse</strong> and <strong>To Warehouse</strong> above to auto-save to draft.
//                   </span>
//                 </div>
//               </div>
//             ) : (
//               <div className="alert alert-success d-flex align-items-center mb-3">
//                 <Info size={18} className="me-2 flex-shrink-0" />
//                 <div>
//                   <strong>Ready to scan &amp; auto-save!</strong> Each scan is saved to draft immediately.
//                   <div className="mt-1">
//                      From: <strong>{formData.from_warehouse?.label}</strong>
//                     {!formData.transport && effectiveTransport && (
//                       <span className="ms-2 badge badge-secondary" style={{ fontSize: "0.75rem" }}>
//                         Transport: {effectiveTransport.label} (default)
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="row align-items-end">
//               <div className="col-lg-8">
//                 <label className="form-label">
//                   Scan or Enter Barcode
//                   {(isScanning || isSyncing) && <span className="spinner-border spinner-border-sm ms-2" />}
//                 </label>
//                 <input ref={barcodeRef} type="text" className="form-control"
//                   value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)}
//                   onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleScan(barcodeInput); } }}
//                   placeholder="Use scanner or type barcode then press Enter"
//                   disabled={isScanning} autoFocus />
//               </div>
//               <div className="col-lg-4">
//                 <button type="button" className="btn btn-primary w-100"
//                   onClick={() => handleScan(barcodeInput)}
//                   disabled={!barcodeInput.trim() || isScanning}>
//                   {isScanning
//                     ? <><span className="spinner-border spinner-border-sm me-2" />Scanning…</>
//                     : <><Plus size={16} className="me-1" />Add Product</>}
//                 </button>
//               </div>
//             </div>

//             {scannedProducts.length > 0 && (
//               <div className="alert alert-success d-flex align-items-center mt-3 mb-0">
//                 <Package size={18} className="me-2" />
//                 <strong>
//                   {scannedProducts.length} product(s) &nbsp;|&nbsp; Total Qty: {totalQty}
//                   {isSyncing && <span className="ms-2 text-muted small">saving…</span>}
//                   {!canSync && <span className="ms-2 text-warning small">⚠ Unsaved — select warehouses to persist</span>}
//                 </strong>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Excel Import — ALWAYS ACTIVE ── */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <div className="d-flex align-items-center mb-3">
//               {/* Inline spreadsheet-grid SVG — no external icon library needed */}
//               <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
//                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
//                 strokeLinejoin="round" style={{ color: "#198754" }} className="me-2">
//                 <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
//                 <line x1="3"  y1="9"  x2="21" y2="9"/>
//                 <line x1="3"  y1="15" x2="21" y2="15"/>
//                 <line x1="9"  y1="3"  x2="9"  y2="21"/>
//                 <line x1="15" y1="3"  x2="15" y2="21"/>
//               </svg>
//               <h5 className="mb-0">Import from Excel / CSV</h5>
//               <span className="badge badge-success ms-2" style={{ fontSize: "0.7rem" }}>Always Active</span>
//             </div>

//             <p className="text-muted small mb-3">
//               Upload a file with a <code>barcode</code> column (optional: <code>quantity_to_transfer</code> or <code>count</code>).
//               Products are validated immediately. If warehouse details are filled, the draft is saved automatically.
//             </p>

//             <div className="row align-items-end">
//               <div className="col-lg-8">
//                 <label className="form-label">Select Excel / CSV File</label>
//                 <input ref={excelInputRef} type="file" className="form-control"
//                   accept=".xlsx,.xls,.csv" onChange={(e) => setExcelFile(e.target.files[0] || null)} />
//                 {excelFile && (
//                   <small className="text-muted">
//                     Selected: {excelFile.name} ({(excelFile.size / 1024).toFixed(1)} KB)
//                   </small>
//                 )}
//               </div>
//               <div className="col-lg-4">
//                 <button type="button" className="btn btn-success w-100"
//                   onClick={handleExcelImport} disabled={!excelFile || importingExcel}>
//                   {importingExcel
//                     ? <><span className="spinner-border spinner-border-sm me-2" />Importing…</>
//                     : <><Upload size={16} className="me-1" />Import Excel</>}
//                 </button>
//               </div>
//             </div>

//             <div className="mt-2">
//               {formData.from_warehouse ? (
//                 <small className="text-muted">
//                   Need a template?{" "}`
//                   <a href="#" onClick={(e) => {
//                     e.preventDefault();
//                     const csv = "data:text/csv;charset=utf-8," +
//                       [["barcode","quantity_to_transfer"],["BARCODE001",1],["BARCODE002",2]]
//                         .map((r) => r.join(",")).join("\n");
//                     const link = document.createElement("a");
//                     link.setAttribute("href", encodeURI(csv));
//                     link.setAttribute("download",
//                       `stock_flow_template_${formData.from_warehouse.label.replace(/\s+/g, "_")}.csv`);
//                     link.click();
//                   }}>
//                     Download CSV template for {formData.from_warehouse.label}
//                   </a>
//                 </small>
//               ) : (
//                 <small className="text-muted">
//                   Select a <strong>From Warehouse</strong> above to enable template download.
//                 </small>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* Scanned Products Table */}
//         {scannedProducts.length > 0 && (
//           <div className="card mb-3">
//             <div className="card-body">
//               <div className="d-flex align-items-center justify-content-between mb-3">
//                 <h5 className="mb-0"><Package size={18} className="me-2" />Scanned Products ({scannedProducts.length})</h5>
//                 <button type="button" className="btn btn-sm btn-outline-danger"
//                   onClick={() => handleRemoveSelected(scannedProducts.map((p) => p.id))}>
//                   <Trash2 size={14} className="me-1" />Remove All
//                 </button>
//               </div>
//               <div className="table-responsive">
//                 <Table columns={columns} dataSource={scannedProducts} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Transfer Summary */}
//         {scannedProducts.length > 0 && (
//           <div className="alert alert-warning mb-3">
//             <strong>Transfer Summary</strong>
//             <ul className="mb-0 mt-2">
//               <li>Total Products: {scannedProducts.length}</li>
//               <li>Total Quantity: {totalQty} units</li>
//               {formData.from_warehouse && <li>From: {formData.from_warehouse.label}</li>}
//               {formData.to_warehouse   && <li>To: {formData.to_warehouse.label}</li>}
//               {effectiveTransport      && <li>Transport: {effectiveTransport.label}{!formData.transport ? " (default)" : ""}</li>}
//               {currentStockId          && <li>Stock ID: <strong>{currentStockId}</strong></li>}
//             </ul>
//             <small className="text-muted d-block mt-1">Inventory will be updated on submission.</small>
//           </div>
//         )}

//         {/* Submit */}
//         <div className="col-lg-12">
//           <div className="btn-addproduct mb-4">
//             <Link to="/stock-transfer" className="btn btn-cancel me-2">Cancel</Link>
//             <button type="button" className="btn btn-submit" onClick={handleSubmit}
//               disabled={submitting || scannedProducts.length === 0 || !canSync}>
//               {submitting
//                 ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
//                 : <><Send size={16} className="me-1" />Create Stock Flow</>}
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default AddStockFlow;







// import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Select from "react-select";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import {
//   ArrowLeft, ChevronUp, Camera, Plus, Package, Send,
//   Trash2, Upload, RefreshCw, AlertTriangle,
// } from "feather-icons-react/build/IconComponents";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import { setToogleHeader } from "../../core/redux/action";
// import { scanProduct } from "../../core/redux/slices/productSlice";
// import AuthService from "../../services/authService";
// import Table from "../../core/pagination/datatable";

// const MySwal = withReactContent(Swal);

// const toast = (icon, title, text, timer = 2000) =>
//   MySwal.fire({ icon, title, text, timer, showConfirmButton: false, toast: true, position: "top-end" });


// const STATUS_BADGE = {
//   good:      "badge-success",
//   faulty:     "badge-info",
//   broken: "badge-danger",
// };


// const TRANSFERABLE_STATUSES = ["good", "faulty", "broke/burnt"];

// const INITIAL_FORM = {
//   to_warehouse:  null,  
//   transport:     null,  
//   description:   "",
// };


// // const toApiProdItem = (p) => ({
// //   prod_uuid:            p.prod_uuid,
// //   partial_code:         p.partial_code,
// //   article_profile_name: p.article_profile_name,
// //   status:               p.status,
// //   count:                p.quantity_to_transfer || 1,
// // });

// const toApiProdItem = (p) => ({
//   prod_uuid:            p.prod_uuid,
//   partial_code:         p.partial_code,
//   article_profile_id:   p.article_profile_id,
//   article_profile_name: p.article_profile_name,
//   status:               p.status,
//   count:                p.quantity_to_transfer || 1,
// });

// // ─────────────────────────────────────────────────────────────────────────────
// const AddStockFlow = () => {
//   const dispatch     = useDispatch();
//   const navigate     = useNavigate();
//   const headerToggle = useSelector((s) => s.toggle_header);
//   const currentUser  = useSelector((s) => s.user?.currentUser);


//   const [transportOptions, setTransportOptions] = useState([]);


//   const [allWarehouses, setAllWarehouses] = useState([]);

//   const [formData, setFormData] = useState(INITIAL_FORM);
//   const setField = (key, val) => setFormData((p) => ({ ...p, [key]: val }));


//   const [scannedProducts, setScannedProducts]   = useState([]);
//   const scannedProductsRef                       = useRef([]);

//   const [currentStockId, setCurrentStockId]     = useState(null);

//   const [loadingDraft,  setLoadingDraft]         = useState(true);
//   const [isScanning,    setIsScanning]           = useState(false);
//   const [isSyncing,     setIsSyncing]            = useState(false);
//   const [submitting,    setSubmitting]           = useState(false);
//   const [productErrors, setProductErrors]        = useState([]);  // [{prod_uuid, errors[]}]

//   const [barcodeInput, setBarcodeInput]          = useState("");
//   const barcodeRef  = useRef(null);
//   const scanBuffer  = useRef("");
//   const lastKeyTime = useRef(0);

//   const [excelFile,      setExcelFile]      = useState(null);
//   const [importingExcel, setImportingExcel] = useState(false);
//   const excelInputRef = useRef(null);

//   // ── Derived ──────────────────────────────────────────────────────────────
//   const totalQty = useMemo(
//     () => scannedProducts.reduce((s, p) => s + (parseInt(p.quantity_to_transfer) || 0), 0),
//     [scannedProducts],
//   );


//   const canSync = !!(formData.to_warehouse && (formData.transport || transportOptions[0]));

  
//   const effectiveTransport = formData.transport || transportOptions[0] || null;


//   useEffect(() => {
//     (async () => {
//       await Promise.all([loadAllWarehouses(), loadTransportOptions()]);
//       await restoreDraft();
//     })();
//     // eslint-disable-next-line
//   }, []);

  
//   useEffect(() => {
//     if (scannedProducts.length > 0 && canSync) {
//       syncToDb(scannedProducts, formData);
//     }
//     // eslint-disable-next-line
//   }, [formData.to_warehouse, formData.transport]);

 
//   useEffect(() => {
//     const handleKey = (e) => {
//       const now = Date.now();
//       if (now - lastKeyTime.current > 80) scanBuffer.current = "";
//       lastKeyTime.current = now;

//       const tag          = e.target.tagName;
//       const isOtherInput = (tag === "INPUT" || tag === "TEXTAREA") && e.target !== barcodeRef.current;
//       if (isOtherInput) return;

//       if (e.key === "Enter" && scanBuffer.current.length >= 4) {
//         e.preventDefault();
//         const code = scanBuffer.current.trim();
//         setBarcodeInput(code);
//         handleScan(code);
//         scanBuffer.current = "";
//         return;
//       }
//       if (e.key.length === 1) scanBuffer.current += e.key;
//     };
//     window.addEventListener("keypress", handleKey);
//     return () => window.removeEventListener("keypress", handleKey);
//     // eslint-disable-next-line
//   }, [formData, scannedProducts, transportOptions]);

//   // Keep ref in sync with state (avoids stale closures in the scanner listener)
//   const setScanned = (val) => {
//     setScannedProducts((prev) => {
//       const next = typeof val === "function" ? val(prev) : val;
//       scannedProductsRef.current = next;
//       return next;
//     });
//   };


//   const loadAllWarehouses = async () => {
//     try {
//       const res  = await AuthService.getWarehouseDropdown();
//       const list = (res.data.data || res.data || []).map((w) => ({
//         value: w.wh_uuid,
//         label: w.name || w.title,
//       }));
//       setAllWarehouses(list);
//     } catch (e) {
//       console.error("loadAllWarehouses:", e);
//     }
//   };

//   const loadTransportOptions = async () => {
//     try {
//       const res     = await AuthService.getStockFlowOptions();
//       const options = res.data?.data;

//       if (!options) {
//         toast("error", "Options Error", "Failed to load transport options from server.", 5000);
//         return;
//       }

//       const toOpt = (v) =>
//         typeof v === "object" && v !== null && v.value !== undefined
//           ? v
//           : {
//               value: String(v),
//               label: String(v)
//                 .split("_")
//                 .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//                 .join(" "),
//             };

//       const transportOpts = (options.transport || []).map(toOpt);
//       setTransportOptions(transportOpts);

//       if (!transportOpts.length)
//         console.warn("Transport options are empty — check stock_flow.transport enum in DB.");
//     } catch (e) {
//       console.error("loadTransportOptions error:", e);
//       toast("error", "Options Error", `Could not load transport options: ${e.message}`, 5000);
//     }
//   };

// //restore draft
//   const restoreDraft = async () => {
//     setLoadingDraft(true);
//     try {
//       const res  = await AuthService.getExistingStock();
//       const body = res.data;
//       if (!body.is_found || !body.data) return;

//       const lot = body.data;
//       setCurrentStockId(lot.stock_id);
//       setFormData((prev) => ({ ...prev, description: lot.bulk_imp_desc || "" }));

//       if (lot.prod_arr?.length) {
//         // prod_arr from the draft is stored in the backend's own shape;
//         // map it back to our local shape.
//         const restored = lot.prod_arr.map((p) => ({
//           prod_uuid:            p.prod_uuid,
//           partial_code:         p.partial_code,
//           article_profile_name: p.article_profile_name || "—",
//           warehouse_name:       p.warehouse_name || "—",
//           count:                p.count || 0,           
//           status:               p.status,
//           quantity_to_transfer: p.count || 1,
//           // title:                p.title || p.partial_code, 
//         }));
//         setScanned(restored);

//         MySwal.fire({
//           icon: "info",
//           title: "Draft Restored",
//           html: `<p><strong>${restored.length}</strong> product(s) from your previous session.</p>
//                  <small class="text-muted">Stock ID: ${lot.stock_id}</small>`,
//           timer: 3500,
//           showConfirmButton: false,
//         });
//       }
//     } catch (err) {
//       console.warn("No draft found:", err.message);
//     } finally {
//       setLoadingDraft(false);
//     }
//   };

//   // ── syncToDb ──────────────────────────────────────────────────────────────

//   const syncToDb = useCallback(async (products, fd) => {
//     if (!fd.to_warehouse) return;
//     if (!products.length) return;

//     const transport = fd.transport || transportOptions[0] || null;
//     if (!transport) {
//       console.warn("syncToDb: no transport available — skipping sync.");
//       return;
//     }

//     setIsSyncing(true);
//     try {
//    const payload = {
//   to_wh:          fd.to_warehouse.value,
//   transportation: transport.value,
//   prod_arr:       products.map(toApiProdItem),
//    ...(fd.description?.trim() ? { description: fd.description.trim() } : {}),
 
// };


//       console.log("syncToDb payload:", payload);
//       const res = await AuthService.stockFlowSync(payload);

 
//       if (!currentStockId) {
     
//         const draftRes = await AuthService.getExistingLot();
//         if (draftRes.data?.data?.stock_id) {
//           setCurrentStockId(draftRes.data.data.stock_id);
//         }
//       }

//       console.log("Sync success:", res.data?.message);
//     } catch (err) {
//       const msg = err.response?.data?.message || "Failed to sync draft";
//       toast("error", "Sync Error", msg, 3000);
//       console.error("syncToDb error:", err.response?.data || err);
//     } finally {
//       setIsSyncing(false);
//     }
//   }, [currentStockId, transportOptions]);


//   const handleScan = useCallback(async (barcode) => {
//     const code = (barcode || "").trim();
//     if (!code) return;


//     if (scannedProductsRef.current.find((p) => p.partial_code === code)) {
//       toast("warning", "Already Scanned", `Barcode "${code}" is already in the list.`);
//       setBarcodeInput("");
//       return;
//     }
// // 
//     setIsScanning(true);
//     try {
//       // const res     = await dispatch(scanProduct(code)).unwrap();
//       // const product = res.data;

//       const product = await dispatch(scanProduct(code)).unwrap();

//       if (!product?.prod_uuid) throw new Error("Product not found");

//       // The scan API must return at minimum: prod_uuid, partial_code, status,
//       // article_profile_name, warehouse_id (for validation), count (available).
//       if (!product?.prod_uuid) throw new Error(product.message || "Product not found");

//       // Validate product is from the user's own warehouse (server also checks this,
//       // but we surface it early for a better UX).
//       if (currentUser?.warehouse_id && product.warehouse_id !== currentUser.warehouse_id) {
//         MySwal.fire({
//           icon: "error",
//           title: "Wrong Warehouse",
//           text: `This product belongs to "${product.warehouse_name}", not your assigned warehouse.`,
//         });
//         setBarcodeInput("");
//         return;
//       }

//       // Validate transferable status
//       if (!TRANSFERABLE_STATUSES.includes(product.status)) {
//         MySwal.fire({
//           icon: "error",
//           title: "Invalid Status",
//           text: `"${product.title || code}" has status "${product.status}". Only ${TRANSFERABLE_STATUSES.join(", ")} can be transferred.`,
//         });
//         setBarcodeInput("");
//         return;
//       }

//       const newProd = {
//         prod_uuid:            product.prod_uuid,
//         partial_code:         product.partial_code || product.barcode || code,
//         article_profile_id:   product.article_profile_id,
//         article_profile_name: product.article_profile_name,
//         warehouse_name:       product.warehouse_name || "—",
//         count:                product.count || 0,       // available in warehouse
//         status:               product.status,
//         quantity_to_transfer: 1,
//         // title:                product.title || code,    // display only
//       };

//       const updated = [...scannedProductsRef.current, newProd];
//       setScanned(updated);
//       setBarcodeInput("");

//       if (canSync) {
//         await syncToDb(updated, formData);
//         toast("success", "Scanned & Saved", newProd.title);
//       } else {
//         toast("info", "Scanned (Local)", `"${newProd.title}" added. Select To Warehouse to save draft.`);
//       }
//     } catch (err) {
//       const msg = err.response?.data?.message || err.message || "Product not found";
//       MySwal.fire({ icon: "error", title: "Not Found", text: msg });
//     } finally {
//       setIsScanning(false);
//       barcodeRef.current?.focus();
//     }
//     // eslint-disable-next-line
//   }, [dispatch, formData, canSync, syncToDb, currentUser]);

//   // ── Remove single product ─────────────────────────────────────────────────
//   const handleRemoveProduct = useCallback((prod_uuid, partial_code) => {
//     MySwal.fire({
//       title: "Remove Product?",
//       text: "This will remove it from your draft.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Remove",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       try {
//         if (currentStockId) {
//           // removeLotProduct expects the barcode / partial_code identifier
//           const res = await AuthService.removeLotProduct(partial_code);
//           setScanned((prev) => prev.filter((p) => p.prod_uuid !== prod_uuid));
//           if (res.data?.draft_deleted) {
//             setCurrentStockId(null);
//             toast("info", "Draft Cleared", "Last product removed. Draft deleted.");
//           } else {
//             toast("success", "Removed", `"${partial_code}" removed.`);
//           }
//         } else {
//           setScanned((prev) => prev.filter((p) => p.prod_uuid !== prod_uuid));
//           toast("success", "Removed", `"${partial_code}" removed.`);
//         }
//       } catch (err) {
//         toast("error", "Error", err.response?.data?.message || "Failed to remove.", 3000);
//       }
//     });
//   }, [currentStockId]);

//   // ── Remove all selected ───────────────────────────────────────────────────
//   const handleRemoveSelected = useCallback((selectedUuids) => {
//     MySwal.fire({
//       title: `Remove ${selectedUuids.length} product(s)?`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Remove All",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       const toRemove = scannedProducts.filter((p) => selectedUuids.includes(p.prod_uuid));
//       if (currentStockId) {
//         for (const p of toRemove) {
//           try { await AuthService.removeLotProduct(p.partial_code); } catch { /* continue */ }
//         }
//       }
//       const remaining = scannedProducts.filter((p) => !selectedUuids.includes(p.prod_uuid));
//       setScanned(remaining);
//       if (remaining.length === 0) setCurrentStockId(null);
//       toast("success", "Removed", `${toRemove.length} product(s) removed.`);
//     });
//   }, [scannedProducts, currentStockId]);

//   // ── Discard entire draft ──────────────────────────────────────────────────
//   const handleDiscardDraft = () => {
//     MySwal.fire({
//       title: "Discard entire draft?",
//       text: "All scanned products will be removed.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Yes, discard",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       try {
//         if (currentStockId) await AuthService.discardDraft();
//         setScanned([]);
//         setCurrentStockId(null);
//         toast("info", "Draft Discarded", "All products cleared.");
//       } catch (err) {
//         toast("error", "Error", err.response?.data?.message || "Failed to discard.", 3000);
//       }
//     });
//   };

//   // ── Quantity change ───────────────────────────────────────────────────────
//   const handleQtyChange = useCallback((prod_uuid, newQty) => {
//     setScanned((prev) =>
//       prev.map((p) => {
//         if (p.prod_uuid !== prod_uuid) return p;
//         const qty = parseInt(newQty) || 0;
//         if (qty > p.count) {
//           toast("warning", "Insufficient Stock", `Only ${p.count} units available.`);
//           return p;
//         }
//         return { ...p, quantity_to_transfer: qty };
//       }),
//     );
//   }, []);

//   // ── Excel import ──────────────────────────────────────────────────────────
//   const handleExcelImport = async () => {
//     if (!excelFile) return;
//     setImportingExcel(true);
//     try {
//       const fd = new FormData();
//       fd.append("excel_file", excelFile);
//       if (formData.to_warehouse)  fd.append("to_wh",          formData.to_warehouse.value);
//       if (effectiveTransport)     fd.append("transportation",  effectiveTransport.value);
//       if (formData.description)   fd.append("description",     formData.description);

//       const res  = await AuthService.importStockFlowFromExcel(fd);
//       const data = res.data;

//       if (data.data?.stock_id) setCurrentStockId(data.data.stock_id);

//       if (!data.data?.draft_saved && data.data?.products?.length) {
//         const localProds = data.data.products.map((p) => ({
//           prod_uuid:            p.prod_uuid,
//           partial_code:         p.partial_code || p.barcode,
//           article_profile_id: p.article_profile_id || "—",
//           article_profile_name: p.article_profile_name || "—",
//           warehouse_name:       p.warehouse_name || "—",
//           count:                p.count || 1,
//           status:               p.status,
//           quantity_to_transfer: p.count || 1,
//           // title:                p.title || p.partial_code || p.barcode,
//         }));
//         setScanned((prev) => {
//           const existing = new Set(prev.map((x) => x.prod_uuid));
//           return [...prev, ...localProds.filter((x) => !existing.has(x.prod_uuid))];
//         });
//       } else {
//         await restoreDraft();
//       }

//       setExcelFile(null);
//       if (excelInputRef.current) excelInputRef.current.value = "";

//       const errorLines = (data.data?.error_details || [])
//         .map((e) => `<li><code>${e.barcode || e.partial_code}</code>: ${e.error}</li>`)
//         .join("");

//       MySwal.fire({
//         icon: data.data?.errors > 0 ? "warning" : "success",
//         title: data.message,
//         html: `
//           <p>Added: <strong>${data.data?.added || 0}</strong></p>
//           <p>Skipped: <strong>${data.data?.skipped || 0}</strong></p>
//           ${data.data?.errors > 0
//             ? `<p>Errors: <strong>${data.data.errors}</strong></p><ul class="text-start">${errorLines}</ul>`
//             : ""}
//           ${!data.data?.draft_saved
//             ? `<p class="text-warning mt-2 small">Select To Warehouse to persist draft.</p>`
//             : ""}
//         `,
//       });
//     } catch (err) {
//       MySwal.fire({
//         icon: "error",
//         title: "Import Failed",
//         text: err.response?.data?.message || "Import failed.",
//       });
//     } finally {
//       setImportingExcel(false);
//     }
//   };


//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setProductErrors([]);

//     if (!scannedProducts.length) {
//       toast("warning", "No Products", "Scan at least one product."); return;
//     }
//     if (!formData.to_warehouse) {
//       toast("warning", "Missing", "To Warehouse is required."); return;
//     }
//     if (!effectiveTransport) {
//       toast("warning", "Missing", "No transport options available yet."); return;
//     }
//     if (scannedProducts.some((p) => p.quantity_to_transfer <= 0)) {
//       toast("warning", "Invalid Qty", "All quantities must be greater than 0."); return;
//     }

//     // Ensure the draft is up to date before submitting
//     await syncToDb(scannedProducts, formData);

//     setSubmitting(true);
//     try {
//       // stockFlowSubmit sends no body — server reads draft by req.user.uuid
//       const res  = await AuthService.stockFlowSubmit();
//       const body = res.data;

//       // Backend returns { success: false, data: mistake_prods, message }
//       // when some products have inventory issues.
//       if (!body.success) {
//         // mistake_prods: [{ prod_uuid, status, count }]
//         const errProds = body.data || [];
//         if (errProds.length) {
//           // Map prod_uuid back to partial_code for display
//           const errorList = errProds.map((ep) => {
//             const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
//             return {
//               prod_uuid:    ep.prod_uuid,
//               partial_code: local?.partial_code || ep.prod_uuid,
//               title:        local?.title        || ep.prod_uuid,
//               errors:       [`Requested ${ep.count} but insufficient stock or status mismatch (${ep.status})`],
//             };
//           });
//           setProductErrors(errorList);
//           MySwal.fire({
//             icon: "error",
//             title: "Submission Failed",
//             html: `<p>${body.message}</p><p class="text-muted small">Inconsistent products are highlighted below.</p>`,
//           });
//           return;
//         }
//         throw new Error(body.message || "Submission failed.");
//       }

//       // Success: body.success === true
//       MySwal.fire({
//         icon: "success",
//         title: "Stock Flow Created!",
//         html: `
//           <p><strong>Stock ID:</strong> ${currentStockId || "—"}</p>
//           <p><strong>Products:</strong> ${scannedProducts.length}</p>
//           <p><strong>Total Quantity:</strong> ${totalQty}</p>
//           ${formData.to_warehouse ? `<p><strong>To:</strong> ${formData.to_warehouse.label}</p>` : ""}
//           <p class="text-muted small">Status set to <strong>in-transit</strong></p>
//         `,
//         confirmButtonText: "View Stock Flows",
//       }).then(() => navigate("/stock-transfer"));
//     } catch (err) {
//       const msg = err.response?.data?.message || err.message || "Failed to create stock flow.";
//       const errProds = err.response?.data?.data || [];
//       if (errProds.length) {
//         const errorList = errProds.map((ep) => {
//           const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
//           return {
//             prod_uuid:    ep.prod_uuid,
//             partial_code: local?.partial_code || ep.prod_uuid,
//             title:        local?.title        || ep.prod_uuid,
//             errors:       [`Count ${ep.count}, status ${ep.status} — inventory mismatch`],
//           };
//         });
//         setProductErrors(errorList);
//       }
//       MySwal.fire({ icon: "error", title: "Error", text: msg });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── Table columns ─────────────────────────────────────────────────────────
//   const columns = useMemo(() => {
//     // Build a lookup from prod_uuid → error messages
//     const errorMap = Object.fromEntries(
//       productErrors.map((e) => [e.prod_uuid, e.errors])
//     );

//     return [
//       {
//         title: "#",
//         render: (_, __, i) => i + 1,
//         width: "50px",
//       },
//       {
//         title: "Barcode / Code",
//         dataIndex: "partial_code",
//         render: (text, record) => (
//           <span>
//             <span className="badge badge-primary">{text}</span>
//             {errorMap[record.prod_uuid] && (
//               <div className="mt-1">
//                 {errorMap[record.prod_uuid].map((err, i) => (
//                   <div key={i} className="text-danger small">
//                     <AlertTriangle size={12} className="me-1" />{err}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </span>
//         ),
//       },
//       {
//         title: "Product Name",
//         dataIndex: "title",
//       },
//       {
//         title: "Article Profile",
//         dataIndex: "article_profile_name",
//       },
//       {
//         title: "Warehouse",
//         dataIndex: "warehouse_name",
//       },
//       {
//         title: "Status",
//         dataIndex: "status",
//         render: (t) => (
//           <span className={`badge ${STATUS_BADGE[t] || "badge-info"}`}>
//             {t?.toUpperCase() || "N/A"}
//           </span>
//         ),
//       },
//       {
//         title: "Available",
//         dataIndex: "count",
//         render: (t) => <span className="badge badge-info">{t}</span>,
//       },
//       {
//         title: "Transfer Qty",
//         dataIndex: "quantity_to_transfer",
//         render: (text, record) => (
//           <input
//             type="number"
//             className="form-control form-control-sm"
//             style={{ width: "80px" }}
//             value={text}
//             min="1"
//             max={record.count}
//             onChange={(e) => handleQtyChange(record.prod_uuid, e.target.value)}
//           />
//         ),
//       },
//       {
//         title: "Action",
//         width: "80px",
//         render: (_, record) => (
//           <button
//             type="button"
//             className="btn btn-sm btn-danger"
//             onClick={() => handleRemoveProduct(record.prod_uuid, record.partial_code)}
//             title="Remove"
//           >
//             <Trash2 size={14} />
//           </button>
//         ),
//       },
//     ];
//   }, [productErrors, handleQtyChange, handleRemoveProduct]);

//   // ── Render ────────────────────────────────────────────────────────────────
//   return (
//     <div className="page-wrapper">
//       <div className="content">

//         {/* ── Page Header ── */}
//         <div className="page-header">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>Create Stock Flow</h4>
//               <h6>Scan or import products to create a stock transfer</h6>
//             </div>
//           </div>
//           <ul className="table-top-head">
//             <li>
//               <Link to="/stock-transfer" className="btn btn-secondary btn-sm">
//                 <ArrowLeft size={16} className="me-1" />Back
//               </Link>
//             </li>
//             <li>
//               <OverlayTrigger placement="top" overlay={<Tooltip>Collapse</Tooltip>}>
//                 <Link
//                   id="collapse-header"
//                   className={headerToggle ? "active" : ""}
//                   onClick={() => dispatch(setToogleHeader(!headerToggle))}
//                 >
//                   <ChevronUp className="feather-chevron-up" />
//                 </Link>
//               </OverlayTrigger>
//             </li>
//           </ul>
//         </div>

//         {/* Draft loading indicator */}
//         {loadingDraft && (
//           <div className="alert alert-light d-flex align-items-center mb-3">
//             <span className="spinner-border spinner-border-sm me-2" />
//             Checking for saved draft…
//           </div>
//         )}

//         {/* Active draft banner */}
//         {!loadingDraft && currentStockId && (
//           <div className="alert alert-warning d-flex align-items-center justify-content-between mb-3">
//             <div className="d-flex align-items-center">
//               <RefreshCw size={16} className="me-2" />
//               <strong>Active Draft:</strong>
//               <span className="ms-2 badge badge-warning">{currentStockId}</span>
//               {isSyncing && (
//                 <span className="spinner-border spinner-border-sm ms-2 text-muted" />
//               )}
//             </div>
//             {scannedProducts.length > 0 && (
//               <button
//                 type="button"
//                 className="btn btn-sm btn-outline-danger"
//                 onClick={handleDiscardDraft}
//               >
//                 <Trash2 size={14} className="me-1" />Discard Draft
//               </button>
//             )}
//           </div>
//         )}

//         {/* Product errors (returned from submit) */}
//         {productErrors.length > 0 && (
//           <div className="alert alert-danger mb-3">
//             <h6 className="mb-2">
//               <AlertTriangle size={16} className="me-2" />
//               {productErrors.length} product(s) failed validation — correct them and resubmit.
//             </h6>
//             <ul className="mb-0">
//               {productErrors.map((e, i) => (
//                 <li key={i}>
//                   <strong>{e.title || e.partial_code}</strong> ({e.partial_code}):{" "}
//                   {e.errors.join("; ")}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* ── Stock Flow Details ── */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <h5 className="mb-4">Stock Flow Details</h5>

//             {/* From Warehouse — read-only, sourced from session */}
//             {currentUser?.warehouse_name && (
//               <div className="row mb-3">
//                 <div className="col-lg-6">
//                   <label className="form-label">From Warehouse</label>
//                   <input
//                     type="text"
//                     className="form-control bg-light"
//                     value={currentUser.warehouse_name}
//                     readOnly
//                     disabled
//                   />
//                   <small className="text-muted">
//                     Your assigned warehouse (set by your account)
//                   </small>
//                 </div>
//               </div>
//             )}

//             <div className="row mb-3">
//               {/* To Warehouse */}
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   To Warehouse <span className="text-danger">*</span>
//                 </label>
//                 <Select
//                   options={allWarehouses}
//                   value={formData.to_warehouse}
//                   onChange={(opt) => setField("to_warehouse", opt)}
//                   placeholder="Select destination warehouse"
//                   isClearable
//                 />
//               </div>

//               {/* Transport */}
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   Transport <span className="text-danger">*</span>
//                   {transportOptions.length === 0 && (
//                     <span className="spinner-border spinner-border-sm ms-2" />
//                   )}
//                 </label>
//                 <Select
//                   options={transportOptions}
//                   value={formData.transport}
//                   onChange={(opt) => setField("transport", opt)}
//                   placeholder={
//                     transportOptions.length === 0 ? "Loading…" : "Select transport method"
//                   }
//                   isLoading={transportOptions.length === 0}
//                 />
//                 {transportOptions.length > 0 && !formData.transport && (
//                   <small className="text-muted">
//                     Defaults to <strong>{transportOptions[0]?.label}</strong> if not selected
//                   </small>
//                 )}
//               </div>
//             </div>

//             <div className="row mb-3">
//               {/* Description */}
//               <div className="col-lg-6">
//                 <label className="form-label">Description</label>
//                 <textarea
//                   className="form-control"
//                   value={formData.description || ""}
//                   onChange={(e) => setField("description", e.target.value)}
//                   rows="2"
//                   placeholder="Notes about this transfer…"
//                 />
//               </div>

//               {/* Total Qty — auto-calculated */}
//               <div className="col-lg-6">
//                 <label className="form-label">Total Quantity</label>
//                 <input
//                   type="number"
//                   className="form-control bg-light"
//                   value={totalQty}
//                   readOnly
//                   disabled
//                   style={{ fontWeight: "bold", fontSize: "1.1rem" }}
//                 />
//                 <small className="text-muted">Auto-calculated from scanned products</small>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ── Scan Barcode — always active ── */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <div className="d-flex align-items-center mb-3">
//               <Camera size={22} className="text-primary me-2" />
//               <h5 className="mb-0">Scan Barcode</h5>
//               <span className="badge badge-success ms-2" style={{ fontSize: "0.7rem" }}>
//                 Always Active
//               </span>
//             </div>

//             {!canSync ? (
//               <div className="alert alert-info d-flex align-items-center mb-3">
//                 <span className="me-2 flex-shrink-0">ℹ</span>
//                 <div>
//                   <strong>Scanning is available now.</strong> Products will be held locally.
//                   <span className="d-block mt-1 text-muted small">
//                     Select a <strong>To Warehouse</strong> above to auto-save each scan to draft.
//                   </span>
//                 </div>
//               </div>
//             ) : (
//               <div className="alert alert-success d-flex align-items-center mb-3">
//                 <span className="me-2 flex-shrink-0">✓</span>
//                 <div>
//                   <strong>Ready to scan &amp; auto-save!</strong> Each scan is saved to draft.
//                   <div className="mt-1">
//                     To: <strong>{formData.to_warehouse?.label}</strong>
//                     {!formData.transport && effectiveTransport && (
//                       <span className="ms-2 badge badge-secondary" style={{ fontSize: "0.75rem" }}>
//                         Transport: {effectiveTransport.label} (default)
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="row align-items-end">
//               <div className="col-lg-8">
//                 <label className="form-label">
//                   Scan or Enter Barcode
//                   {(isScanning || isSyncing) && (
//                     <span className="spinner-border spinner-border-sm ms-2" />
//                   )}
//                 </label>
//                 <input
//                   ref={barcodeRef}
//                   type="text"
//                   className="form-control"
//                   value={barcodeInput}
//                   onChange={(e) => setBarcodeInput(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") { e.preventDefault(); handleScan(barcodeInput); }
//                   }}
//                   placeholder="Use scanner or type barcode then press Enter"
//                   disabled={isScanning}
//                   autoFocus
//                 />
//               </div>
//               <div className="col-lg-4">
//                 <button
//                   type="button"
//                   className="btn btn-primary w-100"
//                   onClick={() => handleScan(barcodeInput)}
//                   disabled={!barcodeInput.trim() || isScanning}
//                 >
//                   {isScanning ? (
//                     <><span className="spinner-border spinner-border-sm me-2" />Scanning…</>
//                   ) : (
//                     <><Plus size={16} className="me-1" />Add Product</>
//                   )}
//                 </button>
//               </div>
//             </div>

//             {scannedProducts.length > 0 && (
//               <div className="alert alert-success d-flex align-items-center mt-3 mb-0">
//                 <Package size={18} className="me-2" />
//                 <strong>
//                   {scannedProducts.length} product(s) &nbsp;|&nbsp; Total Qty: {totalQty}
//                   {isSyncing && (
//                     <span className="ms-2 text-muted small">saving…</span>
//                   )}
//                   {!canSync && (
//                     <span className="ms-2 text-warning small">
//                       ⚠ Unsaved — select To Warehouse to persist
//                     </span>
//                   )}
//                 </strong>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Excel Import — always active ── */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <div className="d-flex align-items-center mb-3">
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="22" height="22"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 style={{ color: "#198754" }}
//                 className="me-2"
//               >
//                 <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
//                 <line x1="3"  y1="9"  x2="21" y2="9"/>
//                 <line x1="3"  y1="15" x2="21" y2="15"/>
//                 <line x1="9"  y1="3"  x2="9"  y2="21"/>
//                 <line x1="15" y1="3"  x2="15" y2="21"/>
//               </svg>
//               <h5 className="mb-0">Import from Excel / CSV</h5>
//               <span className="badge badge-success ms-2" style={{ fontSize: "0.7rem" }}>
//                 Always Active
//               </span>
//             </div>

//             <p className="text-muted small mb-3">
//               Upload a file with a <code>barcode</code> column (optional:{" "}
//               <code>quantity_to_transfer</code> or <code>count</code>). Products are validated
//               immediately. If <strong>To Warehouse</strong> is selected, the draft is saved
//               automatically.
//             </p>

//             <div className="row align-items-end">
//               <div className="col-lg-8">
//                 <label className="form-label">Select Excel / CSV File</label>
//                 <input
//                   ref={excelInputRef}
//                   type="file"
//                   className="form-control"
//                   accept=".xlsx,.xls,.csv"
//                   onChange={(e) => setExcelFile(e.target.files[0] || null)}
//                 />
//                 {excelFile && (
//                   <small className="text-muted">
//                     Selected: {excelFile.name} ({(excelFile.size / 1024).toFixed(1)} KB)
//                   </small>
//                 )}
//               </div>
//               <div className="col-lg-4">
//                 <button
//                   type="button"
//                   className="btn btn-success w-100"
//                   onClick={handleExcelImport}
//                   disabled={!excelFile || importingExcel}
//                 >
//                   {importingExcel ? (
//                     <><span className="spinner-border spinner-border-sm me-2" />Importing…</>
//                   ) : (
//                     <><Upload size={16} className="me-1" />Import Excel</>
//                   )}
//                 </button>
//               </div>
//             </div>

//             {/* CSV template download */}
//             <div className="mt-2">
//               <small className="text-muted">
//                 Need a template?{" "}
//                 <a
//                   href="#"
//                   onClick={(e) => {
//                     e.preventDefault();
//                     const csv =
//                       "data:text/csv;charset=utf-8," +
//                       [
//                         ["barcode", "quantity_to_transfer"],
//                         ["BARCODE001", 1],
//                         ["BARCODE002", 2],
//                       ]
//                         .map((r) => r.join(","))
//                         .join("\n");
//                     const link = document.createElement("a");
//                     link.setAttribute("href", encodeURI(csv));
//                     link.setAttribute("download", "stock_flow_template.csv");
//                     link.click();
//                   }}
//                 >
//                   Download CSV template
//                 </a>
//               </small>
//             </div>
//           </div>
//         </div>
// {/* */}
//         {/* ── Scanned Products Table ── */}
//         {scannedProducts.length > 0 && (
//           <div className="card mb-3">
//             <div className="card-body">
//               <div className="d-flex align-items-center justify-content-between mb-3">
//                 <h5 className="mb-0">
//                   <Package size={18} className="me-2" />
//                   Scanned Products ({scannedProducts.length})
//                 </h5>
//                 <button
//                   type="button"
//                   className="btn btn-sm btn-outline-danger"
//                   onClick={() => handleRemoveSelected(scannedProducts.map((p) => p.prod_uuid))}
//                 >
//                   <Trash2 size={14} className="me-1" />Remove All
//                 </button>
//               </div>
//               <div className="table-responsive">
//                 <Table columns={columns} dataSource={scannedProducts} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Transfer Summary ── */}
//         {scannedProducts.length > 0 && (
//           <div className="alert alert-warning mb-3">
//             <strong>Transfer Summary</strong>
//             <ul className="mb-0 mt-2">
//               <li>Total Products: {scannedProducts.length}</li>
//               <li>Total Quantity: {totalQty} units</li>
//               {currentUser?.warehouse_name && (
//                 <li>From: {currentUser.warehouse_name}</li>
//               )}
//               {formData.to_warehouse && (
//                 <li>To: {formData.to_warehouse.label}</li>
//               )}
//               {effectiveTransport && (
//                 <li>
//                   Transport: {effectiveTransport.label}
//                   {!formData.transport ? " (default)" : ""}
//                 </li>
//               )}
//               {/* Status is always 'approved' on draft; 'in-transit' after submit */}
//               <li>
//                 Status after submit: <strong>in-transit</strong>
//               </li>
//               {currentStockId && (
//                 <li>
//                   Draft Stock ID: <strong>{currentStockId}</strong>
//                 </li>
//               )}
//             </ul>
//             <small className="text-muted d-block mt-1">
//               Inventory will be updated on submission.
//             </small>
//           </div>
//         )}

//         {/* ── Submit / Cancel ── */}
//         <div className="col-lg-12">
//           <div className="btn-addproduct mb-4">
//             <Link to="/stock-transfer" className="btn btn-cancel me-2">
//               Cancel
//             </Link>
//             <button
//               type="button"
//               className="btn btn-submit"
//               onClick={handleSubmit}
//               disabled={submitting || scannedProducts.length === 0 || !canSync}
//             >
//               {submitting ? (
//                 <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
//               ) : (
//                 <><Send size={16} className="me-1" />Create Stock Flow</>
//               )}
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default AddStockFlow;




// import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Select from "react-select";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import {
//   ArrowLeft, ChevronUp, Camera, Plus, Package, Send,
//   Trash2, Upload, RefreshCw, AlertTriangle, File, X,
// } from "feather-icons-react/build/IconComponents";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import { setToogleHeader } from "../../core/redux/action";
// import { scanProduct } from "../../core/redux/slices/productSlice";
// import AuthService from "../../services/authService";
// import Table from "../../core/pagination/datatable";

// const MySwal = withReactContent(Swal);

// const toast = (icon, title, text, timer = 2000) =>
//   MySwal.fire({ icon, title, text, timer, showConfirmButton: false, toast: true, position: "top-end" });

// const STATUS_BADGE = {
//   good:    "badge-success",
//   faulty:  "badge-info",
//   broken:  "badge-danger",
// };

// const TRANSFERABLE_STATUSES = ["good", "faulty", "broke/burnt"];

// const INITIAL_FORM = {
//   to_warehouse: null,
//   transport:    null,
//   description:  "",
// };

// // ── toApiProdItem ─────────────────────────────────────────────────────────────
// const toApiProdItem = (p) => ({
//   prod_uuid:            p.prod_uuid,
//   partial_code:         p.partial_code,
//   article_profile_id:   p.article_profile_id,
//   article_profile_name: p.article_profile_name,
//   status:               p.status,
//   count:                p.quantity_to_transfer || 1,
// });

// // =============================================================================
// const AddStockFlow = () => {
//   const dispatch     = useDispatch();
//   const navigate     = useNavigate();
//   const headerToggle = useSelector((s) => s.toggle_header);
//   const currentUser  = useSelector((s) => s.user?.currentUser);

//   const [transportOptions, setTransportOptions] = useState([]);
//   const [allWarehouses,    setAllWarehouses]    = useState([]);

//   const [formData, setFormData] = useState(INITIAL_FORM);
//   const setField = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

//   const [scannedProducts, setScannedProducts] = useState([]);
//   const scannedProductsRef                    = useRef([]);

//   const [currentStockId, setCurrentStockId] = useState(null);

//   const [loadingDraft,  setLoadingDraft]  = useState(true);
//   const [isScanning,    setIsScanning]    = useState(false);
//   const [isSyncing,     setIsSyncing]     = useState(false);
//   const [submitting,    setSubmitting]    = useState(false);
//   const [productErrors, setProductErrors] = useState([]);

//   const [barcodeInput, setBarcodeInput] = useState("");
//   const barcodeRef  = useRef(null);
//   const scanBuffer  = useRef("");
//   const lastKeyTime = useRef(0);

//   // const [excelFile,      setExcelFile]      = useState(null);
//   // const [importingExcel, setImportingExcel] = useState(false);
//   // const excelInputRef = useRef(null);

//   // ── Bill / invoice file (restored) ───────────────────────────────────────
//   const [billPreview, setBillPreview] = useState(null);
//   const billFileRef = useRef(null);

//   // ── Derived ──────────────────────────────────────────────────────────────
//   const totalQty = useMemo(
//     () => scannedProducts.reduce((s, p) => s + (parseInt(p.quantity_to_transfer) || 0), 0),
//     [scannedProducts],
//   );

//   const canSync          = !!(formData.to_warehouse && (formData.transport || transportOptions[0]));
//   const effectiveTransport = formData.transport || transportOptions[0] || null;

//  useEffect(() => {
//     (async () => {
//       await Promise.all([loadAllWarehouses(), loadTransportOptions()]);
//       await restoreDraft();
//     })();
//     // eslint-disable-next-line
//   }, []);


//   // Re-sync when routing fields change and we already have products
//   useEffect(() => {
//     if (scannedProducts.length > 0 && canSync) {
//       syncToDb(scannedProducts, formData);
//     }
//     // eslint-disable-next-line
//   }, [formData.to_warehouse, formData.transport]);

//   // Hardware barcode scanner listener
//   useEffect(() => {
//     const handleKey = (e) => {
//       const now = Date.now();
//       if (now - lastKeyTime.current > 80) scanBuffer.current = "";
//       lastKeyTime.current = now;

//       const tag          = e.target.tagName;
//       const isOtherInput = (tag === "INPUT" || tag === "TEXTAREA") && e.target !== barcodeRef.current;
//       if (isOtherInput) return;

//       if (e.key === "Enter" && scanBuffer.current.length >= 4) {
//         e.preventDefault();
//         const code = scanBuffer.current.trim();
//         setBarcodeInput(code);
//         handleScan(code);
//         scanBuffer.current = "";
//         return;
//       }
//       if (e.key.length === 1) scanBuffer.current += e.key;
//     };
//     window.addEventListener("keypress", handleKey);
//     return () => window.removeEventListener("keypress", handleKey);
//     // eslint-disable-next-line
//   }, [formData, scannedProducts, transportOptions]);


//   const setScanned = (val) => {
//     setScannedProducts((prev) => {
//       const next = typeof val === "function" ? val(prev) : val;
//       scannedProductsRef.current = next;
//       return next;
//     });
//   };

//   // ── Loaders ───────────────────────────────────────────────────────────────
//   const loadAllWarehouses = async () => {
//     try {
//       const res  = await AuthService.getWarehouseDropdown();
//       const list = (res.data.data || res.data || []).map((w) => ({
//         value: w.wh_uuid,
//         label: w.name || w.title,
//       }));
//       setAllWarehouses(list);
//     } catch (e) {
//       console.error("loadAllWarehouses:", e);
//     }
//   };

//   const loadTransportOptions = async () => {
//     try {
//       const res     = await AuthService.getStockFlowOptions();
//       const options = res.data?.data;
//       if (!options) {
//         toast("error", "Options Error", "Failed to load transport options from server.", 5000);
//         return;
//       }
//       const toOpt = (v) =>
//         typeof v === "object" && v !== null && v.value !== undefined
//           ? v
//           : {
//               value: String(v),
//               label: String(v)
//                 .split("_")
//                 .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//                 .join(" "),
//             };
//       const transportOpts = (options.transport || []).map(toOpt);
//       setTransportOptions(transportOpts);
//       if (!transportOpts.length)
//         console.warn("Transport options empty — check stock_flow.transport enum in DB.");
//     } catch (e) {
//       console.error("loadTransportOptions error:", e);
//       toast("error", "Options Error", `Could not load transport options: ${e.message}`, 5000);
//     }
//   };

//   // ── Restore draft ─────────────────────────────────────────────────────────
//   const restoreDraft = async () => {
//     setLoadingDraft(true);
//     try {
//       const res  = await AuthService.getExistingStock();
//       const body = res.data;
//       if (!body.is_found || !body.data) return;

//       const lot = body.data;
//       setCurrentStockId(lot.stock_id);
//       setFormData((prev) => ({ ...prev, description: lot.bulk_imp_desc || "" }));

//       if (lot.prod_arr?.length) {
//         const restored = lot.prod_arr.map((p) => ({
//           prod_uuid:            p.prod_uuid,
//           partial_code:         p.partial_code,
//           article_profile_id:   p.article_profile_id,
//           article_profile_name: p.article_profile_name || "—",
//           warehouse_name:       p.warehouse_name || "—",
//           count:                p.count || 0,
//           status:               p.status,
//           quantity_to_transfer: p.count || 1,
//         }));
//         setScanned(restored);
//         MySwal.fire({
//           icon: "info",
//           title: "Draft Restored",
//           html: `<p><strong>${restored.length}</strong> product(s) from your previous session.</p>
//                  <small class="text-muted">Stock ID: ${lot.stock_id}</small>`,
//           timer: 3500,
//           showConfirmButton: false,
//         });
//       }
//     } catch (err) {
//       console.warn("No draft found:", err.message);
//     } finally {
//       setLoadingDraft(false);
//     }
//   };

//   // ── syncToDb ──────────────────────────────────────────────────────────────

//   const syncToDb = useCallback(async (products, fd) => {
//     if (!fd.to_warehouse) return;
//     if (!products.length) return;

//     const transport = fd.transport || transportOptions[0] || null;
//     if (!transport) {
//       console.warn("syncToDb: no transport available — skipping.");
//       return;
//     }

//     setIsSyncing(true);
//     try {
//       const payload = {
//         to_wh:          fd.to_warehouse.value,
//         transportation: transport.value,
//         prod_arr:       products.map(toApiProdItem),
        
//         description:    fd.description || undefined,
//         // description:    typeof fd.description === "string" ? fd.description : "",
//       };

//       console.log("syncToDb payload:", payload);
//       const res = await AuthService.stockFlowSync(payload);

//       // If we don't have a stock_id yet, try to get it from the sync response
//       // or fall back to a fresh draft fetch.
//       const syncedId = res.data?.data?.stock_id;
//       if (syncedId) {
//         setCurrentStockId(syncedId);
//       } else if (!currentStockId) {
//         try {
//           const draftRes = await AuthService.getExistingStock();
//           if (draftRes.data?.data?.stock_id) {
//             setCurrentStockId(draftRes.data.data.stock_id);
//           }
//         } catch { /* draft may not exist yet */ }
//       }

//       console.log("Sync success:", res.data?.message);
//     } catch (err) {
//       const msg = err.response?.data?.message || "Failed to sync draft";
//       toast("error", "Sync Error", msg, 3000);
//       console.error("syncToDb error:", err.response?.data || err);
//     } finally {
//       setIsSyncing(false);
//     }
//   }, [currentStockId, transportOptions]);

//   // ── handleScan ────────────────────────────────────────────────────────────
//   // FIX: scanProduct thunk returns response.data from AuthService.scanProduct.
//   // If your API shape is { success, data: { prod_uuid, ... } } then unwrap()
//   // gives you that whole object and you need res.data. If your thunk already
//   // returns response.data.data (the product directly), then product = unwrap().
//   // Adjust the line marked ★ to match your productSlice's return value.
//   const handleScan = useCallback(async (barcode) => {
//     const code = (barcode || "").trim();
//     if (!code) return;

//     if (scannedProductsRef.current.find((p) => p.partial_code === code)) {
//       toast("warning", "Already Scanned", `Barcode "${code}" is already in the list.`);
//       setBarcodeInput("");
//       return;
//     }

//     setIsScanning(true);
//     try {
//       // ★ unwrap() returns whatever the thunk resolves with.
//       // If scanProduct thunk does `return response.data` and your API returns
//       // { success, data: { prod_uuid, ... } }, then:
//       //   const result = await dispatch(scanProduct(code)).unwrap();
//       //   const product = result.data;   ← use this line
//       //
//       // If the thunk already returns response.data.data (the product object), then:
//       //   const product = await dispatch(scanProduct(code)).unwrap(); ← use this line
//       //
//       // Currently using the first pattern (result.data) — adjust if needed:
//       const result  = await dispatch(scanProduct(code)).unwrap();
//       const product = result?.data ?? result; // handles both shapes gracefully

//       if (!product?.prod_uuid) throw new Error(result?.message || "Product not found");

//       // Warehouse validation (client-side early check)
//       if (currentUser?.warehouse_id && product.warehouse_id !== currentUser.warehouse_id) {
//         MySwal.fire({
//           icon: "error",
//           title: "Wrong Warehouse",
//           text: `This product belongs to "${product.warehouse_name}", not your assigned warehouse.`,
//         });
//         setBarcodeInput("");
//         return;
//       }

//       // Status validation
//       if (!TRANSFERABLE_STATUSES.includes(product.status)) {
//         MySwal.fire({
//           icon: "error",
//           title: "Invalid Status",
//           text: `"${product.partial_code || code}" has status "${product.status}". ` +
//                 `Only ${TRANSFERABLE_STATUSES.join(", ")} can be transferred.`,
//         });
//         setBarcodeInput("");
//         return;
//       }

//       const newProd = {
//         prod_uuid:            product.prod_uuid,
//         partial_code:         product.partial_code || product.barcode || code,
//         article_profile_id:   product.article_profile_id,
//         article_profile_name: product.article_profile_name || "—",
//         warehouse_name:       product.warehouse_name || "—",
//         count:                product.count || 0,
//         status:               product.status,
//         quantity_to_transfer: 1,
//       };

//       const updated = [...scannedProductsRef.current, newProd];
//       setScanned(updated);
//       setBarcodeInput("");

//       if (canSync) {
//         await syncToDb(updated, formData);
//         toast("success", "Scanned & Saved", newProd.partial_code);
//       } else {
//         toast("info", "Scanned (Local)",
//           `"${newProd.partial_code}" added. Select To Warehouse to save draft.`);
//       }
//     } catch (err) {
//       const msg = err.response?.data?.message || err.message || "Product not found";
//       MySwal.fire({ icon: "error", title: "Not Found", text: msg });
//     } finally {
//       setIsScanning(false);
//       barcodeRef.current?.focus();
//     }
//     // eslint-disable-next-line
//   }, [dispatch, formData, canSync, syncToDb, currentUser]);

//   // ── Remove single product ─────────────────────────────────────────────────
//   const handleRemoveProduct = useCallback((prod_uuid, partial_code) => {
//     MySwal.fire({
//       title: "Remove Product?",
//       text: "This will remove it from your draft.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Remove",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       try {
//         if (currentStockId) {
//           const res = await AuthService.removeLotProduct(partial_code);
//           setScanned((prev) => prev.filter((p) => p.prod_uuid !== prod_uuid));
//           if (res.data?.draft_deleted) {
//             setCurrentStockId(null);
//             toast("info", "Draft Cleared", "Last product removed. Draft deleted.");
//           } else {
//             toast("success", "Removed", `"${partial_code}" removed.`);
//           }
//         } else {
//           setScanned((prev) => prev.filter((p) => p.prod_uuid !== prod_uuid));
//           toast("success", "Removed", `"${partial_code}" removed.`);
//         }
//       } catch (err) {
//         toast("error", "Error", err.response?.data?.message || "Failed to remove.", 3000);
//       }
//     });
//   }, [currentStockId]);

//   // ── Remove all selected ───────────────────────────────────────────────────
//   const handleRemoveSelected = useCallback((selectedUuids) => {
//     MySwal.fire({
//       title: `Remove ${selectedUuids.length} product(s)?`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Remove All",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       const toRemove = scannedProducts.filter((p) => selectedUuids.includes(p.prod_uuid));
//       if (currentStockId) {
//         for (const p of toRemove) {
//           try { await AuthService.removeLotProduct(p.partial_code); } catch { /* continue */ }
//         }
//       }
//       const remaining = scannedProducts.filter((p) => !selectedUuids.includes(p.prod_uuid));
//       setScanned(remaining);
//       if (remaining.length === 0) setCurrentStockId(null);
//       toast("success", "Removed", `${toRemove.length} product(s) removed.`);
//     });
//   }, [scannedProducts, currentStockId]);

//   // ── Discard draft ─────────────────────────────────────────────────────────
//   const handleDiscardDraft = () => {
//     MySwal.fire({
//       title: "Discard entire draft?",
//       text: "All scanned products will be removed.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Yes, discard",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       try {
//         if (currentStockId) await AuthService.discardDraft();
//         setScanned([]);
//         setCurrentStockId(null);
//         toast("info", "Draft Discarded", "All products cleared.");
//       } catch (err) {
//         toast("error", "Error", err.response?.data?.message || "Failed to discard.", 3000);
//       }
//     });
//   };

//   // ── Qty change ────────────────────────────────────────────────────────────
//   const handleQtyChange = useCallback((prod_uuid, newQty) => {
//     setScanned((prev) =>
//       prev.map((p) => {
//         if (p.prod_uuid !== prod_uuid) return p;
//         const qty = parseInt(newQty) || 0;
//         if (qty > p.count) {
//           toast("warning", "Insufficient Stock", `Only ${p.count} units available.`);
//           return p;
//         }
//         return { ...p, quantity_to_transfer: qty };
//       }),
//     );
//   }, []);

//   // ── Bill / invoice handlers (restored) ───────────────────────────────────
//   const handleBillChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (!["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
//       toast("warning", "Invalid File", "PDF, JPG, or PNG only.");
//       return;
//     }
//     if (file.size > 5 * 1024 * 1024) {
//       toast("warning", "Too Large", "Max 5 MB.");
//       return;
//     }
//     setBillPreview({ file, name: file.name, size: (file.size / 1024).toFixed(2) + " KB" });
//   };

//   const handleRemoveBill = () => {
//     setBillPreview(null);
//     if (billFileRef.current) billFileRef.current.value = "";
//   };

//   // ── Excel import ──────────────────────────────────────────────────────────
//   // const handleExcelImport = async () => {
//   //   if (!excelFile) return;
//   //   setImportingExcel(true);
//   //   try {
//   //     const fd = new FormData();
//   //     fd.append("excel_file", excelFile);
//   //     if (formData.to_warehouse)  fd.append("to_wh",         formData.to_warehouse.value);
//   //     if (effectiveTransport)     fd.append("transportation", effectiveTransport.value);
//   //     // Always send description as string
//   //     fd.append("description", typeof formData.description === "string" ? formData.description : "");

//   //     const res  = await AuthService.importStockFlowFromExcel(fd);
//   //     const data = res.data;

//   //     if (data.data?.stock_id) setCurrentStockId(data.data.stock_id);

//   //     if (!data.data?.draft_saved && data.data?.products?.length) {
//   //       const localProds = data.data.products.map((p) => ({
//   //         prod_uuid:            p.prod_uuid,
//   //         partial_code:         p.partial_code || p.barcode,
//   //         article_profile_id:   p.article_profile_id,
//   //         article_profile_name: p.article_profile_name || "—",
//   //         warehouse_name:       p.warehouse_name || "—",
//   //         count:                p.count || 1,
//   //         status:               p.status,
//   //         quantity_to_transfer: p.count || 1,
//   //       }));
//   //       setScanned((prev) => {
//   //         const existing = new Set(prev.map((x) => x.prod_uuid));
//   //         return [...prev, ...localProds.filter((x) => !existing.has(x.prod_uuid))];
//   //       });
//   //     } else {
//   //       await restoreDraft();
//   //     }

//   //     setExcelFile(null);
//   //     if (excelInputRef.current) excelInputRef.current.value = "";

//   //     const errorLines = (data.data?.error_details || [])
//   //       .map((e) => `<li><code>${e.barcode || e.partial_code}</code>: ${e.error}</li>`)
//   //       .join("");

//   //     MySwal.fire({
//   //       icon: data.data?.errors > 0 ? "warning" : "success",
//   //       title: data.message,
//   //       html: `
//   //         <p>Added: <strong>${data.data?.added || 0}</strong></p>
//   //         <p>Skipped: <strong>${data.data?.skipped || 0}</strong></p>
//   //         ${data.data?.errors > 0
//   //           ? `<p>Errors: <strong>${data.data.errors}</strong></p><ul class="text-start">${errorLines}</ul>`
//   //           : ""}
//   //         ${!data.data?.draft_saved
//   //           ? `<p class="text-warning mt-2 small">Select To Warehouse to persist draft.</p>`
//   //           : ""}
//   //       `,
//   //     });
//   //   } catch (err) {
//   //     MySwal.fire({
//   //       icon: "error",
//   //       title: "Import Failed",
//   //       text: err.response?.data?.message || "Import failed.",
//   //     });
//   //   } finally {
//   //     setImportingExcel(false);
//   //   }
//   // };

//   // ── Submit ────────────────────────────────────────────────────────────────
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setProductErrors([]);

//     if (!scannedProducts.length) {
//       toast("warning", "No Products", "Scan at least one product."); return;
//     }
//     if (!formData.to_warehouse) {
//       toast("warning", "Missing", "To Warehouse is required."); return;
//     }
//     if (!effectiveTransport) {
//       toast("warning", "Missing", "No transport options available yet."); return;
//     }
//     if (scannedProducts.some((p) => p.quantity_to_transfer <= 0)) {
//       toast("warning", "Invalid Qty", "All quantities must be greater than 0."); return;
//     }

//     await syncToDb(scannedProducts, formData);

//     setSubmitting(true);
//     try {
//       const res  = await AuthService.stockFlowSubmit();
//       const body = res.data;

//       if (!body.success) {
//         const errProds = body.data || [];
//         if (errProds.length) {
//           const errorList = errProds.map((ep) => {
//             const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
//             return {
//               prod_uuid:    ep.prod_uuid,
//               partial_code: local?.partial_code || ep.prod_uuid,
//               title:        local?.title        || ep.prod_uuid,
//               errors: [`Requested ${ep.count} but insufficient stock or status mismatch (${ep.status})`],
//             };
//           });
//           setProductErrors(errorList);
//           MySwal.fire({
//             icon: "error",
//             title: "Submission Failed",
//             html: `<p>${body.message}</p><p class="text-muted small">Inconsistent products are highlighted below.</p>`,
//           });
//           return;
//         }
//         throw new Error(body.message || "Submission failed.");
//       }

//       MySwal.fire({
//         icon: "success",
//         title: "Stock Flow Created!",
//         html: `
//           <p><strong>Stock ID:</strong> ${currentStockId || "—"}</p>
//           <p><strong>Products:</strong> ${scannedProducts.length}</p>
//           <p><strong>Total Quantity:</strong> ${totalQty}</p>
//           ${formData.to_warehouse ? `<p><strong>To:</strong> ${formData.to_warehouse.label}</p>` : ""}
//           <p class="text-muted small">Status set to <strong>in-transit</strong></p>
//         `,
//         confirmButtonText: "View Stock Flows",
//       }).then(() => navigate("/stock-transfer"));
//     } catch (err) {
//       const msg = err.response?.data?.message || err.message || "Failed to create stock flow.";
//       const errProds = err.response?.data?.data || [];
//       if (errProds.length) {
//         const errorList = errProds.map((ep) => {
//           const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
//           return {
//             prod_uuid:    ep.prod_uuid,
//             partial_code: local?.partial_code || ep.prod_uuid,
//             title:        local?.title        || ep.prod_uuid,
//             errors:       [`Count ${ep.count}, status ${ep.status} — inventory mismatch`],
//           };
//         });
//         setProductErrors(errorList);
//       }
//       MySwal.fire({ icon: "error", title: "Error", text: msg });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── Table columns ─────────────────────────────────────────────────────────
//   const columns = useMemo(() => {
//     const errorMap = Object.fromEntries(productErrors.map((e) => [e.prod_uuid, e.errors]));
//     return [
//       { title: "#", render: (_, __, i) => i + 1, width: "50px" },
//       {
//         title: "Barcode / Code",
//         dataIndex: "partial_code",
//         render: (text, record) => (
//           <span>
//             <span className="badge badge-primary">{text}</span>
//             {errorMap[record.prod_uuid] && (
//               <div className="mt-1">
//                 {errorMap[record.prod_uuid].map((err, i) => (
//                   <div key={i} className="text-danger small">
//                     <AlertTriangle size={12} className="me-1" />{err}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </span>
//         ),
//       },
//       { title: "Article Profile", dataIndex: "article_profile_name" },
//       { title: "Warehouse",       dataIndex: "warehouse_name" },
//       {
//         title: "Status", dataIndex: "status",
//         render: (t) => (
//           <span className={`badge ${STATUS_BADGE[t] || "badge-info"}`}>
//             {t?.toUpperCase() || "N/A"}
//           </span>
//         ),
//       },
//       {
//         title: "Available", dataIndex: "count",
//         render: (t) => <span className="badge badge-info">{t}</span>,
//       },
//       {
//         title: "Transfer Qty", dataIndex: "quantity_to_transfer",
//         render: (text, record) => (
//           <input type="number" className="form-control form-control-sm" style={{ width: "80px" }}
//             value={text} min="1" max={record.count}
//             onChange={(e) => handleQtyChange(record.prod_uuid, e.target.value)} />
//         ),
//       },
//       {
//         title: "Action", width: "80px",
//         render: (_, record) => (
//           <button type="button" className="btn btn-sm btn-danger"
//             onClick={() => handleRemoveProduct(record.prod_uuid, record.partial_code)}
//             title="Remove">
//             <Trash2 size={14} />
//           </button>
//         ),
//       },
//     ];
//   }, [productErrors, handleQtyChange, handleRemoveProduct]);

//   // ── Render ────────────────────────────────────────────────────────────────
//   return (
//     <div className="page-wrapper">
//       <div className="content">

//         {/* Page Header */}
//         <div className="page-header">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>Create Stock Flow</h4>
//               <h6>Scan or import products to create a stock transfer</h6>
//             </div>
//           </div>
//           <ul className="table-top-head">
//             <li>
//               <Link to="/stock-transfer" className="btn btn-secondary btn-sm">
//                 <ArrowLeft size={16} className="me-1" />Back
//               </Link>
//             </li>
//             <li>
//               <OverlayTrigger placement="top" overlay={<Tooltip>Collapse</Tooltip>}>
//                 <Link id="collapse-header" className={headerToggle ? "active" : ""}
//                   onClick={() => dispatch(setToogleHeader(!headerToggle))}>
//                   <ChevronUp className="feather-chevron-up" />
//                 </Link>
//               </OverlayTrigger>
//             </li>
//           </ul>
//         </div>

//         {/* Draft loading */}
//         {loadingDraft && (
//           <div className="alert alert-light d-flex align-items-center mb-3">
//             <span className="spinner-border spinner-border-sm me-2" />
//             Checking for saved draft…
//           </div>
//         )}

//         {/* Active draft banner */}
//         {!loadingDraft && currentStockId && (
//           <div className="alert alert-warning d-flex align-items-center justify-content-between mb-3">
//             <div className="d-flex align-items-center">
//               <RefreshCw size={16} className="me-2" />
//               <strong>Active Draft:</strong>
//               <span className="ms-2 badge badge-warning">{currentStockId}</span>
//               {isSyncing && <span className="spinner-border spinner-border-sm ms-2 text-muted" />}
//             </div>
//             {scannedProducts.length > 0 && (
//               <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleDiscardDraft}>
//                 <Trash2 size={14} className="me-1" />Discard Draft
//               </button>
//             )}
//           </div>
//         )}

//         {/* Product errors */}
//         {productErrors.length > 0 && (
//           <div className="alert alert-danger mb-3">
//             <h6 className="mb-2">
//               <AlertTriangle size={16} className="me-2" />
//               {productErrors.length} product(s) failed validation — correct them and resubmit.
//             </h6>
//             <ul className="mb-0">
//               {productErrors.map((e, i) => (
//                 <li key={i}>
//                   <strong>{e.title || e.partial_code}</strong> ({e.partial_code}):{" "}
//                   {e.errors.join("; ")}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* ── Stock Flow Details ── */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <h5 className="mb-4">Stock Flow Details</h5>

//             {/* From Warehouse — read-only */}
//             {currentUser?.warehouse_name && (
//               <div className="row mb-3">
//                 <div className="col-lg-6">
//                   <label className="form-label">From Warehouse</label>
//                   <input type="text" className="form-control bg-light"
//                     value={currentUser.warehouse_name} readOnly disabled />
//                   <small className="text-muted">Your assigned warehouse (set by your account)</small>
//                 </div>
//               </div>
//             )}

//             <div className="row mb-3">
//               <div className="col-lg-6">
//                 <label className="form-label">To Warehouse <span className="text-danger">*</span></label>
//                 <Select options={allWarehouses} value={formData.to_warehouse}
//                   onChange={(opt) => setField("to_warehouse", opt)}
//                   placeholder="Select destination warehouse" isClearable />
//               </div>
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   Transport <span className="text-danger">*</span>
//                   {transportOptions.length === 0 && <span className="spinner-border spinner-border-sm ms-2" />}
//                 </label>
//                 <Select options={transportOptions} value={formData.transport}
//                   onChange={(opt) => setField("transport", opt)}
//                   placeholder={transportOptions.length === 0 ? "Loading…" : "Select transport method"}
//                   isLoading={transportOptions.length === 0} />
//                 {transportOptions.length > 0 && !formData.transport && (
//                   <small className="text-muted">
//                     Defaults to <strong>{transportOptions[0]?.label}</strong> if not selected
//                   </small>
//                 )}
//               </div>
//             </div>

//             <div className="row mb-3">
//               <div className="col-lg-6">
//                 <label className="form-label">Description</label>
//                 <textarea className="form-control" value={formData.description || ""}
//                   onChange={(e) => setField("description", e.target.value)}
//                   rows="2" placeholder="Notes about this transfer…" />
//               </div>
//               <div className="col-lg-6">
//                 <label className="form-label">Total Quantity</label>
//                 <input type="number" className="form-control bg-light" value={totalQty}
//                   readOnly disabled style={{ fontWeight: "bold", fontSize: "1.1rem" }} />
//                 <small className="text-muted">Auto-calculated from scanned products</small>
//               </div>
//             </div>

//             {/* ── Bill / Invoice upload (RESTORED) ── */}
//             <div className="row">
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   <File size={16} className="me-1" />Bill / Invoice (Optional)
//                 </label>
//                 {!billPreview ? (
//                   <div className="border border-dashed rounded p-3 text-center">
//                     <input ref={billFileRef} type="file" id="billFileInput" className="d-none"
//                       accept=".pdf,.jpg,.jpeg,.png" onChange={handleBillChange} />
//                     <label htmlFor="billFileInput" className="mb-0" style={{ cursor: "pointer" }}>
//                       <Upload size={40} className="text-muted mb-2 d-block mx-auto" />
//                       <span className="text-muted">Click to upload — PDF, JPG, PNG max 5 MB</span>
//                     </label>
//                   </div>
//                 ) : (
//                   <div className="border rounded p-3 d-flex align-items-center justify-content-between">
//                     <div className="d-flex align-items-center">
//                       <File size={28} className="text-primary me-3" />
//                       <div>
//                         <p className="mb-0 fw-semibold">{billPreview.name}</p>
//                         <small className="text-muted">{billPreview.size}</small>
//                       </div>
//                     </div>
//                     <button type="button" className="btn btn-sm btn-danger" onClick={handleRemoveBill}>
//                       <X size={14} />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>

//           </div>
//         </div>

//         {/* ── Scan Barcode ── */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <div className="d-flex align-items-center mb-3">
//               <Camera size={22} className="text-primary me-2" />
//               <h5 className="mb-0">Scan Barcode</h5>
//               <span className="badge badge-success ms-2" style={{ fontSize: "0.7rem" }}>Always Active</span>
//             </div>

//             {!canSync ? (
//               <div className="alert alert-info d-flex align-items-center mb-3">
//                 <span className="me-2 flex-shrink-0">ℹ</span>
//                 <div>
//                   <strong>Scanning is available now.</strong> Products will be held locally.
//                   <span className="d-block mt-1 text-muted small">
//                     Select a <strong>To Warehouse</strong> above to auto-save each scan to draft.
//                   </span>
//                 </div>
//               </div>
//             ) : (
//               <div className="alert alert-success d-flex align-items-center mb-3">
//                 <span className="me-2 flex-shrink-0">✓</span>
//                 <div>
//                   <strong>Ready to scan &amp; auto-save!</strong> Each scan is saved to draft.
//                   <div className="mt-1">
//                     To: <strong>{formData.to_warehouse?.label}</strong>
//                     {!formData.transport && effectiveTransport && (
//                       <span className="ms-2 badge badge-secondary" style={{ fontSize: "0.75rem" }}>
//                         Transport: {effectiveTransport.label} (default)
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="row align-items-end">
//               <div className="col-lg-8">
//                 <label className="form-label">
//                   Scan or Enter Barcode
//                   {(isScanning || isSyncing) && <span className="spinner-border spinner-border-sm ms-2" />}
//                 </label>
//                 <input ref={barcodeRef} type="text" className="form-control"
//                   value={barcodeInput}
//                   onChange={(e) => setBarcodeInput(e.target.value)}
//                   onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleScan(barcodeInput); } }}
//                   placeholder="Use scanner or type barcode then press Enter"
//                   disabled={isScanning} autoFocus />
//               </div>
//               <div className="col-lg-4">
//                 <button type="button" className="btn btn-primary w-100"
//                   onClick={() => handleScan(barcodeInput)}
//                   disabled={!barcodeInput.trim() || isScanning}>
//                   {isScanning
//                     ? <><span className="spinner-border spinner-border-sm me-2" />Scanning…</>
//                     : <><Plus size={16} className="me-1" />Add Product</>}
//                 </button>
//               </div>
//             </div>

//             {scannedProducts.length > 0 && (
//               <div className="alert alert-success d-flex align-items-center mt-3 mb-0">
//                 <Package size={18} className="me-2" />
//                 <strong>
//                   {scannedProducts.length} product(s) &nbsp;|&nbsp; Total Qty: {totalQty}
//                   {isSyncing && <span className="ms-2 text-muted small">saving…</span>}
//                   {!canSync && <span className="ms-2 text-warning small">⚠ Unsaved — select To Warehouse to persist</span>}
//                 </strong>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Excel Import ── */}
//         {/* <div className="card mb-3">
//           <div className="card-body">
//             <div className="d-flex align-items-center mb-3">
//               <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
//                 fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
//                 strokeLinejoin="round" style={{ color: "#198754" }} className="me-2">
//                 <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
//                 <line x1="3"  y1="9"  x2="21" y2="9"/>
//                 <line x1="3"  y1="15" x2="21" y2="15"/>
//                 <line x1="9"  y1="3"  x2="9"  y2="21"/>
//                 <line x1="15" y1="3"  x2="15" y2="21"/>
//               </svg>
//               <h5 className="mb-0">Import from Excel / CSV</h5>
//               <span className="badge badge-success ms-2" style={{ fontSize: "0.7rem" }}>Always Active</span>
//             </div>

//             <p className="text-muted small mb-3">
//               Upload a file with a <code>barcode</code> column (optional:{" "}
//               <code>quantity_to_transfer</code> or <code>count</code>). Products are validated
//               immediately. If <strong>To Warehouse</strong> is selected, the draft is saved automatically.
//             </p>

//             <div className="row align-items-end">
//               <div className="col-lg-8">
//                 <label className="form-label">Select Excel / CSV File</label>
//                 <input ref={excelInputRef} type="file" className="form-control"
//                   accept=".xlsx,.xls,.csv"
//                   onChange={(e) => setExcelFile(e.target.files[0] || null)} />
//                 {excelFile && (
//                   <small className="text-muted">
//                     Selected: {excelFile.name} ({(excelFile.size / 1024).toFixed(1)} KB)
//                   </small>
//                 )}
//               </div>
//               <div className="col-lg-4">
//                 <button type="button" className="btn btn-success w-100"
//                   onClick={handleExcelImport} disabled={!excelFile || importingExcel}>
//                   {importingExcel
//                     ? <><span className="spinner-border spinner-border-sm me-2" />Importing…</>
//                     : <><Upload size={16} className="me-1" />Import Excel</>}
//                 </button>
//               </div>
//             </div>

//             <div className="mt-2">
//               <small className="text-muted">
//                 Need a template?{" "}
//                 <a href="#" onClick={(e) => {
//                   e.preventDefault();
//                   const csv = "data:text/csv;charset=utf-8," +
//                     [["barcode", "quantity_to_transfer"], ["BARCODE001", 1], ["BARCODE002", 2]]
//                       .map((r) => r.join(",")).join("\n");
//                   const link = document.createElement("a");
//                   link.setAttribute("href", encodeURI(csv));
//                   link.setAttribute("download", "stock_flow_template.csv");
//                   link.click();
//                 }}>
//                   Download CSV template
//                 </a>
//               </small>
//             </div>
//           </div>
//         </div> */}

//         {/* ── Scanned Products Table ── */}
//         {scannedProducts.length > 0 && (
//           <div className="card mb-3">
//             <div className="card-body">
//               <div className="d-flex align-items-center justify-content-between mb-3">
//                 <h5 className="mb-0">
//                   <Package size={18} className="me-2" />
//                   Scanned Products ({scannedProducts.length})
//                 </h5>
//                 <button type="button" className="btn btn-sm btn-outline-danger"
//                   onClick={() => handleRemoveSelected(scannedProducts.map((p) => p.prod_uuid))}>
//                   <Trash2 size={14} className="me-1" />Remove All
//                 </button>
//               </div>
//               <div className="table-responsive">
//                 <Table columns={columns} dataSource={scannedProducts} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Transfer Summary ── */}
//         {scannedProducts.length > 0 && (
//           <div className="alert alert-warning mb-3">
//             <strong>Transfer Summary</strong>
//             <ul className="mb-0 mt-2">
//               <li>Total Products: {scannedProducts.length}</li>
//               <li>Total Quantity: {totalQty} units</li>
//               {currentUser?.warehouse_name && <li>From: {currentUser.warehouse_name}</li>}
//               {formData.to_warehouse          && <li>To: {formData.to_warehouse.label}</li>}
//               {effectiveTransport             && (
//                 <li>Transport: {effectiveTransport.label}{!formData.transport ? " (default)" : ""}</li>
//               )}
//               <li>Status after submit: <strong>in-transit</strong></li>
//               {currentStockId && <li>Draft Stock ID: <strong>{currentStockId}</strong></li>}
//             </ul>
//             <small className="text-muted d-block mt-1">Inventory will be updated on submission.</small>
//           </div>
//         )}

//         {/* ── Submit / Cancel ── */}
//         <div className="col-lg-12">
//           <div className="btn-addproduct mb-4">
//             <Link to="/stock-transfer" className="btn btn-cancel me-2">Cancel</Link>
//             <button type="button" className="btn btn-submit" onClick={handleSubmit}
//               disabled={submitting || scannedProducts.length === 0 || !canSync}>
//               {submitting
//                 ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
//                 : <><Send size={16} className="me-1" />Create Stock Flow</>}
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// };

// export default AddStockFlow;



























// import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Select from "react-select";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import {
//   ArrowLeft, ChevronUp, Camera, Plus, Package, Send,
//   Trash2, Upload, RefreshCw, AlertTriangle, File, X, Lock,
// } from "feather-icons-react/build/IconComponents";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import { setToogleHeader } from "../../core/redux/action";
// import { scanProduct } from "../../core/redux/slices/productSlice";
// import {
//   fetchStockRequestDropdown,
//   selectFlowSourceRequest,
//   selectReqDropdown,
//   selectReqDropdownLoading,
//   clearFlowSourceRequest,
// } from "../../core/redux/slices/stockSlice";
// import AuthService from "../../services/authService";
// import Table from "../../core/pagination/datatable";
// import { Modal } from "react-bootstrap";


// const MySwal = withReactContent(Swal);

// const toast = (icon, title, text, timer = 2000) =>
//   MySwal.fire({ icon, title, text, timer, showConfirmButton: false, toast: true, position: "top-end" });

// const STATUS_BADGE = {
//   good:   "badge-success",
//   faulty: "badge-info",
//   broken: "badge-danger",
// };

// const TRANSFERABLE_STATUSES = ["good", "faulty", "broke/burnt"];

// const INITIAL_FORM = {
//   stock_request_id: null,  
//   transport:        null,
//   description:      "",
// };

// const toApiProdItem = (p) => ({
//   prod_uuid:            p.prod_uuid,
//   partial_code:         p.partial_code,
//   article_profile_id:   p.article_profile_id,
//   article_profile_name: p.article_profile_name,
//   status:               p.status,
//   count:                p.quantity_to_transfer || 1,
// });

// // =============================================================================
// const AddStockFlow = () => {
//   const dispatch     = useDispatch();
//   const navigate     = useNavigate();
//   const headerToggle = useSelector((s) => s.toggle_header);
//   const currentUser  = useSelector((s) => s.user?.currentUser);

//   // ── Redux: stock request dropdown data ────────────────────────────────────
//   const flowSourceRequest  = useSelector(selectFlowSourceRequest);   // set by StockRequest page
//   const reqDropdownRaw     = useSelector(selectReqDropdown);         // array of request objects
//   const reqDropdownLoading = useSelector(selectReqDropdownLoading);

//   const [profileModal, setProfileModal] = useState({
//   open: false,
//   profiles: [],     
//   partial_code: "",  
// });

//   // Build react-select options from the raw dropdown list
//   const stockRequestOptions = useMemo(
//     () =>
//       reqDropdownRaw.map((r) => ({
//         value: r.stock_req_id,
//         label: `#${r.stock_req_id}${r.description ? " — " + r.description : ""}`,
//       })),
//     [reqDropdownRaw],
//   );

//   // Is the field locked (navigated from stock request page)?
//   const isRequestLocked = !!flowSourceRequest;

//   const [transportOptions, setTransportOptions] = useState([]);

//   const [formData, setFormData] = useState(INITIAL_FORM);
//   const setField = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

//   const [scannedProducts, setScannedProducts] = useState([]);
//   const scannedProductsRef                    = useRef([]);

//   const [currentStockId, setCurrentStockId] = useState(null);

//   const [loadingDraft,  setLoadingDraft]  = useState(true);
//   const [isScanning,    setIsScanning]    = useState(false);
//   const [isSyncing,     setIsSyncing]     = useState(false);
//   const [submitting,    setSubmitting]    = useState(false);
//   const [productErrors, setProductErrors] = useState([]);

//   const [barcodeInput, setBarcodeInput] = useState("");
//   const barcodeRef  = useRef(null);
//   // const scanBuffer  = useRef("");
//   // const lastKeyTime = useRef(0);

//   const [billPreview, setBillPreview] = useState(null);
//   const billFileRef = useRef(null);

//   // ── Derived ──────────────────────────────────────────────────────────────
//   const totalQty = useMemo(
//     () => scannedProducts.reduce((s, p) => s + (parseInt(p.quantity_to_transfer) || 0), 0),
//     [scannedProducts],
//   );

//   const canSync          = !!(formData.stock_request_id && (formData.transport || transportOptions[0]));
//   const effectiveTransport = formData.transport || transportOptions[0] || null;

//   // ── Init ──────────────────────────────────────────────────────────────────
//   useEffect(() => {
//     (async () => {
//       // Load transport options + request dropdown in parallel
//       await Promise.all([
//         loadTransportOptions(),
//         dispatch(fetchStockRequestDropdown()),
//       ]);

//       // If navigated from StockRequest page, pre-fill and lock the field
//       if (flowSourceRequest) {
//         setField("stock_request_id", {
//           value: flowSourceRequest.value,
//           label: flowSourceRequest.label,
//         });
//       }

//       await restoreDraft();
//     })();

//     // Clear the Redux flag when user leaves this page
//     return () => {
//       dispatch(clearFlowSourceRequest());
//     };
//     // eslint-disable-next-line
//   }, []);

//   // Re-sync when stock_request_id or transport changes and we already have products
//   useEffect(() => {
//     if (scannedProducts.length > 0 && canSync) {
//       syncToDb(scannedProducts, formData);
//     }
//     // eslint-disable-next-line
//   }, [formData.stock_request_id, formData.transport]);


//   const setScanned = (val) => {
//     setScannedProducts((prev) => {
//       const next = typeof val === "function" ? val(prev) : val;
//       scannedProductsRef.current = next;
//       return next;
//     });
//   };

//   // ── Loaders ───────────────────────────────────────────────────────────────
//   const loadTransportOptions = async () => {
//     try {
//       const res     = await AuthService.getStockFlowOptions();
//       const options = res.data?.data;
//       if (!options) {
//         toast("error", "Options Error", "Failed to load transport options from server.", 5000);
//         return;
//       }
//       const toOpt = (v) =>
//         typeof v === "object" && v !== null && v.value !== undefined
//           ? v
//           : {
//               value: String(v),
//               label: String(v)
//                 .split("_")
//                 .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//                 .join(" "),
//             };
//       const transportOpts = (options.transport || []).map(toOpt);
//       setTransportOptions(transportOpts);
//       if (!transportOpts.length)
//         console.warn("Transport options empty — check stock_flow.transport enum in DB.");
//     } catch (e) {
//       console.error("loadTransportOptions error:", e);
//       toast("error", "Options Error", `Could not load transport options: ${e.message}`, 5000);
//     }
//   };

//   // ── Restore draft ─────────────────────────────────────────────────────────
//   const restoreDraft = async () => {
//     setLoadingDraft(true);
//     try {
//       const res  = await AuthService.getExistingStock();
//       const body = res.data;
//       if (!body.is_found || !body.data) return;

//       const lot = body.data;
//       setCurrentStockId(lot.stock_id);
//       setFormData((prev) => ({ ...prev, description: lot.bulk_imp_desc || "" }));

//       if (lot.prod_arr?.length) {
//         const restored = lot.prod_arr.map((p) => ({
//           prod_uuid:            p.prod_uuid,
//           partial_code:         p.partial_code,
//           article_profile_id:   p.article_profile_id,
//           article_profile_name: p.article_profile_name || "—",
//           warehouse_name:       p.warehouse_name || "—",
//           count:                p.count || 0,
//           status:               p.status,
//           quantity_to_transfer: p.count || 1,
//         }));
//         setScanned(restored);
//         MySwal.fire({
//           icon: "info",
//           title: "Draft Restored",
//           html: `<p><strong>${restored.length}</strong> product(s) from your previous session.</p>
//                  <small class="text-muted">Stock ID: ${lot.stock_id}</small>`,
//           timer: 3500,
//           showConfirmButton: false,
//         });
//       }
//     } catch (err) {
//       console.warn("No draft found:", err.message);
//     } finally {
//       setLoadingDraft(false);
//     }
//   };

//   // ── syncToDb ──────────────────────────────────────────────────────────────
//   const syncToDb = useCallback(async (products, fd) => {
//     if (!fd.stock_request_id) return;
//     if (!products.length) return;

//     const transport = fd.transport || transportOptions[0] || null;
//     if (!transport) {
//       console.warn("syncToDb: no transport available — skipping.");
//       return;
//     }

//     setIsSyncing(true);
//     try {
//       const payload = {
//         stock_req_id:   fd.stock_request_id.value,
//         transportation: transport.value,
//         prod_arr:       products.map(toApiProdItem),
//         description:    fd.description || undefined,
//       };

//       console.log("syncToDb payload:", payload);
//       const res = await AuthService.stockFlowSync(payload);

//       const syncedId = res.data?.data?.stock_id;
//       if (syncedId) {
//         setCurrentStockId(syncedId);
//       } else if (!currentStockId) {
//         try {
//           const draftRes = await AuthService.getExistingStock();
//           if (draftRes.data?.data?.stock_id) {
//             setCurrentStockId(draftRes.data.data.stock_id);
//           }
//         } catch { /* draft may not exist yet */ }
//       }

//       console.log("Sync success:", res.data?.message);
//     } catch (err) {
//       const msg = err.response?.data?.message || "Failed to sync draft";
//       toast("error", "Sync Error", msg, 3000);
//       console.error("syncToDb error:", err.response?.data || err);
//     } finally {
//       setIsSyncing(false);
//     }
//   }, [currentStockId, transportOptions]);


// const doScanAndAdd = useCallback(async (code, product_id = null, prefetchedProduct = null) => {
//   setIsScanning(true);
//   try {
//     let product;

//     if (prefetchedProduct) {
//       product = prefetchedProduct;
//     } else {
      
//       const result = await dispatch(scanProduct({ code, product_id })).unwrap();
//       product = result?.data.data ?? result;

//       console.log("+++++++++++++++++++++++++++++++++",result)
//     }

//     if (!product?.prod_uuid) throw new Error("Product not found");

//     if (currentUser?.warehouse_id && product.warehouse_id !== currentUser.warehouse_id) {
//       MySwal.fire({
//         icon: "error",
//         title: "Wrong Warehouse",
//         text: `This product belongs to "${product.warehouse_name}", not your assigned warehouse.`,
//       });
//       return;
//     }

//     if (!TRANSFERABLE_STATUSES.includes(product.status)) {
//       MySwal.fire({
//         icon: "error",
//         title: "Invalid Status",
//         text: `"${product.partial_code || code}" has status "${product.status}". ` +
//               `Only ${TRANSFERABLE_STATUSES.join(", ")} can be transferred.`,
//       });
//       return;
//     }

//     const newProd = {
//       prod_uuid:            product.prod_uuid,
//       partial_code:         product.partial_code || code,
//       article_profile_id:   product.article_profile_id,
//       article_profile_name: product.article_profile_name || "—",
//       warehouse_name:       product.warehouse_name || "—",
//       count:                product.count || 0,
//       status:               product.status,
//       quantity_to_transfer: 1,
//     };

//     const updated = [...scannedProductsRef.current, newProd];
//     setScanned(updated);
//     setBarcodeInput("");

//     if (canSync) {
//       await syncToDb(updated, formData);
//       toast("success", "Scanned & Saved", newProd.partial_code);
//     } else {
//       toast("info", "Scanned (Local)",
//         `"${newProd.partial_code}" added. Select a Stock Request above to save draft.`);
//     }
//   } catch (err) {
//     const msg = err.response?.data?.message || err.message || "Product not found";
//     MySwal.fire({ icon: "error", title: "Not Found", text: msg });
//   } finally {
//     setIsScanning(false);
//     barcodeRef.current?.focus();
//   }
//   // eslint-disable-next-line
// }, [dispatch, formData, canSync, syncToDb, currentUser]);
// // 
// const handleScan = useCallback(async (partial_code) => {
//   const code = (partial_code || "").trim();
//   if (!code) return;

//   if (scannedProductsRef.current.find((p) => p.partial_code === code)) {
//     toast("warning", "Already Scanned", `Barcode "${code}" is already in the list.`);
//     setBarcodeInput("");
//     return;
//   }

//   setIsScanning(true);
//   try {
//     const profileRes = await AuthService.getProfileByCode(code);
//     const raw        = profileRes.data?.data;

//     // Backend returns array when multiple profiles exist, object when single
//     const profiles = Array.isArray(raw) ? raw : null;

//     if (profiles && profiles.length > 1) {
//       // Multiple article profiles → ask user to pick
//       setProfileModal({ open: true, profiles, partial_code: code });
//       setBarcodeInput("");
//       setIsScanning(false);
//       return;
//     }

//     // Single match — data is already the full product object, use it directly
//     if (raw && !Array.isArray(raw) && raw.prod_uuid) {
//       await doScanAndAdd(code, null, raw);  // pass raw product, skip re-fetch
//       return;
//     }

//     // Fallback
//     await doScanAndAdd(code);
//   } catch (err) {
//     const msg = err.response?.data?.message || err.message || "Product not found";
//     MySwal.fire({ icon: "error", title: "Not Found", text: msg });
//     setIsScanning(false);
//   }
//   // eslint-disable-next-line
// }, [formData, canSync, syncToDb, currentUser, doScanAndAdd]);




//   // ── Remove single product ─────────────────────────────────────────────────
//   const handleRemoveProduct = useCallback((prod_uuid, partial_code) => {
//     MySwal.fire({
//       title: "Remove Product?",
//       text: "This will remove it from your draft.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Remove",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       try {
//         if (currentStockId) {
//           const res = await AuthService.removeLotProduct(partial_code);
//           setScanned((prev) => prev.filter((p) => p.prod_uuid !== prod_uuid));
//           if (res.data?.draft_deleted) {
//             setCurrentStockId(null);
//             toast("info", "Draft Cleared", "Last product removed. Draft deleted.");
//           } else {
//             toast("success", "Removed", `"${partial_code}" removed.`);
//           }
//         } else {
//           setScanned((prev) => prev.filter((p) => p.prod_uuid !== prod_uuid));
//           toast("success", "Removed", `"${partial_code}" removed.`);
//         }
//       } catch (err) {
//         toast("error", "Error", err.response?.data?.message || "Failed to remove.", 3000);
//       }
//     });
//   }, [currentStockId]);

//   // ── Remove all ────────────────────────────────────────────────────────────
//   const handleRemoveSelected = useCallback((selectedUuids) => {
//     MySwal.fire({
//       title: `Remove ${selectedUuids.length} product(s)?`,
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Remove All",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       const toRemove = scannedProducts.filter((p) => selectedUuids.includes(p.prod_uuid));
//       if (currentStockId) {
//         for (const p of toRemove) {
//           try { await AuthService.removeLotProduct(p.partial_code); } catch { /* continue */ }
//         }
//       }
//       const remaining = scannedProducts.filter((p) => !selectedUuids.includes(p.prod_uuid));
//       setScanned(remaining);
//       if (remaining.length === 0) setCurrentStockId(null);
//       toast("success", "Removed", `${toRemove.length} product(s) removed.`);
//     });
//   }, [scannedProducts, currentStockId]);

//   // ── Discard draft ─────────────────────────────────────────────────────────
//   const handleDiscardDraft = () => {
//     MySwal.fire({
//       title: "Discard entire draft?",
//       text: "All scanned products will be removed.",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Yes, discard",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       try {
//         if (currentStockId) await AuthService.discardDraft();
//         setScanned([]);
//         setCurrentStockId(null);
//         toast("info", "Draft Discarded", "All products cleared.");
//       } catch (err) {
//         toast("error", "Error", err.response?.data?.message || "Failed to discard.", 3000);
//       }
//     });
//   };

//   // ── Qty change ────────────────────────────────────────────────────────────
//   const handleQtyChange = useCallback((prod_uuid, newQty) => {
//     setScanned((prev) =>
//       prev.map((p) => {
//         if (p.prod_uuid !== prod_uuid) return p;
//         const qty = parseInt(newQty) || 0;
//         if (qty > p.count) {
//           toast("warning", "Insufficient Stock", `Only ${p.count} units available.`);
//           return p;
//         }
//         return { ...p, quantity_to_transfer: qty };
//       }),
//     );
//   }, []);

//   // ── Bill / Invoice ────────────────────────────────────────────────────────
//   const handleBillChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (!["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
//       toast("warning", "Invalid File", "PDF, JPG, or PNG only.");
//       return;
//     }
//     if (file.size > 5 * 1024 * 1024) {
//       toast("warning", "Too Large", "Max 5 MB.");
//       return;
//     }
//     setBillPreview({ file, name: file.name, size: (file.size / 1024).toFixed(2) + " KB" });
//   };

//   const handleRemoveBill = () => {
//     setBillPreview(null);
//     if (billFileRef.current) billFileRef.current.value = "";
//   };

//   // ── Submit ────────────────────────────────────────────────────────────────
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setProductErrors([]);

//     if (!scannedProducts.length) {
//       toast("warning", "No Products", "Scan at least one product."); return;
//     }
//     if (!formData.stock_request_id) {
//       toast("warning", "Missing", "Stock Request is required."); return;
//     }
//     if (!effectiveTransport) {
//       toast("warning", "Missing", "No transport options available yet."); return;
//     }
//     if (scannedProducts.some((p) => p.quantity_to_transfer <= 0)) {
//       toast("warning", "Invalid Qty", "All quantities must be greater than 0."); return;
//     }

//     await syncToDb(scannedProducts, formData);

//     setSubmitting(true);
//     try {
//       const res  = await AuthService.stockFlowSubmit();
//       const body = res.data;

//       if (!body.success) {
//         const errProds = body.data || [];
//         if (errProds.length) {
//           const errorList = errProds.map((ep) => {
//             const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
//             return {
//               prod_uuid:    ep.prod_uuid,
//               partial_code: local?.partial_code || ep.prod_uuid,
//               title:        local?.title        || ep.prod_uuid,
//               errors: [`Requested ${ep.count} but insufficient stock or status mismatch (${ep.status})`],
//             };
//           });
//           setProductErrors(errorList);
//           MySwal.fire({
//             icon: "error",
//             title: "Submission Failed",
//             html: `<p>${body.message}</p><p class="text-muted small">Inconsistent products are highlighted below.</p>`,
//           });
//           return;
//         }
//         throw new Error(body.message || "Submission failed.");
//       }

//       MySwal.fire({
//         icon: "success",
//         title: "Stock Flow Created!",
//         html: `
//           <p><strong>Stock ID:</strong> ${currentStockId || "—"}</p>
//           <p><strong>Products:</strong> ${scannedProducts.length}</p>
//           <p><strong>Total Quantity:</strong> ${totalQty}</p>
//           ${formData.stock_request_id
//             ? `<p><strong>Request:</strong> ${formData.stock_request_id.label}</p>`
//             : ""}
//           <p class="text-muted small">Status set to <strong>in-transit</strong></p>
//         `,
//         confirmButtonText: "View Stock Flows",
//       }).then(() => navigate("/stock-transfer"));
//     } catch (err) {
//       const msg = err.response?.data?.message || err.message || "Failed to create stock flow.";
//       const errProds = err.response?.data?.data || [];
//       if (errProds.length) {
//         const errorList = errProds.map((ep) => {
//           const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
//           return {
//             prod_uuid:    ep.prod_uuid,
//             partial_code: local?.partial_code || ep.prod_uuid,
//             title:        local?.title        || ep.prod_uuid,
//             errors:       [`Count ${ep.count}, status ${ep.status} — inventory mismatch`],
//           };
//         });
//         setProductErrors(errorList);
//       }
//       MySwal.fire({ icon: "error", title: "Error", text: msg });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── Table columns ─────────────────────────────────────────────────────────
//   const columns = useMemo(() => {
//     const errorMap = Object.fromEntries(productErrors.map((e) => [e.prod_uuid, e.errors]));
//     return [
//       { title: "#", render: (_, __, i) => i + 1, width: "50px" },
//       {
//         title: "Barcode / Code",
//         dataIndex: "partial_code",
//         render: (text, record) => (
//           <span>
//             <span className="badge badge-primary">{text}</span>
//             {errorMap[record.prod_uuid] && (
//               <div className="mt-1">
//                 {errorMap[record.prod_uuid].map((err, i) => (
//                   <div key={i} className="text-danger small">
//                     <AlertTriangle size={12} className="me-1" />{err}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </span>
//         ),
//       },
//       { title: "Article Profile", dataIndex: "article_profile_name" },
//       { title: "Warehouse",       dataIndex: "warehouse_name" },
//       {
//         title: "Status", dataIndex: "status",
//         render: (t) => (
//           <span className={`badge ${STATUS_BADGE[t] || "badge-info"}`}>
//             {t?.toUpperCase() || "N/A"}
//           </span>
//         ),
//       },
//       {
//         title: "Available", dataIndex: "count",
//         render: (t) => <span className="badge badge-info">{t}</span>,
//       },
//       {
//         title: "Transfer Qty", dataIndex: "quantity_to_transfer",
//         render: (text, record) => (
//           <input type="number" className="form-control form-control-sm" style={{ width: "80px" }}
//             value={text} min="1" max={record.count}
//             onChange={(e) => handleQtyChange(record.prod_uuid, e.target.value)} />
//         ),
//       },
//       {
//         title: "Action", width: "80px",
//         render: (_, record) => (
//           <button type="button" className="btn btn-sm btn-danger"
//             onClick={() => handleRemoveProduct(record.prod_uuid, record.partial_code)}
//             title="Remove">
//             <Trash2 size={14} />
//           </button>
//         ),
//       },
//     ];
//   }, [productErrors, handleQtyChange, handleRemoveProduct]);

//   // ── Render ────────────────────────────────────────────────────────────────
//   return (
//     <div className="page-wrapper">
//       <div className="content">

//         {/* Page Header */}
//         <div className="page-header">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>Create Stock Flow</h4>
//               <h6>Scan or import products to create a stock transfer</h6>
//             </div>
//           </div>
//           <ul className="table-top-head">
//             <li>
//               <Link to="/stock-transfer" className="btn btn-secondary btn-sm">
//                 <ArrowLeft size={16} className="me-1" />Back
//               </Link>
//             </li>
//             <li>
//               <OverlayTrigger placement="top" overlay={<Tooltip>Collapse</Tooltip>}>
//                 <Link id="collapse-header" className={headerToggle ? "active" : ""}
//                   onClick={() => dispatch(setToogleHeader(!headerToggle))}>
//                   <ChevronUp className="feather-chevron-up" />
//                 </Link>
//               </OverlayTrigger>
//             </li>
//           </ul>
//         </div>

//         {/* Draft loading */}
//         {loadingDraft && (
//           <div className="alert alert-light d-flex align-items-center mb-3">
//             <span className="spinner-border spinner-border-sm me-2" />
//             Checking for saved draft…
//           </div>
//         )}

//         {/* Active draft banner */}
//         {!loadingDraft && currentStockId && (
//           <div className="alert alert-warning d-flex align-items-center justify-content-between mb-3">
//             <div className="d-flex align-items-center">
//               <RefreshCw size={16} className="me-2" />
//               <strong>Active Draft:</strong>
//               <span className="ms-2 badge badge-warning">{currentStockId}</span>
//               {isSyncing && <span className="spinner-border spinner-border-sm ms-2 text-muted" />}
//             </div>
//             {scannedProducts.length > 0 && (
//               <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleDiscardDraft}>
//                 <Trash2 size={14} className="me-1" />Discard Draft
//               </button>
//             )}
//           </div>
//         )}

//         {/* Product errors */}
//         {productErrors.length > 0 && (
//           <div className="alert alert-danger mb-3">
//             <h6 className="mb-2">
//               <AlertTriangle size={16} className="me-2" />
//               {productErrors.length} product(s) failed validation — correct them and resubmit.
//             </h6>
//             <ul className="mb-0">
//               {productErrors.map((e, i) => (
//                 <li key={i}>
//                   <strong>{e.title || e.partial_code}</strong> ({e.partial_code}):{" "}
//                   {e.errors.join("; ")}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* ── Stock Flow Details card ── */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <h5 className="mb-4">Stock Flow Details</h5>

//             {/* From Warehouse — read-only */}
//             {currentUser?.warehouse_name && (
//               <div className="row mb-3">
//                 <div className="col-lg-6">
//                   <label className="form-label">From Warehouse</label>
//                   <input type="text" className="form-control bg-light"
//                     value={currentUser.warehouse_name} readOnly disabled />
//                   <small className="text-muted">Your assigned warehouse (set by your account)</small>
//                 </div>
//               </div>
//             )}

//             <div className="row mb-3">
//               {/* ── Stock Request field (replaces To Warehouse) ── */}
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   Stock Request <span className="text-danger"></span>
//                   {isRequestLocked && (
//                     <Lock size={13} className="ms-1 text-warning" title="Pre-selected from Stock Requests page" />
//                   )}
//                 </label>

//                 {isRequestLocked ? (
//                   /* Locked: navigated from StockRequest page */
//                   <>
//                     <div className="d-flex align-items-center gap-2">
//                       <input
//                         type="text"
//                         className="form-control bg-light"
//                         value={formData.stock_request_id?.label || ""}
//                         readOnly
//                         disabled
//                       />
//                       <button
//                         type="button"
//                         className="btn btn-sm btn-outline-secondary text-nowrap"
//                         title="Unlock to choose a different request"
//                         onClick={() => {
//                           dispatch(clearFlowSourceRequest());
//                           setField("stock_request_id", null);
//                         }}
//                       >
//                         <X size={13} className="me-1" />Change
//                       </button>
//                     </div>
//                     <small className="text-muted">
//                       Pre-selected from the Stock Requests page. Click "Change" to pick a different one.
//                     </small>
//                   </>
//                 ) : (
                 
//                   <>
//                     <Select
//                       options={stockRequestOptions}
//                       value={formData.stock_request_id}
//                       onChange={(opt) => setField("stock_request_id", opt)}
//                       placeholder={reqDropdownLoading ? "Loading requests…" : "Select a stock request"}
//                       isClearable
//                       isLoading={reqDropdownLoading}
//                       noOptionsMessage={() =>
//                         reqDropdownLoading ? "Loading…" : "No approved requests found"
//                       }
//                     />
//                     <small className="text-muted">
//                       Showing approved requests available for stock flow
//                     </small>
//                   </>
//                 )}
//               </div>

//               {/* Transport */}
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   Transport <span className="text-danger">*</span>
//                   {transportOptions.length === 0 && (
//                     <span className="spinner-border spinner-border-sm ms-2" />
//                   )}
//                 </label>
//                 <Select
//                   options={transportOptions}
//                   value={formData.transport}
//                   onChange={(opt) => setField("transport", opt)}
//                   placeholder={transportOptions.length === 0 ? "Loading…" : "Select transport method"}
//                   isLoading={transportOptions.length === 0}
//                 />
//                 {transportOptions.length > 0 && !formData.transport && (
//                   <small className="text-muted">
//                     Defaults to <strong>{transportOptions[0]?.label}</strong> if not selected
//                   </small>
//                 )}
//               </div>
//             </div>

//             <div className="row mb-3">
//               <div className="col-lg-6">
//                 <label className="form-label">Description</label>
//                 <textarea className="form-control" value={formData.description || ""}
//                   onChange={(e) => setField("description", e.target.value)}
//                   rows="2" placeholder="Notes about this transfer…" />
//               </div>
//               <div className="col-lg-6">
//                 <label className="form-label">Total Quantity</label>
//                 <input type="number" className="form-control bg-light" value={totalQty}
//                   readOnly disabled style={{ fontWeight: "bold", fontSize: "1.1rem" }} />
//                 <small className="text-muted">Auto-calculated from scanned products</small>
//               </div>
//             </div>

//             {/* Bill / Invoice upload */}
//             <div className="row">
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   <File size={16} className="me-1" />Bill / Invoice (Optional)
//                 </label>
//                 {!billPreview ? (
//                   <div className="border border-dashed rounded p-3 text-center">
//                     <input ref={billFileRef} type="file" id="billFileInput" className="d-none"
//                       accept=".pdf,.jpg,.jpeg,.png" onChange={handleBillChange} />
//                     <label htmlFor="billFileInput" className="mb-0" style={{ cursor: "pointer" }}>
//                       <Upload size={40} className="text-muted mb-2 d-block mx-auto" />
//                       <span className="text-muted">Click to upload — PDF, JPG, PNG max 5 MB</span>
//                     </label>
//                   </div>
//                 ) : (
//                   <div className="border rounded p-3 d-flex align-items-center justify-content-between">
//                     <div className="d-flex align-items-center">
//                       <File size={28} className="text-primary me-3" />
//                       <div>
//                         <p className="mb-0 fw-semibold">{billPreview.name}</p>
//                         <small className="text-muted">{billPreview.size}</small>
//                       </div>
//                     </div>
//                     <button type="button" className="btn btn-sm btn-danger" onClick={handleRemoveBill}>
//                       <X size={14} />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>

//           </div>
//         </div>

//         {/* ── Scan Barcode card ── */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <div className="d-flex align-items-center mb-3">
//               <Camera size={22} className="text-primary me-2" />
//               <h5 className="mb-0">Scan Barcode</h5>
//               <span className="badge badge-success ms-2" style={{ fontSize: "0.7rem" }}>Always Active</span>
//             </div>

//             {!canSync ? (
//               <div className="alert alert-info d-flex align-items-center mb-3">
//                 <span className="me-2 flex-shrink-0">ℹ</span>
//                 <div>
//                   <strong>Scanning is available now.</strong> Products will be held locally.
//                   <span className="d-block mt-1 text-muted small">
//                     Select a <strong>Stock Request</strong> above to auto-save each scan to draft.
//                   </span>
//                 </div>
//               </div>
//             ) : (
//               <div className="alert alert-success d-flex align-items-center mb-3">
//                 <span className="me-2 flex-shrink-0">✓</span>
//                 <div>
//                   <strong>Ready to scan &amp; auto-save!</strong> Each scan is saved to draft.
//                   <div className="mt-1">
//                     Request: <strong>{formData.stock_request_id?.label}</strong>
//                     {!formData.transport && effectiveTransport && (
//                       <span className="ms-2 badge badge-secondary" style={{ fontSize: "0.75rem" }}>
//                         Transport: {effectiveTransport.label} (default)
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="row align-items-end">
//               <div className="col-lg-8">
//                 <label className="form-label">
//                   Scan or Enter Barcode
//                   {(isScanning || isSyncing) && (
//                     <span className="spinner-border spinner-border-sm ms-2" />
//                   )}
//                 </label>
//                 <input ref={barcodeRef} type="text" className="form-control"
//                   value={barcodeInput}
//                   onChange={(e) => setBarcodeInput(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") { e.preventDefault(); handleScan(barcodeInput); }
//                   }}
//                   placeholder="Use scanner or type barcode then press Enter"
//                   disabled={isScanning} autoFocus />
//               </div>
//               <div className="col-lg-4">
//                 <button type="button" className="btn btn-primary w-100"
//                   onClick={() => handleScan(barcodeInput)}
//                   disabled={!barcodeInput.trim() || isScanning}>
//                   {isScanning
//                     ? <><span className="spinner-border spinner-border-sm me-2" />Scanning…</>
//                     : <><Plus size={16} className="me-1" />Add Product</>}
//                 </button>
//               </div>
//             </div>

//             {scannedProducts.length > 0 && (
//               <div className="alert alert-success d-flex align-items-center mt-3 mb-0">
//                 <Package size={18} className="me-2" />
//                 <strong>
//                   {scannedProducts.length} product(s) &nbsp;|&nbsp; Total Qty: {totalQty}
//                   {isSyncing && <span className="ms-2 text-muted small">saving…</span>}
//                   {!canSync && (
//                     <span className="ms-2 text-warning small">
//                       ⚠ Unsaved — select a Stock Request to persist
//                     </span>
//                   )}
//                 </strong>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Scanned Products Table ── */}
//         {scannedProducts.length > 0 && (
//           <div className="card mb-3">
//             <div className="card-body">
//               <div className="d-flex align-items-center justify-content-between mb-3">
//                 <h5 className="mb-0">
//                   <Package size={18} className="me-2" />
//                   Scanned Products ({scannedProducts.length})
//                 </h5>
//                 <button type="button" className="btn btn-sm btn-outline-danger"
//                   onClick={() => handleRemoveSelected(scannedProducts.map((p) => p.prod_uuid))}>
//                   <Trash2 size={14} className="me-1" />Remove All
//                 </button>
//               </div>
//               <div className="table-responsive">
//                 <Table columns={columns} dataSource={scannedProducts} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Transfer Summary ── */}
//         {scannedProducts.length > 0 && (
//           <div className="alert alert-warning mb-3">
//             <strong>Transfer Summary</strong>
//             <ul className="mb-0 mt-2">
//               <li>Total Products: {scannedProducts.length}</li>
//               <li>Total Quantity: {totalQty} units</li>
//               {currentUser?.warehouse_name && <li>From: {currentUser.warehouse_name}</li>}
//               {formData.stock_request_id && (
//                 <li>Stock Request: {formData.stock_request_id.label}</li>
//               )}
//               {effectiveTransport && (
//                 <li>Transport: {effectiveTransport.label}{!formData.transport ? " (default)" : ""}</li>
//               )}
//               <li>Status after submit: <strong>in-transit</strong></li>
//               {currentStockId && <li>Draft Stock ID: <strong>{currentStockId}</strong></li>}
//             </ul>
//             <small className="text-muted d-block mt-1">Inventory will be updated on submission.</small>
//           </div>
//         )}

//         {/* ── Submit / Cancel ── */}
//         <div className="col-lg-12">
//           <div className="btn-addproduct mb-4">
//             <Link to="/stock-transfer" className="btn btn-cancel me-2">Cancel</Link>
//             <button type="button" className="btn btn-submit" onClick={handleSubmit}
//               disabled={submitting || scannedProducts.length === 0 || !canSync}>
//               {submitting
//                 ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
//                 : <><Send size={16} className="me-1" />Create Stock Flow</>}
//             </button>
//           </div>
//         </div>

//       </div>


  
// <Modal
//   show={profileModal.open}
//   onHide={() => { setProfileModal({ open: false, profiles: [], partial_code: "" }); barcodeRef.current?.focus(); }}
//   centered
//   size="sm"
// >
//   <Modal.Header>
//     <Modal.Title style={{ fontSize: "1rem" }}>
//       <Package size={16} className="me-2 text-primary" />
//       Select Article Profile
//     </Modal.Title>
//     <button
//       className="btn-close"
//       onClick={() => { setProfileModal({ open: false, profiles: [], partial_code: "" }); barcodeRef.current?.focus(); }}
//     />
//   </Modal.Header>
//   <Modal.Body>
//     <p className="text-muted small mb-3">
//       Barcode <strong>{profileModal.partial_code}</strong> matches multiple article profiles.
//       Select one to add:
//     </p>
//     <div className="d-flex flex-column gap-2">
//      {profileModal.profiles.map((profile) => (
//   <button
//     key={profile.article_profile_id}
//     type="button"
//     className="btn btn-outline-primary text-start w-100"
//     style={{ padding: "10px 14px" }}
//     onClick={async () => {
//       const code = profileModal.partial_code;
//       setProfileModal({ open: false, profiles: [], partial_code: "" });
//       // Pass profile.product_id as product_id — backend needs this to disambiguate
//       await doScanAndAdd(code, profile.product_id);
//     }}
//   >
//     <span className="d-block fw-semibold" style={{ fontSize: "0.875rem" }}>
//       {profile.article_profile_name}
//     </span>
//     <span className="text-muted" style={{ fontSize: "0.75rem" }}>
//       {profile.article_profile_name}
//     </span>
//   </button>
// ))}
//     </div>
//   </Modal.Body>
// </Modal>
//     </div>
//   );
// };

// export default AddStockFlow;





// import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Select from "react-select";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import {
//   ArrowLeft, ChevronUp, Camera, Plus, Package, Send,
//   Trash2, Upload, RefreshCw, AlertTriangle, File, X, Lock,
// } from "feather-icons-react/build/IconComponents";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import { setToogleHeader } from "../../core/redux/action";
// import { scanProduct } from "../../core/redux/slices/productSlice";
// import {
//   fetchStockRequestDropdown,
//   selectFlowSourceRequest,
//   selectReqDropdown,
//   selectReqDropdownLoading,
//   clearFlowSourceRequest,
// } from "../../core/redux/slices/stockSlice";
// import AuthService from "../../services/authService";
// import Table from "../../core/pagination/datatable";
// import { Modal } from "react-bootstrap";

// const MySwal = withReactContent(Swal);

// const toast = (icon, title, text, timer = 2000) =>
//   MySwal.fire({ icon, title, text, timer, showConfirmButton: false, toast: true, position: "top-end" });

// const STATUS_BADGE = {
//   good:          "badge-success",
//   faulty:        "badge-info",
//   "broke/burnt": "badge-danger",
//   broken:        "badge-danger",
// };

// const TRANSFERABLE_STATUSES = ["good", "faulty", "broke/burnt"];

// const INITIAL_FORM = {
//   stock_request_id: null,
//   invoice:          undefined,
//   transport:        null,
//   description:      "",
// };

// const toApiProdItem = (p) => ({
//   prod_uuid:            p.prod_uuid,
//   partial_code:         p.partial_code,
//   article_profile_id:   p.article_profile_id,
//   article_profile_name: p.article_profile_name,
//   status:               p.status,
//   count:                p.quantity_to_transfer || 1,
// });


// const AddStockFlow = () => {
//   const dispatch     = useDispatch();
//   const navigate     = useNavigate();
//   const headerToggle = useSelector((s) => s.toggle_header);
//   const currentUser  = useSelector((s) => s.user?.currentUser);

//   const flowSourceRequest  = useSelector(selectFlowSourceRequest);
//   const reqDropdownRaw     = useSelector(selectReqDropdown);
//   const reqDropdownLoading = useSelector(selectReqDropdownLoading);

//   const [profileModal, setProfileModal] = useState({
//     open:         false,
//     profiles:     [],
//     partial_code: "",
//   });

//   const stockRequestOptions = useMemo(
//     () =>
//       reqDropdownRaw.map((r) => ({
//         value: r.stock_req_id,
//         label: `#${r.stock_req_id}`,
//       })),
//     [reqDropdownRaw],
//   );

//   const isRequestLocked = !!flowSourceRequest;

//   const [transportOptions, setTransportOptions] = useState([]);
//   const [formData, setFormData]                 = useState(INITIAL_FORM);
//   const setField = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

//   const [scannedProducts, setScannedProducts] = useState([]);
//   const scannedProductsRef                    = useRef([]);


//   const [currentStockId, setCurrentStockId]     = useState(null);
//   const [syncInfo, setSyncInfo]     = useState(null);
  
//   const currentStockIdRef                        = useRef(null);

//   const setStockId = (id) => {
//     currentStockIdRef.current = id;
//     setCurrentStockId(id);
//   };

//   const [loadingDraft,  setLoadingDraft]  = useState(true);
//   const [isScanning,    setIsScanning]    = useState(false);
//   const [isSyncing,     setIsSyncing]     = useState(false);
//   const [submitting,    setSubmitting]    = useState(false);
//   const [productErrors, setProductErrors] = useState([]);

//   const [barcodeInput, setBarcodeInput] = useState("");
//   const barcodeRef = useRef(null);

//   const [billPreview, setBillPreview] = useState(null);
//   const billFileRef = useRef(null);

//   const totalQty = useMemo(
//     () => scannedProducts.reduce((s, p) => s + (parseInt(p.quantity_to_transfer) || 0), 0),
//     [scannedProducts],
//   );

//   const canSync            = !!(formData.stock_request_id && (formData.transport || transportOptions[0]));
//   const effectiveTransport = formData.transport || transportOptions[0] || null;

//   // ── Bootstrap ─────────────────────────────────────────────────────────────
//   useEffect(() => {
//     (async () => {
//       await Promise.all([
//         loadTransportOptions(),
//         dispatch(fetchStockRequestDropdown()),
//       ]);

//       if (flowSourceRequest) {
//         setField("stock_request_id", {
//           value: flowSourceRequest.value,
//           label: flowSourceRequest.label,
//         });
//       }

//       await restoreDraft();
//     })();

//     return () => { dispatch(clearFlowSourceRequest()); };
//     // eslint-disable-next-line
//   }, []);

//   // Re-sync whenever the linked request or transport changes
//   // (only if products are already in the list)
//   useEffect(() => {
//     if (scannedProductsRef.current.length > 0 && canSync) {
//       syncToDb(scannedProductsRef.current, formData);
//     }
//     // eslint-disable-next-line
//   }, [formData.stock_request_id, formData.transport]);

//   const setScanned = (val) => {
//     setScannedProducts((prev) => {
//       const next = typeof val === "function" ? val(prev) : val;
//       scannedProductsRef.current = next;
//       return next;
//     });
//   };

//   // ── Load transport options ────────────────────────────────────────────────
//   const loadTransportOptions = async () => {
//     try {
//       const res     = await AuthService.getStockFlowOptions();
//       const options = res.data?.data;
//       if (!options) {
//         toast("error", "Options Error", "Failed to load transport options.", 5000);
//         return;
//       }
//       const toOpt = (v) =>
//         typeof v === "object" && v !== null && v.value !== undefined
//           ? v
//           : {
//               value: String(v),
//               label: String(v)
//                 .split("_")
//                 .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//                 .join(" "),
//             };
//       const transportOpts = (options.transport || []).map(toOpt);
//       setTransportOptions(transportOpts);
//       if (!transportOpts.length)
//         console.warn("Transport options empty — check stock_flow.transport enum in DB.");
//     } catch (e) {
//       console.error("loadTransportOptions error:", e);
//       toast("error", "Options Error", `Could not load transport options: ${e.message}`, 5000);
//     }
//   };

//   // ── Restore draft ─────────────────────────────────────────────────────────
//   // FIX: was calling AuthService.getExistingStock() which does not exist.
//   // Correct method is AuthService.get_existing_stock_flow()
//   const restoreDraft = async () => {
//     setLoadingDraft(true);
//     try {
//       const res  = await AuthService.get_existing_stock_flow();
//       const body = res.data;
//       if (!body.is_found || !body.data) return;

//       const lot = body.data;
//       setStockId(lot.stock_id);
//       setFormData((prev) => ({ ...prev, description: lot.description || "" }));

//       if (lot.prod_arr?.length) {
//         const restored = lot.prod_arr
//           .filter(Boolean)
//           .map((p) => ({
//             prod_uuid:            p.prod_uuid,
//             partial_code:         p.partial_code,
//             article_profile_id:   p.article_profile_id || "",
//             article_profile_name: p.article_profile_name || "—",
//             warehouse_name:       p.warehouse_name || "—",
//             count:                p.available ?? p.count ?? 0,
//             status:               p.status,
//             quantity_to_transfer: p.count || 1,
//           }));
//         setScanned(restored);
//         MySwal.fire({
//           icon:              "info",
//           title:             "Draft Restored",
//           html:              `<p><strong>${restored.length}</strong> product(s) from your previous session.</p>
//                               <small class="text-muted">Stock ID: ${lot.stock_id}</small>`,
//           timer:             3500,
//           showConfirmButton: false,
//         });
//       }
//     } catch (err) {
//       console.warn("No draft found:", err.message);
//     } finally {
//       setLoadingDraft(false);
//     }
//   };

//   // ── Sync to DB ────────────────────────────────────────────────────────────
//   // FIX: Use currentStockIdRef instead of currentStockId state so the
//   // callback always sees the latest value without stale closure issues.
//   const syncToDb = useCallback(async (products, fd) => {
//     if (!fd.stock_request_id) return;
//     if (!products.length) return;

//     const transport = fd.transport || transportOptions[0] || null;
//     if (!transport) {
//       console.warn("syncToDb: no transport available — skipping.");
//       return;
//     }

//     setIsSyncing(true);
//     try {
//       const payload = {
//         request_id:     fd.stock_request_id.value,
//         transportation: transport.value,
//         prod_arr:       products.map(toApiProdItem),
//         description:    fd.description || undefined,
//         invoice:        fd.invoice || undefined
//       };

//       console.log("syncToDb payload:", payload);
//       // const data = await AuthService.stockFlowSync(payload

//      const res = await AuthService.stockFlowSync(payload);

// const data = res.data?.data;


// setSyncInfo(data);


// if (data?.stock_id && !currentStockIdRef.current) {
//   setStockId(data.stock_id);
// }


//       // console.log("Sync success:", res.data?.message);
//     } catch (err) {
//       const msg = err.response?.data?.message || "Failed to sync draft";
//       toast("error", "Sync Error", msg, 3000);
//       console.error("syncToDb error:", err.response?.data || err);
//     } finally {
//       setIsSyncing(false);
//     }

//     // eslint-disable-next-line
//   }, [transportOptions]);

//   // ── Scan & add product ────────────────────────────────────────────────────
//   const doScanAndAdd = useCallback(async (code, product_id = null, prefetchedProduct = null) => {
//     setIsScanning(true);
//     try {
//       let product;

//       if (prefetchedProduct) {
//         product = prefetchedProduct;
//       } else {
//         const result = await dispatch(scanProduct({ code, product_id })).unwrap();
//         product = result?.data ?? result;
//         console.log("doScanAndAdd result:", result);
//       }

//       if (!product?.prod_uuid) throw new Error("Product not found");

//       if (currentUser?.warehouse_id && product.warehouse_id !== currentUser.warehouse_id) {
//         MySwal.fire({
//           icon:  "error",
//           title: "Wrong Warehouse",
//           text:  `This product belongs to "${product.warehouse_name}", not your assigned warehouse.`,
//         });
//         return;
//       }

//       if (!TRANSFERABLE_STATUSES.includes(product.status)) {
//         MySwal.fire({
//           icon:  "error",
//           title: "Invalid Status",
//           text:  `"${product.partial_code || code}" has status "${product.status}". ` +
//                  `Only ${TRANSFERABLE_STATUSES.join(", ")} can be transferred.`,
//         });
//         return;
//       }

//       if (scannedProductsRef.current.find((p) => p.prod_uuid === product.prod_uuid)) {
//         toast("warning", "Already Scanned", `Product "${product.partial_code || code}" is already in the list.`);
//         setBarcodeInput("");
//         return;
//       }

//       const newProd = {
//         prod_uuid:            product.prod_uuid,
//         partial_code:         product.partial_code || code,
//         article_profile_id:   product.article_profile_id,
//         article_profile_name: product.article_profile_name || "—",
//         warehouse_name:       product.warehouse_name || "—",
//         count:                product.count ?? 0,
//         status:               product.status,
//         quantity_to_transfer: 1,
//       };

//       const updated = [...scannedProductsRef.current, newProd];
//       setScanned(updated);
//       setBarcodeInput("");

//       // Read formData from the closure — it is always current since
//       // doScanAndAdd is recreated whenever formData changes (via dep array below).
//       if (canSync) {
//         await syncToDb(updated, formData);
//         toast("success", "Scanned & Saved", newProd.partial_code);
//       } else {
//         toast("info", "Scanned (Local)",
//           `"${newProd.partial_code}" added. Select a Stock Request above to save draft.`);
//       }
//     } catch (err) {
//       const msg = err.response?.data?.message || err.message || "Product not found";
//       MySwal.fire({ icon: "error", title: "Not Found", text: msg });
//     } finally {
//       setIsScanning(false);
//       barcodeRef.current?.focus();
//     }
//     // eslint-disable-next-line
//   }, [dispatch, formData, canSync, syncToDb, currentUser]);

//   // ── Handle barcode scan ───────────────────────────────────────────────────
//   const handleScan = useCallback(async (partial_code) => {
//     const code = (partial_code || "").trim();
//     if (!code) return;

//     // if (scannedProductsRef.current.find((p) => p.partial_code === code)) {
//     //   toast("warning", "Already Scanned", `Barcode "${code}" is already in the list.`);
//     //   setBarcodeInput("");
//     //   return;
//     // }

//     setIsScanning(true);
//     try {
//       const profileRes = await AuthService.getProfileByCode(code);
//       const raw        = profileRes.data?.data;

//       const isArray  = Array.isArray(raw);
//       const profiles = isArray ? raw : null;

//       if (profiles && profiles.length > 1) {
//         setProfileModal({ open: true, profiles, partial_code: code });
//         setBarcodeInput("");
//         setIsScanning(false);
//         return;
//       }

//       if (!isArray && raw?.prod_uuid) {
//         await doScanAndAdd(code, null, raw);
//         return;
//       }

//       if (isArray && profiles.length === 1) {
//         await doScanAndAdd(code, profiles[0].product_id);
//         return;
//       }

//       await doScanAndAdd(code);
//     } catch (err) {
//       const msg = err.response?.data?.message || err.message || "Product not found";
//       MySwal.fire({ icon: "error", title: "Not Found", text: msg });
//       setIsScanning(false);
//     }
//     // eslint-disable-next-line
//   }, [formData, canSync, syncToDb, currentUser, doScanAndAdd]);

//   // ── Remove single product ─────────────────────────────────────────────────
//   // FIX: was calling AuthService.removeLotProduct() which does not exist.
//   // Correct method is AuthService.removeStockProduct(partial_code)
//   const handleRemoveProduct = useCallback((prod_uuid, partial_code) => {
//     MySwal.fire({
//       title:              "Remove Product?",
//       text:               "This will remove it from your draft.",
//       icon:               "warning",
//       showCancelButton:   true,
//       confirmButtonColor: "#d33",
//       confirmButtonText:  "Remove",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       try {
//         if (currentStockIdRef.current) {
//           const res = await AuthService.removeStockProduct(partial_code);
//           setScanned((prev) => prev.filter((p) => p.prod_uuid !== prod_uuid));
//           if (res.data?.draft_deleted) {
//             setStockId(null);
//             toast("info", "Draft Cleared", "Last product removed. Draft deleted.");
//           } else {
//             toast("success", "Removed", `"${partial_code}" removed.`);
//           }
//         } else {
//           setScanned((prev) => prev.filter((p) => p.prod_uuid !== prod_uuid));
//           toast("success", "Removed", `"${partial_code}" removed.`);
//         }
//       } catch (err) {
//         toast("error", "Error", err.response?.data?.message || "Failed to remove.", 3000);
//       }
//     });
//     // currentStockIdRef is a ref so doesn't need to be in dep array
//     // eslint-disable-next-line
//   }, []);

//   // ── Remove all ────────────────────────────────────────────────────────────
//   // FIX: Same removeStockProduct fix applied here
//   const handleRemoveSelected = useCallback((selectedUuids) => {
//     MySwal.fire({
//       title:              `Remove ${selectedUuids.length} product(s)?`,
//       icon:               "warning",
//       showCancelButton:   true,
//       confirmButtonColor: "#d33",
//       confirmButtonText:  "Remove All",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       const toRemove = scannedProducts.filter((p) => selectedUuids.includes(p.prod_uuid));
//       if (currentStockIdRef.current) {
//         for (const p of toRemove) {
//           try { await AuthService.removeStockProduct(p.partial_code); } catch { /* continue */ }
//         }
//       }
//       const remaining = scannedProducts.filter((p) => !selectedUuids.includes(p.prod_uuid));
//       setScanned(remaining);
//       if (remaining.length === 0) setStockId(null);
//       toast("success", "Removed", `${toRemove.length} product(s) removed.`);
//     });
//   }, [scannedProducts]);

//   // ── Discard draft ─────────────────────────────────────────────────────────
//   const handleDiscardDraft = () => {
//     MySwal.fire({
//       title:              "Discard entire draft?",
//       text:               "All scanned products will be removed.",
//       icon:               "warning",
//       showCancelButton:   true,
//       confirmButtonColor: "#d33",
//       confirmButtonText:  "Yes, discard",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       try {
//         if (currentStockIdRef.current) await AuthService.discardDraft();
//         setScanned([]);
//         setStockId(null);
//         toast("info", "Draft Discarded", "All products cleared.");
//       } catch (err) {
//         toast("error", "Error", err.response?.data?.message || "Failed to discard.", 3000);
//       }
//     });
//   };

//   // ── Qty change ────────────────────────────────────────────────────────────
//   const handleQtyChange = useCallback((prod_uuid, newQty) => {
//     setScanned((prev) =>
//       prev.map((p) => {
//         if (p.prod_uuid !== prod_uuid) return p;
//         const qty = parseInt(newQty) || 0;
//         if (qty > p.count) {
//           toast("warning", "Insufficient Stock", `Only ${p.count} units available.`);
//           return p;
//         }
//         return { ...p, quantity_to_transfer: qty };
//       }),
//     );
//   }, []);

//   // ── Bill / Invoice ────────────────────────────────────────────────────────
//   const handleBillChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (!["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
//       toast("warning", "Invalid File", "PDF, JPG, or PNG only.");
//       return;
//     }
//     if (file.size > 5 * 1024 * 1024) {
//       toast("warning", "Too Large", "Max 5 MB.");
//       return;
//     }
//     setBillPreview({ file, name: file.name, size: (file.size / 1024).toFixed(2) + " KB" });
//   };

//   const handleRemoveBill = () => {
//     setBillPreview(null);
//     if (billFileRef.current) billFileRef.current.value = "";
//   };

//   // ── Submit ────────────────────────────────────────────────────────────────
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setProductErrors([]);

//     if (!scannedProducts.length) {
//       toast("warning", "No Products", "Scan at least one product."); return;
//     }
//     if (!formData.stock_request_id) {
//       toast("warning", "Missing", "Stock Request is required."); return;
//     }
//     if (!effectiveTransport) {
//       toast("warning", "Missing", "No transport options available yet."); return;
//     }
//     if (scannedProducts.some((p) => p.quantity_to_transfer <= 0)) {
//       toast("warning", "Invalid Qty", "All quantities must be greater than 0."); return;
//     }

//     // Final sync before submit to ensure DB is up to date
//     await syncToDb(scannedProducts, formData);

//     setSubmitting(true);
//     try {
//       const res  = await AuthService.stockFlowSubmit();
//       const body = res.data;

//       if (!body.success) {
//         const errProds = body.data || [];
//         if (errProds.length) {
//           const errorList = errProds.map((ep) => {
//             const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
//             return {
//               prod_uuid:    ep.prod_uuid,
//               partial_code: local?.partial_code || ep.prod_uuid,
//               errors:       [`Count ${ep.count}, status "${ep.status}" — inventory mismatch`],
//             };
//           });
//           setProductErrors(errorList);
//           MySwal.fire({
//             icon:  "error",
//             title: "Submission Failed",
//             html:  `<p>${body.message}</p><p class="text-muted small">Inconsistent products are highlighted below.</p>`,
//           });
//           return;
//         }
//         throw new Error(body.message || "Submission failed.");
//       }

//       MySwal.fire({
//         icon:  "success",
//         title: "Stock Flow Created!",
//         html:  `
//           <p><strong>Stock ID:</strong> ${currentStockIdRef.current || "—"}</p>
//           <p><strong>Products:</strong> ${scannedProducts.length}</p>
//           <p><strong>Total Quantity:</strong> ${totalQty}</p>
//           ${formData.stock_request_id
//             ? `<p><strong>Request:</strong> ${formData.stock_request_id.label}</p>`
//             : ""}
//           <p class="text-muted small">Status set to <strong>in-transit</strong></p>
//         `,
//         confirmButtonText: "View Stock Flows",
//       }).then(() => navigate("/stock-transfer"));
//     } catch (err) {
//       const msg      = err.response?.data?.message || err.message || "Failed to create stock flow.";
//       const errProds = err.response?.data?.data || [];
//       if (errProds.length) {
//         const errorList = errProds.map((ep) => {
//           const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
//           return {
//             prod_uuid:    ep.prod_uuid,
//             partial_code: local?.partial_code || ep.prod_uuid,
//             errors:       [`Count ${ep.count}, status "${ep.status}" — inventory mismatch`],
//           };
//         });
//         setProductErrors(errorList);
//       }
//       MySwal.fire({ icon: "error", title: "Error", text: msg });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── Table columns ─────────────────────────────────────────────────────────
//   const columns = useMemo(() => {
//     const errorMap = Object.fromEntries(productErrors.map((e) => [e.prod_uuid, e.errors]));
//     return [
//       { title: "#", render: (_, __, i) => i + 1, width: "50px" },
//       {
//         title:     "Barcode / Code",
//         dataIndex: "partial_code",
//         render:    (text, record) => (
//           <span>
//             <span className="badge badge-primary">{text}</span>
//             {errorMap[record.prod_uuid] && (
//               <div className="mt-1">
//                 {errorMap[record.prod_uuid].map((err, i) => (
//                   <div key={i} className="text-danger small">
//                     <AlertTriangle size={12} className="me-1" />{err}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </span>
//         ),
//       },
//       { title: "Article Profile", dataIndex: "article_profile_name" },
//       { title: "Warehouse",       dataIndex: "warehouse_name" },
//       {
//         title:     "Status",
//         dataIndex: "status",
//         render:    (t) => (
//           <span className={`badge ${STATUS_BADGE[t] || "badge-info"}`}>
//             {t?.toUpperCase() || "N/A"}
//           </span>
//         ),
//       },
//       {
//         title:     "Available",
//         dataIndex: "count",
//         render:    (t) => <span className="badge badge-info">{t}</span>,
//       },
//       {
//         title:     "Transfer Qty",
//         dataIndex: "quantity_to_transfer",
//         render:    (text, record) => (
//           <input
//             type="number"
//             className="form-control form-control-sm"
//             style={{ width: "80px" }}
//             value={text}
//             min="1"
//             max={record.count}
//             onChange={(e) => handleQtyChange(record.prod_uuid, e.target.value)}
//           />
//         ),
//       },
//       {
//         title:  "Action",
//         width:  "80px",
//         render: (_, record) => (
//           <button
//             type="button"
//             className="btn btn-sm btn-danger"
//             onClick={() => handleRemoveProduct(record.prod_uuid, record.partial_code)}
//             title="Remove"
//           >
//             <Trash2 size={14} />
//           </button>
//         ),
//       },
//     ];
//   }, [productErrors, handleQtyChange, handleRemoveProduct]);

//   // ── Render ────────────────────────────────────────────────────────────────
//   return (
//     <div className="page-wrapper">
//       <div className="content">

//         {/* Page Header */}
//         <div className="page-header">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>Create Stock Flow</h4>
//               <h6>Scan or import products to create a stock transfer</h6>
//             </div>
//           </div>
//           <ul className="table-top-head">
//             <li>
//               <Link to="/stock-transfer" className="btn btn-secondary btn-sm">
//                 <ArrowLeft size={16} className="me-1" />Back
//               </Link>
//             </li>
//             <li>
//               <OverlayTrigger placement="top" overlay={<Tooltip>Collapse</Tooltip>}>
//                 <Link
//                   id="collapse-header"
//                   className={headerToggle ? "active" : ""}
//                   onClick={() => dispatch(setToogleHeader(!headerToggle))}
//                 >
//                   <ChevronUp className="feather-chevron-up" />
//                 </Link>
//               </OverlayTrigger>
//             </li>
//           </ul>
//         </div>

//         {/* Draft loading spinner */}
//         {loadingDraft && (
//           <div className="alert alert-light d-flex align-items-center mb-3">
//             <span className="spinner-border spinner-border-sm me-2" />
//             Checking for saved draft…
//           </div>
//         )}

//         {/* Active draft banner */}
//         {!loadingDraft && syncInfo && (
//   <div className="alert alert-warning d-flex flex-column mb-3">
    
//     <div className="d-flex align-items-center mb-2">
//       <RefreshCw size={16} className="me-2" />
//       <strong>Active Draft:</strong>
//       <span className="ms-2 badge badge-warning">
//         {syncInfo.stock_id}
//       </span>

//       {isSyncing && (
//         <span className="spinner-border spinner-border-sm ms-2 text-muted" />
//       )}
//     </div>

//     <div className="small">
//       <div><b>Request:</b> {syncInfo.stock_req_id}</div>
//       <div><b>From:</b> {syncInfo.source_name}</div>
//       <div><b>To:</b> {syncInfo.destination_name}</div>
//       <div><b>Supplier:</b> {syncInfo.supplier_name}</div>
//     </div>

//     {scannedProducts.length > 0 && (
//       <button
//         type="button"
//         className="btn btn-sm btn-outline-danger mt-2 align-self-start"
//         onClick={handleDiscardDraft}
//       >
//         <Trash2 size={14} className="me-1" />Discard Draft
//       </button>
//     )}
//   </div>
// )}


//         {/* Product-level errors from submit */}
//         {productErrors.length > 0 && (
//           <div className="alert alert-danger mb-3">
//             <h6 className="mb-2">
//               <AlertTriangle size={16} className="me-2" />
//               {productErrors.length} product(s) failed validation — correct them and resubmit.
//             </h6>
//             <ul className="mb-0">
//               {productErrors.map((e, i) => (
//                 <li key={i}>
//                   <strong>{e.partial_code}</strong>: {e.errors.join("; ")}
//                 </li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* ── Stock Flow Details ── */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <h5 className="mb-4">Stock Flow Details</h5>

//             {currentUser?.warehouse_name && (
//               <div className="row mb-3">
//                 <div className="col-lg-6">
//                   <label className="form-label">From Warehouse</label>
//                   <input
//                     type="text"
//                     className="form-control bg-light"
//                     value={currentUser.warehouse_name}
//                     readOnly
//                     disabled
//                   />
//                   <small className="text-muted">Your assigned warehouse (set by your account)</small>
//                 </div>
//               </div>
//             )}

//             <div className="row mb-3">
//               {/* Stock Request */}
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   Stock Request <span className="text-danger">*</span>
//                   {isRequestLocked && (
//                     <Lock
//                       size={13}
//                       className="ms-1 text-warning"
//                       title="Pre-selected from Stock Requests page"
//                     />
//                   )}
//                 </label>

//                 {isRequestLocked ? (
//                   <>
//                     <div className="d-flex align-items-center gap-2">
//                       <input
//                         type="text"
//                         className="form-control bg-light"
//                         value={formData.stock_request_id?.label || ""}
//                         readOnly
//                         disabled
//                       />
//                       <button
//                         type="button"
//                         className="btn btn-sm btn-outline-secondary text-nowrap"
//                         title="Unlock to choose a different request"
//                         onClick={() => {
//                           dispatch(clearFlowSourceRequest());
//                           setField("stock_request_id", null);
//                         }}
//                       >
//                         <X size={13} className="me-1" />Change
//                       </button>
//                     </div>
//                     <small className="text-muted">
//                       Pre-selected from the Stock Requests page. Click "Change" to pick a different one.
//                     </small>
//                   </>
//                 ) : (
//                   <>
//                     <Select
//                       options={stockRequestOptions}
//                       value={formData.stock_request_id}
//                       onChange={(opt) => setField("stock_request_id", opt)}
//                       placeholder={reqDropdownLoading ? "Loading requests…" : "Select a stock request"}
//                       isClearable
//                       isLoading={reqDropdownLoading}
//                       noOptionsMessage={() =>
//                         reqDropdownLoading ? "Loading…" : "No approved requests found"
//                       }
//                     />
//                     <small className="text-muted">
//                       Showing approved requests you are assigned to dispatch
//                     </small>
//                   </>
//                 )}
//               </div>
// {/*  */}
//               {/* Transport */}
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   Transport <span className="text-danger">*</span>
//                   {transportOptions.length === 0 && (
//                     <span className="spinner-border spinner-border-sm ms-2" />
//                   )}
//                 </label>
//                 <Select
//                   options={transportOptions}
//                   value={formData.transport}
//                   onChange={(opt) => setField("transport", opt)}
//                   placeholder={
//                     transportOptions.length === 0 ? "Loading…" : "Select transport method"
//                   }
//                   isLoading={transportOptions.length === 0}
//                 />
//                 {transportOptions.length > 0 && !formData.transport && (
//                   <small className="text-muted">
//                     Defaults to <strong>{transportOptions[0]?.label}</strong> if not selected
//                   </small>
//                 )}
//               </div>
//             </div>

//             <div className="row mb-3">
//               <div className="col-lg-6">
//                 <label className="form-label">Description</label>
//                 <textarea
//                   className="form-control"
//                   value={formData.description || ""}
//                   onChange={(e) => setField("description", e.target.value)}
//                   rows="2"
//                   placeholder="Notes about this transfer…"
//                 />
//               </div>
//               <div className="col-lg-6">
//                 <label className="form-label">Total Quantity</label>
//                 <input
//                   type="number"
//                   className="form-control bg-light"
//                   value={totalQty}
//                   readOnly
//                   disabled
//                   style={{ fontWeight: "bold", fontSize: "1.1rem" }}
//                 />
//                 <small className="text-muted">Auto-calculated from scanned products</small>
//               </div>
//             </div>

//             {/* Bill / Invoice upload */}
//             <div className="row">
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   <File size={16} className="me-1" />Bill / Invoice (Optional)
//                 </label>
//                 {!billPreview ? (
//                   <div className="border border-dashed rounded p-3 text-center">
//                     <input
//                       ref={billFileRef}
//                       type="file"
//                       id="billFileInput"
//                       className="d-none"
//                       accept=".pdf,.jpg,.jpeg,.png"
//                       onChange={handleBillChange}
//                     />
//                     <label htmlFor="billFileInput" className="mb-0" style={{ cursor: "pointer" }}>
//                       <Upload size={40} className="text-muted mb-2 d-block mx-auto" />
//                       <span className="text-muted">Click to upload — PDF, JPG, PNG max 5 MB</span>
//                     </label>
//                   </div>
//                 ) : (
//                   <div className="border rounded p-3 d-flex align-items-center justify-content-between">
//                     <div className="d-flex align-items-center">
//                       <File size={28} className="text-primary me-3" />
//                       <div>
//                         <p className="mb-0 fw-semibold">{billPreview.name}</p>
//                         <small className="text-muted">{billPreview.size}</small>
//                       </div>
//                     </div>
//                     <button type="button" className="btn btn-sm btn-danger" onClick={handleRemoveBill}>
//                       <X size={14} />
//                     </button>
//                   </div>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ── Scan Barcode card ── */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <div className="d-flex align-items-center mb-3">
//               <Camera size={22} className="text-primary me-2" />
//               <h5 className="mb-0">Scan Barcode</h5>
//               <span className="badge badge-success ms-2" style={{ fontSize: "0.7rem" }}>
//                 Always Active
//               </span>
//             </div>

//             {!canSync ? (
//               <div className="alert alert-info d-flex align-items-center mb-3">
//                 <span className="me-2 flex-shrink-0">ℹ</span>
//                 <div>
//                   <strong>Scanning is available now.</strong> Products will be held locally.
//                   <span className="d-block mt-1 text-muted small">
//                     Select a <strong>Stock Request</strong> above to auto-save each scan to draft.
//                   </span>
//                 </div>
//               </div>
//             ) : (
//               <div className="alert alert-success d-flex align-items-center mb-3">
//                 <span className="me-2 flex-shrink-0">✓</span>
//                 <div>
//                   <strong>Ready to scan &amp; auto-save!</strong> Each scan is saved to draft.
//                   <div className="mt-1">
//                     Request: <strong>{formData.stock_request_id?.label}</strong>
//                     {!formData.transport && effectiveTransport && (
//                       <span
//                         className="ms-2 badge badge-secondary"
//                         style={{ fontSize: "0.75rem" }}
//                       >
//                         Transport: {effectiveTransport.label} (default)
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="row align-items-end">
//               <div className="col-lg-8">
//                 <label className="form-label">
//                   Scan or Enter Barcode
//                   {(isScanning || isSyncing) && (
//                     <span className="spinner-border spinner-border-sm ms-2" />
//                   )}
//                 </label>
//                 <input
//                   ref={barcodeRef}
//                   type="text"
//                   className="form-control"
//                   value={barcodeInput}
//                   onChange={(e) => setBarcodeInput(e.target.value)}
//                   onKeyDown={(e) => {
//                     if (e.key === "Enter") { e.preventDefault(); handleScan(barcodeInput); }
//                   }}
//                   placeholder="Use scanner or type barcode then press Enter"
//                   disabled={isScanning}
//                   autoFocus
//                 />
//               </div>
//               <div className="col-lg-4">
//                 <button
//                   type="button"
//                   className="btn btn-primary w-100"
//                   onClick={() => handleScan(barcodeInput)}
//                   disabled={!barcodeInput.trim() || isScanning}
//                 >
//                   {isScanning
//                     ? <><span className="spinner-border spinner-border-sm me-2" />Scanning…</>
//                     : <><Plus size={16} className="me-1" />Add Product</>}
//                 </button>
//               </div>
//             </div>

//             {scannedProducts.length > 0 && (
//               <div className="alert alert-success d-flex align-items-center mt-3 mb-0">
//                 <Package size={18} className="me-2" />
//                 <strong>
//                   {scannedProducts.length} product(s) &nbsp;|&nbsp; Total Qty: {totalQty}
//                   {isSyncing && <span className="ms-2 text-muted small">saving…</span>}
//                   {!canSync && (
//                     <span className="ms-2 text-warning small">
//                       ⚠ Unsaved — select a Stock Request to persist
//                     </span>
//                   )}
//                 </strong>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Scanned Products Table ── */}
//         {scannedProducts.length > 0 && (
//           <div className="card mb-3">
//             <div className="card-body">
//               <div className="d-flex align-items-center justify-content-between mb-3">
//                 <h5 className="mb-0">
//                   <Package size={18} className="me-2" />
//                   Scanned Products ({scannedProducts.length})
//                 </h5>
//                 <button
//                   type="button"
//                   className="btn btn-sm btn-outline-danger"
//                   onClick={() =>
//                     handleRemoveSelected(scannedProducts.map((p) => p.prod_uuid))
//                   }
//                 >
//                   <Trash2 size={14} className="me-1" />Remove All
//                 </button>
//               </div>
//               <div className="table-responsive">
//                 <Table columns={columns} dataSource={scannedProducts} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Transfer Summary ── */}
//         {scannedProducts.length > 0 && (
//           <div className="alert alert-warning mb-3">
//             <strong>Transfer Summary</strong>
//             <ul className="mb-0 mt-2">
//               <li>Total Products: {scannedProducts.length}</li>
//               <li>Total Quantity: {totalQty} units</li>
//               {currentUser?.warehouse_name && (
//                 <li>From: {currentUser.warehouse_name}</li>
//               )}
//               {formData.stock_request_id && (
//                 <li>Stock Request: {formData.stock_request_id.label}</li>
//               )}
//               {effectiveTransport && (
//                 <li>
//                   Transport: {effectiveTransport.label}
//                   {!formData.transport ? " (default)" : ""}
//                 </li>
//               )}
//               <li>Status after submit: <strong>in-transit</strong></li>
//               {currentStockId && (
//                 <li>Draft Stock ID: <strong>{currentStockId}</strong></li>
//               )}
//             </ul>
//             <small className="text-muted d-block mt-1">
//               Inventory will be updated on submission.
//             </small>
//           </div>
//         )}

//         {/* ── Submit / Cancel ── */}
//         <div className="col-lg-12">
//           <div className="btn-addproduct mb-4">
//             <Link to="/stock-transfer" className="btn btn-cancel me-2">Cancel</Link>
//             <button
//               type="button"
//               className="btn btn-submit"
//               onClick={handleSubmit}
//               disabled={submitting || scannedProducts.length === 0 || !canSync}
//             >
//               {submitting
//                 ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
//                 : <><Send size={16} className="me-1" />Create Stock Flow</>}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ── Article Profile Picker Modal ── */}
//       <Modal
//         show={profileModal.open}
//         onHide={() => {
//           setProfileModal({ open: false, profiles: [], partial_code: "" });
//           barcodeRef.current?.focus();
//         }}
//         centered
//         size="sm"
//       >
//         <Modal.Header>
//           <Modal.Title style={{ fontSize: "1rem" }}>
//             <Package size={16} className="me-2 text-primary" />
//             Select Article Profile
//           </Modal.Title>
//           <button
//             className="btn-close"
//             onClick={() => {
//               setProfileModal({ open: false, profiles: [], partial_code: "" });
//               barcodeRef.current?.focus();
//             }}
//           />
//         </Modal.Header>
//         <Modal.Body>
//           <p className="text-muted small mb-3">
//             Barcode <strong>{profileModal.partial_code}</strong> matches multiple article
//             profiles. Select one to add:
//           </p>
//           <div className="d-flex flex-column gap-2">
//             {profileModal.profiles.map((profile) => (
//               <button
//                 key={profile.article_profile_id}
//                 type="button"
//                 className="btn btn-outline-primary text-start w-100"
//                 style={{ padding: "10px 14px" }}
//                 onClick={async () => {
//                   const code = profileModal.partial_code;
//                   setProfileModal({ open: false, profiles: [], partial_code: "" });
//                   await doScanAndAdd(code, profile.product_id);
//                   console.log("----------------------", profile);
//                 }}
//               >
//                 <span className="d-block fw-semibold" style={{ fontSize: "0.875rem" }}>
//                   {profile.article_profile_name}
//                 </span>
//                 <span className="text-muted" style={{ fontSize: "0.75rem" }}>
//                   ID: {profile.article_profile_id}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default AddStockFlow;






// import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Select from "react-select";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import {
//   ArrowLeft, ChevronUp, Camera, Plus, Package, Send,
//   Trash2, Upload, RefreshCw, AlertTriangle, File, X, Lock,
// } from "feather-icons-react/build/IconComponents";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import { setToogleHeader } from "../../core/redux/action";
// import { scanProduct } from "../../core/redux/slices/productSlice";
// import {
//   fetchStockRequestDropdown,
//   selectFlowSourceRequest,
//   selectReqDropdown,
//   selectReqDropdownLoading,
//   clearFlowSourceRequest,
// } from "../../core/redux/slices/stockSlice";
// import AuthService from "../../services/authService";
// import Table from "../../core/pagination/datatable";
// import { Modal } from "react-bootstrap";

// const MySwal = withReactContent(Swal);

// const toast = (icon, title, text, timer = 2000) =>
//   MySwal.fire({ icon, title, text, timer, showConfirmButton: false, toast: true, position: "top-end" });

// const STATUS_BADGE = {
//   good:          "badge-success",
//   faulty:        "badge-info",
//   "broke/burnt": "badge-danger",
//   broken:        "badge-danger",
// };

// const TRANSFERABLE_STATUSES = ["good", "faulty", "broke/burnt"];

// const INITIAL_FORM = {
//   stock_request_id: null,
//   transport:        null,
//   description:      "",
// };

// // Maps frontend product → backend prod_arr item shape.
// // Backend prod_obj_schema: prod_uuid, partial_code, article_profile_id,
// // article_profile_name, status, count (= qty to transfer)
// const toApiProdItem = (p) => ({
//   prod_uuid:            p.prod_uuid,
//   partial_code:         p.partial_code,
//   article_profile_id:   p.article_profile_id,
//   article_profile_name: p.article_profile_name,
//   status:               p.status,
//   count:                p.quantity_to_transfer || 1,
// });

// // =============================================================================
// const AddStockFlow = () => {
//   const dispatch     = useDispatch();
//   const navigate     = useNavigate();
//   const headerToggle = useSelector((s) => s.toggle_header);
//   const currentUser  = useSelector((s) => s.user?.currentUser);

//   const flowSourceRequest  = useSelector(selectFlowSourceRequest);
//   const reqDropdownRaw     = useSelector(selectReqDropdown);
//   const reqDropdownLoading = useSelector(selectReqDropdownLoading);

//   const [profileModal, setProfileModal] = useState({ open: false, profiles: [], partial_code: "" });

//   const stockRequestOptions = useMemo(
//     () => reqDropdownRaw.map((r) => ({ value: r.stock_req_id, label: `#${r.stock_req_id}` })),
//     [reqDropdownRaw],
//   );

//   const isRequestLocked = !!flowSourceRequest;

//   const [transportOptions, setTransportOptions] = useState([]);
//   const [formData, setFormData]                 = useState(INITIAL_FORM);
//   const setField = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

//   const [scannedProducts, setScannedProducts] = useState([]);
//   const scannedProductsRef                    = useRef([]);

//   // currentStockId kept in both state (for render) and ref (stale-closure safety)
//   const [currentStockId, setCurrentStockId] = useState(null);
//   const currentStockIdRef                   = useRef(null);
//   const setStockId = (id) => { currentStockIdRef.current = id; setCurrentStockId(id); };

//   // ── FIX 1: syncInfo persists across re-syncs ─────────────────────────────
//   // Backend only returns `data` (stock_id, source_name …) on the FIRST insert.
//   // On subsequent updates it returns no `data` at all.
//   // We only update syncInfo when the backend sends new data; otherwise we keep
//   // the existing value so the banner never disappears after a re-sync.
//   const [syncInfo, setSyncInfo] = useState(null);
//   // { stock_id, stock_req_id, supplier_name, source_name, destination_name }

//   const [loadingDraft,  setLoadingDraft]  = useState(true);
//   const [isScanning,    setIsScanning]    = useState(false);
//   const [isSyncing,     setIsSyncing]     = useState(false);
//   const [submitting,    setSubmitting]    = useState(false);
//   const [productErrors, setProductErrors] = useState([]);

//   const [barcodeInput, setBarcodeInput] = useState("");
//   const barcodeRef = useRef(null);

//   // ── FIX 2: invoice stored as a File object, sent via FormData ────────────
//   // The backend uses multer middleware to receive the file — it never arrives
//   // through a plain JSON body.  Keeping a separate billFile state allows us to
//   // attach it to every FormData payload (sync + submit).
//   const [billFile,    setBillFile]    = useState(null);   // File | null
//   const [billPreview, setBillPreview] = useState(null);   // { name, size } | null
//   const billFileRef = useRef(null);

//   // ── Derived ───────────────────────────────────────────────────────────────
//   const totalQty = useMemo(
//     () => scannedProducts.reduce((s, p) => s + (parseInt(p.quantity_to_transfer) || 0), 0),
//     [scannedProducts],
//   );

//   const canSync            = !!(formData.stock_request_id && (formData.transport || transportOptions[0]));
//   const effectiveTransport = formData.transport || transportOptions[0] || null;

//   // ── Bootstrap ─────────────────────────────────────────────────────────────
//   // useEffect(() => {
//   //   (async () => {
//   //     await Promise.all([loadTransportOptions(), dispatch(fetchStockRequestDropdown())]);
//   //     if (flowSourceRequest) {
//   //       setField("stock_request_id", { value: flowSourceRequest.value, label: flowSourceRequest.label });
//   //     }
//   //     await restoreDraft();
//   //   })();
//   //   return () => { dispatch(clearFlowSourceRequest()); };
//   //   // eslint-disable-next-line
//   // }, []);


//   // ── Bootstrap ─────────────────────────────────────────────────────────────
// useEffect(() => {
//   // Capture flowSourceRequest BEFORE anything clears it
//   const preselectedRequest = flowSourceRequest;

//   (async () => {
//     await Promise.all([loadTransportOptions(), dispatch(fetchStockRequestDropdown())]);

//     if (preselectedRequest) {
//       setField("stock_request_id", {
//         value: preselectedRequest.value,
//         label: preselectedRequest.label,
//       });
//       // Restore draft keyed to this specific request
//       await restoreDraft(preselectedRequest.value);
//     } else {
//       // No pre-selected request — still attempt restore (user may have
//       // navigated directly to /add-stock-flow with a draft in progress)
//       await restoreDraft(null);
//     }
//   })();

//   return () => { dispatch(clearFlowSourceRequest()); };
//   // eslint-disable-next-line
// }, []);

//   // Re-sync when request or transport changes (only if products exist)
//   useEffect(() => {
//     if (scannedProductsRef.current.length > 0 && canSync) {
//       syncToDb(scannedProductsRef.current, formData);
//     }
//     // eslint-disable-next-line
//   }, [formData.stock_request_id, formData.transport]);

//   const setScanned = (val) => {
//     setScannedProducts((prev) => {
//       const next = typeof val === "function" ? val(prev) : val;
//       scannedProductsRef.current = next;
//       return next;
//     });
//   };

//   // ── Transport options ─────────────────────────────────────────────────────
//   const loadTransportOptions = async () => {
//     try {
//       const res     = await AuthService.getStockFlowOptions();
//       const options = res.data?.data;
//       if (!options) { toast("error", "Options Error", "Failed to load transport options.", 5000); return; }
//       const toOpt = (v) =>
//         typeof v === "object" && v !== null && v.value !== undefined ? v : {
//           value: String(v),
//           label: String(v).split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
//         };
//       setTransportOptions((options.transport || []).map(toOpt));
//     } catch (e) {
//       toast("error", "Options Error", `Could not load transport options: ${e.message}`, 5000);
//     }
//   };

//   // Restore draft 

//   // const restoreDraft = async () => {
//   //   setLoadingDraft(true);
//   //   try {
//   //     const res  = await AuthService.get_existing_stock_flow(syncInfo?.request_id);
//   //     const body = res.data;
//   //     if (!body.is_found || !body.data) return;

//   //     const lot = body.data;
//   //     setStockId(lot.stock_id);
//   //     setFormData((prev) => ({ ...prev, description: lot.description || "" }));

      
//   //     setSyncInfo((prev) => prev ?? {
//   //       stock_id:         lot.stock_id,
//   //       request_id:     null,
//   //       supplier_name:  null,
//   //       source_name:      null,
//   //       recipient_name:   null,
//   //       destination_name: null,
//   //       transportation: null,
//   //       description: null,
//   //       invoice_original_name: null
    
//   //     });

//   //     if (lot.prod_arr?.length) {
//   //       const restored = lot.prod_arr.filter(Boolean).map((p) => ({
//   //         prod_uuid:            p.prod_uuid,
//   //         partial_code:         p.partial_code,
//   //         article_profile_id:   p.article_profile_id || "",
//   //         article_profile_name: p.article_profile_name || "—",
//   //         warehouse_name:       p.warehouse_name || "—",
//   //         count:                p.available ?? p.count ?? 0,   // available = warehouse qty
//   //         status:               p.status,
//   //         quantity_to_transfer: p.count || 1,                  // count = draft transfer qty
//   //       }));
//   //       setScanned(restored);
//   //       MySwal.fire({
//   //         icon: "info", title: "Draft Restored",
//   //         html: `<p><strong>${restored.length}</strong> product(s) from your previous session.</p>
//   //                <small class="text-muted">Stock ID: ${lot.stock_id}</small>`,
//   //         timer: 3500, showConfirmButton: false,
//   //       });
//   //     }
//   //   } catch (err) {
//   //     console.warn("No draft found:", err.message);
//   //   } finally {
//   //     setLoadingDraft(false);
//   //   }
//   // };



//   // Restore draft — accepts an explicit requestId so it never relies on
// // syncInfo (which is null on first mount)
// const restoreDraft = async (requestId) => {
//   if (!requestId) {
//     // Nothing to restore without a request ID
//     setLoadingDraft(false);
//     return;
//   }

//   setLoadingDraft(true);
//   try {
//     const res  = await AuthService.get_existing_stock_flow(requestId);
//     const body = res.data;

//     if (!body.is_found || !body.data || Object.keys(body.data).length === 0) {
//       return; // No draft — that's fine
//     }

//     const lot = body.data;

//     // Persist stock_id for subsequent syncs
//     setStockId(lot.stock_id);

//     // Description
//     if (lot.description) {
//       setFormData((prev) => ({ ...prev, description: lot.description }));
//     }

//     // ── FIX 2: map API field names → syncInfo shape ───────────────────
//     // API returns: stock_id, request_id, supplier_name, source_name,
//     //              recipient_name, destination_name, transportation,
//     //              description, invoice_original_name
//     setSyncInfo({
//       stock_id:              lot.stock_id,
//       stock_req_id:          lot.request_id,          // banner uses stock_req_id
//       supplier_name:         lot.supplier_name,
//       source_name:           lot.source_name,
//       destination_name:      lot.destination_name,
//       recipient_name:        lot.recipient_name,
//       transportation:        lot.transportation,
//       description:           lot.description,
//       invoice_original_name: lot.invoice_original_name,
//     });

//     // Restore transport selection from draft
//     if (lot.transportation) {
//       setField("transport", {
//         value: lot.transportation,
//         label: lot.transportation
//           .split("_")
//           .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//           .join(" "),
//       });
//     }

//     // Restore scanned products
//     if (lot.prod_arr?.length) {
//       const restored = lot.prod_arr.filter(Boolean).map((p) => ({
//         prod_uuid:            p.prod_uuid,
//         partial_code:         p.partial_code,
//         article_profile_id:   p.article_profile_id || "",
//         article_profile_name: p.article_profile_name || "—",
//         warehouse_name:       p.warehouse_name || "—",
//         count:                p.available ?? p.count ?? 0,
//         status:               p.status,
//         quantity_to_transfer: p.count || 1,
//       }));
//       setScanned(restored);

//       MySwal.fire({
//         icon: "info",
//         title: "Draft Restored",
//         html: `
//           <p><strong>${restored.length}</strong> product(s) from your previous session.</p>
//           <small class="text-muted">
//             Stock ID: ${lot.stock_id} · Request: ${lot.request_id}
//           </small>
//         `,
//         timer: 3500,
//         showConfirmButton: false,
//       });
//     }
//   } catch (err) {
//     // 404 → no draft; 409 → not approved; both are non-fatal
//     console.warn("restoreDraft:", err.response?.status, err.message);
//   } finally {
//     setLoadingDraft(false);
//   }
// };


//   // ── syncToDb ──────────────────────────────────────────────────────────────

//   const syncToDb = useCallback(async (products, fd) => {
//     if (!fd.stock_request_id) return;
//     if (!products.length) return;

//     const transport = fd.transport || transportOptions[0] || null;
//     if (!transport) { console.warn("syncToDb: no transport — skipping."); return; }

//     setIsSyncing(true);
//     try {
//       const payload = new FormData();
//       payload.append("request_id",     fd.stock_request_id.value);
//       payload.append("transportation", transport.value);

//       payload.append("prod_arr",       JSON.stringify(products.map(toApiProdItem)));
//       if (fd.description) payload.append("description", fd.description);
   
//       if (billFile) payload.append("stock_transfer_invoice", billFile);

//       const res  = await AuthService.stockFlowSync(payload);
//       const body = res.data;

     
//       // if (body?.data?.stock_id) {
//       //   setSyncInfo(body.data);   
//       //   setStockId(body.data.stock_id);
//       // }



// if (body?.data?.stock_id) {
 
//   setSyncInfo({
//     stock_id:         body.data.stock_id,
//     stock_req_id:     body.data.request_id ?? fd.stock_request_id?.value,
//     supplier_name:    body.data.supplier_name,
//     source_name:      body.data.source_name,
//     destination_name: body.data.destination_name,
//     recipient_name:   body.data.recipient_name,
//   });
//   setStockId(body.data.stock_id);
// }
// // If body.data is absent (re-sync response), setSyncInfo is NOT called →
// // existing syncInfo survives, banner stays visible ✓
  

//       console.log("Sync success:", body?.message, "| syncInfo kept:", !body?.data);
//     } catch (err) {
//       const msg = err.response?.data?.message || "Failed to sync draft";
//       toast("error", "Sync Error", msg, 3000);
//       console.error("syncToDb error:", err.response?.data || err);
//     } finally {
//       setIsSyncing(false);
//     }
//     // eslint-disable-next-line
//   }, [transportOptions, billFile]);

//   // ── doScanAndAdd ──────────────────────────────────────────────────────────
//   const doScanAndAdd = useCallback(async (code, product_id = null, prefetchedProduct = null) => {
//     setIsScanning(true);
//     try {
//       let product;
//       if (prefetchedProduct) {
//         product = prefetchedProduct;
//       } else {
//         const result = await dispatch(scanProduct({ code, product_id })).unwrap();
//         product = result?.data ?? result;
//       }

//       if (!product?.prod_uuid) throw new Error("Product not found");

//       if (currentUser?.warehouse_id && product.warehouse_id !== currentUser.warehouse_id) {
//         MySwal.fire({ icon: "error", title: "Wrong Warehouse",
//           text: `This product belongs to "${product.warehouse_name}", not your assigned warehouse.` });
//         return;
//       }

//       if (!TRANSFERABLE_STATUSES.includes(product.status)) {
//         MySwal.fire({ icon: "error", title: "Invalid Status",
//           text: `"${product.partial_code || code}" has status "${product.status}". ` +
//                 `Only ${TRANSFERABLE_STATUSES.join(", ")} can be transferred.` });
//         return;
//       }

//       if (scannedProductsRef.current.find((p) => p.prod_uuid === product.prod_uuid)) {
//         toast("warning", "Already Scanned", `Product "${product.partial_code || code}" is already in the list.`);
//         setBarcodeInput(""); return;
//       }

//       const newProd = {
//         prod_uuid:            product.prod_uuid,
//         partial_code:         product.partial_code || code,
//         article_profile_id:   product.article_profile_id,
//         article_profile_name: product.article_profile_name || "—",
//         warehouse_name:       product.warehouse_name || "—",
//         count:                product.count ?? 0,
//         status:               product.status,
//         quantity_to_transfer: 1,
//       };

//       const updated = [...scannedProductsRef.current, newProd];
//       setScanned(updated);
//       setBarcodeInput("");

//       if (canSync) {
//         await syncToDb(updated, formData);
//         toast("success", "Scanned & Saved", newProd.partial_code);
//       } else {
//         toast("info", "Scanned (Local)",
//           `"${newProd.partial_code}" added. Select a Stock Request above to save draft.`);
//       }
//     } catch (err) {
//       const msg = err.response?.data?.message || err.message || "Product not found";
//       MySwal.fire({ icon: "error", title: "Not Found", text: msg });
//     } finally {
//       setIsScanning(false);
//       barcodeRef.current?.focus();
//     }
//     // eslint-disable-next-line
//   }, [dispatch, formData, canSync, syncToDb, currentUser]);

//   // ── handleScan ────────────────────────────────────────────────────────────
//   const handleScan = useCallback(async (partial_code) => {
//     const code = (partial_code || "").trim();
//     if (!code) return;

//     setIsScanning(true);
//     try {
//       const profileRes = await AuthService.getProfileByCode(code);
//       const raw        = profileRes.data?.data;
//       const isArray    = Array.isArray(raw);
//       const profiles   = isArray ? raw : null;

//       if (profiles && profiles.length > 1) {
//         setProfileModal({ open: true, profiles, partial_code: code });
//         setBarcodeInput("");
//         setIsScanning(false);
//         return;
//       }
//       if (!isArray && raw?.prod_uuid) { await doScanAndAdd(code, null, raw); return; }
//       if (isArray && profiles.length === 1) { await doScanAndAdd(code, profiles[0].product_id); return; }
//       await doScanAndAdd(code);
//     } catch (err) {
//       const msg = err.response?.data?.message || err.message || "Product not found";
//       MySwal.fire({ icon: "error", title: "Not Found", text: msg });
//       setIsScanning(false);
//     }
//     // eslint-disable-next-line
//   }, [formData, canSync, syncToDb, currentUser, doScanAndAdd]);

//   // ── Remove single ─────────────────────────────────────────────────────────
//   const handleRemoveProduct = useCallback((prod_uuid, partial_code) => {
//     MySwal.fire({
//       title: "Remove Product?", text: "This will remove it from your draft.",
//       icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Remove",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       try {
//         if (currentStockIdRef.current) {
//           const res = await AuthService.removeStockProduct(partial_code);
//           setScanned((prev) => prev.filter((p) => p.prod_uuid !== prod_uuid));
//           if (res.data?.draft_deleted) {
//             setStockId(null); setSyncInfo(null);
//             toast("info", "Draft Cleared", "Last product removed. Draft deleted.");
//           } else {
//             toast("success", "Removed", `"${partial_code}" removed.`);
//           }
//         } else {
//           setScanned((prev) => prev.filter((p) => p.prod_uuid !== prod_uuid));
//           toast("success", "Removed", `"${partial_code}" removed.`);
//         }
//       } catch (err) {
//         toast("error", "Error", err.response?.data?.message || "Failed to remove.", 3000);
//       }
//     });
//   }, []); // ref — no dep needed

//   // ── Remove all ────────────────────────────────────────────────────────────
//   const handleRemoveSelected = useCallback((selectedUuids) => {
//     MySwal.fire({
//       title: `Remove ${selectedUuids.length} product(s)?`, icon: "warning",
//       showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Remove All",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       const toRemove = scannedProducts.filter((p) => selectedUuids.includes(p.prod_uuid));
//       if (currentStockIdRef.current) {
//         for (const p of toRemove) {
//           try { await AuthService.removeStockProduct(p.partial_code); } catch { /* continue */ }
//         }
//       }
//       const remaining = scannedProducts.filter((p) => !selectedUuids.includes(p.prod_uuid));
//       setScanned(remaining);
//       if (remaining.length === 0) { setStockId(null); setSyncInfo(null); }
//       toast("success", "Removed", `${toRemove.length} product(s) removed.`);
//     });
//   }, [scannedProducts]);

//   // ── Discard draft ─────────────────────────────────────────────────────────
//   const handleDiscardDraft = () => {
//     MySwal.fire({
//       title: "Discard entire draft?", text: "All scanned products will be removed.",
//       icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Yes, discard",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       try {
//         if (currentStockIdRef.current) await AuthService.discardDraft();
//         setScanned([]); setStockId(null); setSyncInfo(null);
//         toast("info", "Draft Discarded", "All products cleared.");
//       } catch (err) {
//         toast("error", "Error", err.response?.data?.message || "Failed to discard.", 3000);
//       }
//     });
//   };

//   // ── Qty change ────────────────────────────────────────────────────────────
//   const handleQtyChange = useCallback((prod_uuid, newQty) => {
//     setScanned((prev) => prev.map((p) => {
//       if (p.prod_uuid !== prod_uuid) return p;
//       const qty = parseInt(newQty) || 0;
//       if (qty > p.count) { toast("warning", "Insufficient Stock", `Only ${p.count} units available.`); return p; }
//       return { ...p, quantity_to_transfer: qty };
//     }));
//   }, []);

//   // ── Bill / Invoice ────────────────────────────────────────────────────────
//   const handleBillChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (!["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
//       toast("warning", "Invalid File", "PDF, JPG, or PNG only."); return;
//     }
//     if (file.size > 5 * 1024 * 1024) { toast("warning", "Too Large", "Max 5 MB."); return; }
//     setBillFile(file);
//     setBillPreview({ name: file.name, size: (file.size / 1024).toFixed(2) + " KB" });
//   };

//   const handleRemoveBill = () => {
//     setBillFile(null); setBillPreview(null);
//     if (billFileRef.current) billFileRef.current.value = "";
//   };

//   // ── Submit ────────────────────────────────────────────────────────────────
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setProductErrors([]);

//     if (!scannedProducts.length)         { toast("warning", "No Products", "Scan at least one product."); return; }
//     if (!formData.stock_request_id)      { toast("warning", "Missing", "Stock Request is required."); return; }
//     if (!effectiveTransport)             { toast("warning", "Missing", "No transport options available yet."); return; }
//     if (scannedProducts.some((p) => p.quantity_to_transfer <= 0)) {
//       toast("warning", "Invalid Qty", "All quantities must be greater than 0."); return;
//     }

//     await syncToDb(scannedProducts, formData);

//     setSubmitting(true);
//     try {
//       const res  = await AuthService.stockFlowSubmit();
//       const body = res.data;

//       if (!body.success) {
//         const errProds = body.data || [];
//         if (errProds.length) {
//           setProductErrors(errProds.map((ep) => {
//             const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
//             return { prod_uuid: ep.prod_uuid, partial_code: local?.partial_code || ep.prod_uuid,
//               errors: [`Count ${ep.count}, status "${ep.status}" — inventory mismatch`] };
//           }));
//           MySwal.fire({ icon: "error", title: "Submission Failed",
//             html: `<p>${body.message}</p><p class="text-muted small">Inconsistent products highlighted below.</p>` });
//           return;
//         }
//         throw new Error(body.message || "Submission failed.");
//       }

//       MySwal.fire({
//         icon: "success", title: "Stock Flow Created!",
//         html: `
//           <p><strong>Stock ID:</strong> ${currentStockIdRef.current || "—"}</p>
//           <p><strong>Products:</strong> ${scannedProducts.length}</p>
//           <p><strong>Total Quantity:</strong> ${totalQty}</p>
//           ${formData.stock_request_id ? `<p><strong>Request:</strong> ${formData.stock_request_id.label}</p>` : ""}
//           <p class="text-muted small">Status set to <strong>in-transit</strong></p>
//         `,
//         confirmButtonText: "View Stock Flows",
//       }).then(() => navigate("/stock-transfer"));
//     } catch (err) {
//       const msg      = err.response?.data?.message || err.message || "Failed to create stock flow.";
//       const errProds = err.response?.data?.data || [];
//       if (errProds.length) {
//         setProductErrors(errProds.map((ep) => {
//           const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
//           return { prod_uuid: ep.prod_uuid, partial_code: local?.partial_code || ep.prod_uuid,
//             errors: [`Count ${ep.count}, status "${ep.status}" — inventory mismatch`] };
//         }));
//       }
//       MySwal.fire({ icon: "error", title: "Error", text: msg });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── Table columns ─────────────────────────────────────────────────────────
//   const columns = useMemo(() => {
//     const errorMap = Object.fromEntries(productErrors.map((e) => [e.prod_uuid, e.errors]));
//     return [
//       { title: "#", render: (_, __, i) => i + 1, width: "50px" },
//       {
//         title: "Barcode / Code", dataIndex: "partial_code",
//         render: (text, record) => (
//           <span>
//             <span className="badge badge-primary">{text}</span>
//             {errorMap[record.prod_uuid] && (
//               <div className="mt-1">
//                 {errorMap[record.prod_uuid].map((err, i) => (
//                   <div key={i} className="text-danger small">
//                     <AlertTriangle size={12} className="me-1" />{err}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </span>
//         ),
//       },
//       { title: "Article Profile", dataIndex: "article_profile_name" },
//       { title: "Warehouse",       dataIndex: "warehouse_name" },
//       {
//         title: "Status", dataIndex: "status",
//         render: (t) => (
//           <span className={`badge ${STATUS_BADGE[t] || "badge-info"}`}>{t?.toUpperCase() || "N/A"}</span>
//         ),
//       },
//       { title: "Available", dataIndex: "count",
//         render: (t) => <span className="badge badge-info">{t}</span> },
//       {
//         title: "Transfer Qty", dataIndex: "quantity_to_transfer",
//         render: (text, record) => (
//           <input type="number" className="form-control form-control-sm" style={{ width: "80px" }}
//             value={text} min="1" max={record.count}
//             onChange={(e) => handleQtyChange(record.prod_uuid, e.target.value)} />
//         ),
//       },
//       {
//         title: "Action", width: "80px",
//         render: (_, record) => (
//           <button type="button" className="btn btn-sm btn-danger"
//             onClick={() => handleRemoveProduct(record.prod_uuid, record.partial_code)} title="Remove">
//             <Trash2 size={14} />
//           </button>
//         ),
//       },
//     ];
//   }, [productErrors, handleQtyChange, handleRemoveProduct]);

//   // ── Render ────────────────────────────────────────────────────────────────
//   return (
//     <div className="page-wrapper">
//       <div className="content">

//         {/* Page Header */}
//         <div className="page-header">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>Create Stock Flow</h4>
//               <h6>Scan or import products to create a stock transfer</h6>
//             </div>
//           </div>
//           <ul className="table-top-head">
//             <li>
//               <Link to="/stock-transfer" className="btn btn-secondary btn-sm">
//                 <ArrowLeft size={16} className="me-1" />Back
//               </Link>
//             </li>
//             <li>
//               <OverlayTrigger placement="top" overlay={<Tooltip>Collapse</Tooltip>}>
//                 <Link id="collapse-header" className={headerToggle ? "active" : ""}
//                   onClick={() => dispatch(setToogleHeader(!headerToggle))}>
//                   <ChevronUp className="feather-chevron-up" />
//                 </Link>
//               </OverlayTrigger>
//             </li>
//           </ul>
//         </div>

//         {/* Draft loading */}
//         {loadingDraft && (
//           <div className="alert alert-light d-flex align-items-center mb-3">
//             <span className="spinner-border spinner-border-sm me-2" />
//             Checking for saved draft…
//           </div>
//         )}

//         {/* ── Active Draft Banner ──────────────────────────────────────────── */}
//         {/* FIX 1: rendered whenever syncInfo is set — survives every re-sync  */}
//         {!loadingDraft && syncInfo && (
//           <div className="alert alert-warning d-flex flex-column mb-3">
//             <div className="d-flex align-items-center mb-2">
//               <RefreshCw size={16} className="me-2" />
//               <strong>Active Draft:</strong>
//               <span className="ms-2 badge badge-warning">{syncInfo.stock_id}</span>
//               {isSyncing && <span className="spinner-border spinner-border-sm ms-2 text-muted" />}
//             </div>
//             <div className="small">
//               {syncInfo.stock_req_id     && <div><b>Request:</b>  {syncInfo.stock_req_id}</div>}
//               {syncInfo.source_name      && <div><b>From:</b>     {syncInfo.source_name}</div>}
//               {syncInfo.destination_name && <div><b>To:</b>       {syncInfo.destination_name}</div>}
//               {syncInfo.supplier_name    && <div><b>Supplier:</b> {syncInfo.supplier_name}</div>}
//             </div>
//             {scannedProducts.length > 0 && (
//               <button type="button"
//                 className="btn btn-sm btn-outline-danger mt-2 align-self-start"
//                 onClick={handleDiscardDraft}>
//                 <Trash2 size={14} className="me-1" />Discard Draft
//               </button>
//             )}
//           </div>
//         )}

//         {/* Product errors */}
//         {productErrors.length > 0 && (
//           <div className="alert alert-danger mb-3">
//             <h6 className="mb-2">
//               <AlertTriangle size={16} className="me-2" />
//               {productErrors.length} product(s) failed validation — correct them and resubmit.
//             </h6>
//             <ul className="mb-0">
//               {productErrors.map((e, i) => (
//                 <li key={i}><strong>{e.partial_code}</strong>: {e.errors.join("; ")}</li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* ── Stock Flow Details card ── */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <h5 className="mb-4">Stock Flow Details</h5>

//             {currentUser?.warehouse_name && (
//               <div className="row mb-3">
//                 <div className="col-lg-6">
//                   <label className="form-label">From Warehouse</label>
//                   <input type="text" className="form-control bg-light"
//                     value={currentUser.warehouse_name} readOnly disabled />
//                   <small className="text-muted">Your assigned warehouse (set by your account)</small>
//                 </div>
//               </div>
//             )}

//             <div className="row mb-3">
//               {/* Stock Request */}
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   Stock Request <span className="text-danger">*</span>
//                   {isRequestLocked && (
//                     <Lock size={13} className="ms-1 text-warning"
//                       title="Pre-selected from Stock Requests page" />
//                   )}
//                 </label>
//                 {isRequestLocked ? (
//                   <>
//                     <div className="d-flex align-items-center gap-2">
//                       <input type="text" className="form-control bg-light"
//                         value={formData.stock_request_id?.label || ""} readOnly disabled />
//                       <button type="button" className="btn btn-sm btn-outline-secondary text-nowrap"
//                         onClick={() => { dispatch(clearFlowSourceRequest()); setField("stock_request_id", null); }}>
//                         <X size={13} className="me-1" />Change
//                       </button>
//                     </div>
//                     <small className="text-muted">
//                       Pre-selected from the Stock Requests page. Click "Change" to pick a different one.
//                     </small>
//                   </>
//                 ) : (
//                   <>
//                     <Select options={stockRequestOptions} value={formData.stock_request_id}
//                       onChange={(opt) => setField("stock_request_id", opt)}
//                       placeholder={reqDropdownLoading ? "Loading requests…" : "Select a stock request"}
//                       isClearable isLoading={reqDropdownLoading}
//                       noOptionsMessage={() => reqDropdownLoading ? "Loading…" : "No approved requests found"} />
//                     <small className="text-muted">Showing approved requests you are assigned to dispatch</small>
//                   </>
//                 )}
//               </div>
// {/* */}
//               {/* Transport */}
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   Transport <span className="text-danger">*</span>
//                   {transportOptions.length === 0 && <span className="spinner-border spinner-border-sm ms-2" />}
//                 </label>
//                 <Select options={transportOptions} value={formData.transport}
//                   onChange={(opt) => setField("transport", opt)}
//                   placeholder={transportOptions.length === 0 ? "Loading…" : "Select transport method"}
//                   isLoading={transportOptions.length === 0} />
//                 {transportOptions.length > 0 && !formData.transport && (
//                   <small className="text-muted">
//                     Defaults to <strong>{transportOptions[0]?.label}</strong> if not selected
//                   </small>
//                 )}
//               </div>
//             </div>

//             <div className="row mb-3">
//               <div className="col-lg-6">
//                 <label className="form-label">Description</label>
//                 <textarea className="form-control" value={formData.description || ""}
//                   onChange={(e) => setField("description", e.target.value)}
//                   rows="2" placeholder="Notes about this transfer…" />
//               </div>
//               <div className="col-lg-6">
//                 <label className="form-label">Total Quantity</label>
//                 <input type="number" className="form-control bg-light" value={totalQty}
//                   readOnly disabled style={{ fontWeight: "bold", fontSize: "1.1rem" }} />
//                 <small className="text-muted">Auto-calculated from scanned products</small>
//               </div>
//             </div>

//             {/* ── Bill / Invoice ── */}
//             {/* FIX 2: billFile kept separately, appended to FormData on every sync */}
//             <div className="row">
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   <File size={16} className="me-1" />Bill / Invoice (Optional)
//                 </label>
//                 {!billPreview ? (
//                   <div className="border border-dashed rounded p-3 text-center">
//                     <input ref={billFileRef} type="file" id="billFileInput" className="d-none"
//                       accept=".pdf,.jpg,.jpeg,.png" onChange={handleBillChange} />
//                     <label htmlFor="billFileInput" className="mb-0" style={{ cursor: "pointer" }}>
//                       <Upload size={40} className="text-muted mb-2 d-block mx-auto" />
//                       <span className="text-muted">Click to upload — PDF, JPG, PNG max 5 MB</span>
//                     </label>
//                   </div>
//                 ) : (
//                   <div className="border rounded p-3 d-flex align-items-center justify-content-between">
//                     <div className="d-flex align-items-center">
//                       <File size={28} className="text-primary me-3" />
//                       <div>
//                         <p className="mb-0 fw-semibold">{billPreview.name}</p>
//                         <small className="text-muted">{billPreview.size}</small>
//                       </div>
//                     </div>
//                     <button type="button" className="btn btn-sm btn-danger" onClick={handleRemoveBill}>
//                       <X size={14} />
//                     </button>
//                   </div>
//                 )}
//                 {billPreview && (
//                   <small className="text-success d-block mt-1">
//                     ✓ Will be uploaded on next scan or submit.
//                   </small>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* ── Scan Barcode card ── */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <div className="d-flex align-items-center mb-3">
//               <Camera size={22} className="text-primary me-2" />
//               <h5 className="mb-0">Scan Barcode</h5>
//               <span className="badge badge-success ms-2" style={{ fontSize: "0.7rem" }}>Always Active</span>
//             </div>

//             {!canSync ? (
//               <div className="alert alert-info d-flex align-items-center mb-3">
//                 <span className="me-2 flex-shrink-0">ℹ</span>
//                 <div>
//                   <strong>Scanning is available now.</strong> Products will be held locally.
//                   <span className="d-block mt-1 text-muted small">
//                     Select a <strong>Stock Request</strong> above to auto-save each scan to draft.
//                   </span>
//                 </div>
//               </div>
//             ) : (
//               <div className="alert alert-success d-flex align-items-center mb-3">
//                 <span className="me-2 flex-shrink-0">✓</span>
//                 <div>
//                   <strong>Ready to scan &amp; auto-save!</strong> Each scan is saved to draft.
//                   <div className="mt-1">
//                     Request: <strong>{formData.stock_request_id?.label}</strong>
//                     {!formData.transport && effectiveTransport && (
//                       <span className="ms-2 badge badge-secondary" style={{ fontSize: "0.75rem" }}>
//                         Transport: {effectiveTransport.label} (default)
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="row align-items-end">
//               <div className="col-lg-8">
//                 <label className="form-label">
//                   Scan or Enter Barcode
//                   {(isScanning || isSyncing) && <span className="spinner-border spinner-border-sm ms-2" />}
//                 </label>
//                 <input ref={barcodeRef} type="text" className="form-control"
//                   value={barcodeInput}
//                   onChange={(e) => setBarcodeInput(e.target.value)}
//                   onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleScan(barcodeInput); } }}
//                   placeholder="Use scanner or type barcode then press Enter"
//                   disabled={isScanning} autoFocus />
//               </div>
//               <div className="col-lg-4">
//                 <button type="button" className="btn btn-primary w-100"
//                   onClick={() => handleScan(barcodeInput)}
//                   disabled={!barcodeInput.trim() || isScanning}>
//                   {isScanning
//                     ? <><span className="spinner-border spinner-border-sm me-2" />Scanning…</>
//                     : <><Plus size={16} className="me-1" />Add Product</>}
//                 </button>
//               </div>
//             </div>

//             {scannedProducts.length > 0 && (
//               <div className="alert alert-success d-flex align-items-center mt-3 mb-0">
//                 <Package size={18} className="me-2" />
//                 <strong>
//                   {scannedProducts.length} product(s) &nbsp;|&nbsp; Total Qty: {totalQty}
//                   {isSyncing && <span className="ms-2 text-muted small">saving…</span>}
//                   {!canSync && (
//                     <span className="ms-2 text-warning small">
//                       ⚠ Unsaved — select a Stock Request to persist
//                     </span>
//                   )}
//                 </strong>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* ── Scanned Products Table ── */}
//         {scannedProducts.length > 0 && (
//           <div className="card mb-3">
//             <div className="card-body">
//               <div className="d-flex align-items-center justify-content-between mb-3">
//                 <h5 className="mb-0">
//                   <Package size={18} className="me-2" />
//                   Scanned Products ({scannedProducts.length})
//                 </h5>
//                 <button type="button" className="btn btn-sm btn-outline-danger"
//                   onClick={() => handleRemoveSelected(scannedProducts.map((p) => p.prod_uuid))}>
//                   <Trash2 size={14} className="me-1" />Remove All
//                 </button>
//               </div>
//               <div className="table-responsive">
//                 <Table columns={columns} dataSource={scannedProducts} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* ── Transfer Summary ── */}
//         {scannedProducts.length > 0 && (
//           <div className="alert alert-warning mb-3">
//             <strong>Transfer Summary</strong>
//             <ul className="mb-0 mt-2">
//               <li>Total Products: {scannedProducts.length}</li>
//               <li>Total Quantity: {totalQty} units</li>
//               {currentUser?.warehouse_name && <li>From: {currentUser.warehouse_name}</li>}
//               {formData.stock_request_id && <li>Stock Request: {formData.stock_request_id.label}</li>}
//               {effectiveTransport && (
//                 <li>Transport: {effectiveTransport.label}{!formData.transport ? " (default)" : ""}</li>
//               )}
//               <li>Status after submit: <strong>in-transit</strong></li>
//               {currentStockId && <li>Draft Stock ID: <strong>{currentStockId}</strong></li>}
//             </ul>
//             <small className="text-muted d-block mt-1">Inventory will be updated on submission.</small>
//           </div>
//         )}

//         {/* ── Submit / Cancel ── */}
//         <div className="col-lg-12">
//           <div className="btn-addproduct mb-4">
//             <Link to="/stock-transfer" className="btn btn-cancel me-2">Cancel</Link>
//             <button type="button" className="btn btn-submit" onClick={handleSubmit}
//               disabled={submitting || scannedProducts.length === 0 || !canSync}>
//               {submitting
//                 ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
//                 : <><Send size={16} className="me-1" />Create Stock Flow</>}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* ── Article Profile Picker Modal ── */}
//       <Modal show={profileModal.open}
//         onHide={() => { setProfileModal({ open: false, profiles: [], partial_code: "" }); barcodeRef.current?.focus(); }}
//         centered size="sm">
//         <Modal.Header>
//           <Modal.Title style={{ fontSize: "1rem" }}>
//             <Package size={16} className="me-2 text-primary" />Select Article Profile
//           </Modal.Title>
//           <button className="btn-close"
//             onClick={() => { setProfileModal({ open: false, profiles: [], partial_code: "" }); barcodeRef.current?.focus(); }} />
//         </Modal.Header>
//         <Modal.Body>
//           <p className="text-muted small mb-3">
//             Barcode <strong>{profileModal.partial_code}</strong> matches multiple article profiles. Select one to add:
//           </p>
//           <div className="d-flex flex-column gap-2">
//             {profileModal.profiles.map((profile) => (
//               <button key={profile.article_profile_id} type="button"
//                 className="btn btn-outline-primary text-start w-100"
//                 style={{ padding: "10px 14px" }}
//                 onClick={async () => {
//                   const code = profileModal.partial_code;
//                   setProfileModal({ open: false, profiles: [], partial_code: "" });
//                   await doScanAndAdd(code, profile.product_id);
//                 }}>
//                 <span className="d-block fw-semibold" style={{ fontSize: "0.875rem" }}>
//                   {profile.article_profile_name}
//                 </span>
//                 <span className="text-muted" style={{ fontSize: "0.75rem" }}>
//                   ID: {profile.article_profile_id}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default AddStockFlow;





// import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Select from "react-select";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import {
//   ArrowLeft, ChevronUp, Camera, Plus, Package, Send,
//   Trash2, Upload, RefreshCw, AlertTriangle, File, X, Lock,
// } from "feather-icons-react/build/IconComponents";
// import { OverlayTrigger, Tooltip } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import { setToogleHeader } from "../../core/redux/action";
// import { scanProduct } from "../../core/redux/slices/productSlice";
// import {
//   fetchStockRequestDropdown,
//   selectFlowSourceRequest,
//   selectReqDropdown,
//   selectReqDropdownLoading,
//   clearFlowSourceRequest,
// } from "../../core/redux/slices/stockSlice";
// import AuthService from "../../services/authService";
// import Table from "../../core/pagination/datatable";
// import { Modal } from "react-bootstrap";

// const MySwal = withReactContent(Swal);

// const toast = (icon, title, text, timer = 2000) =>
//   MySwal.fire({ icon, title, text, timer, showConfirmButton: false, toast: true, position: "top-end" });

// const STATUS_BADGE = {
//   good:          "badge-success",
//   faulty:        "badge-info",
//   "broke/burnt": "badge-danger",
//   broken:        "badge-danger",
// };

// const TRANSFERABLE_STATUSES = ["good", "faulty", "broke/burnt"];

// const INITIAL_FORM = {
//   stock_request_id: null,
//   transport:        null,
//   description:      "",
// };

// const toApiProdItem = (p) => ({
//   prod_uuid:            p.prod_uuid,
//   partial_code:         p.partial_code,
//   article_profile_id:   p.article_profile_id,
//   article_profile_name: p.article_profile_name,
//   status:               p.status,
//   count:                p.quantity_to_transfer || 1,
// });

// // =============================================================================
// const AddStockFlow = () => {
//   const dispatch     = useDispatch();
//   const navigate     = useNavigate();
//   const headerToggle = useSelector((s) => s.toggle_header);
//   const currentUser  = useSelector((s) => s.user?.currentUser);

//   const flowSourceRequest  = useSelector(selectFlowSourceRequest);
//   const reqDropdownRaw     = useSelector(selectReqDropdown);
//   const reqDropdownLoading = useSelector(selectReqDropdownLoading);

//   const [profileModal, setProfileModal] = useState({ open: false, profiles: [], partial_code: "" });

//   const stockRequestOptions = useMemo(
//     () => reqDropdownRaw.map((r) => ({ value: r.stock_req_id, label: `#${r.stock_req_id}` })),
//     [reqDropdownRaw],
//   );

//   // ── FIX 1: Track lock in local state so it survives clearFlowSourceRequest() ──
//   // flowSourceRequest is cleared from Redux in the cleanup fn, but we need the
//   // locked UI to persist for the lifetime of this component.
//   const [lockedRequest, setLockedRequest] = useState(null); // { value, label } | null
//   const isRequestLocked = !!lockedRequest;

//   const [transportOptions, setTransportOptions] = useState([]);
//   const [formData, setFormData]                 = useState(INITIAL_FORM);
//   const setField = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

//   const [scannedProducts, setScannedProducts] = useState([]);
//   const scannedProductsRef                    = useRef([]);

//   const [currentStockId, setCurrentStockId] = useState(null);
//   const currentStockIdRef                   = useRef(null);
//   const setStockId = (id) => { currentStockIdRef.current = id; setCurrentStockId(id); };

//   const [syncInfo, setSyncInfo] = useState(null);

//   const [loadingDraft,  setLoadingDraft]  = useState(true);
//   const [isScanning,    setIsScanning]    = useState(false);
//   const [isSyncing,     setIsSyncing]     = useState(false);
//   const [submitting,    setSubmitting]    = useState(false);
//   const [productErrors, setProductErrors] = useState([]);

//   const [barcodeInput, setBarcodeInput] = useState("");
//   const barcodeRef = useRef(null);


//   const [billFile,    setBillFile]    = useState(null);
//   const [billPreview, setBillPreview] = useState(null);
//   const billFileRef   = useRef(null);
//   const billFileState = useRef(null); 

//   const totalQty = useMemo(
//     () => scannedProducts.reduce((s, p) => s + (parseInt(p.quantity_to_transfer) || 0), 0),
//     [scannedProducts],
//   );

//   const canSync            = !!(formData.stock_request_id && (formData.transport || transportOptions[0]));
//   const effectiveTransport = formData.transport || transportOptions[0] || null;
// // ....

//   const restoringDraftRef = useRef(false);

//   useEffect(() => {
//     const preselected = flowSourceRequest;

//     (async () => {
//       await Promise.all([loadTransportOptions(), dispatch(fetchStockRequestDropdown())]);

//       if (preselected) {
      
//         setLockedRequest({ value: preselected.value, label: preselected.label });
//         setField("stock_request_id", { value: preselected.value, label: preselected.label });
//         await restoreDraft(preselected.value);
//       } else {
//         setLoadingDraft(false);
//       }
//     })();

//     return () => { dispatch(clearFlowSourceRequest()); };
//     // eslint-disable-next-line
//   }, []);

//   // ── FIX 4: Re-sync guard — skip when restoring draft ──────────────────────
//   useEffect(() => {
//     if (restoringDraftRef.current) return;          // draft restore in progress
//     if (scannedProductsRef.current.length > 0 && canSync) {
//       syncToDb(scannedProductsRef.current, formData);
//     }
//     // eslint-disable-next-line
//   }, [formData.stock_request_id, formData.transport]);

//   const setScanned = (val) => {
//     setScannedProducts((prev) => {
//       const next = typeof val === "function" ? val(prev) : val;
//       scannedProductsRef.current = next;
//       return next;
//     });
//   };

//   // ── Transport options ──────────────────────────────────────────────────────
//   const loadTransportOptions = async () => {
//     try {
//       const res     = await AuthService.getStockFlowOptions();
//       const options = res.data?.data;
//       if (!options) { toast("error", "Options Error", "Failed to load transport options.", 5000); return; }
//       const toOpt = (v) =>
//         typeof v === "object" && v !== null && v.value !== undefined ? v : {
//           value: String(v),
//           label: String(v).split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
//         };
//       setTransportOptions((options.transport || []).map(toOpt));
//     } catch (e) {
//       toast("error", "Options Error", `Could not load transport options: ${e.message}`, 5000);
//     }
//   };

//   // ── restoreDraft ──────────────────────────────────────────────────────────
//   // Takes an explicit requestId — never relies on syncInfo (null at mount)
//   const restoreDraft = async (requestId) => {
//     if (!requestId) {
//       setLoadingDraft(false);
//       return;
//     }

//     setLoadingDraft(true);
 
//     restoringDraftRef.current = true;

//     try {
//       const res  = await AuthService.get_approved_stock_flow(requestId);
//       const body = res.data;

//       if (!body.is_found || !body.data || Object.keys(body.data).length === 0) {
//         return; 
//       }

//       const lot = body.data;

//       setStockId(lot.stock_id);
//       if (lot.description) setFormData((prev) => ({ ...prev, description: lot.description }));

     
//       setSyncInfo({
//         stock_id:              lot.stock_id,
//         stock_req_id:          lot.request_id,  
//         supplier_name:         lot.supplier_name,
//         source_name:           lot.source_name,
//         destination_name:      lot.destination_name,
//         recipient_name:        lot.recipient_name,
//         transportation:        lot.transportation,
//         description:           lot.description,
//         invoice_original_name: lot.invoice_original_name,
//       });

//       // Restore transport without triggering the re-sync watcher
//       if (lot.transportation) {
//         setField("transport", {
//           value: lot.transportation,
//           label: lot.transportation
//             .split("_")
//             .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
//             .join(" "),
//         });
//       }

//       // Restore scanned products
//       if (lot.prod_arr?.length) {
//         const restored = lot.prod_arr.filter(Boolean).map((p) => ({
//           prod_uuid:            p.prod_uuid,
//           partial_code:         p.partial_code,
//           article_profile_id:   p.article_profile_id || "",
//           article_profile_name: p.article_profile_name || "—",
//           warehouse_name:       p.warehouse_name || "—",
//           count:                p.available ?? p.count ?? 0,   // available = warehouse qty
//           status:               p.status,
//           quantity_to_transfer: p.count || 1,                  // count = draft transfer qty
//         }));
//         setScanned(restored);

//         MySwal.fire({
//           icon: "info",
//           title: "Draft Restored",
//           html: `
//             <p><strong>${restored.length}</strong> product(s) from your previous session.</p>
//             <small class="text-muted">
//               Stock ID: ${lot.stock_id} · Request: ${lot.request_id}
//             </small>
//           `,
//           timer: 3500,
//           showConfirmButton: false,
//         });
//       }
//     } catch (err) {
//       // 404 → no draft yet; 409 → not approved yet — both non-fatal
//       console.warn("restoreDraft:", err.response?.status, err.message);
//     } finally {
//       setLoadingDraft(false);
//       // ── FIX 4: Lower guard after a tick so pending state updates flush first
//       setTimeout(() => { restoringDraftRef.current = false; }, 0);
//     }
//   };

//   // ── syncToDb ───────────────────────────────────────────────────────────────
//   // ── FIX 5: billFile removed from deps; read from ref instead ──────────────
//   const syncToDb = useCallback(async (products, fd) => {
//     if (!fd.stock_request_id) return;
//     if (!products.length)     return;

//     const transport = fd.transport || transportOptions[0] || null;
//     if (!transport) { console.warn("syncToDb: no transport — skipping."); return; }

//     setIsSyncing(true);
//     try {
//       const payload = new FormData();
//       payload.append("request_id",     fd.stock_request_id.value);
//       payload.append("transportation", transport.value);
//       payload.append("prod_arr",       JSON.stringify(products.map(toApiProdItem)));
//       if (fd.description) payload.append("description", fd.description);

//       // Use ref so this callback doesn't need billFile as a dep
//       if (billFileState.current) payload.append("stock_transfer_invoice", billFileState.current);

//       const res  = await AuthService.stockFlowSync(payload);
//       const body = res.data;

//       if (body?.data?.stock_id) {
//         setSyncInfo({
//           stock_id:         body.data.stock_id,
//           stock_req_id:     body.data.stock_req_id ?? fd.stock_request_id?.value,
//           supplier_name:    body.data.supplier_name,
//           source_name:      body.data.source_name,
//           destination_name: body.data.destination_name,
//           recipient_name:   body.data.recipient_name,
//         });
//         setStockId(body.data.stock_id);
//       }
//       // If body.data absent (re-sync) → existing syncInfo survives → banner stays

//       console.log("Sync ✓", body?.message, "| syncInfo kept:", !body?.data);
//     } catch (err) {
//       const msg = err.response?.data?.message || "Failed to sync draft";
//       toast("error", "Sync Error", msg, 3000);
//       console.error("syncToDb error:", err.response?.data || err);
//     } finally {
//       setIsSyncing(false);
//     }
//     // eslint-disable-next-line
//   }, [transportOptions]); // billFile intentionally excluded — read from ref

//   // ── doScanAndAdd ──────────────────────────────────────────────────────────
//   const doScanAndAdd = useCallback(async (code, product_id = null, prefetchedProduct = null) => {
//     setIsScanning(true);
//     try {
//       let product;
//       if (prefetchedProduct) {
//         product = prefetchedProduct;
//       } else {
//         const result = await dispatch(scanProduct({ code, product_id })).unwrap();
//         product = result?.data ?? result;
//       }

//       if (!product?.prod_uuid) throw new Error("Product not found");

//       if (currentUser?.warehouse_id && product.warehouse_id !== currentUser.warehouse_id) {
//         MySwal.fire({ icon: "error", title: "Wrong Warehouse",
//           text: `This product belongs to "${product.warehouse_name}", not your assigned warehouse.` });
//         return;
//       }

//       if (!TRANSFERABLE_STATUSES.includes(product.status)) {
//         MySwal.fire({ icon: "error", title: "Invalid Status",
//           text: `"${product.partial_code || code}" has status "${product.status}". ` +
//                 `Only ${TRANSFERABLE_STATUSES.join(", ")} can be transferred.` });
//         return;
//       }

//       if (scannedProductsRef.current.find((p) => p.prod_uuid === product.prod_uuid)) {
//         toast("warning", "Already Scanned", `Product "${product.partial_code || code}" is already in the list.`);
//         setBarcodeInput(""); return;
//       }

//       const newProd = {
//         prod_uuid:            product.prod_uuid,
//         partial_code:         product.partial_code || code,
//         article_profile_id:   product.article_profile_id,
//         article_profile_name: product.article_profile_name || "—",
//         warehouse_name:       product.warehouse_name || "—",
//         count:                product.count ?? 0,
//         status:               product.status,
//         quantity_to_transfer: 1,
//       };

//       const updated = [...scannedProductsRef.current, newProd];
//       setScanned(updated);
//       setBarcodeInput("");

//       if (canSync) {
//         await syncToDb(updated, formData);
//         toast("success", "Scanned & Saved", newProd.partial_code);
//       } else {
//         toast("info", "Scanned (Local)",
//           `"${newProd.partial_code}" added. Select a Stock Request above to save draft.`);
//       }
//     } catch (err) {
//       const msg = err.response?.data?.message || err.message || "Product not found";
//       MySwal.fire({ icon: "error", title: "Not Found", text: msg });
//     } finally {
//       setIsScanning(false);
//       barcodeRef.current?.focus();
//     }
//     // eslint-disable-next-line
//   }, [dispatch, formData, canSync, syncToDb, currentUser]);

//   // ── handleScan ────────────────────────────────────────────────────────────
//   const handleScan = useCallback(async (partial_code) => {
//     const code = (partial_code || "").trim();
//     if (!code) return;

//     setIsScanning(true);
//     try {
//       const profileRes = await AuthService.getProfileByCode(code);
//       const raw        = profileRes.data?.data;
//       const isArray    = Array.isArray(raw);
//       const profiles   = isArray ? raw : null;

//       if (profiles && profiles.length > 1) {
//         setProfileModal({ open: true, profiles, partial_code: code });
//         setBarcodeInput("");
//         setIsScanning(false);
//         return;
//       }
//       if (!isArray && raw?.prod_uuid) { await doScanAndAdd(code, null, raw); return; }
//       if (isArray && profiles.length === 1) { await doScanAndAdd(code, profiles[0].product_id); return; }
//       await doScanAndAdd(code);
//     } catch (err) {
//       const msg = err.response?.data?.message || err.message || "Product not found";
//       MySwal.fire({ icon: "error", title: "Not Found", text: msg });
//       setIsScanning(false);
//     }
//     // eslint-disable-next-line
//   }, [formData, canSync, syncToDb, currentUser, doScanAndAdd]);

//   // ── Remove single ─────────────────────────────────────────────────────────
//   const handleRemoveProduct = useCallback((prod_uuid, partial_code) => {
//     MySwal.fire({
//       title: "Remove Product?", text: "This will remove it from your draft.",
//       icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Remove",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       try {
//         if (currentStockIdRef.current) {
//           const res = await AuthService.removeStockProduct(partial_code);
//           setScanned((prev) => prev.filter((p) => p.prod_uuid !== prod_uuid));
//           if (res.data?.draft_deleted) {
//             setStockId(null); setSyncInfo(null);
//             toast("info", "Draft Cleared", "Last product removed. Draft deleted.");
//           } else {
//             toast("success", "Removed", `"${partial_code}" removed.`);
//           }
//         } else {
//           setScanned((prev) => prev.filter((p) => p.prod_uuid !== prod_uuid));
//           toast("success", "Removed", `"${partial_code}" removed.`);
//         }
//       } catch (err) {
//         toast("error", "Error", err.response?.data?.message || "Failed to remove.", 3000);
//       }
//     });
//   }, []);

//   // ── Remove all ────────────────────────────────────────────────────────────
//   const handleRemoveSelected = useCallback((selectedUuids) => {
//     MySwal.fire({
//       title: `Remove ${selectedUuids.length} product(s)?`, icon: "warning",
//       showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Remove All",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       const toRemove = scannedProducts.filter((p) => selectedUuids.includes(p.prod_uuid));
//       if (currentStockIdRef.current) {
//         for (const p of toRemove) {
//           try { await AuthService.removeStockProduct(p.partial_code); } catch { /* continue */ }
//         }
//       }
//       const remaining = scannedProducts.filter((p) => !selectedUuids.includes(p.prod_uuid));
//       setScanned(remaining);
//       if (remaining.length === 0) { setStockId(null); setSyncInfo(null); }
//       toast("success", "Removed", `${toRemove.length} product(s) removed.`);
//     });
//   }, [scannedProducts]);

//   // ── Discard draft ─────────────────────────────────────────────────────────
//   const handleDiscardDraft = () => {
//     MySwal.fire({
//       title: "Discard entire draft?", text: "All scanned products will be removed.",
//       icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Yes, discard",
//     }).then(async (result) => {
//       if (!result.isConfirmed) return;
//       try {
//         if (currentStockIdRef.current) await AuthService.discardDraft();
//         setScanned([]); setStockId(null); setSyncInfo(null);
//         toast("info", "Draft Discarded", "All products cleared.");
//       } catch (err) {
//         toast("error", "Error", err.response?.data?.message || "Failed to discard.", 3000);
//       }
//     });
//   };

//   // ── Qty change ────────────────────────────────────────────────────────────
//   const handleQtyChange = useCallback((prod_uuid, newQty) => {
//     setScanned((prev) => prev.map((p) => {
//       if (p.prod_uuid !== prod_uuid) return p;
//       const qty = parseInt(newQty) || 0;
//       if (qty > p.count) { toast("warning", "Insufficient Stock", `Only ${p.count} units available.`); return p; }
//       return { ...p, quantity_to_transfer: qty };
//     }));
//   }, []);

//   // ── Bill / Invoice ────────────────────────────────────────────────────────
//   const handleBillChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (!["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
//       toast("warning", "Invalid File", "PDF, JPG, or PNG only."); return;
//     }
//     if (file.size > 5 * 1024 * 1024) { toast("warning", "Too Large", "Max 5 MB."); return; }
//     // ── FIX 5: keep both state (for UI) and ref (for callbacks) in sync
//     setBillFile(file);
//     billFileState.current = file;
//     setBillPreview({ name: file.name, size: (file.size / 1024).toFixed(2) + " KB" });
//   };

//   const handleRemoveBill = () => {
//     setBillFile(null);
//     billFileState.current = null;
//     setBillPreview(null);
//     if (billFileRef.current) billFileRef.current.value = "";
//   };

//   // ── Submit ────────────────────────────────────────────────────────────────
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setProductErrors([]);

//     if (!scannedProducts.length)         { toast("warning", "No Products", "Scan at least one product."); return; }
//     if (!formData.stock_request_id)      { toast("warning", "Missing", "Stock Request is required."); return; }
//     if (!effectiveTransport)             { toast("warning", "Missing", "No transport options available yet."); return; }
//     if (scannedProducts.some((p) => p.quantity_to_transfer <= 0)) {
//       toast("warning", "Invalid Qty", "All quantities must be greater than 0."); return;
//     }

//     await syncToDb(scannedProducts, formData);

//     setSubmitting(true);
//     try {
//       const res  = await AuthService.stockFlowSubmit();
//       const body = res.data;

//       if (!body.success) {
//         const errProds = body.data || [];
//         if (errProds.length) {
//           setProductErrors(errProds.map((ep) => {
//             const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
//             return { prod_uuid: ep.prod_uuid, partial_code: local?.partial_code || ep.prod_uuid,
//               errors: [`Count ${ep.count}, status "${ep.status}" — inventory mismatch`] };
//           }));
//           MySwal.fire({ icon: "error", title: "Submission Failed",
//             html: `<p>${body.message}</p><p class="text-muted small">Inconsistent products highlighted below.</p>` });
//           return;
//         }
//         throw new Error(body.message || "Submission failed.");
//       }

//       MySwal.fire({
//         icon: "success", title: "Stock Flow Created!",
//         html: `
//           <p><strong>Stock ID:</strong> ${currentStockIdRef.current || "—"}</p>
//           <p><strong>Products:</strong> ${scannedProducts.length}</p>
//           <p><strong>Total Quantity:</strong> ${totalQty}</p>
//           ${formData.stock_request_id ? `<p><strong>Request:</strong> ${formData.stock_request_id.label}</p>` : ""}
//           <p class="text-muted small">Status set to <strong>in-transit</strong></p>
//         `,
//         confirmButtonText: "View Stock Flows",
//       }).then(() => navigate("/stock-transfer"));
//     } catch (err) {
//       const msg      = err.response?.data?.message || err.message || "Failed to create stock flow.";
//       const errProds = err.response?.data?.data || [];
//       if (errProds.length) {
//         setProductErrors(errProds.map((ep) => {
//           const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
//           return { prod_uuid: ep.prod_uuid, partial_code: local?.partial_code || ep.prod_uuid,
//             errors: [`Count ${ep.count}, status "${ep.status}" — inventory mismatch`] };
//         }));
//       }
//       MySwal.fire({ icon: "error", title: "Error", text: msg });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   // ── Table columns ─────────────────────────────────────────────────────────
//   const columns = useMemo(() => {
//     const errorMap = Object.fromEntries(productErrors.map((e) => [e.prod_uuid, e.errors]));
//     return [
//       { title: "#", render: (_, __, i) => i + 1, width: "50px" },
//       {
//         title: "Barcode / Code", dataIndex: "partial_code",
//         render: (text, record) => (
//           <span>
//             <span className="badge badge-primary">{text}</span>
//             {errorMap[record.prod_uuid] && (
//               <div className="mt-1">
//                 {errorMap[record.prod_uuid].map((err, i) => (
//                   <div key={i} className="text-danger small">
//                     <AlertTriangle size={12} className="me-1" />{err}
//                   </div>
//                 ))}
//               </div>
//             )}
//           </span>
//         ),
//       },
//       { title: "Article Profile", dataIndex: "article_profile_name" },
//       { title: "Warehouse",       dataIndex: "warehouse_name" },
//       {
//         title: "Status", dataIndex: "status",
//         render: (t) => (
//           <span className={`badge ${STATUS_BADGE[t] || "badge-info"}`}>{t?.toUpperCase() || "N/A"}</span>
//         ),
//       },
//       { title: "Available", dataIndex: "count",
//         render: (t) => <span className="badge badge-info">{t}</span> },
//       {
//         title: "Transfer Qty", dataIndex: "quantity_to_transfer",
//         render: (text, record) => (
//           <input type="number" className="form-control form-control-sm" style={{ width: "80px" }}
//             value={text} min="1" max={record.count}
//             onChange={(e) => handleQtyChange(record.prod_uuid, e.target.value)} />
//         ),
//       },
//       {
//         title: "Action", width: "80px",
//         render: (_, record) => (
//           <button type="button" className="btn btn-sm btn-danger"
//             onClick={() => handleRemoveProduct(record.prod_uuid, record.partial_code)} title="Remove">
//             <Trash2 size={14} />
//           </button>
//         ),
//       },
//     ];
//   }, [productErrors, handleQtyChange, handleRemoveProduct]);

//   // ── Render ────────────────────────────────────────────────────────────────
//   return (
//     <div className="page-wrapper">
//       <div className="content">

//         {/* Page Header */}
//         <div className="page-header">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>Create Stock Flow</h4>
//               <h6>Scan or import products to create a stock transfer</h6>
//             </div>
//           </div>
//           <ul className="table-top-head">
//             <li>
//               <Link to="/stock-transfer" className="btn btn-secondary btn-sm">
//                 <ArrowLeft size={16} className="me-1" />Back
//               </Link>
//             </li>
//             <li>
//               <OverlayTrigger placement="top" overlay={<Tooltip>Collapse</Tooltip>}>
//                 <Link id="collapse-header" className={headerToggle ? "active" : ""}
//                   onClick={() => dispatch(setToogleHeader(!headerToggle))}>
//                   <ChevronUp className="feather-chevron-up" />
//                 </Link>
//               </OverlayTrigger>
//             </li>
//           </ul>
//         </div>

//         {/* Draft loading */}
//         {loadingDraft && (
//           <div className="alert alert-light d-flex align-items-center mb-3">
//             <span className="spinner-border spinner-border-sm me-2" />
//             Checking for saved draft…
//           </div>
//         )}

//         {/* Active Draft Banner — survives every re-sync because we never call
//             setSyncInfo(null) unless the user explicitly discards the draft    */}
//         {!loadingDraft && syncInfo && (
//           <div className="alert alert-warning d-flex flex-column mb-3">
//             <div className="d-flex align-items-center mb-2">
//               <RefreshCw size={16} className="me-2" />
//               <strong>Active Draft:</strong>
//               <span className="ms-2 badge badge-warning">{syncInfo.stock_id}</span>
//               {isSyncing && <span className="spinner-border spinner-border-sm ms-2 text-muted" />}
//             </div>
//             <div className="small">
//               {syncInfo.stock_req_id     && <div><b>Request:</b>  {syncInfo.stock_req_id}</div>}
//               {syncInfo.source_name      && <div><b>From:</b>     {syncInfo.source_name}</div>}
//               {syncInfo.destination_name && <div><b>To:</b>       {syncInfo.destination_name}</div>}
//               {syncInfo.supplier_name    && <div><b>Supplier:</b> {syncInfo.supplier_name}</div>}
//               {syncInfo.recipient_name   && <div><b>Recipient:</b>{syncInfo.recipient_name}</div>}
//             </div>
//             {scannedProducts.length > 0 && (
//               <button type="button"
//                 className="btn btn-sm btn-outline-danger mt-2 align-self-start"
//                 onClick={handleDiscardDraft}>
//                 <Trash2 size={14} className="me-1" />Discard Draft
//               </button>
//             )}
//           </div>
//         )}

//         {/* Product errors */}
//         {productErrors.length > 0 && (
//           <div className="alert alert-danger mb-3">
//             <h6 className="mb-2">
//               <AlertTriangle size={16} className="me-2" />
//               {productErrors.length} product(s) failed validation — correct them and resubmit.
//             </h6>
//             <ul className="mb-0">
//               {productErrors.map((e, i) => (
//                 <li key={i}><strong>{e.partial_code}</strong>: {e.errors.join("; ")}</li>
//               ))}
//             </ul>
//           </div>
//         )}

//         {/* Stock Flow Details card */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <h5 className="mb-4">Stock Flow Details</h5>

//             {currentUser?.warehouse_name && (
//               <div className="row mb-3">
//                 <div className="col-lg-6">
//                   <label className="form-label">From Warehouse</label>
//                   <input type="text" className="form-control bg-light"
//                     value={currentUser.warehouse_name} readOnly disabled />
//                   <small className="text-muted">Your assigned warehouse (set by your account)</small>
//                 </div>
//               </div>
//             )}

//             <div className="row mb-3">
//               {/* Stock Request */}
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   Stock Request <span className="text-danger">*</span>
//                   {/* ── FIX 1: use lockedRequest (local state) not flowSourceRequest (Redux) */}
//                   {isRequestLocked && (
//                     <Lock size={13} className="ms-1 text-warning"
//                       title="Pre-selected from Stock Requests page" />
//                   )}
//                 </label>
//                 {isRequestLocked ? (
//                   <>
//                     <div className="d-flex align-items-center gap-2">
//                       <input type="text" className="form-control bg-light"
//                         value={formData.stock_request_id?.label || lockedRequest?.label || ""} readOnly disabled />
//                       <button type="button" className="btn btn-sm btn-outline-secondary text-nowrap"
//                         onClick={() => {
//                           setLockedRequest(null);
//                           setField("stock_request_id", null);
//                         }}>
//                         <X size={13} className="me-1" />Change
//                       </button>
//                     </div>
//                     <small className="text-muted">
//                       Pre-selected from the Stock Requests page. Click "Change" to pick a different one.
//                     </small>
//                   </>
//                 ) : (
//                   <>
//                     <Select options={stockRequestOptions} value={formData.stock_request_id}
//                       onChange={(opt) => setField("stock_request_id", opt)}
//                       placeholder={reqDropdownLoading ? "Loading requests…" : "Select a stock request"}
//                       isClearable isLoading={reqDropdownLoading}
//                       noOptionsMessage={() => reqDropdownLoading ? "Loading…" : "No approved requests found"} />
//                     <small className="text-muted">Showing approved requests you are assigned to dispatch</small>
//                   </>
//                 )}
//               </div>

//               {/* Transport */}
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   Transport <span className="text-danger">*</span>
//                   {transportOptions.length === 0 && <span className="spinner-border spinner-border-sm ms-2" />}
//                 </label>
//                 <Select options={transportOptions} value={formData.transport}
//                   onChange={(opt) => setField("transport", opt)}
//                   placeholder={transportOptions.length === 0 ? "Loading…" : "Select transport method"}
//                   isLoading={transportOptions.length === 0} />
//                 {transportOptions.length > 0 && !formData.transport && (
//                   <small className="text-muted">
//                     Defaults to <strong>{transportOptions[0]?.label}</strong> if not selected
//                   </small>
//                 )}
//               </div>
//             </div>

//             <div className="row mb-3">
//               <div className="col-lg-6">
//                 <label className="form-label">Description</label>
//                 <textarea className="form-control" value={formData.description || ""}
//                   onChange={(e) => setField("description", e.target.value)}
//                   rows="2" placeholder="Notes about this transfer…" />
//               </div>
//               <div className="col-lg-6">
//                 <label className="form-label">Total Quantity</label>
//                 <input type="number" className="form-control bg-light" value={totalQty}
//                   readOnly disabled style={{ fontWeight: "bold", fontSize: "1.1rem" }} />
//                 <small className="text-muted">Auto-calculated from scanned products</small>
//               </div>
//             </div>

//             {/* Bill / Invoice */}
//             <div className="row">
//               <div className="col-lg-6">
//                 <label className="form-label">
//                   <File size={16} className="me-1" />Bill / Invoice (Optional)
//                 </label>

//                 {/* Show existing invoice name from draft if no new file selected */}
//                 {!billPreview && syncInfo?.invoice_original_name && (
//                   <div className="alert alert-info py-2 px-3 mb-2 d-flex align-items-center">
//                     <File size={14} className="me-2 flex-shrink-0" />
//                     <small>
//                       Existing invoice: <strong>{syncInfo.invoice_original_name}</strong>
//                       <span className="ms-1 text-muted">(upload a new file to replace)</span>
//                     </small>
//                   </div>
//                 )}

//                 {!billPreview ? (
//                   <div className="border border-dashed rounded p-3 text-center">
//                     <input ref={billFileRef} type="file" id="billFileInput" className="d-none"
//                       accept=".pdf,.jpg,.jpeg,.png" onChange={handleBillChange} />
//                     <label htmlFor="billFileInput" className="mb-0" style={{ cursor: "pointer" }}>
//                       <Upload size={40} className="text-muted mb-2 d-block mx-auto" />
//                       <span className="text-muted">Click to upload — PDF, JPG, PNG max 5 MB</span>
//                     </label>
//                   </div>
//                 ) : (
//                   <div className="border rounded p-3 d-flex align-items-center justify-content-between">
//                     <div className="d-flex align-items-center">
//                       <File size={28} className="text-primary me-3" />
//                       <div>
//                         <p className="mb-0 fw-semibold">{billPreview.name}</p>
//                         <small className="text-muted">{billPreview.size}</small>
//                       </div>
//                     </div>
//                     <button type="button" className="btn btn-sm btn-danger" onClick={handleRemoveBill}>
//                       <X size={14} />
//                     </button>
//                   </div>
//                 )}
//                 {billPreview && (
//                   <small className="text-success d-block mt-1">
//                     ✓ Will be uploaded on next scan or submit.
//                   </small>
//                 )}
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Scan Barcode card */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <div className="d-flex align-items-center mb-3">
//               <Camera size={22} className="text-primary me-2" />
//               <h5 className="mb-0">Scan Barcode</h5>
//               <span className="badge badge-success ms-2" style={{ fontSize: "0.7rem" }}>Always Active</span>
//             </div>

//             {!canSync ? (
//               <div className="alert alert-info d-flex align-items-center mb-3">
//                 <span className="me-2 flex-shrink-0">ℹ</span>
//                 <div>
//                   <strong>Scanning is available now.</strong> Products will be held locally.
//                   <span className="d-block mt-1 text-muted small">
//                     Select a <strong>Stock Request</strong> above to auto-save each scan to draft.
//                   </span>
//                 </div>
//               </div>
//             ) : (
//               <div className="alert alert-success d-flex align-items-center mb-3">
//                 <span className="me-2 flex-shrink-0">✓</span>
//                 <div>
//                   <strong>Ready to scan &amp; auto-save!</strong> Each scan is saved to draft.
//                   <div className="mt-1">
//                     Request: <strong>{formData.stock_request_id?.label}</strong>
//                     {!formData.transport && effectiveTransport && (
//                       <span className="ms-2 badge badge-secondary" style={{ fontSize: "0.75rem" }}>
//                         Transport: {effectiveTransport.label} (default)
//                       </span>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             )}

//             <div className="row align-items-end">
//               <div className="col-lg-8">
//                 <label className="form-label">
//                   Scan or Enter Barcode
//                   {(isScanning || isSyncing) && <span className="spinner-border spinner-border-sm ms-2" />}
//                 </label>
//                 <input ref={barcodeRef} type="text" className="form-control"
//                   value={barcodeInput}
//                   onChange={(e) => setBarcodeInput(e.target.value)}
//                   onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleScan(barcodeInput); } }}
//                   placeholder="Use scanner or type barcode then press Enter"
//                   disabled={isScanning} autoFocus />
//               </div>
//               <div className="col-lg-4">
//                 <button type="button" className="btn btn-primary w-100"
//                   onClick={() => handleScan(barcodeInput)}
//                   disabled={!barcodeInput.trim() || isScanning}>
//                   {isScanning
//                     ? <><span className="spinner-border spinner-border-sm me-2" />Scanning…</>
//                     : <><Plus size={16} className="me-1" />Add Product</>}
//                 </button>
//               </div>
//             </div>

//             {scannedProducts.length > 0 && (
//               <div className="alert alert-success d-flex align-items-center mt-3 mb-0">
//                 <Package size={18} className="me-2" />
//                 <strong>
//                   {scannedProducts.length} product(s) &nbsp;|&nbsp; Total Qty: {totalQty}
//                   {isSyncing && <span className="ms-2 text-muted small">saving…</span>}
//                   {!canSync && (
//                     <span className="ms-2 text-warning small">
//                       ⚠ Unsaved — select a Stock Request to persist
//                     </span>
//                   )}
//                 </strong>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Scanned Products Table */}
//         {scannedProducts.length > 0 && (
//           <div className="card mb-3">
//             <div className="card-body">
//               <div className="d-flex align-items-center justify-content-between mb-3">
//                 <h5 className="mb-0">
//                   <Package size={18} className="me-2" />
//                   Scanned Products ({scannedProducts.length})
//                 </h5>
//                 <button type="button" className="btn btn-sm btn-outline-danger"
//                   onClick={() => handleRemoveSelected(scannedProducts.map((p) => p.prod_uuid))}>
//                   <Trash2 size={14} className="me-1" />Remove All
//                 </button>
//               </div>
//               <div className="table-responsive">
//                 <Table columns={columns} dataSource={scannedProducts} />
//               </div>
//             </div>
//           </div>
//         )}

//         {/* Transfer Summary */}
//         {scannedProducts.length > 0 && (
//           <div className="alert alert-warning mb-3">
//             <strong>Transfer Summary</strong>
//             <ul className="mb-0 mt-2">
//               <li>Total Products: {scannedProducts.length}</li>
//               <li>Total Quantity: {totalQty} units</li>
//               {currentUser?.warehouse_name && <li>From: {currentUser.warehouse_name}</li>}
//               {formData.stock_request_id && <li>Stock Request: {formData.stock_request_id.label}</li>}
//               {effectiveTransport && (
//                 <li>Transport: {effectiveTransport.label}{!formData.transport ? " (default)" : ""}</li>
//               )}
//               <li>Status after submit: <strong>in-transit</strong></li>
//               {currentStockId && <li>Draft Stock ID: <strong>{currentStockId}</strong></li>}
//             </ul>
//             <small className="text-muted d-block mt-1">Inventory will be updated on submission.</small>
//           </div>
//         )}

//         {/* Submit / Cancel */}
//         <div className="col-lg-12">
//           <div className="btn-addproduct mb-4">
//             <Link to="/stock-transfer" className="btn btn-cancel me-2">Cancel</Link>
//             <button type="button" className="btn btn-submit" onClick={handleSubmit}
//               disabled={submitting || scannedProducts.length === 0 || !canSync}>
//               {submitting
//                 ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
//                 : <><Send size={16} className="me-1" />Create Stock Flow</>}
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Article Profile Picker Modal */}
//       <Modal show={profileModal.open}
//         onHide={() => { setProfileModal({ open: false, profiles: [], partial_code: "" }); barcodeRef.current?.focus(); }}
//         centered size="sm">
//         <Modal.Header>
//           <Modal.Title style={{ fontSize: "1rem" }}>
//             <Package size={16} className="me-2 text-primary" />Select Article Profile
//           </Modal.Title>
//           <button className="btn-close"
//             onClick={() => { setProfileModal({ open: false, profiles: [], partial_code: "" }); barcodeRef.current?.focus(); }} />
//         </Modal.Header>
//         <Modal.Body>
//           <p className="text-muted small mb-3">
//             Barcode <strong>{profileModal.partial_code}</strong> matches multiple article profiles. Select one to add:
//           </p>
//           <div className="d-flex flex-column gap-2">
//             {profileModal.profiles.map((profile) => (
//               <button key={profile.article_profile_id} type="button"
//                 className="btn btn-outline-primary text-start w-100"
//                 style={{ padding: "10px 14px" }}
//                 onClick={async () => {
//                   const code = profileModal.partial_code;
//                   setProfileModal({ open: false, profiles: [], partial_code: "" });
//                   await doScanAndAdd(code, profile.product_id);
//                 }}>
//                 <span className="d-block fw-semibold" style={{ fontSize: "0.875rem" }}>
//                   {profile.article_profile_name}
//                 </span>
//                 <span className="text-muted" style={{ fontSize: "0.75rem" }}>
//                   ID: {profile.article_profile_id}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default AddStockFlow;









import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate,useLocation} from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  ArrowLeft, ChevronUp, Camera, Plus, Package, Send,
  Trash2, Upload, RefreshCw, AlertTriangle, File, X, Lock,
} from "feather-icons-react/build/IconComponents";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import { scanProduct } from "../../core/redux/slices/productSlice";
import {
  fetchStockRequestDropdown,
  // selectFlowSourceRequest,
  selectReqDropdown,
  selectReqDropdownLoading,
  // clearFlowSourceRequest,
  removeDropdownEntry
} from "../../core/redux/slices/stockSlice";
import AuthService from "../../services/authService";
import Table from "../../core/pagination/datatable";
import { Modal } from "react-bootstrap";




const MySwal = withReactContent(Swal);

const toast = (icon, title, text, timer = 2000) =>
  MySwal.fire({ icon, title, text, timer, showConfirmButton: false, toast: true, position: "top-end" });

const STATUS_BADGE = {
  good:          "badge-success",
  faulty:        "badge-info",
  "broke/burnt": "badge-danger",
  broken:        "badge-danger",
};

const TRANSFERABLE_STATUSES = ["good", "faulty", "broke/burnt"];

const INITIAL_FORM = {
  stock_request_id: null,
  transport:        null,
  description:      "",
};

const toApiProdItem = (p) => ({
  prod_uuid:            p.prod_uuid,
  partial_code:         p.partial_code,
  article_profile_id:   p.article_profile_id,
  article_profile_name: p.article_profile_name,
  status:               p.status,
  count:                p.quantity_to_transfer || 1,
});

const toTransportOption = (v) =>
  typeof v === "object" && v !== null && v.value !== undefined ? v : {
    value: String(v),
    label: String(v).split("_").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" "),
  };

// =============================================================================
const AddStockFlow = () => {
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const headerToggle = useSelector((s) => s.toggle_header);
  const currentUser  = useSelector((s) => s.user?.currentUser);

  // const flowSourceRequest  = useSelector(selectFlowSourceRequest);
  const reqDropdownRaw     = useSelector(selectReqDropdown);
  const reqDropdownLoading = useSelector(selectReqDropdownLoading);

  const [profileModal, setProfileModal] = useState({ open: false, profiles: [], partial_code: "" });

 
  const stockRequestOptions = useMemo(
    () => reqDropdownRaw.map((r) => ({
      value:      r.stock_req_id,
      label:      `#${r.stock_req_id}`,
      req_status: r.req_status, 
    })),
    [reqDropdownRaw],
  );

  const [lockedRequest, setLockedRequest] = useState(null);
  const isRequestLocked = !!lockedRequest;

  const [transportOptions, setTransportOptions] = useState([]);
  const [formData, setFormData]                 = useState(INITIAL_FORM);
  const setField = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  const [scannedProducts, setScannedProducts] = useState([]);
  const scannedProductsRef                    = useRef([]);

  const [currentStockId, setCurrentStockId] = useState(null);
  const currentStockIdRef                   = useRef(null);
  const setStockId = (id) => { currentStockIdRef.current = id; setCurrentStockId(id); };

  const [syncInfo, setSyncInfo] = useState(null);

  const [loadingDraft,  setLoadingDraft]  = useState(true);
  const [isScanning,    setIsScanning]    = useState(false);
  const [isSyncing,     setIsSyncing]     = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [productErrors, setProductErrors] = useState([]);

  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeRef = useRef(null);
//eslint-disable-next-line
  const [billFile,    setBillFile]    = useState(null);
  const [billPreview, setBillPreview] = useState(null);
  const billFileRef   = useRef(null);
  const billFileState = useRef(null);
  // const hasSubmittedRef = useRef(false);
  const hasInitializedRef = useRef(false);
const hasSubmittedRef = useRef(false);


  const location = useLocation();

const fromStockRequest = location.state?.fromStockRequest;
const preselected = location.state?.request;


  const totalQty = useMemo(
    () => scannedProducts.reduce((s, p) => s + (parseInt(p.quantity_to_transfer) || 0), 0),
    [scannedProducts],
  );

  const canSync            = !!(formData.stock_request_id && (formData.transport || transportOptions[0]));
  const effectiveTransport = formData.transport || transportOptions[0] || null;

  const restoringDraftRef = useRef(false);


  // useEffect(() => {
  //   const preselected = flowSourceRequest; 

  //   (async () => {
    
  //     const [, dropdownAction] = await Promise.all([
  //       loadTransportOptions(),
  //       dispatch(fetchStockRequestDropdown()),
  //     ]);

     
  //     const dropdownData = dropdownAction?.payload || [];

  //     if (preselected) {
      
  //       setLockedRequest({ value: preselected.value, label: preselected.label });
  //       setField("stock_request_id", { value: preselected.value, label: preselected.label });
  //       await restoreDraft(preselected.value);
  //     } else {
     
  //       await restoreAnyDraft(dropdownData);
  //     }
  //   })();

  //   return () => { dispatch(clearFlowSourceRequest()); };
  //   // eslint-disable-next-line
  // }, []);

//   useEffect(() => {
//   (async () => {
//     await Promise.all([
//       loadTransportOptions(),
//       dispatch(fetchStockRequestDropdown()),
//     ]);

//     if (fromStockRequest && preselected) {
//       setLockedRequest(preselected);
//       setField("stock_request_id", preselected);
//       await restoreDraft(preselected.value);
//     } else {
//       setLockedRequest(null);
//       setField("stock_request_id", null);
//       await restoreAnyDraft();
//     }

//     setLoadingDraft(false);
//   })();
// }, []);


// useEffect(() => {
//   (async () => {
//     await Promise.all([
//       loadTransportOptions(),
//       dispatch(fetchStockRequestDropdown()),
//     ]);

//     if (preselected?.value) {

//       // set UI selection
//       setLockedRequest(fromStockRequest ? preselected : null);
//       setField("stock_request_id", preselected);

//       // ALWAYS try to load approved stock first
//       const res = await AuthService.get_approved_stock_flow(preselected.value);
//       const data = res.data;

//       if (data?.is_found && data?.data) {
//         applyDraftToState(data.data, data.message);
//       } else {
//         // fallback if no draft exists
//         await restoreAnyDraft();
//       }

//     } else {
//       // normal entry (no request selected)
//       setLockedRequest(null);
//       setField("stock_request_id", null);

//       await restoreAnyDraft();
//     }

//     setLoadingDraft(false);
//   })();
// }, []);
 
useEffect(() => {
  if (hasInitializedRef.current) return;

  const init = async () => {
    setLoadingDraft(true);

    try {
      await Promise.all([
        loadTransportOptions(),
        dispatch(fetchStockRequestDropdown()),
      ]);

      // 🚫 Do NOT restore after submit
      if (hasSubmittedRef.current) return;

      let requestToUse = null;

      // ✅ Priority 1: navigation state (ONLY once)
      if (fromStockRequest && preselected?.value) {
        requestToUse = preselected;

        // 🔥 clear navigation state after using
        window.history.replaceState({}, document.title);
      }

      // ✅ Priority 2: localStorage
      else {
        const saved = localStorage.getItem("selected_stock_request");
        if (saved) requestToUse = JSON.parse(saved);
      }

      if (requestToUse?.value) {
        resetDraftState();

        setField("stock_request_id", requestToUse);

        // ✅ lock ONLY if from navigation
        setLockedRequest(fromStockRequest ? requestToUse : null);

        await restoreDraftByRequestId(requestToUse.value);
      } else {
        resetDraftState();
        setLockedRequest(null);
        setField("stock_request_id", null);
      }

    } catch (err) {
      console.error("Init error:", err);
    } finally {
      setLoadingDraft(false);
      hasInitializedRef.current = true;
    }
  };

  init();
}, []);

  useEffect(() => {
    if (restoringDraftRef.current) return;
    if (scannedProductsRef.current.length > 0 && canSync) {
      syncToDb(scannedProductsRef.current, formData);
    }
    // eslint-disable-next-line
  }, [formData.stock_request_id, formData.transport]);

  const setScanned = (val) => {
    setScannedProducts((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      scannedProductsRef.current = next;
      return next;
    });
  };

 
  const applyDraftToState = (lot, message = null) => {
    setStockId(lot.stock_id);

    if (lot.description) {
      setFormData((prev) => ({ ...prev, description: lot.description }));
    }

    setSyncInfo({
      stock_id:              lot.stock_id,
      stock_req_id:          lot.request_id,
      supplier_name:         lot.supplier_name,
      source_name:           lot.source_name,
      destination_name:      lot.destination_name,
      recipient_name:        lot.recipient_name,
      transportation:        lot.transportation,
      description:           lot.description,
      invoice_original_name: lot.invoice_original_name,
    });

    if (lot.transportation) {
      setField("transport", toTransportOption(lot.transportation));
    }

    if (lot.prod_arr?.length) {
      const restored = lot.prod_arr.filter(Boolean).map((p) => ({
        prod_uuid:            p.prod_uuid,
        partial_code:         p.partial_code,
        article_profile_id:   p.article_profile_id || "",
        article_profile_name: p.article_profile_name || "—",
        warehouse_name:       p.warehouse_name || "—",
        count:                p.available ?? p.count ?? 0,
        status:               p.status,
        quantity_to_transfer: p.count || 1,
      }));
      setScanned(restored);

      MySwal.fire({
        icon: "info",
        title: message.title || "Draft Restored",
        text: message?.message || `Restored ${lot.prod_arr?.length || 0} products`,
        html: `
          <p><strong>${restored.length}</strong> product(s) from your previous session.</p>
          <small class="text-muted">
            Stock ID: ${lot.stock_id} · Request: ${lot.request_id}
          </small>
        `,
        timer: 3500,
        showConfirmButton: false,
      });
    }
  };



const restoreDraftByRequestId = async (requestId) => {
  if (!requestId) return;

  try {
    const res = await AuthService.get_approved_stock_flow(requestId);
    const body = res.data;

    resetDraftState(); // 🔥 ensure clean slate before applying

    if (body?.is_found && body?.data) {
      applyDraftToState(body.data, body.message);
    } else {
      // optional: show message from API
      toast("info", "No Draft Found", body?.message || "No saved draft for this request.");
    }
  } catch (err) {
    console.warn(err);
    resetDraftState();
  }
};





  // const restoreAnyDraft = async (dropdownData) => {
  //   setLoadingDraft(true);
  //   restoringDraftRef.current = true;

  //   try {
  //     const draftedEntry = dropdownData.find((r) => r.req_status === "Drafted");

  //     if (!draftedEntry) {
  //       return;
  //     }

  //     const reqId     = draftedEntry.stock_req_id;
  //     const reqOption = { value: reqId, label: `#${reqId}` };
  //     setLockedRequest(reqOption);
  //     setField("stock_request_id", reqOption);

  //     const res  = await AuthService.get_approved_stock_flow(reqId);
  //     const body = res.data;

  //     if (!body.is_found || !body.data || Object.keys(body.data).length === 0) {
  //       return;
  //     }

  //     applyDraftToState(body.data);
  //   } catch (err) {
    
  //     console.warn("restoreAnyDraft:", err.response?.status, err.message);
  //   } finally {
  //     setLoadingDraft(false);
  //     setTimeout(() => { restoringDraftRef.current = false; }, 0);
  //   }
  // };



  // const restoreDraft = async (requestId) => {
  //   if (!requestId) {
  //     setLoadingDraft(false);
  //     return;
  //   }

  //   setLoadingDraft(true);
  //   restoringDraftRef.current = true;

  //   try {
  //     const res  = await AuthService.getApprovedStock(requestId);
  //     const body = res.data;

  //     if (!body.is_found || !body.data || Object.keys(body.data).length === 0) {
      
  //       return;
  //     }

  //     applyDraftToState(body.data);
  //   } catch (err) {
      
  //     if (err.response?.status === 409) {
  //       MySwal.fire({
  //         icon: "warning",
  //         title: "Already In-Transit",
  //         text: err.response.data?.message || "This stock flow has already been submitted.",
  //         timer: 4000,
  //         showConfirmButton: false,
  //       });
  //     } else {
  //       console.warn("restoreDraft:", err.response?.status, err.message);
  //     }
  //   } finally {
  //     setLoadingDraft(false);
  //     setTimeout(() => { restoringDraftRef.current = false; }, 0);
  //   }
  // };

  // ── Transport options ──────────────────────────────────────────────────────
  
  
  
  
  const loadTransportOptions = async () => {
    try {
      const res     = await AuthService.getStockFlowOptions();
      const options = res.data?.data;
      if (!options) { toast("error", "Options Error", "Failed to load transport options.", 5000); return; }
      setTransportOptions((options.transport || []).map(toTransportOption));
    } catch (e) {
      toast("error", "Options Error", `Could not load transport options: ${e.message}`, 5000);
    }
  };

  // ── syncToDb ───────────────────────────────────────────────────────────────
  const syncToDb = useCallback(async (products, fd) => {
    if (!fd.stock_request_id) return;
    if (!products.length)     return;

    const transport = fd.transport || transportOptions[0] || null;
    if (!transport) { console.warn("syncToDb: no transport — skipping."); return; }

    setIsSyncing(true);
    try {
      const payload = new FormData();
      payload.append("request_id",     fd.stock_request_id.value);
      payload.append("transportation", transport.value);
      payload.append("prod_arr",       JSON.stringify(products.map(toApiProdItem)));
      if (fd.description) payload.append("description", fd.description);
      if (billFileState.current) payload.append("stock_transfer_invoice", billFileState.current);

      const res  = await AuthService.stockFlowSync(payload);
      const body = res.data;

      if (body?.data?.stock_id) {
        setSyncInfo({
          stock_id:         body.data.stock_id,
          stock_req_id:     body.data.stock_req_id ?? fd.stock_request_id?.value,
          supplier_name:    body.data.supplier_name,
          source_name:      body.data.source_name,
          destination_name: body.data.destination_name,
          recipient_name:   body.data.recipient_name,
        });
        setStockId(body.data.stock_id);
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to sync draft";
      toast("error", "Sync Error", msg, 3000);
      console.error("syncToDb error:", err.response?.data || err);
    } finally {
      setIsSyncing(false);
    }
    // eslint-disable-next-line
  }, [transportOptions]);

  // ── doScanAndAdd ──────────────────────────────────────────────────────────
  const doScanAndAdd = useCallback(async (code, product_id = null, prefetchedProduct = null) => {
    setIsScanning(true);
    try {
      let product;
      if (prefetchedProduct) {
        product = prefetchedProduct;
      } else {
        const result = await dispatch(scanProduct({ code, product_id })).unwrap();
        product = result?.data ?? result;
      }

      if (!product?.prod_uuid) throw new Error("Product not found");

      if (currentUser?.warehouse_id && product.warehouse_id !== currentUser.warehouse_id) {
        MySwal.fire({ icon: "error", title: "Wrong Warehouse",
          text: `This product belongs to "${product.warehouse_name}", not your assigned warehouse.` });
        return;
      }

      if (!TRANSFERABLE_STATUSES.includes(product.status)) {
        MySwal.fire({ icon: "error", title: "Invalid Status",
          text: `"${product.partial_code || code}" has status "${product.status}". ` +
                `Only ${TRANSFERABLE_STATUSES.join(", ")} can be transferred.` });
        return;
      }

      if (scannedProductsRef.current.find((p) => p.prod_uuid === product.prod_uuid)) {
        toast("warning", "Already Scanned", `Product "${product.partial_code || code}" is already in the list.`);
        setBarcodeInput(""); return;
      }

      const newProd = {
        prod_uuid:            product.prod_uuid,
        partial_code:         product.partial_code || code,
        article_profile_id:   product.article_profile_id,
        article_profile_name: product.article_profile_name || "—",
        warehouse_name:       product.warehouse_name || "—",
        count:                product.count ?? 0,
        status:               product.status,
        quantity_to_transfer: 1,
      };

      const updated = [...scannedProductsRef.current, newProd];
      setScanned(updated);
      setBarcodeInput("");

      if (canSync) {
        await syncToDb(updated, formData);
        toast("success", "Scanned & Saved", newProd.partial_code);
      } else {
        toast("info", "Scanned (Local)",
          `"${newProd.partial_code}" added. Select a Stock Request above to save draft.`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Product not found";
      MySwal.fire({ icon: "error", title: "Not Found", text: msg });
    } finally {
      setIsScanning(false);
      barcodeRef.current?.focus();
    }
    // eslint-disable-next-line
  }, [dispatch, formData, canSync, syncToDb, currentUser]);

  // ── handleScan ────────────────────────────────────────────────────────────
  const handleScan = useCallback(async (partial_code) => {
    const code = (partial_code || "").trim();
    if (!code) return;

    setIsScanning(true);
    try {
      const profileRes = await AuthService.getProfileByCode(code);
      const raw        = profileRes.data?.data;
      const isArray    = Array.isArray(raw);
      const profiles   = isArray ? raw : null;

      if (profiles && profiles.length > 1) {
        setProfileModal({ open: true, profiles, partial_code: code });
        setBarcodeInput("");
        setIsScanning(false);
        return;
      }
      if (!isArray && raw?.prod_uuid) { await doScanAndAdd(code, null, raw); return; }
      if (isArray && profiles.length === 1) { await doScanAndAdd(code, profiles[0].product_id); return; }
      await doScanAndAdd(code);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Product not found";
      MySwal.fire({ icon: "error", title: "Not Found", text: msg });
      setIsScanning(false);
    }
    // eslint-disable-next-line
  }, [formData, canSync, syncToDb, currentUser, doScanAndAdd]);

  // ── Remove single ─────────────────────────────────────────────────────────
  const handleRemoveProduct = useCallback((prod_uuid, partial_code) => {
    MySwal.fire({
      title: "Remove Product?", text: "This will remove it from your draft.",
      icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Remove",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        if (currentStockIdRef.current) {
          const res = await AuthService.removeStockProduct(partial_code);
          setScanned((prev) => prev.filter((p) => p.prod_uuid !== prod_uuid));
          if (res.data?.draft_deleted) {
            setStockId(null); setSyncInfo(null);
            toast("info", "Draft Cleared", "Last product removed. Draft deleted.");
          } else {
            toast("success", "Removed", `"${partial_code}" removed.`);
          }
        } else {
          setScanned((prev) => prev.filter((p) => p.prod_uuid !== prod_uuid));
          toast("success", "Removed", `"${partial_code}" removed.`);
        }
      } catch (err) {
        toast("error", "Error", err.response?.data?.message || "Failed to remove.", 3000);
      }
    });
  }, []);

  // ── Remove all ────────────────────────────────────────────────────────────
  const handleRemoveSelected = useCallback((selectedUuids) => {
    MySwal.fire({
      title: `Remove ${selectedUuids.length} product(s)?`, icon: "warning",
      showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Remove All",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const toRemove = scannedProducts.filter((p) => selectedUuids.includes(p.prod_uuid));
      if (currentStockIdRef.current) {
        for (const p of toRemove) {
          try { await AuthService.removeStockProduct(p.partial_code); } catch { /* continue */ }
        }
      }
      const remaining = scannedProducts.filter((p) => !selectedUuids.includes(p.prod_uuid));
      setScanned(remaining);
      if (remaining.length === 0) { setStockId(null); setSyncInfo(null); }
      toast("success", "Removed", `${toRemove.length} product(s) removed.`);
    });
  }, [scannedProducts]);

  // ── Discard draft ─────────────────────────────────────────────────────────
  const handleDiscardDraft = () => {
    MySwal.fire({
      title: "Discard entire draft?", text: "All scanned products will be removed.",
      icon: "warning", showCancelButton: true, confirmButtonColor: "#d33", confirmButtonText: "Yes, discard",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        if (currentStockIdRef.current) await AuthService.discardDraft();
        setScanned([]); setStockId(null); setSyncInfo(null);
        toast("info", "Draft Discarded", "All products cleared.");
      } catch (err) {
        toast("error", "Error", err.response?.data?.message || "Failed to discard.", 3000);
      }
    });
  };

  // ── Qty change ────────────────────────────────────────────────────────────
  const handleQtyChange = useCallback((prod_uuid, newQty) => {
    setScanned((prev) => prev.map((p) => {
      if (p.prod_uuid !== prod_uuid) return p;
      const qty = parseInt(newQty) || 0;
      if (qty > p.count) { toast("warning", "Insufficient Stock", `Only ${p.count} units available.`); return p; }
      return { ...p, quantity_to_transfer: qty };
    }));
  }, []);

  // ── Bill / Invoice ────────────────────────────────────────────────────────
  const handleBillChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast("warning", "Invalid File", "PDF, JPG, or PNG only."); return;
    }
    if (file.size > 5 * 1024 * 1024) { toast("warning", "Too Large", "Max 5 MB."); return; }
    setBillFile(file);
    billFileState.current = file;
    setBillPreview({ name: file.name, size: (file.size / 1024).toFixed(2) + " KB" });
  };

  const handleRemoveBill = () => {
    setBillFile(null);
    billFileState.current = null;
    setBillPreview(null);
    if (billFileRef.current) billFileRef.current.value = "";
  };


const resetDraftState = () => {
  setScanned([]);
  setStockId(null);
  setSyncInfo(null);
  setProductErrors([]);
  setBillFile(null);
  setBillPreview(null);

  scannedProductsRef.current = [];
  billFileState.current = null;
  currentStockIdRef.current = null;
};

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProductErrors([]);

    if (!scannedProducts.length)         { toast("warning", "No Products", "Scan at least one product."); return; }
    if (!formData.stock_request_id)      { toast("warning", "Missing", "Stock Request is required."); return; }
    if (!effectiveTransport)             { toast("warning", "Missing", "No transport options available yet."); return; }
    if (scannedProducts.some((p) => p.quantity_to_transfer <= 0)) {
      toast("warning", "Invalid Qty", "All quantities must be greater than 0."); return;
    }

    await syncToDb(scannedProducts, formData);

    setSubmitting(true);
    try {
      // const res  = await AuthService.stockFlowSubmit();
      
      const res = await AuthService.stockFlowSubmit({
        stock_id: currentStockIdRef.current
      });
      const body = res.data;
      
     if (!body.success) {

 
  if (body.message === "Stock already submitted") {
    MySwal.fire({
      icon: "info",
      title: "Already Submitted",
      text: body.message,
      confirmButtonText: "View Stock Flows",
    }).then(() => navigate("/stock-transfer"));
    return;
  }

  const errProds = body.data || [];

  if (errProds.length) {
    setProductErrors(errProds.map((ep) => {
      const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
      return {
        prod_uuid: ep.prod_uuid,
        partial_code: local?.partial_code || ep.prod_uuid,
        errors: [`Count ${ep.count}, status "${ep.status}" — inventory mismatch`],
      };
    }));

    MySwal.fire({
      icon: "error",
      title: "Submission Failed",
      text: body.message,
    });
    return;
  }

  throw new Error(body.message || "Submission failed.");
}

     MySwal.fire({
  icon: "success",
  title: body.message || "Stock Flow Created!",
  html: `
    <p><strong>Stock ID:</strong> ${currentStockIdRef.current || "—"}</p>
    <p><strong>Products:</strong> ${scannedProducts.length}</p>
    <p><strong>Total Quantity:</strong> ${totalQty}</p>
    ${formData.stock_request_id ? `<p><strong>Request:</strong> ${formData.stock_request_id.label}</p>` : ""}
  `,
  confirmButtonText: "OK",
}).then(async () => {
  hasSubmittedRef.current = true;

  const submittedReqId = formData.stock_request_id?.value;
  if (submittedReqId) {
    dispatch(removeDropdownEntry(submittedReqId));
  }

  resetDraftState();
  setLockedRequest(null);
  setField("stock_request_id", null);
  localStorage.removeItem("selected_stock_request");
  navigate("/stock-transfer", { replace: true });
  dispatch(fetchStockRequestDropdown());
});
    } catch (err) {
      const msg      = err.response?.data?.message || err.message || "Failed to create stock flow.";
      const errProds = err.response?.data?.data || [];
      if (errProds.length) {
        setProductErrors(errProds.map((ep) => {
          const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
          return { prod_uuid: ep.prod_uuid, partial_code: local?.partial_code || ep.prod_uuid,
            errors: [`Count ${ep.count}, status "${ep.status}" — inventory mismatch`] };
        }));
      }
      MySwal.fire({ icon: "error", title: "Error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const columns = useMemo(() => {
    const errorMap = Object.fromEntries(productErrors.map((e) => [e.prod_uuid, e.errors]));
    return [
      { title: "#", render: (_, __, i) => i + 1, width: "50px" },
      {
        title: "Barcode / Code", dataIndex: "partial_code",
        render: (text, record) => (
          <span>
            <span className="badge badge-primary">{text}</span>
            {errorMap[record.prod_uuid] && (
              <div className="mt-1">
                {errorMap[record.prod_uuid].map((err, i) => (
                  <div key={i} className="text-danger small">
                    <AlertTriangle size={12} className="me-1" />{err}
                  </div>
                ))}
              </div>
            )}
          </span>
        ),
      },
      { title: "Article Profile", dataIndex: "article_profile_name" },
      // { title: "Warehouse",       dataIndex: "warehouse_name" },
      {
        title: "Status", dataIndex: "status",
        render: (t) => (
          <span className={`badge ${STATUS_BADGE[t] || "badge-info"}`}>{t?.toUpperCase() || "N/A"}</span>
        ),
      },
      { title: "Available", dataIndex: "count",
        render: (t) => <span className="badge badge-info">{t}</span> },
      {
        title: "Transfer Qty", dataIndex: "quantity_to_transfer",
        render: (text, record) => (
          <input type="number" className="form-control form-control-sm" style={{ width: "80px" }}
            value={text} min="1" max={record.count}
            onChange={(e) => handleQtyChange(record.prod_uuid, e.target.value)} />
        ),
      },
      {
        title: "Action", width: "80px",
        render: (_, record) => (
          <button type="button" className="btn btn-sm btn-danger"
            onClick={() => handleRemoveProduct(record.prod_uuid, record.partial_code)} title="Remove">
            <Trash2 size={14} />
          </button>
        ),
      },
    ];
  }, [productErrors, handleQtyChange, handleRemoveProduct]);

  // ── Stock Request dropdown option renderer — shows "Drafted" badge ────────
  const formatRequestOption = (option) => (
    <div className="d-flex align-items-center justify-content-between">
      <span>{option.label}</span>
      {option.req_status === "Drafted" && (
        <span className="badge badge-warning ms-2" style={{ fontSize: "0.7rem" }}>Draft</span>
      )}
      {option.req_status === "Approved" && (
        <span className="badge badge-success ms-2" style={{ fontSize: "0.7rem" }}>New</span>
      )}
    </div>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="page-wrapper">
      <div className="content">

        {/* Page Header */}
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Create Stock Flow</h4>
              <h6>Scan or import products to create a stock transfer</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <li>
              <Link to="/stock-transfer" className="btn btn-secondary btn-sm">
                <ArrowLeft size={16} className="me-1" />Back
              </Link>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={<Tooltip>Collapse</Tooltip>}>
                <Link id="collapse-header" className={headerToggle ? "active" : ""}
                  onClick={() => dispatch(setToogleHeader(!headerToggle))}>
                  <ChevronUp className="feather-chevron-up" />
                </Link>
              </OverlayTrigger>
            </li>
          </ul>
        </div>

        {/* Draft loading */}
        {loadingDraft && (
          <div className="alert alert-light d-flex align-items-center mb-3">
            <span className="spinner-border spinner-border-sm me-2" />
            Checking for saved draft…
          </div>
        )}

        {/* Active Draft Banner */}
        {!loadingDraft && syncInfo && (
          <div className="alert alert-warning d-flex flex-column mb-3">
            <div className="d-flex align-items-center mb-2">
              <RefreshCw size={16} className="me-2" />
              <strong>Active Draft:</strong>
              <span className="ms-2 badge badge-warning">{syncInfo.stock_id}</span>
              {isSyncing && <span className="spinner-border spinner-border-sm ms-2 text-muted" />}
            </div>
            <div className="small">
              {syncInfo.stock_req_id     && <div><b>Request:</b>  {syncInfo.stock_req_id}</div>}
              {syncInfo.source_name      && <div><b>From:</b>     {syncInfo.source_name}</div>}
              {syncInfo.destination_name && <div><b>To:</b>       {syncInfo.destination_name}</div>}
              {syncInfo.supplier_name    && <div><b>Supplier:</b> {syncInfo.supplier_name}</div>}
              {syncInfo.recipient_name   && <div><b>Recipient:</b>{syncInfo.recipient_name}</div>}
            </div>
            {scannedProducts.length > 0 && (
              <button type="button"
                className="btn btn-sm btn-outline-danger mt-2 align-self-start"
                onClick={handleDiscardDraft}>
                <Trash2 size={14} className="me-1" />Discard Draft
              </button>
            )}
          </div>
        )}

        {/* Product errors */}
        {productErrors.length > 0 && (
          <div className="alert alert-danger mb-3">
            <h6 className="mb-2">
              <AlertTriangle size={16} className="me-2" />
              {productErrors.length} product(s) failed validation — correct them and resubmit.
            </h6>
            <ul className="mb-0">
              {productErrors.map((e, i) => (
                <li key={i}><strong>{e.partial_code}</strong>: {e.errors.join("; ")}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Stock Flow Details card */}
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="mb-4">Stock Flow Details</h5>

            {currentUser?.warehouse_name && (
              <div className="row mb-3">
                <div className="col-lg-6">
                  <label className="form-label">From Warehouse</label>
                  <input type="text" className="form-control bg-light"
                    value={currentUser.warehouse_name} readOnly disabled />
                  <small className="text-muted">Your assigned warehouse (set by your account)</small>
                </div>
              </div>
            )}

            <div className="row mb-3">
              {/* Stock Request */}
              <div className="col-lg-6">
                <label className="form-label">
                  Stock Request <span className="text-danger">*</span>
                  {isRequestLocked && (
                    <Lock size={13} className="ms-1 text-warning"
                      title="Pre-selected — click Change to pick a different one" />
                  )}
                </label>
                {isRequestLocked ? (
                  <>
                    <div className="d-flex align-items-center gap-2">
                      <input type="text" className="form-control bg-light"
                        value={formData.stock_request_id?.label || lockedRequest?.label || ""} readOnly disabled />
                      <button type="button" className="btn btn-sm btn-outline-secondary text-nowrap"
                        onClick={() => {
                          setLockedRequest(null);
                          setField("stock_request_id", null);
                        }}>
                        <X size={13} className="me-1" />Change
                      </button>
                    </div>
                    <small className="text-muted">
                      {syncInfo
                        ? "Draft restored from previous session. Click \"Change\" to pick a different request."
                        : "Pre-selected from the Stock Requests page. Click \"Change\" to pick a different one."}
                    </small>
                  </>
                ) : (
                  <>
                    <Select
                      options={stockRequestOptions}
                      value={formData.stock_request_id}
                      // onChange={async (opt) => {
                      //   setField("stock_request_id", opt);
                      //   if (opt) {
                         
                      //     restoringDraftRef.current = true;
                      //     try {
                      //       const res  = await AuthService.get_approved_stock_flow(opt.value);
                      //       const body = res.data;
                      //       if (body.is_found && body.data && Object.keys(body.data).length > 0) {
                      //         applyDraftToState(body.data);
                      //       }
                      //     } catch (err) {
                      //       console.warn("onChange restoreDraft:", err.response?.status, err.message);
                      //     } finally {
                      //       setTimeout(() => { restoringDraftRef.current = false; }, 0);
                      //     }
                      //   } else {
                      
                      //     setScanned([]); setStockId(null); setSyncInfo(null);
                      //   }
                      // }}

//                       onChange={(opt) => {
//   setField("stock_request_id", opt);
//   restoreDraftByRequestId(opt.value);
// }}

onChange={(opt) => {
  resetDraftState();

  setField("stock_request_id", opt);
  setLockedRequest(null); 

  if (opt) {
    localStorage.setItem("selected_stock_request", JSON.stringify(opt));
    restoreDraftByRequestId(opt.value);
  } else {
    localStorage.removeItem("selected_stock_request");
  }
}}
                      formatOptionLabel={formatRequestOption}
                      placeholder={reqDropdownLoading ? "Loading requests…" : "Select a stock request"}
                      isClearable isLoading={reqDropdownLoading}
                      noOptionsMessage={() => reqDropdownLoading ? "Loading…" : "No approved requests found"} />
                    <small className="text-muted">
                      Showing approved requests assigned to you — <span className="badge badge-warning" style={{fontSize:"0.65rem"}}>Draft</span> = has saved products
                    </small>
                  </>
                )}
              </div>

              {/* Transport */}
              <div className="col-lg-6">
                <label className="form-label">
                  Transport <span className="text-danger">*</span>
                  {transportOptions.length === 0 && <span className="spinner-border spinner-border-sm ms-2" />}
                </label>
                <Select options={transportOptions} value={formData.transport}
                  onChange={(opt) => setField("transport", opt)}
                  placeholder={transportOptions.length === 0 ? "Loading…" : "Select transport method"}
                  isLoading={transportOptions.length === 0} />
                {transportOptions.length > 0 && !formData.transport && (
                  <small className="text-muted">
                    Defaults to <strong>{transportOptions[0]?.label}</strong> if not selected
                  </small>
                )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-lg-6">
                <label className="form-label">Description</label>
                <textarea className="form-control" value={formData.description || ""}
                  onChange={(e) => setField("description", e.target.value)}
                  rows="2" placeholder="Notes about this transfer…" />
              </div>
              <div className="col-lg-6">
                <label className="form-label">Total Quantity</label>
                <input type="number" className="form-control bg-light" value={totalQty}
                  readOnly disabled style={{ fontWeight: "bold", fontSize: "1.1rem" }} />
                <small className="text-muted">Auto-calculated from scanned products</small>
              </div>
            </div>

            {/* Bill / Invoice */}
            <div className="row">
              <div className="col-lg-6">
                <label className="form-label">
                  <File size={16} className="me-1" />Bill / Invoice (Optional)
                </label>
                {!billPreview && syncInfo?.invoice_original_name && (
                  <div className="alert alert-info py-2 px-3 mb-2 d-flex align-items-center">
                    <File size={14} className="me-2 flex-shrink-0" />
                    <small>
                      Existing invoice: <strong>{syncInfo.invoice_original_name}</strong>
                      <span className="ms-1 text-muted">(upload a new file to replace)</span>
                    </small>
                  </div>
                )}
                {!billPreview ? (
                  <div className="border border-dashed rounded p-3 text-center">
                    <input ref={billFileRef} type="file" id="billFileInput" className="d-none"
                      accept=".pdf,.jpg,.jpeg,.png" onChange={handleBillChange} />
                    <label htmlFor="billFileInput" className="mb-0" style={{ cursor: "pointer" }}>
                      <Upload size={40} className="text-muted mb-2 d-block mx-auto" />
                      <span className="text-muted">Click to upload — PDF, JPG, PNG max 5 MB</span>
                    </label>
                  </div>
                ) : (
                  <div className="border rounded p-3 d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center">
                      <File size={28} className="text-primary me-3" />
                      <div>
                        <p className="mb-0 fw-semibold">{billPreview.name}</p>
                        <small className="text-muted">{billPreview.size}</small>
                      </div>
                    </div>
                    <button type="button" className="btn btn-sm btn-danger" onClick={handleRemoveBill}>
                      <X size={14} />
                    </button>
                  </div>
                )}
                {billPreview && (
                  <small className="text-success d-block mt-1">
                    ✓ Will be uploaded on next scan or submit.
                  </small>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Scan Barcode card */}
        <div className="card mb-3">
          <div className="card-body">
            <div className="d-flex align-items-center mb-3">
              <Camera size={22} className="text-primary me-2" />
              <h5 className="mb-0">Scan Barcode</h5>
              <span className="badge badge-success ms-2" style={{ fontSize: "0.7rem" }}>Always Active</span>
            </div>

            {!canSync ? (
              <div className="alert alert-info d-flex align-items-center mb-3">
                <span className="me-2 flex-shrink-0">ℹ</span>
                <div>
                  <strong>Scanning is available now.</strong> Products will be held locally.
                  <span className="d-block mt-1 text-muted small">
                    Select a <strong>Stock Request</strong> above to auto-save each scan to draft.
                  </span>
                </div>
              </div>
            ) : (
              <div className="alert alert-success d-flex align-items-center mb-3">
                <span className="me-2 flex-shrink-0">✓</span>
                <div>
                  <strong>Ready to scan &amp; auto-save!</strong> Each scan is saved to draft.
                  <div className="mt-1">
                    Request: <strong>{formData.stock_request_id?.label}</strong>
                    {!formData.transport && effectiveTransport && (
                      <span className="ms-2 badge badge-secondary" style={{ fontSize: "0.75rem" }}>
                        Transport: {effectiveTransport.label} (default)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="row align-items-end">
              <div className="col-lg-8">
                <label className="form-label">
                  Scan or Enter Barcode
                  {(isScanning || isSyncing) && <span className="spinner-border spinner-border-sm ms-2" />}
                </label>
                <input ref={barcodeRef} type="text" className="form-control"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleScan(barcodeInput); } }}
                  placeholder="Use scanner or type barcode then press Enter"
                  disabled={isScanning} autoFocus />
              </div>
              <div className="col-lg-4">
                <button type="button" className="btn btn-primary w-100"
                  onClick={() => handleScan(barcodeInput)}
                  disabled={!barcodeInput.trim() || isScanning}>
                  {isScanning
                    ? <><span className="spinner-border spinner-border-sm me-2" />Scanning…</>
                    : <><Plus size={16} className="me-1" />Add Product</>}
                </button>
              </div>
            </div>

            {scannedProducts.length > 0 && (
              <div className="alert alert-success d-flex align-items-center mt-3 mb-0">
                <Package size={18} className="me-2" />
                <strong>
                  {scannedProducts.length} product(s) &nbsp;|&nbsp; Total Qty: {totalQty}
                  {isSyncing && <span className="ms-2 text-muted small">saving…</span>}
                  {!canSync && (
                    <span className="ms-2 text-warning small">
                      ⚠ Unsaved — select a Stock Request to persist
                    </span>
                  )}
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* Scanned Products Table */}
        {scannedProducts.length > 0 && (
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">
                  <Package size={18} className="me-2" />
                  Scanned Products ({scannedProducts.length})
                </h5>
                <button type="button" className="btn btn-sm btn-outline-danger"
                  onClick={() => handleRemoveSelected(scannedProducts.map((p) => p.prod_uuid))}>
                  <Trash2 size={14} className="me-1" />Remove All
                </button>
              </div>
              <div className="table-responsive">
                <Table columns={columns} dataSource={scannedProducts} />
              </div>
            </div>
          </div>
        )}

        {/* Transfer Summary */}
        {scannedProducts.length > 0 && (
          <div className="alert alert-warning mb-3">
            <strong>Transfer Summary</strong>
            <ul className="mb-0 mt-2">
              <li>Total Products: {scannedProducts.length}</li>
              <li>Total Quantity: {totalQty} units</li>
              {currentUser?.warehouse_name && <li>From: {currentUser.warehouse_name}</li>}
              {formData.stock_request_id && <li>Stock Request: {formData.stock_request_id.label}</li>}
              {effectiveTransport && (
                <li>Transport: {effectiveTransport.label}{!formData.transport ? " (default)" : ""}</li>
              )}
              <li>Status after submit: <strong>in-transit</strong></li>
              {currentStockId && <li>Draft Stock ID: <strong>{currentStockId}</strong></li>}
            </ul>
            <small className="text-muted d-block mt-1">Inventory will be updated on submission.</small>
          </div>
        )}

        {/* Submit / Cancel */}
        <div className="col-lg-12">
          <div className="btn-addproduct mb-4">
            <Link to="/stock-transfer" className="btn btn-cancel me-2">Cancel</Link>
            <button type="button" className="btn btn-submit" onClick={handleSubmit}
              disabled={submitting || scannedProducts.length === 0 || !canSync}>
              {submitting
                ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
                : <><Send size={16} className="me-1" />Create Stock Flow</>}
            </button>
          </div>
        </div>
      </div>

      {/* Article Profile Picker Modal */}
      <Modal show={profileModal.open}
        onHide={() => { setProfileModal({ open: false, profiles: [], partial_code: "" }); barcodeRef.current?.focus(); }}
        centered size="sm">
        <Modal.Header>
          <Modal.Title style={{ fontSize: "1rem" }}>
            <Package size={16} className="me-2 text-primary" />Select Article Profile
          </Modal.Title>
          <button className="btn-close"
            onClick={() => { setProfileModal({ open: false, profiles: [], partial_code: "" }); barcodeRef.current?.focus(); }} />
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Barcode <strong>{profileModal.partial_code}</strong> matches multiple article profiles. Select one to add:
          </p>
          <div className="d-flex flex-column gap-2">
            {profileModal.profiles.map((profile) => (
              <button key={profile.article_profile_id} type="button"
                className="btn btn-outline-primary text-start w-100"
                style={{ padding: "10px 14px" }}
                onClick={async () => {
                  const code = profileModal.partial_code;
                  setProfileModal({ open: false, profiles: [], partial_code: "" });
                  await doScanAndAdd(code, profile.product_id);
                }}>
                <span className="d-block fw-semibold" style={{ fontSize: "0.875rem" }}>
                  {profile.article_profile_name}
                </span>
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                  ID: {profile.article_profile_id}
                </span>
              </button>
            ))}
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default AddStockFlow;