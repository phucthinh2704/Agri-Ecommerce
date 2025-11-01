import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

const ScrollToTopButton = () => {
	const [isVisible, setIsVisible] = useState(false);

	// 1. Hiển thị nút khi cuộn xuống 300px
	const toggleVisibility = () => {
		if (window.pageYOffset > 300) {
			setIsVisible(true);
		} else {
			setIsVisible(false);
		}
	};

	// 2. Hàm cuộn lên đầu (smoothly)
	const scrollToTop = () => {
		window.scrollTo({
			top: 0,
			behavior: "smooth",
		});
	};

	useEffect(() => {
		window.addEventListener("scroll", toggleVisibility);

		// Dọn dẹp listener khi component unmount
		return () => {
			window.removeEventListener("scroll", toggleVisibility);
		};
	}, []);

	return (
		<button
			onClick={scrollToTop}
			className={`
        fixed bottom-8 right-8 z-50 p-5
        bg-green-600 text-white 
        rounded-full shadow-lg 
        transition-all duration-300
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}
        hover:bg-green-700 hover:scale-110
        focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2
      `}
			aria-label="Cuộn lên đầu trang">
			<ArrowUp className="w-7 h-7" />
		</button>
	);
};

export default ScrollToTopButton;
