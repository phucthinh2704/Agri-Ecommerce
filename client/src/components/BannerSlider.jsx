import {
  ChevronRight
} from "lucide-react";
import { useEffect, useState } from "react";
const BannerSlider = () => {
	const [currentSlide, setCurrentSlide] = useState(0);

	const banners = [
		{
			id: 1,
			title: "Vựa hoa quả",
			subtitle: "TƯƠI MÁT MÙA HÈ",
			discount: "GIẢM TỚI 40%",
			bonus: "TẶNG 50K",
			image: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1200&h=400&fit=crop",
			bgColor: "from-cyan-300 to-blue-400",
		},
		{
			id: 2,
			title: "Rau củ quả",
			subtitle: "TƯƠI NGON",
			discount: "RAU SẠCH TƯƠI NGON",
			bonus: "MUA NGAY",
			image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=1200&h=400&fit=crop",
			bgColor: "from-orange-300 to-red-400",
		},
		{
			id: 3,
			title: "Rau sạch",
			subtitle: "AN TOÀN VỆ SINH",
			discount: "100% HỮU CƠ",
			bonus: "KHÁM PHÁ",
			image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1200&h=400&fit=crop",
			bgColor: "from-green-300 to-emerald-400",
		},
	];

	useEffect(() => {
		const timer = setInterval(() => {
			setCurrentSlide((prev) => (prev + 1) % banners.length);
		}, 5000);
		return () => clearInterval(timer);
	}, [banners.length]);

	const nextSlide = () => {
		setCurrentSlide((prev) => (prev + 1) % banners.length);
	};

	const prevSlide = () => {
		setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
	};

	return (
		<div className="relative w-full h-[400px] md:h-[500px] overflow-hidden rounded-2xl mb-8">
			{banners.map((banner, index) => (
				<div
					key={banner.id}
					className={`absolute inset-0 transition-all duration-700 ${
						index === currentSlide
							? "opacity-100 translate-x-0"
							: "opacity-0 translate-x-full"
					}`}>
					<div
						className={`absolute inset-0 bg-gradient-to-r ${banner.bgColor} opacity-90`}
					/>
					<img
						src={banner.image}
						alt={banner.title}
						className="w-full h-full object-cover"
					/>
					<div className="absolute inset-0 flex items-center">
						<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
							<div className="max-w-2xl text-white pl-10">
								<h2 className="text-5xl md:text-7xl font-bold mb-4 animate-fade-in">
									{banner.title}
								</h2>
								<p className="text-2xl md:text-4xl font-semibold mb-6">
									{banner.subtitle}
								</p>
								<div className="flex items-center gap-4 mb-8">
									<div className="bg-white text-green-700 px-6 py-3 rounded-full font-bold text-xl">
										{banner.discount}
									</div>
									<div className="bg-green-600 text-white px-6 py-3 rounded-full font-bold text-xl">
										{banner.bonus}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			))}

			{/* Navigation Buttons */}
			<button
				onClick={prevSlide}
				className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg z-10">
				<ChevronRight className="w-6 h-6 rotate-180" />
			</button>
			<button
				onClick={nextSlide}
				className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-3 rounded-full shadow-lg z-10">
				<ChevronRight className="w-6 h-6" />
			</button>

			{/* Dots Indicator */}
			<div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
				{banners.map((_, index) => (
					<button
						key={index}
						onClick={() => setCurrentSlide(index)}
						className={`w-3 h-3 rounded-full transition-all ${
							index === currentSlide
								? "bg-white w-8"
								: "bg-white/50"
						}`}
					/>
				))}
			</div>
		</div>
	);
};

export default BannerSlider;