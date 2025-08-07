/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Package,
  Grid,
  List,
  RefreshCw,
  ShoppingCart,
  Eye,
  X,
  Trash2,
  Download,
} from "lucide-react";
import { ProductService } from "../../services/ProductService";
import { OrderService } from "../../services/OrderService";

const ProductsController = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 4,
    totalItem: 0,
  });
  const [filters, setFilters] = useState({
    nama: "",
    kategori: "",
    sortBy: "nama",
    sortOrder: "asc",
    minPrice: "",
    maxPrice: "",
  });

  const categories = [
    "Semua Kategori",
    "Aksesoris",
    "Makanan",
    "Minuman",
    "Elektronik",
    "Kecantikan",
    "Obat-obatan",
  ];

  const fetchProducts = useCallback(async () => {
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
          totalItem: response.data.totalItem,
        }));
      } else {
        throw new Error(response.message);
      }
    } catch (err) {
      setError(err.message || "Failed to fetch products");
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.size, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Close cart on Esc key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isCartOpen) {
        setIsCartOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isCartOpen]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
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

  const resetFilters = () => {
    setFilters({
      nama: "",
      kategori: "",
      sortBy: "nama",
      sortOrder: "asc",
      minPrice: "",
      maxPrice: "",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const totalPages = Math.ceil(pagination.totalItem / pagination.size);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const addToCart = (product) => {
    setCartItems((prev) => {
      const existingItem = prev.find((item) => item.id === product.id);
      if (existingItem) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [...prev, { ...product, quantity: 1 }];
      }
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId) => {
    setCartItems((prev) => prev.filter((item) => item.id !== productId));
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems((prev) =>
      prev.map((item) =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const cartTotal = cartItems.reduce(
    (total, item) => total + item.harga * item.quantity,
    0
  );

  const handleReceipt = async (id) => {
    setIsGeneratingReceipt(true);
    setReceiptUrl(null);
    try {
      const blob = await OrderService.receipt(id);
      const url = window.URL.createObjectURL(blob);
      setReceiptUrl(url);
    } catch (error) {
      console.error("Failed to generate receipt:", error);
      setError("Gagal membuat struk: " + (error.message || "Unknown error"));
    } finally {
      setIsGeneratingReceipt(false);
    }
  };

  const downloadLinkRef = useRef(null);

  const handleDownloadReceipt = () => {
    if (receiptUrl && downloadLinkRef.current) {
      downloadLinkRef.current.click();
      setTimeout(() => {
        window.URL.revokeObjectURL(receiptUrl);
      }, 100);
    }
  };

  const submitOrder = async () => {
    try {
      const orderData = {
        items: cartItems.map((item) => ({
          produkId: item.id,
          jumlah: item.quantity,
        })),
      };
      const response = await OrderService.createOrder(orderData);
      if (response.success) {
        setCartItems([]);
        setIsCartOpen(false);
        await handleReceipt(response.data.pemesananId);
        console.log(response.data.pemesananId);
      } else {
        throw new Error(response.message || "Failed to create order");
      }
    } catch (error) {
      console.error("Failed to submit order:", error);
      setError("Gagal membuat pesanan: " + (error.message || "Unknown error"));
    }
  };

  const handleShowDetail = (product) => {
    setSelectedProduct(product);
    setShowDetailModal(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white pt-24 px-6 pb-6 relative overflow-hidden"
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-orange-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full blur-3xl"></div>
      </div>

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      ></div>

      <div className="relative z-0 max-w-7xl mx-auto">
        <div className="flex items-center mb-8">
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-transparent tracking-wide"
          >
            Product Management
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-slate-700/50 p-6 mb-6 relative overflow-hidden z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10 pointer-events-none"></div>

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                <Package className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">All Products</h1>
                <p className="text-slate-400">
                  Manage and view all products in the store
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  setViewMode(viewMode === "grid" ? "list" : "grid")
                }
                className="p-2 border border-slate-600 rounded-lg hover:border-orange-500 transition-colors"
                aria-label={`Switch to ${
                  viewMode === "grid" ? "list" : "grid"
                } view`}
              >
                {viewMode === "grid" ? (
                  <List className="w-5 h-5 text-slate-300" />
                ) : (
                  <Grid className="w-5 h-5 text-slate-300" />
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchProducts}
                className="p-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-500 hover:to-red-500 transition-colors"
                aria-label="Refresh products"
              >
                <RefreshCw
                  className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartOpen(true)}
                className="p-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-500 hover:to-red-500 transition-colors flex items-center"
                aria-label="Open cart"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartItems.length > 0 && (
                  <span className="ml-1 bg-white text-orange-600 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                name="nama"
                placeholder="Search for products..."
                value={filters.nama}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                aria-label="Search products"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 px-4 py-2 border border-slate-600 rounded-lg hover:border-orange-500 transition-colors"
              aria-label="Toggle filters"
            >
              <Filter className="w-5 h-5 text-slate-300" />
              <span className="text-slate-300">Filter</span>
              {isFilterOpen ? (
                <ChevronUp className="w-4 h-4 text-slate-300" />
              ) : (
                <ChevronDown className="w-4 h-4 text-slate-300" />
              )}
            </motion.button>
          </div>

          {/* Advanced Filters */}
          <motion.div
            initial={false}
            animate={{
              height: isFilterOpen ? "auto" : 0,
              opacity: isFilterOpen ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-slate-700 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <select
                  name="kategori"
                  value={filters.kategori}
                  onChange={handleFilterChange}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                  aria-label="Filter by category"
                >
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category === "All Categories" ? "" : category}
                      className="bg-slate-800"
                    >
                      {category}
                    </option>
                  ))}
                </select>

                <input
                  type="number"
                  name="minPrice"
                  placeholder="Minimum price"
                  value={filters.minPrice}
                  onChange={handleFilterChange}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                  aria-label="Minimum price"
                />

                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Maximum price"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
                  aria-label="Maximum price"
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetFilters}
                  className="px-4 py-2 bg-slate-700/50 text-slate-300 rounded-lg hover:bg-slate-700/70 transition-colors"
                  aria-label="Reset filters"
                >
                  Reset Filter
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-slate-700/50 p-4 mb-6"
        >
          <div className="flex items-center justify-between">
            <p className="text-slate-400">
              Showing {products.length} from {pagination.totalItem} product
            </p>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
                setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
              }}
              className="px-3 py-1 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg text-sm focus:ring-2 focus:ring-orange-500/50 focus:border-transparent"
              aria-label="Sort products"
            >
              <option value="nama-asc" className="bg-slate-800">
                Name A-Z
              </option>
              <option value="nama-desc" className="bg-slate-800">
                Name Z-A
              </option>
              <option value="harga-asc" className="bg-slate-800">
                Lowest Price
              </option>
              <option value="harga-desc" className="bg-slate-800">
                Highest Price
              </option>
            </select>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"
              aria-label="Loading products"
            />
          </div>
        )}

        {/* Error State */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6"
          >
            <p className="text-red-300">Error: {error}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchProducts}
              className="mt-2 px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-500 hover:to-red-500 transition-colors"
              aria-label="Retry fetching products"
            >
              Try again
            </motion.button>
          </motion.div>
        )}

        {/* Receipt Loading State */}
        {isGeneratingReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            role="dialog"
            aria-labelledby="receipt-loading-title"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl p-6 flex items-center space-x-4 border border-slate-700/50"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full"
              />
              <p id="receipt-loading-title" className="text-lg text-white">
                The receipt is being created
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Receipt Download Button */}
        {receiptUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-slate-700/50 p-4 mb-6 relative"
          >
            {/* Close button */}
            <button
              onClick={() => setReceiptUrl(null)}
              className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
              aria-label="Close receipt"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center justify-between pr-6">
              <p className="text-slate-400">
                The receipt is available for download
              </p>
              <div>
                <a
                  ref={downloadLinkRef}
                  href={receiptUrl}
                  download="receipt.pdf"
                  style={{ display: "none" }}
                  aria-hidden="true"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDownloadReceipt}
                  className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-500 hover:to-red-500 transition-colors flex items-center space-x-2"
                  aria-label="Download receipt"
                >
                  <Download className="w-5 h-5" />
                  <span>Download</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
        {/* Products Grid/List */}
        {!loading && !error && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className={
              viewMode === "grid"
                ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6"
                : "space-y-4 mb-6"
            }
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className={`bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-slate-700/50 hover:shadow-orange-500/10 transition-all duration-300 ${
                  viewMode === "list" ? "flex items-center p-4" : ""
                }`}
              >
                {viewMode === "grid" ? (
                  <>
                    <div className="h-48 bg-slate-700/50 relative overflow-hidden rounded-t-xl">
                      {product.image ? (
                        <img
                          src={`data:image/jpeg;base64,${product.image}`}
                          alt={product.nama}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="flex items-center justify-center h-full"
                        style={{ display: product.image ? "none" : "flex" }}
                      >
                        <Package className="w-16 h-16 text-slate-500" />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-slate-900/80 text-white px-2 py-1 rounded-full text-xs">
                        Stok: {product.stok || 0}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-white mb-2 line-clamp-2">
                        {product.nama}
                      </h3>
                      <p
                        className="text-sm text-slate-400 mb-2 line-clamp-2"
                        title={product.keterangan}
                      >
                        {product.keterangan || "Tidak ada keterangan"}
                      </p>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full">
                          {product.kategori}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            product.status === "Tersedia"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }`}
                        >
                          {product.status}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-orange-400 mb-3">
                        {formatPrice(product.harga)}
                      </p>
                      <div className="flex space-x-2">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => addToCart(product)}
                          disabled={
                            product.status !== "Tersedia" || product.stok === 0
                          }
                          className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 ${
                            product.status === "Tersedia" && product.stok > 0
                              ? "bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500"
                              : "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                          }`}
                          aria-label={`Add ${product.nama} to cart`}
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span className="text-sm">
                            {product.status !== "Tersedia"
                              ? "Not available"
                              : product.stok === 0
                              ? "Out of stock"
                              : "Add to Cart"}
                          </span>
                        </motion.button>
                        <motion.button
                          onClick={() => handleShowDetail(product)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="p-2 border border-slate-600 rounded-lg hover:border-orange-500 transition-colors"
                          aria-label={`View details of ${product.nama}`}
                        >
                          <Eye className="w-4 h-4 text-slate-300" />
                        </motion.button>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-slate-700/50 rounded-lg flex-shrink-0 mr-4 overflow-hidden relative">
                      {product.image ? (
                        <img
                          src={`data:image/jpeg;base64,${product.image}`}
                          alt={product.nama}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.nextSibling.style.display = "flex";
                          }}
                        />
                      ) : null}
                      <div
                        className="flex items-center justify-center h-full absolute inset-0"
                        style={{ display: product.image ? "none" : "flex" }}
                      >
                        <Package className="w-8 h-8 text-slate-500" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white mb-1">
                        {product.nama}
                      </h3>
                      <p className="text-sm text-slate-400 mb-2">
                        {product.kategori} • Stok: {product.stok || 0}
                      </p>
                      <p className="text-lg font-bold text-orange-400">
                        {formatPrice(product.harga)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addToCart(product)}
                        disabled={
                          product.status !== "Tersedia" || product.stok === 0
                        }
                        className={`flex-1 py-2 px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 ${
                          product.status === "Tersedia" && product.stok > 0
                            ? "bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500"
                            : "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                        }`}
                        aria-label={`Add ${product.nama} to cart`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span className="text-sm">
                          {product.status !== "Tersedia"
                            ? "Tidak Tersedia"
                            : product.stok === 0
                            ? "Stok Habis"
                            : "Tambah"}
                        </span>
                      </motion.button>
                      <motion.button
                        onClick={() => handleShowDetail(product)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 border border-slate-600 rounded-lg hover:border-orange-500 transition-colors"
                        aria-label={`View details of ${product.nama}`}
                      >
                        <Eye className="w-4 h-4 text-slate-300" />
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Empty State */}
        {!loading && !error && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Package className="w-16 h-16 text-slate-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-400 mb-2">
              No products found
            </h3>
            <p className="text-slate-500 mb-4">
              Try changing the search filter or keywords
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetFilters}
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-500 hover:to-red-500 transition-colors"
              aria-label="Reset filters"
            >
              Reset Filter
            </motion.button>
          </motion.div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-slate-700/50 p-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-slate-400">
                Halaman {pagination.page} from {totalPages}
              </p>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-500 transition-colors text-slate-300"
                  aria-label="Previous page"
                >
                  Previously
                </motion.button>

                {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                  const pageNum =
                    Math.max(1, Math.min(totalPages - 4, pagination.page - 2)) +
                    i;
                  return (
                    <motion.button
                      key={pageNum}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageChange(pageNum)}
                      className={`px-3 py-1 rounded-lg transition-colors ${
                        pageNum === pagination.page
                          ? "bg-gradient-to-r from-orange-600 to-red-600 text-white"
                          : "border border-slate-600 hover:border-orange-500 text-slate-300"
                      }`}
                      aria-label={`Page ${pageNum}`}
                    >
                      {pageNum}
                    </motion.button>
                  );
                })}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page === totalPages}
                  className="px-3 py-1 border border-slate-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:border-orange-500 transition-colors text-slate-300"
                  aria-label="Next page"
                >
                  Furthermore
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Cart Sidebar */}
      <AnimatePresence>
        {isCartOpen && (
          <>
            {/* Backdrop for small screens */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 lg:hidden z-30"
              onClick={() => setIsCartOpen(false)}
              aria-hidden="true"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-y-0 right-0 w-full sm:w-96 lg:w-80 bg-slate-800/90 backdrop-blur-xl shadow-xl z-40 p-4 overflow-y-auto border-l border-slate-700/50"
              role="dialog"
              aria-labelledby="cart-title"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10 pointer-events-none"></div>

              <div className="flex justify-between items-center mb-4 border-b border-slate-700/50 pb-4">
                <h2 id="cart-title" className="text-xl font-bold text-white">
                  Shopping cart
                </h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="text-slate-400 hover:text-orange-400"
                  aria-label="Close cart"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                  <p className="text-slate-400">Shopping cart is empty</p>
                </div>
              ) : (
                <>
                  <div className="space-y-4 mb-4">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex items-center p-3 border border-slate-700/50 rounded-lg bg-slate-700/50"
                      >
                        <div className="w-16 h-16 bg-slate-700/50 rounded-lg mr-3 overflow-hidden">
                          {item.image ? (
                            <img
                              src={`data:image/jpeg;base64,${item.image}`}
                              alt={item.nama}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Package className="w-full h-full p-3 text-slate-500" />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white">
                            {item.nama}
                          </h3>
                          <p className="text-orange-400 font-bold">
                            {formatPrice(item.harga)}
                          </p>
                          <div className="flex items-center mt-1">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              className="w-8 h-8 flex items-center justify-center border border-slate-600 rounded-l-lg text-slate-300 hover:bg-slate-700/50"
                              aria-label={`Decrease quantity of ${item.nama}`}
                            >
                              -
                            </button>
                            <span className="w-10 h-8 flex items-center justify-center border-t border-b border-slate-600 text-slate-300">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              className="w-8 h-8 flex items-center justify-center border border-slate-600 rounded-r-lg text-slate-300 hover:bg-slate-700/50"
                              aria-label={`Increase quantity of ${item.nama}`}
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="ml-2 text-slate-400 hover:text-red-400"
                          aria-label={`Remove ${item.nama} from cart`}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  <div className="border-t border-slate-700/50 pt-4">
                    <div className="flex justify-between mb-2 text-slate-300">
                      <span className="font-medium">Subtotal:</span>
                      <span className="font-bold">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>
                    <div className="flex justify-between text-lg font-bold border-t border-slate-700/50 pt-2 text-white">
                      <span>Total:</span>
                      <span className="text-orange-400">
                        {formatPrice(cartTotal)}
                      </span>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      onClick={submitOrder}
                      className="w-full mt-4 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-500 hover:to-red-500 transition-colors"
                      aria-label="Submit order"
                    >
                      Place an Order
                    </motion.button>
                  </div>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {showDetailModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetailModal(false)}
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: "spring", damping: 20 }}
              className="bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-700/50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10 pointer-events-none"></div>

              <div className="flex justify-between items-center mb-4">
                <h2 id="modal-title" className="text-xl font-bold text-white">
                  Product Details
                </h2>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-slate-400 hover:text-orange-400"
                  aria-label="Close product details"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              <div className="mb-4">
                <div className="h-64 bg-slate-700/50 rounded-xl overflow-hidden relative mb-4">
                  {selectedProduct.image ? (
                    <img
                      src={`data:image/jpeg;base64,${selectedProduct.image}`}
                      alt={selectedProduct.nama}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.nextSibling.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className="flex items-center justify-center h-full absolute inset-0"
                    style={{
                      display: selectedProduct.image ? "none" : "flex",
                    }}
                  >
                    <Package className="w-16 h-16 text-slate-500" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  {selectedProduct.nama}
                </h3>
                <p className="text-sm text-slate-400 mb-2">
                  Kategori: {selectedProduct.kategori}
                </p>
                <p className="text-lg font-bold text-orange-400 mb-2">
                  {formatPrice(selectedProduct.harga)}
                </p>
                <p className="text-sm text-slate-400 mb-2">
                  Stok: {selectedProduct.stok || 0}
                </p>
                <p
                  className={`text-sm font-medium mb-2 ${
                    selectedProduct.status === "Tersedia"
                      ? "text-green-400"
                      : "text-red-400"
                  }`}
                >
                  Status: {selectedProduct.status}
                </p>
                <p className="text-sm text-slate-400">
                  {selectedProduct.keterangan || "Tidak ada keterangan"}
                </p>
              </div>
              <div className="flex justify-end space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 border border-slate-600 rounded-lg text-slate-300 hover:bg-slate-700/50 transition-colors"
                  aria-label="Close product details"
                >
                  Close
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    addToCart(selectedProduct);
                    setShowDetailModal(false);
                  }}
                  disabled={
                    selectedProduct.status !== "Tersedia" ||
                    selectedProduct.stok === 0
                  }
                  className={`px-4 py-2 rounded-lg flex items-center space-x-1 transition-colors ${
                    selectedProduct.status === "Tersedia" &&
                    selectedProduct.stok > 0
                      ? "bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500"
                      : "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                  }`}
                  aria-label={`Add ${selectedProduct.nama} to cart`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {selectedProduct.status !== "Tersedia"
                      ? "Not available"
                      : selectedProduct.stok === 0
                      ? "Out of stock"
                      : "Add to Cart"}
                  </span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ProductsController;
