import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';//file system in  node

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//Another production level of uploading a file  
const uploadOnCloudinary = async (localFilePath)=>{
    try {
        if(localFilePath) return null;
        //upload file on cloudinary
        const response = await cloudinary.uploader.upload(localFilePath , {
            resource_type: "auto"
        })
        //file has been uploaded successfully
        console.log("file uploaded successfully" , response.url);
        return response;
    } catch (error) {
        fs.unlinkSync(localFilePath);//removes temporarily saved localFilePath in our server as our operation got saved
        return null;
    }
}

export {uploadOnCloudinary};


//direct way to upload file

// const uploadFile = async function(){
//    const uploadResult = await cloudinary.uploader
//    .upload(
//         'https://res.cloudinary.com/demo/image/upload/getting-started/shoes.jpg', 
//         {
//             public_id: 'shoes',
//         }
//     )
//    .catch((error)=>{
//         console.log(error);
//    });
// }