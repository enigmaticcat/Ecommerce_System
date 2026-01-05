import React, { useEffect, useState } from 'react';
import axios from 'axios'
import {backendUrl, currency} from '../App'
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const List = ({token}) => {
  const [list, setList] = useState([]);
  const [expandedId, setExpandedId] = useState(null);

  const fetchList = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if(response.data.success) {
        setList(response.data.products);
      }
      else {
        toast.error(response.data.message)
      }
      
    } catch (error) {
      console.log(error);
      toast.error(error.message)
    }
  };

  const removeProduct = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
      return;
    }
    try {
      const response = await axios.post(backendUrl + '/api/product/remove', {id}, {headers:{token}})

      if (response.data.success) {
        toast.success(response.data.message)
        await fetchList();
      }
      else {
        toast.error(response.data.message)
      }
    }
    catch (error){
      console.log(error);
      toast.error(error.message)
    }
  }

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <>
      <p className='mb-2'>Danh sách sản phẩm</p>
      <div className='flex flex-col gap-2'>
        <div className='hidden md:grid grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center py-1 px-2 border bg-gray-100 text-sm'>
          <b>Ảnh</b>
          <b>Tên</b>
          <b>Danh mục</b>
          <b>Giá</b>
          <b>Tồn kho</b>
          <b className='text-center'>Thao tác</b>
        </div>
        {
          list.map((item, index) => {
            // Calculate total stock
            let totalStock = 0;
            if (item.sizes && Array.isArray(item.sizes)) {
              item.sizes.forEach(s => {
                if (typeof s === 'object' && s.quantity) {
                  totalStock += s.quantity;
                }
              });
            }

            return (
              <div key={index}>
                <div 
                  className='grid grid-cols-[1fr_3fr_1fr] md:grid-cols-[1fr_3fr_1fr_1fr_1fr_1fr] items-center gap-2 py-1 px-2 border text-sm cursor-pointer hover:bg-gray-50'
                  onClick={() => toggleExpand(item._id)}
                >
                  <img className='w-12' src={item.image[0]} alt=""/>
                  <p>{item.name}</p>
                  <p>{item.category}</p>
                  <p>{item.price.toLocaleString()}{currency}</p>
                  <p className={`${totalStock > 0 ? 'text-green-600' : 'text-red-500'} cursor-pointer underline`}>
                    {totalStock} ▼
                  </p>
                  <div className='flex gap-2 justify-end md:justify-center' onClick={(e) => e.stopPropagation()}>
                    <Link 
                      to={`/edit/${item._id}`}
                      className='bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-xs'
                    >
                      Sửa
                    </Link>
                    <button 
                      onClick={()=>removeProduct(item._id)} 
                      className='bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs'
                    >
                      Xóa
                    </button>
                  </div>
                </div>
                
                {/* Expanded Size Details */}
                {expandedId === item._id && (
                  <div className='bg-gray-50 border border-t-0 p-3'>
                    <p className='font-medium mb-2'>Chi tiết tồn kho theo Size:</p>
                    <div className='flex flex-wrap gap-3'>
                      {item.sizes && item.sizes.map((s, idx) => (
                        <div key={idx} className={`px-4 py-2 rounded border ${s.quantity > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                          <span className='font-semibold'>{typeof s === 'object' ? s.size : s}</span>
                          <span className='mx-2'>:</span>
                          <span className={s.quantity > 0 ? 'text-green-600' : 'text-red-500'}>
                            {typeof s === 'object' ? s.quantity : '?'}
                          </span>
                        </div>
                      ))}
                      {(!item.sizes || item.sizes.length === 0) && (
                        <p className='text-gray-500 italic'>Chưa có size nào</p>
                      )}
                    </div>
                    <p className='text-xs text-gray-400 mt-2'>ID: {item._id}</p>
                  </div>
                )}
              </div>
            )})
        }
      </div>
    </>
  );
};

export default List;

