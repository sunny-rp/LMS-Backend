import {User} from "../models/user.model.js";
import ErrorHandler from "../middlewares/errorMiddleware.js";
import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import bcrypt from "bcrypt";
import {v2 as cloudinary} from "cloudinary";


export const getAllUsers = catchAsyncErrors(async(req,res,next)=>{
    const users = await User.find({accountVerified:true});
    res.status(200).json({  
        success:true,
        users
    })
})

export const registerNewAdmin = catchAsyncErrors(async(req,res,next)=>{
    if(!req.files || Object.keys(req.files).length === 0){
        return next(new ErrorHandler("Please upload a profile picture",400));
    }

    const {name,email,password} = req.body;
    if(!name || !email || !password){
        return next(new ErrorHandler("Please provide all required fields",400));
    }

    const isAlreadyRegistered = await User.findOne({email,accountVerified:true});
    if(isAlreadyRegistered){
        return next(new ErrorHandler("User already registered",409));
    }

    if(password.length < 8 || password.length > 16){
        return next(new ErrorHandler("Password must be between 8 and 16 characters",400));
    }

    const {avatar} = req.files;
    const allowedFormat = ["image/jpeg","image/webp","image/png"];
    if(!allowedFormat.includes(avatar.mimetype)){
        return next(new ErrorHandler("Please upload a valid image file (JPEG, WEBP, PNG)",400));
    }

    const hashedPassword = await bcrypt.hash(password,10);

    let cloudinaryResponse;

try {
    cloudinaryResponse = await cloudinary.uploader.upload(
        avatar.tempFilePath,
        {
            folder: "libraryMS/admins",
        }
    );

    console.log("Cloudinary Response:", cloudinaryResponse);

} catch (error) {
    console.log("Cloudinary Error:", error);

    return next(new ErrorHandler(error.message, 500));
}

    if (!cloudinaryResponse) {
    return next(
        new ErrorHandler("Failed to upload profile picture", 500)
    );
}

    const admin = await User.create({
        name,
        email,
        password: hashedPassword,
        role: "admin",
        accountVerified: true,
        avatar:{
            public_id: cloudinaryResponse.public_id,
            url: cloudinaryResponse.secure_url
        }
    })

    res.status(201).json({
        success:true,
        message:"Admin registered successfully",
        admin,
    })

})