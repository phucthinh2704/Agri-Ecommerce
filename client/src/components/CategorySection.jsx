import { useEffect, useState } from "react";
import { apiGetAllCategories } from "../api/category";
import CategoryCard from "./CategoryCard";
import { Link } from "react-router-dom";

const CategorySection = ({ onCategoryClick }) => {
	const [categories, setCategories] = useState([]);

	useEffect(() => {
		const fetchCategories = async () => {
			const catRes = await apiGetAllCategories();
			if (catRes.success) {
				setCategories(catRes.data);
			}
		};
		fetchCategories();
	}, []);

	return (
		<section className="mb-12">
			<h2 className="text-2xl font-bold text-gray-800 mb-6">
				Danh Mục Nổi Bật
			</h2>
			<div className="flex flex-wrap justify-center gap-4">
				{categories.map((category) => (
					<CategoryCard
						key={category._id}
						category={category}
						onClick={() => onCategoryClick(category)}
					/>
				))}
			</div>
		</section>
	);
};
export default CategorySection;
