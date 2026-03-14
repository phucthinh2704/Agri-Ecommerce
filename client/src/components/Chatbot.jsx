import React, { useState, useRef, useEffect } from "react";
import { apiChatbot } from "../api/chatbot";
import MarkdownFormatter from "./MarkdownFormatter";
import { useSelector } from "react-redux"; // Thêm dòng này ở đầu file

const Chatbot = () => {
	const [isOpen, setIsOpen] = useState(false);
	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState([
		{
			role: "model",
			parts: [
				{
					text: "Chào bạn! Mình là Nông Dân AI 🥦. Mình có thể tư vấn món ngon, **kiểm tra giỏ hàng**, hoặc **tra cứu lịch sử đơn hàng** giúp bạn. Bạn cần hỗ trợ gì nào?",
				},
			],
		},
	]);
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef(null);
	const { user } = useSelector((state) => state.auth);
	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	const handleSendMessage = async (e) => {
		e.preventDefault();
		if (!message.trim()) return;

		const userMsg = message.trim();
		setMessage("");

		const newMessages = [
			...messages,
			{ role: "user", parts: [{ text: userMsg }] },
		];
		setMessages(newMessages);
		setIsLoading(true);

		try {
			const response = await apiChatbot({
				message: userMsg,
				history: messages,
				userId: user?._id || null,
			});

			// In ra console để debug xem Backend trả về tên biến là gì (data hay response)
			console.log("Kết quả từ API Chatbot:", response);

			if (response.success) {
				// Tương thích với cả 2 cách đặt tên biến ở Backend (data hoặc response)
				const replyText = response.data || response.response;

				setMessages((prev) => [
					...prev,
					{ role: "model", parts: [{ text: replyText }] },
				]);
			}
		} catch (error) {
			console.error("Lỗi khi gọi API Chatbot:", error);
			setMessages((prev) => [
				...prev,
				{
					role: "model",
					parts: [
						{
							text: "Xin lỗi, hiện tại hệ thống chat đang quá tải hoặc gặp sự cố. Bạn thử lại sau nhé!",
						},
					],
				},
			]);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="fixed bottom-6 right-6 z-51">
			{/* Nút bật/tắt chatbot */}
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="w-14 h-14 bg-green-600 text-white rounded-full flex items-center justify-center shadow-2xl hover:bg-green-700 transition-all duration-300">
				{isOpen ? (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				) : (
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
						stroke="currentColor">
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
						/>
					</svg>
				)}
			</button>

			{/* Cửa sổ Chat */}
			{isOpen && (
				<div className="absolute bottom-16 right-0 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl flex flex-col border border-gray-200 overflow-hidden transform transition-all duration-300">
					{/* Header */}
					<div className="bg-green-600 text-white p-4 flex items-center">
						<div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-green-600 font-bold mr-3 shadow">
							AI
						</div>
						<div>
							<h3 className="font-bold">Trợ lý Nông Dân AI</h3>
							<p className="text-xs text-green-100">
								Sẵn sàng giải đáp mọi thắc mắc
							</p>
						</div>
					</div>

					{/* Vùng hiển thị tin nhắn */}
					<div className="flex-1 p-4 overflow-y-auto bg-gray-50 flex flex-col gap-3">
						{messages.map((msg, index) => (
							<div
								key={index}
								className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
								<div
									className={`max-w-[80%] p-3 rounded-2xl text-sm shadow-sm ${
										msg.role === "user"
											? "bg-green-600 text-white rounded-tr-none"
											: "bg-white text-gray-800 rounded-tl-none border border-gray-100"
									}`}>
									{/* Dùng MarkdownFormatter để render text của Gemini cho đẹp */}
									{msg.role === "user" ? (
										msg.parts[0].text
									) : (
										<MarkdownFormatter
											value={msg.parts[0].text}
										/>
									)}
								</div>
							</div>
						))}

						{/* Hiệu ứng loading */}
						{isLoading && (
							<div className="flex justify-start">
								<div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm flex space-x-2">
									<div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
									<div
										className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
										style={{
											animationDelay: "0.2s",
										}}></div>
									<div
										className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
										style={{
											animationDelay: "0.4s",
										}}></div>
								</div>
							</div>
						)}
						<div ref={messagesEndRef} />
					</div>

					{/* Form nhập liệu */}
					<form
						onSubmit={handleSendMessage}
						className="p-3 bg-white border-t border-gray-200 flex items-center gap-2">
						<input
							type="text"
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							placeholder="Nhập câu hỏi của bạn..."
							className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:border-green-500 text-sm"
							disabled={isLoading}
						/>
						<button
							type="submit"
							disabled={isLoading || !message.trim()}
							className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-5 w-5 ml-1"
								viewBox="0 0 20 20"
								fill="currentColor">
								<path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
							</svg>
						</button>
					</form>
				</div>
			)}
		</div>
	);
};

export default Chatbot;
