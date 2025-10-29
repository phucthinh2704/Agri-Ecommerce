const userRouter = require("./user.route");
const productRouter = require("./product.route");
const categoryRouter = require("./category.route");
const orderRouter = require("./order.route");
const cartRouter = require("./cart.route");
const insertRouter = require("./insert.route");
const { notFound, errorHandler } = require("../middlewares/error-handler");

const initRoutes = (app) => {
	app.use("/api/user", userRouter);
	app.use("/api/category", categoryRouter);
  app.use("/api/product", productRouter);
	app.use("/api/order", orderRouter);
  app.use("/api/cart", cartRouter);
  app.use("/api/insert", insertRouter);

	app.use(notFound);
	app.use(errorHandler);
};

module.exports = initRoutes;
