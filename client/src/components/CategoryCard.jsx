
const CategoryCard = ({ category, onClick }) => {
	return (
		<button
			onClick={onClick}
			className="bg-white w-72 rounded-xl p-6 shadow-md hover:shadow-xl transition-all hover:-translate-y-1 text-center">
			<div className="w-25 h-25 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
				<img
					src={category.image}
					alt={category.name}
					className="w-full h-full object-cover"
				/>
			</div>
			<h3 className="font-semibold text-gray-800 mb-1">
				{category.name}
			</h3>
			<p className="text-gray-500">
				{category.description || "Sản phẩm tươi ngon"}
			</p>
		</button>
	);
};
export default CategoryCard;
