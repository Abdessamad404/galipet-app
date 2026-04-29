import { Router } from "express";
import { submit, getMine, getAll, updateStatus } from "./insurance.controller";
import { protect, authorize } from "../../middleware/auth.middleware";

const router = Router();

router.post("/leads", protect, submit);
router.get("/leads/mine", protect, getMine);
router.get("/leads", protect, authorize("admin"), getAll);
router.patch("/leads/:id/status", protect, authorize("admin"), updateStatus);

export default router;
