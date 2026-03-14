import axios from "../configs/axios";

export const apiChatbot = (data) =>
	axios({
		url: "/chatbot",
		method: "post",
		data,
	});
