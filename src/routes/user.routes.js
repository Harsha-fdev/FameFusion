import { Router } from "express";
import { registerUser } from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js";

const router = Router();

//syntax is const.route(path).method
//this is how you inject ,iddleware just before execution of some method
router.route("/register").post(
    upload.fields([
        {name:"avatar",
            maxCount: 1
        },
        {name:"coverimage",
            maxCount:1
        }
    ]),
    registerUser
)

export default router;