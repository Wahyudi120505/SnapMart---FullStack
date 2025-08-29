/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingCart, LogOut, Home, User, Package, Menu, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthService } from "../../services/AuthService";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = "/kasir";
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    {
      id: "dashboard",
      name: "Dashboard",
      icon: Home,
      path: `${basePath}`,
    },
    {
      id: "transaction",
      name: "Transaction",
      icon: Package,
      path: `${basePath}/transaction/new`,
    },
    {
      id: "profile",
      name: "Profile",
      icon: User,
      path: `${basePath}/profile`,
    },
  ];

  const linkVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: { duration: 0.3, delay: i * 0.1 },
    }),
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  };

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname === `${path}/`;
  };

  const handleLogout = async () => {
    try {
      await AuthService.logout();
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gray-800/90 backdrop-blur-xl border-b border-gray-700/50 py-3 md:py-4 px-4 md:px-6 sticky top-0 z-60"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        {/* Logo Section */}
        <div className="flex items-center space-x-2 md:space-x-3">
          <motion.div
            animate={{ rotate: [0, 3, -3, 0], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-1 md:p-2 rounded-full shadow-lg">
              <ShoppingCart className="w-4 h-4 md:w-6 md:h-6 text-white" />
            </div>
          </motion.div>
          <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent tracking-wide">
            SnapMart POS
          </h1>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center justify-center flex-1">
          <nav className="flex items-center space-x-4 lg:space-x-6">
            {menuItems.map((item, index) => (
              <motion.a
                key={item.id}
                custom={index}
                variants={linkVariants}
                initial="hidden"
                animate="visible"
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  navigate(item.path);
                }}
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                className={`text-gray-300 hover:text-blue-400 font-medium flex items-center transition-colors duration-200 ${
                  isActivePath(item.path)
                    ? "text-blue-400 border-b-2 border-blue-500"
                    : ""
                }`}
              >
                <item.icon className="w-4 h-4 md:w-5 md:h-5 mr-1" />
                <span className="hidden lg:inline">{item.name}</span>
              </motion.a>
            ))}
          </nav>
        </div>

        {/* Logout Button */}
        <div className="hidden md:flex items-center">
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="text-gray-300 hover:text-red-400 font-medium flex items-center transition-colors duration-200"
          >
            <LogOut className="w-4 h-4 md:w-5 md:h-5 mr-1" />
            <span className="hidden lg:inline">Logout</span>
          </motion.button>
        </div>

        {/* Mobile Menu Button */}
        <motion.button
          whileTap={{ scale: 0.95 }}
          onClick={toggleMobileMenu}
          className="md:hidden text-gray-300 hover:text-blue-400 p-1 rounded-lg"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </motion.button>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            variants={mobileMenuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            className="md:hidden bg-gray-800/95 backdrop-blur-xl mt-3 rounded-lg overflow-hidden"
          >
            <div className="py-4 px-4 space-y-4">
              {menuItems.map((item) => (
                <motion.a
                  key={item.id}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(item.path);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    isActivePath(item.path)
                      ? "bg-blue-900/30 text-blue-400"
                      : "text-gray-300 hover:bg-gray-700/50"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </motion.a>
              ))}
              <motion.button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center p-3 rounded-lg text-gray-300 hover:bg-gray-700/50 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5 mr-3" />
                <span className="font-medium">Logout</span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Header;