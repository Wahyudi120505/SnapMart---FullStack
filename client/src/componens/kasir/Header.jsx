/* eslint-disable no-unused-vars */
import { motion } from "framer-motion";
import { ShoppingCart, LogOut, Home, User, Package } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthService } from "../../services/AuthService";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = "/kasir";

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

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="bg-slate-800/90 backdrop-blur-xl border-b border-slate-700/50 py-4 px-6 sticky top-0 z-10"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10 pointer-events-none"></div>
      <div className="max-w-7xl mx-auto flex items-center justify-between relative">
        <div className="flex items-center space-x-3">
          <motion.div
            animate={{ rotate: [0, 3, -3, 0], scale: [1, 1.05, 1] }}
            transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-lg opacity-50 animate-pulse"></div>
            <div className="relative bg-gradient-to-r from-orange-600 to-red-600 p-2 rounded-full shadow-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
          </motion.div>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-transparent tracking-wide">
            SnapMart POS
          </h1>
        </div>

        <nav className="flex items-center space-x-6">
          {menuItems.map((item, index) => (
            <motion.a
              key={item.id}
              custom={index}
              variants={linkVariants}
              initial="hidden"
              animate="visible"
              href={item.path}
              onClick={() => navigate(item.path)}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              className={`text-slate-300 hover:text-orange-400 font-medium flex items-center transition-colors duration-200 ${
                isActivePath(item.path)
                  ? "text-orange-400 border-b-2 border-orange-500"
                  : ""
              }`}
            >
              <item.icon className="w-5 h-5 mr-1" />
              {item.name}
            </motion.a>
          ))}
          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="text-slate-300 hover:text-red-400 font-medium flex items-center transition-colors duration-200"
          >
            <LogOut className="w-5 h-5 mr-1" />
            Logout
          </motion.button>
        </nav>
      </div>
    </motion.header>
  );
};

export default Header;