import express from "express";
import { signIn } from "../controller/userController.js";
import {
  createOrderHandler,
  listOrdersHandler,
  paymentStatusHandler,
  quoteHandler,
} from "../controller/orderController.js";
import { authenticate, authorize } from "../middleware/authenticate.js";

const orderRoute = express.Router();

// userRoute.post("/sign-up", signUp);
orderRoute.post("/", createOrderHandler);
orderRoute.get("/", authenticate, listOrdersHandler);
orderRoute.post("/:id/payment-status", paymentStatusHandler);

orderRoute.post(
  "/quote",
  authenticate,
  authorize("CUSTOMER", "STORE", "ADMIN"),
  quoteHandler,
);

// GET /payment/callback

export default orderRoute;
