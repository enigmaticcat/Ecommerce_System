import { assets } from '../assets/assets';

const OurPolicies = () => {
  return (
    <div className="flex flex-col sm:flex-row justify-around gap-12 sm:gap-2 text-center py-20 text-xs sm:text-sm md:text-base text-gray-700">
      <div className="">
        <img src={assets.exchange_icon} alt="" className="w-12 m-auto mb-5 " />
        <p className="font-semibold">Chính Sách Đổi Trả Dễ Dàng</p>
        <p className="text-gray-400">Chúng tôi hỗ trợ đổi trả nhanh chóng, tiện lợi</p>
      </div>
      <div className="">
        <img src={assets.quality_icon} alt="" className="w-12 m-auto mb-5 " />
        <p className="font-semibold">Hoàn Trả Trong 7 Ngày</p>
        <p className="text-gray-400">Hoàn tiền trong vòng 7 ngày nếu không hài lòng</p>
      </div>
      <div className="">
        <img src={assets.support_img} alt="" className="w-12 m-auto mb-5 " />
        <p className="font-semibold">Hỗ Trợ Khách Hàng 24/7</p>
        <p className="text-gray-400">Đội ngũ hỗ trợ luôn sẵn sàng phục vụ bạn</p>
      </div>
    </div>
  );
};

export default OurPolicies;
