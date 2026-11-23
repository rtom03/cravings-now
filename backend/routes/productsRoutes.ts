import express from "express";
import { authenticate, authorize } from "../middleware/authenticate.js";
import {
  getProductDetails,
  updateProduct,
  updateProductOption,
} from "../controller/productController.js";
import { getProducts } from "../controller/groupController.js";
// import { syncGrpEp } from "../controller/groupController.js";

const productsRoutes = express.Router();

productsRoutes.patch(
  "/modifier-options/:id",
  authenticate,
  authorize("ADMIN"),
  updateProductOption,
);
productsRoutes.get("/product-details/:id", authenticate, getProductDetails);
productsRoutes.patch(
  "/update/:id",
  authenticate,
  authorize("ADMIN"),
  updateProduct,
);

productsRoutes.get("/", getProducts);

export default productsRoutes;
