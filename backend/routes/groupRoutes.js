import express from "express";
import { getGroup } from "../controller/groupController";
import { authenticate, authorize } from "../middleware/authenticate";
// import { syncGrpEp } from "../controller/groupController";
const groupRoutes = express.Router();
// groupRoutes.get("/sync-group", syncGrpEp);
groupRoutes.get("/:id", authenticate, authorize("ADMIN", "STORE"), getGroup);
export default groupRoutes;
