


import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { all_routes } from "../../Router/all_routes";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Info,
  Camera,
  CheckCircle,
  AlertCircle,
} from "feather-icons-react/build/IconComponents";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import { createProduct, scanProduct, clearScannedProduct, resetCreateStatus } from "../../core/redux/slices/productSlice";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import AuthService from "../../services/authService";

const AddProduct = () => {
  const route = all_routes;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const MySwal = withReactContent(Swal);

  const data = useSelector((state) => state.toggle_header);
  const { user } = useSelector((state) => state.auth);
  const { createStatus, error } = useSelector((state) => state.products);

  const [articleProfiles, setArticleProfiles] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [barcodeVerified, setBarcodeVerified] = useState(false);
  const [scanBuffer, setScanBuffer] = useState("");
  const [lastKeystroke, setLastKeystroke] = useState(0);
  const [existingProduct, setExistingProduct] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    article_profile_id: null,
    warehouse_id: null,
    in_wh_locn: "",
    status: { value: "new", label: "New" },
    count: 1,
    description: "",
  });

  useEffect(() => {
    dispatch(resetCreateStatus());
    fetchArticleProfile();
    fetchWarehouse();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (location.state?.barcode) {
      setBarcodeInput(location.state.barcode);
      handleVerifyBarcode(location.state.barcode);
    }
    //eslint-disable-next-line
  }, [location.state]);


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
        handleVerifyBarcode(scannedCode);
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
  }, [scanBuffer, lastKeystroke]);



const handleVerifyBarcode = async (barcode) => {
  if (!barcode.trim()) return;

  setIsScanning(true);
  setBarcodeVerified(false);
  setExistingProduct(null);

  try {
    const response = await dispatch(
      scanProduct(barcode.trim())
    ).unwrap();

    console.log("scan+++++++++++++++++++", response);

    if (response.is_found === false) {
   
      setBarcodeVerified(true);
      setExistingProduct(null);

      MySwal.fire({
        icon: "success",
        title: "✓ Ready to Add",
        text: `New product with barcode: ${barcode}`,
        timer: 2000,
        showConfirmButton: false,
      });

      return;
    }

   
    if (response.is_found === true) {
      const product = response.data;

      setExistingProduct(product);
      setBarcodeVerified(false);

      MySwal.fire({
        icon: "warning",
        title: "Product Already Exists",
        html: `
          <div style="text-align: left; padding: 20px;">
            <p><strong>Name:</strong> ${product.title || "N/A"}</p>
            <p><strong>Barcode:</strong> ${product.barcode}</p>
            <p><strong>Article Profile:</strong> ${product.article_profile_name || "N/A"}</p>
            <p><strong>Warehouse:</strong> ${product.warehouse_name || "N/A"}</p>
            <p><strong>Quantity:</strong> ${product.count || 0}</p>
            <hr>
            <p class="text-danger"><strong>This product cannot be added again.</strong></p>
            <p class="text-muted">You can only view or edit the existing product.</p>
          </div>
        `,
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: "Edit Product",
        denyButtonText: "View Product List",
        cancelButtonText: "Cancel",
      });

      return;
    }


    throw new Error("Unexpected scan response");

  } catch (error) {

    MySwal.fire({
      icon: "error",
      title: "Invalid Barcode",
      text: error?.message || "Unable to verify barcode",
    });
    setBarcodeInput("");
  } finally {
    dispatch(clearScannedProduct());
    setIsScanning(false);
  }
};



  const handleBarcodeInputChange = (e) => {
    const value = e.target.value;
    setBarcodeInput(value);
    setBarcodeVerified(false);
    setExistingProduct(null);
  };

  useEffect(() => {
    if (createStatus === 'succeeded') {
      MySwal.fire({
        icon: "success",
        title: "Success!",
        text: "Product created successfully",
        timer: 2000,
        showConfirmButton: false,
      }).then(() => {
        dispatch(resetCreateStatus());
        navigate(route.productlist);
      });
    } else if (createStatus === 'failed') {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: error || "Failed to create product",
        timer: 3000,
      });
      dispatch(resetCreateStatus());
    }
    //eslint-disable-next-line
  }, [createStatus, error]);

  const renderCollapseTooltip = (props) => (
    <Tooltip id="refresh-tooltip" {...props}>
      Collapse
    </Tooltip>
  );

  const fetchArticleProfile = async () => {
    try {
      const res = await AuthService.getUnfilteredArticles();
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
        value: item.wh_uuid,
        label: item.name || item.title,
      }));
      setWarehouses(formatted);
    } catch (error) {
      console.error("Failed to load Warehouses", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (name, option) => {
    setFormData((prev) => ({
      ...prev,
      [name]: option,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
  
    if (existingProduct) {
      MySwal.fire({
        icon: "error",
        title: "Cannot Add Duplicate",
        text: "This barcode already exists. Please edit the existing product instead.",
        confirmButtonText: "Go to Edit",
      }).then((result) => {
        if (result.isConfirmed) {
          navigate(route.productlist, { 
            state: { 
              editProductId: existingProduct.prod_uuid,
              openEditModal: true 
            } 
          });
        }
      });
      return;
    }
  
    if (!formData.article_profile_id) {
      MySwal.fire({
        icon: "warning",
        title: "Error",
        text: "Article Profile is required",
        timer: 2000,
      });
      return;
    }
  
    if (!formData.warehouse_id) {
      MySwal.fire({
        icon: "warning",
        title: "Error",
        text: "Warehouse is required",
        timer: 2000,
      });
      return;
    }
  
    try {
      setSubmitting(true);
  
      const dataToSubmit = {
        title: formData.title || undefined,
        article_profile_id: formData.article_profile_id.value,
        warehouse_id: formData.warehouse_id.value,
        in_wh_location: formData.in_wh_locn || undefined,
        count: parseInt(formData.count) || 0,
        status: formData.status?.value || "new",
        description: formData.description || undefined,
        last_updated_by: user?.id || "System",
        barcode: barcodeInput.trim() || undefined,
      };
  
      console.log("Submitting product:", dataToSubmit);
      await dispatch(createProduct(dataToSubmit)).unwrap();
  
    } catch (error) {
      console.error("Error creating product:", error);
      
      
      if (error?.message?.includes("barcode already exists") || 
          error?.includes("already exists")) {
        MySwal.fire({
          icon: "error",
          title: "Duplicate Barcode",
          html: `
            <p>This barcode is already in use.</p>
            <p class="text-muted">You can only edit the existing product.</p>
          `,
          confirmButtonText: "Go to Product List",
        }).then((result) => {
          if (result.isConfirmed) {
            navigate(route.productlist);
          }
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const statusOptions = [
    { value: "new", label: "New" },
    { value: "used", label: "Used" },
    { value: "repaired", label: "Repaired" },
    { value: "broken", label: "Broken" },
    { value: "installed", label: "Installed" },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>New Product</h4>
              <h6>Create new product - Scan barcode anywhere</h6>
            </div>
          </div>
          <ul className="table-top-head">
            <li>
              <div className="page-btn">
                <Link to={route.productlist} className="btn btn-secondary">
                  <ArrowLeft className="me-2" />
                  Back to Product
                </Link>
              </div>
            </li>
            <li>
              <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
                <Link
                  data-bs-toggle="tooltip"
                  data-bs-placement="top"
                  title="Collapse"
                  id="collapse-header"
                  className={data ? "active" : ""}
                  onClick={() => {
                    dispatch(setToogleHeader(!data));
                  }}
                >
                  <ChevronUp className="feather-chevron-up" />
                </Link>
              </OverlayTrigger>
            </li>
          </ul>
        </div>

        <div className="alert alert-info d-flex align-items-center mb-3" role="alert">
          <Camera className="me-2" size={20} />
          <div>
            <strong>Barcode Scanner Active!</strong> Scan any barcode to automatically check for duplicates. 
            The system will alert you if the product already exists.
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex align-items-center mb-3">
                <Camera size={24} className="text-primary me-2" />
                <h5 className="mb-0">Barcode Verification</h5>
              </div>
              
              <div className="row align-items-end">
                <div className="col-lg-8">
                  <label className="form-label">
                    Scan or Enter Barcode (Optional)
                    {barcodeVerified && (
                      <CheckCircle size={16} className="text-success ms-2" />
                    )}
                    {existingProduct && (
                      <AlertCircle size={16} className="text-warning ms-2" />
                    )}
                    {isScanning && (
                      <span className="spinner-border spinner-border-sm ms-2" role="status" />
                    )}
                  </label>
                  <input
                    type="text"
                    className={`form-control ${barcodeVerified ? 'is-valid' : ''} ${existingProduct ? 'is-invalid' : ''}`}
                    name="barcodeInput"
                    value={barcodeInput}
                    onChange={handleBarcodeInputChange}
                    placeholder="Use scanner or type barcode"
                    disabled={isScanning}
                  />
                  {barcodeVerified && (
                    <div className="form-text text-success">
                      <CheckCircle size={14} className="me-1" />
                      Barcode verified - Ready to use
                    </div>
                  )}
                  {existingProduct && (
                    <div className="form-text text-warning">
                      <AlertCircle size={14} className="me-1" />
                      Product exists but you can still add it
                    </div>
                  )}
                  {barcodeInput && !barcodeVerified && !existingProduct && !isScanning && (
                    <div className="form-text text-muted">
                      <AlertCircle size={14} className="me-1" />
                      Click "Check Barcode" to verify
                    </div>
                  )}
                </div>
                <div className="col-lg-4">
                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={() => handleVerifyBarcode(barcodeInput)}
                    disabled={!barcodeInput.trim() || isScanning}
                  >
                    {isScanning ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Camera size={16} className="me-2" />
                        Check Barcode
                      </>
                    )}
                  </button>
                </div>
              </div>
              
              <div className="alert alert-light mt-3 mb-0 border">
                <small className="text-muted">
                  <strong>💡 How it works:</strong>
                  <ul className="mb-0 mt-2">
                    <li>Scan with your barcode scanner - it will automatically populate and check</li>
                    <li>If product exists: You'll see details and can choose to view or add anyway</li>
                    <li>If new: You'll get confirmation to proceed</li>
                    <li>Leave blank to auto-generate a barcode based on product title</li>
                  </ul>
                </small>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-body add-product pb-0">
              <div className="accordion-card-one accordion" id="accordionExample">
                <div className="accordion-item">
                  <div className="accordion-header" id="headingOne">
                    <div
                      className="accordion-button"
                      data-bs-toggle="collapse"
                      data-bs-target="#collapseOne"
                      aria-controls="collapseOne"
                    >
                      <div className="addproduct-icon">
                        <h5>
                          <Info className="add-info" />
                          <span>Product Information</span>
                        </h5>
                        <Link to="#">
                          <ChevronDown className="chevron-down-add" />
                        </Link>
                      </div>
                    </div>
                  </div>
{/* */}
                  <div
                    id="collapseOne"
                    className="accordion-collapse collapse show"
                    aria-labelledby="headingOne"
                    data-bs-parent="#accordionExample"
                  >
                    <div className="accordion-body">
                      <div className="row">
                        <div className="col-lg-4 col-sm-6 col-12">
                          <div className="mb-3 add-product">
                            <label className="form-label">
                              Article Profile <span className="text-danger">*</span>
                            </label>
                            <Select
                              className="select"
                              options={articleProfiles}
                              placeholder="Choose Article Profile"
                              value={formData.article_profile_id}
                              onChange={(option) => handleSelectChange("article_profile_id", option)}
                            />
                          </div>
                        </div>
                        <div className="col-lg-4 col-sm-6 col-12">
                          <div className="mb-3 add-product">
                            <label className="form-label">
                              Warehouse <span className="text-danger">*</span>
                            </label>
                            <Select
                              className="select"
                              options={warehouses}
                              placeholder="Choose Warehouse"
                              value={formData.warehouse_id}
                              onChange={(option) => handleSelectChange("warehouse_id", option)}
                            />
                          </div>
                        </div>
                        <div className="col-lg-4 col-sm-6 col-12">
                          <div className="mb-3 add-product">
                            <label className="form-label">In WH Location</label>
                            <input
                              type="text"
                              className="form-control"
                              name="in_wh_locn"
                              value={formData.in_wh_locn}
                              onChange={handleInputChange}
                              placeholder="Enter location"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-4 col-sm-6 col-12">
                          <div className="mb-3 add-product">
                            <label className="form-label">
                              Product Name (Unique)
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              name="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              placeholder="Enter product name"
                            />
                            <small className="form-text text-muted">
                              Used to generate barcode if none is scanned
                            </small>
                          </div>
                        </div>
                        {/* <div className="col-lg-4 col-sm-6 col-12">
                          <div className="mb-3 add-product">
                            <label className="form-label">Quantity</label>
                            <input
                              type="number"
                              className="form-control"
                              name="count"
                              value={formData.count}
                              onChange={handleInputChange}
                              placeholder="Enter quantity"
                              min="1"
                            />
                          </div>
                        </div> */}
                        <div className="col-lg-4 col-sm-6 col-12">
  <div className="mb-3 add-product">
    <label className="form-label">Quantity</label>
    <div className="form-control">
      1
    </div>
  </div>
</div>

                        <div className="col-lg-4 col-sm-6 col-12">
                          <div className="mb-3 add-product">
                            <label className="form-label">Status</label>
                            <Select
                              className="select"
                              options={statusOptions}
                              placeholder="Choose Status"
                              value={formData.status}
                              onChange={(option) => handleSelectChange("status", option)}
                            />
                          </div>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <div className="input-blocks summer-description-box transfer mb-3">
                          <label>Description</label>
                          <textarea
                            className="form-control h-100"
                            rows={5}
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            placeholder="Enter product description"
                          />
                          <p className="mt-1">Maximum 500 Characters</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-12">
            <div className="btn-addproduct mb-4">
              <Link to={route.productlist} className="btn btn-cancel me-2" type="button">
                Cancel
              </Link>
              <button type="submit" className="btn btn-submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Creating...
                  </>
                ) : (
                  "Save Product"
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;




//with Add multiple product - Start

// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Select from "react-select";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import { all_routes } from "../../Router/all_routes";
// import {
//   ArrowLeft,
//   // ChevronDown,
//   ChevronUp,
//   // Info,
//   Camera,
//   // CheckCircle,
//   // AlertCircle,
//   Trash2,
//   Package,
//   Save,
//   PlusCircle,
//   X,
//   Edit,
// } from "feather-icons-react/build/IconComponents";
// import { OverlayTrigger, Tooltip, Modal, Badge } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import { setToogleHeader } from "../../core/redux/action";
// import { 
//   scanProduct, 
//   clearScannedProduct, 
//   bulkCreateProducts,
//   resetBulkCreateStatus 
// } from "../../core/redux/slices/productSlice";
// import AuthService from "../../services/authService";

// const STORAGE_KEY = "product_lots_draft";

// const AddProduct = () => {
//   const route = all_routes;
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   // const location = useLocation();
//   const MySwal = withReactContent(Swal);

//   const data = useSelector((state) => state.toggle_header);
//   const { user } = useSelector((state) => state.auth);
//   const { bulkCreateStatus, error } = useSelector((state) => state.products);

//   const [articleProfiles, setArticleProfiles] = useState([]);
//   const [warehouses, setWarehouses] = useState([]);
//   const [submitting, setSubmitting] = useState(false);

//   // Lot Management State
//   const [lots, setLots] = useState([]);
//   const [showLotsModal, setShowLotsModal] = useState(false);

//   // Current Lot Selection
//   const [selectedArticleProfile, setSelectedArticleProfile] = useState(null);
//   const [selectedWarehouse, setSelectedWarehouse] = useState(null);

//   // Barcode Scanning State
//   const [barcodeInput, setBarcodeInput] = useState("");
//   const [isScanning, setIsScanning] = useState(false);
//   const [scanBuffer, setScanBuffer] = useState("");
//   const [lastKeystroke, setLastKeystroke] = useState(0);

//   // Current Product Being Added
//   const [currentProduct, setCurrentProduct] = useState({
//     title: "",
//     in_wh_locn: "",
//     status: { value: "new", label: "New" },
//     description: "",
//   });

//   // Products in Current Lot
//   const [productsInLot, setProductsInLot] = useState([]);

//   // Edit Product in Lot
//   const [editingProductIndex, setEditingProductIndex] = useState(null);
//   const [showEditProductModal, setShowEditProductModal] = useState(false);
//   const [editingProductData, setEditingProductData] = useState(null);

//   // Load saved lots from localStorage on mount
//   useEffect(() => {
//     const savedLots = localStorage.getItem(STORAGE_KEY);
//     if (savedLots) {
//       try {
//         const parsed = JSON.parse(savedLots);
//         setLots(parsed);
//         MySwal.fire({
//           icon: "info",
//           title: "Draft Restored",
//           text: `${parsed.length} lot(s) restored from previous session`,
//           timer: 2000,
//           showConfirmButton: false,
//         });
//       } catch (error) {
//         console.error("Failed to parse saved lots:", error);
//       }
//     }
//     //eslint-disable-next-line
//   }, []);

//   // Save lots to localStorage whenever they change
//   useEffect(() => {
//     if (lots.length > 0) {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(lots));
//     } else {
//       localStorage.removeItem(STORAGE_KEY);
//     }
//   }, [lots]);

//   useEffect(() => {
//     dispatch(resetBulkCreateStatus());
//     fetchArticleProfile();
//     fetchWarehouse();
//     //eslint-disable-next-line
//   }, []);

//   // Handle bulk create status
//   useEffect(() => {
//     if (bulkCreateStatus === 'succeeded') {
//       const totalProducts = lots.reduce((sum, lot) => sum + lot.products.length, 0);
//       MySwal.fire({
//         icon: "success",
//         title: "Success!",
//         html: `
//           <p><strong>${totalProducts} products</strong> created successfully!</p>
//           <p><strong>${lots.length} lot(s)</strong> processed</p>
//         `,
//         timer: 3000,
//         showConfirmButton: false,
//       }).then(() => {
//         // Clear all data
//         setLots([]);
//         setProductsInLot([]);
//         setSelectedArticleProfile(null);
//         setSelectedWarehouse(null);
//         localStorage.removeItem(STORAGE_KEY);
//         dispatch(resetBulkCreateStatus());
//         navigate(route.productlist);
//       });
//     } else if (bulkCreateStatus === 'failed') {
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: error || "Failed to create products",
//         timer: 3000,
//       });
//       dispatch(resetBulkCreateStatus());
//     }
//     //eslint-disable-next-line
//   }, [bulkCreateStatus, error]);

//   // Barcode scanner listener
//   useEffect(() => {
//     const handleKeyPress = (e) => {
//       const currentTime = Date.now();
//       const timeSinceLastKey = currentTime - lastKeystroke;

//       if (timeSinceLastKey > 100 && scanBuffer.length > 0) {
//         setScanBuffer("");
//       }

//       setLastKeystroke(currentTime);

//       const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
//       const isBarcodeInput = e.target.name === 'barcodeInput';
      
//       if (isInput && !isBarcodeInput) return;

//       if (e.key === 'Enter' && scanBuffer.length >= 8) {
//         e.preventDefault();
//         const scannedCode = scanBuffer.trim();
//         setBarcodeInput(scannedCode);
//         handleVerifyBarcode(scannedCode);
//         setScanBuffer("");
//         return;
//       }

//       if (e.key.length === 1) {
//         setScanBuffer(prev => prev + e.key);
//         setTimeout(() => setScanBuffer(""), 200);
//       }
//     };

//     window.addEventListener('keypress', handleKeyPress);
//     return () => window.removeEventListener('keypress', handleKeyPress);
//     //eslint-disable-next-line
//   }, [scanBuffer, lastKeystroke, selectedArticleProfile, selectedWarehouse]);

//   const handleVerifyBarcode = async (barcode) => {
//     if (!barcode.trim()) return;

//     // Check if article profile and warehouse are selected
//     if (!selectedArticleProfile) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Article Profile Required",
//         text: "Please select an Article Profile first",
//         timer: 2000,
//       });
//       setBarcodeInput("");
//       return;
//     }

//     if (!selectedWarehouse) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Warehouse Required",
//         text: "Please select a Warehouse first",
//         timer: 2000,
//       });
//       setBarcodeInput("");
//       return;
//     }

//     // Check if barcode already exists in current lot
//     if (productsInLot.some(p => p.barcode === barcode.trim())) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Duplicate in Lot",
//         text: "This barcode is already added to the current lot",
//         timer: 2000,
//       });
//       setBarcodeInput("");
//       return;
//     }

//     // Check if barcode exists in other lots
//     const existsInOtherLots = lots.some(lot => 
//       lot.products.some(p => p.barcode === barcode.trim())
//     );

//     if (existsInOtherLots) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Already in Another Lot",
//         text: "This barcode is already added to another lot",
//         timer: 2000,
//       });
//       setBarcodeInput("");
//       return;
//     }

//     setIsScanning(true);

//     try {
//       const product = await dispatch(scanProduct(barcode.trim())).unwrap();

//       MySwal.fire({
//         icon: "warning",
//         title: "Product Already Exists",
//         html: `
//           <div style="text-align: left; padding: 20px;">
//             <p><strong>Name:</strong> ${product.title || 'N/A'}</p>
//             <p><strong>Barcode:</strong> ${product.barcode}</p>
//             <p><strong>Article Profile:</strong> ${product.article_profile_name || 'N/A'}</p>
//             <p><strong>Warehouse:</strong> ${product.warehouse_name || 'N/A'}</p>
//             <p><strong>Quantity:</strong> ${product.count || 0}</p>
//             <hr>
//             <p class="text-danger"><strong>This product cannot be added again.</strong></p>
//           </div>
//         `,
//         showDenyButton: true,
//         showCancelButton: true,
//         confirmButtonText: "Edit Product",
//         denyButtonText: "View Product List",
//         cancelButtonText: "Cancel",
//       }).then((result) => {
//         if (result.isConfirmed) {
//           navigate(route.productlist, { 
//             state: { 
//               editProductId: product.prod_uuid,
//               openEditModal: true 
//             } 
//           });
//         } else if (result.isDenied) {
//           navigate(route.productlist);
//         }
//       });

//       setBarcodeInput("");
//       dispatch(clearScannedProduct());
//     } catch (error) {
//       const errorMessage = error?.message || error?.toString() || "";
//       const isValidationError = errorMessage.includes("printable ASCII");
      
//       if (isValidationError) {
//         MySwal.fire({
//           icon: "error",
//           title: "Invalid Barcode",
//           text: errorMessage || "Barcode contains invalid characters",
//           confirmButtonText: "OK",
//         });
//         setBarcodeInput("");
//       } else {
//         // Barcode is valid and doesn't exist - ready to add
//         MySwal.fire({
//           icon: "success",
//           title: "✓ Barcode Verified",
//           text: `Ready to add to lot`,
//           timer: 1500,
//           showConfirmButton: false,
//         });
//       }
//     } finally {
//       setIsScanning(false);
//     }
//   };

//   const handleBarcodeInputChange = (e) => {
//     setBarcodeInput(e.target.value);
//   };

//   const handleProductInputChange = (e) => {
//     const { name, value } = e.target;
//     setCurrentProduct(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleProductStatusChange = (option) => {
//     setCurrentProduct(prev => ({
//       ...prev,
//       status: option,
//     }));
//   };

//   const fetchArticleProfile = async () => {
//     try {
//       const res = await AuthService.getArticles();
//       const formatted = res.data.data.map((item) => ({
//         value: item.uuid,
//         label: item.name || item.title,
//       }));
//       setArticleProfiles(formatted);
//     } catch (error) {
//       console.error("Failed to load Article Profile", error);
//     }
//   };

//   const fetchWarehouse = async () => {
//     try {
//       const res = await AuthService.getWarehouse();
//       const formatted = res.data.data.map((item) => ({
//         value: item.wh_uuid,
//         label: item.name || item.title,
//       }));
//       setWarehouses(formatted);
//     } catch (error) {
//       console.error("Failed to load Warehouses", error);
//     }
//   };

//   const handleAddProductToLot = () => {
//     if (!selectedArticleProfile) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Article Profile Required",
//         text: "Please select an Article Profile",
//         timer: 2000,
//       });
//       return;
//     }

//     if (!selectedWarehouse) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Warehouse Required",
//         text: "Please select a Warehouse",
//         timer: 2000,
//       });
//       return;
//     }

//     if (!barcodeInput.trim()) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Barcode Required",
//         text: "Please scan or enter a barcode",
//         timer: 2000,
//       });
//       return;
//     }

//     const newProduct = {
//       barcode: barcodeInput.trim(),
//       title: currentProduct.title || undefined,
//       in_wh_locn: currentProduct.in_wh_locn || undefined,
//       status: currentProduct.status?.value || "new",
//       description: currentProduct.description || undefined,
//       article_profile_id: selectedArticleProfile.value,
//       article_profile_name: selectedArticleProfile.label,
//       warehouse_id: selectedWarehouse.value,
//       warehouse_name: selectedWarehouse.label,
//       count: 1,
//     };

//     setProductsInLot(prev => [...prev, newProduct]);

//     // Reset form
//     setBarcodeInput("");
//     setCurrentProduct({
//       title: "",
//       in_wh_locn: "",
//       status: { value: "new", label: "New" },
//       description: "",
//     });

//     MySwal.fire({
//       icon: "success",
//       title: "Product Added!",
//       text: `Product added to current lot (${productsInLot.length + 1} products)`,
//       timer: 1500,
//       showConfirmButton: false,
//     });
//   };

//   const handleRemoveProductFromLot = (index) => {
//     MySwal.fire({
//       title: "Remove Product?",
//       text: "This will remove the product from the current lot",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Yes, remove it!",
//       cancelButtonText: "Cancel",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setProductsInLot(prev => prev.filter((_, i) => i !== index));
//       }
//     });
//   };

//   const handleEditProductInLot = (index) => {
//     const product = productsInLot[index];
//     setEditingProductIndex(index);
//     setEditingProductData({
//       title: product.title || "",
//       in_wh_locn: product.in_wh_locn || "",
//       status: statusOptions.find(s => s.value === product.status) || statusOptions[0],
//       description: product.description || "",
//     });
//     setShowEditProductModal(true);
//   };

//   const handleSaveEditedProduct = () => {
//     if (editingProductIndex === null) return;

//     const updatedProducts = [...productsInLot];
//     updatedProducts[editingProductIndex] = {
//       ...updatedProducts[editingProductIndex],
//       title: editingProductData.title || undefined,
//       in_wh_locn: editingProductData.in_wh_locn || undefined,
//       status: editingProductData.status?.value || "new",
//       description: editingProductData.description || undefined,
//     };

//     setProductsInLot(updatedProducts);
//     setShowEditProductModal(false);
//     setEditingProductIndex(null);
//     setEditingProductData(null);

//     MySwal.fire({
//       icon: "success",
//       title: "Updated!",
//       text: "Product updated successfully",
//       timer: 1500,
//       showConfirmButton: false,
//     });
//   };

//   const handleCreateLot = () => {
//     if (productsInLot.length === 0) {
//       MySwal.fire({
//         icon: "warning",
//         title: "No Products",
//         text: "Please add at least one product to create a lot",
//         timer: 2000,
//       });
//       return;
//     }

//     const lotId = `LOT-${Date.now()}`;
//     const newLot = {
//       lotId,
//       article_profile: selectedArticleProfile,
//       warehouse: selectedWarehouse,
//       products: productsInLot,
//       createdAt: new Date().toISOString(),
//     };

//     setLots(prev => [...prev, newLot]);
//     setProductsInLot([]);
//     setSelectedArticleProfile(null);
//     setSelectedWarehouse(null);

//     MySwal.fire({
//       icon: "success",
//       title: "Lot Created!",
//       html: `
//         <p><strong>Lot ID:</strong> ${lotId}</p>
//         <p><strong>Products:</strong> ${productsInLot.length}</p>
//         <p class="text-muted">You can now create another lot or submit all lots</p>
//       `,
//       timer: 3000,
//     });
//   };

//   const handleDeleteLot = (lotId) => {
//     MySwal.fire({
//       title: "Delete Lot?",
//       text: "This will remove the lot and all its products",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Yes, delete it!",
//       cancelButtonText: "Cancel",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setLots(prev => prev.filter(lot => lot.lotId !== lotId));
//         MySwal.fire({
//           icon: "success",
//           title: "Deleted!",
//           text: "Lot has been deleted",
//           timer: 1500,
//           showConfirmButton: false,
//         });
//       }
//     });
//   };

//   const handleSubmitAllLots = async () => {
//     if (lots.length === 0) {
//       MySwal.fire({
//         icon: "warning",
//         title: "No Lots",
//         text: "Please create at least one lot before submitting",
//         timer: 2000,
//       });
//       return;
//     }

//     // Show confirmation
//     const totalProducts = lots.reduce((sum, lot) => sum + lot.products.length, 0);
    
//     const result = await MySwal.fire({
//       title: "Submit All Lots?",
//       html: `
//         <p><strong>Total Lots:</strong> ${lots.length}</p>
//         <p><strong>Total Products:</strong> ${totalProducts}</p>
//         <p class="text-muted">This will create all products in the database</p>
//       `,
//       icon: "question",
//       showCancelButton: true,
//       confirmButtonText: "Yes, Submit All",
//       cancelButtonText: "Cancel",
//     });

//     if (!result.isConfirmed) return;

//     try {
//       setSubmitting(true);

//       // Flatten all products from all lots
//       const allProducts = lots.flatMap(lot => 
//         lot.products.map(product => ({
//           barcode: product.barcode,
//           title: product.title || undefined,
//           article_profile_id: lot.article_profile.value,
//           warehouse_id: lot.warehouse.value,
//           in_wh_location: product.in_wh_locn || undefined,
//           count: 1,
//           status: product.status || "new",
//           description: product.description || undefined,
//           last_updated_by: user?.id || 1,
//         }))
//       );

//       console.log("Submitting products:", allProducts);
//       await dispatch(bulkCreateProducts(allProducts)).unwrap();

//     } catch (error) {
//       console.error("Error creating products:", error);
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: error || "Failed to create products",
//         timer: 3000,
//       });
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const handleClearDraft = () => {
//     MySwal.fire({
//       title: "Clear All Drafts?",
//       text: "This will remove all lots and cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Yes, clear all!",
//       cancelButtonText: "Cancel",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setLots([]);
//         setProductsInLot([]);
//         setSelectedArticleProfile(null);
//         setSelectedWarehouse(null);
//         localStorage.removeItem(STORAGE_KEY);
//         MySwal.fire({
//           icon: "success",
//           title: "Cleared!",
//           text: "All drafts have been removed",
//           timer: 1500,
//           showConfirmButton: false,
//         });
//       }
//     });
//   };

//   const statusOptions = [
//     { value: "new", label: "New" },
//     { value: "used", label: "Used" },
//     { value: "repaired", label: "Repaired" },
//     { value: "broken", label: "Broken" },
//     { value: "installed", label: "Installed" },
//   ];

//   const renderCollapseTooltip = (props) => (
//     <Tooltip id="refresh-tooltip" {...props}>
//       Collapse
//     </Tooltip>
//   );

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="page-header">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>Batch Product Creation</h4>
//               <h6>Create multiple products in lots - Scan anywhere to add</h6>
//             </div>
//           </div>
//           <ul className="table-top-head">
//             <li>
//               <div className="page-btn">
//                 <Link to={route.productlist} className="btn btn-secondary">
//                   <ArrowLeft className="me-2" />
//                   Back to Product
//                 </Link>
//               </div>
//             </li>
//             <li>
//               <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
//                 <Link
//                   data-bs-toggle="tooltip"
//                   data-bs-placement="top"
//                   title="Collapse"
//                   id="collapse-header"
//                   className={data ? "active" : ""}
//                   onClick={() => dispatch(setToogleHeader(!data))}
//                 >
//                   <ChevronUp className="feather-chevron-up" />
//                 </Link>
//               </OverlayTrigger>
//             </li>
//           </ul>
//         </div>

//         {/* Lot Summary Bar */}
//         {lots.length > 0 && (
//           <div className="alert alert-success d-flex align-items-center justify-content-between mb-3">
//             <div className="d-flex align-items-center">
//               <Package className="me-2" size={20} />
//               <div>
//                 <strong>{lots.length} Lot(s) Created</strong> - {lots.reduce((sum, lot) => sum + lot.products.length, 0)} Products Total
//               </div>
//             </div>
//             <div className="d-flex gap-2">
//               <button 
//                 className="btn btn-sm btn-info"
//                 onClick={() => setShowLotsModal(true)}
//               >
//                 View Lots
//               </button>
//               <button 
//                 className="btn btn-sm btn-danger"
//                 onClick={handleClearDraft}
//               >
//                 Clear All
//               </button>
//             </div>
//           </div>
//         )}

//         <div className="alert alert-info d-flex align-items-center mb-3">
//           <Camera className="me-2" size={20} />
//           <div>
//             <strong>How it works:</strong> Select Article Profile & Warehouse → Scan products → Create Lot → Repeat for more lots → Submit All
//           </div>
//         </div>

//         {/* Lot Configuration */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <h5 className="mb-3">
//               <Package size={20} className="me-2" />
//               {productsInLot.length > 0 ? `Current Lot (${productsInLot.length} products)` : "New Lot Configuration"}
//             </h5>
//             <div className="row">
//               <div className="col-lg-6">
//                 <div className="mb-3">
//                   <label className="form-label">
//                     Article Profile <span className="text-danger">*</span>
//                   </label>
//                   <Select
//                     className="select"
//                     options={articleProfiles}
//                     placeholder="Choose Article Profile"
//                     value={selectedArticleProfile}
//                     onChange={setSelectedArticleProfile}
//                     isDisabled={productsInLot.length > 0}
//                   />
//                   {productsInLot.length > 0 && (
//                     <small className="text-muted">Cannot change while products are in lot</small>
//                   )}
//                 </div>
//               </div>
//               <div className="col-lg-6">
//                 <div className="mb-3">
//                   <label className="form-label">
//                     Warehouse <span className="text-danger">*</span>
//                   </label>
//                   <Select
//                     className="select"
//                     options={warehouses}
//                     placeholder="Choose Warehouse"
//                     value={selectedWarehouse}
//                     onChange={setSelectedWarehouse}
//                     isDisabled={productsInLot.length > 0}
//                   />
//                   {productsInLot.length > 0 && (
//                     <small className="text-muted">Cannot change while products are in lot</small>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {productsInLot.length > 0 && (
//               <div className="alert alert-light border">
//                 <strong>Products in Current Lot:</strong>
//                 <div className="mt-2" style={{ maxHeight: "300px", overflowY: "auto" }}>
//                   {productsInLot.map((product, index) => (
//                     <div key={index} className="d-flex align-items-center justify-content-between mb-2 p-2 bg-white rounded border">
//                       <div className="flex-grow-1">
//                         <Badge bg="secondary" className="me-2">{product.barcode}</Badge>
//                         {product.title && <span className="me-2">{product.title}</span>}
//                         <Badge bg="info">{product.status}</Badge>
//                       </div>
//                       <div className="d-flex gap-1">
//                         <button
//                           className="btn btn-sm btn-warning"
//                           onClick={() => handleEditProductInLot(index)}
//                           title="Edit"
//                         >
//                           <Edit size={14} />
//                         </button>
//                         <button
//                           className="btn btn-sm btn-danger"
//                           onClick={() => handleRemoveProductFromLot(index)}
//                           title="Remove"
//                         >
//                           <Trash2 size={14} />
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <button
//                   className="btn btn-success mt-2 w-100"
//                   onClick={handleCreateLot}
//                 >
//                   <Save className="me-2" size={16} />
//                   Save as Lot ({productsInLot.length} products)
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Product Entry Form */}
//         {selectedArticleProfile && selectedWarehouse && (
//           <div className="card mb-3">
//             <div className="card-body">
//               <h5 className="mb-3">
//                 <Camera size={20} className="me-2" />
//                 Add Product to Lot
//               </h5>
              
//               <div className="row align-items-end mb-3">
//                 <div className="col-lg-8">
//                   <label className="form-label">
//                     Scan or Enter Barcode <span className="text-danger">*</span>
//                     {isScanning && (
//                       <span className="spinner-border spinner-border-sm ms-2" />
//                     )}
//                   </label>
//                   <input
//                     type="text"
//                     className="form-control"
//                     name="barcodeInput"
//                     value={barcodeInput}
//                     onChange={handleBarcodeInputChange}
//                     placeholder="Use scanner or type barcode"
//                     disabled={isScanning}
//                   />
//                 </div>
//                 <div className="col-lg-4">
//                   <button
//                     type="button"
//                     className="btn btn-primary w-100"
//                     onClick={() => handleVerifyBarcode(barcodeInput)}
//                     disabled={!barcodeInput.trim() || isScanning}
//                   >
//                     {isScanning ? "Checking..." : "Check Barcode"}
//                   </button>
//                 </div>
//               </div>

//               <div className="row">
//                 <div className="col-lg-6">
//                   <div className="mb-3">
//                     <label className="form-label">Product Name (Optional)</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       name="title"
//                       value={currentProduct.title}
//                       onChange={handleProductInputChange}
//                       placeholder="Enter product name"
//                     />
//                   </div>
//                 </div>
//                 <div className="col-lg-6">
//                   <div className="mb-3">
//                     <label className="form-label">In WH Location</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       name="in_wh_locn"
//                       value={currentProduct.in_wh_locn}
//                       onChange={handleProductInputChange}
//                       placeholder="Enter location"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="row">
//                 <div className="col-lg-6">
//                   <div className="mb-3">
//                     <label className="form-label">Status</label>
//                     <Select
//                       className="select"
//                       options={statusOptions}
//                       value={currentProduct.status}
//                       onChange={handleProductStatusChange}
//                     />
//                   </div>
//                 </div>
//                 <div className="col-lg-6">
//                   <div className="mb-3">
//                     <label className="form-label">Quantity</label>
//                     <div className="form-control">1</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="mb-3">
//                 <label className="form-label">Description</label>
//                 <textarea
//                   className="form-control"
//                   rows={3}
//                   name="description"
//                   value={currentProduct.description}
//                   onChange={handleProductInputChange}
//                   placeholder="Enter product description"
//                 />
//               </div>

//               <button
//                 type="button"
//                 className="btn btn-primary w-100"
//                 onClick={handleAddProductToLot}
//               >
//                 <PlusCircle className="me-2" size={16} />
//                 Add Product to Lot
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div className="col-lg-12">
//           <div className="btn-addproduct mb-4">
//             <Link to={route.productlist} className="btn btn-cancel me-2">
//               Cancel
//             </Link>
//             {lots.length > 0 && (
//               <button
//                 type="button"
//                 className="btn btn-submit"
//                 onClick={handleSubmitAllLots}
//                 disabled={submitting}
//               >
//                 {submitting ? (
//                   <>
//                     <span className="spinner-border spinner-border-sm me-2" />
//                     Creating...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="me-2" size={16} />
//                     Submit All Lots ({lots.length})
//                   </>
//                 )}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Edit Product in Lot Modal */}
//       <Modal show={showEditProductModal} onHide={() => setShowEditProductModal(false)} centered>
//         <Modal.Header>
//           <Modal.Title>Edit Product in Lot</Modal.Title>
//           <button className="btn-close" onClick={() => setShowEditProductModal(false)}>
//             <X />
//           </button>
//         </Modal.Header>
//         <Modal.Body>
//           {editingProductData && (
//             <div>
//               <div className="mb-3">
//                 <label className="form-label">Product Name (Optional)</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   value={editingProductData.title}
//                   onChange={(e) => setEditingProductData(prev => ({ ...prev, title: e.target.value }))}
//                   placeholder="Enter product name"
//                 />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">In WH Location</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   value={editingProductData.in_wh_locn}
//                   onChange={(e) => setEditingProductData(prev => ({ ...prev, in_wh_locn: e.target.value }))}
//                   placeholder="Enter location"
//                 />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">Status</label>
//                 <Select
//                   className="select"
//                   options={statusOptions}
//                   value={editingProductData.status}
//                   onChange={(option) => setEditingProductData(prev => ({ ...prev, status: option }))}
//                 />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">Description</label>
//                 <textarea
//                   className="form-control"
//                   rows={3}
//                   value={editingProductData.description}
//                   onChange={(e) => setEditingProductData(prev => ({ ...prev, description: e.target.value }))}
//                   placeholder="Enter product description"
//                 />
//               </div>
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <button className="btn btn-cancel" onClick={() => setShowEditProductModal(false)}>
//             Cancel
//           </button>
//           <button className="btn btn-submit" onClick={handleSaveEditedProduct}>
//             Save Changes
//           </button>
//         </Modal.Footer>
//       </Modal>

//       {/* Lots Modal */}
//       <Modal show={showLotsModal} onHide={() => setShowLotsModal(false)} size="xl">
//         <Modal.Header>
//           <Modal.Title>All Lots ({lots.length})</Modal.Title>
//           <button className="btn-close" onClick={() => setShowLotsModal(false)}>
//             <X />
//           </button>
//         </Modal.Header>
//         <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
//           {lots.map((lot) => (
//             <div key={lot.lotId} className="card mb-3">
//               <div className="card-header bg-light d-flex justify-content-between align-items-center">
//                 <div>
//                   <strong>{lot.lotId}</strong>
//                   <br />
//                   <small className="text-muted">
//                     {lot.article_profile.label} • {lot.warehouse.label} • {lot.products.length} products
//                   </small>
//                 </div>
//                 <button
//                   className="btn btn-sm btn-danger"
//                   onClick={() => handleDeleteLot(lot.lotId)}
//                 >
//                   <Trash2 size={14} />
//                 </button>
//               </div>
//               <div className="card-body">
//                 <div className="table-responsive">
//                   <table className="table table-sm table-hover">
//                     <thead>
//                       <tr>
//                         <th>#</th>
//                         <th>Barcode</th>
//                         <th>Name</th>
//                         <th>Location</th>
//                         <th>Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {lot.products.map((product, prodIndex) => (
//                         <tr key={prodIndex}>
//                           <td>{prodIndex + 1}</td>
//                           <td><Badge bg="secondary">{product.barcode}</Badge></td>
//                           <td>{product.title || "—"}</td>
//                           <td>{product.in_wh_locn || "—"}</td>
//                           <td><Badge bg="info">{product.status}</Badge></td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default AddProduct;





// //with lot id

// import React, { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import Select from "react-select";
// import Swal from "sweetalert2";
// import withReactContent from "sweetalert2-react-content";
// import { all_routes } from "../../Router/all_routes";
// import {
//   ArrowLeft,
//   ChevronUp,
//   Camera,
//   Trash2,
//   Package,
//   Save,
//   PlusCircle,
//   X,
//   Edit,
// } from "feather-icons-react/build/IconComponents";
// import { OverlayTrigger, Tooltip, Modal, Badge } from "react-bootstrap";
// import { useDispatch, useSelector } from "react-redux";
// import { setToogleHeader } from "../../core/redux/action";
// import { 
//   scanProduct, 
//   clearScannedProduct, 
//   bulkCreateProducts,
//   resetBulkCreateStatus 
// } from "../../core/redux/slices/productSlice";
// import AuthService from "../../services/authService";

// const STORAGE_KEY = "product_lots_draft";

// const AddProduct = () => {
//   const route = all_routes;
//   const dispatch = useDispatch();
//   const navigate = useNavigate();
//   const MySwal = withReactContent(Swal);

//   const data = useSelector((state) => state.toggle_header);
//   const { user } = useSelector((state) => state.auth);
//   const { bulkCreateStatus, error } = useSelector((state) => state.products);

//   const [articleProfiles, setArticleProfiles] = useState([]);
//   const [warehouses, setWarehouses] = useState([]);
//   const [submitting, setSubmitting] = useState(false);

//   // Lot Management State
//   const [lots, setLots] = useState([]);
//   const [showLotsModal, setShowLotsModal] = useState(false);

//   // Current Lot Selection
//   const [selectedArticleProfile, setSelectedArticleProfile] = useState(null);
//   const [selectedWarehouse, setSelectedWarehouse] = useState(null);

//   // Barcode Scanning State
//   const [barcodeInput, setBarcodeInput] = useState("");
//   const [barcodeVerified, setBarcodeVerified] = useState(false);
//   const [existingProduct, setExistingProduct] = useState(null);
//   const [isScanning, setIsScanning] = useState(false);
//   const [scanBuffer, setScanBuffer] = useState("");
//   const [lastKeystroke, setLastKeystroke] = useState(0);

//   // Current Product Being Added
//   const [currentProduct, setCurrentProduct] = useState({
//     title: "",
//     in_wh_locn: "",
//     status: { value: "new", label: "New" },
//     description: "",
//   });

//   // Products in Current Lot
//   const [productsInLot, setProductsInLot] = useState([]);

//   // Edit Product in Lot
//   const [editingProductIndex, setEditingProductIndex] = useState(null);
//   const [showEditProductModal, setShowEditProductModal] = useState(false);
//   const [editingProductData, setEditingProductData] = useState(null);

//   // Load saved lots from localStorage on mount
// useEffect(() => {
//   const savedLots = localStorage.getItem(STORAGE_KEY);
//   if (savedLots) {
//     try {
//       const parsed = JSON.parse(savedLots);
      
//       // ✅ Validate loaded data
//       const validLots = parsed.filter(lot => 
//         lot.article_profile?.value && 
//         lot.warehouse?.value &&
//         lot.products?.length > 0
//       );
      
//       if (validLots.length > 0) {
//         setLots(validLots);
//         MySwal.fire({
//           icon: "info",
//           title: "Draft Restored",
//           text: `${validLots.length} lot(s) restored from previous session`,
//           timer: 2000,
//           showConfirmButton: false,
//         });
//       }
//     } catch (error) {
//       console.error("Failed to parse saved lots:", error);
//       localStorage.removeItem(STORAGE_KEY);
//     }
//   }
//   //eslint-disable-next-line
// }, []);

//   // Save lots to localStorage whenever they change
//   useEffect(() => {
//   if (lots.length > 0) {
//     // ✅ Validate before saving
//     const validLots = lots.filter(lot => 
//       lot.article_profile?.value && lot.warehouse?.value
//     );
    
//     if (validLots.length > 0) {
//       localStorage.setItem(STORAGE_KEY, JSON.stringify(validLots));
//     } else {
//       localStorage.removeItem(STORAGE_KEY);
//     }
//   } else {
//     localStorage.removeItem(STORAGE_KEY);
//   }
// }, [lots]);

//   useEffect(() => {
//     dispatch(resetBulkCreateStatus());
//     fetchArticleProfile();
//     fetchWarehouse();
//     //eslint-disable-next-line
//   }, []);

//   // Handle bulk create status
//   useEffect(() => {
//     if (bulkCreateStatus === 'succeeded') {
//       const totalProducts = lots.reduce((sum, lot) => sum + lot.products.length, 0);
//       MySwal.fire({
//         icon: "success",
//         title: "Success!",
//         html: `
//           <p><strong>${totalProducts} products</strong> created successfully!</p>
//           <p><strong>${lots.length} lot(s)</strong> processed</p>
//         `,
//         timer: 3000,
//         showConfirmButton: false,
//       }).then(() => {
//         // Clear all data
//         setLots([]);
//         setProductsInLot([]);
//         setSelectedArticleProfile(null);
//         setSelectedWarehouse(null);
//         localStorage.removeItem(STORAGE_KEY);
//         dispatch(resetBulkCreateStatus());
//         navigate(route.productlist);
//       });
//     } else if (bulkCreateStatus === 'failed') {
//       MySwal.fire({
//         icon: "error",
//         title: "Error",
//         text: error || "Failed to create products",
//         timer: 3000,
//       });
//       dispatch(resetBulkCreateStatus());
//     }
//     //eslint-disable-next-line
//   }, [bulkCreateStatus, error]);

//   // Barcode scanner listener
//   useEffect(() => {
//     const handleKeyPress = (e) => {
//       const currentTime = Date.now();
//       const timeSinceLastKey = currentTime - lastKeystroke;

//       if (timeSinceLastKey > 100 && scanBuffer.length > 0) {
//         setScanBuffer("");
//       }

//       setLastKeystroke(currentTime);

//       const isInput = e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA';
//       const isBarcodeInput = e.target.name === 'barcodeInput';
      
//       if (isInput && !isBarcodeInput) return;

//       if (e.key === 'Enter' && scanBuffer.length >= 8) {
//         e.preventDefault();
//         const scannedCode = scanBuffer.trim();
//         setBarcodeInput(scannedCode);
//         handleVerifyBarcode(scannedCode);
//         setScanBuffer("");
//         return;
//       }

//       if (e.key.length === 1) {
//         setScanBuffer(prev => prev + e.key);
//         setTimeout(() => setScanBuffer(""), 200);
//       }
//     };

//     window.addEventListener('keypress', handleKeyPress);
//     return () => window.removeEventListener('keypress', handleKeyPress);
//     //eslint-disable-next-line
//   }, [scanBuffer, lastKeystroke, selectedArticleProfile, selectedWarehouse, productsInLot, lots]);

//   const handleVerifyBarcode = async (barcode) => {
//     if (!barcode.trim()) return;

//     // Check if article profile and warehouse are selected
//     if (!selectedArticleProfile) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Article Profile Required",
//         text: "Please select an Article Profile first",
//         timer: 2000,
//       });
//       setBarcodeInput("");
//       return;
//     }

//     if (!selectedWarehouse) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Warehouse Required",
//         text: "Please select a Warehouse first",
//         timer: 2000,
//       });
//       setBarcodeInput("");
//       return;
//     }

//     // Check if barcode already exists in current lot
//     if (productsInLot.some(p => p.barcode === barcode.trim())) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Duplicate in Current Lot",
//         text: "This barcode is already added to the current lot",
//         timer: 2000,
//       });
//       setBarcodeInput("");
//       setBarcodeVerified(false);
//       return;
//     }

//     // Check if barcode exists in other lots
//     const existsInOtherLots = lots.some(lot => 
//       lot.products.some(p => p.barcode === barcode.trim())
//     );

//     if (existsInOtherLots) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Already in Another Lot",
//         text: "This barcode is already added to another lot",
//         timer: 2000,
//       });
//       setBarcodeInput("");
//       setBarcodeVerified(false);
//       return;
//     }

//     setIsScanning(true);
//     setBarcodeVerified(false);
//     setExistingProduct(null);

//     try {
//       const response = await dispatch(scanProduct(barcode.trim())).unwrap();

//       console.log("scan response:", response);

//       // Check if product already exists in database
//       if (response.is_found === true) {
//         const product = response.data;

//         setExistingProduct(product);
//         setBarcodeVerified(false);

//         MySwal.fire({
//           icon: "warning",
//           title: "Product Already Exists in Database",
//           html: `
//             <div style="text-align: left; padding: 20px;">
//               <p><strong>Name:</strong> ${product.title || "N/A"}</p>
//               <p><strong>Barcode:</strong> ${product.barcode}</p>
//               <p><strong>Article Profile:</strong> ${product.article_profile_name || "N/A"}</p>
//               <p><strong>Warehouse:</strong> ${product.warehouse_name || "N/A"}</p>
//               <p><strong>Quantity:</strong> ${product.count || 0}</p>
//               <hr>
//               <p class="text-danger"><strong>This product cannot be added again.</strong></p>
//               <p class="text-muted">You can only view or edit the existing product.</p>
//             </div>
//           `,
//           showDenyButton: true,
//           showCancelButton: true,
//           confirmButtonText: "Edit Product",
//           denyButtonText: "View Product List",
//           cancelButtonText: "Cancel",
//         }).then((result) => {
//           if (result.isConfirmed) {
//             navigate(route.productlist, { 
//               state: { 
//                 editProductId: product.prod_uuid,
//                 openEditModal: true 
//               } 
//             });
//           } else if (result.isDenied) {
//             navigate(route.productlist);
//           } else {
//             // User clicked cancel - clear the barcode
//             setBarcodeInput("");
//             setExistingProduct(null);
//           }
//         });

//         return;
//       }

//       // Product not found - it's new and ready to add
//       if (response.is_found === false) {
//         setBarcodeVerified(true);
//         setExistingProduct(null);

//         MySwal.fire({
//           icon: "success",
//           title: "✓ Ready to Add",
//           text: `New product with barcode: ${barcode}`,
//           timer: 2000,
//           showConfirmButton: false,
//         });

//         return;
//       }

//       // Unexpected response
//       throw new Error("Unexpected scan response");

//     } catch (error) {
//       const errorMessage = error?.message || error?.toString() || "";
//       const isValidationError = errorMessage.includes("printable ASCII");

//       if (isValidationError) {
//         MySwal.fire({
//           icon: "error",
//           title: "Invalid Barcode",
//           text: errorMessage || "Barcode contains invalid characters. Please use a valid barcode.",
//         });
//       } else {
//         MySwal.fire({
//           icon: "error",
//           title: "Verification Failed",
//           text: errorMessage || "Unable to verify barcode. Please try again.",
//         });
//       }
      
//       setBarcodeInput("");
//       setBarcodeVerified(false);
//       setExistingProduct(null);
//     } finally {
//       dispatch(clearScannedProduct());
//       setIsScanning(false);
//     }
//   };

//   const handleBarcodeInputChange = (e) => {
//     const value = e.target.value;
//     setBarcodeInput(value);
//     setBarcodeVerified(false); 
//     setExistingProduct(null); // Clear existing product when user modifies barcode
//   };

//   const handleProductInputChange = (e) => {
//     const { name, value } = e.target;
//     setCurrentProduct(prev => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   const handleProductStatusChange = (option) => {
//     setCurrentProduct(prev => ({
//       ...prev,
//       status: option,
//     }));
//   };

//   const fetchArticleProfile = async () => {
//     try {
//       const res = await AuthService.getArticles();
//       const formatted = res.data.data.map((item) => ({
//         value: item.uuid,
//         label: item.name || item.title,
//       }));
//       setArticleProfiles(formatted);
//     } catch (error) {
//       console.error("Failed to load Article Profile", error);
//     }
//   };

//   const fetchWarehouse = async () => {
//     try {
//       const res = await AuthService.getWarehouse();
//       const formatted = res.data.data.map((item) => ({
//         value: item.id,  
//         label: item.name || item.title,
//       }));
//       setWarehouses(formatted);
//     } catch (error) {
//       console.error("Failed to load Warehouses", error);
//     }
//   };


//   const handleAddProductToLot = () => {
//     if (!selectedArticleProfile) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Article Profile Required",
//         text: "Please select an Article Profile",
//         timer: 2000,
//       });
//       return;
//     }

//     if (!selectedWarehouse) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Warehouse Required",
//         text: "Please select a Warehouse",
//         timer: 2000,
//       });
//       return;
//     }

//     if (!barcodeInput.trim()) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Barcode Required",
//         text: "Please scan or enter a barcode",
//         timer: 2000,
//       });
//       return;
//     }

//     // Check if barcode is verified (not from existing database)
//     if (existingProduct) {
//       MySwal.fire({
//         icon: "error",
//         title: "Cannot Add Existing Product",
//         text: "This barcode already exists in the database. Please use a different barcode.",
//         timer: 2000,
//       });
//       return;
//     }

//     // Double-check duplicates before adding
//     if (productsInLot.some(p => p.barcode === barcodeInput.trim())) {
//       MySwal.fire({
//         icon: "warning",
//         title: "Duplicate in Lot",
//         text: "This barcode is already in the current lot",
//         timer: 2000,
//       });
//       return;
//     }

//     const newProduct = {
//       barcode: barcodeInput.trim(),
//       title: currentProduct.title || undefined,
//       in_wh_locn: currentProduct.in_wh_locn || undefined,
//       status: currentProduct.status?.value || "new",
//       description: currentProduct.description || undefined,
//       article_profile_id: selectedArticleProfile.value,
//       article_profile_name: selectedArticleProfile.label,
//       warehouse_id: selectedWarehouse.value,
//       warehouse_name: selectedWarehouse.label,
//       count: 1,
//     };

//     setProductsInLot(prev => [...prev, newProduct]);

//     // Reset form
//     setBarcodeInput("");
//     setBarcodeVerified(false);
//     setExistingProduct(null);
//     setCurrentProduct({
//       title: "",
//       in_wh_locn: "",
//       status: { value: "new", label: "New" },
//       description: "",
//     });

//     MySwal.fire({
//       icon: "success",
//       title: "Product Added!",
//       text: `Product added to current lot (${productsInLot.length + 1} products)`,
//       timer: 1500,
//       showConfirmButton: false,
//     });
//   };

//   const handleRemoveProductFromLot = (index) => {
//     MySwal.fire({
//       title: "Remove Product?",
//       text: "This will remove the product from the current lot",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Yes, remove it!",
//       cancelButtonText: "Cancel",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setProductsInLot(prev => prev.filter((_, i) => i !== index));
//         MySwal.fire({
//           icon: "success",
//           title: "Removed!",
//           text: "Product removed from lot",
//           timer: 1000,
//           showConfirmButton: false,
//         });
//       }
//     });
//   };

//   const handleEditProductInLot = (index) => {
//     const product = productsInLot[index];
//     setEditingProductIndex(index);
//     setEditingProductData({
//       title: product.title || "",
//       in_wh_locn: product.in_wh_locn || "",
//       status: statusOptions.find(s => s.value === product.status) || statusOptions[0],
//       description: product.description || "",
//     });
//     setShowEditProductModal(true);
//   };

//   const handleSaveEditedProduct = () => {
//     if (editingProductIndex === null) return;

//     const updatedProducts = [...productsInLot];
//     updatedProducts[editingProductIndex] = {
//       ...updatedProducts[editingProductIndex],
//       title: editingProductData.title || undefined,
//       in_wh_locn: editingProductData.in_wh_locn || undefined,
//       status: editingProductData.status?.value || "new",
//       description: editingProductData.description || undefined,
//     };

//     setProductsInLot(updatedProducts);
//     setShowEditProductModal(false);
//     setEditingProductIndex(null);
//     setEditingProductData(null);

//     MySwal.fire({
//       icon: "success",
//       title: "Updated!",
//       text: "Product updated successfully",
//       timer: 1500,
//       showConfirmButton: false,
//     });
//   };

//   // const handleCreateLot = () => {
//   //   if (productsInLot.length === 0) {
//   //     MySwal.fire({
//   //       icon: "warning",
//   //       title: "No Products",
//   //       text: "Please add at least one product to create a lot",
//   //       timer: 2000,
//   //     });
//   //     return;
//   //   }

//   //   const lotId = `LOT-${Date.now()}`;
//   //   const newLot = {
//   //     lotId,
//   //     article_profile: selectedArticleProfile,
//   //     warehouse: selectedWarehouse,
//   //     products: productsInLot,
//   //     createdAt: new Date().toISOString(),
//   //   };

//   //   setLots(prev => [...prev, newLot]);
//   //   setProductsInLot([]);
//   //   setSelectedArticleProfile(null);
//   //   setSelectedWarehouse(null);

//   //   MySwal.fire({
//   //     icon: "success",
//   //     title: "Lot Created!",
//   //     html: `
//   //       <p><strong>Lot ID:</strong> ${lotId}</p>
//   //       <p><strong>Products:</strong> ${productsInLot.length}</p>
//   //       <p class="text-muted">You can now create another lot or submit all lots</p>
//   //     `,
//   //     timer: 3000,
//   //   });
//   // };

// const handleCreateLot = () => {
//   // ✅ Validate BEFORE creating lot
//   if (!selectedArticleProfile || !selectedWarehouse) {
//     MySwal.fire({
//       icon: "warning",
//       title: "Missing Fields",
//       text: "Please select both Article Profile and Warehouse before creating a lot",
//       timer: 2000,
//     });
//     return;
//   }

//   if (productsInLot.length === 0) {
//     MySwal.fire({
//       icon: "warning",
//       title: "No Products",
//       text: "Please add at least one product to create a lot",
//       timer: 2000,
//     });
//     return;
//   }

//   const lotId = `LOT-${Date.now()}`;
//   const newLot = {
//     lotId,
//     article_profile: selectedArticleProfile,  // ✅ This should be { value: "uuid", label: "Name" }
//     warehouse: selectedWarehouse,             // ✅ This should be { value: 1, label: "Warehouse Name" }
//     products: productsInLot,
//     createdAt: new Date().toISOString(),
//   };

//   console.log("Creating lot:", newLot); // ✅ Add logging to verify data

//   setLots(prev => [...prev, newLot]);
//   setProductsInLot([]);
//   setSelectedArticleProfile(null);
//   setSelectedWarehouse(null);

//   MySwal.fire({
//     icon: "success",
//     title: "Lot Created!",
//     html: `
//       <p><strong>Lot ID:</strong> ${lotId}</p>
//       <p><strong>Products:</strong> ${productsInLot.length}</p>
//       <p class="text-muted">You can now create another lot or submit all lots</p>
//     `,
//     timer: 3000,
//   });
// };


//   const handleDeleteLot = (lotId) => {
//     MySwal.fire({
//       title: "Delete Lot?",
//       text: "This will remove the lot and all its products",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Yes, delete it!",
//       cancelButtonText: "Cancel",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setLots(prev => prev.filter(lot => lot.lotId !== lotId));
//         MySwal.fire({
//           icon: "success",
//           title: "Deleted!",
//           text: "Lot has been deleted",
//           timer: 1500,
//           showConfirmButton: false,
//         });
//       }
//     });
//   };

//  // COMPLETE FIX for AddProduct.jsx - handleSubmitAllLots function

// const handleSubmitAllLots = async () => {
//   if (lots.length === 0) {
//     MySwal.fire({
//       icon: "warning",
//       title: "No Lots",
//       text: "Please create at least one lot before submitting",
//       timer: 2000,
//     });
//     return;
//   }

//   // Show confirmation
//   const totalProducts = lots.reduce((sum, lot) => sum + lot.products.length, 0);
  
//   const result = await MySwal.fire({
//     title: "Submit All Lots?",
//     html: `
//       <p><strong>Total Lots:</strong> ${lots.length}</p>
//       <p><strong>Total Products:</strong> ${totalProducts}</p>
//       <p class="text-muted">This will create all products in the database</p>
//     `,
//     icon: "question",
//     showCancelButton: true,
//     confirmButtonText: "Yes, Submit All",
//     cancelButtonText: "Cancel",
//   });

//   if (!result.isConfirmed) return;

//   try {
//     setSubmitting(true);

//     // ✅ FIX: Validate lots before flattening
//     const invalidLots = lots.filter(lot => 
//       !lot.article_profile?.value || !lot.warehouse?.value
//     );

//     if (invalidLots.length > 0) {
//       MySwal.fire({
//         icon: "error",
//         title: "Invalid Lot Data",
//         html: `
//           <p>Some lots are missing required data:</p>
//           <ul style="text-align: left;">
//             ${invalidLots.map(lot => `
//               <li>${lot.lotId}: 
//                 ${!lot.article_profile?.value ? 'Missing Article Profile' : ''} 
//                 ${!lot.warehouse?.value ? 'Missing Warehouse' : ''}
//               </li>
//             `).join('')}
//           </ul>
//           <p class="text-danger">Please delete these lots and recreate them.</p>
//         `,
//       });
//       setSubmitting(false);
//       return;
//     }

//     // ✅ FIX: Flatten with proper validation and logging
//     const allProducts = lots.flatMap(lot => {
//       // Validate lot has required fields
//       if (!lot.article_profile?.value) {
//         console.error('Lot missing article_profile:', lot);
//         throw new Error(`Lot ${lot.lotId} is missing article_profile`);
//       }
//       if (!lot.warehouse?.value) {
//         console.error('Lot missing warehouse:', lot);
//         throw new Error(`Lot ${lot.lotId} is missing warehouse`);
//       }

//       return lot.products.map(product => {
//         // Build the product object with required fields
//         const productData = {
//           barcode: product.barcode,
//           article_profile_id: lot.article_profile.value,
//           warehouse_id: lot.warehouse.value,
//           count: 1,
//           status: product.status || "new",
//           last_updated_by: user?.id || 1,
//         };

//         // Add optional fields only if they have values
//         if (product.title) {
//           productData.title = product.title;
//         }
//         if (product.in_wh_locn) {
//           productData.in_wh_location = product.in_wh_locn;
//         }
//         if (product.description) {
//           productData.description = product.description;
//         }

//         return productData;
//       });
//     });

//     console.log("Submitting products:", allProducts);
    
//     // Validate the payload before sending
//     const invalidProducts = allProducts.filter(p => 
//       !p.barcode || !p.article_profile_id || !p.warehouse_id || !p.last_updated_by
//     );

//     if (invalidProducts.length > 0) {
//       console.error("Invalid products found:", invalidProducts);
//       throw new Error("Some products are missing required fields");
//     }

//     await dispatch(bulkCreateProducts(allProducts)).unwrap();

//   } catch (error) {
//     console.error("Error creating products:", error);
//     MySwal.fire({
//       icon: "error",
//       title: "Error",
//       text: error.message || error || "Failed to create products",
//       timer: 3000,
//     });
//   } finally {
//     setSubmitting(false);
//   }
// };

//   const handleClearDraft = () => {
//     MySwal.fire({
//       title: "Clear All Drafts?",
//       text: "This will remove all lots and cannot be undone",
//       icon: "warning",
//       showCancelButton: true,
//       confirmButtonColor: "#d33",
//       confirmButtonText: "Yes, clear all!",
//       cancelButtonText: "Cancel",
//     }).then((result) => {
//       if (result.isConfirmed) {
//         setLots([]);
//         setProductsInLot([]);
//         setSelectedArticleProfile(null);
//         setSelectedWarehouse(null);
//         localStorage.removeItem(STORAGE_KEY);
//         MySwal.fire({
//           icon: "success",
//           title: "Cleared!",
//           text: "All drafts have been removed",
//           timer: 1500,
//           showConfirmButton: false,
//         });
//       }
//     });
//   };

//   const statusOptions = [
//     { value: "new", label: "New" },
//     { value: "used", label: "Used" },
//     { value: "repaired", label: "Repaired" },
//     { value: "broken", label: "Broken" },
//     { value: "installed", label: "Installed" },
//   ];

//   const renderCollapseTooltip = (props) => (
//     <Tooltip id="refresh-tooltip" {...props}>
//       Collapse
//     </Tooltip>
//   );

//   return (
//     <div className="page-wrapper">
//       <div className="content">
//         <div className="page-header">
//           <div className="add-item d-flex">
//             <div className="page-title">
//               <h4>Batch Product Creation</h4>
//               <h6>Create multiple products in lots - Scan anywhere to add</h6>
//             </div>
//           </div>
//           <ul className="table-top-head">
//             <li>
//               <div className="page-btn">
//                 <Link to={route.productlist} className="btn btn-secondary">
//                   <ArrowLeft className="me-2" />
//                   Back to Product
//                 </Link>
//               </div>
//             </li>
//             <li>
//               <OverlayTrigger placement="top" overlay={renderCollapseTooltip}>
//                 <Link
//                   data-bs-toggle="tooltip"
//                   data-bs-placement="top"
//                   title="Collapse"
//                   id="collapse-header"
//                   className={data ? "active" : ""}
//                   onClick={() => dispatch(setToogleHeader(!data))}
//                 >
//                   <ChevronUp className="feather-chevron-up" />
//                 </Link>
//               </OverlayTrigger>
//             </li>
//           </ul>
//         </div>

//         {/* Lot Summary Bar */}
//         {lots.length > 0 && (
//           <div className="alert alert-success d-flex align-items-center justify-content-between mb-3">
//             <div className="d-flex align-items-center">
//               <Package className="me-2" size={20} />
//               <div>
//                 <strong>{lots.length} Lot(s) Created</strong> - {lots.reduce((sum, lot) => sum + lot.products.length, 0)} Products Total
//               </div>
//             </div>
//             <div className="d-flex gap-2">
//               <button 
//                 className="btn btn-sm btn-info"
//                 onClick={() => setShowLotsModal(true)}
//               >
//                 View Lots
//               </button>
//               <button 
//                 className="btn btn-sm btn-danger"
//                 onClick={handleClearDraft}
//               >
//                 Clear All
//               </button>
//             </div>
//           </div>
//         )}

//         <div className="alert alert-info d-flex align-items-center mb-3">
//           <Camera className="me-2" size={20} />
//           <div>
//             <strong>How it works:</strong> Select Article Profile & Warehouse → Scan products → Create Lot → Repeat for more lots → Submit All
//           </div>
//         </div>

//         {/* Lot Configuration */}
//         <div className="card mb-3">
//           <div className="card-body">
//             <h5 className="mb-3">
//               <Package size={20} className="me-2" />
//               {productsInLot.length > 0 ? `Current Lot (${productsInLot.length} products)` : "New Lot Configuration"}
//             </h5>
//             <div className="row">
//               <div className="col-lg-6">
//                 <div className="mb-3">
//                   <label className="form-label">
//                     Article Profile <span className="text-danger">*</span>
//                   </label>
//                   <Select
//                     className="select"
//                     options={articleProfiles}
//                     placeholder="Choose Article Profile"
//                     value={selectedArticleProfile}
//                     onChange={setSelectedArticleProfile}
//                     isDisabled={productsInLot.length > 0}
//                   />
//                   {productsInLot.length > 0 && (
//                     <small className="text-muted">Cannot change while products are in lot</small>
//                   )}
//                 </div>
//               </div>
//               <div className="col-lg-6">
//                 <div className="mb-3">
//                   <label className="form-label">
//                     Warehouse <span className="text-danger">*</span>
//                   </label>
//                   <Select
//                     className="select"
//                     options={warehouses}
//                     placeholder="Choose Warehouse"
//                     value={selectedWarehouse}
//                     onChange={setSelectedWarehouse}
//                     isDisabled={productsInLot.length > 0}
//                   />
//                   {productsInLot.length > 0 && (
//                     <small className="text-muted">Cannot change while products are in lot</small>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {productsInLot.length > 0 && (
//               <div className="alert alert-light border">
//                 <strong>Products in Current Lot:</strong>
//                 <div className="mt-2" style={{ maxHeight: "300px", overflowY: "auto" }}>
//                   {productsInLot.map((product, index) => (
//                     <div key={index} className="d-flex align-items-center justify-content-between mb-2 p-2 bg-white rounded border">
//                       <div className="flex-grow-1">
//                         <Badge bg="secondary" className="me-2">{product.barcode}</Badge>
//                         {product.title && <span className="me-2">{product.title}</span>}
//                         <Badge bg="info">{product.status}</Badge>
//                       </div>
//                       <div className="d-flex gap-1">
//                         <button
//                           className="btn btn-sm btn-warning"
//                           onClick={() => handleEditProductInLot(index)}
//                           title="Edit"
//                         >
//                           <Edit size={14} />
//                         </button>
//                         <button
//                           className="btn btn-sm btn-danger"
//                           onClick={() => handleRemoveProductFromLot(index)}
//                           title="Remove"
//                         >
//                           <Trash2 size={14} />
//                         </button>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//                 <button
//                   className="btn btn-success mt-2 w-100"
//                   onClick={handleCreateLot}
//                 >
//                   <Save className="me-2" size={16} />
//                   Save as Lot ({productsInLot.length} products)
//                 </button>
//               </div>
//             )}
//           </div>
//         </div>

//         {/* Product Entry Form */}
//         {selectedArticleProfile && selectedWarehouse && (
//           <div className="card mb-3">
//             <div className="card-body">
//               <h5 className="mb-3">
//                 <Camera size={20} className="me-2" />
//                 Add Product to Lot
//               </h5>
              
//               <div className="row align-items-end mb-3">
//                 <div className="col-lg-8">
//                   <label className="form-label">
//                     Scan or Enter Barcode <span className="text-danger">*</span>
//                     {isScanning && (
//                       <span className="spinner-border spinner-border-sm ms-2" />
//                     )}
//                     {barcodeVerified && (
//                       <span className="badge bg-success ms-2">Verified ✓</span>
//                     )}
//                     {existingProduct && (
//                       <span className="badge bg-danger ms-2">Already Exists</span>
//                     )}
//                   </label>
//                   <input
//                     type="text"
//                     className={`form-control ${barcodeVerified ? 'is-valid' : ''} ${existingProduct ? 'is-invalid' : ''}`}
//                     name="barcodeInput"
//                     value={barcodeInput}
//                     onChange={handleBarcodeInputChange}
//                     placeholder="Use scanner or type barcode"
//                     disabled={isScanning}
//                   />
//                   {barcodeVerified && (
//                     <div className="form-text text-success">
//                       ✓ Barcode verified - Ready to add
//                     </div>
//                   )}
//                   {existingProduct && (
//                     <div className="form-text text-danger">
//                       ✗ Product already exists in database
//                     </div>
//                   )}
//                 </div>
//                 <div className="col-lg-4">
//                   <button
//                     type="button"
//                     className="btn btn-primary w-100"
//                     onClick={() => handleVerifyBarcode(barcodeInput)}
//                     disabled={!barcodeInput.trim() || isScanning}
//                   >
//                     {isScanning ? "Checking..." : "Check Barcode"}
//                   </button>
//                 </div>
//               </div>

//               <div className="row">
//                 <div className="col-lg-6">
//                   <div className="mb-3">
//                     <label className="form-label">Product Name (Optional)</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       name="title"
//                       value={currentProduct.title}
//                       onChange={handleProductInputChange}
//                       placeholder="Enter product name"
//                     />
//                   </div>
//                 </div>
//                 <div className="col-lg-6">
//                   <div className="mb-3">
//                     <label className="form-label">In WH Location</label>
//                     <input
//                       type="text"
//                       className="form-control"
//                       name="in_wh_locn"
//                       value={currentProduct.in_wh_locn}
//                       onChange={handleProductInputChange}
//                       placeholder="Enter location"
//                     />
//                   </div>
//                 </div>
//               </div>

//               <div className="row">
//                 <div className="col-lg-6">
//                   <div className="mb-3">
//                     <label className="form-label">Status</label>
//                     <Select
//                       className="select"
//                       options={statusOptions}
//                       value={currentProduct.status}
//                       onChange={handleProductStatusChange}
//                     />
//                   </div>
//                 </div>
//                 <div className="col-lg-6">
//                   <div className="mb-3">
//                     <label className="form-label">Quantity</label>
//                     <div className="form-control">1</div>
//                   </div>
//                 </div>
//               </div>

//               <div className="mb-3">
//                 <label className="form-label">Description</label>
//                 <textarea
//                   className="form-control"
//                   rows={3}
//                   name="description"
//                   value={currentProduct.description}
//                   onChange={handleProductInputChange}
//                   placeholder="Enter product description"
//                 />
//               </div>

//               <button
//                 type="button"
//                 className="btn btn-primary w-100"
//                 onClick={handleAddProductToLot}
//                 disabled={!barcodeVerified || existingProduct}
//               >
//                 <PlusCircle className="me-2" size={16} />
//                 Add Product to Lot
//               </button>
//             </div>
//           </div>
//         )}

//         {/* Action Buttons */}
//         <div className="col-lg-12">
//           <div className="btn-addproduct mb-4">
//             <Link to={route.productlist} className="btn btn-cancel me-2">
//               Cancel
//             </Link>
//             {lots.length > 0 && (
//               <button
//                 type="button"
//                 className="btn btn-submit"
//                 onClick={handleSubmitAllLots}
//                 disabled={submitting}
//               >
//                 {submitting ? (
//                   <>
//                     <span className="spinner-border spinner-border-sm me-2" />
//                     Creating...
//                   </>
//                 ) : (
//                   <>
//                     <Save className="me-2" size={16} />
//                     Submit All Lots ({lots.length})
//                   </>
//                 )}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>

//       {/* Edit Product in Lot Modal */}
//       <Modal show={showEditProductModal} onHide={() => setShowEditProductModal(false)} centered>
//         <Modal.Header>
//           <Modal.Title>Edit Product in Lot</Modal.Title>
//           <button className="btn-close" onClick={() => setShowEditProductModal(false)}>
//             <X />
//           </button>
//         </Modal.Header>
//         <Modal.Body>
//           {editingProductData && (
//             <div>
//               <div className="mb-3">
//                 <label className="form-label">Product Name (Optional)</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   value={editingProductData.title}
//                   onChange={(e) => setEditingProductData(prev => ({ ...prev, title: e.target.value }))}
//                   placeholder="Enter product name"
//                 />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">In WH Location</label>
//                 <input
//                   type="text"
//                   className="form-control"
//                   value={editingProductData.in_wh_locn}
//                   onChange={(e) => setEditingProductData(prev => ({ ...prev, in_wh_locn: e.target.value }))}
//                   placeholder="Enter location"
//                 />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">Status</label>
//                 <Select
//                   className="select"
//                   options={statusOptions}
//                   value={editingProductData.status}
//                   onChange={(option) => setEditingProductData(prev => ({ ...prev, status: option }))}
//                 />
//               </div>
//               <div className="mb-3">
//                 <label className="form-label">Description</label>
//                 <textarea
//                   className="form-control"
//                   rows={3}
//                   value={editingProductData.description}
//                   onChange={(e) => setEditingProductData(prev => ({ ...prev, description: e.target.value }))}
//                   placeholder="Enter product description"
//                 />
//               </div>
//             </div>
//           )}
//         </Modal.Body>
//         <Modal.Footer>
//           <button className="btn btn-cancel" onClick={() => setShowEditProductModal(false)}>
//             Cancel
//           </button>
//           <button className="btn btn-submit" onClick={handleSaveEditedProduct}>
//             Save Changes
//           </button>
//         </Modal.Footer>
//       </Modal>

//       {/* Lots Modal */}
//       <Modal show={showLotsModal} onHide={() => setShowLotsModal(false)} size="xl">
//         <Modal.Header>
//           <Modal.Title>All Lots ({lots.length})</Modal.Title>
//           <button className="btn-close" onClick={() => setShowLotsModal(false)}>
//             <X />
//           </button>
//         </Modal.Header>
//         <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
//           {lots.map((lot) => (
//             <div key={lot.lotId} className="card mb-3">
//               <div className="card-header bg-light d-flex justify-content-between align-items-center">
//                 <div>
//                   <strong>{lot.lotId}</strong>
//                   <br />
//                   <small className="text-muted">
//                     {lot.article_profile.label} • {lot.warehouse.label} • {lot.products.length} products
//                   </small>
//                 </div>
//                 <button
//                   className="btn btn-sm btn-danger"
//                   onClick={() => handleDeleteLot(lot.lotId)}
//                 >
//                   <Trash2 size={14} />
//                 </button>
//               </div>
//               <div className="card-body">
//                 <div className="table-responsive">
//                   <table className="table table-sm table-hover">
//                     <thead>
//                       <tr>
//                         <th>#</th>
//                         <th>Barcode</th>
//                         <th>Prodcut Name</th>
//                         <th>Article Profile</th>
//                         <th>Warehouse</th>
//                         <th>Status</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {lot.products.map((product, prodIndex) => (
//                         <tr key={prodIndex}>
//                           <td>{prodIndex + 1}</td>
//                           <td><Badge bg="secondary">{product.barcode}</Badge></td>
//                           <td>{product.title || "—"}</td>
//                           <td>{product.article_profile_name || "—"}</td>
//                           <td>{product.warehouse_name || "—"}</td>
//                           <td><Badge bg="info">{product.status}</Badge></td>
//                         </tr>
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             </div>
//           ))}
//         </Modal.Body>
//       </Modal>
//     </div>
//   );
// };

// export default AddProduct;

// //with Add multiple product - End
