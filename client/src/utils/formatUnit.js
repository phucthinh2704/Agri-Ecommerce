const formatUnit = (unit) => {
	const unitMap = {
		kg: "kg",
		piece: "cái",
		dozen: "tá",
		pack: "gói",
		bunch: "bó",
	};
	return unitMap[unit] || "kg";
};
export default formatUnit;