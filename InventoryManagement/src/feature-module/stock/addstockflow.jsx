

import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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
  selectReqDropdown,
  selectReqDropdownLoading,
  removeDropdownEntry,
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
  prod_uuid:  p.prod_uuid,
  trf_count:  p.quantity_to_transfer || 1,
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
  const transportOptionsRef = useRef([]);

  const [formData, setFormData] = useState(INITIAL_FORM);
  const formDataRef = useRef(INITIAL_FORM);

  const setField = (key, val) => {
    setFormData((p) => {
      const next = { ...p, [key]: val };
      formDataRef.current = next;
      return next;
    });
  };

  const setFormDataFull = (val) => {
    setFormData((p) => {
      const next = typeof val === "function" ? val(p) : val;
      formDataRef.current = next;
      return next;
    });
  };

  const [scannedProducts, setScannedProducts] = useState([]);
  const scannedProductsRef                    = useRef([]);

  const [currentStockId, setCurrentStockId] = useState(null);
  const currentStockIdRef                   = useRef(null);
  const setStockId = (id) => {
    currentStockIdRef.current = id;
    setCurrentStockId(id);
  };

  const [syncInfo, setSyncInfo]           = useState(null);
  const [loadingDraft, setLoadingDraft]   = useState(true);
  const [isScanning, setIsScanning]       = useState(false);
  const [isSyncing, setIsSyncing]         = useState(false);
  const [submitting, setSubmitting]       = useState(false);
  const [productErrors, setProductErrors] = useState([]);

  const [barcodeInput, setBarcodeInput] = useState("");
  const barcodeRef = useRef(null);
  //eslint-disable-next-line
  const [billFile, setBillFile]       = useState(null);
  const [billPreview, setBillPreview] = useState(null);
  const billFileRef   = useRef(null);
  const billFileState = useRef(null);

  // ── Debounce refs for description and qty changes ──────────────
  const descSyncTimer = useRef(null);
  const qtySyncTimer  = useRef(null);

  const hasInitializedRef = useRef(false);
  const hasSubmittedRef   = useRef(false);
  const restoringDraftRef = useRef(false);

  const location         = useLocation();
  const fromStockRequest = location.state?.fromStockRequest;
  const preselected      = location.state?.request;

  // ── Derived
  const totalQty = useMemo(
    () => scannedProducts.reduce((s, p) => s + (parseInt(p.quantity_to_transfer) || 0), 0),
    [scannedProducts],
  );

  const canSync            = !!(formData.stock_request_id && (formData.transport || transportOptions[0]));
  const effectiveTransport = formData.transport || transportOptions[0] || null;

  const setScanned = (val) => {
    setScannedProducts((prev) => {
      const next = typeof val === "function" ? val(prev) : val;
      scannedProductsRef.current = next;
      return next;
    });
  };

  const resetDraftState = () => {
    setScanned([]);
    setStockId(null);
    setSyncInfo(null);``
    setProductErrors([]);
    setBillFile(null);
    setBillPreview(null);
    billFileState.current = null;

      setFormData({...INITIAL_FORM});
  formDataRef.current = { ...INITIAL_FORM };


  setLockedRequest(null);
  localStorage.removeItem("selected_stock_request");
  };

  const mapDraftProduct = (p) => ({
    prod_uuid:            p.prod_uuid,
    partial_code:         p.partial_code,
    article_profile_id:   p.article_profile_id   || "",
    article_profile_name: p.article_profile_name || "—",
    warehouse_name:       p.warehouse_name        || "—",
    count:                p.available_count       ?? p.available ?? p.count ?? 0,
    status:               p.status,
    quantity_to_transfer: p.transferable_count    ?? p.count ?? 1,
  });

  // ── applyDraftToState
  const applyDraftToState = (lot, message = null) => {
    setStockId(lot.stock_id);

    if (lot.description) {
      setFormDataFull((prev) => ({ ...prev, description: lot.description }));
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
      const restored = lot.prod_arr.filter(Boolean).map(mapDraftProduct);
      setScanned(restored);

      MySwal.fire({
        icon:  "info",
        title: message?.title || "Draft Restored",
        html:  `
          <p><strong>${restored.length}</strong> product(s) from your previous session.</p>
          <small class="text-muted">
            Stock ID: ${lot.stock_id} · Request: ${lot.request_id}
          </small>
        `,
        timer:             3500,
        showConfirmButton: false,
      });
    }
  };

  // ── restoreDraftByRequestId
  const restoreDraftByRequestId = async (requestId) => {
    if (!requestId) return;
    restoringDraftRef.current = true;
    try {
      const res  = await AuthService.get_approved_stock_flow(requestId);
      const body = res.data;
      if (body?.is_found && body?.data) {
        applyDraftToState(body.data, body.message);
      } else {
        toast("info", "No Draft", body?.message || "No saved draft for this request.");
      }
    } catch (err) {
      console.warn("restoreDraftByRequestId:", err);
    } finally {
      setTimeout(() => { restoringDraftRef.current = false; }, 50);
    }
  };


  useEffect(() => {
    if (hasInitializedRef.current) return;

   const init = async () => {
  setLoadingDraft(true);

  try {
    await Promise.all([
      loadTransportOptions(),
      dispatch(fetchStockRequestDropdown()),
    ]);

    if (hasSubmittedRef.current) return;

    let requestToUse = null;

   
    if (fromStockRequest && preselected?.value) {
      requestToUse = preselected;
      window.history.replaceState({}, document.title);
    }

    if (!requestToUse) {
      const saved = localStorage.getItem("selected_stock_request");
      if (saved) requestToUse = JSON.parse(saved);
    }


    if (requestToUse?.value) {
      setField("stock_request_id", requestToUse);
      setLockedRequest(fromStockRequest ? requestToUse : null);

   
      await restoreDraftByRequestId(requestToUse.value);
    }

  } catch (err) {
    console.error(err);
  } finally {
    setLoadingDraft(false);
    hasInitializedRef.current = true;
  }
};


    init();
    // eslint-disable-next-line
  }, []);



  useEffect(() => {
    if (restoringDraftRef.current) return;
    if (scannedProductsRef.current.length > 0 && canSync) {
      syncToDb(scannedProductsRef.current);
    }
    // eslint-disable-next-line
  }, [formData.stock_request_id, formData.transport]);

  // ── loadTransportOptions
  const loadTransportOptions = async () => {
    try {
      const res     = await AuthService.getStockFlowOptions();
      const options = res.data?.data;
      if (!options) { toast("error", "Options Error", "Failed to load transport options.", 5000); return; }
      const mapped = (options.transport || []).map(toTransportOption);
      transportOptionsRef.current = mapped;
      setTransportOptions(mapped);
    } catch (e) {
      toast("error", "Options Error", `Could not load transport options: ${e.message}`, 5000);
    }
  };


  // ── syncToDb ─────────────────────────────────────────────────────
  const syncToDb = useCallback(async (products, overrideFormData = null) => {
    const fd       = overrideFormData || formDataRef.current;
    const tOptions = transportOptionsRef.current;

    if (!fd.stock_request_id) return;
    if (!products.length)     return;

    const transport = fd.transport || tOptions[0] || null;
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
  }, []);


  // const removeLotProduct = useCallback(async (prod_uuid, nextList) => {
  //   try {
    
   
  //     if (nextList.length === 0) {
  // if (currentStockIdRef.current) {
  //   await AuthService.autoRemoveStock(currentStockIdRef.current);
  // }

  //       setStockId(null);
  //       setSyncInfo(null);
  //     } else {
      
  //       const fd       = formDataRef.current;
  //       const tOptions = transportOptionsRef.current;
  //       const syncReady = !!(fd.stock_request_id && (fd.transport || tOptions[0]));
  //       if (syncReady) await syncToDb(nextList);
  //     }
  //   } catch (err) {
  //     toast("error", "Remove Error", err.response?.data?.message || "Failed to remove product.", 3000);
  //     console.error("removeLotProduct error:", err);
  //   }
  //   // eslint-disable-next-line
  // }, [syncToDb]);


  const doScanAndAdd = useCallback(async (code, product_id = null, prefetchedProduct = null) => {
    setIsScanning(true);
    try {
      let product;
      let message;
      if (prefetchedProduct) {
        product = prefetchedProduct;
      } else {
        const result = await dispatch(scanProduct({ code, product_id })).unwrap();
        product = result?.data ?? result;
        message = result?.message;
        
      }

      if (!product?.prod_uuid) throw new Error("Product not found");

      if (currentUser?.warehouse_id && product.warehouse_id !== currentUser.warehouse_id) {
        MySwal.fire({
          icon: "error", title: "Wrong Warehouse",
          text: `This product belongs to "${product.warehouse_name}", not your assigned warehouse.`,
        });
        return;
      }

      if (!TRANSFERABLE_STATUSES.includes(product.status)) {
        MySwal.fire({
          icon: "error", title: "Invalid Status",
          text: `"${product.partial_code || code}" has status "${product.status}". ` +
                `Only ${TRANSFERABLE_STATUSES.join(", ")} can be transferred.`,
        });
        return;
      }

      if (scannedProductsRef.current.find((p) => p.prod_uuid === product.prod_uuid)) {
        toast("warning", "Already Scanned", `Product "${product.partial_code || code}" is already in the list.`);
        setBarcodeInput("");
        return;
      }

      const newProd = {
        prod_uuid:            product.prod_uuid,
        partial_code:         product.partial_code || code,
        article_profile_id:   product.article_profile_id,
        article_profile_name: product.article_profile_name || "—",
        warehouse_name:       product.warehouse_name        || "—",
        count:                product.count                 ?? 0,
        status:               product.status,
        quantity_to_transfer: 1,
      };

      const updated = [...scannedProductsRef.current, newProd];
      setScanned(updated);
      setBarcodeInput("");

      const fd       = formDataRef.current;
      const tOptions = transportOptionsRef.current;
      const syncReady = !!(fd.stock_request_id && (fd.transport || tOptions[0]));
      
      if (syncReady) {
  await syncToDb(updated);

  toast(
    "success",
    "Success",
    message || `Scanned & Saved: ${newProd.partial_code}`
  );
}

      
      
      
      else {
        toast("info", "Scanned (Local)",
          `"${newProd.partial_code}" added. Select a Stock Request above to save draft.`);
      }
    } catch (err) {
  console.log("ERROR:", err);

  const msg =
    typeof err === "string"
      ? err
      : err?.response?.data?.message ||
        err?.data?.message ||
        err?.message ||
        "Something went wrong";

  MySwal.fire({
    icon: "error",
    title: "Error",
    text: msg,
  });

    } finally {
      setIsScanning(false);
      barcodeRef.current?.focus();
    }
    // eslint-disable-next-line
  }, [dispatch, syncToDb, currentUser]);

  // ── handleScan
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
  }, [doScanAndAdd]);


  // const handleRemoveProduct = useCallback((prod_uuid, partial_code) => {
  //   MySwal.fire({
  //     title:              "Remove Product?",
  //     text:               "This will remove it from your draft.",
  //     icon:               "warning",
  //     showCancelButton:   true,
  //     confirmButtonColor: "#d33",
  //     confirmButtonText:  "Remove",
  //   }).then(async (result) => {
  //     if (!result.isConfirmed) return;

  //     const nextList = scannedProductsRef.current.filter((p) => p.prod_uuid !== prod_uuid);
  //     setScanned(nextList);

  //     try {
  //       await removeLotProduct(prod_uuid, nextList);
  //       if (nextList.length === 0) {
  //         toast("info", "Draft Deleted", "Last product removed. Draft cleared.");
  //       } else {
  //         toast("success", "Removed", `"${partial_code}" removed from draft.`);
  //       }
  //     } catch (err) {
      
  //       toast("error", "Error", err.response?.data?.message || "Failed to remove.", 3000);
  //     }
  //   });
  //   // eslint-disable-next-line
  // }, [removeLotProduct]);


//   const handleRemoveProduct = useCallback((prod_uuid, partial_code) => {
//   MySwal.fire({
//     title: "Remove Product?",
//     text: "This will remove it from your draft.",
//     icon: "warning",
//     showCancelButton: true,
//     confirmButtonColor: "#d33",
//     confirmButtonText: "Remove",
//   }).then(async (result) => {
//     if (!result.isConfirmed) return;

//     const nextList = scannedProductsRef.current.filter(
//       (p) => p.prod_uuid !== prod_uuid
//     );

//     setScanned(nextList);

//     try {
//       const res = await removeLotProduct(prod_uuid, nextList);

//       const msg =
//         res?.data?.message ||
//         res?.message;

//       if (nextList.length === 0) {
//         toast(
//           "info",
//           "Draft Deleted",
//           msg || "Last product removed. Draft cleared."
//         );
//       } else {
//         toast(
//           "success",
//           "Removed",
//           msg || `"${partial_code}" removed from draft.`
//         );
//       }
//     } catch (err) {
//       const errorMsg =
//         typeof err === "string"
//           ? err
//           : err?.response?.data?.message ||
//             err?.message ||
//             "Failed to remove.";

//       toast("error", "Error", errorMsg, 3000);
//     }
//   });
// }, [removeLotProduct]);


const handleDeleteProduct = useCallback(
  async (prod_uuid, partial_code) => {
    MySwal.fire({
      title: "Remove Product?",
      text: "This will delete it from draft & database.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Delete",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      try {
     
        const updatedList = scannedProductsRef.current.filter(
          (p) => p.prod_uuid !== prod_uuid
        );

        setScanned(updatedList);

       
        if (updatedList.length === 0) {
          if (currentStockIdRef.current) {
            const res = await AuthService.autoRemoveStock(
              currentStockIdRef.current
            );

            const msg =
              res?.data?.message ||
              res?.message ||
              "Stock deleted successfully";

        resetDraftState();

            toast("info", "Stock Deleted", msg);
          }
          return;
        }

       
        const fd = formDataRef.current;
        const tOptions = transportOptionsRef.current;

        const syncReady = !!(
          fd.stock_request_id &&
          (fd.transport || tOptions[0])
        );

        if (syncReady) {
          await syncToDb(updatedList);
        }

        toast(
          "success",
          "Deleted",
          `"${partial_code}" removed & synced to database.`
        );
      } catch (err) {
        const msg =
          err?.response?.data?.message ||
          err?.message ||
          "Failed to delete product";

        toast("error", "Error", msg, 3000);
      }
    });
  },
  [syncToDb]
);


  // ── handleRemoveSelected — bulk removal
  const handleRemoveSelected = useCallback((selectedUuids) => {
    MySwal.fire({
      title:              `Remove ${selectedUuids.length} product(s)?`,
      icon:               "warning",
      showCancelButton:   true,
      confirmButtonColor: "#d33",
      confirmButtonText:  "Remove All",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      const remaining = scannedProductsRef.current.filter((p) => !selectedUuids.includes(p.prod_uuid));
      setScanned(remaining);

      try {
        if (remaining.length === 0) {
  let resMessage;

  if (currentStockIdRef.current) {
    const res = await AuthService.autoRemoveStock(currentStockIdRef.current);
    resMessage = res?.data?.message || res?.message;
  }

  setStockId(null);
  setSyncInfo(null);

  toast(
    "info",
    "Draft Deleted",
    resMessage || "Stock data removed successfully"
  );
}
 else {
          // Sync the trimmed list to replace product_arr server-side
          const fd       = formDataRef.current;
          const tOptions = transportOptionsRef.current;
          const syncReady = !!(fd.stock_request_id && (fd.transport || tOptions[0]));
          if (syncReady) await syncToDb(remaining);
          toast("success", "Removed", `${selectedUuids.length} product(s) removed.`);
        }
      } catch (err) {
        toast("error", "Error", err.response?.data?.message || "Failed to remove.", 3000);
      }
    });
    // eslint-disable-next-line
  }, [syncToDb]);

  // ── handleDiscardDraft
  // const handleDiscardDraft = () => {
  //   MySwal.fire({
  //     title:              "Discard entire draft?",
  //     text:               "All scanned products will be removed.",
  //     icon:               "warning",
  //     showCancelButton:   true,
  //     confirmButtonColor: "#d33",
  //     confirmButtonText:  "Yes, discard",
  //   }).then(async (result) => {
  //     if (!result.isConfirmed) return;
  //     try {
  //       if (currentStockIdRef.current) {
  //         await AuthService.autoRemoveStock(currentStockIdRef.current);
  //       }
  //       resetDraftState();
  //       toast( "info",
  // "Draft Discarded",
  // res?.data?.message || res?.message || "Stock data removed successfully")
  //     } catch (err) {
  //       toast("error", "Error", err.response?.data?.message || "Failed to discard.", 3000);
  //     }
  //   });
  // };


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
      let resMessage;

      if (currentStockIdRef.current) {
        const res = await AuthService.autoRemoveStock(
          currentStockIdRef.current
        );

        resMessage =
          res?.data?.message ||
          res?.message;
      }

      resetDraftState();

      toast(
        "info",
        "Draft Discarded",
        resMessage || "Stock data removed successfully"
      );
    } catch (err) {
      const msg =
        typeof err === "string"
          ? err
          : err?.response?.data?.message ||
            err?.message ||
            "Failed to discard.";

      toast("error", "Error", msg, 3000);
    }
  });
};


  // ── handleQtyChange —  
  const handleQtyChange = useCallback((prod_uuid, newQty) => {
    setScanned((prev) => {
      const updated = prev.map((p) => {
        if (p.prod_uuid !== prod_uuid) return p;
        const qty = parseInt(newQty) || 0;
        if (qty > p.count) {
          toast("warning", "Insufficient Stock", `Only ${p.count} units available.`);
          return p;
        }
        return { ...p, quantity_to_transfer: qty };
      });
      scannedProductsRef.current = updated;


      if (qtySyncTimer.current) clearTimeout(qtySyncTimer.current);
      qtySyncTimer.current = setTimeout(() => {
        const fd       = formDataRef.current;
        const tOptions = transportOptionsRef.current;
        const syncReady = !!(fd.stock_request_id && (fd.transport || tOptions[0]));
        if (syncReady && scannedProductsRef.current.length > 0) {
          syncToDb(scannedProductsRef.current);
        }
      }, 600);

      return updated;
    });
  }, [syncToDb]);

  // ── handleDescriptionChange — 
  const handleDescriptionChange = useCallback((e) => {
    const val = e.target.value;
    setField("description", val);

    if (descSyncTimer.current) clearTimeout(descSyncTimer.current);
    descSyncTimer.current = setTimeout(() => {
      const products = scannedProductsRef.current;
      const fd       = formDataRef.current;
      const tOptions = transportOptionsRef.current;
      const syncReady = !!(fd.stock_request_id && (fd.transport || tOptions[0]));
      if (syncReady && products.length > 0) {
        syncToDb(products);
      }
    }, 800);
  }, [syncToDb]); // eslint-disable-line

  // ── Bill / Invoice — immediate sync on add/remove ────────────────
  const handleBillChange = useCallback((e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!["application/pdf", "image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast("warning", "Invalid File", "PDF, JPG, or PNG only.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) { toast("warning", "Too Large", "Max 5 MB."); return; }

    setBillFile(file);
    billFileState.current = file;
    setBillPreview({ name: file.name, size: (file.size / 1024).toFixed(2) + " KB" });

    
    const products = scannedProductsRef.current;
    const fd       = formDataRef.current;
    const tOptions = transportOptionsRef.current;
    const syncReady = !!(fd.stock_request_id && (fd.transport || tOptions[0]));
    if (syncReady && products.length > 0) {
     
      const payloadOverride = { ...fd };
      syncToDb(products, payloadOverride);
    }
  }, [syncToDb]);


  const handleRemoveBill = useCallback(() => {
    setBillFile(null);
    billFileState.current = null;
    setBillPreview(null);
    if (billFileRef.current) billFileRef.current.value = "";
    

    const products = scannedProductsRef.current;
    const fd       = formDataRef.current;
    const tOptions = transportOptionsRef.current;
    const syncReady = !!(fd.stock_request_id && (fd.transport || tOptions[0]));
    if (syncReady && products.length > 0) {
      syncToDb(products);
    }
  }, [syncToDb]);

  // ── handleSubmit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setProductErrors([]);

    if (!scannedProducts.length)    { toast("warning", "No Products", "Scan at least one product."); return; }
    if (!formData.stock_request_id) { toast("warning", "Missing", "Stock Request is required."); return; }
    if (!effectiveTransport)        { toast("warning", "Missing", "No transport options available yet."); return; }
    if (scannedProducts.some((p) => p.quantity_to_transfer <= 0)) {
      toast("warning", "Invalid Qty", "All quantities must be greater than 0.");
      return;
    }

 
    await syncToDb(scannedProducts);

    setSubmitting(true);
    try {
      const res  = await AuthService.stockFlowSubmit({ stock_id: currentStockIdRef.current });
      const body = res.data;

      if (!body.success) {
        if (body.message === "Stock already submitted") {
          MySwal.fire({
            icon:              "info",
            title:             "Already Submitted",
            text:              body.message,
            confirmButtonText: "View Stock Flows",
          }).then(() => navigate("/stock-transfer"));
          return;
        }

        const errProds = body.data || [];
        if (errProds.length) {
          setProductErrors(errProds.map((ep) => {
            const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
            return {
              prod_uuid:    ep.prod_uuid,
              partial_code: local?.partial_code || ep.prod_uuid,
              errors:       [`Count ${ep.count}, status "${ep.status}" — inventory mismatch`],
            };
          }));
          MySwal.fire({ icon: "error", title: "Submission Failed", text: body.message });
          return;
        }

        throw new Error(body.message || "Submission failed.");
      }

      MySwal.fire({
        icon:  "success",
        title: body.message || "Stock Flow Created!",
        html:  `
          <p><strong>Stock ID:</strong> ${currentStockIdRef.current || "—"}</p>
          <p><strong>Products:</strong> ${scannedProducts.length}</p>
          <p><strong>Total Quantity:</strong> ${totalQty}</p>
          ${formData.stock_request_id ? `<p><strong>Request:</strong> ${formData.stock_request_id.label}</p>` : ""}
        `,
        confirmButtonText: "OK",
      }).then(async () => {
        hasSubmittedRef.current = true;

        const submittedReqId = formData.stock_request_id?.value;
        if (submittedReqId) dispatch(removeDropdownEntry(submittedReqId));

        resetDraftState();
        setLockedRequest(null);
        setField("stock_request_id", null);
        localStorage.removeItem("selected_stock_request");
        navigate("/stock-transfer", { replace: true });
        dispatch(fetchStockRequestDropdown());
      });
    } catch (err) {
      const msg      = err.response?.data?.message || err.message || "Failed to create stock flow.";
      const errProds = err.response?.data?.data    || [];
      if (errProds.length) {
        setProductErrors(errProds.map((ep) => {
          const local = scannedProducts.find((p) => p.prod_uuid === ep.prod_uuid);
          return {
            prod_uuid:    ep.prod_uuid,
            partial_code: local?.partial_code || ep.prod_uuid,
            errors:       [`Count ${ep.count}, status "${ep.status}" — inventory mismatch`],
          };
        }));
      }
      MySwal.fire({ icon: "error", title: "Error", text: msg });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Table
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
      {
        title: "Status", dataIndex: "status",
        render: (t) => (
          <span className={`badge ${STATUS_BADGE[t] || "badge-info"}`}>{t?.toUpperCase() || "N/A"}</span>
        ),
      },
      {
        title:     "Available",
        dataIndex: "count",
        render:    (t) => <span className="badge badge-info">{t}</span>,
      },
      {
        title: "Transfer Qty", dataIndex: "quantity_to_transfer",
        render: (text, record) => (
          <input
            type="number"
            className="form-control form-control-sm"
            style={{ width: "80px" }}
            value={text}
            min="1"
            max={record.count}
            onChange={(e) => handleQtyChange(record.prod_uuid, e.target.value)}
          />
        ),
      },
      {
        title: "Action", width: "80px",
        render: (_, record) => (
          <button
            type="button"
            className="btn btn-sm btn-danger"
            onClick={() => handleDeleteProduct(record.prod_uuid, record.partial_code)}
            title="Remove"
          >
            <Trash2 size={14} />
          </button>
        ),
      },
    ];
  }, [productErrors, handleQtyChange, handleDeleteProduct]);

  const formatRequestOption = (option) => (
    <div className="d-flex align-items-center justify-content-between">
      <span>{option.label}</span>
      {option.req_status === "Drafted" && (
        <span className="badge badge-warning ms-2" style={{ fontSize: "0.7rem" }}>Draft</span>
      )}
      {option.req_status === "Approved" && (
        <span className="badge badge-success ms-2" style={{ fontSize: "0.7rem" }}>Approved</span>
      )}
    </div>
  );

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
                <Link
                  id="collapse-header"
                  className={headerToggle ? "active" : ""}
                  onClick={() => dispatch(setToogleHeader(!headerToggle))}
                >
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
              <button
                type="button"
                className="btn btn-sm btn-outline-danger mt-2 align-self-start"
                onClick={handleDiscardDraft}
              >
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
                  <input
                    type="text"
                    className="form-control bg-light"
                    value={currentUser.warehouse_name}
                    readOnly
                    disabled
                  />
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
                    <Lock size={13} className="ms-1 text-warning" title="Pre-selected from requests page" />
                  )}
                </label>

                {isRequestLocked ? (
                  <>
                    <div className="d-flex align-items-center gap-2">
                      <input
                        type="text"
                        className="form-control bg-light"
                        value={formData.stock_request_id?.label || lockedRequest?.label || ""}
                        readOnly
                        disabled
                      />
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary text-nowrap"
                        onClick={() => {
                          setLockedRequest(null);
                          resetDraftState();
                          const cleared = { ...INITIAL_FORM, transport: formDataRef.current.transport };
                          setFormData(cleared);
                          formDataRef.current = cleared;
                          localStorage.removeItem("selected_stock_request");
                        }}
                      >
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
                      onChange={(opt) => {
                        resetDraftState();
                        const cleared = { ...INITIAL_FORM, transport: formDataRef.current.transport };
                        setFormData(cleared);
                        formDataRef.current = cleared;

                        if (opt) {
                          const next = { ...cleared, stock_request_id: opt };
                          setFormData(next);
                          formDataRef.current = next;
                          localStorage.setItem("selected_stock_request", JSON.stringify(opt));
                          restoreDraftByRequestId(opt.value);
                        } else {
                          localStorage.removeItem("selected_stock_request");
                        }
                        setLockedRequest(null);
                      }}
                      formatOptionLabel={formatRequestOption}
                      placeholder={reqDropdownLoading ? "Loading requests…" : "Select a stock request"}
                      isClearable
                      isLoading={reqDropdownLoading}
                      noOptionsMessage={() => reqDropdownLoading ? "Loading…" : "No approved requests found"}
                    />
                    <small className="text-muted">
                      Showing approved requests assigned to you —{" "}
                      <span className="badge badge-warning" style={{ fontSize: "0.65rem" }}>Draft</span>{" "}
                      = has saved products
                    </small>
                  </>
                )}
              </div>

              {/* Transport */}
              <div className="col-lg-6">
                <label className="form-label">
                  Transport <span className="text-danger">*</span>
                  {transportOptions.length === 0 && (
                    <span className="spinner-border spinner-border-sm ms-2" />
                  )}
                </label>
                <Select
                  options={transportOptions}
                  value={formData.transport}
                  onChange={(opt) => setField("transport", opt)}
                  placeholder={transportOptions.length === 0 ? "Loading…" : "Select transport method"}
                  isLoading={transportOptions.length === 0}
                />
                {transportOptions.length > 0 && !formData.transport && (
                  <small className="text-muted">
                    Defaults to <strong>{transportOptions[0]?.label}</strong> if not selected
                  </small>
                )}
              </div>
            </div>

            <div className="row mb-3">
              <div className="col-lg-6">
                <label className="form-label">
                  Description
                  {isSyncing && (
                    <span className="spinner-border spinner-border-sm ms-2 text-muted" style={{ width: "12px", height: "12px" }} />
                  )}
                </label>
                <textarea
                  className="form-control"
                  value={formData.description || ""}
                  onChange={handleDescriptionChange}
                  rows="2"
                  placeholder="Notes about this transfer…"
                />
                <small className="text-muted">Auto-saved after you stop typing</small>
              </div>
              <div className="col-lg-6">
                <label className="form-label">Total Transfer Quantity</label>
                <input
                  type="number"
                  className="form-control bg-light"
                  value={totalQty}
                  readOnly
                  disabled
                  style={{ fontWeight: "bold", fontSize: "1.1rem" }}
                />
                <small className="text-muted">Auto-calculated from scanned products</small>
              </div>
            </div>

            {/* Bill / Invoice */}
            <div className="row">
              <div className="col-lg-6">
                <label className="form-label">
                  <File size={16} className="me-1" />Bill / Invoice (Optional)
                  {isSyncing && billFileState.current && (
                    <span className="spinner-border spinner-border-sm ms-2 text-muted" style={{ width: "12px", height: "12px" }} />
                  )}
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
                    <input
                      ref={billFileRef}
                      type="file"
                      id="billFileInput"
                      className="d-none"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={handleBillChange}
                    />
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
                    ✓ Syncing invoice to draft…
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
                  {(isScanning || isSyncing) && (
                    <span className="spinner-border spinner-border-sm ms-2" />
                  )}
                </label>
                <input
                  ref={barcodeRef}
                  type="text"
                  className="form-control"
                  value={barcodeInput}
                  onChange={(e) => setBarcodeInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") { e.preventDefault(); handleScan(barcodeInput); }
                  }}
                  placeholder="Use scanner or type barcode then press Enter"
                  disabled={isScanning}
                  autoFocus
                />
              </div>
              <div className="col-lg-4">
                <button
                  type="button"
                  className="btn btn-primary w-100"
                  onClick={() => handleScan(barcodeInput)}
                  disabled={!barcodeInput.trim() || isScanning}
                >
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
                  {isSyncing && (
                    <span className="spinner-border spinner-border-sm ms-2 text-muted" style={{ width: "14px", height: "14px" }} />
                  )}
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleRemoveSelected(scannedProducts.map((p) => p.prod_uuid))}
                >
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
              <li>Total Transfer Quantity: {totalQty} units</li>
              {currentUser?.warehouse_name && <li>From: {currentUser.warehouse_name}</li>}
              {formData.stock_request_id   && <li>Stock Request: {formData.stock_request_id.label}</li>}
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
            <button
              type="button"
              className="btn btn-submit"
              onClick={handleSubmit}
              disabled={submitting || scannedProducts.length === 0 || !canSync}
            >
              {submitting
                ? <><span className="spinner-border spinner-border-sm me-2" />Submitting…</>
                : <><Send size={16} className="me-1" />Create Stock Flow</>}
            </button>
          </div>
        </div>
      </div>

      {/* Article Profile Picker Modal */}
      <Modal
        show={profileModal.open}
        onHide={() => {
          setProfileModal({ open: false, profiles: [], partial_code: "" });
          barcodeRef.current?.focus();
        }}
        centered
        size="sm"
      >
        <Modal.Header>
          <Modal.Title style={{ fontSize: "1rem" }}>
            <Package size={16} className="me-2 text-primary" />Select Article Profile
          </Modal.Title>
          <button
            className="btn-close"
            onClick={() => {
              setProfileModal({ open: false, profiles: [], partial_code: "" });
              barcodeRef.current?.focus();
            }}
          />
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted small mb-3">
            Barcode <strong>{profileModal.partial_code}</strong> matches multiple article profiles.
            Select one to add:
          </p>
          <div className="d-flex flex-column gap-2">
            {profileModal.profiles.map((profile) => (
              <button
                key={profile.article_profile_id}
                type="button"
                className="btn btn-outline-primary text-start w-100"
                style={{ padding: "10px 14px" }}
                onClick={async () => {
                  const code = profileModal.partial_code;
                  setProfileModal({ open: false, profiles: [], partial_code: "" });
                  await doScanAndAdd(code, profile.product_id);
                }}
              >
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