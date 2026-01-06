
import { useContext, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { ShopContext } from '../Context/ShopContext';
import { toast } from 'react-toastify';

const Verify = () => {
  const { navigate, token, setCartItems, backendUrl } = useContext(ShopContext);
  const [searchParams] = useSearchParams();

  // New params from our backend redirect
  const success = searchParams.get('success');
  const orderId = searchParams.get('orderId');
  const error = searchParams.get('error');

  // VNPay raw returns parameters (legacy support)
  const vnp_ResponseCode = searchParams.get('vnp_ResponseCode');

  const verifyPayment = async () => {
    try {
      // Case 1: Backend already processed and redirected with success/orderId
      if (success !== null) {
        if (success === 'true') {
          setCartItems({});
          toast.success("Thanh toán thành công!");
          navigate('/orders');
        } else {
          toast.error(error ? `Lỗi: ${error}` : "Thanh toán thất bại!");
          navigate('/cart');
        }
        return;
      }

      // Case 2: VNPay redirected directly to frontend (legacy flow)
      if (vnp_ResponseCode) {
        if (!token) {
          toast.error("Vui lòng đăng nhập!");
          navigate('/login');
          return;
        }

        const queryString = window.location.search.substring(1);
        const response = await axios.get(
          backendUrl + `/api/vnpay/vnpay_return?${queryString}`,
          { headers: { token } }
        );

        if (response.data.success) {
          setCartItems({});
          navigate('/orders');
          toast.success("Thanh toán thành công!");
        } else {
          navigate('/cart');
          toast.error("Thanh toán thất bại hoặc có lỗi xảy ra.");
        }
        return;
      }

      // No valid params found
      toast.error("Không có thông tin thanh toán!");
      navigate('/cart');

    } catch (err) {
      console.log(err);
      toast.error(err.message);
      navigate('/cart');
    }
  }

  useEffect(() => {
    verifyPayment();
  }, []);

  return (
    <div className='min-h-[60vh] flex items-center justify-center'>
        <div className="w-20 h-20 border-4 border-gray-200 border-t-4 border-t-primary rounded-full animate-spin"></div>
    </div>
  );
}

export default Verify;
