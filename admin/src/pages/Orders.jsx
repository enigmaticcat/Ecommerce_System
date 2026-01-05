import React from 'react'
import {useEffect, useState} from 'react'
import axios from 'axios'
import {backendUrl, currency} from '../App.jsx'
import {toast} from 'react-toastify'
import { assets } from '../assets/assets.js'

const Orders = ({token}) => {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  
  const fetchAllOrders = async () => {
    if(!token) {
      return null;
    }
    try {
      const response = await axios.post(backendUrl + '/api/order/list', {}, {headers:{token}})
      if (response.data.success){
        setOrders(response.data.orders)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/product/list')
      if (response.data.success) {
        setProducts(response.data.products)
      } else {
        toast.error(response.data.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  const statusHandler = async (event, orderId) => {
    try {
      const newStatus = event.target.value;
      const response = await axios.post(
        backendUrl + "/api/order/status",
        { orderId, status: newStatus },
        { headers: { token } }
      );
  
      if (response.data.success) {
        toast.success("Cập nhật trạng thái thành công");
        fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Update Status Error:", error.response?.data || error.message);
      toast.error(error.response?.data?.message || "Error updating status");
    }
  };

  const deleteHandler = async (orderId) => {
    if (!window.confirm('Bạn có chắc muốn xóa order này?')) {
      return;
    }
    try {
      const response = await axios.post(
        backendUrl + '/api/order/delete',
        { orderId },
        { headers: { token } }
      );
      if (response.data.success) {
        toast.success("Đã xóa đơn hàng");
        fetchAllOrders();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Delete Order Error:", error);
      toast.error(error.response?.data?.message || "Error deleting order");
    }
  };
  

  useEffect(() => {
    fetchAllOrders()
    fetchAllProducts()
  }, [token])

  return (
    <div>
      <h3>Quản lý đơn hàng</h3>
      <div>
        {orders.map((order, index) => (
          <div className='grid grid-cols-1 sm:grid-cols-[0.5fr_2fr_1fr] lg:grid-cols-[0.5fr_2fr_1fr_1fr_1fr] gap-3 items-start border-2 border-gray-200 p-5 md:p-8 my-3 md:my-4 text-xs sm:text-sm text-gray-700' key={index}>
            <img className='w-12' src={assets.parcel_icon} alt="" />
            <div>
            <div>
              {order.items.map((item, index) => {
                // Find current stock
                const product = products.find(p => p._id === item._id);
                let currentStock = 'N/A';
                if (product && product.sizes) {
                   const sizeInfo = product.sizes.find(s => 
                     (typeof s === 'object' ? s.size : s) === item.size
                   );
                   if (sizeInfo && typeof sizeInfo === 'object') {
                     currentStock = sizeInfo.quantity;
                   } else if (sizeInfo) {
                     // Legacy format or just string
                     currentStock = '?'; 
                   }
                }

                if(index === order.items.length - 1) {
                  return <p className='py-0.5' key={index}>{item.name} x {item.quantity} <span>{item.size}</span> <span className='text-gray-500'>(Kho: {currentStock})</span></p>
                }
                else {
                  return <p className='py-0.5' key={index}>{item.name} x {item.quantity} <span>{item.size}</span> <span className='text-gray-500'>(Kho: {currentStock})</span>,</p>
                }
              })}
            </div>
            <p className='mt-3 mb-2 font-medium'>{order.address.firstName + " " + order.address.lastName}</p>
            <div>
              <p>{order.address.street + ","}</p>
              <p>{order.address.city + ", " + order.address.state + ", " + order.address.country + ", " + order.address.zipcode}</p>
            </div>
            <p>{order.address.phone}</p>
          </div>
          <div>
            <p className='text-sm sm:text-[15px]'>Số SP : {order.items.length}</p>
            <p className='mt-3'>Phương thức : {order.paymentMethod}</p>
            <p>Thanh toán : {order.payment ? 'Hoàn thành' : 'Chưa TT'}</p>
            <p>Ngày : {new Date(order.date).toLocaleDateString()}</p>
          </div>
          <p className='text-sm sm:text-[15px]'>{order.amount.toLocaleString()}{currency}</p>
          <div className='flex items-center gap-2'>
            <select onChange={(event)=>statusHandler(event,order._id)} value={order.status} className='p-2 font-semibold'>
              <option value="Order Placed">Đã đặt hàng</option>
              <option value="Packing">Đang đóng gói</option>
              <option value="Shipped">Đã gửi</option>
              <option value="Out for delivery">Đang giao</option>
              <option value="Delivered">Đã giao</option>
            </select>
            <button 
              onClick={() => deleteHandler(order._id)} 
              className='bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 font-semibold'
            >
              Xóa
            </button>
          </div>
            </div>
        ))}
      </div>
    </div>
  )
}

export default Orders