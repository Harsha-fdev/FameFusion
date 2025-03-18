// import mongoose from "mongoose";
// import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";
import dotenv from "dotenv";

dotenv.config({
    path:"./env"
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000 , ()=>{
        console.log(`Server is running at port ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("Mongo db connection failed!!!",err);
})













//it is a normal method lets say db is connected later you call instead you can use IIFE
// function connectDB(){

// }
// connectDB()

/*This part of code is one of the approach of connecting DB by populating index.js file
but what if we use write all the logics in seperate files and import it in index file and execute
import express from "express";
const app = express();

(async ()=>{
    try{
       await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
       //this is a listener this is added if in case express is not responding to DB or something
       app.on("error", (error)=>{
        console.log("ERR:" , error);
        throw error;
       });

       app.listen(process.env.PORT , ()=>{
        console.log(`app is listening on ${process.env.PORT} `);
       });
    }
    catch(error){
        console.log("ERROR:" , error);
        throw error;
    }
})()
    */