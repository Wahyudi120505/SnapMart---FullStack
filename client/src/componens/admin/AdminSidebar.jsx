/* eslint-disable no-unused-vars */
import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ShoppingBasket,
  Users,
  Package,
  ShoppingCart,
  FileText,
  LogOut,
  Menu,
  X,
  User,
  Bot,
} from "lucide-react";
import { AuthService } from "../../services/AuthService";

// Animation variants
const containerVariants = {
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      delayChildren: 0.2,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 120,
    },
  },
};

const AdminSidebar = ({ menuActive }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMenu, setActiveMenu] = useState(menuActive);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
  const [showMenuButton, setShowMenuButton] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const basePath = "/admin";

  const menuItems = useMemo(
    () => [
      {
        id: "kasir",
        name: "Cashier Management",
        icon: Users,
        path: `${basePath}`,
      },
      {
        id: "produk",
        name: "Product Management",
        icon: Package,
        path: `${basePath}/products`,
      },
      {
        id: "pemesanan",
        name: "Order Management",
        icon: ShoppingCart,
        path: `${basePath}/orders`,
      },
      {
        id: "laporan",
        name: "Reports",
        icon: FileText,
        path: `${basePath}/reports`,
        subMenu: [
          {
            id: "produk",
            name: "Products",
            icon: Package,
            path: `${basePath}/reports/products`,
          },
          {
            id: "pendapatan",
            name: "Income",
            icon: FileText,
            path: `${basePath}/reports/income`,
          },
        ],
      },
      {
        id: "ai-assistant",
        name: "AI Assistant",
        icon: Bot,
        path: `${basePath}/ai-assistant`, 
      }
    ],
    [basePath]
  );

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY === 0) {
        setShowMenuButton(true);
      } else {
        setShowMenuButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (isMobile) setIsOpen(false);
  }, [location.pathname, isMobile]);

  useEffect(() => {
    const currentPath = location.pathname;

    const activeItem = menuItems.find(
      (item) =>
        item.path === currentPath ||
        (item.subMenu && item.subMenu.some((sub) => sub.path === currentPath))
    );

    if (activeItem) {
      setActiveMenu(activeItem.id);

      if (activeItem.id === "laporan") {
        const activeSub = activeItem.subMenu?.find(
          (sub) => sub.path === currentPath
        );
        if (activeSub) {
          setActiveSubMenu(activeSub.id);
        } else {
          setActiveSubMenu("produk");
          if (!currentPath.startsWith(`${basePath}/reports/products`)) {
            navigate(`${basePath}/reports/products`);
          }
        }
      } else {
        setActiveSubMenu(null);
      }
    }
  }, [location.pathname, navigate, basePath, menuItems]);

  const toggleSidebar = () => {
    if (isMobile) setIsOpen(!isOpen);
  };

  const handleMenuClick = (menuId, path, hasSubMenu = false) => {
    setActiveMenu(menuId);

    if (hasSubMenu) {
      const item = menuItems.find((item) => item.id === menuId);
      if (item?.subMenu) {
        navigate(item.subMenu[0].path);
        setActiveSubMenu(item.subMenu[0].id);
      }
    } else {
      navigate(path);
      setActiveSubMenu(null);
    }
    if (isMobile) setIsOpen(false);
  };

  const handleSubMenuClick = (subMenuId, path) => {
    setActiveSubMenu(subMenuId);
    navigate(path);
    if (isMobile) setIsOpen(false);
  };

  const handleLogOut = () => {
    AuthService.logout();
    navigate("/");
    if (isMobile) setIsOpen(false);
  };

  return (
    <>
      {isOpen && isMobile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black z-40 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <motion.div
        initial="hidden"
        animate={isOpen ? "visible" : "hidden"}
        variants={containerVariants}
        className={`
          fixed top-0 left-0 h-full bg-gray-800 text-white shadow-xl z-50
          border-r border-gray-700
          ${isOpen ? "w-11/12 sm:w-80" : "w-0"} lg:w-64
          transition-all duration-300 overflow-hidden
        `}
      >
        <div className="p-4 sm:p-6 border-b border-gray-700 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-tr-xl"></div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col items-center mb-4"
          >
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="relative mb-3"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-50"></div>
              <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-full shadow-xl">
                <ShoppingBasket className="w-6 h-6 text-white" />
              </div>
            </motion.div>

            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent tracking-wide">
              SnapMart POS
            </h1>
            <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
          </motion.div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleSidebar}
            className="lg:hidden absolute top-4 right-4 sm:top-6 sm:right-6 p-1 rounded-lg hover:bg-gray-700 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-gray-400" />
          </motion.button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubMenu = item.subMenu && item.subMenu.length > 0;

              return (
                <motion.li key={item.id} variants={itemVariants}>
                  <div className="space-y-1">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() =>
                        handleMenuClick(item.id, item.path, hasSubMenu)
                      }
                      className={`
                        w-full flex items-center px-4 py-3 rounded-xl
                        transition-colors duration-200 text-left
                        ${
                          activeMenu === item.id
                            ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border-l-4 border-blue-500 shadow-lg"
                            : "text-gray-300 hover:bg-gray-700/50 hover:text-white"
                        }
                      `}
                    >
                      <Icon
                        className={`
                          w-5 h-5 mr-3
                          ${
                            activeMenu === item.id
                              ? "text-blue-400"
                              : "text-gray-400"
                          }
                        `}
                      />
                      <span className="font-300 text-sm sm:text-base">
                        {item.name}
                      </span>
                    </motion.button>

                    {hasSubMenu && activeMenu === item.id && (
                      <div className="pl-6 sm:pl-8 space-y-1">
                        {item.subMenu.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <motion.div
                              key={subItem.id}
                              variants={itemVariants}
                            >
                              <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() =>
                                  handleSubMenuClick(subItem.id, subItem.path)
                                }
                                className={`
                                  w-full flex items-center px-4 py-2 rounded-lg
                                  transition-colors duration-200 text-left text-sm
                                  ${
                                    activeSubMenu === subItem.id
                                      ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-white"
                                      : "text-gray-300 hover:bg-gray-700/30 hover:text-white"
                                  }
                                `}
                              >
                                <SubIcon
                                  className={`
                                    w-4 h-4 mr-3
                                    ${
                                      activeSubMenu === subItem.id
                                        ? "text-blue-400"
                                        : "text-gray-400"
                                    }
                                  `}
                                />
                                <span>{subItem.name}</span>
                              </motion.button>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </motion.li>
              );
            })}
          </ul>
        </nav>

        <motion.div
          variants={itemVariants}
          className="p-4 sm:p-6 border-t border-gray-700"
        >
          <div className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-xl backdrop-blur-sm">
            <div className="w-9 h-9 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-full flex items-center justify-center border border-gray-600">
              <User className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-gray-400">Administrator</p>
            </div>
          </div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogOut}
            className="w-full flex items-center justify-center mt-4 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-700/50 transition-colors rounded-lg"
          >
            <div className="flex items-center">
              <LogOut className="w-6 h-6 mr-3 text-gray-400 hover:text-blue-400 transition-colors" />
              <span className="font-medium text-sm sm:text-base">Logout</span>
            </div>
          </motion.button>
        </motion.div>
      </motion.div>

      {isMobile && !isOpen && showMenuButton && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={toggleSidebar}
          className="lg:hidden fixed top-6 left-4 z-50 p-2 bg-gray-800/80 backdrop-blur-md shadow-lg rounded-xl border border-gray-700 transition-all duration-300"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-blue-400" />
        </motion.button>
      )}

      {/* Spacer untuk desktop */}
      {!isMobile && <div className="w-64 flex-shrink-0" />}
    </>
  );
};

export default AdminSidebar;
