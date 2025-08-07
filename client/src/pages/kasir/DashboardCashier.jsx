/* eslint-disable no-unused-vars */
import {
  PlusCircle,
  DollarSign,
  ShoppingBag,
  Loader2,
  X,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { OrderService } from "../../services/OrderService";
import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

const DashboardKasir = () => {
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [stats, setStats] = useState({
    totalToday: 0,
    totalRevenue: 0,
  });

  // Filter states
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showFilters, setShowFilters] = useState(false);
  const [totalRange, setTotalRange] = useState([0, 1000000]);
  const [maxTotal, setMaxTotal] = useState(1000000);
  const [currentPage, setCurrentPage] = useState(1);
  const transactionsPerPage = 5;

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await OrderService.history();

      if (response.success) {
        setTransactions(response.data);

        // Calculate max total for slider
        const max = Math.max(
          ...response.data.map((t) => t.totalHarga),
          1000000
        );
        setMaxTotal(max);
        setTotalRange([0, max]);

        // Calculate stats
        const today = new Date().toISOString().split("T")[0];
        const todayTransactions = response.data.filter((trx) =>
          trx.tanggalPembelian.startsWith(today)
        );

        setStats({
          totalToday: todayTransactions.length,
          totalRevenue: todayTransactions.reduce(
            (sum, trx) => sum + trx.totalHarga,
            0
          ),
        });
      }
    } catch (error) {
      console.error("Failed to fetch transaction history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateOrder = () => {
    navigate("/kasir/transaction/new");
  };

  const handleShowDetail = (transaction) => {
    setSelectedTransaction(transaction);
    setShowDetailModal(true);
  };

  const handleDateFilter = (dates) => {
    const [start, end] = dates;
    setDateRange([start, end]);
    setCurrentPage(1);
  };

  const handleTotalFilter = (value) => {
    setTotalRange(value);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setDateRange([null, null]);
    setTotalRange([0, maxTotal]);
    setCurrentPage(1);
  };

  // Filter transactions based on date and total range
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = parseISO(transaction.tanggalPembelian);
    const transactionTotal = transaction.totalHarga;

    const adjustedEndDate = endDate ? new Date(endDate.getTime()) : null;
    if (adjustedEndDate) adjustedEndDate.setHours(23, 59, 59, 999);

    let dateMatch = true;
    if (startDate && endDate) {
      dateMatch =
        transactionDate >= startDate && transactionDate <= adjustedEndDate;
    } else if (startDate) {
      dateMatch = transactionDate >= startDate;
    } else if (endDate) {
      dateMatch = transactionDate <= adjustedEndDate;
    }

    const totalMatch =
      transactionTotal >= totalRange[0] && transactionTotal <= totalRange[1];

    return dateMatch && totalMatch;
  });

  // Pagination logic
  const indexOfLastTransaction = currentPage * transactionsPerPage;
  const indexOfFirstTransaction = indexOfLastTransaction - transactionsPerPage;
  const currentTransactions = filteredTransactions.slice(
    indexOfFirstTransaction,
    indexOfLastTransaction
  );
  const totalPages = Math.ceil(
    filteredTransactions.length / transactionsPerPage
  );

  useEffect(() => {
    fetchHistory();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, "dd MMM yyyy HH:mm", { locale: id });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
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
        <div className="flex justify-between items-center mb-8">
          <motion.h1
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-transparent tracking-wide"
          >
            Cashier Dashboard
          </motion.h1>
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 z-0"
            >
              <Filter className="w-5 h-5" />
              Filter
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleCreateOrder}
              className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 z-0"
            >
              <PlusCircle className="w-5 h-5" />
              New Transaction
            </motion.button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-slate-700/50 p-4 sm:p-6 mb-8 relative z-0"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10 pointer-events-none"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 relative">
                {/* Date Filter */}
                <div>
                  <h3 className="font-semibold text-slate-300 mb-2 sm:mb-3 tracking-wide text-sm sm:text-base">
                    Date Filter
                  </h3>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative w-full">
                      <label
                        htmlFor="startDate"
                        className="block text-xs text-slate-400 mb-1"
                      >
                        Start Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="startDate"
                          value={
                            startDate ? format(startDate, "yyyy-MM-dd") : ""
                          }
                          onChange={(e) => {
                            const date = e.target.value
                              ? new Date(e.target.value)
                              : null;
                            handleDateFilter([date, endDate]);
                          }}
                          className="w-full p-2 sm:p-3 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 text-sm sm:text-base appearance-none"
                        />
                        <Calendar className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>

                    <div className="relative w-full">
                      <label
                        htmlFor="endDate"
                        className="block text-xs text-slate-400 mb-1"
                      >
                        End Date
                      </label>
                      <div className="relative">
                        <input
                          type="date"
                          id="endDate"
                          value={endDate ? format(endDate, "yyyy-MM-dd") : ""}
                          onChange={(e) => {
                            const date = e.target.value
                              ? new Date(e.target.value)
                              : null;
                            handleDateFilter([startDate, date]);
                          }}
                          min={startDate ? format(startDate, "yyyy-MM-dd") : ""}
                          className="w-full p-2 sm:p-3 bg-slate-700/50 border border-slate-600/50 text-white rounded-lg focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500/50 transition-all duration-300 text-sm sm:text-base appearance-none"
                        />
                        <Calendar className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Total Amount Filter */}
                <div>
                  <h3 className="font-semibold text-slate-300 mb-2 sm:mb-3 tracking-wide text-sm sm:text-base">
                    Filter Total ({formatCurrency(totalRange[0])} -{" "}
                    {formatCurrency(totalRange[1])})
                  </h3>
                  <Slider
                    range
                    min={0}
                    max={maxTotal}
                    step={10000}
                    value={totalRange}
                    onChange={handleTotalFilter}
                    trackStyle={[{ backgroundColor: "#f97316" }]}
                    handleStyle={[
                      { backgroundColor: "#f97316", borderColor: "#f97316" },
                      { backgroundColor: "#f97316", borderColor: "#f97316" },
                    ]}
                  />
                  <div className="flex justify-between text-xs sm:text-sm text-slate-400 mt-1 sm:mt-2">
                    <span>{formatCurrency(0)}</span>
                    <span>{formatCurrency(maxTotal)}</span>
                  </div>
                </div>
              </div>
              <div className="mt-3 sm:mt-4 flex justify-end">
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={clearFilters}
                  className="text-xs sm:text-sm text-red-400 hover:text-red-300 font-semibold transition-colors duration-200 z-0"
                >
                  Reset All Filters
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-slate-700/50 p-4 relative overflow-hidden z-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10 pointer-events-none"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-sm font-semibold text-slate-400">
                  Today's Transactions
                </p>
                <p className="text-2xl font-bold text-white mt-1">{stats.totalToday}</p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-orange-600 to-red-600">
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-slate-700/50 p-4 relative overflow-hidden z-0"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10 pointer-events-none"></div>
            <div className="flex items-center justify-between relative">
              <div>
                <p className="text-sm font-semibold text-slate-400">
                  Total Revenue
                </p>
                <p className="text-2xl font-bold text-white mt-1">
                  {formatCurrency(stats.totalRevenue)}
                </p>
              </div>
              <div className="p-3 rounded-full bg-gradient-to-r from-orange-600 to-red-600">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Transactions Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-slate-700/50 p-6 mb-8 relative overflow-hidden z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10 pointer-events-none"></div>
          <div className="flex justify-between items-center mb-4 relative">
            <h2 className="text-lg font-semibold text-white tracking-wide">
              Transaction History
            </h2>
            {loading && (
              <Loader2 className="w-5 h-5 text-orange-400 animate-spin" />
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-slate-400 text-center py-8">There are no transactions yet</p>
          ) : filteredTransactions.length === 0 ? (
            <p className="text-slate-400 text-center py-8">
              No transactions were found that match the filter.
            </p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-700/50">
                  <thead className="bg-slate-700/50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        No
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-slate-300 uppercase tracking-wider">
                        Items
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700/50">
                    {currentTransactions.map((transaction) => (
                      <motion.tr
                        key={transaction.pemesananId}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="hover:bg-slate-700/50 cursor-pointer transition-colors duration-200"
                        onClick={() => handleShowDetail(transaction)}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          #{transaction.pemesananId}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {formatDate(transaction.tanggalPembelian)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {formatCurrency(transaction.totalHarga)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {transaction.items.length} item
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="flex items-center justify-between mt-4 z-0"
              >
                <div className="text-sm text-slate-400">
                  Showing {indexOfFirstTransaction + 1}-
                  {Math.min(indexOfLastTransaction, filteredTransactions.length)}{" "}
                  from {filteredTransactions.length} transaction
                </div>
                <div className="flex items-center space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`p-2 rounded-xl bg-slate-700/50 text-slate-300 ${
                      currentPage === 1
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-slate-700/70 hover:text-orange-400"
                    } transition-all duration-200 z-0`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </motion.button>

                  <span className="text-sm text-slate-300">
                    page {currentPage} from {totalPages}
                  </span>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-xl bg-slate-700/50 text-slate-300 ${
                      currentPage === totalPages
                        ? "opacity-50 cursor-not-allowed"
                        : "hover:bg-slate-700/70 hover:text-orange-400"
                    } transition-all duration-200 z-0`}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </motion.button>
                </div>
              </motion.div>
            </>
          )}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl border border-slate-700/50 p-6 relative overflow-hidden z-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10 pointer-events-none"></div>
          <h3 className="font-semibold text-slate-300 mb-3 tracking-wide relative">
            Best Selling Products
          </h3>
          <div className="space-y-3 relative">
            {transactions.length > 0 ? (
              [...transactions]
                .flatMap((trx) => trx.items)
                .reduce((acc, item) => {
                  const existing = acc.find(
                    (i) => i.namaProduk === item.namaProduk
                  );
                  if (existing) {
                    existing.jumlah += item.jumlah;
                    existing.subtotal += item.subtotal;
                  } else {
                    acc.push({ ...item });
                  }
                  return acc;
                }, [])
                .sort((a, b) => b.jumlah - a.jumlah)
                .slice(0, 4)
                .map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex justify-between items-center border-b border-slate-700/50 pb-2 last:border-b-0"
                  >
                    <div>
                      <p className="font-medium text-white">{item.namaProduk}</p>
                      <p className="text-sm text-slate-400">
                        Sold: {item.jumlah}
                      </p>
                    </div>
                    <p className="font-medium text-orange-400">
                      {formatCurrency(item.subtotal)}
                    </p>
                  </motion.div>
                ))
            ) : (
              <p className="text-slate-400">No product data</p>
            )}
          </div>
        </motion.div>

        {/* Transaction Detail Modal */}
        <AnimatePresence>
          {showDetailModal && selectedTransaction && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-20"
              onClick={() => setShowDetailModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 300 }}
                className="bg-slate-800/90 backdrop-blur-xl rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-700/50 relative z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10 pointer-events-none"></div>
                <div className="sticky top-0 bg-slate-800/90 p-4 border-b border-slate-700/50 flex justify-between items-center">
                  <h2 className="text-xl font-bold text-white tracking-wide">
                    Transaction Details #{selectedTransaction.pemesananId}
                  </h2>
                  <motion.button
                    whileHover={{ rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowDetailModal(false)}
                    className="text-slate-400 hover:text-orange-400 transition-colors duration-200"
                  >
                    <X className="w-6 h-6" />
                  </motion.button>
                </div>

                <div className="p-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-slate-400 tracking-wide">Cashier</h3>
                      <p className="text-lg text-white">{selectedTransaction.namaKasir || "-"}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-400 tracking-wide">Date</h3>
                      <p className="text-lg text-white">{formatDate(selectedTransaction.tanggalPembelian)}</p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-400 tracking-wide">Total</h3>
                      <p className="text-2xl font-bold text-orange-400">
                        {formatCurrency(selectedTransaction.totalHarga)}
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-400 mb-2 tracking-wide">Items</h3>
                      <div className="space-y-3">
                        {selectedTransaction.items.map((item, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex justify-between items-center border-b border-slate-700/50 pb-2 last:border-b-0"
                          >
                            <div>
                              <p className="font-medium text-white">{item.namaProduk}</p>
                              <p className="text-sm text-slate-400">
                                {item.jumlah} x {formatCurrency(item.hargaSatuan)}
                              </p>
                            </div>
                            <p className="font-medium text-orange-400">
                              {formatCurrency(item.subtotal)}
                            </p>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDetailModal(false)}
                    className="mt-6 w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white py-2 rounded-xl shadow-lg hover:shadow-orange-500/25 transition-all duration-300 z-20"
                  >
                    Close
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

export default DashboardKasir;



