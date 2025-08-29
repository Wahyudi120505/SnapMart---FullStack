/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../services/AuthService";
import { motion } from "framer-motion";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader,
  ShoppingBasket,
} from "lucide-react";

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120
    }
  }
};

const ResetPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("resetEmail");
    if (savedEmail) {
      setEmail(savedEmail);
    } else {
      navigate("/forgotPassword");
    }
  }, [navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!otp) {
      setError("Please enter the OTP code");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await AuthService.resetPassword({
        email,
        otp,
        newPassword: password,
      });

      console.log("Password reset successful:", response);
      setIsSuccess(true);
      localStorage.removeItem("resetEmail");

      setTimeout(() => {
        navigate("/", { replace: true });
      }, 3000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Password reset failed. Please check your OTP and try again."
      );
      console.error("Password reset error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4 sm:p-6 md:p-8">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="w-full max-w-md"
      >
        {/* Logo & Title */}
        <motion.div variants={itemVariants} className="flex flex-col items-center mb-8">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
            className="mb-4"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-4 rounded-2xl shadow-lg">
              <ShoppingBasket className="w-8 h-8 text-white" />
            </div>
          </motion.div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            SnapMart POS
          </h1>
          <p className="text-gray-400 mt-2 text-center">Modern Retail Management Solution</p>
        </motion.div>

        {/* Reset Password Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700"
        >
          {isSuccess ? (
            <motion.div variants={itemVariants} className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                <Lock className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Password Reset Successful!
              </h2>
              <p className="text-gray-400 text-sm">
                Your password has been successfully updated. You'll be redirected to login shortly.
              </p>
              <div className="pt-4">
                <Loader className="animate-spin h-10 w-10 text-blue-400 mx-auto" />
              </div>
            </motion.div>
          ) : (
            <>
              <motion.div 
                variants={itemVariants}
                className="mb-6 text-center"
              >
                <h2 className="text-xl font-bold text-white">
                  Reset Password
                </h2>
                <p className="text-gray-400 mt-2 text-sm">
                  Enter the OTP sent to <span className="text-blue-400">{email}</span> and your new password
                </p>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-sm text-red-200 flex items-center"
                >
                  <div className="w-2 h-2 bg-red-500 rounded-full mr-3 animate-pulse"></div>
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleResetPassword} className="space-y-5">
                {/* OTP Field */}
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="otp"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    OTP Code
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="otp"
                      name="otp"
                      value={otp}
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, "");
                        setOtp(value);
                      }}
                      required
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full px-4 py-3 text-sm"
                      placeholder="Enter OTP"
                    />
                  </div>
                </motion.div>

                {/* New Password Field */}
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="password"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-3 text-sm"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-200" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-200" />
                      )}
                    </button>
                  </div>
                </motion.div>

                {/* Confirm Password Field */}
                <motion.div variants={itemVariants}>
                  <label
                    htmlFor="confirmPassword"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-4 py-3 text-sm"
                      placeholder="Confirm new password"
                    />
                  </div>
                </motion.div>

                {/* Reset Password Button */}
                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium rounded-lg px-4 py-3 text-center transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader className="animate-spin h-5 w-5 text-white mr-2" />
                      Resetting...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Reset Password
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                  )}
                </motion.button>

                {/* Back to Login Button */}
                <motion.div variants={itemVariants} className="mt-6 text-center">
                  <button
                    onClick={() => navigate("/")}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 text-sm"
                  >
                    Back to Login
                  </button>
                </motion.div>
              </form>
            </>
          )}
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="mt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} SnapMart POS System</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default ResetPassword;