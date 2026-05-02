

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Select from "react-select";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { all_routes } from "../../Router/all_routes";
import {
  Edit,
  Package,
  Filter,
  PlusCircle,
  Sliders,
  Trash2,
  Info,
  X,
  Camera,
  Search as SearchIcon,
  Check,
  XCircle,
} from "feather-icons-react/build/IconComponents";
import { Modal } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { setToogleHeader } from "../../core/redux/action";
import ImageWithBasePath from "../../core/img/imagewithbasebath";
import AuthService from "../../services/authService";
import Table from "../../core/pagination/datatable";
import TableHeaderActions from "../tableheader";
import {
  fetchProducts,
  setFilters,
  resetFilters,
  updateProduct,
  deleteProduct as deleteProductAction,
  scanProduct,
  clearScannedProduct,
} from "../../core/redux/slices/productSlice";
import { usePermissions } from "../../hooks/usePermission";
import { useNavigate } from "react-router-dom";
import BulkUploadProduct from "./bulkuploadproduct";
// import { Upload } from "antd";



const ProductList = () => {
  const navigate = useNavigate();

  const route = all_routes;
  const dispatch = useDispatch();
  const MySwal = withReactContent(Swal);

  const { hasPermission } = usePermissions();

  const {
    product_list: products,
    pagination,
    filters,
    status: loadingStatus,

    scanStatus,
  } = useSelector((state) => state.products);

  const loading = loadingStatus === "loading";
  const scanning = scanStatus === "loading";

  // Redux data selector
  const data = useSelector((state) => state.toggle_header);

  // Local state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanInput, setScanInput] = useState("");
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [articleProfiles, setArticleProfiles] = useState([]);
  const [showBulkUploadModal, setShowBulkUploadModal] = useState(false);


 const [titleWasPresent, setTitleWasPresent] = useState(false);

  const [editingCell, setEditingCell] = useState(null);
  const [editingValue, setEditingValue] = useState("");
  const [inlineSubmitting, setInlineSubmitting] = useState(false);

  const [editFormData, setEditFormData] = useState({
    title: "",
    article_profile_id: null,
    warehouse_id: null,
    location: "",
    in_wh_locn: "",
    count: "",
    status: null,
    description: "",
  });

  useEffect(() => {
    dispatch(fetchProducts(filters));
    fetchFilterOptions();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(fetchProducts(filters));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line
  }, [filters.search]);

  useEffect(() => {
    dispatch(fetchProducts(filters));
    // eslint-disable-next-line
  }, [
    filters.page,
    filters.limit,
    filters.status,
    filters.warehouse_id,
    filters.article_profile_id,
    filters.sortBy,
    filters.sortOrder,
  ]);

  useEffect(() => {
    if (location.state?.openEditModal && location.state?.editProductId) {
      handleEditClick(location.state.editProductId);

      navigate(location.pathname, { replace: true, state: {} });
    }
    //eslint-disable-next-line
  }, [location.state]);

  const fetchFilterOptions = async () => {
    try {
      const [warehousesRes, articleProfilesRes] = await Promise.all([
        AuthService.getWarehouse(),
        AuthService.getArticles(),
      ]);

      const warehouseOptions = (
        warehousesRes.data.data ||
        warehousesRes.data ||
        []
      ).map((item) => ({
        value: item.wh_uuid,
        label: item.name || item.title,
      }));

      const articleProfileOptions = (
        articleProfilesRes.data.data ||
        articleProfilesRes.data ||
        []
      ).map((item) => ({
        value: item.uuid || item.art_prof_uuid,
        label: item.title || item.name,
      }));

      setWarehouses(warehouseOptions);
      setArticleProfiles(articleProfileOptions);
    } catch (error) {
      console.error("Error fetching filter options:", error);
    }
  };

  const handlePaginationChange = (paginationConfig) => {
    dispatch(
      setFilters({
        page: paginationConfig.page,
        limit: paginationConfig.limit,
      }),
    );
  };

  const handleFilterChange = (name, value) => {
    dispatch(setFilters({ [name]: value }));
  };

  const handleSearch = (e) => {
    const value = e.target.value;
    dispatch(setFilters({ search: value }));
  };

  const handleScanClick = () => {
    setScanInput("");
    setShowScanModal(true);
  };

  const handleScanSubmit = async (e) => {
    e.preventDefault();

    if (!scanInput.trim()) {
      MySwal.fire({
        icon: "warning",
        title: "Empty Input",
        text: "Please enter a partial_code",
        timer: 2000,
      });
      return;
    }
    
    // <p><strong>Unique Code:</strong> ${product.partial_code}</p>
    try {
      const product = await dispatch(scanProduct(scanInput.trim())).unwrap();

      MySwal.fire({
        title: `<strong>${product.partial_code}</strong>`,
        html: `
          <div style="text-align: left;">
           
            <p><strong>Article Profile:</strong> ${
              product.article_profile_name || "N/A"
            }</p>
            <p><strong>Warehouse:</strong> ${
              product.warehouse_name || "N/A"
            }</p>
            <p><strong>Location:</strong> ${product.location || "N/A"}</p>
            <p><strong>In Wh Location:</strong> ${
              product.in_wh_locn || "N/A"
            }</p>
            <p><strong>Quantity:</strong> ${product.count || 0}</p>
            <p><strong>Status:</strong> <span class="badge badge-${
              product.status === "new" ? "success" : "info"
            }">${product.status}</span></p>
            ${
              product.description
                ? `<p><strong>Description:</strong> ${product.description}</p>`
                : ""
            }
          </div>
        `,
        icon: "success",
        showCancelButton: true,
        confirmButtonText: "Edit Product",
        cancelButtonText: "Close",
      }).then((result) => {
        if (result.isConfirmed) {
          handleEditClick(product.prod_uuid);
        }
      });

      setShowScanModal(false);
      dispatch(clearScannedProduct());
    } catch (error) {
      MySwal.fire({
        icon: "error",
        pr_title: "Product Not Found",
        text: "No product found with this partial_code",
        timer: 3000,
      });
    }
  };

  
  const handleInlineEditStart = (rowId, field, currentValue) => {
    setEditingCell({ rowId, field });
    setEditingValue(currentValue || "");
  };

  const handleInlineEditCancel = () => {
    setEditingCell(null);
    setEditingValue("");
  };

  const handleInlineEditSave = async (productUuid) => {
    if (inlineSubmitting) return;

    try {
      setInlineSubmitting(true);

     
      const product = products.find((p) => p.prod_uuid === productUuid);
      
      if (!product) {
        throw new Error("Product not found");
      }

   
      const currentValue = product[editingCell.field] || "";
      const newValue = editingValue.trim();

      if (editingCell.field === "title" && newValue === "") {
      MySwal.fire({
        icon: "warning",
        title: "Warning",
        text: "Product Name cannot be blank",
        timer: 2000,
        showConfirmButton: false,
      });
      setInlineSubmitting(false);
      return;
    }

     
      if (currentValue === newValue) {
        setEditingCell(null);
        setEditingValue("");
        setInlineSubmitting(false);
        return; 
      }


    
      const updateData = {
        article_profile_id: product.article_profile_id,
        warehouse_id: product.status !== "installed" ? product.warehouse_id : undefined,
        location: product.location || undefined,
        in_wh_location: product.in_wh_locn || undefined,
        count: parseInt(product.count) || 0,
        status: product.status || "new",
        title: editingCell.field === "title" 
          ? (newValue || undefined) 
          : (product.title || undefined),
        description: editingCell.field === "description" 
          ? (newValue || undefined) 
          : (product.description || undefined),
      };

      await dispatch(
        updateProduct({
          prod_id: productUuid,
          data: updateData,
        }),
      ).unwrap();

      MySwal.fire({
        icon: "success",
        title: "Success!",
        text: "Product updated successfully",
        timer: 1500,
        showConfirmButton: false,
      });

      setEditingCell(null);
      setEditingValue("");
      dispatch(fetchProducts(filters));
    } catch (error) {
      console.error("Error updating product:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: error || "Failed to update product",
        timer: 3000,
      });
    } finally {
      setInlineSubmitting(false);
    }
  };

  const handleEditClick = (productUuid) => {
    const product = products.find((p) => p.prod_uuid === productUuid);

    if (!product) {
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: "Product not found",
        timer: 2000,
      });
      return;
    }

    const selectedWarehouse = warehouses.find(
      (w) => String(w.value) === String(product.warehouse_id),
    );

    const selectedArticleProfile = articleProfiles.find(
      (a) => String(a.value) === String(product.article_profile_id),
    );

    const selectedStatus = editStatusOptions.find(
      (s) => s.value === product.status,
    );

    // setEditingProduct(product);
    // setEditFormData({
    //   title: product.title || undefined,
    //   article_profile_id: selectedArticleProfile || null,
    //   warehouse_id: selectedWarehouse || null,
    //   location: product.location || "",
    //   in_wh_locn: product.in_wh_locn || "",
    //   count: product.count || "",
    //   status: selectedStatus || null,
    //   description: product.description || undefined,
    // });

    setEditingProduct(product);
setTitleWasPresent(!!product.title?.trim());

setEditFormData({
  title: product.title || "",
  article_profile_id: selectedArticleProfile || null,
  warehouse_id: selectedWarehouse || null,
  location: product.location || "",
  in_wh_locn: product.in_wh_locn || "",
  count: product.count || "",
  status: selectedStatus || null,
  description: product.description || "",
});


    setShowEditModal(true);
  };

  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditingProduct(null);
    setEditFormData({
      title: "",
      article_profile_id: null,
      warehouse_id: null,
      location: "",
      in_wh_locn: "",
      count: "",
      status: null,
      description: "",
    });
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    if (!editFormData.article_profile_id?.value) {
      MySwal.fire({
        icon: "warning",
        title: "Error",
        text: "Article profile is required",
        timer: 2000,
      });
      return;
    }

    if (
      editFormData.status?.value !== "installed" &&
      !editFormData.warehouse_id?.value
    ) {
      MySwal.fire({
        icon: "warning",
        title: "Error",
        text: "Warehouse is required",
        timer: 2000,
      });
      return;
    }

    if (
      editFormData.status?.value === "installed" &&
      !editFormData.location?.trim()
    ) {
      MySwal.fire({
        icon: "warning",
        title: "Error",
        text: "Location is required when status is 'Installed'",
        timer: 2000,
      });
      return;
    }

    if (titleWasPresent && !editFormData.title?.trim()) {
  MySwal.fire({
    icon: "warning",
    title: "Warning",
    text: "Product Name cannot be blank once it has been set",
    timer: 2000,
    showConfirmButton: false,
  });
  return;
}


    try {
      setSubmitting(true);

      const dataToSubmit = {
        title: editFormData.title || undefined,
        article_profile_id: editFormData.article_profile_id.value,
        warehouse_id:
          editFormData.status?.value !== "installed"
            ? editFormData.warehouse_id?.value
            : undefined,
        location: editFormData.location || undefined,
        in_wh_location: editFormData.in_wh_locn || undefined,
        count: parseInt(editFormData.count) || 0,
        status: editFormData.status?.value || "new",
        description: editFormData.description || undefined,
      };

      await dispatch(
        updateProduct({
          prod_id: editingProduct.prod_uuid,
          data: dataToSubmit,
        }),
      ).unwrap();

      MySwal.fire({
        icon: "success",
        title: "Success!",
        text: "Product updated successfully",
        timer: 2000,
        showConfirmButton: false,
      });

      handleCloseEditModal();
      dispatch(fetchProducts(filters));
    } catch (error) {
      console.error("Error updating product:", error);
      MySwal.fire({
        icon: "error",
        title: "Error",
        text: error || "Failed to update product",
        timer: 3000,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    MySwal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
      cancelButtonColor: "#3085d6",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await dispatch(deleteProductAction(id)).unwrap();
          MySwal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Product has been deleted.",
            timer: 2000,
            showConfirmButton: false,
          });
          dispatch(fetchProducts(filters));
        } catch (error) {
          console.error("Error deleting product:", error);
          MySwal.fire({
            icon: "error",
            title: "Error",
            text: error || "Failed to delete product",
            timer: 3000,
          });
        }
      }
    });
  };

  const handleSortChange = (option) => {
    const [sortBy, sortOrder] = option.value.split(":");
    dispatch(setFilters({ sortBy, sortOrder }));
  };

  const toggleFilterVisibility = () => {
    setIsFilterVisible((prev) => !prev);
  };

  const resetFiltersHandler = () => {
    dispatch(resetFilters());
    dispatch(fetchProducts(filters));
  };

  const handleBulkUploadSuccess = () => {
    dispatch(fetchProducts(filters));
    setShowBulkUploadModal(false);
  };

  const sortOptions = [
    { value: "created_at:DESC", label: "Newest First" },
    { value: "created_at:ASC", label: "Oldest First" },
    { value: "title:ASC", label: "Sort by Title (A-Z)" },
    { value: "title:DESC", label: "Sort by Title (Z-A)" },
    { value: "count:ASC", label: "Quantity Low to High" },
    { value: "count:DESC", label: "Quantity High to Low" },
  ];

  const statusOptions = [
    { value: "", label: "All Status" },
    { value: "new", label: "New" },
    { value: "used", label: "Used" },
    { value: "repaired", label: "Repaired" },
    { value: "broken", label: "Broken" },
    { value: "installed", label: "Installed" },
  ];

  const editStatusOptions = [
    { value: "new", label: "New" },
    { value: "used", label: "Used" },
    { value: "repaired", label: "Repaired" },
    { value: "broken", label: "Broken" },
    { value: "installed", label: "Installed" },
  ];

  const columns = [
    // {
    //   title: "Product Name",
    //   dataIndex: "title",
    //   render: (text, record) => {
    //     const isEditing = editingCell?.rowId === record.prod_uuid && editingCell?.field === "title";
        
    //     if (isEditing) {
    //       return (
    //         <div className="d-flex align-items-center gap-2">
    //           <input
    //             type="text"
    //             className="form-control form-control-sm"
    //             value={editingValue}
    //             onChange={(e) => setEditingValue(e.target.value)}
    //             onKeyDown={(e) => {
    //               if (e.key === "Enter") {
    //                 handleInlineEditSave(record.prod_uuid);
    //               } else if (e.key === "Escape") {
    //                 handleInlineEditCancel();
    //               }
    //             }}
    //             autoFocus
    //             disabled={inlineSubmitting}
    //           />
    //           <button
    //             className="btn btn-sm btn-success"
    //             onClick={() => handleInlineEditSave(record.prod_uuid)}
    //             disabled={inlineSubmitting}
    //             title="Save"
    //           >
    //             <Check size={14} />
    //           </button>
    //           <button
    //             className="btn btn-sm btn-danger"
    //             onClick={handleInlineEditCancel}
    //             disabled={inlineSubmitting}
    //             title="Cancel"
    //           >
    //             <XCircle size={14} />
    //           </button>
    //         </div>
    //       );
    //     }

    //     return (
    //       <span
    //         className="productimgname"
    //         onDoubleClick={() => handleInlineEditStart(record.prod_uuid, "title", text)}
    //         style={{ cursor: "pointer" }}
    //         title="Double-click to edit"
    //       >
    //         {text ? (
    //           <Link to={`/product-details/${record.prod_uuid}`}>{text}</Link>
    //         ) : (
    //           "--"
    //         )}
    //       </span>
    //     );
    //   },
    //   sorter: (a, b) => (a.title || "--").localeCompare(b.title || "--"),
    // },
    {
      title: "Barcode",
      dataIndex: "partial_code",
      render: (text, record) => (
        <span className="badge badge-secondary d-block mb-1">
          <Link className="text-white" to={`/product-details/${record.prod_uuid}`}>
            {text}
          </Link>
        </span>
      ),
      sorter: (a, b) => (a.partial_code || "").localeCompare(b.partial_code || ""),
    },
    {
      title: "Article Profile",
      dataIndex: "article_profile_name",
      render: (text) => text || "N/A",
      sorter: (a, b) =>
        (a.article_profile_name || "").localeCompare(
          b.article_profile_name || "",
        ),
    },
    {
      title: "Warehouse",
      dataIndex: "warehouse_name",
      render: (text) => text || "N/A",
      sorter: (a, b) =>
        (a.warehouse_name || "").localeCompare(b.warehouse_name || ""),
    },
    // {
    //   title: "Site Location",
    //   dataIndex: "location",
    //   render: (text) => text || "N/A",
    //   sorter: (a, b) => (a.location || "").localeCompare(b.location || ""),
    // },
    {
      title: "In WH-Location",
      dataIndex: "in_wh_locn",
      render: (text) => text || "N/A",
      sorter: (a, b) => (a.in_wh_locn || "").localeCompare(b.in_wh_locn || ""),
    },
    {
      title: "Quantity",
      dataIndex: "count",
      render: (text) => (
        <span className="badge badge-primary">{text || 0}</span>
      ),
      sorter: (a, b) => (a.count || 0) - (b.count || 0),
    },
     {
      title: "Description",
      dataIndex: "description",
      render: (text, record) => {
        const isEditing = editingCell?.rowId === record.prod_uuid && editingCell?.field === "description";
        
        if (isEditing) {
          return (
            <div className="d-flex align-items-center gap-2">
              <textarea
                className="form-control form-control-sm"
                value={editingValue}
                onChange={(e) => setEditingValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Escape") {
                    handleInlineEditCancel();
                  }
                }}
                rows={2}
                autoFocus
                disabled={inlineSubmitting}
              />
              <div className="d-flex flex-column gap-1">
                <button
                  className="btn btn-sm btn-success"
                  onClick={() => handleInlineEditSave(record.prod_uuid)}
                  disabled={inlineSubmitting}
                  title="Save"
                >
                  <Check size={14} />
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={handleInlineEditCancel}
                  disabled={inlineSubmitting}
                  title="Cancel"
                >
                  <XCircle size={14} />
                </button>
              </div>
            </div>
          );
        }

        const displayText = text || "N/A";
        const isTruncated = text && text.length > 20;
        const truncatedText = isTruncated ? text.substring(0, 20) + "..." : displayText;

        return (
          <span
            onDoubleClick={() => handleInlineEditStart(record.prod_uuid, "description", text)}
            style={{ cursor: "pointer" }}
            title={isTruncated ? text : "Double-click to edit"}
          >
            
            {truncatedText}
          </span>
        );
      },
      sorter: (a, b) =>
        (a.description || "").localeCompare(b.description || ""),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => (
        <span
          className={`badge ${
            text === "new"
              ? "badge-linesuccess"
              : text === "used"
                ? "badge-lineinfo"
                : text === "repaired"
                  ? "badge-linewarning"
                  : text === "broken"
                    ? "badge-linedanger"
                    : "badge-secondary"
          }`}
        >
          {text}
        </span>
      ),
      sorter: (a, b) => (a.status || "").localeCompare(b.status || ""),
    },
    {
      title: "Action",
      dataIndex: "actions",
      render: (_, record) => (
        <td className="action-table-data">
          <div className="edit-delete-action">
            <Link
              className="me-2 p-2"
              to="#"
              onClick={(e) => {
                e.preventDefault();
                handleEditClick(record.prod_uuid);
              }}
              title="Edit"
            >
              <Edit className="feather-edit" />
            </Link>

            {hasPermission("Product", "edit") && (
              <Link
                className="confirm-text p-2"
                to="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(record.id);
                }}
                title="Delete"
              >
                <Trash2 className="feather-trash-2" />
              </Link>
            )}
          </div>
        </td>
      ),
    },
  ];

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Product List</h4>
              <h6>Manage your products</h6>
            </div>
          </div>
          <TableHeaderActions
            onRefresh={() => dispatch(fetchProducts(filters))}
            pdfEndpoint="/auth/export/products/pdf"
            excelEndpoint="/auth/export/products/excel"
            filters={{
              search: filters.search,
              status: filters.status,
              warehouse_id: filters.warehouse_id,
              article_profile_id: filters.article_profile_id,
            }}
            entityName="products"
            dispatch={dispatch}
            headerState={data}
            headerAction={setToogleHeader}
            showPrint={true}
          />
  <div className="page-btn d-flex gap-2">
  <button onClick={handleScanClick} className="btn btn-secondary">
    <Camera className="me-2 iconsize" />
    Scan Product
  </button>
 {/* <button onClick={() => setShowBulkUploadModal(true)} className="btn btn-success">
    <Upload className="me-2 iconsize" />
    Bulk Upload
  </button> */}
  <Link to={route.lotproduct} className="btn btn-info">
    <Package className="me-2 iconsize" />
    Lot Upload
  </Link>
  <Link to={route.addproduct} className="btn btn-added">
    <PlusCircle className="me-2 iconsize" />
    Add New Product
  </Link>
</div>
        </div>

        <div className="card table-list-card">
          <div className="card-body">
            <div className="table-top">
              <div className="search-set">
                <div className="search-input">
                  <input
                    type="text"
                    placeholder="Search by name, or partial_code"
                    className="form-control form-control-sm formsearch"
                    value={filters.search}
                    onChange={handleSearch}
                  />
                  <Link to="#" className="btn btn-searchset">
                    <SearchIcon className="feather-search" />
                  </Link>
                </div>
              </div>
              <div className="search-path">
                <Link
                  className={`btn btn-filter ${
                    isFilterVisible ? "setclose" : ""
                  }`}
                >
                  <Filter
                    className="filter-icon"
                    onClick={toggleFilterVisibility}
                  />
                  <span onClick={toggleFilterVisibility}>
                    <ImageWithBasePath
                      src="assets/img/icons/closes.svg"
                      alt="img"
                    />
                  </span>
                </Link>
              </div>
              <div className="form-sort">
                <Sliders className="info-img" />
                <Select
                  className="select"
                  options={sortOptions}
                  placeholder="Sort By"
                  onChange={handleSortChange}
                  value={sortOptions.find(
                    (opt) =>
                      opt.value === `${filters.sortBy}:${filters.sortOrder}`,
                  )}
                />
              </div>
            </div>

            {/* Filter Section */}
            <div
              className={`card${isFilterVisible ? " visible" : ""}`}
              id="filter_inputs"
              style={{ display: isFilterVisible ? "block" : "none" }}
            >
              <div className="card-body pb-0">
                <div className="row">
                  <div className="col-lg-3 col-sm-6 col-12">
                    <div className="input-blocks">
                      <label>Warehouse</label>
                      <Select
                        className="select"
                        options={[
                          { value: "", label: "All Warehouses" },
                          ...warehouses,
                        ]}
                        placeholder="Choose Warehouse"
                        onChange={(option) =>
                          handleFilterChange(
                            "warehouse_id",
                            option?.value || "",
                          )
                        }
                        value={
                          warehouses.find(
                            (w) => w.value === filters.warehouse_id,
                          ) || {
                            value: "",
                            label: "All Warehouses",
                          }
                        }
                        isClearable
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-sm-6 col-12">
                    <div className="input-blocks">
                      <label>Article Profile</label>
                      <Select
                        className="select"
                        options={[
                          { value: "", label: "All Article Profiles" },
                          ...articleProfiles,
                        ]}
                        placeholder="Choose Article Profile"
                        onChange={(option) =>
                          handleFilterChange(
                            "article_profile_id",
                            option?.value || "",
                          )
                        }
                        value={
                          articleProfiles.find(
                            (ap) => ap.value === filters.article_profile_id,
                          ) || {
                            value: "",
                            label: "All Article Profiles",
                          }
                        }
                        isClearable
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-sm-6 col-12">
                    <div className="input-blocks">
                      <label>Status</label>
                      <Select
                        className="select"
                        options={statusOptions}
                        placeholder="Status"
                        onChange={(option) =>
                          handleFilterChange("status", option?.value || "")
                        }
                        value={
                          statusOptions.find(
                            (s) => s.value === filters.status,
                          ) || {
                            value: "",
                            label: "All Status",
                          }
                        }
                        isClearable
                      />
                    </div>
                  </div>
                  <div className="col-lg-3 col-sm-6 col-12">
                    <div className="input-blocks">
                      <a
                        className="btn btn-filters ms-auto w-100"
                        onClick={resetFiltersHandler}
                      >
                        Reset Filters
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Table with Pagination */}
            <div className="table-responsive">
              <p className="text-muted small mb-2">
                <i>Tip: Double-click on Product Name or Description to edit inline</i>
              </p>
              {loading ? (
                <div className="text-center p-5">
                  <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center p-5">
                  <p>No products found</p>
                </div>
              ) : (
                <Table
                  key={`${filters.page}-${filters.limit}`}
                  columns={columns}
                  dataSource={products}
                  pagination={pagination}
                  filters={filters}
                  onPaginationChange={handlePaginationChange}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scan Product Modal */}
      <Modal
        show={showScanModal}
        onHide={() => setShowScanModal(false)}
        centered
      >
        <Modal.Header>
          <Modal.Title>Scan Product</Modal.Title>
          <button
            type="button"
            className="btn-close"
            onClick={() => setShowScanModal(false)}
            disabled={scanning}
          >
            <X />
          </button>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleScanSubmit}>
            <div className="mb-3">
              <label className="form-label">Enter partial_code</label>
              <input
                type="text"
                className="form-control"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
                placeholder="Scan or type partial_code"
                autoFocus
                disabled={scanning}
              />
              <small className="text-muted">
                Use a partial_code scanner or manually enter the code
              </small>
            </div>
            <div className="d-flex gap-2">
              <button
                type="button"
                className="btn btn-cancel flex-fill"
                onClick={() => setShowScanModal(false)}
                disabled={scanning}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-submit flex-fill"
                disabled={scanning}
              >
                {scanning ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Searching...
                  </>
                ) : (
                  <>
                    <SearchIcon className="me-2" size={16} />
                    Find Product
                  </>
                )}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>

      <BulkUploadProduct
        show={showBulkUploadModal}
        onHide={() => setShowBulkUploadModal(false)}
        onSuccess={handleBulkUploadSuccess}  
      />

      {/* Edit Product Modal */}
      <Modal
        show={showEditModal}
        onHide={handleCloseEditModal}
        size="xl"
        centered
      >
        <Modal.Header>
          <Modal.Title>Edit Product</Modal.Title>
          <button
            type="button"
            className="btn-close"
            onClick={handleCloseEditModal}
            disabled={submitting}
          >
            <X />
          </button>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleEditSubmit}>
            <div className="card mb-0">
              <div className="card-body edit-product pb-0">
                <div
                  className="accordion-card-one accordion"
                  id="accordionExample"
                >
                  <div className="accordion-item">
                    <div className="accordion-header" id="headingOne">
                      <div className="accordion-button">
                        <div className="addproduct-icon">
                          <h5>
                            <Info className="add-info" />
                            <span>Product Information</span>
                          </h5>
                        </div>
                      </div>
                    </div>
                    <div
                      id="collapseOne"
                      className="accordion-collapse collapse show"
                    >
                      <div className="accordion-body">
                        {/* Display Read-only partial_code */}
                        {editingProduct && (
                          <div className="row mb-3">
                            <div className="col-lg-4">
                              <div className="mb-3">
                                <label className="form-label">
                                  partial_code (Read-only)
                                </label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={editingProduct.partial_code}
                                  disabled
                                  readOnly
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        <div className="row">
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="mb-3 edit-product">
                              <label className="form-label">
                                Article Profile{" "}
                                <span className="text-muted">(Read-only)</span>
                              </label>
                              <Select
                                options={articleProfiles}
                                value={editFormData.article_profile_id}
                                placeholder="Select Article Profile"
                                isDisabled={true}
                                styles={{
                                  control: (base) => ({
                                    ...base,
                                    backgroundColor: '#e9ecef',
                                    cursor: 'not-allowed'
                                  })
                                }}
                              />
                              <small className="text-muted">
                                Article profile cannot be changed after creation
                              </small>
                            </div>
                          </div>
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="mb-3 edit-product">
                              <label className="form-label">
                                Warehouse{" "}
                                {editFormData.status?.value !== "installed" && (
                                  <span className="text-danger">*</span>
                                )}
                              </label>
                              <Select
                                options={warehouses}
                                value={editFormData.warehouse_id}
                                onChange={(option) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    warehouse_id: option,
                                  }))
                                }
                                placeholder="Select Warehouse"
                                isDisabled={
                                  editFormData.status?.value === "installed"
                                }
                              />
                              {editFormData.status?.value === "installed" && (
                                <small className="text-muted">
                                  Warehouse is not required for installed items
                                </small>
                              )}
                            </div>
                          </div>
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="mb-3 edit-product">
                              <label className="form-label">
                                Location
                                {editFormData.status?.value === "installed" && (
                                  <span className="text-danger">*</span>
                                )}
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                name="location"
                                value={editFormData.location}
                                onChange={handleEditInputChange}
                                placeholder="Enter location"
                                required={
                                  editFormData.status?.value === "installed"
                                }
                              />
                              {editFormData.status?.value === "installed" && (
                                <small className="text-muted">
                                  Location is required for installed items
                                </small>
                              )}
                            </div>
                          </div>
                          <div className="col-lg-4 col-sm-6 col-12">
                            <div className="mb-3 edit-product">
                              <label className="form-label">
                                In Wh Location
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                name="in_wh_locn"
                                value={editFormData.in_wh_locn}
                                onChange={handleEditInputChange}
                                placeholder="Enter location"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="row">
                          <div className="col-lg-6 col-sm-6 col-12">
                            <div className="mb-3 edit-product">
                              <label className="form-label">
                                Product Name (optional)
                              </label>
                              <input
                                type="text"
                                className="form-control"
                                name="title"
                                value={editFormData.title}
                                onChange={handleEditInputChange}
                                placeholder="Enter product name"
                              />
                            </div>
                          </div>
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="mb-3 edit-product">
                              <label className="form-label">Quantity</label>
                              <input
                                type="number"
                                className="form-control"
                                name="count"
                                value={editFormData.count}
                                onChange={handleEditInputChange}
                                placeholder="Enter quantity"
                                min="0"
                              />
                            </div>
                          </div>
                          <div className="col-lg-3 col-sm-6 col-12">
                            <div className="mb-3 edit-product">
                              <label className="form-label">Status</label>
                              <Select
                                className="select"
                                options={editStatusOptions}
                                placeholder="Choose Status"
                                value={editFormData.status}
                                onChange={(option) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    status: option,
                                  }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <div className="input-blocks summer-description-box transfer mb-3">
                            <label>Description</label>
                            <textarea
                              className="form-control h-100"
                              rows={5}
                              name="description"
                              value={editFormData.description}
                              onChange={handleEditInputChange}
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

            <div className="modal-footer-btn">
              <button
                type="button"
                className="btn btn-cancel me-2"
                onClick={handleCloseEditModal}
                disabled={submitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-submit"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                      aria-hidden="true"
                    ></span>
                    Updating...
                  </>
                ) : (
                  "Update Product"
                )}
              </button>
            </div>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default ProductList;