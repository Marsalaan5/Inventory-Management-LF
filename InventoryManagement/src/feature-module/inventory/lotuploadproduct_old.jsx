
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { all_routes } from "../../Router/all_routes";
import {
  ArrowLeft,
  ChevronUp,
  Camera,
  Trash2,
  Package,
  Save,
  X,
  Edit2,
  Check,
  RefreshCw,
  Info,
  File,
  Download,
} from "feather-icons-react/build/IconComponents";
import { OverlayTrigger, Tooltip, Modal, Badge } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import {
  scanProduct,
  clearScannedProduct,
} from "../../core/redux/slices/productSlice";
import AuthService from "../../services/authService";

const LotUploadInBulk = () => {
  const route = all_routes;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const MySwal = withReactContent(Swal);
  const barcodeInputRef = useRef(null);
  const invoiceInputRef = useRef(null);

  const data = useSelector((state) => state.toggle_header);
  const { user } = useSelector((state) => state.auth);

  const [articleProfiles, setArticleProfiles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [submitting, setSubmitting] = useState(false);


  const [currentLotId, setCurrentLotId] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [selectedArticleProfile, setSelectedArticleProfile] = useState(null);
  const [inWhLocation, setInWhLocation] = useState("");
  const [fromLocation, setFromLocation] = useState("");
  const [transport, setTransport] = useState(null);
  const [invoiceFile, setInvoiceFile] = useState(null);
  const [invoiceFileName, setInvoiceFileName] = useState("");
  const [existingInvoiceFile, setExistingInvoiceFile] = useState(null);
  
  const [productsInLot, setProductsInLot] = useState([]);
  const [productsByArticleAndStatus, setProductsByArticleAndStatus] = useState({});


  const [draftLots, setDraftLots] = useState([]);
  const [showDraftsModal, setShowDraftsModal] = useState(false);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);
  const [initialLoadDone, setInitialLoadDone] = useState(false);


  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanBuffer, setScanBuffer] = useState("");
  const [lastKeystroke, setLastKeystroke] = useState(0);
  

  const [currentStatus, setCurrentStatus] = useState({ value: "new", label: "New" });


  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState("");

  useEffect(() => {
    fetchArticleProfile();
    fetchWarehouse();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (user?.warehouse_id && warehouses.length > 0) {
      const userWarehouse = warehouses.find(w => w.value === user.warehouse_id);
      if (userWarehouse) {
        setSelectedWarehouse(userWarehouse);
      }
    }
    //eslint-disable-next-line
  }, [user, warehouses]);


  useEffect(() => {
    if (selectedWarehouse && !initialLoadDone) {
      loadLatestDraft();
      setInitialLoadDone(true);
    }
    //eslint-disable-next-line
  }, [selectedWarehouse]);


  useEffect(() => {
    if (currentLotId && productsInLot.length >= 0) {
      const timeoutId = setTimeout(() => {
        updateLotDraftInDB();
      }, 1000); 

      return () => clearTimeout(timeoutId);
    }
    //eslint-disable-next-line
  }, [productsInLot, currentStatus, inWhLocation, fromLocation, transport]);


  useEffect(() => {
    groupProductsByArticleAndStatus();
    //eslint-disable-next-line
  }, [productsInLot]);


  const groupProductsByArticleAndStatus = () => {
    const grouped = productsInLot.reduce((acc, product) => {
      const articleId = product.article_profile_id;
      const articleName = product.article_profile_name || "Unknown";
      const productStatus = product.status || "new";
      const inWhLocation = product.in_wh_location;
      const groupKey = `${articleId}_${productStatus}_${inWhLocation}`;

      if (!acc[groupKey]) {
        acc[groupKey] = {
          articleId,
          articleName,
          status: productStatus,
          inWhLocation,
          products: [],
        };
      }

      acc[groupKey].products.push(product);
      return acc;
    }, {});

    setProductsByArticleAndStatus(grouped);
  };


  const generateLotId = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const randomStr = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `LOT-${timestamp}-${randomStr}`;
  };

  // Handle invoice file selection
  const handleInvoiceFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        MySwal.fire({
          icon: "error",
          title: "File Too Large",
          text: "Invoice file must be less than 10MB",
          timer: 2000,
        });
        return;
      }


      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf', 
                           'application/msword'];
      
      if (!allowedTypes.includes(file.type)) {
        MySwal.fire({
          icon: "error",
          title: "Invalid File Type",
          text: "Only images, PDFs, and documents are allowed",
          timer: 2000,
        });
        return;
      }

      setInvoiceFile(file);
      setInvoiceFileName(file.name);
    }
  };


  const handleRemoveInvoiceFile = () => {
    setInvoiceFile(null);
    setInvoiceFileName("");
    if (invoiceInputRef.current) {
      invoiceInputRef.current.value = "";
    }
  };

  
  const createNewLot = async () => {
    if (!selectedArticleProfile || !selectedWarehouse) {
      MySwal.fire({
        icon: "error",
        title: "Configuration Required",
        text: "Please select Article Profile and Warehouse first",
        timer: 2000,
      });
      return null;
    }

    try {
      const newLotId = generateLotId();

      const formData = new FormData();
      formData.append('lot_id', newLotId);
      formData.append('article_profile_id', selectedArticleProfile.value);
      formData.append('warehouse_id', selectedWarehouse.value);
      formData.append('in_wh_location', inWhLocation || '');
      formData.append('from_location', fromLocation || '');
      formData.append('transport', transport?.value || '');
      formData.append('product_status', currentStatus.value);
      formData.append('total_products', 0);
      formData.append('products_draft', JSON.stringify([]));

      if (invoiceFile) {
        formData.append('invoice_file', invoiceFile);
      }

      const response = await AuthService.saveLot(formData);

      if (response.data.success) {
        setCurrentLotId(newLotId);
        setLastSavedTime(new Date());
        
        if (response.data.data.invoice_file) {
          setExistingInvoiceFile(response.data.data.invoice_file);
        }

        console.log('Lot created and saved to database:', newLotId);
        return newLotId;
      }
    } catch (error) {
      console.error("Error creating lot:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: error?.response?.data?.message || "Failed to create lot",
        timer: 2000,
      });
      return null;
    }
  };

  
  const updateLotDraftInDB = async () => {
    if (!currentLotId) return;

    try {
      setSavingDraft(true);

      const formData = new FormData();
      formData.append('lot_id', currentLotId);
      formData.append('article_profile_id', selectedArticleProfile?.value);
      formData.append('warehouse_id', selectedWarehouse.value);
      formData.append('in_wh_location', inWhLocation || '');
      formData.append('from_location', fromLocation || '');
      formData.append('transport', transport?.value || '');
      formData.append('product_status', currentStatus.value);
      formData.append('total_products', productsInLot.length);
      formData.append('products_draft', JSON.stringify(productsInLot));

      if (invoiceFile) {
        formData.append('invoice_file', invoiceFile);
      }

      const response = await AuthService.saveLot(formData);
      
      if (response.data.success) {
        setLastSavedTime(new Date());
        
        if (response.data.data.invoice_file && !existingInvoiceFile) {
          setExistingInvoiceFile(response.data.data.invoice_file);
        }
      }
    } catch (error) {
      console.error("Error updating lot draft:", error);
    } finally {
      setSavingDraft(false);
    }
  };


  const loadLatestDraft = async () => {
    setLoadingDrafts(true);
    try {
      const response = await AuthService.getLots({ status: 'draft' });
      if (response.data.success) {
        const drafts = response.data.data || [];
        setDraftLots(drafts);


        if (drafts.length > 0) {
          const latestDraft = drafts[0]; 
          await loadDraftLot(latestDraft.lot_id, true); 
        }
      }
    } catch (error) {
      console.error("Error loading draft lots:", error);
    } finally {
      setLoadingDrafts(false);
    }
  };


  const loadDraftLot = async (lotId, silent = false) => {
    try {
      const response = await AuthService.getLotById(lotId);

      if (response.data.success) {
        const lot = response.data.data.lot;
        const productsDraft = response.data.data.products_draft || [];

        const warehouse = warehouses.find(w => w.value === lot.warehouse_id);
        const articleProfile = articleProfiles.find(ap => ap.value === lot.article_profile_id);

        setCurrentLotId(lot.lot_id);
        setSelectedWarehouse(warehouse);
        setSelectedArticleProfile(articleProfile);
        setInWhLocation(lot.in_wh_location || "");
        setFromLocation(lot.from_location || "");
        setTransport(
          lot.transport ? transportOptions.find(t => t.value === lot.transport) : null
        );
        setCurrentStatus(
          statusOptions.find(s => s.value === lot.product_status) || statusOptions[0]
        );
        setExistingInvoiceFile(lot.invoice_file || null);

        // Load products from JSON
        setProductsInLot(productsDraft);
        setShowDraftsModal(false);

        if (!silent) {
          MySwal.fire({
            icon: "success",
            title: "Draft Loaded!",
            html: `
              <p><strong>Lot ID:</strong> ${lot.lot_id}</p>
              <p><strong>Products:</strong> ${productsDraft.length}</p>
              ${lot.invoice_file ? '<p class="text-success">✓ Invoice attached</p>' : ''}
            `,
            timer: 2000,
            showConfirmButton: false,
          });
        }
      }
    } catch (error) {
      console.error("Error loading draft lot:", error);
      if (!silent) {
        MySwal.fire({
          icon: "error",
          title: "Error",
          text: "Failed to load draft lot",
          timer: 2000,
        });
      }
    }
  };


  const deleteDraftLot = async (lotId) => {
    MySwal.fire({
      title: "Delete Draft Lot?",
      text: "This will permanently delete the lot and all its draft products",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await AuthService.deleteLot(lotId);

          if (response.data.success) {
            setDraftLots(prev => prev.filter(lot => lot.lot_id !== lotId));

            MySwal.fire({
              icon: "success",
              title: "Deleted!",
              text: "Draft lot has been deleted",
              timer: 1500,
              showConfirmButton: false,
            });

            if (currentLotId === lotId) {
              resetCurrentLot();
            }
          }
        } catch (error) {
          console.error("Error deleting draft lot:", error);
          MySwal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to delete draft lot",
            timer: 2000,
          });
        }
      }
    });
  };


  const resetCurrentLot = () => {
    setCurrentLotId(null);
    setSelectedArticleProfile(null);
    setInWhLocation("");
    setFromLocation("");
    setTransport(null);
    setCurrentStatus({ value: "new", label: "New" });
    setProductsInLot([]);
    setProductsByArticleAndStatus({});
    setBarcodeInput("");
    setInvoiceFile(null);
    setInvoiceFileName("");
    setExistingInvoiceFile(null);
    setLastSavedTime(null);
    if (invoiceInputRef.current) {
      invoiceInputRef.current.value = "";
    }
  };

  
  const startNewLot = () => {
    if (productsInLot.length > 0) {
      MySwal.fire({
        title: "Current Lot Saved",
        text: "Current lot is already saved as draft in database. Start a new lot?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, start new",
        cancelButtonText: "Cancel",
      }).then((result) => {
        if (result.isConfirmed) {
          resetCurrentLot();

          MySwal.fire({
            icon: "info",
            title: "New Lot",
            text: "Configure and start scanning",
            timer: 2000,
            showConfirmButton: false,
          });
        }
      });
    } else {
      resetCurrentLot();
    }
  };


  useEffect(() => {
    const handleKeyPress = (e) => {
      const currentTime = Date.now();
      const timeSinceLastKey = currentTime - lastKeystroke;

      if (timeSinceLastKey > 100 && scanBuffer.length > 0) {
        setScanBuffer("");
      }

      setLastKeystroke(currentTime);

      const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
      const isBarcodeInput = e.target.name === 'barcodeInput';

      if (isInput && !isBarcodeInput) return;

      if (e.key === 'Enter' && scanBuffer.length >= 8) {
        e.preventDefault();
        const scannedCode = scanBuffer.trim();
        setBarcodeInput(scannedCode);
        handleVerifyAndAddBarcode(scannedCode);
        setScanBuffer("");
        return;
      }

      if (e.key.length === 1) {
        setScanBuffer(prev => prev + e.key);
        setTimeout(() => setScanBuffer(""), 200);
      }
    };

    window.addEventListener('keypress', handleKeyPress);
    return () => window.removeEventListener('keypress', handleKeyPress);
    //eslint-disable-next-line
  }, [scanBuffer, lastKeystroke, productsInLot, selectedWarehouse, selectedArticleProfile, currentLotId]);


  const handleVerifyAndAddBarcode = async (barcode) => {
    if (!barcode.trim()) return;

    if (!selectedWarehouse) {
      MySwal.fire({
        icon: "warning",
        title: "Warehouse Required",
        text: "Warehouse must be selected",
        timer: 2000,
      });
      setBarcodeInput("");
      return;
    }

    if (!selectedArticleProfile) {
      MySwal.fire({
        icon: "warning",
        title: "Article Profile Required",
        text: "Please select an Article Profile first",
        timer: 2000,
      });
      setBarcodeInput("");
      return;
    }

    if (!inWhLocation || !inWhLocation.trim()) {
  MySwal.fire({
    icon: "warning",
    title: "WH Location Required",
    text: "Please enter In Warehouse Location before scanning",
    timer: 2000,
  });
  setBarcodeInput("");
  return;
}

    
    if (productsInLot.some(p => p.barcode === barcode.trim())) {
      MySwal.fire({
        icon: "warning",
        title: "Already in Lot",
        text: "This barcode is already added to the current lot",
        timer: 2000,
      });
      setBarcodeInput("");
      return;
    }

    setIsScanning(true);

    try {
      const response = await dispatch(scanProduct(barcode.trim())).unwrap();

      if (response.is_found === true) {
        const product = response.data;

        MySwal.fire({
          icon: "warning",
          title: "Product Already Exists",
          html: `
            <div style="text-align: left; padding: 20px;">
              <p><strong>Name:</strong> ${product.title || "N/A"}</p>
              <p><strong>Barcode:</strong> ${product.barcode}</p>
              <p><strong>Article Profile:</strong> ${product.article_profile_name || "N/A"}</p>
              <hr>
              <p class="text-danger">This product already exists in the database.</p>
            </div>
          `,
          showCancelButton: true,
          confirmButtonText: "OK",
          cancelButtonText: "View Product",
        }).then((result) => {
          if (result.dismiss === Swal.DismissReason.cancel) {
            navigate(route.productlist);
          }
        });

        setBarcodeInput("");
        return;
      }

      if (response.is_found === false) {
        

      
        let lotId = currentLotId;
        if (!lotId) {
          lotId = await createNewLot();
          if (!lotId) {
            setBarcodeInput("");
            return;
          }
        }

        const newProduct = {
          tempId: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          barcode: barcode.trim(),
          title: "",
          description: "",
          article_profile_id: selectedArticleProfile.value,
          article_profile_name: selectedArticleProfile.label,
          warehouse_id: selectedWarehouse.value,
          warehouse_name: selectedWarehouse.label,
          status: currentStatus.value,
          in_wh_location: inWhLocation, 
        };

        setProductsInLot(prev => [...prev, newProduct]);

    
        console.log(`Product added: ${barcode.trim()} (${productsInLot.length + 1} total)`);

        setBarcodeInput("");

  
        setTimeout(() => barcodeInputRef.current?.focus(), 100);
        return;
      }

      throw new Error("Unexpected scan response");

    } catch (error) {
      MySwal.fire({
        icon: "error",
        title: "Verification Failed",
        text: error?.message || "Unable to verify barcode",
      });

      setBarcodeInput("");
    } finally {
      dispatch(clearScannedProduct());
      setIsScanning(false);
    }
  };

  
  const handleInlineEditStart = (productId, field, currentValue) => {
    setEditingCell({ productId, field });
    setEditingValue(currentValue || "");
  };

  const handleInlineEditSave = () => {
    if (!editingCell) return;

    const updatedProducts = productsInLot.map(product => {
      if (product.tempId === editingCell.productId) {
        return {
          ...product,
          [editingCell.field]: editingValue.trim(),
        };
      }
      return product;
    });

    setProductsInLot(updatedProducts);
    setEditingCell(null);
    setEditingValue("");
  };

  const handleInlineEditCancel = () => {
    setEditingCell(null);
    setEditingValue("");
  };

  
  const handleRemoveProduct = (tempId) => {
    MySwal.fire({
      title: "Remove Product?",
      text: "This will remove the product from the lot",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, remove",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        setProductsInLot(prev => prev.filter(p => p.tempId !== tempId));

        MySwal.fire({
          icon: "success",
          title: "Removed!",
          timer: 1000,
          showConfirmButton: false,
        });
      }
    });
  };


  const handleSubmitLot = async () => {
    if (!currentLotId) {
      MySwal.fire({
        icon: "warning",
        title: "No Lot",
        text: "Please create a lot first by scanning a product",
        timer: 2000,
      });
      return;

    }

    if (productsInLot.length === 0) {
      MySwal.fire({
        icon: "warning",
        title: "No Products",
        text: "Please add at least one product before submitting",
        timer: 2000,
      });
      return;
    }

    const result = await MySwal.fire({
      title: "Submit Lot?",
      html: `
        <p><strong>Lot ID:</strong> ${currentLotId}</p>
        <p><strong>Total Products:</strong> ${productsInLot.length}</p>
        <p><strong>Groups:</strong> ${Object.keys(productsByArticleAndStatus).length} (by article + status)</p>
        ${existingInvoiceFile ? '<p class="text-success">✓ Invoice attached</p>' : ''}
        <p class="text-muted">This will create all products and finalize the lot</p>
      `,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, Submit",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;

    try {
      setSubmitting(true);

      const productsToSubmit = productsInLot.map(product => ({
        barcode: product.barcode,
        title: product.title || undefined,
        article_profile_id: product.article_profile_id,
        warehouse_id: product.warehouse_id,
        in_wh_location: inWhLocation || undefined,
        status: product.status,
        count: 1,
        description: product.description || undefined,
        last_updated_by: user?.id || 1,
      }));

      const response = await AuthService.bulkCreateProductsWithLot({
        products: productsToSubmit,
        lot_id: currentLotId,
      });

      if (response.data.success) {
        MySwal.fire({
          icon: "success",
          title: "Success!",
          html: `
            <p><strong>${productsInLot.length} products</strong> created successfully!</p>
            <p><strong>Lot ${currentLotId}</strong> finalized</p>
          `,
          timer: 3000,
          showConfirmButton: false,
        }).then(() => {
          resetCurrentLot();
          navigate(route.productlist);
        });
      }
    } catch (error) {
      console.error("Error submitting lot:", error);
      MySwal.fire({
        icon: "error",
        title: "Submission Failed",
        text: error?.response?.data?.message || "Failed to submit lot",
        timer: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const fetchArticleProfile = async () => {
    try {
      const res = await AuthService.getArticles();
      const formatted = res.data.data.map((item) => ({
        value: item.uuid,
        label: item.name || item.title,
      }));
      setArticleProfiles(formatted);
    } catch (error) {
      console.error("Failed to load Article Profile", error);
    }
  };

  const fetchWarehouse = async () => {
    try {
      const res = await AuthService.getWarehouse();
      const formatted = res.data.data.map((item) => ({
        value: item.id,
        label: item.name || item.title,
      }));
      setWarehouses(formatted);
    } catch (error) {
      console.error("Failed to load Warehouses", error);
    }
  };

  const statusOptions = [
    { value: "new", label: "New" },
    { value: "used", label: "Used" },
    { value: "repaired", label: "Repaired" },
    { value: "broken", label: "Broken" },
  ];

  const transportOptions = [
    { value: "bus", label: "Bus" },
    { value: "courier", label: "Courier" },
    { value: "employee", label: "Employee" },
    { value: "transport_co", label: "Transport Company" },
  ];

  const renderCollapseTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      Collapse
    </Tooltip>
  );

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'new': return 'success';
      case 'used': return 'primary';
      case 'repaired': return 'info';
      case 'broken': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Lot-Based Product Upload</h4>
              <h6>Database-Synced • Scan → Auto-Add → Edit → Submit</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <li>
              <div className="page-btn">
                <Link to={route.productlist} className="btn btn-secondary">
                  <ArrowLeft className="me-2" />
                  Back to Products
                </Link>
              </div>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                <Link
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  id="collapse-header"
                  className={data ? "active" : ""}
                  onClick={() => dispatch(setToogleHeader(!data))}
                >
                  <ChevronUp className="feather-chevron-up" />
                </Link>
              </OverlayTrigger>
            </li>
          </ul>
        </div>

        {/* Draft Lots Bar */}
        {draftLots.length > 1 && (
          <div className="alert alert-info d-flex align-items-center justify-content-between mb-3">
            <div className="d-flex align-items-center">
              <Package className="me-2" size={20} />
              <div>
                <strong>{draftLots.length - 1} Other Draft Lot(s) Available</strong>
              </div>
            </div>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => setShowDraftsModal(true)}
            >
              View All Drafts
            </button>
          </div>
        )}

        {/* Current Lot Info with Auto-Save Status */}
        {currentLotId && (
          <div className="alert alert-success d-flex align-items-center justify-content-between mb-3 border-success">
            <div className="d-flex align-items-center flex-grow-1">
              <Package className="me-2" size={24} />
              <div className="flex-grow-1">
                <h6 className="mb-0"><strong>Active Lot: {currentLotId}</strong></h6>
                <small className="text-muted">
                  {selectedWarehouse?.label} • {productsInLot.length} products • {Object.keys(productsByArticleAndStatus).length} groups
                  {savingDraft && <span className="text-warning ms-2">⏳ Saving...</span>}
                  {!savingDraft && lastSavedTime && (
                    <span className="text-success ms-2">
                      ✓ Saved {new Date(lastSavedTime).toLocaleTimeString()}
                    </span>
                  )}
                </small>
              </div>
            </div>
            <div className="d-flex gap-2">
              {productsInLot.length > 0 && (
                <button
                  className="btn btn-sm btn-success"
                  onClick={handleSubmitLot}
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : `Submit (${productsInLot.length})`}
                </button>
              )}
              <button
                className="btn btn-sm btn-warning"
                onClick={startNewLot}
              >
                <RefreshCw size={14} className="me-1" />
                New Lot
              </button>
            </div>
          </div>
        )}

        {/* Guide Alert */}
        <div className="alert alert-light border d-flex align-items-start mb-3">
          <Info className="me-2 mt-1" size={20} />
          <div>
            <strong>How it works:</strong>
            <ol className="mb-0 mt-1 ps-3 small">
              <li>Latest draft auto-loaded on page load - continue where you left off</li>
              <li>Configure: Article Profile + Locations + Transport + Invoice (optional)</li>
              <li>Upload invoice file (optional) - images, PDFs, documents supported</li>
              <li>Select current status → Products will be added with this status</li>
              <li>Scan barcode → Auto-creates lot and saves to database</li>
              <li>All changes auto-saved to database every second</li>
              <li>Switch devices or browsers - your work is preserved</li>
              <li>Submit once → Creates all products in single lot</li>
            </ol>
          </div>
        </div>

        {/* Lot Configuration */}
        <div className="card mb-3">
          <div className="card-body">
            <h5 className="mb-3">
              <Package size={20} className="me-2" />
              {currentLotId ? `Lot: ${currentLotId}` : "Lot Configuration"}
            </h5>

            <div className="row">
              {/* Warehouse */}
              <div className="col-lg-3">
                <div className="mb-3">
                  <label className="form-label">
                    Warehouse <span className="text-danger">*</span>
                  </label>
                  {user?.warehouse_id ? (
                    <input
                      type="text"
                      className="form-control"
                      value={selectedWarehouse?.label || "Loading..."}
                      disabled
                    />
                  ) : (
                    <Select
                      className="select"
                      options={warehouses}
                      placeholder="Choose Warehouse"
                      value={selectedWarehouse}
                      onChange={setSelectedWarehouse}
                      isDisabled={currentLotId !== null}
                    />
                  )}
                  {currentLotId && (
                    <small className="text-muted">🔒 Locked for this lot</small>
                  )}
                </div>
              </div>

                  {/* From Location */}
              <div className="col-lg-3">
                <div className="mb-3">
                  <label className="form-label">From Location (Optional)</label>
                  <input
                    type="text"
                    className="form-control"
                    value={fromLocation}
                    onChange={(e) => setFromLocation(e.target.value)}
                    placeholder="e.g., Supplier, Delhi"
                    disabled={currentLotId !== null}
                  />
                  {currentLotId && (
                    <small className="text-muted">🔒 Locked for this lot</small>
                  )}
                </div>
              </div>

            

                {/* Invoice File Upload - NO INVOICE NUMBER */}
              <div className="col-lg-3">
                <div className="mb-3">
                  <label className="form-label">Invoice Upload (Optional)</label>
                  
                  {existingInvoiceFile ? (
                    <div className="border rounded p-2 bg-light">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center">
                          <File size={16} className="me-2 text-success" />
                          <small className="text-success">Invoice uploaded</small>
                        </div>
                        <a
                          href={existingInvoiceFile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-sm btn-link p-0"
                          title="View Invoice"
                        >
                          <Download size={16} />
                        </a>
                      </div>
                    </div>
                  ) : invoiceFileName ? (
                    <div className="border rounded p-2 bg-light">
                      <div className="d-flex align-items-center justify-content-between">
                        <div className="d-flex align-items-center text-truncate flex-grow-1">
                          <File size={16} className="me-2 text-primary" />
                          <small className="text-truncate">{invoiceFileName}</small>
                        </div>
                        <button
                          type="button"
                          className="btn btn-sm btn-link text-danger p-0 ms-2"
                          onClick={handleRemoveInvoiceFile}
                          title="Remove file"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <input
                        ref={invoiceInputRef}
                        type="file"
                        className="form-control"
                        accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.xls,.xlsx"
                        onChange={handleInvoiceFileChange}
                        disabled={currentLotId !== null}
                      />
                      <small className="text-muted">
                        PDF, Images, Documents (max 10MB)
                      </small>
                    </div>
                  )}
                  
                  {currentLotId && !existingInvoiceFile && (
                    <small className="text-muted d-block mt-1">🔒 Locked for this lot</small>
                  )}
                </div>
              </div>

               {/* Transport */}
              <div className="col-lg-3">
                <div className="mb-3">
                  <label className="form-label">Transport (Optional)</label>
                  <Select
                    className="select"
                    options={transportOptions}
                    value={transport}
                    onChange={setTransport}
                    placeholder="Select transport"
                    isClearable
                    isDisabled={currentLotId !== null}
                  />
                  {currentLotId && (
                    <small className="text-muted">🔒 Locked for this lot</small>
                  )}
                </div>
              </div>

                {/* Current Article Profile */}
              <div className="col-lg-3">
                <div className="mb-3">
                  <label className="form-label">
                    Current Article <span className="text-danger">*</span>
                  </label>
                  <Select
                    className="select"
                    options={articleProfiles}
                    placeholder="Choose Article"
                    value={selectedArticleProfile}
                    onChange={setSelectedArticleProfile}
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: selectedArticleProfile ? '#28a745' : base.borderColor,
                        borderWidth: selectedArticleProfile ? '2px' : '1px',
                      })
                    }}
                  />
                  <small className="text-success">
                    {selectedArticleProfile
                      ? "✓ Products will be added to this article"
                      : "Select to start scanning"}
                  </small>
                </div>
              </div>

              {/* Current Status Selector */}
              <div className="col-lg-3">
                <div className="mb-3">
                  <label className="form-label">
                    Current Status <span className="text-danger">*</span>
                  </label>
                  <Select
                    className="select"
                    options={statusOptions}
                    value={currentStatus}
                    onChange={setCurrentStatus}
                    styles={{
                      control: (base) => ({
                        ...base,
                        borderColor: '#ffc107',
                        borderWidth: '2px',
                      })
                    }}
                  />
                  <small className="text-warning">
                    ⚠️ New products will use this status
                  </small>
                </div>
              </div>

             

       
              <div className="col-lg-3">
                <div className="mb-3">
                  <label className="form-label">In WH Location</label>
                  <input
                    type="text"
                     className="form-control"
                    value={inWhLocation}
                    onChange={(e) => setInWhLocation(e.target.value)}
                    placeholder="e.g., A-12, Shelf-5"
                  />
                  <small className="text-muted">Can be changed anytime</small>
                </div>
              </div>

          

            
            </div>
          </div>
        </div>

        {/* Scanner Section */}
        {selectedWarehouse && selectedArticleProfile && (
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="mb-0">
                  <Camera size={20} className="me-2" />
                  Scan & Add to: <Badge bg="success">{selectedArticleProfile.label}</Badge> 
                  {" + "}
                  <Badge bg={getStatusBadgeColor(currentStatus.value)}>{currentStatus.label}</Badge>
                  {" + "}
                  <Badge bg="success">{inWhLocation || "No Location" }</Badge>
                </h5>
                {!currentLotId && (
                  <small className="text-muted">
                    Lot will be auto-created and saved on first scan
                  </small>
                )}
              </div>

              <div className="row align-items-end">
                <div className="col-lg-12">
                  <label className="form-label">
                    Barcode <span className="text-danger">*</span>
                    {isScanning && <span className="spinner-border spinner-border-sm ms-2" />}
                  </label>
                  <input
                    ref={barcodeInputRef}
                    type="text"
                    className="form-control"
                    name="barcodeInput"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleVerifyAndAddBarcode(barcodeInput);
                      }
                    }}
                    placeholder="Scan or type barcode and press Enter"
                    disabled={isScanning}
                    autoFocus
                  />
                  <small className="text-muted">
                    ℹ️ Product auto-added silently • Lot auto-created • All saved to database
                  </small>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Products Display - Grouped by Article AND Status */}
        {currentLotId && productsInLot.length > 0 && (
          <div className="card">
            <div className="card-body">
              <h5 className="mb-4">
                Products in Lot ({productsInLot.length}) - {Object.keys(productsByArticleAndStatus).length} Groups
                {savingDraft && (
                  <span className="spinner-border spinner-border-sm ms-2" role="status">
                    <span className="visually-hidden">Saving...</span>
                  </span>
                )}
              </h5>

              {Object.entries(productsByArticleAndStatus).map(([groupKey, group]) => {
                const isCurrentGroup = 
                  selectedArticleProfile?.value === group.articleId && 
                  currentStatus.value === group.status && inWhLocation === group.inWhLocation;
                return (
                  <div key={groupKey} className="mb-4">
                    <div className={`card ${isCurrentGroup ? 'border-warning border-2' : 'border'}`}>
                      <div className={`card-header ${isCurrentGroup ? 'bg-warning bg-opacity-10' : 'bg-light'}`}>
                        <div className="d-flex align-items-center justify-content-between">
                          <h6 className="mb-0">
                            <Info size={18} className="me-2" />
                            {group.articleName}
                            <Badge bg={getStatusBadgeColor(group.status)} className="ms-2">
                              {group.status.toUpperCase()}
                            </Badge>
                            <Badge bg="success" className="ms-2">
                              
                              {group.inWhLocation}
                            </Badge>
                            <Badge bg="primary" className="ms-2">
                              {group.products.length} Products
                            </Badge>
                            {isCurrentGroup && (
                              <Badge bg="warning" className="ms-2 text-dark">
                                ✓ Currently Adding
                              </Badge>
                            )}
                          </h6>
                        </div>
                      </div>
                      <div className="card-body p-0">
                        <div className="table-responsive">
                          <table className="table table-hover mb-0">
                            <tbody>
                              {group.products.map((product) => (
                                <tr key={product.tempId}>
                                  <td width="20%">
                                    <Badge bg="secondary">{product.barcode}</Badge>
                                  </td>
                                  <td width="35%">
                                    {editingCell?.productId === product.tempId && editingCell?.field === 'title' ? (
                                      <div className="d-flex align-items-center gap-2">
                                        <input
                                          type="text"
                                          className="form-control form-control-sm"
                                          value={editingValue}
                                          onChange={(e) => setEditingValue(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Enter') handleInlineEditSave();
                                            if (e.key === 'Escape') handleInlineEditCancel();
                                          }}
                                          placeholder="Product Name"
                                          autoFocus
                                        />
                                        <button
                                          className="btn btn-sm btn-success"
                                          onClick={handleInlineEditSave}
                                        >
                                          <Check size={14} />
                                        </button>
                                        <button
                                          className="btn btn-sm btn-danger"
                                          onClick={handleInlineEditCancel}
                                        >
                                          <X size={14} />
                                        </button>
                                      </div>
                                    ) : (
                                      <div
                                        className="d-flex align-items-center justify-content-between"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleInlineEditStart(product.tempId, 'title', product.title)}
                                        title="Click to edit"
                                      >
                                        <span className={product.title ? '' : 'text-muted fst-italic'}>
                                          {product.title || 'Click to add Product Name (optional)'}
                                        </span>
                                        <Edit2 size={14} className="text-muted" />
                                      </div>
                                    )}
                                  </td>
                                  <td width="40%">
                                    {editingCell?.productId === product.tempId && editingCell?.field === 'description' ? (
                                      <div className="d-flex align-items-center gap-2">
                                        <textarea
                                          className="form-control form-control-sm"
                                          value={editingValue}
                                          onChange={(e) => setEditingValue(e.target.value)}
                                          onKeyDown={(e) => {
                                            if (e.key === 'Escape') handleInlineEditCancel();
                                          }}
                                          placeholder="Description"
                                          rows={2}
                                          autoFocus
                                        />
                                        <div className="d-flex flex-column gap-1">
                                          <button
                                            className="btn btn-sm btn-success"
                                            onClick={handleInlineEditSave}
                                          >
                                            <Check size={14} />
                                          </button>
                                          <button
                                            className="btn btn-sm btn-danger"
                                            onClick={handleInlineEditCancel}
                                          >
                                            <X size={14} />
                                          </button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div
                                        className="d-flex align-items-center justify-content-between"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => handleInlineEditStart(product.tempId, 'description', product.description)}
                                        title="Click to edit"
                                      >
                                        <span className={`text-truncate ${product.description ? '' : 'text-muted fst-italic'}`} style={{ maxWidth: '90%' }}>
                                          {product.description || 'Click to add description (optional)'}
                                        </span>
                                        <Edit2 size={14} className="text-muted" />
                                      </div>
                                    )}
                                  </td>
                                  <td width="5%" className="text-center">
                                    <button
                                      className="btn btn-sm btn-danger"
                                      onClick={() => handleRemoveProduct(product.tempId)}
                                      title="Remove"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="text-center text-muted">
                <small>
                  <Info size={14} className="me-1" />
                  All changes auto-saved to database • Change status selector to add products with different status
                </small>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!currentLotId && productsInLot.length === 0 && (
          <div className="card">
            <div className="card-body text-center py-5">
              <Camera size={48} className="text-muted mb-3" />
              <h5>Ready to Start</h5>
              <p className="text-muted">
                {!selectedWarehouse || !selectedArticleProfile
                  ? 'Configure Article Profile and Warehouse to begin'
                  : 'Scan your first product - lot will be auto-created and saved'}
              </p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="col-lg-12 mt-3">
          <div className="btn-addproduct mb-4">
            <Link to={route.productlist} className="btn btn-cancel me-2">
              Cancel
            </Link>
            {currentLotId && productsInLot.length > 0 && (
              <button
                type="button"
                className="btn btn-submit"
                onClick={handleSubmitLot}
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Save className="me-2" size={16} />
                    Submit Entire Lot ({productsInLot.length} products)
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Draft Lots Modal */}
      <Modal show={showDraftsModal} onHide={() => setShowDraftsModal(false)} size="xl">
        <Modal.Header>
          <Modal.Title>All Draft Lots ({draftLots.length})</Modal.Title>
          <button className="btn-close" onClick={() => setShowDraftsModal(false)}>
            <X />
          </button>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
          {loadingDrafts ? (
            <div className="text-center p-5">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : draftLots.length === 0 ? (
            <div className="text-center p-5">
              <p className="text-muted">No draft lots found</p>
            </div>
          ) : (
            draftLots.map((lot) => (
              <div key={lot.lot_id} className="card mb-3">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <div>
                    <strong className="text-primary">{lot.lot_id}</strong>
                    {currentLotId === lot.lot_id && (
                      <Badge bg="success" className="ms-2">Currently Active</Badge>
                    )}
                    <br />
                    <small className="text-muted">
                      {lot.warehouse_name} • {lot.draft_products_count || 0} draft products
                      {lot.from_location && ` • From: ${lot.from_location}`}
                      {lot.transport && ` • Transport: ${lot.transport}`}
                      {lot.invoice_file && <span className="text-success ms-2">📎 Invoice</span>}
                    </small>
                    <br />
                    <small className="text-muted">
                      Created: {new Date(lot.created_at).toLocaleString()}
                      {lot.updated_at && ` • Updated: ${new Date(lot.updated_at).toLocaleString()}`}
                    </small>
                  </div>
                  <div className="d-flex gap-2">
                    {currentLotId !== lot.lot_id && (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => loadDraftLot(lot.lot_id, false)}
                      >
                        Load
                      </button>
                    )}
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => deleteDraftLot(lot.lot_id)}
                      disabled={currentLotId === lot.lot_id}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default LotUploadInBulk;