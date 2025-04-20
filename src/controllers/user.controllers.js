import { asyncHandler } from "../utils/asyncHandler.js";
import {APIError} from "../utils/APIError.js";
import {User} from '../models/user.model.js';
import {uploadOnCloudinary} from "../utils/cloudinary.js";
import { APIResponse } from "../utils/APIResponse.js";
import jwt from "jsonwebtoken"

//refreshtokens and accesstokens are sent to user once logged in but refresh tokens are also saved in DB 

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId);

        const accessToken =  user.generateAccessToken();
        const refreshToken = user.generateRefreshToken();

        user.refreshToken = refreshToken;//this is how you save it in DB
        await user.save({ validateBeforeSave: false }); //to save user directly bcs since you are saving in DB password also kicks in and here there is no password so we dont need any validation before saving user

        return {accessToken , refreshToken};
    } catch (error) {
        throw new APIError(500 , "something went wrong while generating referesh and access token")
    }
}

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

const loginUser = asyncHandler(async (req , res) =>{
    //steps for logging in a User
    //steps -> need username/email and password and we have to match it with backend data of that particular user.
    //if password is checked we need to generate both accessToken and refreshToke and send it to user
    //through cookies mostly secure cookies

    const {email , username , password} = req.body;

    if(!(username || email)){
        throw new APIError(400 , "username or email is required");
    }

    const user = await User.findOne({ //findOne is also a method from mongoDB
        $or : [{username} , {email}]                        //this is a mongoDB operator
    })

    if(!user){
        throw new APIError(404 , "user doesnot exists");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new APIError(404 , "invalid password / invalid user Credentials");
    }

    const {accessToken , refreshToken} = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken");

    //send cookies
    const options = { //hereyou can modify url only through server and is not modifiable from  frontend
        httpOnly : true,
        secure : true,
    }

    return res.status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , refreshToken , options)
        .json(
            new APIResponse(
                200,
                {
                    user: loggedInUser , accessToken , refreshToken
                },
                "User Logged In Successfully"
            )
        )

})

const logoutUser = asyncHandler(async (req , res) =>{
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $set: {
                refreshToken: undefined
            }
        },
        {
            new: true
        }
    )

    const options = { //hereyou can modify url only through server and is not modifiable from  frontend
        httpOnly : true,
        secure : true,
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new APIResponse(200 , {} , "User logged out successfully")
    )
})

//if session ends this is how to make use of refreshtokens
const refreshAcessToken = asyncHandler(async (req , res) => {
    //now i got the refreshToken from cokies 
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    //to compare refreshToken from database first we need token in decoded format

    if(!incomingRefreshToken){
        throw new APIError(401 , "unauthorized request");
    }

    try {
        const decodedRefreshToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
    
        const user = await User.findById(decodedRefreshToken?._id)
    
        if(!user){
            throw new APIError(401 , "Unauthorized request");
        }
    
        if(incomingRefreshToken !== user?.refreshToken){
            throw new APIError(401 , "Refresh token is expired or used");
        }
    
        const options = {
            httpOnly: true,
            secure: true
        }
    
        const {accessToken , newRefreshToken} = generateAccessAndRefreshTokens(user?._id);
    
        return res.status(200)
        .cookie("accessToken" , accessToken , options)
        .cookie("refreshToken" , newRefreshToken , options)
        .json(
            new APIResponse(
                200,
                {
                    accessToken , refreshToken: newRefreshToken
                },
                "Access Token Refreshed Successfully"
            )
        )
    } catch (error) {
        throw new APIError(401 ,  error?.message || "Invalid refreshToken")
    }

})

export {registerUser
        ,loginUser
        ,logoutUser
        ,refreshAcessToken};