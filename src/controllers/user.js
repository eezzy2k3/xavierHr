const Company = require("../models/company")
const User = require("../models/user")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sendMail = require("../utils/sendMail")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middlewares/asyncHandler")
const fs = require("fs")
const cloudinary = require("../utils/cloudinary")
const {generateOTP} = require("../utils/generateCode")
const {generatePassword} = require("../utils/generatePassword")


const registerCompany = asyncHandler( async(req,res,next)=>{
    
    let {companyName,industry,country,companyEmail,password,phoneNumber} = req.body

    const file = req.file

    if(!file)  return next(new ErrorResponse(`Please upload a company logo`,400))
    // check if email exist
    const checkMail = await Company.findOne({companyEmail})
    if(checkMail) return next(new ErrorResponse(`${companyEmail} has already been used by another company`,400))

    const uploader = async (path) => await cloudinary.uploads(path , 'company-logo')
    
    let url;
 
   
    
    const {path} = file
    
    const newPath = await uploader(path)
    
    url = newPath.url
    
    
    fs.unlinkSync(path)
const confirmationCode = generateOTP(6)
    
    // hash password
    password = await bcrypt.hash(password,12)

    const user =await  Company.create({logo:url.toString(),companyName,industry,country,companyEmail,password,phoneNumber,confirmationCode})

    if(!user)  return next(new ErrorResponse(`user could not be created`,500))

    const message = `<h1>Confirm your Email</h1>
            <h2>Hello ${user.companyName}</h2>
            <p>Use the confirmation code: ${user.confirmationCode} to confrim your Email by clicking on the link below</p>
            <a href=http://localhost:3000/confirmemail/${user._id}> Click here</a>
            </div>`

    // send token to email
    try{
       await sendMail({
            email:user.companyEmail,
            subject:"Confirmation Code",
            message
        })
    }catch(error){
        console.log(error.message)
        next(new ErrorResponse("message could not be sent",500))
    }

    res.status(201).json({success:true,msg:"successfully registered a company",data:user})
})

const confirmEmail =  asyncHandler( async(req,res,next)=>{
    
    let {confirmationCode} = req.body
    const {userId} = req.params

    const user = await Company.findById(userId);

    // if no user found throw error
    if (!user) {
        return next(new ErrorResponse("Company does not exist",404));
    }

    // if user is already confirmed throw error
    if (user.isConfirmed === true) {
        return next(new ErrorResponse("Company email already confirmed",400));
    }

    // check if confirmation code is valid

    if (confirmationCode.toString() !== user.confirmationCode) {
        return next(new ErrorResponse("Invalid confirmation code",400));
    }

    // set user confirmed to true
    user.isConfirmed = true;

    // delete confirmation code
    user.confirmationCode = undefined;

    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
        isEmployed: user.isEmployed,
        department: user.department,
        displayPicture: user.displayPicture,
        jobRole: user.jobRole,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({success:true,msg:"Email successfully confirmed",data:{user,token}})
    
 })

 const login =  asyncHandler( async(req,res,next)=>{
    
    const {companyEmail,password,email,type} = req.body
    if(!type){
      return next(new ErrorResponse("Please select a type",404));
    }

  let user;

  if(type == "company"){
    user = await Company.findOne({companyEmail: companyEmail.toLowerCase() }).select("+password");

  }else{
    user = await User.findOne({email: email.toLowerCase() }).select("+password");

  }
    

   
    // if no user found throw error
    if (!user) {
        return next(new ErrorResponse("Invalid credentials",404));
    }

   if(type == "employee"){
     // if user is not confirmed throw error
     if (user.isConfirmed === false) {
      return next(new ErrorResponse("Please confirm your account",400));
    }

    // if user has not set password throw error
    if (user.isPasswordSet === false) {
      return next(new ErrorResponse("Please set your password",400));
    }

    // if user is no more employed throw error
    if (user.isEmployed === false) {
      return next(new ErrorResponse("Please contact admin",400));
    }
   }

         

          // compare password
          const isValidPassword = await bcrypt.compare(password, user.password);

          if (!isValidPassword) {
            return next(new ErrorResponse("invalid credentials",400));
          }

          const token = jwt.sign(
            {
              userId: user._id,
              email: user.email,
              role: user.role,
              firstName: user.firstName,
              lastName: user.lastName,
              isEmployed: user.isEmployed,
              department: user.department,
              displayPicture: user.displayPicture,
              jobRole: user.jobRole,
            },
            process.env.JWT_SECRET,
            { expiresIn: "30d" }
          );

    res.status(200).json({success:true,msg:"User Successfully logged in",data:{token}})
    
 })

 const createUser = asyncHandler(async(req,res,next)=>{
    const email = req.body.email
  
    // check if an email is entered
    if (email.length < 1) {
      return next(new ErrorResponse("No email is provided"));
    }

    // check if an email is entered
    // if (email.length > 5) {
    //   throw new BadRequestError("you cannot create more than five accounts at a time");
    // }
    const createdUsers = [];
    for (let i = 0; i < email.length; i += 1) {
      // check if an email exist
      // eslint-disable no-await-in-loop
      const isEmail = await User.findOne({ email: email[i].toLowerCase() });
      if (isEmail) {
        return next(new ErrorResponse(`email ${email[i]} already exist`));
      }
      const company = req.user.userId
      const user = await User.create(
        { email: email[i].toLowerCase(), confirmationCode: generateOTP(6),company },
      );

      const message = `<h1>Confirm your Email</h1>
      <h2>Hello ${user.email}</h2>
      <p>Use the confirmation code: ${user.confirmationCode} to confrim your Email by clicking on the link below</p>
      <a href=http://localhost:3000/confirmemail/${user._id}> Click here</a>
      </div>`

// send token to email
try{
 await sendMail({
      email:user.email,
      subject:"Confirmation Code",
      message
  })
}catch(error){
  await this.User.findByIdAndDelete(user._id);
  console.log(`${user.email} is deleted`);
  console.log(error.message);
  next(new ErrorResponse("message could not be sent",500))
}
createdUsers.push(user);
    }
    res.status(201).json({success:true,msg:"successfully registered an employee",data:createdUsers})
 })

 const confirmUserEmail =  asyncHandler( async(req,res,next)=>{
    
    let {confirmationCode} = req.body
    const {userId} = req.params

    const user = await User.findById(userId);

    // if no user found throw error
    if (!user) {
        return next(new ErrorResponse("User does not exist",404));
    }

    // if user is already confirmed throw error
    if (user.isConfirmed === true) {
        return next(new ErrorResponse("Employee email already confirmed",400));
    }

    // check if confirmation code is valid

    if (confirmationCode.toString() !== user.confirmationCode) {
        return next(new ErrorResponse("Invalid confirmation code",400));
    }

    // set user confirmed to true
    user.isConfirmed = true;
    
    user.status = "Active"

    // delete confirmation code
    user.confirmationCode = undefined;

    await user.save();

    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
        name: user.name,
        isEmployed: user.isEmployed,
      },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    res.status(200).json({success:true,msg:"Email successfully confirmed",data:{user,token}})
    
 })

 
const updateEmployeeProfile = asyncHandler(async(req,res,next)=>{
    let { password,  fullName } = req.body
    const userId = req.user.userId
    const file = req.file

    if(!file)  return next(new ErrorResponse(`Please upload a company logo`,400))
    const uploader = async (path) => await cloudinary.uploads(path , 'display_picture')
    
    let url;
 
   
    
    const {path} = file
    
    const newPath = await uploader(path)
    
    url = newPath.url
    
    
    fs.unlinkSync(path)

    const user = await User.findById(userId);

    // if no user found throw error
    if (!user) {
      return next(new ErrorResponse("user does not exist"));
    }

    // if user is not confirmed throw error
    if (user.isConfirmed === false) {
      return next(new ErrorResponse("Please confirm your account"));
    }

    // if user has set password already throw error
    if (user.isPasswordSet === true) {
      return next(new ErrorResponse("password already set"));
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    password = hashedPassword;

    // set password
    user.password = password;

    //  change isPasswordSet status
    user.isPasswordSet = true;

    user.fullName = fullName;

    

    user.status = "Active";

    user.displayPicture = url.toString()

    await user.save();

    res.status(200).json({success:true,msg:"Employee information successfully updated",data:user})
})

const resetPassword = asyncHandler(async(req,res,next)=>{
  const { email } = req.body;

  if (!email) {
    return next(new ErrorResponse("Please provide an email"));
  }

  const user = await User.findOne({ email: email.toLowerCase() });

  // if no user found throw error
  if (!user) {
    return next(new ErrorResponse("user does not exist"));
  }
  const newPassword = generatePassword(12);

  // hash password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // set password
  user.password = hashedPassword;

  console.log(user)

  await user.save();

  const message = `<h1>Password Reset Successfully!</h1>
  <h2>Hello ${user.fullName}</h2>
  <p>Your password has been reset successfully, you can now use this password: ${newPassword} to login to your account and proceed to change it to your desired password.</p>
 `

  try{
    await sendMail({
         email:user.email,
         subject:"Password Reset",
         message
     })
   }catch(error){
     console.log(error.message);
     next(new ErrorResponse("message could not be sent",500))
   }
   res.status(200).json({success:true,msg:"Reset password email sent"})
})

const choosePlan = asyncHandler(async(req,res,next)=>{
  const { plan } = req.body
  const userId = req.user.userId
  const company = await Company.findById(userId)
  if(!company)  return next(new ErrorResponse("This Organisation does not exist"));
  company. SubscriptionType = plan
  await company.save()
  res.status(200).json({success:true,msg:"Subscription Plan successfully selected",data:company})
})




 



module.exports = {registerCompany,confirmEmail,login,createUser,updateEmployeeProfile,confirmUserEmail,resetPassword,choosePlan}