

import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { Sliders, Plus, X } from "react-feather";
import { PlusCircle } from "feather-icons-react/build/IconComponents";
import Select from "react-select";
import Swal from "sweetalert2";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDispatch, useSelector } from "react-redux";
import { debounce } from "lodash";
import TableHeaderActions from "../tableheader";
import { setToogleHeader } from "../../core/redux/action";
import {
  fetchArticles,
  fetchUnfilteredArticles,
  createArticle,
  updateArticle,
  setFilters,
  clearCurrentArticle,
  clearError,
  fetchArticleById,
} from '../../core/redux/slices/articleSlice';
import AuthService from "../../services/authService";
import { usePermissions } from "../../hooks/usePermission"; 

const ArticleProfile = () => {
  const dispatch = useDispatch();
  
  const { hasPermission } = usePermissions();
  
  const { 
    article_list, 
    currentArticle,
    status, 
    filters,
    error 
  } = useSelector((state) => state.articles);
  
  const currentUser = useSelector((state) => state.auth?.user); 
  const headerState = useSelector((state) => state.toggle_header);


  const [glossaries, setGlossaries] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [attributes, setAttributes] = useState([{ glossary_id: "", value: "" }]);
  // const [modalkey,setModalKey] = useState(0);
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    brand: "",
    model: "",
    year: new Date(),
    sku: "",
    weight: "",
    dimensions: "",
    unit_: "piece",
    description: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    handleRefresh();
    fetchGlossaries();
    //eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error,
        timer: 2000,
      });
      dispatch(clearError());
    }
  }, [error, dispatch]);

  useEffect(() => {
    if (currentArticle) {
      const attributesArray = [];
      if (currentArticle.attributes && typeof currentArticle.attributes === 'object') {
        Object.entries(currentArticle.attributes).forEach(([key, value]) => {
    
          if (glossaries.includes(key)) {
            attributesArray.push({
              glossary_id: key, 
              value: value
            });
          }
        });
      }

      let dimensionsStr = "";
      if (currentArticle.dimensions) {
        const dim = currentArticle.dimensions;
        dimensionsStr = `${dim.length}x${dim.width}x${dim.height}`;
      }

      setFormData({
        title: currentArticle.title || "",
        category: currentArticle.category || "",
        brand: currentArticle.brand || "",
        model: currentArticle.model || "",
        year: currentArticle.manufacturing_year ? new Date(currentArticle.manufacturing_year, 0) : new Date(),
        sku: currentArticle.sku || "",
        weight: currentArticle.weight || "",
        dimensions: dimensionsStr,
        unit_: currentArticle.unit || "piece",
        description: currentArticle.description || "",
      });

      setAttributes(attributesArray.length > 0 ? attributesArray : [{ glossary_id: "", value: "" }]);
    }
  }, [currentArticle, glossaries]);

  const handleRefresh = () => {
    dispatch(fetchUnfilteredArticles({}));
  };

  const fetchGlossaries = async () => {
    try {
      const response = await AuthService.getGlossaries();
     
      setGlossaries(response.data.data || []);
      console.log('Glossaries Response  --------------', response.data.data);
    } catch (error) {
      console.error("Error fetching glossaries:", error);
      setGlossaries([]);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await AuthService.getArticleCategories();
      setCategories(response.data.data || []);
      console.log('Categories Response  --------------',response.data.data)
    } catch (error) {
      console.error("Error fetching categories:", error);
      setCategories([]);
    }
  };

  const handleAddNewClick = () => {
    resetForm();
    fetchCategories(); 
    fetchGlossaries();
  };

  const debouncedSearch = useCallback(
    debounce((searchValue) => {
      dispatch(setFilters({ search: searchValue }));
      dispatch(fetchArticles({ ...filters, search: searchValue }));
    }, 500),
    [dispatch, filters]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    dispatch(setFilters({ search: value }));
    debouncedSearch(value);
  };

  const handleSearch = () => {
    handleRefresh();
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleYearChange = (date) => {
    setFormData({ ...formData, year: date });
  };

  const addAttribute = () => {
    setAttributes([...attributes, { glossary_id: "", value: "" }]);
  };

  const removeAttribute = (index) => {
    const newAttributes = attributes.filter((_, i) => i !== index);
    setAttributes(newAttributes);
  };

  const handleAttributeGlossaryChange = (index, selectedOption) => {
    const newAttributes = [...attributes];
    newAttributes[index].glossary_id = selectedOption?.value || "";
    newAttributes[index].value = "";
    setAttributes(newAttributes);
  };

  const handleAttributeValueChange = (index, value) => {
    const newAttributes = [...attributes];
    newAttributes[index].value = value;
    setAttributes(newAttributes);
  };

  const handleCategoryChange = (selectedOption) => {
    setFormData({ ...formData, category: selectedOption?.value || "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const more_attr = {};
      attributes
        .filter((attr) => attr.glossary_id && attr.value)
        .forEach((attr) => {
         
          more_attr[attr.glossary_id] = attr.value;
        });

      let dimensionsObj = undefined;
      if (formData.dimensions) {
        if (typeof formData.dimensions === 'string') {
          const dims = formData.dimensions.split('x').map(d => parseFloat(d.trim()));
          if (dims.length === 3 && dims.every(d => !isNaN(d))) {
            dimensionsObj = {
              length: dims[0],
              width: dims[1],
              height: dims[2]
            };
          }
        } else {
          dimensionsObj = formData.dimensions;
        }
      }

      const submitData = {
        art_prof_title: formData.title,
        category: formData.category,
        brand: formData.brand,
        model: formData.model,
        mfg_yr: formData.year.getFullYear(),
        more_attr: Object.keys(more_attr).length > 0 ? more_attr : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
        dim: dimensionsObj,
        unit: formData.unit_,
        desc: formData.description || undefined,
        last_updated_by: currentUser?.id || 'System'
      };

      Object.keys(submitData).forEach(key => 
        submitData[key] === undefined && delete submitData[key]
      );

      if (editingId) {
        await dispatch(updateArticle({ id: editingId, data: submitData })).unwrap();
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Article updated successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        await dispatch(createArticle(submitData)).unwrap();
        Swal.fire({
          icon: "success",
          title: "Success",
          text: "Article created successfully",
          timer: 2000,
          showConfirmButton: false,
        });
      }

     
      resetForm();
      handleRefresh();
    } catch (error) {
      console.error("Error saving article:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error || "Failed to save article",
        timer: 3000,
      });
    }
  };


const handleEdit = async (id) => {
  try {
    resetForm();               
    setEditingId(id);           

    await dispatch(fetchArticleById(id)).unwrap();

    fetchCategories();
    fetchGlossaries();

    const modal = new window.bootstrap.Modal(
      document.getElementById("article-modal")
    );
    modal.show();              
  } catch (error) {
    console.error("Error fetching article:", error);
    Swal.fire({
      icon: "error",
      title: "Error",
      text: "Failed to fetch article details",
      timer: 2000,
    });
  }
};


  // const closeModal = (modalId) => {
  //   const modal = document.getElementById(modalId);
  //   const backdrop = document.querySelector(".modal-backdrop");

  //   if (modal) {
  //     modal.classList.remove("show");
  //     modal.style.display = "none";
  //     document.body.classList.remove("modal-open");
  //     document.body.style.removeProperty("overflow");
  //     document.body.style.removeProperty("padding-right");
  //   }

  //   if (backdrop) {
  //     backdrop.remove();
  //   }
  // };

  const resetForm = () => {
    setFormData({
      title: "",
      category: "",
      brand: "",
      model: "",
      year: new Date(),
      sku: "",
      weight: "",
      dimensions: "",
      unit_: "piece",
      description: "",
    });
    setAttributes([{ glossary_id: "", value: "" }]);
    setEditingId(null);
    // setModalKey(prev => prev + 1);
    dispatch(clearCurrentArticle());
  };



  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = article_list.map((a) => a.id || a.uuid);
      setSelectedIds(allIds);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const sortOptions = [
    { value: "created_at_desc", label: "Newest First" },
    { value: "created_at_asc", label: "Oldest First" },
    { value: "title_asc", label: "Sort by Title (A-Z)" },
    { value: "title_desc", label: "Sort by Title (Z-A)" },
  ];

  const unitOptions = [
    { value: "piece", label: "Piece" },
    { value: "gram", label: "Gram" },
    { value: "kilogram", label: "Kilogram" },
    { value: "metre", label: "Metre" },
    { value: "litre", label: "Litre" },
  ];

 
  const glossaryOptions = glossaries.map((g) => ({
    label: g,
    value: g,
  }));

  const categoryOptions = categories.map(cat => ({ label: cat, value: cat }));

  const formatDimensions = (dimensions) => {
    if (!dimensions) return "N/A";
    if (typeof dimensions === 'object') {
      return `${dimensions.length}×${dimensions.width}×${dimensions.height}`;
    }
    return dimensions;
  };

  return (
    <div className="page-wrapper">
      <div className="content">
        <div className="page-header">
          <div className="add-item d-flex">
            <div className="page-title">
              <h4>Article Profile</h4>
              <h6>Manage Your Article Profiles</h6>
            </div>
          </div>
          <TableHeaderActions
            onRefresh={handleRefresh}
            pdfEndpoint="/auth/export/articles/pdf"
            excelEndpoint="/auth/export/articles/excel"
            entityName="articles"
            dispatch={dispatch}
            headerState={headerState}
            headerAction={setToogleHeader}
            showPrint={true}
          />
          {hasPermission("ArticleProfile", "create") && 
          (
            <div className="page-btn">
              
              <a 
                href="#"
                className="btn btn-added"
                data-bs-toggle="modal"
                data-bs-target="#article-modal"

                onClick={handleAddNewClick} 
              >
                <PlusCircle className="me-2" /> Add New Article
              </a>
            </div>
          )}
        </div>

        <div className="card table-list-card">
          <div className="card-body">
            <div className="table-top">
              <div className="search-set">
                <div className="search-input">
                  <input
                    type="text"
                    placeholder="Search"
                    className="form-control form-control-sm formsearch"
                    value={filters.search}
                    onChange={handleSearchChange}
                  />
                  <Link to="#" className="btn btn-searchset" onClick={handleSearch}>
                    <i data-feather="search" className="feather-search" />
                  </Link>
                </div>
              </div>
              <div className="form-sort stylewidth">
                <Sliders className="info-img" />
                <Select
                  className="select"
                  options={sortOptions}
                  placeholder="Sort by Date"
                  onChange={(option) => {
                    dispatch(setFilters({ sortBy: option?.value }));
                    setTimeout(handleRefresh, 100);
                  }}
                />
              </div>
            </div>

            <div className="table-responsive">
              {status === "loading" ? (
                <div className="text-center p-4">Loading...</div>
              ) : (
                <table className="table datanew">
                  <thead>
                    <tr>
                      <th className="no-sort">
                        <label className="checkboxs">
                          <input
                            type="checkbox"
                            id="select-all"
                            checked={
                              selectedIds.length === article_list.length &&
                              article_list.length > 0
                            }
                            onChange={handleSelectAll}
                          />
                          <span className="checkmarks" />
                        </label>
                      </th>
                      <th>Title</th>
                      <th>Category</th>
                      <th>Brand</th>
                      <th>Model</th>
                      <th>Year</th>
                      <th>SKU</th>
                      <th>Attributes</th>
                      <th>Weight</th>
                      <th>Dimensions</th>
                      <th>Unit</th>
                      <th>Description</th>
                      <th>Updated By</th>
                      <th>Created On</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {article_list.length === 0 ? (
                      <tr>
                        <td colSpan="15" className="text-center">
                          No articles found
                        </td>
                      </tr>
                    ) : (
                      article_list.map((article) => (
                        <tr key={article.id || article.uuid}>
                          <td>
                            <label className="checkboxs">
                              <input
                                type="checkbox"
                                checked={selectedIds.includes(article.id || article.uuid)}
                                onChange={() => handleSelectOne(article.id || article.uuid)}
                              />
                              <span className="checkmarks" />
                            </label>
                          </td>
                          <td>{article.title}</td>
                          <td>{article.category || "N/A"}</td>
                          <td>{article.brand || "N/A"}</td>
                          <td>{article.model || "N/A"}</td>
                          <td>{article.manufacturing_year || "N/A"}</td>
                          <td>{article.sku || "N/A"}</td>
                          <td>
                            {article.attributes && typeof article.attributes === 'object' && Object.keys(article.attributes).length > 0 ? (
                              <span 
                                title={Object.entries(article.attributes).map(
                                  ([key, value]) => `${key}: ${value}`
                                ).join(', ')}
                                style={{ cursor: 'pointer' }}
                              >
                                {Object.keys(article.attributes).length} attribute{Object.keys(article.attributes).length !== 1 ? 's' : ''}
                              </span>
                            ) : (
                              "No attributes"
                            )}
                          </td>
                          <td>{article.weight || "N/A"}</td>
                          <td>{formatDimensions(article.dimensions)}</td>
                          <td>
                            <span className="badge badge-linesuccess">
                              {article.unit}
                            </span>
                          </td>
                          <td
                            style={{
                              maxWidth: "200px",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            <span title={article.description || "N/A"}>
                              {article.description || "N/A"}
                            </span>
                          </td>
                          <td>{article.last_updated_by || "Unknown"}</td>
                          <td>
                            {new Date(article.created_at).toLocaleString()}
                          </td>
                          {/* <td>{article.last_updated_by || "Unknown"}</td> */}
                          <td className="action-table-data">
                                                        <div className="edit-delete-action">
                                                          {/* <Link
                                                          className="me-2 edit-icon p-2"
                                                          to="#"
                                                          onClick={() => handleEdit(warehouse.id)}
                                                          data-bs-toggle="modal"
                                                          data-bs-target="#edit-units"
                                                        >
                                                          <i data-feather="eye" className="feather-eye" />
                                                        </Link> */}
                                                          <Link
                                                            className="me-2 p-2"
                                                            to="#"
                                                            // onClick={() => handleEdit(article.id)}
                                                           
                                                            onClick={() => handleEdit(article.id || article.uuid)}

                                                          >
                                                            <i
                                                              data-feather="edit"
                                                              className="feather-edit"
                                                            />
                                                          </Link>
                                                          {/* <Link
                                                          className="confirm-text p-2"
                                                          to="#"
                                                          onClick={() => handleDelete(warehouse.id)}
                                                        >
                                                          <i data-feather="trash-2" className="feather-trash-2" />
                                                        </Link> */}
                                                        </div>
                                                      </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}

<div className="modal fade" id="article-modal">
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="page-wrapper-new p-0">
                <div className="content">
                  <div className="modal-header border-0 custom-modal-header">
                    <div className="page-title">
                      <h4>{editingId ? "Edit" : "Add"} Article</h4>
                    </div>
                    <button
                      type="button"
                      className="close"
                      data-bs-dismiss="modal"
                      aria-label="Close"
                      onClick={resetForm}
                    >
                      <span aria-hidden="true">×</span>
                    </button>
                  </div>
                  <div className="modal-body custom-modal-body">
                   <form onSubmit={handleSubmit}>

                      <div className="modal-title-head">
                        <h6>
                          <span>
                            <i data-feather="info" className="feather-edit" />
                          </span>
                          Article Info
                        </h6>
                      </div>
                      <div className="row">
                        <div className="col-lg-6">
                          <div className="mb-3">
                            <label className="form-label">Title *</label>
                            <input
                              type="text"
                              className="form-control"
                              name="title"
                              value={formData.title}
                              onChange={handleInputChange}
                              required
                            />
                           
                          </div>
                        </div>
                        
                        <div className="col-lg-6">
                          <div className="mb-3">
                            <label className="form-label">
                              Category * 
                            </label>
                            <Select
                              className="select"
                              options={categoryOptions}
                              value={categoryOptions.find(opt => opt.value === formData.category) || 
                                     (formData.category ? { label: formData.category, value: formData.category } : null)}
                              onChange={handleCategoryChange}
                              placeholder="Select or type category..."
                              isClearable
                              isSearchable
                            />
                          </div>
                        </div>
                        
                        <div className="col-lg-6">
                          <div className="mb-3">
                            <label className="form-label">Brand *</label>
                            <input
                              type="text"
                              className="form-control"
                              name="brand"
                              value={formData.brand}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="col-lg-3">
                          <div className="mb-3">
                            <label className="form-label">Model *</label>
                            <input
                              type="text"
                              className="form-control"
                              name="model"
                              value={formData.model}
                              onChange={handleInputChange}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="col-lg-3">
                          <div className="mb-3">
                            <label className="form-label">Year *</label> 
                            <DatePicker
                              selected={formData.year}
                              onChange={handleYearChange}
                              showYearPicker
                              dateFormat="yyyy"
                              className="form-control"
                              required
                            />
                          </div>
                        </div>
                      
                        <div className="col-lg-12">
                          <div className="mb-3">
                            <label className="form-label">
                              Attributes
                              <button
                                type="button"
                                className="btn btn-sm btn-primary ms-2"
                                onClick={addAttribute}
                              >
                                <Plus size={16} /> Add Attribute
                              </button>
                            </label>
                            {attributes.map((attr, index) => {
                              
                              const selectedGlossaries = attributes
                                .map((a, i) => i !== index ? a.glossary_id : null)
                                .filter(id => id !== null && id !== "");
                              
                            
                              const availableGlossaryOptions = glossaryOptions.filter(
                                option => !selectedGlossaries.includes(option.value)
                              );

                              return (
                                <div
                                  key={index}
                                  className="row align-items-end mb-2"
                                >
                                  <div className="col-5">
                                    <Select
                                      className="select"
                                      options={availableGlossaryOptions}
                                      value={glossaryOptions.find(
                                        (g) => g.value === attr.glossary_id
                                      )}
                                      onChange={(option) =>
                                        handleAttributeGlossaryChange(index, option)
                                      }
                                      placeholder="Select Attribute Type"
                                      isClearable
                                    />
                                  </div>
                                  <div className="col-5">
                                    <input
                                      type="text"
                                      className="form-control"
                                      placeholder="Enter value"
                                      value={attr.value}
                                      onChange={(e) =>
                                        handleAttributeValueChange(index, e.target.value)
                                      }
                                      disabled={!attr.glossary_id}
                                    />
                                  </div>
                                  <div className="col-2">
                                    {attributes.length > 1 && (
                                      <button
                                        type="button"
                                        className="btn btn-sm btn-danger"
                                        onClick={() => removeAttribute(index)}
                                      >
                                        <X size={16} />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="col-lg-6">
                          <div className="mb-3">
                            <label className="form-label">Weight</label>
                            <input
                              type="number"
                              className="form-control"
                              name="weight"
                              value={formData.weight}
                              onChange={handleInputChange}
                              step="0.01"
                            />
                          </div>
                        </div>
                        <div className="col-lg-6">
                          <div className="input-blocks">
                            <label>Unit *</label>
                            <Select
                              className="select"
                              options={unitOptions}
                              value={unitOptions.find(
                                (u) => u.value === formData.unit_
                              )}
                              onChange={(option) =>
                                setFormData({
                                  ...formData,
                                  unit_: option?.value || "piece",
                                })
                              }
                              required
                            />
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <div className="mb-3">
                            <label className="form-label">Dimensions (LxWxH)</label>
                            <input
                              type="text"
                              className="form-control"
                              name="dimensions"
                              value={formData.dimensions}
                              onChange={handleInputChange}
                              placeholder="e.g., 10x20x30"
                            />
                          </div>
                        </div>
                        <div className="col-lg-12">
                          <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea
                              className="form-control"
                              name="description"
                              value={formData.description}
                              onChange={handleInputChange}
                              rows="3"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="modal-footer-btn">
                        <button
                          type="button"
                          className="btn btn-cancel me-2"
                          data-bs-dismiss="modal"
                          onClick={resetForm}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="btn btn-submit">
                          {editingId ? "Save Changes" : "Create Article"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default ArticleProfile;