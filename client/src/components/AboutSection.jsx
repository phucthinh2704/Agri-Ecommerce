import {
  ArrowRight,
  CheckCircle,
  Leaf,
  Package,
  Shield
} from "lucide-react";
const AboutSection = () => {
	const features = [
		{
			icon: <Package className="w-8 h-8" />,
			title: "Nguồn gốc rõ ràng",
			description:
				"Các sản phẩm nông sản được bán tại cửa hàng đều có nguồn gốc rõ ràng",
		},
		{
			icon: <CheckCircle className="w-8 h-8" />,
			title: "Khách hàng lựa chọn",
			description: "Sản phẩm nông sản đa dạng cho khách hàng lựa chọn",
		},
		{
			icon: <Leaf className="w-8 h-8" />,
			title: "Tươi ngon mỗi ngày",
			description:
				"Các sản phẩm rau, củ quả luôn tươi ngon, được chúng tôi nhập mới hàng ngày",
		},
		{
			icon: <Shield className="w-8 h-8" />,
			title: "Giá cả hợp lý",
			description:
				"Chúng tôi hướng tới mục tiêu đưa đến tay khách hàng những sản phẩm sạch, an toàn với giá thành phù hợp nhất",
		},
	];

	return (
		<section className="mb-16 bg-gradient-to-br from-green-100 to-blue-100 rounded-3xl p-8 md:p-12">
			<div className="text-center mb-12">
				<h2 className="text-4xl font-bold text-blue-600 mb-4">
					Giới Thiệu Về Thế Giới Nông Sản Sạch
				</h2>
				<div className="w-24 h-1 bg-blue-600 mx-auto mb-6"></div>
				<p className="text-gray-700 max-w-4xl mx-auto text-lg leading-relaxed">
					"Thế giới nông sản" là Hệ thống bán lẻ sản phẩm nông sản
					sạch được nhiều chị em nội trợ tin tưởng, chúng tôi cam kết:
				</p>
			</div>

			<div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
				{features.map((feature, index) => (
					<div
						key={index}
						className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-2">
						<div className="text-green-600 mb-4">
							{feature.icon}
						</div>
						<h3 className="font-bold text-gray-800 mb-2 text-lg">
							{feature.title}
						</h3>
						<p className="text-gray-600 text-sm leading-relaxed">
							{feature.description}
						</p>
					</div>
				))}
			</div>

			<div className="bg-white rounded-2xl p-8 shadow-lg">
				<p className="text-gray-700 leading-relaxed text-center">
					Nông sản sạch đang trở thành xu hướng phổ biến trong bối
					cảnh sức khỏe và an toàn thực phẩm ngày càng được chú trọng.
					Vậy nông sản sạch thực sự là gì và tại sao nó lại quan trọng
					đến vậy? Trong bài viết này, chúng ta sẽ khám phá khái niệm
					nông sản sạch và tìm hiểu những tiêu chí để chọn lựa các sản
					phẩm này cho gia đình bạn.
				</p>
			</div>

		</section>
	);
};
export default AboutSection;
