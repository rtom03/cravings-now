import express from "express";
import { getGroup } from "../controller/groupController.js";
import { authenticate, authorize } from "../middleware/authenticate.js";
// import { syncGrpEp } from "../controller/groupController.js";

const groupRoutes = express.Router();

// groupRoutes.get("/sync-group", syncGrpEp);

groupRoutes.get("/:id", authenticate, authorize("ADMIN", "STORE"), getGroup);

export default groupRoutes;
