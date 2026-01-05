import React, { useEffect, useState } from 'react';
import axios from "axios";
import { backendUrl } from "../App";
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const Edit = ({ token }) => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("Men");
  const [subCategory, setSubCategory] = useState("Topwear");
  const [bestseller, setBestseller] = useState(false);
  const [sizes, setSizes] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentImages, setCurrentImages] = useState([]);
  const [catList, setCatList] = useState([]);
  const [subCatList, setSubCatList] = useState([]);

  // Fetch product data
  const fetchProduct = async () => {
    try {
      const response = await axios.post(backendUrl + '/api/product/single', { productId: id });
      if (response.data.success) {
        const product = response.data.product;
        setName(product.name);
        setDescription(product.description);
        setPrice(product.price);
        setCategory(product.category);
        setSubCategory(product.subCategory);
        setBestseller(product.bestseller);
        
        // Convert sizes array [{size: 'S', quantity: 10}] to object {S: 10}
        const sizesObj = {};
        if (product.sizes && Array.isArray(product.sizes)) {
          product.sizes.forEach(item => {
            if (typeof item === 'object' && item.size) {
              sizesObj[item.size] = item.quantity;
            } else if (typeof item === 'string') {
              sizesObj[item] = 0; // Handle legacy data
            }
          });
        }
        setSizes(sizesObj);
        
        setCurrentImages(product.image || []);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    
    const fetchOptions = async () => {
      try {
        const catRes = await axios.get(backendUrl + "/api/category/list");
        const subCatRes = await axios.get(backendUrl + "/api/category/sub/list");

        if(catRes.data.success) {
          setCatList(catRes.data.categories);
        }

        if(subCatRes.data.success) {
          setSubCatList(subCatRes.data.subCategories);
        }
      } catch (error) {
        toast.error(error.message);
      }
    }
    fetchOptions();
  }, [id]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        backendUrl + "/api/product/update",
        {
          id,
          name,
          description,
          price,
          category,
          subCategory,
          bestseller,
          sizes: Object.entries(sizes).map(([size, quantity]) => ({ size, quantity }))
        },
        { headers: { token } }
      );

      if (response.data.success) {
        toast.success(response.data.message);
        navigate('/list');
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    }
  };

  if (loading) {
    return <div className="p-4">Loading...</div>;
  }

  return (
    <form onSubmit={onSubmitHandler} className='flex flex-col w-full items-start gap-3'>
      <h2 className='text-xl font-semibold mb-4'>Sửa sản phẩm</h2>
      
      {/* Current Images Display */}
      <div>
        <p className='mb-2'>Ảnh hiện tại</p>
        <div className='flex gap-2'>
          {currentImages.map((img, index) => (
            <img key={index} className='w-20 h-20 object-cover border' src={img} alt={`Product ${index + 1}`} />
          ))}
        </div>
        <p className='text-gray-500 text-sm mt-1'>* Để thay đổi ảnh, vui lòng xóa và thêm sản phẩm mới</p>
      </div>

      <div className='w-full'>
        <p className='mb-2'>Tên sản phẩm</p>
        <input 
          onChange={(e) => setName(e.target.value)} 
          value={name} 
          className='w-full max-w-[500px] px-3 py-2 border' 
          type='text' 
          placeholder='Nhập tên sản phẩm' 
          required 
        />
      </div>

      <div className='w-full'>
        <p className='mb-2'>Mô tả sản phẩm</p>
        <textarea 
          onChange={(e) => setDescription(e.target.value)} 
          value={description} 
          className='w-full max-w-[500px] px-3 py-2 border' 
          placeholder='Nhập mô tả' 
          required 
        />
      </div>

      <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div>
          <p className='mb-2'>Danh mục</p>
          <select 
            onChange={(e) => setCategory(e.target.value)} 
            value={category}
            className='w-full px-3 py-2 border'
          >
            {catList.map((item, index) => (
              <option key={index} value={item.name}>{item.name}</option>
            ))}
          </select>
        </div>
        <div>
          <p className='mb-2'>Loại</p>
          <select 
            onChange={(e) => setSubCategory(e.target.value)} 
            value={subCategory}
            className='w-full px-3 py-2 border'
          >
            {subCatList.map((item, index) => (
               <option key={index} value={item.name}>{item.name}</option>
            ))}
          </select>
        </div>
        <div>
          <p className='mb-2'>Giá</p>
          <input 
            onChange={(e) => setPrice(e.target.value)} 
            value={price} 
            className='w-full px-3 py-2 sm:w-[120px] border' 
            type='Number' 
            placeholder='25' 
          />
        </div>
      </div>

      <div>
        <p className='mb-2'>Size & Số lượng</p>
        <div className='flex flex-col gap-3'>
          {["S", "M", "L", "XL", "XXL"].map((size) => (
            <div key={size} className='flex items-center gap-4'>
              <div 
                onClick={() => setSizes(prev => {
                  const newSizes = { ...prev };
                  if (newSizes[size] !== undefined) {
                    delete newSizes[size]; // Deselect
                  } else {
                    newSizes[size] = 0; // Select with default 0 status
                  }
                  return newSizes;
                })}
                className={`${sizes[size] !== undefined ? "bg-pink-100 border-pink-300" : "bg-slate-200 border-slate-300"} border px-4 py-1 cursor-pointer w-16 text-center`}
              >
                {size}
              </div>
              
              {sizes[size] !== undefined && (
                <input 
                  type="number" 
                  min="0"
                  placeholder="SL"
                  className="w-20 px-2 py-1 border border-gray-300 rounded"
                  value={sizes[size]}
                  onChange={(e) => setSizes(prev => ({ ...prev, [size]: Number(e.target.value) }))}
                  required
                />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className='flex gap-2 mt-2'>
        <input 
          onChange={() => setBestseller(prev => !prev)} 
          checked={bestseller} 
          type='checkbox' 
          id='bestseller' 
        />
        <label className='cursor-pointer' htmlFor="bestseller">Sản phẩm bán chạy</label>
      </div>

      <div className='flex gap-4 mt-4'>
        <button type='submit' className='w-28 py-3 bg-black text-white'>CẬP NHẬT</button>
        <button 
          type='button' 
          onClick={() => navigate('/list')} 
          className='w-28 py-3 bg-gray-500 text-white'
        >
          HỦY
        </button>
      </div>
    </form>
  );
};

export default Edit;
