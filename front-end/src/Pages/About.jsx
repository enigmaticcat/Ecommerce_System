import { assets } from '../assets/assets';
import NewsLetterBox from '../Components/NewsLetterBox';
import Title from '../Components/Title';

const About = () => {
  return (
    <div>
      <div className="text-2xl text-center pt-8 border-t">
        <Title text1={'VỀ'} text2={'CHÚNG TÔI'} />
      </div>

      <div className="flex flex-col md:flex-row gap-16 my-10">
        <img
          src={assets.about_img}
          alt=""
          className="w-full md:max-w-[450px] "
        />

        <div className="flex flex-col justify-center gap-6 md:w-2/4 text-gray-600">
          <p>
            Forever được sinh ra từ niềm đam mê đổi mới và mong muốn cách mạng hóa 
            cách mọi người mua sắm trực tuyến. Hành trình của chúng tôi bắt đầu với 
            ý tưởng đơn giản: tạo ra một nền tảng nơi khách hàng có thể dễ dàng 
            khám phá và mua sắm đa dạng sản phẩm ngay tại nhà.
          </p>
          <p>
            Kể từ khi thành lập, chúng tôi đã không ngừng nỗ lực để tuyển chọn 
            những sản phẩm chất lượng cao phù hợp với mọi sở thích và phong cách. 
            Từ thời trang, làm đẹp đến điện tử và đồ gia dụng, chúng tôi cung cấp 
            bộ sưu tập phong phú từ các thương hiệu và nhà cung cấp uy tín.
          </p>
          <b className="text-gray-800">Sứ Mệnh Của Chúng Tôi</b>
          <p>
            Sứ mệnh của Forever là mang đến cho khách hàng sự lựa chọn, tiện lợi 
            và niềm tin. Chúng tôi cam kết mang lại trải nghiệm mua sắm liền mạch, 
            vượt xa mong đợi - từ khâu duyệt sản phẩm, đặt hàng đến giao hàng và 
            hậu mãi.
          </p>
        </div>
      </div>

      <div className="py-4 text-2xl">
        <Title text1={'TẠI SAO'} text2={'CHỌN CHÚNG TÔI'} />
      </div>

      <div className="flex flex-col md:flex-row mb-20 text-sm gap-4">
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Đảm Bảo Chất Lượng</b>
          <p className="text-gray-600">
            Chúng tôi tự hào chỉ cung cấp những sản phẩm chất lượng cao nhất, 
            đáp ứng các tiêu chuẩn khắt khe về độ bền, hiệu suất và giá trị.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Tiện Lợi</b>
          <p className="text-gray-600">
            Website và ứng dụng di động thân thiện giúp bạn dễ dàng duyệt, 
            so sánh và mua hàng mọi lúc mọi nơi.
          </p>
        </div>
        <div className="border px-10 md:px-16 py-8 sm:py-20 flex flex-col gap-5">
          <b>Dịch Vụ Khách Hàng Xuất Sắc</b>
          <p className="text-gray-600">
            Đội ngũ chăm sóc khách hàng tận tâm của chúng tôi luôn sẵn sàng 
            hỗ trợ bạn 24/7 với mọi thắc mắc hay vấn đề.
          </p>
        </div>
      </div>

      <NewsLetterBox />
    </div>
  );
};

export default About;
