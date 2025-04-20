import { APIError } from "../utils/APIError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
import { User } from "../models/user.model.js";

export const verify_JWT = asyncHandler(async(req , /*res*/_ , next) => {//since res is not used here
   try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "")

        if(!token){
            throw new APIError(401 , "Unauthorized request")
        }

        const decodedToken = jwt.verify(token , process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findById(decodedToken?._id).select("-password -refreshToken")

        if(!user){
            //discussion about frontend
            throw new APIError(401 , "Invalid Access Token");
        }

        req.user = user;
        next();
   } catch (error) {
        throw new APIError(401 ,error?.message || "invalid access token")
   }

})