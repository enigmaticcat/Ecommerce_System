import React, { useEffect, useState } from 'react';
import axios from 'axios'
import {backendUrl, currency} from '../App'
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

const List = ({token}) => {
  const [list, setList] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [sortOrder, setSortOrder] = useState(null); // 'asc', 'desc', null
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

  const filteredAndSortedList = list
    .filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort((a, b) => {
      if (sortOrder === 'asc') return a.price - b.price;
      if (sortOrder === 'desc') return b.price - a.price;
      return 0;
    });

  const totalPages = Math.ceil(filteredAndSortedList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedList = filteredAndSortedList.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, sortOrder]);

  return (
    <>
      <p className='mb-2'>Danh sách sản phẩm</p>
      <div className='flex flex-col gap-2'>
        <div className='hidden md:flex justify-between items-center py-1 px-2 border bg-gray-100 text-sm gap-2'>
          <b className='w-12'>Ảnh</b>
          <div className='flex-1 flex items-center'>
            <b>Tên</b>
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ml-2 px-2 py-1 text-xs border rounded w-32"
            />
          </div>
          <b className='w-20'>Danh mục</b>
          <div className='w-20 flex items-center'>
            <b>Giá</b>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : sortOrder === 'desc' ? null : 'asc')}
              className="ml-1 text-xs bg-gray-200 px-1 rounded hover:bg-gray-300"
            >
              {sortOrder === 'asc' ? '▲' : sortOrder === 'desc' ? '▼' : '↕'}
            </button>
          </div>
          <b className='w-20'>Tồn kho</b>
          <b className='w-24 text-center'>Thao tác</b>
        </div>
        {
          paginatedList.map((item, index) => {
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
                  className='flex flex-col md:flex-row md:justify-between md:items-center gap-2 py-1 px-2 border text-sm cursor-pointer hover:bg-gray-50'
                  onClick={() => toggleExpand(item._id)}
                >
                  <img className='w-12' src={item.image[0]} alt=""/>
                  <p className='md:flex-1'>{item.name}</p>
                  <p className='md:w-20'>{item.category}</p>
                  <p className='md:w-20'>{item.price.toLocaleString()}{currency}</p>
                  <p className={`md:w-20 ${totalStock > 0 ? 'text-green-600' : 'text-red-500'} cursor-pointer underline`}>
                    {totalStock} ▼
                  </p>
                  <div className='md:w-24 flex gap-2 justify-end md:justify-center' onClick={(e) => e.stopPropagation()}>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className='flex justify-center mt-4 gap-2'>
          <button 
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
            disabled={currentPage === 1}
            className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50'
          >
            Previous
          </button>
          <span className='px-3 py-1'>Trang {currentPage} / {totalPages}</span>
          <button 
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))} 
            disabled={currentPage === totalPages}
            className='px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50'
          >
            Next
          </button>
        </div>
      )}
    </>
  );
};

export default List;

