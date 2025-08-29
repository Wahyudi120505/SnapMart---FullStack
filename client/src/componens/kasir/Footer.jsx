/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { ShoppingBasket } from "lucide-react";

const Footer = () => {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-gray-800/90 backdrop-blur-xl border-t border-gray-700/50 py-6 px-6 mt-auto relative overflow-hidden z-[-1]"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-transparent to-purple-500/10 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto flex flex-col items-center space-y-4 relative">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 3, -3, 0], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-full shadow-lg">
              <ShoppingBasket className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          <h2 className="text-lg font-semibold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent tracking-wide">
            SnapMart POS
          </h2>
        </div>
        <div className="text-center text-sm text-gray-400">
          <p>Modern Retail Management Solution</p>
          <p className="mt-1">© {new Date().getFullYear()} SnapMart POS System. All rights reserved.</p>
        </div>
        <div className="flex space-x-4">
          <motion.a
            href="/about"
            whileHover={{ scale: 1.02, y: -1, color: "#60a5fa" }}
            whileTap={{ scale: 0.98 }}
            className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-200"
          >
            About
          </motion.a>
          <motion.a
            href="/support"
            whileHover={{ scale: 1.02, y: -1, color: "#60a5fa" }}
            whileTap={{ scale: 0.98 }}
            className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-200"
          >
            Support
          </motion.a>
          <motion.a
            href="/privacy"
            whileHover={{ scale: 1.02, y: -1, color: "#60a5fa" }}
            whileTap={{ scale: 0.98 }}
            className="text-gray-300 hover:text-blue-400 text-sm transition-colors duration-200"
          >
            Privacy Policy
          </motion.a>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;