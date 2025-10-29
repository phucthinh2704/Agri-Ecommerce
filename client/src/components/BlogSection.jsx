import { ArrowRight } from "lucide-react";
const BlogSection = () => {
	const blogs = [
		{
			id: 1,
			title: "Top 5 sản phẩm nông nghiệp Việt Nam nổi tiếng trên thế giới",
			excerpt:
				"Hạt Cà phê Tây Nguyên, gạo Cần Thơ, dừa Đồng Giao, nhãn lồng, xoài Cát [...]",
			date: "24",
			month: "Aug",
			image: "https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=500&h=300&fit=crop",
			category: "Nông sản Việt",
			url: "https://thegioinongsan.com/san-pham-nong-nghiep-noi-tieng/",
		},
		{
			id: 2,
			title: "Top 5 nông sản xuất khẩu của Việt Nam",
			excerpt:
				"Nông sản xuất khẩu của Việt Nam đã có những bước phát triển vượt bậc [...]",
			date: "10",
			month: "Jan",
			image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=500&h=300&fit=crop",
			category: "Xuất khẩu",
			url: "https://thegioinongsan.com/top-5-nong-san-xuat-khau-cua-viet-nam/",
		},
		{
			id: 3,
			title: "Sản phẩm nông nghiệp sạch: Mua ở đâu uy tín",
			excerpt:
				"Bạn đang tìm kiếm những sản phẩm nông nghiệp sạch, an toàn cho sức khỏe? [...]",
			date: "16",
			month: "Dec",
			image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=500&h=300&fit=crop",
			category: "Hướng dẫn",
			url: "https://thegioinongsan.com/san-pham-nong-nghiep-sach/",
		},
	];

	const handleBlogClick = (url) => {
		window.open(url, "_blank", "noopener,noreferrer");
	};
	return (
		<section className="mb-16">
			<h2 className="text-3xl font-bold text-gray-800 mb-8">
				Blog Nông Sản
			</h2>
			<div className="grid md:grid-cols-3 gap-6">
				{blogs.map((blog) => (
					<article
						key={blog.id}
						className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow">
						<div
							className="relative h-48 overflow-hidden cursor-pointer"
							onClick={() => {
								handleBlogClick(blog.url);
							}}>
							<img
								src={blog.image}
								alt={blog.title}
								className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
							/>
							<div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-lg text-center min-w-[60px]">
								<div className="text-2xl font-bold">
									{blog.date}
								</div>
								<div className="text-xs">{blog.month}</div>
							</div>
						</div>
						<div className="p-6">
							<div className="text-xs text-green-600 font-semibold mb-2">
								{blog.category}
							</div>
							<h3
								className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 hover:text-green-600 cursor-pointer"
								onClick={() => {
									handleBlogClick(blog.url);
								}}>
								{blog.title}
							</h3>
							<p className="text-gray-600 text-sm mb-4 line-clamp-3">
								{blog.excerpt}
							</p>
							<button
								className="flex items-center text-green-600 hover:text-green-700 font-semibold text-sm cursor-pointer"
								onClick={() => {
									handleBlogClick(blog.url);
								}}>
								Đọc tiếp
								<ArrowRight className="w-4 h-4 ml-1" />
							</button>
						</div>
					</article>
				))}
			</div>
		</section>
	);
};
export default BlogSection;
