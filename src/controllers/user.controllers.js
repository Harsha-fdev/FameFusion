import { asyncHandler } from "../utils/asyncHandler.js";
import {APIError} from "../utils/APIError.js";
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { APIResponse } from "../utils/APIResponse.js";

const registerUser = asyncHandler(async (req , res)=>{
    // console.log("Received files:", req.files); 

    //steps to register a user
    //step 1 -> get user-details from frontend
    //step-2 -> check for validation
    //step-3 -> check if user alredy exists
    //step-4 -> check for images , check for avatar
    //step-5 -> if available upload them to cloudinary(also check avatar once) and extract url
    //step-6 -> create image object and create entry in db
    //step-7 -> remove password and refreshtoken from response
    //step-8 -> check for user creation
    //step-9 ->return response to frontend

    //step-1
    const {username , fullname , email , password} = req.body;
    
    //step-2
    // if(fullname === ""){
    //     throw new APIError(400 , "fullname is required");
    // };
    // or
    if(
        [fullname , email , username , password].some((field)=>{
            field?.trim() === ""
        })
    ){
        throw new APIError(400 , "All fields are required")
    }

    //step-3
    const existedUser = await User.findOne({//you can also use find method
        $or: [{ username },{ email }]
    });

    if(existedUser){
        throw new APIError(409 , "user already exist")
    }

    //step-4
    const avatarLocalpath = req.files?.["avatar"]?.[0]?.path; // Cloudinary auto-generates a URL
    const coverimageLocalpath = req.files?.["coverimage"]?.[0]?.path;

    //basic way to find if path exists or not
    // if(req.files && Array.isArray(req.files.coverimage) && req.files.coverimage.length() > 0){
    //     coverimageLocalpath = req.files.coverimage[0].path;
    // }

    if(!avatarLocalpath){
        throw new APIError(400 , "Avatar fileis required");
    }

    //step-5
    const avatarupload = await uploadOnCloudinary(avatarLocalpath);
    const coverimageupload = coverimageLocalpath ? await uploadOnCloudinary(coverimageLocalpath) : null;

    if(!avatarupload){
        throw new APIError(400 , "Avatar fileis required");
    }

    //step-6
    const user = await User.create({
        fullname,
        avatar: avatarupload?.url,
        coverimage: coverimageupload?.url || "",
        email,
        password,
        username: username.toLowerCase(),
    })

    //step-7
    const createdUser = await User.findById(user.id).select(
        "-password -refreshToken"
    )

    //step-8
    if(!createdUser){
        throw new APIError(500 , "Something went wrong while registering user")
    }

    // step-9
    return res.status(201).json(
        new APIResponse(200 , createdUser , "User registered Successfully!!")
    )
})

export {registerUser};