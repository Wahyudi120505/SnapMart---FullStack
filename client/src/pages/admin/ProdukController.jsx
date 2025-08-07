/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { ProductService } from "../../services/ProductService";
import { motion } from "framer-motion";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Frown,
  Sliders,
  X,
  Package,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import AdminSidebar from "../../componens/admin/AdminSidebar";

const ProductManagement = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);

  const [newProduct, setNewProduct] = useState({
    nama: "",
    harga: "",
    stok: "",
    keterangan: "",
    kategori: "",
  });

  const [updateProduct, setUpdateProduct] = useState({
    nama: "",
    harga: "",
    stok: "",
    keterangan: "",
    kategori: "",
  });

  const [productImage, setProductImage] = useState(null);
  const [updateImage, setUpdateImage] = useState(null);
  const [currentImageUrl, setCurrentImageUrl] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    size: 4,
    totalItems: 0,
  });

  const [filters, setFilters] = useState({
    nama: "",
    kategori: "",
    sortBy: "nama",
    sortOrder: "asc",
    minPrice: "",
    maxPrice: "",
  });

  const fetchProducts = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await ProductService.allProducts({
        page: pagination.page,
        size: pagination.size,
        ...filters,
      });

      if (response.success) {
        setProducts(response.data.items);
        setPagination((prev) => ({
          ...prev,
          totalItems: response.data.totalItem,
        }));
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [pagination.page, filters]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSort = (column) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder:
        prev.sortBy === column && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
    }));
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const totalPages = Math.ceil(pagination.totalItems / pagination.size);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await ProductService.addProduct(
        newProduct,
        productImage
      );

      if (response.success) {
        fetchProducts();
        setShowAddModal(false);
        resetForm();
      }
    } catch (err) {
      setError(err.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setNewProduct({
      nama: "",
      harga: "",
      stok: "",
      keterangan: "",
      kategori: "",
    });
    setProductImage(null);
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setProductImage(e.target.files[0]);
    }
  };

  const handleUpdateImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUpdateImage(e.target.files[0]);
    }
  };

  const openUpdateModal = (product) => {
    setCurrentProductId(product.id);
    setUpdateProduct({
      nama: product.nama,
      harga: product.harga,
      stok: product.stok,
      keterangan: product.keterangan,
      kategori: product.kategori,
    });
    setCurrentImageUrl(
      product.image ? `data:image/jpeg;base64,${product.image}` : null
    );
    setUpdateImage(null);
    setShowUpdateModal(true);
  };

  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await ProductService.updateProduct(
        currentProductId,
        updateProduct,
        updateImage
      );

      if (response.success) {
        fetchProducts();
        setShowUpdateModal(false);
        setUpdateImage(null);
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError(err.message || "Failed to update product");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    setLoading(true);
    setError(null);

    try {
      const response = await ProductService.deleteProduct(id);

      if (response.success) {
        fetchProducts();
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError(err.message || "Failed to delete product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <AdminSidebar menuActive="produk" />

      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-orange-500 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
        </div>

        {/* Header Section */}
        <div className="mb-6 relative z-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-transparent">
                Product Management
              </h1>
              <p className="text-slate-400 mt-1 text-sm sm:text-base">
                Manage your store products
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2.5 rounded-xl hover:from-orange-500 hover:to-red-500 transition-all duration-200 flex items-center justify-center disabled:opacity-50 shadow-lg hover:shadow-orange-500/25 relative overflow-hidden group"
              disabled={loading}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </motion.button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mt-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-sm text-red-300 flex items-center backdrop-blur-sm"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto px-3 py-1 text-sm bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors duration-200"
                aria-label="Dismiss error"
              >
                <X size={16} />
              </button>
            </motion.div>
          )}
        </div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-2xl border border-slate-700/50 mb-6 relative z-10"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-white">Filters</h2>
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="md:hidden text-slate-400 hover:text-orange-400 transition-colors"
            >
              <Sliders size={20} />
            </button>
          </div>

          <div className={`${isFilterOpen ? "block" : "hidden md:block"}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Name
                </label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-orange-400 transition-colors" />
                  <input
                    type="text"
                    name="nama"
                    value={filters.nama}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                    placeholder="Search products"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Category
                </label>
                <select
                  name="kategori"
                  value={filters.kategori}
                  onChange={handleFilterChange}
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                >
                  <option value="">All Categories</option>
                  <option value="Makanan">Food</option>
                  <option value="Minuman">Drink</option>
                  <option value="Aksesoris">Accessories</option>
                  <option value="Obat-obatan">Medicine</option>
                  <option value="Elektronik">Electronics</option>
                  <option value="Kecantikan">Beauty</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                    placeholder="Min"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                    placeholder="Max"
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-end space-x-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setFilters({
                      nama: "",
                      kategori: "",
                      sortBy: "nama",
                      sortOrder: "asc",
                      minPrice: "",
                      maxPrice: "",
                    });
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 text-slate-300 rounded-xl hover:bg-slate-700/70 hover:text-white transition-all duration-200 backdrop-blur-sm"
                >
                  Reset
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={fetchProducts}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-500 hover:to-red-500 transition-all duration-200 shadow-lg hover:shadow-orange-500/25 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  Apply
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Product Content Section */}
        {loading ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 relative z-10"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
            <span className="text-slate-400 text-sm">Loading products...</span>
          </motion.div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center bg-slate-800/30 rounded-2xl border border-slate-700/50 relative z-10"
          >
            <Frown className="h-12 w-12 text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-1">
              No Products Found
            </h3>
            <p className="text-slate-500 max-w-md">
              {error
                ? "Error loading products"
                : "Try adjusting your search filters"}
            </p>
            {error && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchProducts}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-500 hover:to-red-500 transition-colors duration-200"
              >
                Try Again
              </motion.button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Sorting Controls */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 relative z-10">
              <div className="text-sm text-slate-400">
                Showing {(pagination.page - 1) * pagination.size + 1}-
                {Math.min(
                  pagination.page * pagination.size,
                  pagination.totalItems
                )}{" "}
                of {pagination.totalItems} products
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 whitespace-nowrap">
                  Sort by:
                </span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm text-slate-200 backdrop-blur-sm"
                >
                  <option value="nama">Name</option>
                  <option value="harga">Price</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSort(filters.sortBy)}
                  className="p-2 text-slate-400 hover:text-orange-400 hover:bg-slate-700/50 rounded-xl transition-all"
                >
                  {filters.sortOrder === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Product Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10">
              {products.map((product, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-orange-500/30 group"
                >
                  <div className="relative h-48 bg-slate-700/30">
                    {product.image ? (
                      <img
                        src={`data:image/jpeg;base64,${product.image}`}
                        alt={product.nama}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-500">
                        <Package className="h-12 w-12" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          product.status === "Tersedia"
                            ? "bg-green-900/50 text-green-300 border border-green-700/50"
                            : "bg-red-900/50 text-red-300 border border-red-700/50"
                        }`}
                      >
                        {product.status}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-white line-clamp-1 group-hover:text-orange-400 transition-colors">
                          {product.nama}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                          {product.keterangan}
                        </p>
                      </div>
                      <span className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded-full text-xs whitespace-nowrap border border-slate-600/50">
                        {product.kategori}
                      </span>
                    </div>
                    <div className="mt-3 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-white-400">
                          {formatPrice(product.harga)}
                        </p>
                        <p
                          className={`text-xs mt-1 ${
                            product.stok > 10
                              ? "text-green-400"
                              : product.stok > 0
                              ? "text-yellow-400"
                              : "text-red-400"
                          }`}
                        >
                          Stock: {product.stok}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openUpdateModal(product)}
                          className="p-2 text-orange-400 hover:bg-orange-500/10 rounded-full transition-colors border border-orange-500/20"
                          title="Edit"
                        >
                          <Edit className="h-4 w-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDeleteProduct(product.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-full transition-colors border border-red-500/20"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
                <div className="text-sm text-slate-400">
                  Page {pagination.page} of {totalPages}
                </div>
                <nav className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="p-2 rounded-xl bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </motion.button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum =
                      Math.max(
                        1,
                        Math.min(pagination.page - 2, totalPages - 4)
                      ) + i;
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          pagination.page === pageNum
                            ? "bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-lg"
                            : "bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700/70 hover:text-white"
                        } transition-all duration-200`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= totalPages}
                    className="p-2 rounded-xl bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                </nav>
              </div>
            )}
          </>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-slate-700/50 relative"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
                <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Add New Product
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowAddModal(false)}
                  className="text-slate-400 hover:text-orange-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <form onSubmit={handleAddProduct} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={newProduct.nama}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, nama: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      value={newProduct.harga}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, harga: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={newProduct.stok}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, stok: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={newProduct.kategori}
                      onChange={(e) =>
                        setNewProduct({ ...newProduct, kategori: e.target.value })
                      }
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Makanan">Food</option>
                      <option value="Minuman">Drink</option>
                      <option value="Aksesoris">Accessories</option>
                      <option value="Obat-obatan">Medicine</option>
                      <option value="Elektronik">Electronics</option>
                      <option value="Kecantikan">Beauty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={newProduct.keterangan}
                      onChange={(e) =>
                        setNewProduct({
                          ...newProduct,
                          keterangan: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Product Image
                    </label>
                    <input
                      type="file"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-slate-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-orange-900/30 file:text-orange-400
                        hover:file:bg-orange-900/50"
                      accept="image/*"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2.5 border border-slate-600/50 text-slate-300 rounded-xl hover:bg-slate-700/50 transition-all duration-200"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-500 hover:to-red-500 disabled:opacity-50 flex items-center shadow-lg hover:shadow-orange-500/25 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                    Add Product
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {/* Update Product Modal */}
        {showUpdateModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md border border-slate-700/50 relative"
            >
              <div className="flex justify-between items-center p-6 border-b border-slate-700/50">
                <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  Update Product
                </h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowUpdateModal(false);
                    setUpdateImage(null);
                  }}
                  className="text-slate-400 hover:text-orange-400 transition-colors"
                >
                  <X className="h-5 w-5" />
                </motion.button>
              </div>

              <form onSubmit={handleUpdateProduct} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Product Name
                    </label>
                    <input
                      type="text"
                      value={updateProduct.nama}
                      onChange={(e) =>
                        setUpdateProduct({
                          ...updateProduct,
                          nama: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Price
                    </label>
                    <input
                      type="number"
                      value={updateProduct.harga}
                      onChange={(e) =>
                        setUpdateProduct({
                          ...updateProduct,
                          harga: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Stock
                    </label>
                    <input
                      type="number"
                      value={updateProduct.stok}
                      onChange={(e) =>
                        setUpdateProduct({
                          ...updateProduct,
                          stok: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Category
                    </label>
                    <select
                      value={updateProduct.kategori}
                      onChange={(e) =>
                        setUpdateProduct({
                          ...updateProduct,
                          kategori: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="Makanan">Food</option>
                      <option value="Minuman">Drink</option>
                      <option value="Aksesoris">Accessories</option>
                      <option value="Obat-obatan">Medicine</option>
                      <option value="Elektronik">Electronics</option>
                      <option value="Kecantikan">Beauty</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={updateProduct.keterangan}
                      onChange={(e) =>
                        setUpdateProduct({
                          ...updateProduct,
                          keterangan: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                      rows="3"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Product Image
                    </label>
                    {currentImageUrl && (
                      <div className="mb-2">
                        <p className="text-xs text-slate-400 mb-1">
                          Current Image:
                        </p>
                        <img
                          src={currentImageUrl}
                          alt="Current product"
                          className="h-20 w-20 object-cover rounded-md border border-slate-600/50"
                        />
                      </div>
                    )}
                    <input
                      type="file"
                      onChange={handleUpdateImageChange}
                      className="block w-full text-sm text-slate-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-xl file:border-0
                        file:text-sm file:font-semibold
                        file:bg-orange-900/30 file:text-orange-400
                        hover:file:bg-orange-900/50"
                      accept="image/*"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {currentImageUrl
                        ? "Select a new image to replace the current one, or leave blank to keep it"
                        : "No image available, please upload one"}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => {
                      setShowUpdateModal(false);
                      setUpdateImage(null);
                    }}
                    className="px-4 py-2.5 border border-slate-600/50 text-slate-300 rounded-xl hover:bg-slate-700/50 transition-all duration-200"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl hover:from-orange-500 hover:to-red-500 disabled:opacity-50 flex items-center shadow-lg hover:shadow-orange-500/25 relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {loading && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
                    Update Product
                  </motion.button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ProductManagement;