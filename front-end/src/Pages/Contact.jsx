import { assets } from '../assets/assets';
import NewsLetterBox from '../Components/NewsLetterBox';
import Title from '../Components/Title';

const Contact = () => {
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  };
  return (
    <div>
      <div className="to-current text-2xl pt-10 border-t">
        <Title text1={'LIÊN HỆ'} text2={'VỚI CHÚNG TÔI'} />
      </div>

      <div className="flex flex-col justify-center sm:flex-row gap-10 my-10 mb-28">
        <img
          src={assets.contact_img}
          alt=""
          className="w-full sm:max-w-[480px]"
        />

        <div className="flex flex-col justify-center items-start gap-4">
          <p className="font-semibold text-altext-gray-600">Cửa Hàng Của Chúng Tôi</p>
          <p className="text-gray-500">
            123 Đường Trần Duy Hưng
            <br />
            Quận Cầu Giấy, TP. Hà Nội
          </p>

          <p className="text-gray-800">
            Điện thoại: <span className="text-gray-500">+123 456 789</span>
          </p>
          <p className=" text-gray-800">
            Email: <span className="text-gray-500">contact@forever.vn</span>
          </p>
        </div>
      </div>

      <NewsLetterBox />
    </div>
  );
};

export default Contact;
