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
  X,
} from "lucide-react";
import { saveAs } from "file-saver";

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

  const handleDateFilter = () => {
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
        <div className="mb-8 relative z-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-transparent">
                Income Reports
              </h1>
              <p className="text-slate-400 mt-2 text-sm sm:text-base">
                Generate and download financial statements in Excel format
              </p>
            </div>
          </div>
        </div>

        {/* Report Card */}
        <div className="bg-slate-800/70 backdrop-blur-md rounded-xl p-6 mb-8 border border-slate-700/50 relative z-10">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Download className="text-orange-400 w-5 h-5" />
            <span>Report Options</span>
          </h2>

          {/* Quick Report Buttons */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-slate-400 mb-4">
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

          {/* Date Filter Section */}
          <div className="border-t border-slate-700 pt-6">
            <h3 className="text-sm font-medium text-slate-400 mb-4 flex items-center gap-2">
              <Calendar className="text-orange-400 w-5 h-5" />
              <span>Custom Date Range</span>
            </h3>

            <div className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateInput
                  label="Start Date"
                  value={dateRange.startDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, startDate: e.target.value })
                  }
                />
                <DateInput
                  label="End Date"
                  value={dateRange.endDate}
                  onChange={(e) =>
                    setDateRange({ ...dateRange, endDate: e.target.value })
                  }
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleDateFilter}
                className="w-full md:w-auto px-6 py-2.5 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-500 hover:to-red-500 transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden group"
                disabled={loading}
              >
                {/* Button content */}
                <span className="relative z-10 flex items-center gap-2">
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Download className="w-5 h-5" />
                  )}
                  Generate Report
                </span>

                {/* Animated hover overlay */}
                <span className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-0"></span>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-900/30 border-l-4 border-red-500 p-4 mb-6 rounded-r-lg flex items-start justify-between gap-3 relative z-10"
          >
            <div className="flex items-start gap-3">
              <AlertCircle className="text-red-400 w-5 h-5 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-300">Error</h3>
                <p className="text-sm text-red-200 mt-1">{error}</p>
              </div>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-300 hover:text-white p-1 rounded-full hover:bg-red-500/30 transition-colors"
              aria-label="Dismiss error"
            >
              <X />
            </button>
          </motion.div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 relative z-10"
          >
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
            <span className="text-slate-400 text-sm">Loading reports...</span>
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
      className="flex flex-col items-center justify-center p-4 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden hover:shadow-lg transition-all duration-200 hover:border-orange-500/30 group"
      disabled={loading}
    >
      <span className="font-medium flex items-center gap-2 text-white">
        <Download className="w-4 h-4 text-orange-400" />
        {label}
      </span>
      <span className="text-xs text-slate-400 mt-1">{description}</span>
      <span className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></span>
    </motion.button>
  );
};

const DateInput = ({ label, value, onChange }) => (
  <div>
    <label className="block text-sm font-medium text-slate-400 mb-1.5">
      {label}
    </label>
    <input
      type="date"
      className="w-full px-3.5 py-2.5 bg-slate-800 border border-slate-700 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 text-sm text-white"
      value={value}
      onChange={onChange}
    />
  </div>
);

const SummaryCard = ({ title, value, trend, percentage, color }) => {
  const colorClasses = {
    green: "text-green-400",
    blue: "text-blue-400",
    orange: "text-orange-400",
  };

  return (
    <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700/50">
      <h3 className="text-sm font-medium text-slate-400">{title}</h3>
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
