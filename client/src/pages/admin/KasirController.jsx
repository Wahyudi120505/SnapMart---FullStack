/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import AdminSidebar from "../../componens/admin/AdminSidebar";
import { KasirService } from "../../services/CashierService";
import { motion } from "framer-motion";
import {
  Info,
  X,
  Asterisk,
  Check,
  Search,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Frown,
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

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(dateString));
};

const KasirController = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    size: 5,
    totalItem: 0,
  });
  const [filters, setFilters] = useState({
    nama: "",
    status: "",
    sortBy: "nama",
    sortOrder: "asc",
  });
  const [selectedCashier, setSelectedCashier] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const fetchCashiersData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await KasirService.allKasir({
        page: pagination.page,
        size: pagination.size,
        nama: filters.nama.trim(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      if (!response.success) {
        throw new Error(response.message || "Failed to fetch cashiers data");
      }

      const filteredData = response.data.items
        .filter((item) => item.status !== "pending")
        .filter((item) => !filters.status || item.status == filters.status);

      setData(filteredData || []);
      setPagination((prev) => ({
        ...prev,
        page: response.data.page,
        size: response.data.size,
        totalItem: filters.status
          ? filteredData.length
          : response.data.totalItem,
      }));
    } catch (error) {
      console.error("Error fetching cashiers data:", error);
      setError(
        error.message || "Failed to fetch cashiers data. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCashiersData();
  }, [pagination.page, pagination.size, filters]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleReset = () => {
    setFilters({
      nama: "",
      status: "",
      sortBy: "nama",
      sortOrder: "asc",
    });
    setPagination((prev) => ({ ...prev, page: 1 }));
    setError(null);
  };

  const handleSort = (column) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: column,
      sortOrder:
        prev.sortBy === column && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleEditStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    const actionText = newStatus === "inactive" ? "deactivate" : "activate";

    if (
      !window.confirm(
        `Are you sure you want to ${actionText} this cashier account?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);
      const response = await KasirService.updateStatus(id, newStatus);

      if (!response.success) {
        throw new Error(
          response.message || `Failed to ${actionText} cashier account`
        );
      }

      await fetchCashiersData();
    } catch (error) {
      console.error(`Failed to ${actionText} cashier:`, error);
      setError(
        error.message ||
          `An error occurred while trying to ${actionText} the cashier account`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleShowDetail = (cashier) => {
    setSelectedCashier(cashier);
    setShowDetailModal(true);
  };

  const totalPages = Math.ceil(pagination.totalItem / pagination.size);

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <AdminSidebar menuActive="kasir" />

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
                Cashier Management
              </h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Manage all cashier accounts with ease
              </p>
            </motion.div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className="mt-6 p-4 bg-red-900/30 border border-red-700/50 rounded-xl text-sm text-red-200 flex items-center backdrop-blur-sm"
            >
              <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
              <span>{error}</span>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={fetchCashiersData}
                className="ml-auto px-3 py-1 text-sm bg-red-900/20 text-red-200 rounded-lg hover:bg-red-900/30 transition-colors duration-200"
                aria-label="Retry fetching data"
              >
                Retry
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Search and Filter Section */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="bg-gray-800/80 backdrop-blur-xl p-4 sm:p-6 rounded-2xl shadow-xl border border-gray-700/50 mb-6 relative z-10"
        >
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          >
            <motion.div variants={itemVariants}>
              <label
                htmlFor="nama"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Search by Name
              </label>
              <div className="relative group">
                <input
                  id="nama"
                  type="text"
                  value={filters.nama}
                  onChange={(e) =>
                    setFilters({ ...filters, nama: e.target.value })
                  }
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-700/50 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-gray-700/70"
                  placeholder="Enter cashier name"
                  aria-label="Search cashier by name"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-200" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                value={filters.status}
                onChange={(e) =>
                  setFilters({ ...filters, status: e.target.value })
                }
                className="w-full px-3 py-2.5 bg-gray-700/50 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-gray-700/70"
                aria-label="Filter by status"
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="col-span-1 sm:col-span-2 lg:col-span-2 flex items-end gap-3"
            >
              <motion.button
                type="button"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleReset}
                className="w-full sm:w-auto bg-gray-700/50 border border-gray-600 text-gray-300 px-4 py-2.5 rounded-xl hover:bg-gray-700/70 hover:text-white transition-all duration-200 flex items-center justify-center disabled:opacity-50 backdrop-blur-sm"
                aria-label="Reset filters"
                disabled={loading}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2.5 rounded-xl hover:from-blue-500 hover:to-purple-500 transition-all duration-200 flex items-center justify-center disabled:opacity-50 shadow-lg hover:shadow-blue-500/25 relative overflow-hidden group"
                onClick={fetchCashiersData}
                disabled={loading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                Apply
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        {/* Table Section */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 relative z-10"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <span className="text-gray-400 text-sm">
              Loading cashier data...
            </span>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/50 overflow-hidden relative z-10"
          >
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700/50">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      No
                    </th>
                    <th
                      className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-blue-400 transition-colors duration-200"
                      onClick={() => handleSort("nama")}
                    >
                      <div className="flex items-center">
                        Name
                        {filters.sortBy === "nama" && (
                          <span className="ml-1 text-blue-400">
                            {filters.sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-blue-400 transition-colors duration-200"
                      onClick={() => handleSort("email")}
                    >
                      <div className="flex items-center">
                        Email
                        {filters.sortBy === "email" && (
                          <span className="ml-1 text-blue-400">
                            {filters.sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th
                      className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-blue-400 transition-colors duration-200"
                      onClick={() => handleSort("starDate")}
                    >
                      <div className="flex items-center">
                        Start Date
                        {filters.sortBy === "starDate" && (
                          <span className="ml-1 text-blue-400">
                            {filters.sortOrder === "asc" ? "↑" : "↓"}
                          </span>
                        )}
                      </div>
                    </th>
                    <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800/50 divide-y divide-gray-700/50">
                  {data.length > 0 ? (
                    data.map((item, index) => (
                      <motion.tr
                        key={item.id}
                        variants={itemVariants}
                        className="hover:bg-gray-700/30 transition-colors duration-200 cursor-pointer"
                        onClick={() => handleShowDetail(item)}
                      >
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {(pagination.page - 1) * pagination.size + index + 1}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                          {item.nama}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {item.email}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                          {formatDate(item.starDate)}
                        </td>
                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-3 py-1 text-xs font-semibold rounded-full ${
                              item.status === "active"
                                ? "bg-green-900/30 text-green-400 border border-green-800/50"
                                : "bg-red-900/30 text-red-400 border border-red-800/50"
                            }`}
                          >
                            {item.status.charAt(0).toUpperCase() +
                              item.status.slice(1)}
                          </span>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr variants={itemVariants}>
                      <td
                        colSpan="5"
                        className="px-4 sm:px-6 py-12 text-center"
                      >
                        <div className="flex flex-col items-center justify-center">
                          <Frown className="h-12 w-12 text-gray-500 mb-4" />
                          <p className="text-gray-400 text-sm">
                            {error ? "Error loading data" : "No cashiers found"}
                          </p>
                          {error && (
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={fetchCashiersData}
                              className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-500 hover:to-purple-500 transition-colors duration-200"
                            >
                              Try Again
                            </motion.button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 0 && (
              <motion.div
                variants={itemVariants}
                className="px-4 sm:px-6 py-4 border-t border-gray-700/50 flex flex-col sm:flex-row items-center justify-between gap-4"
              >
                <div className="text-sm text-gray-400">
                  Page {pagination.page} of {totalPages}
                </div>
                <nav
                  className="flex items-center gap-2"
                  aria-label="Pagination"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page - 1,
                      })
                    }
                    disabled={pagination.page === 1}
                    className="p-2 rounded-xl bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    aria-label="Previous page"
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
                        onClick={() =>
                          setPagination({ ...pagination, page: pageNum })
                        }
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
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: pagination.page + 1,
                      })
                    }
                    disabled={pagination.page >= totalPages}
                    className="p-2 rounded-xl bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                    aria-label="Next page"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </motion.button>
                </nav>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedCashier && (
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in"
            onClick={() => setShowDetailModal(false)}
            role="dialog"
            aria-labelledby="modal-title"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl w-11/12 sm:w-80 max-h-[90vh] overflow-hidden border border-gray-700/50 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl pointer-events-none"></div>

              <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700/50 bg-gradient-to-r from-gray-800 to-gray-800/70">
                <div>
                  <h3
                    id="modal-title"
                    className="text-xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"
                  >
                    Cashier Details
                  </h3>
                  <p className="text-sm text-gray-400 mt-1">
                    ID: {selectedCashier.id}
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 rounded-full hover:bg-gray-700/50 transition-all duration-200 group"
                  aria-label="Close modal"
                >
                  <X className="w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors duration-200" />
                </motion.button>
              </div>

              <div className="overflow-y-auto max-h-[70vh] p-4 sm:p-6">
                <motion.div
                  variants={itemVariants}
                  className="flex flex-col items-center mb-6"
                >
                  <div className="relative mb-4 group">
                    {selectedCashier.image ? (
                      <img
                        src={`data:image/jpeg;base64,${selectedCashier.image}`}
                        alt={`Profile of ${selectedCashier.nama}`}
                        className="h-24 sm:h-32 w-24 sm:w-32 rounded-full object-cover border-4 border-gray-700 shadow-lg transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => {
                          e.target.src = "/default-profile.png";
                          e.target.onerror = null;
                        }}
                      />
                    ) : (
                      <div className="h-24 sm:h-32 w-24 sm:w-32 rounded-full bg-gradient-to-br from-gray-700 to-gray-600 flex items-center justify-center border-4 border-gray-700 shadow-lg">
                        <span className="text-gray-400 text-sm sm:text-lg font-medium">
                          No Image
                        </span>
                      </div>
                    )}
                  </div>
                  <h4 className="text-xl sm:text-2xl font-bold text-white text-center tracking-tight">
                    {selectedCashier.nama}
                  </h4>
                  <p className="text-gray-400 mt-1 text-sm">
                    {selectedCashier.email}
                  </p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6"
                >
                  <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50 shadow-sm backdrop-blur-sm">
                    <p className="text-xs font-medium text-gray-400 mb-1">
                      Status
                    </p>
                    <div className="flex items-center">
                      <span
                        className={`inline-block w-3 h-3 rounded-full mr-2 ${
                          selectedCashier.status === "active"
                            ? "bg-green-500 animate-pulse"
                            : "bg-red-500"
                        }`}
                      ></span>
                      <span className="font-medium text-white">
                        {selectedCashier.status.charAt(0).toUpperCase() +
                          selectedCashier.status.slice(1)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-gray-700/50 p-4 rounded-xl border border-gray-600/50 shadow-sm backdrop-blur-sm">
                    <p className="text-xs font-medium text-gray-400 mb-1">
                      Start Date
                    </p>
                    <p className="text-white">
                      {formatDate(selectedCashier.starDate)}
                    </p>
                  </div>
                </motion.div>
              </div>

              <motion.div
                variants={itemVariants}
                className="p-4 sm:p-6 border-t border-gray-700/50 bg-gray-800/70 flex justify-end space-x-3"
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    handleEditStatus(
                      selectedCashier.id,
                      selectedCashier.status
                    );
                    setShowDetailModal(false);
                  }}
                  className={`px-5 py-2.5 rounded-xl font-medium transition-all duration-200 flex items-center ${
                    selectedCashier.status === "active"
                      ? "bg-red-900/30 text-red-400 border border-red-800/50 hover:bg-red-900/40 hover:shadow-lg"
                      : "bg-green-900/30 text-green-400 border border-green-800/50 hover:bg-green-900/40 hover:shadow-lg"
                  }`}
                  aria-label={
                    selectedCashier.status === "active"
                      ? "Deactivate cashier"
                      : "Activate cashier"
                  }
                  disabled={loading}
                >
                  {selectedCashier.status === "active" ? (
                    <>
                      <Asterisk className="w-5 h-5 mr-2" />
                      Deactivate
                    </>
                  ) : (
                    <>
                      <Check className="w-5 h-5 mr-2" />
                      Activate
                    </>
                  )}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDetailModal(false)}
                  className="px-5 py-2.5 bg-gray-700/50 border border-gray-600 text-gray-300 rounded-xl font-medium hover:bg-gray-700/70 hover:text-white transition-all duration-200"
                  aria-label="Close modal"
                >
                  Close
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        )}
      </main>
    </div>
  );
};

export default KasirController;
