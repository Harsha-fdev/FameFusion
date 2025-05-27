import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';//file system in  node

// Configuration
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

//Another production level of uploading a file  
const uploadOnCloudinary = async (localFilePath) => {
    try {
        if (!localFilePath) return null;
        
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"
        });

        fs.unlinkSync(localFilePath)

        return {
            url: response.url,
            public_id: response.public_id
        };
    } catch (error) {
        console.error("Cloudinary upload error:", error);
        return null;
    }
}

const deleteFromCloudinary = async(public_id) => {
    try {
        const result = await cloudinary.uploader.destroy(public_id);
        console.log("Cloudinary delete result:", result);
        return result;
    } catch (error) {
        console.log("Cloudinary delete error" , error);
        return null;
    }
}

export { uploadOnCloudinary , deleteFromCloudinary};


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