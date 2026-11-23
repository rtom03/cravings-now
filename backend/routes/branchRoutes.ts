import express from "express";
import { getBranch, getBranches } from "../controller/branchController.js";
import { authenticate } from "../middleware/authenticate.js";

const branchRoutes = express.Router();

branchRoutes.get("/", getBranches);
branchRoutes.get("/:id", authenticate, getBranch);

export default branchRoutes;
