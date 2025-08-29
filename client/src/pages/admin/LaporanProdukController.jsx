/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../../componens/admin/AdminSidebar";
import { ReportService } from "../../services/ReportService";
import {
  Search,
  Sliders,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Frown,
  RefreshCw,
} from "lucide-react";

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

const LaporanProdukController = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 4;

  const fetchLaporanProduk = async () => {
    try {
      setLoading(true);
      const response = await ReportService.product();
      setProducts(response.data);
      setError(null);
    } catch (error) {
      setError("Gagal memuat data laporan produk");
      console.error("Error fetching product report:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLaporanProduk();
  }, []);

  // Filter and search functionality
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.namaProduk
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesFilter =
        statusFilter === "all" ||
        (statusFilter === "active" && !product.deleted) ||
        (statusFilter === "inactive" && product.deleted);
      return matchesSearch && matchesFilter;
    });
  }, [products, searchTerm, statusFilter]);

  // Sorting functionality
  const sortedProducts = useMemo(() => {
    let sortableItems = [...filteredProducts];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "asc" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredProducts, sortConfig]);

  // Pagination
  const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedProducts.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedProducts, currentPage]);

  const requestSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
    setCurrentPage(1); 
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? (
      <ChevronUp size={16} />
    ) : (
      <ChevronDown size={16} />);
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchLaporanProduk();
  };

  const handleReset = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortConfig({ key: null, direction: "asc" });
    setCurrentPage(1);
    fetchLaporanProduk();
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-white">
      <AdminSidebar menuActive="laporan" />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 relative"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-72 h-72 bg-purple-600 rounded-full blur-3xl"></div>
        </div>

        {/* Header Section - Aligned with KasirController */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-6 relative z-10"
        >
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <motion.div variants={itemVariants} className="max-[884px]:pl-12">
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Product Report
              </h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Product sales analysis and management
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
                onClick={fetchLaporanProduk}
                className="ml-auto px-3 py-1 text-sm bg-red-900/20 text-red-200 rounded-lg hover:bg-red-900/30 transition-colors duration-200"
                aria-label="Retry fetching data"
              >
                Retry
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Search and Filter Section - Aligned with KasirController */}
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
            {/* Search by Product Name */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="search"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Search Product
              </label>
              <div className="relative group">
                <input
                  id="search"
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-700/50 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-gray-700/70"
                  placeholder="Enter product name"
                  aria-label="Search product"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-200" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </motion.div>

            {/* Status Filter */}
            <motion.div variants={itemVariants}>
              <label
                htmlFor="status"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Status
              </label>
              <select
                id="status"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2.5 bg-gray-700/50 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-gray-700/70"
                aria-label="Filter by status"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Non-active</option>
              </select>
            </motion.div>

            {/* Reset & Apply Buttons */}
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
                disabled={loading}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                Apply
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        {/* Table Section - Unchanged */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center h-64"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
            ></motion.div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-900/30 p-4 rounded-xl border border-red-700/50 flex items-center"
          >
            <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
            <p className="text-red-200">{error}</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={fetchLaporanProduk}
              className="ml-auto px-3 py-1 text-sm bg-red-900/20 text-red-200 rounded-lg hover:bg-red-900/30 transition-colors duration-200"
              aria-label="Retry fetching data"
            >
              Retry
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gray-800/80 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700/50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("namaProduk")}
                    >
                      <div className="flex items-center">
                        Product Name
                        {getSortIcon("namaProduk")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("jumlahTerjual")}
                    >
                      <div className="flex items-center">
                        Sold
                        {getSortIcon("jumlahTerjual")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("stok")}
                    >
                      <div className="flex items-center">
                        Stock
                        {getSortIcon("stok")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("hargaSatuan")}
                    >
                      <div className="flex items-center">
                        Unit Price
                        {getSortIcon("hargaSatuan")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("total")}
                    >
                      <div className="flex items-center">
                        Total Sales
                        {getSortIcon("total")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  <AnimatePresence>
                    {paginatedProducts.length > 0 ? (
                      paginatedProducts.map((product, index) => (
                        <motion.tr
                          key={`${product.namaProduk}-${index}`}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="hover:bg-gray-700/30 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {product.namaProduk}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {product.jumlahTerjual}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {product.stok}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {formatCurrency(product.hargaSatuan)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-300">
                              {formatCurrency(product.total)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                product.deleted
                                  ? "bg-red-500/20 text-red-300"
                                  : "bg-green-500/20 text-green-300"
                              }`}
                            >
                              {product.deleted ? "Nonaktif" : "Aktif"}
                            </span>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="bg-gray-800/30"
                      >
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-sm text-gray-400"
                        >
                          <div className="flex flex-col items-center justify-center py-12">
                            <Frown className="h-12 w-12 text-gray-500 mb-4" />
                            <h3 className="text-lg font-medium text-gray-300 mb-1">
                              No Products Found
                            </h3>
                            <p className="text-gray-400 max-w-md">
                              Try adjusting your search filters
                            </p>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Summary Card - Unchanged */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4"
            >
              <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                <h3 className="text-sm font-medium text-gray-400">
                  Total Products
                </h3>
                <p className="text-2xl font-bold text-white mt-1">
                  {filteredProducts.length}
                </p>
              </div>

              <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                <h3 className="text-sm font-medium text-gray-400">
                  Total Sold
                </h3>
                <p className="text-2xl font-bold text-white mt-1">
                  {filteredProducts.reduce(
                    (sum, product) => sum + product.jumlahTerjual,
                    0
                  )}
                </p>
              </div>

              <div className="bg-gray-700/30 p-4 rounded-xl border border-gray-700/50 backdrop-blur-sm">
                <h3 className="text-sm font-medium text-gray-400">
                  Total Sales
                </h3>
                <p className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mt-1">
                  {formatCurrency(
                    filteredProducts.reduce(
                      (sum, product) => sum + product.total,
                      0
                    )
                  )}
                </p>
              </div>
            </motion.div>

            {/* Pagination - Unchanged */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between px-4 py-3 border-t border-gray-700/50"
              >
                <div className="text-sm text-gray-400">
                  Showing{" "}
                  <span className="font-medium">
                    {(currentPage - 1) * itemsPerPage + 1}
                  </span>{" "}
                  -{" "}
                  <span className="font-medium">
                    {Math.min(
                      currentPage * itemsPerPage,
                      filteredProducts.length
                    )}
                  </span>{" "}
                  from{" "}
                  <span className="font-medium">{filteredProducts.length}</span>{" "}
                  result
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className={`p-2 rounded-xl bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
                  >
                    <ChevronLeft size={20} />
                  </motion.button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded-xl flex items-center justify-center border ${
                          currentPage === pageNum
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 border-transparent text-white shadow-lg"
                            : "bg-gray-700/50 border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:text-white"
                        } transition-all duration-200`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className={`p-2 rounded-xl bg-gray-700/50 border border-gray-600 text-gray-300 hover:bg-gray-700/70 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200`}
                  >
                    <ChevronRight size={20} />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.main>
    </div>
  );
};

export default LaporanProdukController;