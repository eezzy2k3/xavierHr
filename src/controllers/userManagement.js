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

module.exports = {allUsers,allUsersHr}