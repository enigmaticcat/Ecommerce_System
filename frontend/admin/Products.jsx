import { useState } from "react";

export default function Products() {
  const [products, setProducts] = useState([
    { id: 1, name: "Áo thun trắng", price: 120000 },
    { id: 2, name: "Quần jean", price: 350000 },
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">Quản lý sản phẩm</h1>
      <table className="w-full bg-white rounded-lg shadow overflow-hidden">
        <thead className="bg-gray-200 text-left">
          <tr>
            <th className="p-3">ID</th>
            <th className="p-3">Tên sản phẩm</th>
            <th className="p-3">Giá (VND)</th>
            <th className="p-3">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id} className="border-t">
              <td className="p-3">{p.id}</td>
              <td className="p-3">{p.name}</td>
              <td className="p-3">{p.price.toLocaleString()}</td>
              <td className="p-3">
                <button className="text-blue-600 hover:underline mr-3">Sửa</button>
                <button className="text-red-600 hover:underline">Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
