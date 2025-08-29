/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthService } from "../../services/AuthService";
import {
  MailCheck,
  Loader,
  ArrowRight,
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

const Verify = () => {
  const location = useLocation();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [email, setEmail] = useState("");
  const [timeLeft, setTimeLeft] = useState(300); 
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const emailFromURL = queryParams.get("email");
    if (emailFromURL) {
      setEmail(emailFromURL);
    }
  }, [location.search]);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanResend(true);
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeft(timeLeft - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    
    if (!otp || otp.length !== 8) {
      setError("Please enter a valid 8-digit OTP code");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await AuthService.verifyEmail(email, otp);
      console.log("Email verification successful:", response);
      setIsVerified(true);
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 3000);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Verification failed. Please check your OTP code."
      );
      console.error("Verification error:", error);
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

        {/* Verification Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700"
        >
          {isVerified ? (
            <motion.div variants={itemVariants} className="text-center space-y-6">
              <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto border border-green-500/30">
                <MailCheck className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-xl font-bold text-white">
                Email Verified!
              </h2>
              <p className="text-gray-400 text-sm">
                Your email has been successfully verified. You'll be redirected to login shortly.
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
                  Enter OTP Code
                </h2>
                <p className="text-gray-400 mt-2 text-sm">
                  We've sent an 8-digit OTP code to <span className="text-blue-400">{email}</span>
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

              <form onSubmit={handleVerify} className="space-y-5">
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
                        const value = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                        setOtp(value);
                      }}
                      required
                      maxLength={8}
                      className="bg-gray-700 border border-gray-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full px-4 py-3 text-sm"
                      placeholder="Enter 8-digit OTP"
                    />
                  </div>
                </motion.div>

                {/* OTP Timer */}
                <motion.div variants={itemVariants} className="text-sm text-gray-400 text-center">
                  {!canResend ? (
                    <p>OTP expires in: {formatTime(timeLeft)}</p>
                  ) : (
                    <p className="text-red-400">OTP has expired</p>
                  )}
                </motion.div>

                {/* Verify OTP Button */}
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
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Verify OTP
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                  )}
                </motion.button>

                {/* Back to Register Button */}
                <motion.div variants={itemVariants} className="mt-6 text-center">
                  <button
                    onClick={() => navigate("/register", { state: { email } })}
                    className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200 text-sm"
                  >
                    Back to Register
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

export default Verify;