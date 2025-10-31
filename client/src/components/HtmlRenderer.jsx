import DOMPurify from "dompurify";

const HtmlRenderer = ({ htmlString, className }) => {
	const cleanHtml = DOMPurify.sanitize(htmlString);

	return (
		<div
			className={className || "prose max-w-none"}
			dangerouslySetInnerHTML={{ __html: cleanHtml }}
		/>
	);
};

export default HtmlRenderer;
