/* eslint-disable no-unused-vars */
import { useEffect, useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  Package,
  RefreshCw,
  ShoppingCart,
  Eye,
  X,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ProductService } from "../../services/ProductService";
import { OrderService } from "../../services/OrderService";

const ProductsController = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);
  const [receiptUrl, setReceiptUrl] = useState(null);
  const downloadLinkRef = useRef(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 4,
    totalItem: 0,
  });
  console.log(pagination);

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
      className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white pt-5 px-4 pb-6 relative overflow-hidden"
    >
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-500 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full blur-3xl"></div>
      </div>

      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      ></div>

      <div className="relative z-0 max-w-7xl mx-auto">
        <div className="flex items-center mb-6">
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent tracking-wide"
          >
            Product Management
          </motion.h1>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-gray-700/50 p-4 sm:p-6 mb-6 relative overflow-hidden z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-white">
                  All Products
                </h1>
                <p className="text-gray-400 text-sm">
                  Manage and view all products in the store
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchProducts}
                className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-colors"
                aria-label="Refresh products"
              >
                <RefreshCw
                  className={`w-4 h-4 sm:w-5 sm:h-5 ${
                    loading ? "animate-spin" : ""
                  }`}
                />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsCartOpen(true)}
                className="p-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-colors flex items-center relative"
                aria-label="Open cart"
              >
                <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                {cartItems.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-blue-600 text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </motion.button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
              <input
                type="text"
                name="nama"
                placeholder="Search for products..."
                value={filters.nama}
                onChange={handleFilterChange}
                className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 text-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-sm sm:text-base"
                aria-label="Search products"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center space-x-2 px-3 sm:px-4 py-2 border border-gray-600 rounded-lg hover:border-blue-500 transition-colors"
              aria-label="Toggle filters"
            >
              <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300" />
              <span className="text-gray-300 text-sm sm:text-base">Filter</span>
              {isFilterOpen ? (
                <ChevronUp className="w-4 h-4 text-gray-300" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-300" />
              )}
            </motion.button>
          </div>

          <motion.div
            initial={false}
            animate={{
              height: isFilterOpen ? "auto" : 0,
              opacity: isFilterOpen ? 1 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 border-t border-gray-700 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <select
                  name="kategori"
                  value={filters.kategori}
                  onChange={handleFilterChange}
                  className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 text-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-sm"
                  aria-label="Filter by category"
                >
                  {categories.map((category) => (
                    <option
                      key={category}
                      value={category === "Semua Kategori" ? "" : category}
                      className="bg-gray-800"
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
                  className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 text-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-sm"
                  aria-label="Minimum price"
                />

                <input
                  type="number"
                  name="maxPrice"
                  placeholder="Maximum price"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  className="px-3 py-2 bg-gray-700/50 border border-gray-600/50 text-white rounded-lg focus:ring-2 focus:ring-blue-500/50 focus:border-transparent text-sm"
                  aria-label="Maximum price"
                />

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetFilters}
                  className="px-3 py-2 bg-gray-700/50 text-gray-300 rounded-lg hover:bg-gray-700/70 transition-colors text-sm"
                  aria-label="Reset filters"
                >
                  Reset Filter
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-gray-700/50 p-4 mb-6"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <p className="text-gray-400 text-sm">
              Showing {products.length} from {pagination.totalItem} product
            </p>
            <select
              value={`${filters.sortBy}-${filters.sortOrder}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split("-");
                setFilters((prev) => ({ ...prev, sortBy, sortOrder }));
              }}
              className="px-3 py-1 bg-gray-700/50 border border-gray-600/50 text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
              aria-label="Sort products"
            >
              <option value="nama-asc" className="bg-gray-800">
                Name A-Z
              </option>
              <option value="nama-desc" className="bg-gray-800">
                Name Z-A
              </option>
              <option value="harga-asc" className="bg-gray-800">
                Lowest Price
              </option>
              <option value="harga-desc" className="bg-gray-800">
                Highest Price
              </option>
            </select>
          </div>
        </motion.div>

        {loading && (
          <div className="flex justify-center items-center py-12">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
              aria-label="Loading products"
            />
          </div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6"
          >
            <p className="text-red-300 text-sm sm:text-base">Error: {error}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchProducts}
              className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-colors text-sm"
              aria-label="Retry fetching products"
            >
              Try again
            </motion.button>
          </motion.div>
        )}

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
              className="bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl p-4 sm:p-6 flex items-center space-x-3 border border-gray-700/50"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-6 h-6 sm:w-8 sm:h-8 border-4 border-blue-500 border-t-transparent rounded-full"
              />
              <p
                id="receipt-loading-title"
                className="text-sm sm:text-lg text-white"
              >
                The receipt is being created
              </p>
            </motion.div>
          </motion.div>
        )}

        {receiptUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-gray-700/50 p-4 mb-6 relative"
          >
            <button
              onClick={() => setReceiptUrl(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-white transition-colors"
              aria-label="Close receipt"
            >
              <X className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pr-6">
              <p className="text-gray-400 text-sm">
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
                  className="px-3 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-colors flex items-center space-x-2 text-sm"
                  aria-label="Download receipt"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        {!loading && !error && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6"
          >
            {products.map((product) => (
              <motion.div
                key={product.id}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-gray-700/50 hover:shadow-blue-500/10 transition-all duration-300"
              >
                <div className="h-40 sm:h-48 bg-gray-700/50 relative overflow-hidden rounded-t-xl">
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
                    <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500" />
                  </div>
                  <div className="absolute bottom-2 left-2 bg-gray-900/80 text-white px-2 py-1 rounded-full text-xs">
                    Stok: {product.stok || 0}
                  </div>
                </div>
                <div className="p-3 sm:p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2 text-sm sm:text-base">
                    {product.nama}
                  </h3>
                  <p
                    className="text-xs sm:text-sm text-gray-400 mb-2 line-clamp-2"
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
                  <p className="text-base sm:text-lg font-bold text-blue-400 mb-3">
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
                      className={`flex-1 py-2 px-2 sm:px-3 rounded-lg transition-colors flex items-center justify-center space-x-1 text-xs sm:text-sm ${
                        product.status === "Tersedia" && product.stok > 0
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500"
                          : "bg-gray-700/50 text-gray-500 cursor-not-allowed"
                      }`}
                      aria-label={`Add ${product.nama} to cart`}
                    >
                      <ShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>
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
                      className="p-2 border border-gray-600 rounded-lg hover:border-blue-500 transition-colors"
                      aria-label={`View details of ${product.nama}`}
                    >
                      <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300" />
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {!loading && !error && products.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-base sm:text-lg font-semibold text-gray-400 mb-2">
              No products found
            </h3>
            <p className="text-gray-500 mb-4 text-sm sm:text-base">
              Try changing the search filter or keywords
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={resetFilters}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-500 hover:to-purple-500 transition-colors text-sm"
              aria-label="Reset filters"
            >
              Reset Filter
            </motion.button>
          </motion.div>
        )}

        {totalPages > 1 && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-gray-700/50 p-4"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-sm text-gray-400">
                Page {pagination.page} from {totalPages}
              </p>
              <div className="flex flex-wrap gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page === 1}
                  className="p-2 rounded-xl bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronLeft className="h-5 w-5" />
                </motion.button>

                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum =
                    Math.max(1, Math.min(pagination.page - 2, totalPages - 4)) +
                    i;
                  return (
                    <motion.button
                      key={pageNum}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                        pagination.page === pageNum
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white shadow-lg"
                          : "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:text-white"
                      } transition-all duration-200`}
                      aria-label={`Go to page ${pageNum}`}
                      aria-current={
                        pagination.page === pageNum ? "page" : undefined
                      }
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
                  className="p-2 rounded-xl bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  <ChevronRight className="h-5 w-5" />
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}

        <AnimatePresence>
          {isCartOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-30"
                onClick={() => setIsCartOpen(false)}
                aria-hidden="true"
              />
              <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25 }}
                className="fixed bottom-0 left-0 right-0 w-full max-h-[80vh] sm:max-h-[85vh] bg-gray-800/95 backdrop-blur-xl shadow-xl z-40 p-4 sm:p-6 overflow-y-auto border-t border-gray-700/50 sm:rounded-t-xl sm:max-w-md sm:mx-auto sm:bottom-auto sm:top-[55%] sm:-translate-y-1/2 sm:min-h-[400px] lg:max-w-lg"
                role="dialog"
                aria-labelledby="cart-title"
                style={{
                  scrollbarWidth: "thin",
                  scrollbarColor: "#4b5563 #1f2937",
                }}
              >
                <div className="flex justify-between items-center mb-4 border-b border-gray-700/50 pb-3">
                  <h2
                    id="cart-title"
                    className="text-lg sm:text-xl font-bold text-white"
                  >
                    Keranjang Belanja
                  </h2>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setIsCartOpen(false)}
                    className="text-gray-300 hover:text-blue-400 transition-colors"
                    aria-label="Close cart"
                  >
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </motion.button>
                </div>

                {cartItems.length === 0 ? (
                  <div className="text-center py-8 sm:py-12">
                    <ShoppingCart className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-4 opacity-70" />
                    <p className="text-gray-300 text-sm sm:text-base">
                      Keranjang belanja Anda kosong
                    </p>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setIsCartOpen(false)}
                      className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm sm:text-base hover:from-blue-500 hover:to-purple-500 transition-colors"
                      aria-label="Continue shopping"
                    >
                      Lanjutkan Belanja
                    </motion.button>
                  </div>
                ) : (
                  <>
                    <div className="space-y-3 sm:space-y-4 mb-6">
                      {cartItems.map((item) => (
                        <motion.div
                          key={item.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="flex items-start p-3 sm:p-4 bg-gray-700/30 border border-gray-600/50 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-600/50 rounded-md overflow-hidden flex-shrink-0 mr-3 sm:mr-4">
                            {item.image ? (
                              <img
                                src={`data:image/jpeg;base64,${item.image}`}
                                alt={item.nama}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-full h-full p-3 text-gray-400" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm sm:text-base font-semibold text-white truncate">
                              {item.nama}
                            </h3>
                            <p className="text-xs sm:text-sm text-blue-400 font-medium">
                              {formatPrice(item.harga)}
                            </p>
                            <div className="flex items-center mt-2 gap-2">
                              <div className="flex items-center border border-gray-600 rounded-md overflow-hidden">
                                <motion.button
                                  whileHover={{ backgroundColor: "#4b5563" }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity - 1)
                                  }
                                  className="w-8 h-8 flex items-center justify-center text-gray-300 hover:bg-gray-600 transition-colors"
                                  aria-label={`Decrease quantity of ${item.nama}`}
                                >
                                  -
                                </motion.button>
                                <span className="w-10 h-8 flex items-center justify-center text-gray-200 text-sm bg-gray-700/50">
                                  {item.quantity}
                                </span>
                                <motion.button
                                  whileHover={{ backgroundColor: "#4b5563" }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() =>
                                    updateQuantity(item.id, item.quantity + 1)
                                  }
                                  className="w-8 h-8 flex items-center justify-center text-gray-300 hover:bg-gray-600 transition-colors"
                                  aria-label={`Increase quantity of ${item.nama}`}
                                >
                                  +
                                </motion.button>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-300">
                                Total: {formatPrice(item.harga * item.quantity)}
                              </p>
                            </div>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => removeFromCart(item.id)}
                            className="ml-2 text-gray-400 hover:text-red-400 transition-colors"
                            aria-label={`Remove ${item.nama} from cart`}
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>

                    <div className="border-t border-gray-700/50 pt-4">
                      <div className="flex justify-between items-center mb-3 text-sm sm:text-base text-gray-200">
                        <span className="font-medium">Subtotal:</span>
                        <span className="font-semibold">
                          {formatPrice(cartTotal)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base sm:text-lg font-bold text-white">
                        <span>Total:</span>
                        <span className="text-blue-400">
                          {formatPrice(cartTotal)}
                        </span>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={submitOrder}
                        className="w-full mt-4 py-2.5 sm:py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm sm:text-base font-semibold hover:from-blue-500 hover:to-purple-500 transition-colors shadow-md"
                        aria-label="Submit order"
                      >
                        Buat Pesanan
                      </motion.button>
                    </div>
                  </>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

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
                initial={{ scale: 0.8, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 40 }}
                exit={{ scale: 0.8, opacity: 0, y: 20 }}
                transition={{ type: "spring", damping: 20 }}
                className="bg-gray-800/90 backdrop-blur-xl rounded-xl shadow-xl 
             w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-2xl 
             p-4 sm:p-6 border border-gray-700/50 
             max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 id="modal-title" className="text-xl font-bold text-white">
                    Product Details
                  </h2>
                  <button
                    onClick={() => setShowDetailModal(false)}
                    className="text-gray-400 hover:text-blue-400"
                    aria-label="Close product details"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="mb-4">
                  <div className="h-64 bg-gray-700/50 rounded-xl overflow-hidden relative mb-4">
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
                      <Package className="w-16 h-16 text-gray-500" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {selectedProduct.nama}
                  </h3>
                  <p className="text-sm text-gray-400 mb-2">
                    Kategori: {selectedProduct.kategori}
                  </p>
                  <p className="text-lg font-bold text-blue-400 mb-2">
                    {formatPrice(selectedProduct.harga)}
                  </p>
                  <p className="text-sm text-gray-400 mb-2">
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
                  <p className="text-sm text-gray-400">
                    {selectedProduct.keterangan || "Tidak ada keterangan"}
                  </p>
                </div>
                <div className="flex justify-end space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDetailModal(false)}
                    className="px-4 py-2 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors"
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
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-500 hover:to-purple-500"
                        : "bg-gray-700/50 text-gray-500 cursor-not-allowed"
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
      </div>
    </motion.div>
  );
};

export default ProductsController;
