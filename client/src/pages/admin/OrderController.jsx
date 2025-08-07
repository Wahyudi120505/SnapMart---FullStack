/* eslint-disable no-unused-vars */
import AdminSidebar from "../../componens/admin/AdminSidebar";
import { OrderService } from "../../services/OrderService";
import { useState, useEffect } from "react";
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
  DollarSign,
  Package,
  ChevronDown,
  ChevronUp,
  Frown,
  Sliders,
} from "lucide-react";

const OrderController = () => {
  // State management
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [minAmountFilter, setMinAmountFilter] = useState("");
  const [maxAmountFilter, setMaxAmountFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(3);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sortConfig, setSortConfig] = useState({
    key: "tanggalPembelian",
    direction: "desc",
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Fetch orders
  const fetchHistorys = async () => {
    try {
      setLoading(true);
      const response = await OrderService.allHistorysCashier();

      if (response.success) {
        setOrders(response.data);
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

  // Formatting functions
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

  // Reset all filters
  const resetFilters = () => {
    setSearchTerm("");
    setDateFilter("");
    setMinAmountFilter("");
    setMaxAmountFilter("");
    setCurrentPage(1);
  };

  // Filter and search logic
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.pemesananId.toString().includes(searchTerm) ||
      order.namaKasir.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((item) =>
        item.namaProduk.toLowerCase().includes(searchTerm.toLowerCase())
      );

    const matchesDate = dateFilter
      ? format(parseISO(order.tanggalPembelian), "yyyy-MM-dd") === dateFilter
      : true;

    const minAmount = minAmountFilter ? Number(minAmountFilter) : 0;
    const maxAmount = maxAmountFilter ? Number(maxAmountFilter) : Infinity;
    const matchesAmount =
      order.totalHarga >= minAmount && order.totalHarga <= maxAmount;

    return matchesSearch && matchesDate && matchesAmount;
  });

  // Sorting logic
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === "asc" ? 1 : -1;
    }
    return 0;
  });

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Sort request
  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
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

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <AdminSidebar menuActive="pemesanan" />

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
                Order Management
              </h1>
              <p className="text-slate-400 mt-1 text-sm sm:text-base">
                Manage and track customer orders
              </p>
            </div>
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
              className="md:hidden text-slate-400 hover:text-blue-400 transition-colors"
            >
              <Sliders size={20} />
            </button>
          </div>

          <div className={`${isFilterOpen ? "block" : "hidden md:block"}`}>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 flex items-center">
                  <Search className="mr-2" size={16} />
                  Search (Cashier/ID/Product)
                </label>
                <input
                  type="text"
                  placeholder="Search orders..."
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-1 flex items-center">
                  <Calendar className="mr-2" size={16} />
                  Order Date
                </label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                  value={dateFilter}
                  onChange={(e) => {
                    setDateFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-1 flex items-center">
                    <DollarSign className="mr-2" size={16} />
                    Min Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Minimum"
                    className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                    value={minAmountFilter}
                    onChange={(e) => {
                      setMinAmountFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    min="0"
                  />
                </div>
                <div>
                  <label className=" text-sm font-medium text-slate-300 mb-1 flex items-center">
                    <DollarSign className="mr-2" size={16} />
                    Max Amount
                  </label>
                  <input
                    type="number"
                    placeholder="Maximum"
                    className="w-full px-3 py-2.5 bg-slate-700/50 border border-slate-600/50 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-slate-700/70 focus:bg-slate-700/70"
                    value={maxAmountFilter}
                    onChange={(e) => {
                      setMaxAmountFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    min="0"
                  />
                </div>
              </div>

              <div className="flex items-end space-x-2">
                <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={resetFilters}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2.5 rounded-xl hover:from-orange-500 hover:to-red-500 transition-all duration-200 flex items-center justify-center disabled:opacity-50 shadow-lg hover:shadow-orange-500/25 relative overflow-hidden group"
              disabled={loading}
            >
              Refresh Data
            </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Orders Content Section */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 relative z-10"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
            <span className="text-slate-400 text-sm">Loading orders...</span>
          </motion.div>
        ) : currentItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center bg-slate-800/30 rounded-2xl border border-slate-700/50 relative z-10"
          >
            <Frown className="h-12 w-12 text-slate-500 mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-1">
              No Orders Found
            </h3>
            <p className="text-slate-500 max-w-md">
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
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4 relative z-10">
              <div className="text-sm text-slate-400">
                Showing {(currentPage - 1) * itemsPerPage + 1}-
                {Math.min(currentPage * itemsPerPage, sortedOrders.length)} of{" "}
                {sortedOrders.length} orders
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 whitespace-nowrap">
                  Sort by:
                </span>
                <select
                  value={sortConfig.key}
                  onChange={(e) => requestSort(e.target.value)}
                  className="px-3 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-slate-200 backdrop-blur-sm"
                >
                  <option value="tanggalPembelian">Date</option>
                  <option value="pemesananId">Order ID</option>
                  <option value="totalHarga">Amount</option>
                </select>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => requestSort(sortConfig.key)}
                  className="p-2 text-slate-400 hover:text-orange-400 hover:bg-slate-700/50 rounded-xl transition-all"
                >
                  {sortConfig.direction === "asc" ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </motion.button>
              </div>
            </div>

            {/* Orders Cards Grid */}
            <div className="grid grid-cols-1 gap-6 relative z-10">
              {currentItems.map((order, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-orange-500/30 group"
                  onClick={() => openModal(order)}
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h3 className="font-semibold text-white line-clamp-1 group-hover:text-orange-400 transition-colors">
                          Order #{order.pemesananId}
                        </h3>
                        <div className="flex items-center mt-2 text-sm text-slate-400">
                          <User className="h-4 w-4 mr-2" />
                          {order.namaKasir}
                        </div>
                        <div className="flex items-center text-sm text-slate-400">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatDate(order.tanggalPembelian)}
                        </div>
                      </div>
                      <div className="text-right ">
                        <p className="font-bold text-white-400 text-xl text-white line-clamp-1 group-hover:text-orange-400 transition-colors">
                          {formatCurrency(order.totalHarga)}
                        </p>
                        <p className="text-sm text-slate-400 mt-1">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                      <h4 className="text-sm font-medium text-slate-300 mb-2 flex items-center">
                        <Package className="h-4 w-4 mr-2" />
                        Items Purchased
                      </h4>
                      <div className="space-y-2">
                        {order.items.slice(0, 3).map((item, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm"
                          >
                            <span className="text-slate-300 truncate max-w-[180px]">
                              {item.namaProduk} × {item.jumlah}
                            </span>
                            <span className="text-slate-400">
                              {formatCurrency(item.subtotal)}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="text-xs text-slate-500">
                            +{order.items.length - 3} more items
                          </div>
                        )}
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
                  Page {currentPage} of {totalPages}
                </div>
                <nav className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="p-2 rounded-xl bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </motion.button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    const pageNum =
                      Math.max(1, Math.min(currentPage - 2, totalPages - 4)) +
                      i;
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => paginate(pageNum)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-orange-600 to-red-600 border-transparent text-white shadow-lg"
                            : "bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-700/70 hover:text-white"
                        } transition-all duration-200`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="p-2 rounded-xl bg-slate-700/50 border border-slate-600/50 text-slate-300 hover:bg-slate-700/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                </nav>
              </div>
            )}
          </>
        )}

        {/* Order Detail Modal */}
        <AnimatePresence>
          {isModalOpen && selectedOrder && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
              onClick={closeModal}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-800/90 backdrop-blur-xl rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-slate-700/50"
              >
                <div className="p-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800 to-slate-800/70">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-bold tracking-tight bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                      Order Details
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={closeModal}
                      className="p-2 rounded-full hover:bg-slate-700/50 transition-all duration-200 group"
                      aria-label="Close modal"
                    >
                      <X className="w-5 h-5 text-slate-400 group-hover:text-orange-400 transition-colors duration-200" />
                    </motion.button>
                  </div>
                  <div className="mt-4">
                    <div className="flex items-center text-sm text-slate-400">
                      <User className="h-4 w-4 mr-2" />
                      <span className="font-medium text-slate-300">
                        Cashier:
                      </span>
                      <span className="ml-2">{selectedOrder.namaKasir}</span>
                    </div>
                    <div className="flex items-center text-sm text-slate-400 mt-1">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span className="font-medium text-slate-300">Date:</span>
                      <span className="ml-2">
                        {formatDate(selectedOrder.tanggalPembelian)}
                      </span>
                    </div>
                    <div className="flex items-center text-sm text-slate-400 mt-1">
                      <Receipt className="h-4 w-4 mr-2" />
                      <span className="font-medium text-slate-300">
                        Order ID:
                      </span>
                      <span className="ml-2">#{selectedOrder.pemesananId}</span>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  <h4 className="font-medium text-slate-300 mb-3 flex items-center">
                    <Package className="h-4 w-4 mr-2" />
                    Items Purchased
                  </h4>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="flex justify-between p-3 bg-slate-700/50 rounded-lg border border-slate-600/50"
                      >
                        <div>
                          <p className="font-medium text-white">
                            {item.namaProduk}
                          </p>
                          <p className="text-xs text-slate-400 mt-1">
                            {item.jumlah} × {formatCurrency(item.hargaSatuan)}
                          </p>
                        </div>
                        <p className="font-medium text-white-400">
                          {formatCurrency(item.subtotal)}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-700/50">
                    <div className="flex justify-between items-center">
                      <p className="font-medium text-lg text-slate-300">
                        Total Amount:
                      </p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                        {formatCurrency(selectedOrder.totalHarga)}
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default OrderController;
