import { Router } from "express";
import { loginUser, logoutUser, registerUser, refreshAcessToken} from "../controllers/user.controllers.js";
import {upload} from "../middlewares/multer.middleware.js";
import { verify_JWT } from "../middlewares/auth.middleware.js";

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

router.route("/login").post(loginUser)


//secured routes
//here before routing to logout a middleware is injected verify_JWT its that simple
router.route("/logout").post(verify_JWT , logoutUser)
router.route("/refresh-Token").post(refreshAcessToken)

export default router;