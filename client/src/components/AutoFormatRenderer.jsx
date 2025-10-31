import HtmlRenderer from "./HtmlRenderer";
import MarkdownFormatter from "./MarkdownFormatter";

const isHtmlString = (str) => {
	if (!str) return false;
	// Regex này kiểm tra sự tồn tại của thẻ <tag> hoặc </tag>
	const htmlTagRegex = /<[a-z][\s\S]*>/i;
	return htmlTagRegex.test(str);
};

const AutoFormatRenderer = ({ content, className }) => {
	if (isHtmlString(content)) {
		// 1. Nếu là HTML (dữ liệu mới từ CKEditor)
		return (
			<HtmlRenderer
				htmlString={content}
				className={className}
			/>
		);
	} else {
		// 2. Nếu là Markdown (dữ liệu cũ trong DB)
		return (
			<MarkdownFormatter
				value={content}
				className={className}
			/>
		);
	}
};

export default AutoFormatRenderer;
