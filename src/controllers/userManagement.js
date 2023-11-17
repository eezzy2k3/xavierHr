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
const moment = require("moment")


const allUsers = asyncHandler(async(req,res,next)=>{
    const company = req.user.company
    const users = await User.find({company})
    res.status(200).json({success:true,msg:"Users successfully retreived",data:users})

})

const allUsersHr = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You do not have permission to carry out this operation"));
}
    const company = req.user.userId
    const { page = 1, limit = 20, status } = req.query;
    let query = {company};
if(status){
    query.status = status
}

    const users = await User.paginate(query, {
        page,
        limit,
        sort: { createdAt: -1 },
      });

      res.status(200).json({success:true,msg:"Users successfully retreived",data:users})
})

const updateHr = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You do not have permission to carry out this operation"));
}
    const {
        phoneNumber,
        dob,
        department,
        jobRole,
        gender,
        address,
        nextofKin,
        nextofKinRelationship,
        nextofKinContact,
        nextofKinNumber,
        nextofKinEmail,
        middleName,
        fullName,
        managerFirstName,
        managerLastName,
        managerMiddleName,
        managerDepartment,
        managerJobRole,
        managerGender,
        managerEmail,
        managerContact,
        managerNumber,
        nationality
      } = req.body;
      const userId = req.params.userId

      // check if user exist

      const user = await User.findById(userId);

      // if no user found throw error
      if (!user) {
        return next(new ErrorResponse("user does not exist",404));
      }
      if(user.company != req.user.userId){
        return next(new ErrorResponse("You do not have permission to carry out this operation"));
    }
      if (phoneNumber) {
        user.phoneNumber = phoneNumber;
      }

      if (dob) {
        moment(dob).format("YYYY-MM-DD");
        user.dob = dob;
      }

      if (department) {
        user.department = department;
      }
      if (address) {
        user.address = address;
      }
      if ( nationality) {
        user.nationality = nationality;
      }
      if (nextofKin) {
        user.nextofKin = nextofKin;
      }
      if (nextofKinContact) {
        user.nextofKinContact = nextofKinContact;
      }

      if (nextofKinNumber) {
        user.nextofKinNumber = nextofKinNumber;
      }

      if (nextofKinEmail) {
        user.nextofKinEmail = nextofKinEmail;
      }

      if (gender) {
        user.gender = gender;
      }

      if (jobRole) {
        user.jobRole = jobRole;
      }

      if (middleName) {
        user.middleName = middleName;
      }

      if (fullName) {
        user.fullName = fullName;
      }

      if (managerFirstName) {
        user.managerFirstName =   managerFirstName;
      }

      if (managerLastName) {
        user.managerLastName = managerLastName;
      }

      if (managerMiddleName) {
        user.managerMiddleName = managerMiddleName;
      }

      if ( managerDepartment) {
        user.managerDepartment = managerDepartment;
      }

      if ( managerJobRole) {
        user.managerJobRole = managerJobRole;
      }

      if ( managerGender) {
        user.managerGender = managerGender;
      }

      if (managerEmail) {
        user.managerEmail = managerEmail;
      }

      if ( nextofKinRelationship) {
        user. nextofKinRelationship =  nextofKinRelationship;
      }

      if ( managerNumber) {
        user. managerNumber =  managerNumber;
      }

    await user.save();
    res.status(200).json({success:true,msg:"Users successfully updated an employee profile",data:user})
})

const employeeMatrics = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You do not have permission to carry out this operation"));
}
  const company = req.user.userId
  const active = await User.countDocuments({company,status:"Active"})
  const onboarding = await User.countDocuments({company,status:"Invited"})
  const deactivated = await User.countDocuments({company,status:"Deactivated"})
  const leave = await User.countDocuments({company,status:"Leave"})
  const total = await User.countDocuments({company})
  const engineering = await User.countDocuments({company,department:"Engineering"})
  const product = await User.countDocuments({company,status:"Product"})
  const growth = await User.countDocuments({company,department:"Growth"||"Strategy"})
  const marketing = await User.countDocuments({company,department:"Marketing"})
  const sales = await User.countDocuments({company,department:"Sales"})
  const notdefined = await User.countDocuments({company,department:null || undefined})
  const totalDepartment = 6
  const status = {active,onboarding,deactivated,leave,total}
  const department = {engineering,product,growth,marketing,sales,notdefined,totalDepartment}
  const data = {status,department}
  res.status(200).json({success:true,msg:`You have successfully retreived employee metrics`,data})
})

const deactivate = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You do not have permission to carry out this operation"));
}
  const userId = req.params.userId
  const user = await User.findById(userId)
  if (!user) {
    return next(new ErrorResponse("user does not exist",404));
  }
  if(user.company != req.user.userId){
    return next(new ErrorResponse("You do not have permission to carry out this operation"));
}
  user.isEmployed = false
  user.status = "Deactivated"
  await user.save()
  res.status(200).json({success:true,msg:`You have successfully deactivated ${user.fullName}`,data:user})
})

const updateEmployee = asyncHandler(async(req,res,next)=>{
 
    const {
        phoneNumber,
        dob,
        gender,
        address,
        nextofKin,
        nextofKinContact,
        nextofKinNumber,
        nextofKinEmail,
        managerFirstName,
        managerLastName,
        managerMiddleName,
        managerDepartment,
        managerJobRole,
        managerGender,
        managerEmail,
        managerContact,
        managerNumber,
        nextofKinRelationship,
        nationality
      } = req.body;
      // const userId = req.user.userId
      const userId = "653f5c12f825ead15e6c0a94"

      // check if user exist

      const user = await User.findById(userId);

      // if no user found throw error
      if (!user) {
        return next(new ErrorResponse("user does not exist",404));
      }
   
      if (phoneNumber) {
        user.phoneNumber = phoneNumber;
      }

      if (dob) {
        moment(dob).format("YYYY-MM-DD");
        user.dob = dob;
      }


      if (address) {
        user.address = address;
      }
      if ( nationality) {
        user.nationality = nationality;
      }
      if (nextofKin) {
        user.nextofKin = nextofKin;
      }
      if (nextofKinContact) {
        user.nextofKinContact = nextofKinContact;
      }

      if (nextofKinNumber) {
        user.nextofKinNumber = nextofKinNumber;
      }

      if (nextofKinEmail) {
        user.nextofKinEmail = nextofKinEmail;
      }

      if (gender) {
        user.gender = gender;
      }



      if (managerFirstName) {
        user.managerFirstName =   managerFirstName;
      }

      if (managerLastName) {
        user.managerLastName = managerLastName;
      }

      if (managerMiddleName) {
        user.managerMiddleName = managerMiddleName;
      }

      if ( managerDepartment) {
        user.managerDepartment = managerDepartment;
      }

      if ( managerJobRole) {
        user.managerJobRole = managerJobRole;
      }

      if ( managerGender) {
        user.managerGender = managerGender;
      }

      if (managerEmail) {
        user.managerEmail = managerEmail;
      }

      if ( nextofKinRelationship) {
        user. nextofKinRelationship =  nextofKinRelationship;
      }


      if ( managerNumber) {
        user. managerNumber =  managerNumber;
      }

    await user.save();
    res.status(200).json({success:true,msg:"Users successfully updated an employee profile",data:user})
})

const getUserHr = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You do not have permission to carry out this operation"));
}
  const userId = req.params.userId
  const user = await User.findById(userId)
  if (!user) {
    return next(new ErrorResponse("user does not exist",404));
  }
  if(user.company != req.user.userId){
    return next(new ErrorResponse("You do not have permission to carry out this operation"));
}

  res.status(200).json({success:true,msg:`You have successfully retreived an employee`,data:user})
})

module.exports = {allUsers,allUsersHr,updateHr,employeeMatrics,deactivate,updateEmployee,getUserHr}