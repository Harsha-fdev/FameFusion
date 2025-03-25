import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";

const router = Router();

//syntax is const.route(path).method
router.route("/register").post(registerUser)

export default router;