export default function Orders() {
  const orders = [
    { id: 1, customer: "Nguyễn Văn A", total: 420000, status: "Đang xử lý" },
    { id: 2, customer: "Trần Thị B", total: 680000, status: "Hoàn tất" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Quản lý đơn hàng</h1>
      <table className="w-full bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-gray-200 text-left">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Khách hàng</th>
            <th className="p-3">Tổng tiền</th>
            <th className="p-3">Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id} className="border-t">
              <td className="p-3">{o.id}</td>
              <td className="p-3">{o.customer}</td>
              <td className="p-3">{o.total.toLocaleString()} VND</td>
              <td className="p-3">{o.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
