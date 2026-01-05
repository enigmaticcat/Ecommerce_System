import React, { useState } from 'react';
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from 'react-toastify';

const Restock = ({ token }) => {
  const [productId, setProductId] = useState("");
  const [productInfo, setProductInfo] = useState(null);
  const [sizes, setSizes] = useState({});
  const [loading, setLoading] = useState(false);

  // Fetch product info when ID is entered
  const fetchProduct = async () => {
    if (!productId.trim()) {
      toast.error("Vui lòng nhập Product ID");
      return;
    }
    setLoading(true);
    try {
      const response = await axios.post(backendUrl + '/api/product/single', { productId });
      if (response.data.success && response.data.product) {
        setProductInfo(response.data.product);
        // Initialize sizes with 0 for each existing size
        const initSizes = {};
        response.data.product.sizes.forEach(s => {
          if (typeof s === 'object') {
            initSizes[s.size] = 0; // Default to 0 for adding
          }
        });
        setSizes(initSizes);
        toast.success("Tìm thấy sản phẩm!");
      } else {
        toast.error("Không tìm thấy sản phẩm với ID này");
        setProductInfo(null);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
      setProductInfo(null);
    } finally {
      setLoading(false);
    }
  };

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    
    const formattedSizes = Object.entries(sizes)
      .filter(([_, quantity]) => quantity > 0)
      .map(([size, quantity]) => ({ size, quantity }));

    if (formattedSizes.length === 0) {
      toast.error("Vui lòng nhập số lượng cần thêm cho ít nhất 1 size");
      return;
    }

    try {
      const response = await axios.post(
        backendUrl + "/api/product/restock",
        { productId, sizes: formattedSizes },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        setProductId("");
        setProductInfo(null);
        setSizes({});
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  return (
    <div className='flex flex-col w-full items-start gap-4'>
      <h2 className='text-xl font-semibold'>Nhập thêm hàng (Restock)</h2>
      
      {/* Product ID Input */}
      <div className='flex gap-2 items-end w-full'>
        <div className='flex-1 max-w-[400px]'>
          <p className='mb-2'>Product ID</p>
          <input 
            onChange={(e) => setProductId(e.target.value)} 
            value={productId} 
            className='w-full px-3 py-2 border' 
            type='text' 
            placeholder='Nhập ID sản phẩm (ví dụ: 675f3a...)'
          />
        </div>
        <button 
          type='button'
          onClick={fetchProduct}
          disabled={loading}
          className='px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600'
        >
          {loading ? 'Đang tìm...' : 'Tìm sản phẩm'}
        </button>
      </div>

      {/* Product Info Display */}
      {productInfo && (
        <form onSubmit={onSubmitHandler} className='w-full border p-4 rounded bg-gray-50'>
          <div className='flex gap-4 items-start mb-4'>
            {productInfo.image && productInfo.image[0] && (
              <img src={productInfo.image[0]} alt={productInfo.name} className='w-24 h-24 object-cover rounded' />
            )}
            <div>
              <h3 className='font-semibold text-lg'>{productInfo.name}</h3>
              <p className='text-gray-600'>{productInfo.category} / {productInfo.subCategory}</p>
              <p className='text-sm text-gray-500'>ID: {productInfo._id}</p>
            </div>
          </div>

          <div className='mb-4'>
            <p className='font-medium mb-2'>Tồn kho hiện tại:</p>
            <div className='flex gap-2 flex-wrap'>
              {productInfo.sizes.map((s, idx) => (
                <span key={idx} className='px-3 py-1 bg-gray-200 rounded text-sm'>
                  {typeof s === 'object' ? `${s.size}: ${s.quantity}` : s}
                </span>
              ))}
            </div>
          </div>

          <div className='mb-4'>
            <p className='font-medium mb-2'>Số lượng cần THÊM vào kho:</p>
            <div className='flex flex-col gap-2'>
              {["S", "M", "L", "XL", "XXL"].map((size) => (
                <div key={size} className='flex items-center gap-4'>
                  <span className='w-12'>{size}:</span>
                  <input 
                    type="number" 
                    min="0"
                    placeholder="0"
                    className="w-24 px-2 py-1 border border-gray-300 rounded"
                    value={sizes[size] || 0}
                    onChange={(e) => setSizes(prev => ({ ...prev, [size]: Number(e.target.value) }))}
                  />
                </div>
              ))}
            </div>
          </div>

          <button type='submit' className='px-6 py-2 bg-green-500 text-white rounded hover:bg-green-600'>
            Thêm vào kho
          </button>
        </form>
      )}
    </div>
  );
};

export default Restock;
