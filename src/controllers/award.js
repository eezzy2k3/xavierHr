const Company = require("../models/company")
const User = require("../models/user")
const Award = require("../models/award")
const Nominee = require("../models/nominee")
const Voting = require("../models/voting")
const CreateLeave = require("../models/createLeave")
const Winner = require("../models/winner")
const Leader = require("../models/leader")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sendMail = require("../utils/sendMail")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middlewares/asyncHandler")
const fs = require("fs")
const cloudinary = require("../utils/cloudinary")
const {generateOTP} = require("../utils/generateCode")
const getWeekdayCount = require("../utils/weekDays")
const moment = require("moment")
const mongoose = require("mongoose");


const createAward = asyncHandler(async(req,res,next)=>{
    if(req.user.role !== "HR"){
        return next(new ErrorResponse("You do not have permission to carry out this operation"));
    }
    const company = req.user.userId
    let { name,description,NumberOfEmployee, endNomination, endVoting,reward,point} = req.body
    endNomination = moment(endNomination).format('YYYY MM DD HH mm')
    endVoting = moment(endVoting).format('YYYY MM DD HH mm')
    if(endNomination > endVoting){
        return next(new ErrorResponse("Nomination must close before voting start",400));
    }
    const award = await Award.create({name,description,NumberOfEmployee, endNomination,endVoting,company,reward,point })

    res.status(201).json({success:true,msg:"Award has successfully been created",data:award})
})

const nominate = asyncHandler(async(req,res,next)=>{
    if(req.user.role !== "Employee"){
        
            return next(new ErrorResponse("You cannot take part in this process",400)); 
        
    }
    const company = req.user.company
   const nominator = req.user.userId
    const  {nominatedUser,award} = req.body
    const mainAward = await Award.findById(award)
    if(!mainAward){
        return next(new ErrorResponse("This Award does not exist",400)); 
    }
    if(mainAward.company != company){
        return next(new ErrorResponse("You cannot take part in this process",400)); 
    }
    const now = moment().format('YYYY MM DD HH mm')
    const endNomination = mainAward.endNomination
    if(now > endNomination){
        return next(new ErrorResponse("Nomination closed!",400)); 
    }
    const ifNominated = await Nominee.findOne({nominator,award})
    if(ifNominated){
        return next(new ErrorResponse("You can only nominate once",400)); 
    }

    const nominee = await Nominee.create({nominatedUser,award,nominator})

    res.status(201).json({success:true,msg:"You have successfully nominated a nominee",data:nominee})
})

const vote = asyncHandler(async(req,res,next)=>{
    if(req.user.role !== "Employee"){
        return next(new ErrorResponse("You cannot take part in this process",400)); 
    }
    const company = req.user.company
    const voter = req.user.userId
    const  {nominatedUser,award} = req.body
    const mainAward = await Award.findById(award)
    if(!mainAward){
        return next(new ErrorResponse("This Award does not exist",400)); 
    }
    if(mainAward.company != company){
        return next(new ErrorResponse("You cannot take part in this process",400)); 
    }
    const now = moment().format('YYYY MM DD HH mm')
    console.log(now)
    
    const endVoting = mainAward.endVoting
    
    const endNomination = mainAward.endNomination
    
    if(endNomination>now){
        return next(new ErrorResponse("Nomination is still on going!",400)); 
    }
    if(now > endVoting){
        return next(new ErrorResponse("Voting closed!",400)); 
    }
    const ifVoted = await Voting.findOne({voter,award})
    if(ifVoted){
        return next(new ErrorResponse("You can only vote once",400)); 
    }
    const vote = await Voting.create({nominatedUser,award,voter})

    res.status(201).json({success:true,msg:"You have successfully voted a nominee",data:vote})
})

const getHighestNominee = asyncHandler(async(req,res,next)=>{
    const award = req.params.award
    const aw = await Award.findById(award)
    const company = aw.company
    if(req.user.userId != company && req.user.company != company){
        return next(new ErrorResponse("You are not a part of this organisation",400)); 
       }

   
    const limit = aw.NumberOfEmployee
   
  
  const highnominees = await  Nominee.aggregate([
        {
          $match: { award:new mongoose.Types.ObjectId(award) },
        },
        {
          $group: {
            _id: '$nominatedUser',
            totalVotes: { $sum: 1 },
          },
        },
        {
          $sort: { totalVotes: -1 },
        },
        {
          $limit: limit,
        },
      ])
     
      const populatedHighNominees = await User.populate(highnominees, { path: '_id', select: 'email fullName displayPicture department' });

      res.status(200).json({success:true,msg:`You have successfully retreived the ${limit} highest nominee`,data: populatedHighNominees})
})

const voteResult = asyncHandler(async(req,res,next)=>{
    const award = req.params.award

    const aw = await Award.findById(award)
   const company = aw.company
   if(req.user.userId != company && req.user.company != company){
    return next(new ErrorResponse("You are not a part of this organisation",400)); 
   }
const votes = await Voting.aggregate([
    {
      $match: { award: new mongoose.Types.ObjectId(award) },
    },
    {
      $group: {
        _id: '$nominatedUser',
        totalVotes: { $sum: 1 },
      },
    },
    {
      $group: {
        _id: null,
        total: { $sum: '$totalVotes' }, 
        nominees: { $push: { nominatedUser: '$_id', totalVotes: '$totalVotes' } },
      },
    },
    {
      $unwind: '$nominees',
    },
    {
      $project: {
        _id: '$nominees.nominatedUser',
        totalVotes: '$nominees.totalVotes',
        percentage: {
          $multiply: [
            { $divide: ['$nominees.totalVotes', '$total'] }, 
            100,
          ],
        },
      },
    },
    {
      $sort: { totalVotes: -1 },
    },
  ]);
  
 
  
      const populatedHighNominees = await User.populate(votes, { path: '_id', select: 'email fullName displayPicture department' });

      res.status(200).json({success:true,msg:`You have successfully retreived votes result`,data: populatedHighNominees})
})

const leaderBoard = asyncHandler(async(req,res,next)=>{
  const company = req.user.company
  const query = {company}
  const leaders = await Leader.paginate(query, {
    page : 1,
    limit : 10,
    sort: { score: -1 },
    populate: { path: "employee", select: "fullName displayPicture department" },
  });
  res.status(200).json({success:true,msg:`You have successfully retreived leadership board`,data: leaders})
})

const leaderBoardHr = asyncHandler(async(req,res,next)=>{
  const company = req.user.userId
  const query = {company}

  const leaders = await Leader.paginate(query, {
    page :1,
    limit : 10,
    sort: { score: -1 },
    populate: { path: "employee", select: "fullName displayPicture department email" },
  });
  res.status(200).json({success:true,msg:`You have successfully retreived leadership board`,data: leaders})
})

const employeeAwardDashboard = asyncHandler(async(req,res,next)=>{
  const employee = req.user.userId
 
  const company = req.user.company
 
  const [awardWon, totalAward,leader] = await Promise.all([
    Winner.countDocuments({winner:employee}),
    Award.countDocuments({company}),
    Leader.findOne({employee})
  ]);
  let point
  if(leader){
    point = leader.score
  }else{
    point = 0
  }
 
  const data = {
    awardWon,
    totalAward,
    point
  }
  res.status(200).json({success:true,msg:`You have successfully retreived employee award dashboard`,data})
})

const resetAward = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You cannot carry out this operation",400)); 
  }
  const award = req.params.award
  const aw = await Award.findById(award)
  if(!aw){
    return next(new ErrorResponse("This award does not exist",400)); 
  }
if(aw.company != req.user.userId){
  return next(new ErrorResponse("You cannot carry out this operation",400)); 
}
const now = moment().format('YYYY MM DD HH mm')
const endVoting = aw.endVoting
if(now > endVoting){
  return next(new ErrorResponse("You cannot carry out this operation as voting as ended and winner emerged",400)); 
}
  const reset = await Voting.deleteMany({award})
  res.status(200).json({success:true,msg:`You have successfully reset the voting`,data:{}})
})

const winners = asyncHandler(async(req,res,next)=>{
  const company = req.user.company
  let query = {company}

  const {startDate,endDate} = req.query
  if (startDate && endDate) {
    query.createdAt = { $gte: startDate, $lte: endDate };
  }
  const winners = await Winner.paginate(query, {
    page :1,
    limit : 10,
    sort: { createdAt: -1 },
    populate: [
      { path: "award", select: "name description reward point" },
      { path: "winner", select: "fullName department displayPicture" },
    ]
  });

  res.status(200).json({success:true,msg:`You have successfully retreived all winners`,data:winners})
})

const recentWinner  = asyncHandler(async(req,res,next)=>{
  

  const latestAward = await Winner.findOne({ company: req.user.company })
  .sort({ createdAt: -1 })
  .populate({ path: "award", select: "name description reward point" })
  .populate({ path: "winner", select: "fullName department displayPicture" })
  

  res.status(200).json({success:true,msg:`You have successfully retreived recent winner`,data:latestAward})
})

const latestAward = asyncHandler(async(req,res,next)=>{
  

  const latestAward = await Award.findOne({ company: req.user.company })
  .sort({ createdAt: -1 })
  

  res.status(200).json({success:true,msg:`You have successfully retreived recent award`,data:latestAward})
})

const yournominee = asyncHandler(async(req,res,next)=>{
  
const award = req.params.award
const nominator = req.user.userId
  const nominee = await Nominee.findOne({ award,nominator })
  .populate({ path: "nominatedUser", select: "fullName department displayPicture" });
 
  

  res.status(200).json({success:true,msg:`You have successfully retreived your nominee`,data: nominee})
})

const latestAwardHr = asyncHandler(async(req,res,next)=>{
  

  const latestAward = await Award.findOne({ company: req.user.userId })
  .sort({ createdAt: -1 })
  

  res.status(200).json({success:true,msg:`You have successfully retreived recent award`,data:latestAward})
})

const latestwinnerHr = asyncHandler(async(req,res,next)=>{
  

  const latestAward = await Winner.findOne({ company: req.user.userId })
  .sort({ createdAt: -1 })
  .populate({ path: "award", select: "name description reward point" })
  .populate({ path: "winner", select: "fullName department displayPicture" })
  

  res.status(200).json({success:true,msg:`You have successfully retreived recent winner`,data:latestAward})
})

const winnersHr = asyncHandler(async(req,res,next)=>{
  const company = req.user.userId
  let query = {company}

  const {startDate,endDate} = req.query
  if (startDate && endDate) {
    query.createdAt = { $gte: startDate, $lte: endDate };
  }
  const winners = await Winner.paginate(query, {
    page :1,
    limit : 10,
    sort: { createdAt: -1 },
    populate: [
      { path: "award", select: "name description reward point" },
      { path: "winner", select: "fullName department displayPicture" },
    ]
  });

  res.status(200).json({success:true,msg:`You have successfully retreived all winners`,data:winners})
})

const totalAward = asyncHandler(async(req,res,next)=>{
  const company = req.user.userId
  const total = await Award.countDocuments({company})
  res.status(200).json({success:true,msg:`You have successfully retreived total awards created`,data:total})
})

const votingStatistic = asyncHandler(async(req,res,next)=>{
  const award = req.params.award
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You cannot carry out this operation",400)); 
  }
  const allVoters = await Voting.find({award}).select('-nominatedUser -award -createdAt -updatedAt').populate({ path: "voter", select: "displayPicture" })
  const numberofvoters = allVoters.length
  const employeeThatNominated = await Nominee.find({award}).select('-nominatedUser -award -createdAt -updatedAt').populate({ path: "nominator", select: "displayPicture" })
  const numberofemployeeThatNominated  = employeeThatNominated.length
  const nominatedUserIds = await Nominee.find({ award })
  .distinct('nominatedUser');

const nominatedEmployee = await User.find({ _id: { $in: nominatedUserIds } })
  .select('displayPicture');

  const numberofNominatedEmployee = nominatedEmployee.length
  const data = {allVoters,numberofvoters,employeeThatNominated,numberofemployeeThatNominated ,nominatedEmployee,numberofNominatedEmployee}
  res.status(200).json({success:true,msg:`You have successfully retreived voting statistic`,data})
})






module.exports = {createAward,nominate,getHighestNominee,vote,voteResult,leaderBoardHr,leaderBoard,employeeAwardDashboard,resetAward,winners,recentWinner,latestAward,yournominee,latestAwardHr,latestwinnerHr,winnersHr,totalAward,winnersHr,votingStatistic}