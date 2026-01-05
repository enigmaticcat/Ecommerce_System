import React, { useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ShopContext } from '../Context/ShopContext';
import axios from 'axios'; // Cần import axios để gọi API trực tiếp
import { assets } from '../assets/assets';
import RelatedProducts from '../Components/RelatedProducts';

const Product = () => {
  const { productId } = useParams();
  const { currency, backendUrl, addToCart } = useContext(ShopContext);
  const [productData, setProductData] = useState(null); // Khởi tạo là null thay vì false
  const [image, setImage] = useState('');
  const [size, setSize] = useState('');

  // Hàm lấy dữ liệu trực tiếp từ Database
  const fetchProductData = async () => {
    try {
      // Gọi API endpoint /limit/:postId mà bạn đã có trong backend
      const response = await axios.get(`${backendUrl}/api/product/limit/${productId}`);
      
      // Kiểm tra xem request có thành công không (dựa trên cấu trúc trả về của Backend Service)
      if (response.data.err === 0) {
        const product = response.data.response; // Backend gói dữ liệu trong biến 'response'
        setProductData(product);
        
        // FIX QUAN TRỌNG: Backend trả về 'images' (mảng), không phải 'image'
        if (product.images && product.images.length > 0) {
            setImage(product.images[0].imageUrl); 
        } else {
            // Fallback nếu sản phẩm không có ảnh
            setImage(assets.box_img || ''); 
        }
      } else {
        console.error("Lỗi từ backend:", response.data.msg);
      }
    } catch (error) {
      console.error("Lỗi kết nối:", error);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId, backendUrl]); // Chạy lại khi ID sản phẩm thay đổi

  // Hiển thị Loading hoặc Nội dung
  return productData ? (
    <div className="border-t-2 pt-10 transition-opacity ease-in duration-500 opacity-100">
      {/* ---------------------- Product Data ---------------------- */}
      <div className="flex gap-12 sm:gap-12 flex-col sm:flex-row">
        
        {/* ---------------------- Product Images ---------------------- */}
        <div className="flex-1 flex flex-col-reverse gap-3 sm:flex-row">
          <div className="flex sm:flex-col overflow-x-auto sm:overflow-y-scroll justify-between sm:justify-normal sm:w-[18.7%] w-full">
            {/* Render list ảnh nhỏ bên trái */}
            {productData.images.map((item, index) => (
              <img
                onClick={() => setImage(item.imageUrl)}
                src={item.imageUrl}
                key={index}
                className="w-[24%] sm:w-full sm:mb-3 flex-shrink-0 cursor-pointer"
                alt=""
              />
            ))}
          </div>
          <div className="w-full sm:w-[80%]">
            <img className="w-full h-auto" src={image} alt="" />
          </div>
        </div>

        {/* ---------------------- Product Info ---------------------- */}
        <div className="flex-1">
          <h1 className="font-medium text-2xl mt-2">{productData.name}</h1>
          <div className="flex items-center gap-1 mt-2">
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_icon} alt="" className="w-3 5" />
            <img src={assets.star_dull_icon} alt="" className="w-3 5" />
            <p className="pl-2">(122)</p>
          </div>
          <p className="mt-5 text-3xl font-medium">
            {currency}{productData.price}
          </p>
          <p className="mt-5 text-gray-500 md:w-4/5">
            {productData.description}
          </p>
          
          {/* Chọn Size - Cần kiểm tra xem backend của bạn lưu size ở đâu */}
          {/* Code cũ giả định size nằm trong mảng sizes, nhưng trong model Product.js của bạn tôi không thấy trường 'sizes' ở root cấp độ, 
              mà nằm trong mảng 'info'. Bạn cần check lại logic này. 
              Tạm thời tôi comment lại để tránh lỗi crash trang. */}
          {/* <div className="flex flex-col gap-4 my-8">
            <p>Select Size</p>
            <div className="flex gap-2">
              {productData.sizes?.map((item, index) => (
                <button
                  onClick={() => setSize(item)}
                  className={`border py-2 px-4 bg-gray-100 ${
                    item === size ? 'border-orange-500' : ''
                  }`}
                  key={index}
                >
                  {item}
                </button>
              ))}
            </div>
          </div> 
          */}

          <button
            onClick={() => addToCart(productData._id, size)}
            className="bg-black text-white px-8 py-3 text-sm active:bg-gray-700"
          >
            ADD TO CART
          </button>
          
          <hr className="mt-8 sm:w-4/5" />
          <div className="text-sm text-gray-500 mt-5 flex flex-col gap-1">
            <p>100% Original product.</p>
            <p>Cash on delivery is available on this product.</p>
            <p>Easy return and exchange policy within 7 days.</p>
          </div>
        </div>
      </div>

      {/* ---------------------- Description & Review ---------------------- */}
      <div className="mt-20">
        <div className="flex">
          <b className="border px-5 py-3 text-sm">Description</b>
          <p className="border px-5 py-3 text-sm">Reviews (122)</p>
        </div>
        <div className="flex flex-col gap-4 border px-6 py-6 text-sm text-gray-500">
            {/* Hiển thị thông tin chi tiết từ mảng info nếu có */}
             {productData.info && productData.info.map((infoItem, idx) => (
                <div key={idx}>
                    <p><strong>Version:</strong> {infoItem.version} - <strong>Color:</strong> {infoItem.color}</p>
                    <p>{infoItem.information}</p>
                </div>
             ))}
        </div>
      </div>

      {/* ---------------------- Related Products ---------------------- */}
      {/* Cần truyền category xuống để component này lọc */}
      <RelatedProducts category={productData.category} subCategory={productData.subCategory} />
    </div>
  ) : (
    <div className="opacity-0"></div> // Hoặc component Loading spinner
  );
};

export default Product;