
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
//                   Need a template?{" "}
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




import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import {
  ArrowLeft, ChevronUp, Camera, Plus, Package, Send,
  Trash2, Upload, RefreshCw, AlertTriangle, File, X,
} from "feather-icons-react/build/IconComponents";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import { scanProduct } from "../../core/redux/slices/productSlice";
import AuthService from "../../services/authService";
import Table from "../../core/pagination/datatable";

const MySwal = withReactContent(Swal);

const toast = (icon, title, text, timer = 2000) =>
  MySwal.fire({ icon, title, text, timer, showConfirmButton: false, toast: true, position: "top-end" });

const STATUS_BADGE = {
  good:    "badge-success",
  faulty:  "badge-info",
  broken:  "badge-danger",
};

const TRANSFERABLE_STATUSES = ["good", "faulty", "broke/burnt"];

const INITIAL_FORM = {
  to_warehouse: null,
  transport:    null,
  description:  "",
};

// ── toApiProdItem ─────────────────────────────────────────────────────────────
const toApiProdItem = (p) => ({
  prod_uuid:            p.prod_uuid,
  partial_code:         p.partial_code,
  article_profile_id:   p.article_profile_id,
  article_profile_name: p.article_profile_name,
  status:               p.status,
  count:                p.quantity_to_transfer || 1,
});

// =============================================================================
const AddStockFlow = () => {
  const dispatch     = useDispatch();
  const navigate     = useNavigate();
  const headerToggle = useSelector((s) => s.toggle_header);
  const currentUser  = useSelector((s) => s.user?.currentUser);

  const [transportOptions, setTransportOptions] = useState([]);
  const [allWarehouses,    setAllWarehouses]    = useState([]);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const setField = (key, val) => setFormData((p) => ({ ...p, [key]: val }));

  const [scannedProducts, setScannedProducts] = useState([]);
  const scannedProductsRef                    = useRef([]);

  const [currentStockId, setCurrentStockId] = useState(null);

  const [loadingDraft,  setLoadingDraft]  = useState(true);
  const [isScanning,    setIsScanning]    = useState(false);
  const [isSyncing,     setIsSyncing]     = useState(false);
  const [submitting,    setSubmitting]    = useState(false);
  const [productErrors, setProductErrors] = useState([]);

  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeRef  = useRef(null);
  const scanBuffer  = useRef("");
  const lastKeyTime = useRef(0);

  const [excelFile,      setExcelFile]      = useState(null);
  const [importingExcel, setImportingExcel] = useState(false);
  const excelInputRef = useRef(null);

  // ── Bill / invoice file (restored) ───────────────────────────────────────
  const [billPreview, setBillPreview] = useState(null);
  const billFileRef = useRef(null);

  // ── Derived ──────────────────────────────────────────────────────────────
  const totalQty = useMemo(
    () => scannedProducts.reduce((s, p) => s + (parseInt(p.quantity_to_transfer) || 0), 0),
    [scannedProducts],
  );

  const canSync          = !!(formData.to_warehouse && (formData.transport || transportOptions[0]));
  const effectiveTransport = formData.transport || transportOptions[0] || null;

  // ── Mount ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      await Promise.all([loadAllWarehouses(), loadTransportOptions()]);
      await restoreDraft();
    })();
    // eslint-disable-next-line
  }, []);


  // Re-sync when routing fields change and we already have products
  useEffect(() => {
    if (scannedProducts.length > 0 && canSync) {
      syncToDb(scannedProducts, formData);
    }
    // eslint-disable-next-line
  }, [formData.to_warehouse, formData.transport]);

  // Hardware barcode scanner listener
  useEffect(() => {
    const handleKey = (e) => {
      const now = Date.now();
      if (now - lastKeyTime.current > 80) scanBuffer.current = "";
      lastKeyTime.current = now;

      const tag          = e.target.tagName;
      const isOtherInput = (tag === "INPUT" || tag === "TEXTAREA") && e.target !== barcodeRef.current;
      if (isOtherInput) return;

      if (e.key === "Enter" && scanBuffer.current.length >= 4) {
        e.preventDefault();
        const code = scanBuffer.current.trim();
        setBarcodeInput(code);
        handleScan(code);
        scanBuffer.current = "";
        return;
      }
      if (e.key.length === 1) scanBuffer.current += e.key;
    };
    window.addEventListener("keypress", handleKey);
    return () => window.removeEventListener("keypress", handleKey);
    // eslint-disable-next-line
  }, [formData, scannedProducts, transportOptions]);


  const setScanned = (val) => {
    setScannedProducts((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      scannedProductsRef.current = next;
      return next;
    });
  };

  // ── Loaders ───────────────────────────────────────────────────────────────
  const loadAllWarehouses = async () => {
    try {
      const res  = await AuthService.getWarehouseDropdown();
      const list = (res.data.data || res.data || []).map((w) => ({
        value: w.wh_uuid,
        label: w.name || w.title,
      }));
      setAllWarehouses(list);
    } catch (e) {
      console.error("loadAllWarehouses:", e);
    }
  };

  const loadTransportOptions = async () => {
    try {
      const res     = await AuthService.getStockFlowOptions();
      const options = res.data?.data;
      if (!options) {
        toast("error", "Options Error", "Failed to load transport options from server.", 5000);
        return;
      }
      const toOpt = (v) =>
        typeof v === "object" && v !== null && v.value !== undefined
          ? v
          : {
              value: String(v),
              label: String(v)
                .split("_")
                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                .join(" "),
            };
      const transportOpts = (options.transport || []).map(toOpt);
      setTransportOptions(transportOpts);
      if (!transportOpts.length)
        console.warn("Transport options empty — check stock_flow.transport enum in DB.");
    } catch (e) {
      console.error("loadTransportOptions error:", e);
      toast("error", "Options Error", `Could not load transport options: ${e.message}`, 5000);
    }
  };

  // ── Restore draft ─────────────────────────────────────────────────────────
  const restoreDraft = async () => {
    setLoadingDraft(true);
    try {
      const res  = await AuthService.getExistingStock();
      const body = res.data;
      if (!body.is_found || !body.data) return;

      const lot = body.data;
      setCurrentStockId(lot.stock_id);
      setFormData((prev) => ({ ...prev, description: lot.bulk_imp_desc || "" }));

      if (lot.prod_arr?.length) {
        const restored = lot.prod_arr.map((p) => ({
          prod_uuid:            p.prod_uuid,
          partial_code:         p.partial_code,
          article_profile_id:   p.article_profile_id,
          article_profile_name: p.article_profile_name || "—",
          warehouse_name:       p.warehouse_name || "—",
          count:                p.count || 0,
          status:               p.status,
          quantity_to_transfer: p.count || 1,
        }));
        setScanned(restored);
        MySwal.fire({
          icon: "info",
          title: "Draft Restored",
          html: `<p><strong>${restored.length}</strong> product(s) from your previous session.</p>
                 <small class="text-muted">Stock ID: ${lot.stock_id}</small>`,
          timer: 3500,
          showConfirmButton: false,
        });
      }
    } catch (err) {
      console.warn("No draft found:", err.message);
    } finally {
      setLoadingDraft(false);
    }
  };

  // ── syncToDb ──────────────────────────────────────────────────────────────

  const syncToDb = useCallback(async (products, fd) => {
    if (!fd.to_warehouse) return;
    if (!products.length) return;

    const transport = fd.transport || transportOptions[0] || null;
    if (!transport) {
      console.warn("syncToDb: no transport available — skipping.");
      return;
    }

    setIsSyncing(true);
    try {
      const payload = {
        to_wh:          fd.to_warehouse.value,
        transportation: transport.value,
        prod_arr:       products.map(toApiProdItem),
        
        description:    fd.description || undefined,
        // description:    typeof fd.description === "string" ? fd.description : "",
      };

      console.log("syncToDb payload:", payload);
      const res = await AuthService.stockFlowSync(payload);

      // If we don't have a stock_id yet, try to get it from the sync response
      // or fall back to a fresh draft fetch.
      const syncedId = res.data?.data?.stock_id;
      if (syncedId) {
        setCurrentStockId(syncedId);
      } else if (!currentStockId) {
        try {
          const draftRes = await AuthService.getExistingStock();
          if (draftRes.data?.data?.stock_id) {
            setCurrentStockId(draftRes.data.data.stock_id);
          }
        } catch { /* draft may not exist yet */ }
      }

      console.log("Sync success:", res.data?.message);
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to sync draft";
      toast("error", "Sync Error", msg, 3000);
      console.error("syncToDb error:", err.response?.data || err);
    } finally {
      setIsSyncing(false);
    }
  }, [currentStockId, transportOptions]);

  // ── handleScan ────────────────────────────────────────────────────────────
  // FIX: scanProduct thunk returns response.data from AuthService.scanProduct.
  // If your API shape is { success, data: { prod_uuid, ... } } then unwrap()
  // gives you that whole object and you need res.data. If your thunk already
  // returns response.data.data (the product directly), then product = unwrap().
  // Adjust the line marked ★ to match your productSlice's return value.
  const handleScan = useCallback(async (barcode) => {
    const code = (barcode || "").trim();
    if (!code) return;

    if (scannedProductsRef.current.find((p) => p.partial_code === code)) {
      toast("warning", "Already Scanned", `Barcode "${code}" is already in the list.`);
      setBarcodeInput("");
      return;
    }

    setIsScanning(true);
    try {
      // ★ unwrap() returns whatever the thunk resolves with.
      // If scanProduct thunk does `return response.data` and your API returns
      // { success, data: { prod_uuid, ... } }, then:
      //   const result = await dispatch(scanProduct(code)).unwrap();
      //   const product = result.data;   ← use this line
      //
      // If the thunk already returns response.data.data (the product object), then:
      //   const product = await dispatch(scanProduct(code)).unwrap(); ← use this line
      //
      // Currently using the first pattern (result.data) — adjust if needed:
      const result  = await dispatch(scanProduct(code)).unwrap();
      const product = result?.data ?? result; // handles both shapes gracefully

      if (!product?.prod_uuid) throw new Error(result?.message || "Product not found");

      // Warehouse validation (client-side early check)
      if (currentUser?.warehouse_id && product.warehouse_id !== currentUser.warehouse_id) {
        MySwal.fire({
          icon: "error",
          title: "Wrong Warehouse",
          text: `This product belongs to "${product.warehouse_name}", not your assigned warehouse.`,
        });
        setBarcodeInput("");
        return;
      }

      // Status validation
      if (!TRANSFERABLE_STATUSES.includes(product.status)) {
        MySwal.fire({
          icon: "error",
          title: "Invalid Status",
          text: `"${product.partial_code || code}" has status "${product.status}". ` +
                `Only ${TRANSFERABLE_STATUSES.join(", ")} can be transferred.`,
        });
        setBarcodeInput("");
        return;
      }

      const newProd = {
        prod_uuid:            product.prod_uuid,
        partial_code:         product.partial_code || product.barcode || code,
        article_profile_id:   product.article_profile_id,
        article_profile_name: product.article_profile_name || "—",
        warehouse_name:       product.warehouse_name || "—",
        count:                product.count || 0,
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
          `"${newProd.partial_code}" added. Select To Warehouse to save draft.`);
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

  // ── Remove single product ─────────────────────────────────────────────────
  const handleRemoveProduct = useCallback((prod_uuid, partial_code) => {
    MySwal.fire({
      title: "Remove Product?",
      text: "This will remove it from your draft.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Remove",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        if (currentStockId) {
          const res = await AuthService.removeLotProduct(partial_code);
          setScanned((prev) => prev.filter((p) => p.prod_uuid !== prod_uuid));
          if (res.data?.draft_deleted) {
            setCurrentStockId(null);
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
  }, [currentStockId]);

  // ── Remove all selected ───────────────────────────────────────────────────
  const handleRemoveSelected = useCallback((selectedUuids) => {
    MySwal.fire({
      title: `Remove ${selectedUuids.length} product(s)?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Remove All",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      const toRemove = scannedProducts.filter((p) => selectedUuids.includes(p.prod_uuid));
      if (currentStockId) {
        for (const p of toRemove) {
          try { await AuthService.removeLotProduct(p.partial_code); } catch { /* continue */ }
        }
      }
      const remaining = scannedProducts.filter((p) => !selectedUuids.includes(p.prod_uuid));
      setScanned(remaining);
      if (remaining.length === 0) setCurrentStockId(null);
      toast("success", "Removed", `${toRemove.length} product(s) removed.`);
    });
  }, [scannedProducts, currentStockId]);

  // ── Discard draft ─────────────────────────────────────────────────────────
  const handleDiscardDraft = () => {
    MySwal.fire({
      title: "Discard entire draft?",
      text: "All scanned products will be removed.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, discard",
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      try {
        if (currentStockId) await AuthService.discardDraft();
        setScanned([]);
        setCurrentStockId(null);
        toast("info", "Draft Discarded", "All products cleared.");
      } catch (err) {
        toast("error", "Error", err.response?.data?.message || "Failed to discard.", 3000);
      }
    });
  };

  // ── Qty change ────────────────────────────────────────────────────────────
  const handleQtyChange = useCallback((prod_uuid, newQty) => {
    setScanned((prev) =>
      prev.map((p) => {
        if (p.prod_uuid !== prod_uuid) return p;
        const qty = parseInt(newQty) || 0;
        if (qty > p.count) {
          toast("warning", "Insufficient Stock", `Only ${p.count} units available.`);
          return p;
        }
        return { ...p, quantity_to_transfer: qty };
      }),
    );
  }, []);

  // ── Bill / invoice handlers (restored) ───────────────────────────────────
  const handleBillChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast("warning", "Invalid File", "PDF, JPG, or PNG only.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast("warning", "Too Large", "Max 5 MB.");
      return;
    }
    setBillPreview({ file, name: file.name, size: (file.size / 1024).toFixed(2) + " KB" });
  };

  const handleRemoveBill = () => {
    setBillPreview(null);
    if (billFileRef.current) billFileRef.current.value = "";
  };

  // ── Excel import ──────────────────────────────────────────────────────────
  const handleExcelImport = async () => {
    if (!excelFile) return;
    setImportingExcel(true);
    try {
      const fd = new FormData();
      fd.append("excel_file", excelFile);
      if (formData.to_warehouse)  fd.append("to_wh",         formData.to_warehouse.value);
      if (effectiveTransport)     fd.append("transportation", effectiveTransport.value);
      // Always send description as string
      fd.append("description", typeof formData.description === "string" ? formData.description : "");

      const res  = await AuthService.importStockFlowFromExcel(fd);
      const data = res.data;

      if (data.data?.stock_id) setCurrentStockId(data.data.stock_id);

      if (!data.data?.draft_saved && data.data?.products?.length) {
        const localProds = data.data.products.map((p) => ({
          prod_uuid:            p.prod_uuid,
          partial_code:         p.partial_code || p.barcode,
          article_profile_id:   p.article_profile_id,
          article_profile_name: p.article_profile_name || "—",
          warehouse_name:       p.warehouse_name || "—",
          count:                p.count || 1,
          status:               p.status,
          quantity_to_transfer: p.count || 1,
        }));
        setScanned((prev) => {
          const existing = new Set(prev.map((x) => x.prod_uuid));
          return [...prev, ...localProds.filter((x) => !existing.has(x.prod_uuid))];
        });
      } else {
        await restoreDraft();
      }

      setExcelFile(null);
      if (excelInputRef.current) excelInputRef.current.value = "";

      const errorLines = (data.data?.error_details || [])
        .map((e) => `<li><code>${e.barcode || e.partial_code}</code>: ${e.error}</li>`)
        .join("");

      MySwal.fire({
        icon: data.data?.errors > 0 ? "warning" : "success",
        title: data.message,
        html: `
          <p>Added: <strong>${data.data?.added || 0}</strong></p>
          <p>Skipped: <strong>${data.data?.skipped || 0}</strong></p>
          ${data.data?.errors > 0
            ? `<p>Errors: <strong>${data.data.errors}</strong></p><ul class="text-start">${errorLines}</ul>`
            : ""}
          ${!data.data?.draft_saved
            ? `<p class="text-warning mt-2 small">Select To Warehouse to persist draft.</p>`
            : ""}
        `,
      });
    } catch (err) {
      MySwal.fire({
        icon: "error",
        title: "Import Failed",
        text: err.response?.data?.message || "Import failed.",
      });
    } finally {
      setImportingExcel(false);
    }
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProductErrors([]);

    if (!scannedProducts.length) {
      toast("warning", "No Products", "Scan at least one product."); return;
    }
    if (!formData.to_warehouse) {
      toast("warning", "Missing", "To Warehouse is required."); return;
    }
    if (!effectiveTransport) {
      toast("warning", "Missing", "No transport options available yet."); return;
    }
    if (scannedProducts.some((p) => p.quantity_to_transfer <= 0)) {
      toast("warning", "Invalid Qty", "All quantities must be greater than 0."); return;
    }

    await syncToDb(scannedProducts, formData);

    setSubmitting(true);
    try {
      const res  = await AuthService.stockFlowSubmit();
      const body = res.data;

      if (!body.success) {
        const errProds = body.data || [];
        if (errProds.length) {
          const errorList = errProds.map((ep) => {
            const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
            return {
              prod_uuid:    ep.prod_uuid,
              partial_code: local?.partial_code || ep.prod_uuid,
              title:        local?.title        || ep.prod_uuid,
              errors: [`Requested ${ep.count} but insufficient stock or status mismatch (${ep.status})`],
            };
          });
          setProductErrors(errorList);
          MySwal.fire({
            icon: "error",
            title: "Submission Failed",
            html: `<p>${body.message}</p><p class="text-muted small">Inconsistent products are highlighted below.</p>`,
          });
          return;
        }
        throw new Error(body.message || "Submission failed.");
      }

      MySwal.fire({
        icon: "success",
        title: "Stock Flow Created!",
        html: `
          <p><strong>Stock ID:</strong> ${currentStockId || "—"}</p>
          <p><strong>Products:</strong> ${scannedProducts.length}</p>
          <p><strong>Total Quantity:</strong> ${totalQty}</p>
          ${formData.to_warehouse ? `<p><strong>To:</strong> ${formData.to_warehouse.label}</p>` : ""}
          <p class="text-muted small">Status set to <strong>in-transit</strong></p>
        `,
        confirmButtonText: "View Stock Flows",
      }).then(() => navigate("/stock-transfer"));
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to create stock flow.";
      const errProds = err.response?.data?.data || [];
      if (errProds.length) {
        const errorList = errProds.map((ep) => {
          const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
          return {
            prod_uuid:    ep.prod_uuid,
            partial_code: local?.partial_code || ep.prod_uuid,
            title:        local?.title        || ep.prod_uuid,
            errors:       [`Count ${ep.count}, status ${ep.status} — inventory mismatch`],
          };
        });
        setProductErrors(errorList);
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
        title: "Barcode / Code",
        dataIndex: "partial_code",
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
      { title: "Warehouse",       dataIndex: "warehouse_name" },
      {
        title: "Status", dataIndex: "status",
        render: (t) => (
          <span className={`badge ${STATUS_BADGE[t] || "badge-info"}`}>
            {t?.toUpperCase() || "N/A"}
          </span>
        ),
      },
      {
        title: "Available", dataIndex: "count",
        render: (t) => <span className="badge badge-info">{t}</span>,
      },
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
            onClick={() => handleRemoveProduct(record.prod_uuid, record.partial_code)}
            title="Remove">
            <Trash2 size={14} />
          </button>
        ),
      },
    ];
  }, [productErrors, handleQtyChange, handleRemoveProduct]);

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

        {/* Active draft banner */}
        {!loadingDraft && currentStockId && (
          <div className="alert alert-warning d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <RefreshCw size={16} className="me-2" />
              <strong>Active Draft:</strong>
              <span className="ms-2 badge badge-warning">{currentStockId}</span>
              {isSyncing && <span className="spinner-border spinner-border-sm ms-2 text-muted" />}
            </div>
            {scannedProducts.length > 0 && (
              <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleDiscardDraft}>
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
                <li key={i}>
                  <strong>{e.title || e.partial_code}</strong> ({e.partial_code}):{" "}
                  {e.errors.join("; ")}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ── Stock Flow Details ── */}
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="mb-4">Stock Flow Details</h5>

            {/* From Warehouse — read-only */}
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
              <div className="col-lg-6">
                <label className="form-label">To Warehouse <span className="text-danger">*</span></label>
                <Select options={allWarehouses} value={formData.to_warehouse}
                  onChange={(opt) => setField("to_warehouse", opt)}
                  placeholder="Select destination warehouse" isClearable />
              </div>
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

            {/* ── Bill / Invoice upload (RESTORED) ── */}
            <div className="row">
              <div className="col-lg-6">
                <label className="form-label">
                  <File size={16} className="me-1" />Bill / Invoice (Optional)
                </label>
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
              </div>
            </div>

          </div>
        </div>

        {/* ── Scan Barcode ── */}
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
                    Select a <strong>To Warehouse</strong> above to auto-save each scan to draft.
                  </span>
                </div>
              </div>
            ) : (
              <div className="alert alert-success d-flex align-items-center mb-3">
                <span className="me-2 flex-shrink-0">✓</span>
                <div>
                  <strong>Ready to scan &amp; auto-save!</strong> Each scan is saved to draft.
                  <div className="mt-1">
                    To: <strong>{formData.to_warehouse?.label}</strong>
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
                  {!canSync && <span className="ms-2 text-warning small">⚠ Unsaved — select To Warehouse to persist</span>}
                </strong>
              </div>
            )}
          </div>
        </div>

        {/* ── Excel Import ── */}
        <div className="card mb-3">
          <div className="card-body">
            <div className="d-flex align-items-center mb-3">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                strokeLinejoin="round" style={{ color: "#198754" }} className="me-2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="3"  y1="9"  x2="21" y2="9"/>
                <line x1="3"  y1="15" x2="21" y2="15"/>
                <line x1="9"  y1="3"  x2="9"  y2="21"/>
                <line x1="15" y1="3"  x2="15" y2="21"/>
              </svg>
              <h5 className="mb-0">Import from Excel / CSV</h5>
              <span className="badge badge-success ms-2" style={{ fontSize: "0.7rem" }}>Always Active</span>
            </div>

            <p className="text-muted small mb-3">
              Upload a file with a <code>barcode</code> column (optional:{" "}
              <code>quantity_to_transfer</code> or <code>count</code>). Products are validated
              immediately. If <strong>To Warehouse</strong> is selected, the draft is saved automatically.
            </p>

            <div className="row align-items-end">
              <div className="col-lg-8">
                <label className="form-label">Select Excel / CSV File</label>
                <input ref={excelInputRef} type="file" className="form-control"
                  accept=".xlsx,.xls,.csv"
                  onChange={(e) => setExcelFile(e.target.files[0] || null)} />
                {excelFile && (
                  <small className="text-muted">
                    Selected: {excelFile.name} ({(excelFile.size / 1024).toFixed(1)} KB)
                  </small>
                )}
              </div>
              <div className="col-lg-4">
                <button type="button" className="btn btn-success w-100"
                  onClick={handleExcelImport} disabled={!excelFile || importingExcel}>
                  {importingExcel
                    ? <><span className="spinner-border spinner-border-sm me-2" />Importing…</>
                    : <><Upload size={16} className="me-1" />Import Excel</>}
                </button>
              </div>
            </div>

            <div className="mt-2">
              <small className="text-muted">
                Need a template?{" "}
                <a href="#" onClick={(e) => {
                  e.preventDefault();
                  const csv = "data:text/csv;charset=utf-8," +
                    [["barcode", "quantity_to_transfer"], ["BARCODE001", 1], ["BARCODE002", 2]]
                      .map((r) => r.join(",")).join("\n");
                  const link = document.createElement("a");
                  link.setAttribute("href", encodeURI(csv));
                  link.setAttribute("download", "stock_flow_template.csv");
                  link.click();
                }}>
                  Download CSV template
                </a>
              </small>
            </div>
          </div>
        </div>

        {/* ── Scanned Products Table ── */}
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

        {/* ── Transfer Summary ── */}
        {scannedProducts.length > 0 && (
          <div className="alert alert-warning mb-3">
            <strong>Transfer Summary</strong>
            <ul className="mb-0 mt-2">
              <li>Total Products: {scannedProducts.length}</li>
              <li>Total Quantity: {totalQty} units</li>
              {currentUser?.warehouse_name && <li>From: {currentUser.warehouse_name}</li>}
              {formData.to_warehouse          && <li>To: {formData.to_warehouse.label}</li>}
              {effectiveTransport             && (
                <li>Transport: {effectiveTransport.label}{!formData.transport ? " (default)" : ""}</li>
              )}
              <li>Status after submit: <strong>in-transit</strong></li>
              {currentStockId && <li>Draft Stock ID: <strong>{currentStockId}</strong></li>}
            </ul>
            <small className="text-muted d-block mt-1">Inventory will be updated on submission.</small>
          </div>
        )}

        {/* ── Submit / Cancel ── */}
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
    </div>
  );
};

export default AddStockFlow;