import React from "react";
import { assets } from "../assets/assets";

const Navbar = ({ setToken }) => {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gray-50 flex items-center py-2 px-[4%] justify-between border-b">
      <button
        onClick={() => setToken("")}
        className="bg-gray-600 text-white px-5 py-2 sm:px-7 sm:py-2 rounded-full text-xs sm:text-sm"
      >
        Đăng xuất
      </button>
    </div>
  );
};

export default Navbar;
