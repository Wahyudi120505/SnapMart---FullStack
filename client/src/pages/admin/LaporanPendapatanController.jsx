/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AdminSidebar from "../../componens/admin/AdminSidebar";
import { ReportService } from "../../services/ReportService";
import {
  Download,
  Calendar,
  AlertCircle,
  Loader2,
  ArrowUp,
  ArrowDown,
  RefreshCw,
} from "lucide-react";
import { saveAs } from "file-saver";

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

const LaporanPendapatanController = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  const fetchReport = async (fetchFunction, reportName) => {
    try {
      setLoading(true);
      setError(null);

      const blob = await fetchFunction();
      const timestamp = new Date().toISOString().split("T")[0];
      saveAs(blob, `report-${reportName}-${timestamp}.xlsx`);
    } catch (error) {
      setError(error.message || "Failed to load report data");
      console.error("Error fetching report:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDateFilter = (e) => {
    e.preventDefault();
    if (!dateRange.startDate || !dateRange.endDate) {
      setError("Please select both start and end dates");
      return;
    }
    fetchReport(
      () =>
        ReportService.filterDateIncome(dateRange.startDate, dateRange.endDate),
      "custom"
    );
  };

  const handleReset = () => {
    setDateRange({ startDate: "", endDate: "" });
    setError(null);
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
                Income Reports
              </h1>
              <p className="text-gray-400 mt-1 text-sm sm:text-base">
                Generate and download financial statements in Excel format
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
                onClick={() => handleDateFilter({ preventDefault: () => {} })}
                className="ml-auto px-3 py-1 text-sm bg-red-900/20 text-red-200 rounded-lg hover:bg-red-900/30 transition-colors duration-200"
                aria-label="Retry fetching data"
              >
                Retry
              </motion.button>
            </motion.div>
          )}
        </motion.div>

        {/* Report Card */}
        <div className="bg-gray-800/80 backdrop-blur-xl rounded-2xl p-6 mb-8 border border-gray-700/50 relative z-10">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Download className="text-blue-400 w-5 h-5" />
            <span>Report Options</span>
          </h2>

          {/* Quick Report Buttons */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-400 mb-4">
              Quick Reports
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <ReportButton
                onClick={() => fetchReport(ReportService.dailyIncome, "daily")}
                label="Daily"
                description="Today's report"
                loading={loading}
              />
              <ReportButton
                onClick={() =>
                  fetchReport(ReportService.WeeklyIncome, "weekly")
                }
                label="Weekly"
                description="Last 7 days"
                loading={loading}
              />
              <ReportButton
                onClick={() =>
                  fetchReport(ReportService.MonthlyIncome, "monthly")
                }
                label="Monthly"
                description="This month"
                loading={loading}
              />
              <ReportButton
                onClick={() =>
                  fetchReport(ReportService.AnnualIncome, "annual")
                }
                label="Annual"
                description="This year"
                loading={loading}
              />
            </div>
          </div>

          {/* Date Filter Section - Aligned with KasirController */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="border-t border-gray-700 pt-6"
          >
            <h3 className="text-sm font-medium text-gray-400 mb-4 flex items-center gap-2">
              <Calendar className="text-blue-400 w-5 h-5" />
              <span>Custom Date Range</span>
            </h3>

            <form
              onSubmit={handleDateFilter}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
            >
              <motion.div variants={itemVariants}>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  Start Date
                </label>
                <div className="relative group">
                  <input
                    id="startDate"
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, startDate: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-700/50 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-gray-700/70"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-200" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <label
                  htmlFor="endDate"
                  className="block text-sm font-medium text-gray-300 mb-1"
                >
                  End Date
                </label>
                <div className="relative group">
                  <input
                    id="endDate"
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, endDate: e.target.value })
                    }
                    className="w-full pl-10 pr-3 py-2.5 bg-gray-700/50 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-gray-700/70"
                  />
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-200" />
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                </div>
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
                  <span className="flex items-center gap-2">
                    {loading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Download className="w-5 h-5" />
                    )}
                    Generate
                  </span>
                </motion.button>
              </motion.div>
            </form>
          </motion.div>
        </div>

        {/* Loading Overlay */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 relative z-10"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
            <span className="text-gray-400 text-sm">Loading reports...</span>
          </motion.div>
        )}
      </motion.main>
    </div>
  );
};

// Reusable Components
const ReportButton = ({ onClick, label, description, loading }) => {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="flex flex-col items-center justify-center p-4 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-blue-500/30 group"
      disabled={loading}
    >
      <span className="font-medium flex items-center gap-2 text-white">
        <Download className="w-4 h-4 text-blue-400" />
        {label}
      </span>
      <span className="text-xs text-gray-400 mt-1">{description}</span>
      <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
    </motion.button>
  );
};

const DateInput = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-gray-300 mb-1">
      {label}
    </label>
    <div className="relative group">
      <input
        type="date"
        className="w-full pl-10 pr-3 py-2.5 bg-gray-700/50 border border-gray-600 text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 backdrop-blur-sm transition-all duration-300 hover:bg-gray-700/70"
        value={value}
        onChange={onChange}
      />
      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 group-focus-within:text-blue-400 transition-colors duration-200" />
      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/5 to-purple-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
    </div>
  </div>
);

const SummaryCard = ({ title, value, trend, percentage, color }) => {
  const colorClasses = {
    green: "text-green-400",
    blue: "text-blue-400",
    orange: "text-orange-400",
  };

  return (
    <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700/50">
      <h3 className="text-sm font-medium text-gray-400">{title}</h3>
      <p className="text-2xl font-bold text-white mt-1">{value}</p>
      <div className={`flex items-center mt-2 text-sm ${colorClasses[color]}`}>
        {trend === "up" ? (
          <ArrowUp className="w-4 h-4 mr-1" />
        ) : (
          <ArrowDown className="w-4 h-4 mr-1" />
        )}
        {percentage} {trend === "up" ? "increase" : "decrease"} from last period
      </div>
    </div>
  );
};

export default LaporanPendapatanController;