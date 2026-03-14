const asyncHandler = require("express-async-handler");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Category = require("../models/Category");
const Cart = require("../models/Cart");
require("dotenv").config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const tools = [
	{
		functionDeclarations: [
			{
				name: "search_product_by_name",
				description:
					"Tìm kiếm thông tin chi tiết của nông sản thông qua tên hoặc từ khóa.",
				parameters: {
					type: "OBJECT",
					properties: {
						keyword: {
							type: "STRING",
							description:
								"Tên nông sản (VD: 'Cà chua', 'Thịt bò')",
						},
					},
					required: ["keyword"],
				},
			},
			{
				name: "filter_products",
				description:
					"Tìm nông sản theo giá, danh mục (tiếng Việt), từ khóa tên gọi hoặc sắp xếp (rẻ nhất/mắc nhất).",
				parameters: {
					type: "OBJECT",
					properties: {
						min_price: { type: "NUMBER" },
						max_price: { type: "NUMBER" },
						category: {
							type: "STRING",
							description:
								"Tên danh mục bằng tiếng Việt (VD: 'rau củ', 'trái cây').",
						},
						keyword: {
							type: "STRING",
							description: "Từ khóa tìm kiếm.",
						},
						sort_price: {
							type: "STRING",
							description:
								"'desc' cho mắc nhất, 'asc' cho rẻ nhất.",
						},
					},
				},
			},
			{
				name: "check_order_status",
				description: "Tra cứu trạng thái đơn hàng qua mã ID.",
				parameters: {
					type: "OBJECT",
					properties: { order_id: { type: "STRING" } },
					required: ["order_id"],
				},
			},
			{
				name: "get_store_categories",
				description: "Lấy danh sách tất cả danh mục sản phẩm đang bán.",
				parameters: {
					type: "OBJECT",
					properties: { ask_for_all: { type: "BOOLEAN" } },
				},
			},
			{
				name: "get_best_selling_products",
				description: "Gợi ý các sản phẩm bán chạy nhất.",
				parameters: {
					type: "OBJECT",
					properties: { limit: { type: "NUMBER" } },
				},
			},
			// --- 3 TOOL MỚI SIÊU XỊN ---
			{
				name: "get_user_cart",
				description:
					"Xem các sản phẩm đang có trong giỏ hàng của người dùng hiện tại và tính tổng tiền.",
				parameters: {
					type: "OBJECT",
					properties: {
						ask: { type: "BOOLEAN", description: "Mặc định true" },
					},
				},
			},
			{
				name: "get_user_orders",
				description:
					"Lấy toàn bộ lịch sử các đơn hàng mà khách hàng này đã từng đặt.",
				parameters: {
					type: "OBJECT",
					properties: {
						limit: {
							type: "NUMBER",
							description: "Số lượng đơn muốn lấy, mặc định 5",
						},
					},
				},
			},
			{
				name: "get_related_products",
				description:
					"Gợi ý các sản phẩm cùng chung danh mục với một sản phẩm khách hàng vừa hỏi.",
				parameters: {
					type: "OBJECT",
					properties: {
						category_slug: {
							type: "STRING",
							description:
								"Mã slug của danh mục (VD: 'vegetables')",
						},
						exclude_product: {
							type: "STRING",
							description:
								"Tên sản phẩm cần loại trừ để không gợi ý trùng",
						},
					},
					required: ["category_slug"],
				},
			},
		],
	},
];

const chatWithGemini = asyncHandler(async (req, res) => {
	const { message, history, userId } = req.body;
	if (!message)
		return res
			.status(400)
			.json({ success: false, message: "Vui lòng nhập câu hỏi" });

	let validHistory = [];
	if (history && Array.isArray(history)) {
		validHistory = [...history];
		while (validHistory.length > 0 && validHistory[0].role === "model") {
			validHistory.shift();
		}
	}

	// 1. ÉP BUỘC AI PHẢI TRẢ LỜI TEXT SAU KHI GỌI TOOL
	// 1. ÉP BUỘC AI PHẢI TRẢ LỜI TEXT SAU KHI GỌI TOOL
	const systemInstruction = `
        Bạn là "Nông Dân AI" - trợ lý tư vấn bán hàng của FarmFresh.
        
        LUẬT THÉP:
        1. CHỈ DÙNG DỮ LIỆU TỪ HỆ THỐNG TRẢ VỀ HOẶC THÔNG TIN ĐƯỢC CUNG CẤP DƯỚI ĐÂY. KHÔNG BỊA ĐẶT.
        2. SAU KHI DÙNG CÔNG CỤ (TOOL) ĐỂ LẤY DỮ LIỆU TỪ HỆ THỐNG, BẠN BẮT BUỘC PHẢI VIẾT CÂU TRẢ LỜI (TEXT) BÁO CÁO LẠI CHO KHÁCH HÀNG. TUYỆT ĐỐI KHÔNG ĐƯỢC IM LẶNG HOẶC ĐỂ TRỐNG CÂU TRẢ LỜI.
        3. Nếu khách hỏi về giỏ hàng ("Giỏ hàng của tôi có gì?", "Đồ trong giỏ tính tiền ra sao?"), hãy dùng tool 'get_user_cart'.
        4. Nếu khách hỏi về lịch sử đơn hàng, dùng tool 'get_user_orders'.
        5. Nếu hệ thống báo "Khách hàng CHƯA ĐĂNG NHẬP", hãy nhắc khéo: "Bạn cần đăng nhập tài khoản để mình kiểm tra thông tin giỏ hàng/đơn hàng cho bạn nhé!".
        6. Đơn vị tính là 'kg', 'hộp', 'bó'. Luôn format giá tiền (VD: 30,000đ).

        THÔNG TIN CỬA HÀNG (Dùng để trả lời khách):
        - Phí giao hàng (Ship) mặc định là: 30,000đ.
        - Miễn phí giao hàng (Freeship) cho đơn hàng có tổng giá trị từ: 300,000đ trở lên.
        - Chấp nhận thanh toán khi nhận hàng (COD) và chuyển khoản.
    `;

	const model = genAI.getGenerativeModel({
		model: "gemini-3.1-flash-lite-preview",
		systemInstruction,
		tools: tools,
		generationConfig: { temperature: 0.1, topK: 10, topP: 0.8 },
	});

	const chatSession = model.startChat({ history: validHistory });

	try {
		let result = await chatSession.sendMessage(message);
		let response = result.response;
		const functionCalls = response.functionCalls();

		if (functionCalls && functionCalls.length > 0) {
			const call = functionCalls[0];
			const apiResponse = {};

			// --- TÌM SẢN PHẨM ---
			if (call.name === "search_product_by_name") {
				const products = await Product.find({
					name: { $regex: call.args.keyword, $options: "i" },
				})
					.limit(5)
					.select(
						"name price unit stock sold description category slug",
					);
				apiResponse.products =
					products.length > 0 ? products : "Không tìm thấy.";
			}
			// --- LỌC SẢN PHẨM ---
			else if (call.name === "filter_products") {
				const { min_price, max_price, category, keyword, sort_price } =
					call.args;
				let query = {};

				if (min_price || max_price) {
					query.price = {};
					if (min_price) query.price.$gte = min_price;
					if (max_price) query.price.$lte = max_price;
				}
				if (category) {
					const matchedCategory = await Category.findOne({
						$or: [
							{ name: { $regex: category, $options: "i" } },
							{ slug: { $regex: category, $options: "i" } },
						],
					});
					if (matchedCategory) query.category = matchedCategory.slug;
					else query.category = { $regex: category, $options: "i" };
				}
				if (keyword) query.name = { $regex: keyword, $options: "i" };

				let sortOption = {};
				if (sort_price === "desc") sortOption.price = -1;
				else if (sort_price === "asc") sortOption.price = 1;

				const products = await Product.find(query)
					.select(
						"name price unit stock sold description category slug",
					)
					.limit(10)
					.sort(sortOption);
				apiResponse.result =
					products.length > 0 ? products : "Không tìm thấy nông sản.";
			}
			// --- KIỂM TRA ĐƠN HÀNG ---
			else if (call.name === "check_order_status") {
				try {
					const order = await Order.findById(call.args.order_id);
					if (order) apiResponse.orderInfo = order;
					else apiResponse.orderInfo = "Không tìm thấy đơn hàng.";
				} catch (err) {
					apiResponse.orderInfo = "Mã đơn lỗi.";
				}
			}
			// --- LẤY DANH MỤC ---
			else if (call.name === "get_store_categories") {
				apiResponse.categories = await Category.find().select(
					"name slug description",
				);
			}
			// --- SẢN PHẨM BÁN CHẠY ---
			else if (call.name === "get_best_selling_products") {
				const topProducts = await Product.find({ stock: { $gt: 0 } })
					.sort({ sold: -1 })
					.limit(call.args.limit || 5)
					.select(
						"name price unit stock sold description category slug",
					);
				apiResponse.best_sellers =
					topProducts.length > 0 ? topProducts : "Chưa có.";
			}

			// --- TOOL: GIỎ HÀNG (CẬP NHẬT RÕ RÀNG HƠN) ---
			else if (call.name === "get_user_cart") {
				if (!userId) {
					// Truyền thẳng chữ cho AI dễ đọc thay vì gửi object lỗi
					apiResponse.cartInfo =
						"Khách hàng CHƯA ĐĂNG NHẬP. Hãy yêu cầu khách đăng nhập.";
				} else {
					const cart = await Cart.findOne({
						user_id: userId,
					}).populate(
						"items.product_id",
						"name price unit slug stock",
					);
					if (!cart || cart.items.length === 0) {
						apiResponse.cartInfo = "Giỏ hàng hiện đang trống.";
					} else {
						let total = 0;
						const items = cart.items.map((item) => {
							const itemTotal = item.price * item.quantity;
							total += itemTotal;
							return {
								// Thêm dấu ? phòng hờ sản phẩm đã bị xóa khỏi kho
								product_name:
									item.product_id?.name ||
									"Sản phẩm đã bị ẩn/xóa",
								quantity: item.quantity,
								unit: item.product_id?.unit || "cái",
								price: item.price,
								item_total: itemTotal,
							};
						});
						apiResponse.cartInfo = {
							items: items,
							subtotal: total,
						};
					}
				}
			}

			// --- TOOL: LỊCH SỬ ĐƠN HÀNG (CẬP NHẬT TƯƠNG TỰ GIỎ HÀNG) ---
			else if (call.name === "get_user_orders") {
				if (!userId) {
					apiResponse.orders =
						"Khách hàng CHƯA ĐĂNG NHẬP. Hãy yêu cầu khách đăng nhập.";
				} else {
					const limitNum = call.args.limit || 5;
					const orders = await Order.find({ user_id: userId })
						.sort({ createdAt: -1 })
						.limit(limitNum)
						.populate("items.product_id", "name");

					if (orders.length === 0)
						apiResponse.orders =
							"Khách hàng chưa từng đặt đơn nào.";
					else {
						apiResponse.orders = orders.map((o) => ({
							order_id: o._id,
							date: o.createdAt,
							status: o.status,
							total_price: o.total_price,
							payment_method: o.payment_method,
							items: o.items.map(
								(i) =>
									`${i.product_id?.name || "Sản phẩm"} (x${i.quantity})`,
							),
						}));
					}
				}
			}

			// --- TOOL: GỢI Ý MÓN ---
			else if (call.name === "get_related_products") {
				const { category_slug, exclude_product } = call.args;
				let query = { category: category_slug, stock: { $gt: 0 } };
				if (exclude_product) {
					query.name = {
						$not: { $regex: exclude_product, $options: "i" },
					};
				}
				const related = await Product.find(query)
					.limit(5)
					.select("name price unit stock description");
				apiResponse.related_products =
					related.length > 0
						? related
						: "Không có sản phẩm liên quan.";
			}

			// Gửi data ngược cho AI
			result = await chatSession.sendMessage([
				{
					functionResponse: {
						name: call.name,
						response: apiResponse,
					},
				},
			]);
			response = result.response;
		}

		// 3. LỚP PHÒNG THỦ: NẾU AI LỠ TRẢ VỀ RỖNG THÌ CHÈN VĂN BẢN VÀO
		let finalAnswer = "";
		try {
			finalAnswer = response.text();
		} catch (e) {
			console.log("Lỗi khi đọc text từ AI:", e);
		}

		if (!finalAnswer || finalAnswer.trim() === "") {
			finalAnswer =
				"Dạ, mình đã kiểm tra giỏ hàng cho bạn xong rồi nhưng hệ thống đang xử lý tin nhắn hơi chậm. Bạn đợi lát rồi hỏi lại mình nha!";
		}

		return res.status(200).json({ success: true, data: finalAnswer });
	} catch (error) {
		console.error("Chatbot Error:", error);
		return res.status(500).json({
			success: false,
			message: "Hệ thống AI đang bảo trì. Bạn thử lại sau ít phút nhé!",
		});
	}
});

module.exports = { chatWithGemini };
