import express from "express";
import branchRoutes from "./branchRoutes.js";
import categoryRoutes from "./categoryRoute.js";
import adminRoutes from "./admin/route.js";
import storeRoutes from "./store/route.js";
import productsRoutes from "./productsRoutes.js";
import orderRoute from "./orderRoutes.js";
import customerRoutes from "./customer/route.js";
import streamRoute from "./orderStream.js";
import groupRoutes from "./groupRoutes.js";

const routes = express.Router();

routes.use("/branches", branchRoutes);
routes.use("/categories", categoryRoutes);
routes.use("/products", productsRoutes);
routes.use("/admin", adminRoutes);
routes.use("/customer", customerRoutes);
routes.use("/store", storeRoutes);
routes.use("/orders", orderRoute);
routes.use("/group", groupRoutes);

routes.use("/", streamRoute);

export default routes;
