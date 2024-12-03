import { Router } from "express";
import {
  createUser,
  deleteUser,
  deleteUsers,
  getAllUsers,
  getReferralTreeHandler,
  getUser,
  updateUser,
} from "../controllers/userControllers.js";

const router = Router();

router.post("/create", createUser);
router.get("/users", getAllUsers);
router.get("/:id", getUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);
router.delete("/users/all", deleteUsers);
router.get("/referraltree/:id", getReferralTreeHandler);

export default router;
