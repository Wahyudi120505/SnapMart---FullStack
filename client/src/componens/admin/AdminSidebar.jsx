import { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
} from "lucide-react";
import { AuthService } from "../../services/AuthService";

const AdminSidebar = ({ menuActive }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMenu, setActiveMenu] = useState(menuActive);
  const [activeSubMenu, setActiveSubMenu] = useState(null);
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
    ],
    [basePath]
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) setIsOpen(true);
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

  const toggleSidebar = () => setIsOpen(!isOpen);

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
  };

  const handleSubMenuClick = (subMenuId, path) => {
    setActiveSubMenu(subMenuId);
    navigate(path);
  };

  const handleLogOut = () => {
    AuthService.logout();
    navigate("/");
  };

  return (
    <>
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black z-40 lg:hidden opacity-50"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full bg-slate-800/90 backdrop-blur-xl shadow-2xl z-50
          border-r border-slate-700/50
          ${isOpen ? "w-65" : "w-0"} lg:w-65
          transition-all duration-300
        `}
        style={{ transform: isOpen ? "translateX(0)" : "translateX(-300px)" }}
      >
        <div className="p-6 border-b border-slate-700/50 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-red-500/10 rounded-tr-xl"></div>

          <div className="flex flex-col items-center mb-4">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-full blur-lg opacity-50"></div>
              <div className="relative bg-gradient-to-r from-orange-600 to-red-600 p-3 rounded-full shadow-xl">
                <ShoppingBasket className="w-6 h-6 text-white" />
              </div>
            </div>

            <h1 className="text-xl font-bold bg-gradient-to-r from-orange-400 via-red-400 to-orange-400 bg-clip-text text-transparent tracking-wide">
              SnapMart POS
            </h1>
            <p className="text-slate-400 text-sm mt-1">Admin Panel</p>
          </div>

          <button
            onClick={toggleSidebar}
            className="lg:hidden absolute top-6 right-6 p-1 rounded-lg hover:bg-slate-700/50 transition-colors"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-2 px-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const hasSubMenu = item.subMenu && item.subMenu.length > 0;

              return (
                <li key={item.id}>
                  <div className="space-y-1">
                    <button
                      onClick={() =>
                        handleMenuClick(item.id, item.path, hasSubMenu)
                      }
                      className={`
                        w-full flex items-center px-4 py-3 rounded-xl
                        transition-colors duration-200 text-left
                        ${
                          activeMenu === item.id
                            ? "bg-gradient-to-r from-orange-600/20 to-red-600/20 text-white border-l-4 border-orange-500 shadow-lg"
                            : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                        }
                      `}
                    >
                      <Icon
                        className={`
                          w-5 h-5 mr-3
                          ${
                            activeMenu === item.id
                              ? "text-orange-400"
                              : "text-slate-400"
                          }
                        `}
                      />
                      <span className="font-medium">{item.name}</span>
                    </button>

                    {hasSubMenu && activeMenu === item.id && (
                      <div className="pl-8 space-y-1">
                        {item.subMenu.map((subItem) => {
                          const SubIcon = subItem.icon;
                          return (
                            <div key={subItem.id}>
                              <button
                                onClick={() =>
                                  handleSubMenuClick(subItem.id, subItem.path)
                                }
                                className={`
                                  w-full flex items-center px-4 py-2 rounded-lg
                                  transition-colors duration-200 text-left text-sm
                                  ${
                                    activeSubMenu === subItem.id
                                      ? "bg-gradient-to-r from-orange-500/10 to-red-500/10 text-white"
                                      : "text-slate-300 hover:bg-slate-700/30 hover:text-white"
                                  }
                                `}
                              >
                                <SubIcon
                                  className={`
                                    w-4 h-4 mr-3
                                    ${
                                      activeSubMenu === subItem.id
                                        ? "text-orange-400"
                                        : "text-slate-400"
                                    }
                                  `}
                                />
                                <span>{subItem.name}</span>
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-6 border-t border-slate-700/50">
          <div className="flex items-center space-x-3 p-3 bg-slate-700/30 rounded-xl backdrop-blur-sm">
            <div className="w-9 h-9 bg-gradient-to-r from-orange-600/30 to-red-600/30 rounded-full flex items-center justify-center border border-slate-600/50">
              <User className="w-4 h-4 text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-white">Admin</p>
              <p className="text-xs text-slate-400">Administrator</p>
            </div>
          </div>

          <button
            onClick={handleLogOut}
            className="w-full flex items-center justify-center mt-4 px-4 py-3 text-slate-300 hover:text-white transition-colors"
          >
            <div className="flex items-center">
              <LogOut className="w-5 h-5 mr-3 text-slate-400 hover:text-orange-400 transition-colors" />
              <span className="font-medium">Logout</span>
            </div>
          </button>
        </div>
      </aside>

      {!isOpen && isMobile && (
        <button
          onClick={toggleSidebar}
          className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-slate-800/80 backdrop-blur-md shadow-lg rounded-xl border border-slate-700/50"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5 text-orange-400" />
        </button>
      )}

      <div className={`hidden lg:block w-65 flex-shrink-0`} />
    </>
  );
};

export default AdminSidebar;
