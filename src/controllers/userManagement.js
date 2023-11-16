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


const allUsers = asyncHandler(async(req,res,next)=>{
    const company = req.user.company
    const users = await User.find({company})
    res.status(200).json({success:true,msg:"Users successfully retreived",data:users})

})

const allUsersHr = asyncHandler(async(req,res,next)=>{
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
        nextofKinContact,
        nextofKinNumber,
        nextofKinEmail,
        middleName,
        firstName,
        lastName,
        managerFirstName,
        managerLastName,
        managerMiddleName,
        managerDepartment,
        managerJobRole,
        managerGender,
        managerEmail,
        managerContact,
        managerNumber
      } = req.body;
      const userId = req.params.userId

      // check if user exist

      const user = await User.findById(userId);

      // if no user found throw error
      if (!user) {
        throw new ResourceNotFoundError("user does not exist");
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

      if (managerContact) {
        user.managerContact= managerContact;
      }

      if ( managerNumber) {
        user. managerNumber =  managerNumber;
      }

    await user.save();
    res.status(200).json({success:true,msg:"Users successfully updated an employee profile",data:user})
})

module.exports = {allUsers,allUsersHr}