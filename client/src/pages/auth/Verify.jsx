// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthService } from "../../services/AuthService";
import {
  MailCheck,
  AlertCircle,
  Loader,
  ArrowRight,
  ShoppingCart,
  Lock,
  Edit,
} from "lucide-react";

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

  const handleEditRegistration = () => {
    navigate("/register", { state: { email } });
  };

  return (
    <div className="min-h-screen bg-blue-50 text-gray-800 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <motion.div
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ repeat: Infinity, duration: 4 }}
          >
            <ShoppingCart className="w-12 h-12 text-green-600" />
          </motion.div>
          <h1 className="text-3xl font-bold mt-4 bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            SnapMart POS
          </h1>
          <p className="text-gray-600 mt-2">Email Verification</p>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white rounded-xl shadow-xl p-8 border border-gray-200 text-center"
        >
          {isVerified ? (
            <div className="space-y-4">
              <MailCheck className="w-16 h-16 text-green-500 mx-auto" />
              <h2 className="text-2xl font-semibold">Email Verified!</h2>
              <p className="text-gray-600">
                Your email has been successfully verified. You'll be redirected
                to login shortly.
              </p>
              <div className="pt-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-center mb-6">
                <Lock className="w-6 h-6 text-green-600 mr-2" />
                <h2 className="text-xl font-semibold">Enter OTP Code</h2>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-sm text-red-700 flex items-center"
                >
                  <AlertCircle className="w-5 h-5 mr-2" />
                  <span>{error}</span>
                </motion.div>
              )}

              <p className="text-gray-600 mb-4">
                We've sent an 8-digit OTP code to:{" "}
                <span className="font-medium">{email}</span>
              </p>

              <form onSubmit={handleVerify} className="space-y-4">
                <div>
                  <label htmlFor="otp" className="sr-only">
                    OTP Code
                  </label>
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
                    className="w-full px-4 py-3 text-center text-lg font-medium border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="12345678"
                  />
                </div>

                <div className="text-sm text-gray-500">
                  {!canResend ? (
                    <p>OTP expires in: {formatTime(timeLeft)}</p>
                  ) : (
                    <p className="text-red-500">OTP has expired</p>
                  )}
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-500 hover:to-blue-500 text-white font-medium rounded-lg px-5 py-2.5 text-center transition-all duration-300"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <Loader className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                      Verifying...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Verify OTP <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  )}
                </motion.button>
              </form>

              <div className="mt-4 flex justify-between items-center text-sm">
                <button
                  type="button"
                  onClick={handleEditRegistration}
                  className="text-gray-600 hover:text-gray-800 font-medium flex items-center"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Edit registration
                </button>
              </div>
            </>
          )}
        </motion.div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} SnapMart POS System. All rights reserved.
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default Verify;