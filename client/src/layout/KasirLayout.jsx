import HeaderKasir from "../componens/kasir/Header";
import FooterKasir from "../componens/kasir/Footer";
import { Outlet } from "react-router-dom";

const KasirLayout = () => {
  return (
    <>
      <HeaderKasir />
      <Outlet />
      <FooterKasir />
    </>
  );
};

export default KasirLayout;
