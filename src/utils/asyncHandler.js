const asyncHandler = (requestHandler)=>{
    return (req , res , next)=>{
        Promise.resolve(requestHandler(req , res , next))
        .catch((err)=>{
            next(err)
        })
    }
}

export {asyncHandler};

//Higher order function syntax.
//next is just a flag to keep track of series of middleware checks that has it completed its task or not
// const asyncHandler = (fn)=>async(req,res,next)=>{
//     try {
//         await fn(req , res , next)
//     } catch (error) {
//         res.status(error.code || 404).json({
//             success:false,
//             message:error.message
//         });
//     }
// }
//this utility is just a wrapper function 