const ErrorHander = require("../utils/errorhander"); 
const catchAsyncErrors = require("../middleware/catchAsyncErrors"); 
const User = require("../models/userModel"); 
const sendToken = require("../utils/jwtToken"); 
const sendEmail = require("../utils/sendEmail"); 
const crypto = require("crypto");
const cloudinary = require("cloudinary"); 
const jwt = require("jsonwebtoken");
const { error } = require("console");

// Register a User 

exports.registerUser = catchAsyncErrors(async (req, res, next)=>{
    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop: "scale",
    });

    const { name, email, password } = req.body; 
    const user = await User.create({
        name,
        email,
        password, 
        avatar:{
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        },
    }); 
    
    sendToken(user, 201, res);
});


//Login User 

exports.loginUser = catchAsyncErrors(async (req, res, next) => {
    const { email, password } = req.body;
  
    // checking if user has given password and email both
  
    if (!email || !password) {
      return next(new ErrorHander("Please Enter Email & Password", 400));
    }
  
    const user = await User.findOne({ email }).select("+password");
  
    if (!user) {
      return next(new ErrorHander("Invalid email or password", 401));
    }
  
    const isPasswordMatched = await user.comparePassword(password);
  
    if (!isPasswordMatched) {
      return next(new ErrorHander("Invalid email or password", 401));
    }
    const token = user.getJWTToken();

    // options for cookie
    const options = {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      withCredentials: true,
      sameSite: true
    };
  
   sendToken(user, 200, res);
  });

// check authenticated user
exports.checkAuthStatus = catchAsyncErrors(async (req, res, next) => {
    if (req.user) {
        res.status(200).json({
            success: true,
            message: "Authenticated",
            isAuthenticated: true
        });
    } else {
        return next(new ErrorHander("Not authenticated", 401));
    } 
});

// Logout User 
exports.logout = catchAsyncErrors(async (req, res, next) => {
    res.cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
      withCredentials: true,
      sameSite: true
    });
  
    res.status(200).json({
      success: true,
      message: "Logged Out",
    });
  });


// Forgot Password 

exports.forgotPassword = catchAsyncErrors(async(req, res, next)=>{
    const user = await User.findOne({email: req.body.email }); 
    if(!user){
        return next(new ErrorHander("User not found", 404)); 
    }

   // Get ResetPassword Token 
   const resetToken = user.getResetPasswordToken(); 

  await user.save({ validateBeforeSave: false }); 

 // const resetPasswordUrl = `http://localhost:3000/password/reset/${resetToken}` ; 
 const resetPasswordUrl = `${req.protocol}://${req.get("host")}/password/reset/${resetToken}`

    const message = `Your password reset token is :- \n\n ${resetPasswordUrl} \n\nIf you have not requested this email 
    then please ignore it`; 


    try {
        await sendEmail({
        email: user.email, 
        subject: `Ecommerce Password Recovery`, 
        message,
        })

        res.status(200).json({
            success: true, 
            message: `Email sent to ${user.email} successfully`, 
        })
    } catch (error) {
        user.resetPasswordToken = undefined; 
        user.resetPasswordExpire = undefined; 

        await user.save({ validateBeforeSave: false }); 

        return next(new ErrorHander(error.message, 500)); 
    }
}); 


//Reset Password 

exports.resetPassword = catchAsyncErrors(async (req, res, next) => {
   // creating token hash 
   const resetPasswordToken = crypto 
  .createHash("sha256") 
  .update(req.params.token) 
  .digest("hex"); 

  const user = await User.findOne({
      resetPasswordToken, 
      resetPasswordExpire: { $gt: Date.now() },  
  });
   
  if (!user) {
      return next(new ErrorHander("Reset Password Token is invalid or has been expired", 404))
  }

  if(req.body.password !== req.body.confirmPassword){
     return next(new ErrorHander("Password does not password", 404)); 
  }
   
  user.password = req.body.password; 
  user.resetPasswordToken = undefined; 
  user.resetPasswordExpire = undefined; 

  await user.save(); 

  sendToken(user, 200, res); 
});

// Get User Detail 
exports.getUserDetails = catchAsyncErrors(async(req,res,next)=> {
  
    const user = await User.findById(req.user.id); 
        res.status(200).json({
            success: true,
            user       
        })
   })

//update user profile

exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    };

    if (req.body.avatar !== "") {
        const user = await User.findById(req.user.id);

        const imageId = user.avatar.public_id;

        await cloudinary.v2.uploader.destroy(imageId);
        
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
            folder: "avatars",
            width: 150,
            crop: "scale", 
        });

        newUserData.avatar = {
            public_id: myCloud.public_id,
            url: myCloud.secure_url,
        };
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true, 
        runValidators: true,
        useFindAndModify: false, 
    }); 

    res.status(200).json({
        success: true,
    });
}); 


// update user password 
exports.updatePassword = catchAsyncErrors(async (req, res, next) => {

    const user = await User.findById(req.user.id).select("+password"); 

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword); 

    if(!isPasswordMatched){
        return next(new ErrorHander("Old password is incorrect", 400)); 
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHander("Password does not match", 400)); 
    }

   user.password = req.body.newPassword; 

   await user.save(); 

   sendToken(user, 200, res); 
}); 


// update User Profile -- Admin
/*exports.updateProfile = catchAsyncErrors(async (req, res, next) => {
    
    const { name, email } = req.body; 

    if(!name || !email) {
        return next(new ErrorHander("Please Enter Email & Name", 400)); 
    }

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
        role: req.body.role,
    }; 

    // we will add cloudinary later 

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
        new: true, 
        runValidators: true, 
        useFindAndModify: false, 
    }); 

   res.status(200).json({
       success: true, 
   }); 

}); */

//Get all users(admin)

exports.getAllUser = catchAsyncErrors(async (req, res, next) => {
    const users = await User.find(); 

    res.status(200).json({
        success: true, 
            users,
    })
})

//Get single user (admin)
exports.getSingleUser = catchAsyncErrors(async (req, res, next) => {
    const user = await User.findById(req.params.id); 

    if(!user) {
        return next(
            new ErrorHander(`User does not exist with id: ${req.params.id}`)
        ); 
    }
    res.status(200).json({
        success: true, 
        user, 
    }); 
}); 



// update User Role -- Admin 
exports.updateUserRole = catchAsyncErrors(async (req,res,next) =>{
    const newUserData = {
        name: req.body.name, 
        email: req.body.email, 
        role: req.body.role, 
    }; 
    
    await User.findByIdAndUpdate(req.params.id, newUserData, {
        new: true, 
        runValidators: true, 
        useFindAndModify: false, 
    });

    res.status(200).json({
        succcess: true, 
    });
})


// Delete User -- Admin  

exports.deleteUser = catchAsyncErrors(async (req, res, next) => {
   
    const user = await User.findById(req.params.id);
      // we will remove cloudinary later 
  
     if (!user){
         return next(
             new ErrorHander(`User does not exist with Id: ${req.params.id}`)
         ); 
     }
     const imageId = user.avatar.public_id;

     await cloudinary.v2.uploader.destroy(imageId); 
     
     await user.remove(); 
  
     res.status(200).json({
         success: true, 
         message: "User Deleted Successfully"
        
     }); 
  });