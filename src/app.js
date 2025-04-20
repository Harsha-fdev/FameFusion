import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN,  //process.env.CORS_ORIGIN
    credentials:true
}));

//All these are express config's

//lets do some settings as some requests may be json or body or form data or url so in order to accept data we have to do some production grade settings -->if we are accepting json data which we need to provide to frontend we can set limits so that only this much will be loaded or stored first or else our server might crash also lets see
app.use(express.json({limit:"16kb"}));

//there is slight issue when we get data from url so to handle that we do the following
app.use(express.urlencoded({extended:true, limit:"16kb" }));///extended means you can encode nested objects too and this is not compulsory to write

//lets say you want to store some public assets or folders (photo's , video's , pdf's) in your server you can use This
app.use(express.static("public")) //public is name of asset / folder and this is also not compulsory to name

//cookie parser is basically used to access cookies/secure cookies from user browser or set cookie into the browser basically do CRUD operation on it
app.use(cookieParser());



//routes import this is how it is imported

import userRouter from "./routes/user.routes.js";


//routes declaration this is done because as you are importing routes you need middlewares first before routes 
//also its important if we are defining our API we should mention version 
app.use("/api/v1/users" , userRouter);
//so now the route looks like http://localhost:8000/api/v1/users/register


// app.use("/users", userRouter);
//so now the route looks like http://localhost:8000/users/register


export {app};
