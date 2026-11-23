import express from "express";
import { createOrderHandler, listOrdersHandler, paymentStatusHandler, quoteHandler, } from "../controller/orderController";
import { authenticate, authorize } from "../middleware/authenticate";
const orderRoute = express.Router();
// userRoute.post("/sign-up", signUp);
orderRoute.post("/", createOrderHandler);
orderRoute.get("/", authenticate, listOrdersHandler);
orderRoute.post("/:id/payment-status", paymentStatusHandler);
orderRoute.post("/quote", authenticate, authorize("CUSTOMER", "STORE", "ADMIN"), quoteHandler);
// GET /payment/callback
export default orderRoute;
