/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../../componens/admin/AdminSidebar";
import { ReportService } from "../../services/ReportService";
import {
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const LaporanProdukController = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

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
    setCurrentPage(1); // Reset to first page when sorting
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
      <ArrowUp size={16} />
    ) : (
      <ArrowDown size={16} />
    );
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <AdminSidebar menuActive="laporan" />

      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8 relative"
      >
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
                Product Report
              </h1>
              <p className="text-slate-400 mt-1 text-sm sm:text-base">
                Product sales analysis and management
              </p>
            </div>
          </div>

          {/* Search and Filter Controls */}
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search for products..."
                className="pl-10 w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-slate-400" />
              </div>
              <select
                className="pl-10 w-full bg-slate-800/50 border border-slate-700/50 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent appearance-none"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Non-active</option>
              </select>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchLaporanProduk}
              className="w-full sm:w-auto bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-2.5 rounded-xl hover:from-orange-500 hover:to-red-500 transition-all duration-200 flex items-center justify-center disabled:opacity-50 shadow-lg hover:shadow-orange-500/25 relative overflow-hidden group"
              disabled={loading}
            >
              Refresh Data
            </motion.button>
          </motion.div>
        </div>

        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-center items-center h-64"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"
            ></motion.div>
          </motion.div>
        ) : error ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/20 p-4 rounded-lg border border-red-500/50"
          >
            <p className="text-red-300">{error}</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchLaporanProduk}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
            >
              Try again
            </motion.button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-700/50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-orange-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("namaProduk")}
                    >
                      <div className="flex items-center">
                        Product Name
                        {getSortIcon("namaProduk")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-orange-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("jumlahTerjual")}
                    >
                      <div className="flex items-center">
                        Sold
                        {getSortIcon("jumlahTerjual")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-orange-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("stok")}
                    >
                      <div className="flex items-center">
                        Stock
                        {getSortIcon("stok")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-orange-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("hargaSatuan")}
                    >
                      <div className="flex items-center">
                        Unit Price
                        {getSortIcon("hargaSatuan")}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-orange-300 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("total")}
                    >
                      <div className="flex items-center">
                        Total Sales
                        {getSortIcon("total")}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-orange-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50">
                  <AnimatePresence>
                    {paginatedProducts.length > 0 ? (
                      paginatedProducts.map((product, index) => (
                        <motion.tr
                          key={`${product.namaProduk}-${index}`}
                          variants={rowVariants}
                          initial="hidden"
                          animate="visible"
                          exit="hidden"
                          className="hover:bg-slate-700/30 transition-colors"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-white">
                              {product.namaProduk}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-300">
                              {product.jumlahTerjual}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-300">
                              {product.stok}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-300">
                              {formatCurrency(product.hargaSatuan)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-300">
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
                      >
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-sm text-slate-400"
                        >
                          There is no product data that matches the criteria.
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4"
            >
              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-400">
                  Total Products
                </h3>
                <p className="text-2xl font-bold text-white mt-1">
                  {filteredProducts.length}
                </p>
              </div>

              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-400">
                  Total Sold
                </h3>
                <p className="text-2xl font-bold text-white mt-1">
                  {filteredProducts.reduce(
                    (sum, product) => sum + product.jumlahTerjual,
                    0
                  )}
                </p>
              </div>

              <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-700/50">
                <h3 className="text-sm font-medium text-slate-400">
                  Total Sales
                </h3>
                <p className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                  {formatCurrency(
                    filteredProducts.reduce(
                      (sum, product) => sum + product.total,
                      0
                    )
                  )}
                </p>
              </div>
            </motion.div>

            {/* Pagination */}
            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center justify-between px-4 py-3 border-t border-slate-700/50"
              >
                <div className="text-sm text-slate-400">
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
                    className={`p-2 rounded-lg ${
                      currentPage === 1
                        ? "bg-slate-700/30 text-slate-500 cursor-not-allowed"
                        : "bg-slate-700/50 hover:bg-slate-700/70 text-slate-300"
                    }`}
                  >
                    <ChevronLeft size={20} />
                  </motion.button>

                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    // Show pages around current page
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
                        className={`w-10 h-10 rounded-lg ${
                          currentPage === pageNum
                            ? "bg-orange-600 text-white"
                            : "bg-slate-700/50 hover:bg-slate-700/70 text-slate-300"
                        }`}
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
                    className={`p-2 rounded-lg ${
                      currentPage === totalPages
                        ? "bg-slate-700/30 text-slate-500 cursor-not-allowed"
                        : "bg-slate-700/50 hover:bg-slate-700/70 text-slate-300"
                    }`}
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
