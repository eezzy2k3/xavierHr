const Company = require("../models/company")
const User = require("../models/user")
const Anonymous = require("../models/anonymous")
const Game = require("../models/game")
const Adventure = require("../models/adventure")
const Affirmation = require("../models/affirmation")
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
const cheerio = require('cheerio')
const axios = require('axios')


const allUsers = asyncHandler(async(req,res,next)=>{
    const company = req.user.company
    const users = await User.find({company})
    res.status(200).json({success:true,msg:"Users successfully retreived",data:users})

})

const allUsersHr = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You do not have permission to carry out this operation",400));
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
    return next(new ErrorResponse("You do not have permission to carry out this operation",400));
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
        return next(new ErrorResponse("You do not have permission to carry out this operation",400));
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
    return next(new ErrorResponse("You do not have permission to carry out this operation",400));
}
  const company = req.user.userId
  const active = await User.countDocuments({company,status:"Active"})
  const onboarding = await User.countDocuments({company,status:"Invited"})
  const deactivated = await User.countDocuments({company,status:"Deactivated"})
  const leave = await User.countDocuments({company,status:"Leave"})
  const total = await User.countDocuments({company})
  const engineering = await User.countDocuments({company,department:"Engineering"})
  const product = await User.countDocuments({company,department:"Product"})
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
    return next(new ErrorResponse("You do not have permission to carry out this operation",400));
}
  const userId = req.params.userId
  const user = await User.findById(userId)
  if (!user) {
    return next(new ErrorResponse("user does not exist",404));
  }
  if(user.company != req.user.userId){
    return next(new ErrorResponse("You do not have permission to carry out this operation",400));
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
        managerNumber,
        nextofKinRelationship,
        nationality
      } = req.body;
      const userId = req.user.userId
     

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
    return next(new ErrorResponse("You do not have permission to carry out this operation",400));
}
  const userId = req.params.userId
  const user = await User.findById(userId)
  if (!user) {
    return next(new ErrorResponse("user does not exist",404));
  }
  if(user.company != req.user.userId){
    return next(new ErrorResponse("You do not have permission to carry out this operation",400));
}

  res.status(200).json({success:true,msg:`You have successfully retreived an employee`,data:user})
})

const updateCompany = asyncHandler(async(req,res,next)=>{
 
  const {
    companyName,industry,country,phoneNumber,jurisdiction, rcNo,taxIdNo,address,website,companySize
    } = req.body;
    const userId = req.user.userId
   

    // check if user exist

    const user = await Company.findById(userId);

    // if no user found throw error
    if (!user) {
      return next(new ErrorResponse("Company does not exist",404));
    }
 
    if (phoneNumber) {
      user.phoneNumber = phoneNumber;
    }


    if (address) {
      user.address = address;
    }
    if ( industry) {
      user.industry = industry;
    }
    if (companyName) {
      user.companyName = companyName;
    }
    if (country) {
      user.country = country;
    }

    if (jurisdiction) {
      user.jurisdiction = jurisdiction;
    }

    if (rcNo) {
      user.rcNo = rcNo;
    }

    if (taxIdNo) {
      user.taxIdNo = taxIdNo;
    }



    if (website) {
      user.website =   website;
    }

    if (companySize) {
      user.companySize = companySize;
    }

   

  await user.save();
  res.status(200).json({success:true,msg:" successfully updated company profile",data:user})
})

const createAnonymous = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "Employee"){
    return next(new ErrorResponse("You do not have permission to carry out this operation",400));
}
  const message = req.body.message
  const company = req.user.company
  const anonymous = await Anonymous.create({message,company})
  res.status(201).json({success:true,msg:"Anonymous message created",data:anonymous})
})

const getMessage = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You do not have permission to carry out this operation",400));
}
    const company = req.user.userId
    const { page = 1, limit = 20, } = req.query;
    let query = {company};

    const message = await Anonymous.paginate(query, {
        page,
        limit,
        sort: { createdAt: -1 },
      });

      res.status(200).json({success:true,msg:"message successfully retreived",data:message})
})

const createGame = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You do not have permission to carry out this operation",400));
}
  const {name,link} = req.body
  const company = req.user.userId
  if (!(await isValidAndAccessibleURL(link))) {
    return next(new ErrorResponse("Invalid or inaccessible link",400));
  }
  const response = await axios.get(link);
  const $ = cheerio.load(response.data);
  
  const thumbnailUrl = $('meta[property="og:image"]').attr('content');

  const game = await Game.create({name,link,company,thumbnailUrl})
  res.status(201).json({success:true,msg:"game created",data:game})
})

async function isValidAndAccessibleURL(url) {
  try {
    const response = await axios.head(url);
    return response.status === 200;
  } catch (error) {
    return false;
  }
}

const createAdvanture = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You do not have permission to carry out this operation",400));
}
  let {name,venue, date} = req.body
  const company = req.user.userId
  date =  moment(date).format("YYYY-MM-DD");
  const adventure = await Adventure.create({name,venue,date,company})
  res.status(201).json({success:true,msg:"adventure created",data:adventure})
})

const getAdventureHr = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You do not have permission to carry out this operation",400));
}
    const company = req.user.userId
    const { page = 1, limit = 20, } = req.query;
    let query = {company};

    const adventure = await Adventure.paginate(query, {
        page,
        limit,
        sort: { createdAt: -1 },
      });

      res.status(200).json({success:true,msg:"message successfully retreived",data:adventure})
})

const getAdventureEmployee = asyncHandler(async(req,res,next)=>{
  
    const company = req.user.company
    const { page = 1, limit = 20, } = req.query;
    let query = {company};

    const adventure = await Adventure.paginate(query, {
        page,
        limit,
        sort: { createdAt: -1 },
      });

      res.status(200).json({success:true,msg:"message successfully retreived",data:adventure})
})

const createAffirmation = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You do not have permission to carry out this operation",400));
}
  const message = req.body.message
  const company = req.user.userId
  const affirmation = await Affirmation.create({message,company})
  res.status(201).json({success:true,msg:"Affirmation message created",data:affirmation})
})

const latestAffirmation = asyncHandler(async(req,res,next)=>{
  const company = req.user.company
  const affirmation = await Affirmation.findOne({company}).sort({ createdAt: -1 })
  res.status(200).json({success:true,msg:"Affirmation message retreived",data:affirmation})
})

const latestAffirmationHr = asyncHandler(async(req,res,next)=>{
  const company = req.user.userId
  const affirmation = await Affirmation.findOne({company}).sort({ createdAt: -1 })
  res.status(200).json({success:true,msg:"Affirmation message retreived",data:affirmation})
})

const allgamesEmployee = asyncHandler(async(req,res,next)=>{
  
  const company = req.user.company
  const { page = 1, limit = 20, } = req.query;
  let query = {company};

  const games = await Game.paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
    });

    res.status(200).json({success:true,msg:"games successfully retreived",data:games})
})

const allgamesHr = asyncHandler(async(req,res,next)=>{
  
  const company = req.user.userId
  const { page = 1, limit = 20, } = req.query;
  let query = {company};

  const games = await Game.paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
    });

    res.status(200).json({success:true,msg:"games successfully retreived",data:games})
})


module.exports = {allUsers,allUsersHr,updateHr,employeeMatrics,deactivate,updateEmployee,getUserHr,updateCompany,getMessage,createAnonymous,createGame,createAdvanture,getAdventureHr,getAdventureEmployee,createAffirmation,latestAffirmation,allgamesEmployee,allgamesHr,latestAffirmationHr}