import { Leaf, Star, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { apiGetAllProducts } from "../api/product";
import {
	AboutSection,
	BannerSlider,
	BlogSection,
	CategorySection,
	HeroSection,
	ProductSection,
	MapSection
} from "../components";
import { useNavigate } from "react-router-dom";


const Home = () => {
	const [featuredProducts, setFeaturedProducts] = useState([]);
	const [newProducts, setNewProducts] = useState([]);
	const [bestSellers, setBestSellers] = useState([]);
	const [loading, setLoading] = useState(true);

	const navigate = useNavigate();

	useEffect(() => {
		loadData();
	}, []);

	const loadData = async () => {
		try {
			setLoading(true);

			// Load featured products (8 sản phẩm mới nhất)
			const featuredRes = await apiGetAllProducts({
				limit: 8,
				sort: "-createdAt",
			});
			if (featuredRes.success) {
				setFeaturedProducts(featuredRes.data);
			}

			// Load new products (4 sản phẩm)
			const newRes = await apiGetAllProducts({
				limit: 4,
				sort: "-createdAt",
			});
			if (newRes.success) {
				setNewProducts(newRes.data);
			}

			// Load best sellers (sản phẩm bán chạy)
			const bestRes = await apiGetAllProducts({
				limit: 4,
				sort: "-sold",
			});
			if (bestRes.success) {
				setBestSellers(bestRes.data);
			}
		} catch (error) {
			console.error("Error loading data:", error);
		} finally {
			setLoading(false);
		}
	};

	const handleCategoryClick = (category) => {
		navigate(`/category/${category.slug}`);
	};

	if (loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<Leaf className="w-16 h-16 text-green-600 animate-bounce mx-auto mb-4" />
					<p className="text-gray-600">Đang tải...</p>
				</div>
			</div>
		);
	}

	return (
		<>
			<HeroSection />

			<main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				{/* Banner Slider */}
				<BannerSlider />

				{/* Categories Section - Cần truyền categories từ PublicLayout xuống nếu cần
          Nếu Home không cần `categories` (chỉ Header cần), thì không cần làm gì.
          Nếu Home vẫn cần `categories` (ví dụ S.E.O), bạn phải lấy chúng từ PublicLayout
          bằng cách dùng `useOutletContext` của router.
          Nhưng hiện tại code của bạn `categories` được fetch ở `Home`
          nhưng chỉ được dùng bởi `Header` nên ta chỉ cần dời nó là đủ.
        */}

				{/* Tạm thời tôi sẽ fetch lại categories ở Home để CategorySection hoạt động
           (Cách tốt hơn là dùng useOutletContext)
        */}
				{/* Categories Section */}
				<CategorySection onCategoryClick={handleCategoryClick} />

				{/* Featured Products */}
				<ProductSection
					title="Sản Phẩm Nổi Bật"
					products={featuredProducts}
					icon={TrendingUp}
				/>

				{/* New Products */}
				{newProducts.length > 0 && (
					<ProductSection
						title="Hàng Mới Về"
						products={newProducts}
						icon={Leaf}
					/>
				)}

				{/* Best Sellers */}
				{bestSellers.length > 0 && (
					<ProductSection
						title="Bán Chạy Nhất"
						products={bestSellers}
						icon={Star}
					/>
				)}

				{/* About Section */}
				<AboutSection />

				{/* Map Section */}
				<MapSection />

				{/* Blog Section */}
				<BlogSection />
			</main>
		</>
	);
};

export default Home;
