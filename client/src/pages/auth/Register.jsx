/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion } from "framer-motion";
import { AuthService } from "../../services/AuthService";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Store,
  Loader,
  AlertCircle,
  ShoppingBasket,
} from "lucide-react";

const Register = () => {
  const [error, setError] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    nama: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();

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

  const validateForm = (formData) => {
    const newErrors = {
      nama: "",
      email: "",
      password: "",
    };
    let isValid = true;

    // Name validation
    if (!formData.nama.trim()) {
      newErrors.nama = "Name is required";
      isValid = false;
    } else if (formData.nama.length < 3) {
      newErrors.nama = "Name must be at least 3 characters";
      isValid = false;
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email";
      isValid = false;
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
      isValid = false;
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setError(null);

    const formData = {
      nama: event.target.nama.value,
      email: event.target.email.value,
      password: event.target.password.value,
    };

    if (!validateForm(formData)) {
      return;
    }

    setIsLoading(true);

    try {
      const response = await AuthService.register(formData);
      console.log("Registration successful:", response);
      navigate("/verify?email=" + encodeURIComponent(formData.email))
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed. Please check your details."
      );
      console.error("Registration failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name } = e.target;
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
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
          <p className="text-gray-400 mt-2 text-center">Create Your Account</p>
        </motion.div>

        {/* Register Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-700"
        >
          <motion.div 
            variants={itemVariants}
            className="flex items-center justify-center mb-6"
          >
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg mr-2">
              <Store className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-xl font-bold">Account Registration</h2>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-sm text-red-200 flex items-center"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleRegister} className="space-y-5" noValidate>
            {/* Name Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="nama" className="block text-sm font-medium text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="nama"
                  name="nama"
                  required
                  className={`bg-gray-700 border ${
                    errors.nama ? "border-red-500" : "border-gray-600"
                  } text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-4 py-3 text-sm`}
                  placeholder="John Doe"
                  onChange={handleInputChange}
                />
              </div>
              {errors.nama && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.nama}
                </p>
              )}
            </motion.div>

            {/* Email Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className={`bg-gray-700 border ${
                    errors.email ? "border-red-500" : "border-gray-600"
                  } text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-4 py-3 text-sm`}
                  placeholder="your@email.com"
                  onChange={handleInputChange}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.email}
                </p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div variants={itemVariants}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  required
                  className={`bg-gray-700 border ${
                    errors.password ? "border-red-500" : "border-gray-600"
                  } text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 pr-12 py-3 text-sm`}
                  placeholder="••••••••••••"
                  onChange={handleInputChange}
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
              {errors.password && (
                <p className="mt-2 text-sm text-red-400 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {errors.password}
                </p>
              )}
            </motion.div>

            {/* Register Button */}
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
                  Creating Account...
                </span>
              ) : (
                <span className="flex items-center">
                  Register Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </span>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <motion.div variants={itemVariants} className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Already have an account?</span>
              </div>
            </div>

            {/* Sign In Button */}
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-4"
            >
              <button
                onClick={() => navigate("/")}
                className="w-full flex justify-center items-center border border-gray-600 text-gray-300 hover:text-white hover:border-gray-400 font-medium rounded-lg px-4 py-3 text-center transition-all duration-300 bg-gray-700 hover:bg-gray-600"
              >
                Sign In Instead
              </button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Footer */}
        <motion.div variants={itemVariants} className="mt-6 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} SnapMart POS System</p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Register;