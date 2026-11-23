// routes/orderStream.ts
import { Router } from "express";
import { orderEvents } from "../lib/orderEvents.js";
import { authenticate, authorize } from "../middleware/authenticate.js";

const streamRoute = Router();

streamRoute.get(
  "/orders/stream",
  authenticate,
  authorize("ADMIN", "STORE"),
  (req, res) => {
    res.set({
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no", // disable proxy buffering (nginx etc.)
    });
    res.flushHeaders();

    const user = req.user; // from authenticate
    const canSee = (branchId: string) =>
      user?.role === "ADMIN" || user?.branchId === branchId; // adjust to your model

    const onPaid = (p: { branchId: string }) => {
      if (!canSee(p.branchId)) return;
      res.write(`event: order.paid\ndata: ${JSON.stringify(p)}\n\n`);
    };

    orderEvents.on("order.paid", onPaid);

    const heartbeat = setInterval(() => res.write(": ping\n\n"), 25000);

    req.on("close", () => {
      clearInterval(heartbeat);
      orderEvents.off("order.paid", onPaid);
    });
  },
);

export default streamRoute;
