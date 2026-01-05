import { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../Context/ShopContext';
import Title from './Title';
import ProductItem from './ProductItem';
import axios from 'axios';

const Recommendations = () => {
    const { backendUrl, token } = useContext(ShopContext);
    const [recommendations, setRecommendations] = useState([]);
    const [isPersonalized, setIsPersonalized] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            try {
                setLoading(true);
                
                let headers = {};
                if (token) {
                    headers = { token };
                }

                const response = await axios.get(
                    `${backendUrl}/api/recommendation/for-user?limit=8`,
                    { headers }
                );

                if (response.data.success) {
                    setRecommendations(response.data.recommendations);
                    setIsPersonalized(response.data.personalized);
                }
            } catch (error) {
                console.error('Failed to fetch recommendations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchRecommendations();
    }, [backendUrl, token]);

    if (loading) {
        return (
            <div className="my-10">
                <div className="text-center text-2xl py-2">
                    <Title text1={'GỢI Ý'} text2={'CHO BẠN'} />
                </div>
                <div className="flex justify-center py-10">
                    <div className="animate-pulse text-gray-400">Đang tải gợi ý...</div>
                </div>
            </div>
        );
    }

    if (recommendations.length === 0) {
        return null;
    }

    return (
        <div className="my-10">
            <div className="text-center text-2xl py-2">
                <Title 
                    text1={isPersonalized ? 'GỢI Ý' : 'SẢN PHẨM'} 
                    text2={isPersonalized ? 'CHO BẠN' : 'NỔI BẬT'} 
                />
                {isPersonalized && (
                    <p className="text-sm text-gray-500 mt-1">
                        Dựa trên lịch sử mua hàng của bạn
                    </p>
                )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 gap-y-6">
                {recommendations.map((item, index) => (
                    <ProductItem
                        key={index}
                        id={item._id}
                        name={item.name}
                        price={item.price}
                        image={item.image}
                        sizes={item.sizes}
                    />
                ))}
            </div>
        </div>
    );
};

export default Recommendations;
