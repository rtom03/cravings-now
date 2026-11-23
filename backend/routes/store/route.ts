import express from "express";
import { authenticate, authorize } from "../../middleware/authenticate.js";
import {
  createSUser,
  loginSUser,
} from "../../controller/store/store.authController.js";

const storeRoutes = express.Router();

storeRoutes.post("/sign-up", authenticate, authorize("ADMIN"), createSUser);
storeRoutes.post("/sign-in", loginSUser);

export default storeRoutes;
