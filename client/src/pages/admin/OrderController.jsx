/* eslint-disable no-unused-vars */
import AdminSidebar from "../../componens/admin/AdminSidebar";
import { OrderService } from "../../services/OrderService";
import { useState, useEffect, useMemo } from "react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  Receipt,
  User,
  Calendar,
  Package,
  ChevronDown,
  ChevronUp,
  Frown,
  Sliders,
  RefreshCw,
  Eye,
} from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 10, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120,
    },
  },
};

const OrderController = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [pagination, setPagination] = useState({
    page: 1,
    size: 4,
    totalItems: 0,
  });

  const [filters, setFilters] = useState({
    searchTerm: "",
    dateFilter: "",
    minAmountFilter: "",
    maxAmountFilter: "",
    sortBy: "tanggalPembelian",
    sortOrder: "desc",
  });

  const formatDate = (dateString) => {
    return format(parseISO(dateString), "dd MMMM yyyy HH:mm", { locale: id });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const fetchHistorys = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await OrderService.allHistorysCashier();

      if (response.success) {
        setOrders(response.data);
        setPagination((prev) => ({
          ...prev,
          totalItems: response.data.length,
        }));
      } else {
        setError(response.message || "Failed to fetch orders");
      }
    } catch (error) {
      setError(error.message || "An error occurred while fetching orders");
      console.error("Fetch orders error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorys();
  }, []);

  const resetFilters = () => {
    setFilters({
      searchTerm: "",
      dateFilter: "",
      minAmountFilter: "",
      maxAmountFilter: "",
      sortBy: "tanggalPembelian",
      sortOrder: "desc",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Filter and search logic
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch =
        order.pemesananId.toString().includes(filters.searchTerm) ||
        order.namaKasir
          .toLowerCase()
          .includes(filters.searchTerm.toLowerCase()) ||
        order.items.some((item) =>
          item.namaProduk
            .toLowerCase()
            .includes(filters.searchTerm.toLowerCase())
        );

      const matchesDate = filters.dateFilter
        ? format(parseISO(order.tanggalPembelian), "yyyy-MM-dd") ===
          filters.dateFilter
        : true;

      const minAmount = filters.minAmountFilter
        ? Number(filters.minAmountFilter)
        : 0;
      const maxAmount = filters.maxAmountFilter
        ? Number(filters.maxAmountFilter)
        : Infinity;
      const matchesAmount =
        order.totalHarga >= minAmount && order.totalHarga <= maxAmount;

      return matchesSearch && matchesDate && matchesAmount;
    });
  }, [
    orders,
    filters.searchTerm,
    filters.dateFilter,
    filters.minAmountFilter,
    filters.maxAmountFilter,
  ]);

  // Sorting logic
  const sortedOrders = useMemo(() => {
    return [...filteredOrders].sort((a, b) => {
      if (a[filters.sortBy] < b[filters.sortBy]) {
        return filters.sortOrder === "asc" ? -1 : 1;
      }
      if (a[filters.sortBy] > b[filters.sortBy]) {
        return filters.sortOrder === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredOrders, filters.sortBy, filters.sortOrder]);

  // Pagination logic
  const indexOfLastItem = pagination.page * pagination.size;
  const indexOfFirstItem = indexOfLastItem - pagination.size;
  const currentItems = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedOrders.length / pagination.size);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({
      ...prev,
      page: newPage,
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

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Modal handlers
  const openModal = (order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  // Toggle filter visibility
  const toggleFilter = () => {
    setIsFilterOpen((prev) => !prev);
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <AdminSidebar menuActive="pemesanan" />

      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-600 rounded-full blur-3xl"></div>
        </div>

        {/* Header Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 relative z-10"
        >
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.div variants={itemVariants} className="max-[884px]:pl-12">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Order Management
              </h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Manage and track customer orders
              </p>
            </motion.div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              variants={itemVariants}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mt-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl text-sm text-red-200 flex items-center backdrop-blur-sm"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
              <span>{error}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setError(null)}
                className="ml-auto px-3 py-1 text-sm bg-red-900/20 text-red-200 rounded-lg hover:bg-red-900/30 transition-colors duration-200"
                aria-label="Dismiss error"
              >
                <X size={16} />
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Filters Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-gray-800/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700/50 mb-6 relative z-10"
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-white">Filters</h2>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleFilter}
              className="md:hidden text-gray-400 hover:text-blue-400 transition-colors"
            >
              <Sliders size={20} />
            </motion.button>
          </div>

          <div className={`${isFilterOpen ? "block" : "hidden md:block"}`}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Search (Cashier/ID/Product)
                </label>
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors" />
                  <input
                    type="text"
                    name="searchTerm"
                    value={filters.searchTerm}
                    onChange={handleFilterChange}
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-700/50 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-gray-700/70"
                    placeholder="Search orders..."
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Order Date
                </label>
                <input
                  type="date"
                  name="dateFilter"
                  className="w-full px-3 py-2.5 bg-gray-700/50 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-gray-700/70"
                  value={filters.dateFilter}
                  onChange={handleFilterChange}
                />
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="grid grid-cols-2 gap-3"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Min Amount
                  </label>
                  <input
                    type="number"
                    name="minAmountFilter"
                    value={filters.minAmountFilter}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2.5 bg-gray-700/50 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-gray-700/70"
                    placeholder="Minimum"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Max Amount
                  </label>
                  <input
                    type="number"
                    name="maxAmountFilter"
                    value={filters.maxAmountFilter}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2.5 bg-gray-700/50 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-gray-700/70"
                    placeholder="Maximum"
                    min="0"
                  />
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="flex items-end space-x-2"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetFilters}
                  className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-xl hover:bg-gray-700/70 hover:text-white transition-all duration-200 backdrop-blur-sm flex items-center justify-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reset
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={fetchHistorys}
                  className="w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-200 shadow-lg hover:shadow-blue-500/25 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  Apply
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Orders Content Section */}
        {loading ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center py-12 relative z-10"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <span className="text-gray-400 text-sm">Loading orders...</span>
          </motion.div>
        ) : currentItems.length === 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col items-center justify-center py-12 text-center bg-gray-800/30 rounded-2xl border border-gray-700/50 relative z-10"
          >
            <Frown className="h-12 w-12 text-gray-500 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-1">
              No Orders Found
            </h3>
            <p className="text-gray-400 max-w-md">
              {error
                ? "Error loading orders"
                : "Try adjusting your search filters"}
            </p>
            {error && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchHistorys}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-colors duration-200"
              >
                Try Again
              </motion.button>
            )}
          </motion.div>
        ) : (
          <>
            {/* Sorting Controls */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 relative z-10"
            >
              <motion.div
                variants={itemVariants}
                className="text-sm text-gray-400"
              >
                Showing {(pagination.page - 1) * pagination.size + 1}-
                {Math.min(
                  pagination.page * pagination.size,
                  sortedOrders.length
                )}{" "}
                of {sortedOrders.length} orders
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-2"
              >
                <span className="text-sm text-gray-400 whitespace-nowrap">
                  Sort by:
                </span>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleSort(e.target.value)}
                  className="px-3 py-2 bg-gray-700/50 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-200 backdrop-blur-sm"
                >
                  <option value="tanggalPembelian">Date</option>
                  <option value="pemesananId">Order ID</option>
                  <option value="totalHarga">Amount</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleSort(filters.sortBy)}
                  className="p-2 text-gray-400 hover:text-blue-400 hover:bg-gray-700/50 rounded-xl transition-all"
                >
                  {filters.sortOrder === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Orders Cards Grid */}
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 relative z-10"
            >
              {currentItems.map((order) => (
                <OrderCard
                  key={order.pemesananId}
                  order={order}
                  formatDate={formatDate}
                  formatCurrency={formatCurrency}
                  onViewDetails={openModal}
                />
              ))}
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <Pagination
                currentPage={pagination.page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </>
        )}

        {/* Order Detail Modal */}
        <OrderDetailModal
          isOpen={isModalOpen}
          order={selectedOrder}
          onClose={closeModal}
          formatDate={formatDate}
          formatCurrency={formatCurrency}
        />
      </main>
    </div>
  );
};

// Order Card Component
const OrderCard = ({ order, formatDate, formatCurrency, onViewDetails }) => {
  return (
    <motion.div
      variants={itemVariants}
      whileHover={{ y: -5 }}
      className="flex flex-col h-full bg-gray-800/80 backdrop-blur-sm rounded-2xl 
                 border border-gray-700/50 overflow-hidden hover:shadow-lg 
                 transition-all duration-200 hover:border-blue-500/30 group"
    >
      {/* Konten card */}
      <div className="flex-1 p-5">
        {/* Order Header */}
        <div className="flex justify-between items-start gap-4 mb-4">
          <div className="flex-1">
            <h3 className="font-semibold text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
              Order #{order.pemesananId}
            </h3>
            <p className="text-blue-400 font-bold text-xl mt-2">
              {formatCurrency(order.totalHarga)}
            </p>
          </div>
        </div>

        {/* Cashier Info */}
        <div className="flex items-center text-sm text-gray-400 mb-3">
          <User className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{order.namaKasir}</span>
        </div>

        {/* Date Info */}
        <div className="flex items-center text-sm text-gray-400 mb-4">
          <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
          <span className="truncate">{formatDate(order.tanggalPembelian)}</span>
        </div>

        {/* Items Summary */}
        <div>
          <div className="flex justify-between items-center text-sm text-gray-400 mb-2">
            <span className="flex items-center">
              <Package className="h-4 w-4 mr-2" />
              {order.items.length} item{order.items.length !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="space-y-1">
            {order.items.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm">
                <span className="text-gray-300 truncate max-w-[120px]">
                  {item.namaProduk} × {item.jumlah}
                </span>
                <span className="text-gray-400">
                  {formatCurrency(item.subtotal)}
                </span>
              </div>
            ))}
            {order.items.length > 2 && (
              <div className="text-xs text-gray-500">
                +{order.items.length - 2} more items
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Details Button */}
      <div className="p-5 pt-0">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onViewDetails(order)}
          className="self-center w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 
                     text-white rounded-xl hover:from-blue-500 hover:to-purple-500 
                     transition-all duration-200 flex items-center justify-center"
        >
          <Eye className="h-4 w-4 mr-2" />
          View Details
        </motion.button>
      </div>
    </motion.div>
  );
};

// Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10"
    >
      <motion.div variants={itemVariants} className="text-sm text-gray-400">
        Page {currentPage} of {totalPages}
      </motion.div>
      <nav className="flex items-center gap-2" aria-label="Pagination">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="p-2 rounded-xl bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronLeft className="h-5 w-5" />
        </motion.button>

        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
          const pageNum =
            Math.max(1, Math.min(currentPage - 2, totalPages - 4)) + i;
          return (
            <motion.button
              key={pageNum}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onPageChange(pageNum)}
              className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                currentPage === pageNum
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white shadow-lg"
                  : "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:text-white"
              } transition-all duration-200`}
              aria-label={`Go to page ${pageNum}`}
              aria-current={currentPage === pageNum ? "page" : undefined}
            >
              {pageNum}
            </motion.button>
          );
        })}

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded-xl bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          <ChevronRight className="h-5 w-5" />
        </motion.button>
      </nav>
    </motion.div>
  );
};

// Order Detail Modal Component
const OrderDetailModal = ({
  isOpen,
  order,
  onClose,
  formatDate,
  formatCurrency,
}) => {
  if (!isOpen || !order) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl w-11/12 sm:w-96 border border-gray-700/50 max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
          style={{
            scrollbarWidth: "thin",
            scrollbarColor: "#4b5563 #1f2937",
          }}
        >
          {/* Glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl pointer-events-none"></div>

          {/* Header */}
          <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-800/70">
            <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Order Details
            </h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-700/50 transition-colors group"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6">
            <div className="space-y-4">
              <motion.div variants={itemVariants}>
                <div className="flex items-center text-sm text-gray-400">
                  <User className="h-4 w-4 mr-2" />
                  <span className="font-medium text-gray-300">Cashier:</span>
                  <span className="ml-2">{order.namaKasir}</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex items-center text-sm text-gray-400">
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="font-medium text-gray-300">Date:</span>
                  <span className="ml-2">
                    {formatDate(order.tanggalPembelian)}
                  </span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <div className="flex items-center text-sm text-gray-400">
                  <Receipt className="h-4 w-4 mr-2" />
                  <span className="font-medium text-gray-300">Order ID:</span>
                  <span className="ml-2">#{order.pemesananId}</span>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <h4 className="font-medium text-gray-300 mb-3 flex items-center">
                  <Package className="h-4 w-4 mr-2" />
                  Items Purchased
                </h4>
                <div className="space-y-3">
                  {order.items.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600/50"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {item.namaProduk}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {item.jumlah} × {formatCurrency(item.hargaSatuan)}
                        </p>
                      </div>
                      <p className="font-medium text-blue-400">
                        {formatCurrency(item.subtotal)}
                      </p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                className="pt-4 border-t border-gray-700/50"
              >
                <div className="flex justify-between items-center">
                  <p className="font-medium text-lg text-gray-300">
                    Total Amount:
                  </p>
                  <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    {formatCurrency(order.totalHarga)}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default OrderController;
