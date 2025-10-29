import { Leaf } from "lucide-react";

const Footer = () => {
	return (
		<footer className="bg-gray-800 text-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
				<div className="grid md:grid-cols-4 gap-8">
					<div>
						<div className="flex items-center space-x-2 mb-4">
							<Leaf className="w-6 h-6 text-green-400" />
							<span className="text-xl font-bold">FarmFresh</span>
						</div>
						<p className="text-gray-400 text-sm">
							Nông sản sạch, tươi ngon từ trang trại đến bàn ăn
							của bạn.
						</p>
					</div>
					<div>
						<h3 className="font-semibold mb-4">Danh Mục</h3>
						<ul className="space-y-2 text-sm text-gray-400">
							<li>
								<a
									href="#"
									className="hover:text-white">
									Rau củ
								</a>
							</li>
							<li>
								<a
									href="#"
									className="hover:text-white">
									Trái cây
								</a>
							</li>
							<li>
								<a
									href="#"
									className="hover:text-white">
									Thực phẩm hữu cơ
								</a>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="font-semibold mb-4">Hỗ Trợ</h3>
						<ul className="space-y-2 text-sm text-gray-400">
							<li>
								<a
									href="#"
									className="hover:text-white">
									Chính sách đổi trả
								</a>
							</li>
							<li>
								<a
									href="#"
									className="hover:text-white">
									Vận chuyển
								</a>
							</li>
							<li>
								<a
									href="#"
									className="hover:text-white">
									Liên hệ
								</a>
							</li>
						</ul>
					</div>
					<div>
						<h3 className="font-semibold mb-4">Liên Hệ</h3>
						<ul className="space-y-2 text-sm text-gray-400">
							<li>Email: contact@farmfresh.vn</li>
							<li>Hotline: 1900 xxxx</li>
							<li>Địa chỉ: Cần Thơ, Việt Nam</li>
						</ul>
					</div>
				</div>
				<div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
					© 2025 FarmFresh. All rights reserved.
				</div>
			</div>
		</footer>
	);
};
export default Footer;
