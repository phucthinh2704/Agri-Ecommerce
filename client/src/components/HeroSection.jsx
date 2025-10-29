const HeroSection = () => {
	return (
		<div className="relative bg-gradient-to-r from-green-600 to-green-700 text-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
				<div className="grid md:grid-cols-2 gap-8 items-center">
					<div>
						<h1 className="text-4xl md:text-5xl font-bold mb-4">
							Nông Sản Tươi Ngon
							<br />
							Từ Trang Trại
						</h1>
						<p className="text-lg mb-8 text-green-50">
							100% tự nhiên, không hóa chất. Giao hàng tận nơi,
							cam kết chất lượng tốt nhất.
						</p>
						<button className="bg-white text-green-700 px-8 py-3 rounded-full font-semibold hover:bg-green-50 transition-colors">
							Mua Ngay
						</button>
					</div>
					<div className="hidden md:block">
						<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
							<div className="grid grid-cols-3 gap-4 text-center">
								<div>
									<div className="text-3xl font-bold">
										100+
									</div>
									<div className="text-sm text-green-100">
										Sản phẩm
									</div>
								</div>
								<div>
									<div className="text-3xl font-bold">
										5K+
									</div>
									<div className="text-sm text-green-100">
										Khách hàng
									</div>
								</div>
								<div>
									<div className="text-3xl font-bold">
										4.8★
									</div>
									<div className="text-sm text-green-100">
										Đánh giá
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
export default HeroSection;