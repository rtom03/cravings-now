import express from "express";
import branchRoutes from "./branchRoutes";
import categoryRoutes from "./categoryRoute";
import adminRoutes from "./admin/route";
import storeRoutes from "./store/route";
import productsRoutes from "./productsRoutes";
import orderRoute from "./orderRoutes";
import customerRoutes from "./customer/route";
import streamRoute from "./orderStream";
import groupRoutes from "./groupRoutes";

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
