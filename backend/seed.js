const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import Models - Đảm bảo các file này nằm đúng trong thư mục models của bạn
const User = require('./models/user');
const Admin = require('./models/admin');
const Category = require('./models/category');
const Product = require('./models/product');
const Review = require('./models/review');

const MONGODB_URI = process.env.MONGODB_URI;

const seedData = async () => {
    try {
        if (!MONGODB_URI) {
            console.error('Lỗi: Không tìm thấy MONGODB_URI trong file .env');
            process.exit(1);
        }

        await mongoose.connect(MONGODB_URI);
        console.log('--- Đang làm sạch Database ---');
        await Promise.all([
            User.deleteMany({}),
            Admin.deleteMany({}),
            Category.deleteMany({}),
            Product.deleteMany({}),
            Review.deleteMany({})
        ]);

        console.log('--- Đang tạo danh mục (Categories) ---');
        const categories = await Category.create([
            { code: 'SMARTPHONE', header: 'Điện thoại thông minh', description: 'Flagship và tầm trung mới nhất' },
            { code: 'LAPTOP', header: 'Máy tính xách tay', description: 'Laptop văn phòng, gaming và đồ họa' },
            { code: 'FASHION_MEN', header: 'Thời trang Nam', description: 'Trang phục nam hiện đại' },
            { code: 'FASHION_WOMEN', header: 'Thời trang Nữ', description: 'Xu hướng thời trang nữ mới nhất' },
            { code: 'HOME_APP', header: 'Đồ gia dụng', description: 'Thiết bị thông minh cho căn bếp' },
            { code: 'SPORTS', header: 'Thể thao & Dã ngoại', description: 'Dụng cụ và trang phục thể thao' },
            { code: 'BEAUTY', header: 'Làm đẹp & Chăm sóc da', description: 'Mỹ phẩm chính hãng' },
            { code: 'ACCESSORIES', header: 'Phụ kiện công nghệ', description: 'Tai nghe, sạc, bao da' },
            { code: 'WATCHES', header: 'Đồng hồ cao cấp', description: 'Đồng hồ cơ và thông minh' },
            { code: 'SHOES', header: 'Giày dép thời trang', description: 'Sneaker và giày công sở' }
        ]);

        console.log('--- Đang tạo người dùng mẫu ---');
        const admin = await Admin.create({
            name: 'admin',
            phone: '0901234567',
            password: '123',
            email: 'admin@webshop.com',
            role: 'admin'
        });

        const users = await User.create([
            { name: 'Hoàng Minh', phone: '0981112223', password: 'UserPass123', email: 'hoangminh@gmail.com', gender: 'Nam' },
            { name: 'Thu Thảo', phone: '0981112224', password: 'UserPass123', email: 'thuthao@gmail.com', gender: 'Nữ' },
            { name: 'Quốc Bảo', phone: '0981112225', password: 'UserPass123', email: 'quocbao@gmail.com', gender: 'Nam' }
        ]);

        console.log('--- Đang tạo 50 sản phẩm ---');
        const productsRaw = [
            // SMARTPHONE (catIdx: 0)
            { name: 'iPhone 15 Pro Max 256GB Titanium', description: 'Chip A17 Pro, Camera 48MP Zoom 5x.', price: 29500000, catIdx: 0, img: 'https://images.unsplash.com/photo-1696446701796-da61225697cc', info: 'Màn hình 6.7 inch ProMotion' },
            { name: 'Samsung Galaxy S24 Ultra 512GB', description: 'Bút S-Pen quyền năng, AI dịch thuật trực tiếp.', price: 26900000, catIdx: 0, img: 'https://images.unsplash.com/photo-1610945415295-d9baf060e811', info: 'Chip Snapdragon 8 Gen 3' },
            { name: 'Google Pixel 8 Pro 128GB', description: 'Trải nghiệm Android thuần khiết, camera AI.', price: 18500000, catIdx: 0, img: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97', info: 'Chip Tensor G3' },
            { name: 'Xiaomi 14 Ultra Leica Edition', description: 'Ống kính Leica Summilux chuyên nghiệp.', price: 21000000, catIdx: 0, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', info: 'RAM 16GB, Sạc nhanh 90W' },
            { name: 'OPPO Find X7 Ultra', description: 'Hệ thống camera kép tiềm vọng đầu tiên.', price: 19500000, catIdx: 0, img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9', info: 'Màn hình 2K ProXDR' },

            // LAPTOP (catIdx: 1)
            { name: 'MacBook Air M3 13-inch 2024', description: 'Siêu mỏng nhẹ, hiệu năng M3 vượt trội.', price: 27500000, catIdx: 1, img: 'https://images.unsplash.com/photo-1517336714460-457228377451', info: 'RAM 8GB, SSD 256GB' },
            { name: 'Dell XPS 15 9530 Carbon', description: 'Màn hình InfinityEdge 3.5K OLED.', price: 42000000, catIdx: 1, img: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45', info: 'Intel Core i9, RTX 4070' },
            { name: 'Asus ROG Zephyrus G14 Gaming', description: 'Laptop Gaming mạnh nhất trong thân hình nhỏ gọn.', price: 35000000, catIdx: 1, img: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef', info: 'AMD Ryzen 9, 120Hz' },
            { name: 'Lenovo ThinkPad X1 Carbon Gen 12', description: 'Đẳng cấp doanh nhân, độ bền chuẩn quân đội.', price: 38000000, catIdx: 1, img: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed', info: 'Trọng lượng siêu nhẹ 1.1kg' },
            { name: 'HP Spectre x360 2-in-1', description: 'Xoay gập linh hoạt, màn hình cảm ứng.', price: 31000000, catIdx: 1, img: 'https://images.unsplash.com/photo-1544006659-f0b21884cb1d', info: 'Kèm bút cảm ứng HP Pen' },

            // FASHION MEN (catIdx: 2)
            { name: 'Áo Khoác Bomber Da Lộn Luxury', description: 'Chất liệu da lộn cao cấp, form dáng trẻ trung.', price: 1250000, catIdx: 2, img: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea', info: 'Màu Nâu, Size M-XL' },
            { name: 'Quần Jean Slim-Fit Dark Blue', description: 'Chất jean co dãn, bền màu theo thời gian.', price: 850000, catIdx: 2, img: 'https://images.unsplash.com/photo-1542272604-787c3835535d', info: 'Vải Denim Nhật Bản' },
            { name: 'Sơ Mi Trắng Oxford Classic', description: 'Lịch lãm cho môi trường công sở.', price: 550000, catIdx: 2, img: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c', info: 'Cotton 100%' },
            { name: 'Áo Polo Sport Thoáng Khí', description: 'Công nghệ Dri-fit thấm hút mồ hôi cực tốt.', price: 450000, catIdx: 2, img: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820', info: 'Nhiều màu lựa chọn' },
            { name: 'Vest Blazer Hàn Quốc Modern', description: 'Thiết kế hiện đại, phù hợp dự tiệc và đi làm.', price: 2100000, catIdx: 2, img: 'https://images.unsplash.com/photo-1594932224828-b4b059bdb996', info: 'Màu xám lông chuột' },

            // FASHION WOMEN (catIdx: 3)
            { name: 'Váy Floral Midi Dịu Dàng', description: 'Họa tiết hoa nhí, chất liệu voan lụa.', price: 950000, catIdx: 3, img: 'https://images.unsplash.com/photo-1572804013307-a9a111984275', info: 'Size S-M-L' },
            { name: 'Áo Len Cardigan Dáng Rộng', description: 'Phong cách thu đông nhẹ nhàng.', price: 650000, catIdx: 3, img: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105', info: 'Len lông cừu mềm mại' },
            { name: 'Túi Xách Da Thật Crossbody', description: 'Phụ kiện không thể thiếu cho phái nữ.', price: 3200000, catIdx: 3, img: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3', info: 'Da bò nguyên tấm' },
            { name: 'Quần Culottes Cạp Cao', description: 'Tôn dáng, hack chiều cao hiệu quả.', price: 520000, catIdx: 3, img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1', info: 'Vải tuyết mưa cao cấp' },
            { name: 'Chân Váy Chữ A Công Sở', description: 'Thiết kế basic dễ phối đồ.', price: 420000, catIdx: 3, img: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa', info: 'Khóa kéo sườn tinh tế' },

            // HOME APP (catIdx: 4)
            { name: 'Nồi Chiên Không Dầu Philips XXL', description: 'Công nghệ Rapid Air giảm 90% dầu mỡ.', price: 5400000, catIdx: 4, img: 'https://images.unsplash.com/photo-1626074353765-517a681e40be', info: 'Dung tích 7.3 Lít' },
            { name: 'Máy Lọc Không Khí Xiaomi 4 Pro', description: 'Khử mùi, lọc bụi mịn PM2.5 hiệu quả.', price: 3800000, catIdx: 4, img: 'https://images.unsplash.com/photo-1585338107529-13afc5f02586', info: 'Diện tích lọc 60m2' },
            { name: 'Máy Hút Bụi Dyson V15 Detect', description: 'Lực hút siêu mạnh, cảm biến laser.', price: 18900000, catIdx: 4, img: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac', info: 'Pin dùng 60 phút' },
            { name: 'Lò Vi Sóng Sharp Inverter', description: 'Tiết kiệm điện, rã đông nhanh.', price: 2800000, catIdx: 4, img: 'https://images.unsplash.com/photo-1574362848149-11496d93a7c7', info: 'Dung tích 23L' },
            { name: 'Máy Pha Cà Phê DeLonghi', description: 'Tận hưởng Espresso chuẩn vị tại nhà.', price: 12500000, catIdx: 4, img: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6', info: 'Á suất 15 bar' },

            // SPORTS (catIdx: 5)
            { name: 'Thảm Tập Yoga TPE Chống Trơn', description: 'Độ bám cao, an toàn cho da.', price: 350000, catIdx: 5, img: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b', info: 'Độ dày 6mm' },
            { name: 'Tạ Tay Gang Cao Su 5kg', description: 'Bền bỉ, êm tay khi tập luyện.', price: 250000, catIdx: 5, img: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438', info: 'Bán theo cặp' },
            { name: 'Xe Đạp Địa Hình Giant ATX', description: 'Khung nhôm siêu nhẹ, phanh đĩa dầu.', price: 9800000, catIdx: 5, img: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e', info: 'Bánh 27.5 inch' },
            { name: 'Vợt Cầu Lông Yonex Astrox', description: 'Tấn công mạnh mẽ, linh hoạt.', price: 2800000, catIdx: 5, img: 'https://images.unsplash.com/photo-1626225453076-2ec2f370215a', info: 'Kèm bao vợt chính hãng' },
            { name: 'Găng Tay Boxing Everlast', description: 'Bảo vệ cổ tay và khớp ngón tay.', price: 1200000, catIdx: 5, img: 'https://images.unsplash.com/photo-1549719386-74dfcbf7dbed', info: 'Size 10oz - 12oz' },

            // BEAUTY (catIdx: 6)
            { name: 'Serum Estee Lauder Night Repair', description: 'Phục hồi da ban đêm thần thánh.', price: 2450000, catIdx: 6, img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be', info: 'Dung tích 50ml' },
            { name: 'Kem Chống Nắng La Roche-Posay', description: 'Bảo vệ da tối ưu, không gây bết dính.', price: 480000, catIdx: 6, img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03', info: 'SPF 50+, 50ml' },
            { name: 'Son Tom Ford Matte Cherry', description: 'Màu đỏ sang trọng, lì mịn môi.', price: 1350000, catIdx: 6, img: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d', info: 'Vỏ đen viền vàng' },
            { name: 'Nước Hoa Chanel Bleu De Chanel', description: 'Mùi hương nam tính, cuốn hút.', price: 3500000, catIdx: 6, img: 'https://images.unsplash.com/photo-1523293182086-7651a899d37f', info: 'Lưu hương 8-12 tiếng' },
            { name: 'Máy Rửa Mặt Foreo Luna 4', description: 'Làm sạch sâu lỗ chân lông bằng sóng âm.', price: 4900000, catIdx: 6, img: 'https://images.unsplash.com/photo-1590156221122-c748e789290e', info: 'Silicone kháng khuẩn' },

            // ACCESSORIES (catIdx: 7)
            { name: 'Tai Nghe AirPods Pro Gen 2', description: 'Chống ồn chủ động, âm thanh không gian.', price: 5800000, catIdx: 7, img: 'https://images.unsplash.com/photo-1588423771073-b8903fbb85b5', info: 'Cổng sạc MagSafe' },
            { name: 'Loa Bluetooth Marshall Emberton', description: 'Âm thanh 360 độ, kháng nước IPX7.', price: 3900000, catIdx: 7, img: 'https://images.unsplash.com/photo-1545454675-3531b543be5d', info: 'Pin 20 giờ' },
            { name: 'Sạc Dự Phòng Anker 20000mAh', description: 'Sạc nhanh PD, an toàn tuyệt đối.', price: 950000, catIdx: 7, img: 'https://images.unsplash.com/photo-1609091839311-d536446cc174', info: '2 cổng ra USB-C' },
            { name: 'Bàn Phím Cơ Keychron K2', description: 'Gõ phím cực sướng, đa kết nối.', price: 1850000, catIdx: 7, img: 'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae', info: 'Gateron Blue Switch' },
            { name: 'Chuột Logitech MX Master 3S', description: 'Độ chính xác cao, yên tĩnh tuyệt đối.', price: 2100000, catIdx: 7, img: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46', info: 'Cảm biến 8K DPI' },

            // WATCHES (catIdx: 8)
            { name: 'Rolex Submariner Date Blue', description: 'Đồng hồ lặn huyền thoại.', price: 350000000, catIdx: 8, img: 'https://images.unsplash.com/photo-1523170335258-f5ed11844a49', info: 'Thép Oystersteel' },
            { name: 'Omega Seamaster Aqua Terra', description: 'Thanh lịch và bền bỉ.', price: 125000000, catIdx: 8, img: 'https://images.unsplash.com/photo-1547996160-81dfa63595aa', info: 'Máy Co-Axial Master' },
            { name: 'Apple Watch Ultra 2', description: 'Dành cho những nhà thám hiểm.', price: 20500000, catIdx: 8, img: 'https://images.unsplash.com/photo-1434493566906-db97d9f21122', info: 'Vỏ Titan, màn 3000 nits' },
            { name: 'Seiko 5 Sports Automatic', description: 'Bền bỉ, giá thành hợp lý.', price: 5500000, catIdx: 8, img: 'https://images.unsplash.com/photo-1614164185128-e4ec99c436d7', info: 'Chống nước 100m' },
            { name: 'Casio G-Shock GA-2100', description: 'Mẫu "CasiOak" cực hot.', price: 3200000, catIdx: 8, img: 'https://images.unsplash.com/photo-1612817159949-195b6eb9e31a', info: 'Cấu trúc Carbon Core Guard' },

            // SHOES (catIdx: 9)
            { name: 'Nike Air Jordan 1 Retro High', description: 'Phối màu Chicago kinh điển.', price: 12500000, catIdx: 9, img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3', info: 'Da cao cấp' },
            { name: 'Adidas Ultraboost Light 2024', description: 'Giày chạy bộ êm ái nhất.', price: 4200000, catIdx: 9, img: 'https://images.unsplash.com/photo-1587563871167-1ee9c731aefb', info: 'Công nghệ Boost cải tiến' },
            { name: 'Converse Chuck 70 Classic', description: 'Biểu tượng phong cách vintage.', price: 1950000, catIdx: 9, img: 'https://images.unsplash.com/photo-1491553895911-0055eca6402d', info: 'Canvas dày dặn' },
            { name: 'New Balance 550 White Grey', description: 'Phong cách retro basket-ball.', price: 3800000, catIdx: 9, img: 'https://images.unsplash.com/photo-1539185441755-769473a23570', info: 'Phom ôm chân' },
            { name: 'Chelsea Boot Dr. Martens 2976', description: 'Cá tính, bền bỉ cùng thời gian.', price: 4500000, catIdx: 9, img: 'https://images.unsplash.com/photo-1638247025967-b4e38f787b76', info: 'Đế đệm không khí' }
        ];

        console.log('--- Đang xử lý Map dữ liệu khớp Model ---');
        // Logic sửa lỗi quan trọng nằm ở đây: Chuyển đổi dữ liệu thô sang đúng cấu trúc Object của Model
        const products = await Promise.all(productsRaw.map(p => {
            return Product.create({
                name: p.name,
                description: p.description, // Model yêu cầu 'description', không phải 'desc'
                price: p.price,
                category: categories[p.catIdx]._id, // Lấy ID danh mục đã tạo
                stock: Math.floor(Math.random() * 100) + 10,
                // Model 'images' yêu cầu [{ imageUrl, color }]
                images: [{ 
                    imageUrl: p.img, 
                    color: 'Tiêu chuẩn' 
                }],
                // Model 'info' yêu cầu [{ information, color, version }]
                info: [{ 
                    information: p.info, 
                    color: 'Mặc định', 
                    version: 'Quốc tế' 
                }]
            });
        }));

        console.log('--- Đang tạo đánh giá mẫu ---');
        const comments = [
            'Dùng cực thích, giao hàng siêu nhanh!',
            'Giá hơi cao nhưng chất lượng tương xứng.',
            'Sẽ quay lại mua thêm, phục vụ tốt.',
            'Đóng gói cẩn thận, hàng chính hãng check ok.',
            'Sản phẩm đúng như mô tả, rất hài lòng.'
        ];

        await Promise.all(products.map(async (prod, index) => {
            const randomUser = users[Math.floor(Math.random() * users.length)];
            await Review.create({
                product: prod._id,
                user: randomUser._id,
                rating: Math.floor(Math.random() * 2) + 4,
                comment: comments[index % comments.length],
                isVerified: true
            });
        }));

        console.log('✅ HOÀN TẤT: Đã nạp 10 danh mục, 50 sản phẩm và đánh giá tương ứng.');
        process.exit();
    } catch (error) {
        console.error('❌ LỖI SEED DATA:', error);
        process.exit(1);
    }
};

seedData();