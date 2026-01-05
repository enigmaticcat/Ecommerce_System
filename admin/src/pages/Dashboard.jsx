import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl, currency } from '../App';
import { assets } from '../assets/assets';

const Dashboard = ({ token }) => {
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalOrders: 0,
    totalProducts: 0
  });

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(backendUrl + '/api/order/dashboard', {
        headers: { token }
      });

      if (response.data.success) {
        setStats(response.data.stats);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error(error.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDashboardStats();
    }
  }, [token]);

  return (
    <div className='w-full'>
      <h3 className="mb-5 text-2xl font-semibold">Tổng quan</h3>
      
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'>
        
        {/* Total Earnings Card */}
        <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500 flex items-center justify-between'>
          <div>
            <p className='text-gray-500 text-sm font-medium'>TỔNG DOANH THU</p>
            <p className='text-2xl font-bold text-gray-800 mt-2'>
              {stats.totalEarnings.toLocaleString()}{currency}
            </p>
          </div>
          <div className='bg-green-100 p-3 rounded-full'>
            {/* Using a generic money/currency icon if available, or placeholder SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500 flex items-center justify-between'>
          <div>
            <p className='text-gray-500 text-sm font-medium'>TỔNG ĐƠN HÀNG</p>
            <p className='text-2xl font-bold text-gray-800 mt-2'>
              {stats.totalOrders}
            </p>
          </div>
          <div className='bg-blue-100 p-3 rounded-full'>
             <img src={assets.order_icon} alt="" className="w-8 h-8" />
          </div>
        </div>

        {/* Total Products Card */}
        <div className='bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500 flex items-center justify-between'>
          <div>
             <p className='text-gray-500 text-sm font-medium'>TỔNG SẢN PHẨM</p>
            <p className='text-2xl font-bold text-gray-800 mt-2'>
              {stats.totalProducts}
            </p>
          </div>
          <div className='bg-purple-100 p-3 rounded-full'>
             <img src={assets.add_icon} alt="" className="w-8 h-8" />
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
