const NewsLetterBox = () => {
  const onSubmitHandler = (e) => {
    e.preventDefault();
    alert('Đăng ký thành công!');
  };

  return (
    <div className="text-center">
      <p className="text-2xl font-medium text-gray-800">
        Đăng ký ngay & nhận giảm giá 20%
      </p>
      <p className="text-gray-500 mt-3">
        Hãy là người đầu tiên nhận thông tin về sản phẩm mới, khuyến mãi và ưu đãi đặc biệt!
      </p>

      <form
        onSubmit={onSubmitHandler}
        className="w-full sm:w-1/2 flex items-center gap-3 mx-auto my-6 border pl-3"
      >
        <input
          type="email"
          placeholder="Nhập email của bạn"
          className="w-full sm:flex-1 outline-none "
          required
        />
        <button
          type="submit"
          className="bg-black text-white text-xs px-10 py-4 "
        >
          Đăng ký
        </button>
      </form>
    </div>
  );
};

export default NewsLetterBox;
