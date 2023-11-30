const Company = require("../models/company")
const User = require("../models/user")
const Award = require("../models/award")
const Nominee = require("../models/nominee")
const Voting = require("../models/voting")
const CreateLeave = require("../models/createLeave")
const Winner = require("../models/winner")
const Leader = require("../models/leader")
const AssignReview = require("../models/assignReview")
const Review = require("../models/review")
const AssignedTask = require("../models/assignedTask")
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

const assignReview = asyncHandler(async(req,res,next)=>{
    if(req.user.role !== "HR"){
        return next(new ErrorResponse("You do not have permission to carry out this operation"));
    }
    const employee = req.body.employee
    let {reviewer,quarter,endDate,startDate} = req.body
    const user = await User.findById(reviewer)
   const reviewerName = user.fullName
    startDate = moment(startDate).format('YYYY MM DD')
    endDate = moment(endDate).format('YYYY MM DD')

    for (let i = 0; i < employee.length; i += 1) {
       
        const company = req.user.userId
        const assignReview = await AssignReview.create(
          { employee: employee[i], reviewer,company,quarter,endDate,startDate },
        );
    }
    res.status(201).json({success:true,msg:`You have successfully assigned a review to ${reviewerName}`,data:reviewerName})
})

const reviewerReview = asyncHandler(async(req,res,next)=>{
    const reviewer = req.user.userId
    let { employee, numberOftaskAssigned, numberOftaskCompleted,collaborationReview,collaborationComment,
        creativityReview, creativityComment,communicationReview,  communicationComment, timeManagementReview, timeManagementComment,problemSolvingReview, problemSolvingComment,quarter,endDate,startDate} = req.body
        startDate = moment(startDate).format('YYYY MM DD')
        endDate = moment(endDate).format('YYYY MM DD')
        const company = req.user.company
    const answer = collaborationReview +  creativityReview + communicationReview + timeManagementReview + problemSolvingReview
    const Rating = answer/5
    const averageRating = Number(Rating.toFixed(1))
    const review = await Review.create({employee, reviewer, numberOftaskAssigned, numberOftaskCompleted,collaborationReview,collaborationComment,
        creativityReview, creativityComment,communicationReview,  communicationComment, timeManagementReview, timeManagementComment,problemSolvingReview, problemSolvingComment,quarter,company,averageRating,endDate,startDate})
        const assigned = await AssignedTask.findOne({employee})
        if(assigned){
         assigned.taskAssigned = assigned.taskAssigned + numberOftaskAssigned
         assigned.taskCompleted =  assigned.taskCompleted + numberOftaskCompleted
         await assigned.save()
        }else{
         await AssignedTask.create({employee,taskAssigned:numberOftaskAssigned, taskCompleted:numberOftaskCompleted,company})
        }

        res.status(201).json({success:true,msg:`You have successfully  reviewed an assesment`,data:review})
})

const employeeReview = asyncHandler(async(req,res,next)=>{
    const reviewId = req.params.reviewId
    const { employeeCollaborationReview, employeeCollaborationComment,employeeCreativityReview,employeeCreativityComment, employeeCommunicationReview, employeeCommunicationComment,employeeTimeManagementReview,employeeTimeManagementComment,
        employeeProblemSolvingReview, employeeProblemSolvingComment} = req.body
        const review = await Review.findById(reviewId)
        if (!review) {
            return next(new ErrorResponse("review does not exist",404));
          }
        if(req.user.userId != review.employee){
            return next(new ErrorResponse("You do not have permission to carry out this operation"));
        }

        review.employeeCollaborationReview = employeeCollaborationReview
        review.employeeCollaborationComment = employeeCollaborationComment
        review.employeeCreativityReview = employeeCreativityReview
        review.employeeCreativityComment = employeeCreativityComment
        review.employeeCommunicationReview = employeeCommunicationReview
        review.employeeCommunicationComment = employeeCommunicationComment
        review.employeeTimeManagementReview = employeeTimeManagementReview
        review.employeeTimeManagementComment = employeeTimeManagementComment
        review.employeeProblemSolvingReview = employeeProblemSolvingReview
        review.employeeProblemSolvingComment = employeeProblemSolvingComment

        await review.save()
        res.status(200).json({success:true,msg:`You have successfully created your assesment`,data:review})
})

const peerTopeer = asyncHandler(async(req,res,next)=>{
    const  reviewer = req.user.userId
    let query = {reviewer}
    const { page = 1, limit = 20, quater } = req.query;
    if(quater){
        query.quater = quater
    }
    const p2p = await AssignReview.paginate(query, {
        page,
        limit,
        sort: { createdAt: -1 },
        populate: { path: "employee", select: "fullName department displayPicture email jobRole averageRating status " },
          
      });
      res.status(200).json({success:true,msg:`You have successfully retreived your peer to peer`,data:p2p})
})

const myAssessment = asyncHandler(async(req,res,next)=>{
    const  employee = req.user.userId
    let query = {employee}
    const { page = 1, limit = 1, quarter } = req.query;
    if(quarter){
        query.quarter = quarter
    }
    const p2p = await Review.paginate(query, {
        page,
        limit,
        sort: { createdAt: -1 },
        populate: { path: "reviewer", select: "fullName department displayPicture jobRole" },
          
      });
      res.status(200).json({success:true,msg:`You have successfully retreived all your reviews`,data:p2p})
})

const employeeMatrics = asyncHandler(async(req,res,next)=>{
    const company = req.user.userId
    const male = await User.countDocuments({company,gender:"Male"})
    const female = await User.countDocuments({company,gender:"Female"})
    const notdefined = await User.countDocuments({company,gender:null||undefined})
    const total = await User.countDocuments({company})
    const data = {male,female,notdefined,total}
    res.status(200).json({success:true,msg:`You have successfully retreived employee metrics`,data})
})

const taskMetrics = asyncHandler(async(req,res,next)=>{
    const company = req.user.userId
    const task = await  AssignedTask.aggregate([
        {
          $match: {company :new mongoose.Types.ObjectId(company) },
        },
        {
            $group: {
                _id: null,
                totalAssigned: { $sum: '$taskAssigned' }, 
                totalCompleted: { $sum: '$taskCompleted' }, 
              },
        },
       
      ])
      const uncompleted = task[0].totalAssigned - task[0].totalCompleted
      const data = {totalAssigned:task[0].totalAssigned,totalCompleted:task[0].totalCompleted,uncompleted}
      console.log(task)
      res.status(200).json({success:true,msg:`You have successfully retreived employee metrics`,data})
})

const reviewHr = asyncHandler(async(req,res,next)=>{
    if(req.user.role !== "HR"){
        return next(new ErrorResponse("You do not have permission to carry out this operation"));
    }
    const  employee = req.params.employee
    const company = req.user.userId
    let query = {employee,company}
    const { page = 1, limit = 1, quater } = req.query;
    if(quater){
        query.quater = quater
    }
    const p2p = await Review.paginate(query, {
        page,
        limit,
        sort: { createdAt: -1 },
        populate: [
            { path: "employee", select: "fullName department displayPicture jobRole " },
            { path: "reviewer", select: "fullName department displayPicture jobRole " },
        ]
      });
      res.status(200).json({success:true,msg:`You have successfully retreived a review`,data:p2p})
})

const getApeerReview = asyncHandler(async(req,res,next)=>{
    const review = req.params.review
    const peerReview = await AssignReview.findById(review).populate({ path: "employee", select: "fullName department displayPicture email jobRole averageRating status " })
    if (!peerReview) {
        return next(new ErrorResponse("this peer to peer review does not exist",404));
      }
    if(req.user.userId != peerReview.reviewer){
        return next(new ErrorResponse("You do not have permission to carry out this operation"));
    }
    res.status(200).json({success:true,msg:`You have successfully retreived a review`,data:peerReview})
})

const performanceRate = asyncHandler(async (req, res, next) => {
    const employee = req.user.userId
    const [q1, q2, q3, q4] = await Promise.all([
      Review.findOne({
        quarter: "Q1",
        employee,
        $expr: {
          $eq: [{ $year: "$createdAt" }, new Date().getFullYear()],
        },
      }),
      Review.findOne({
        quarter: "Q2",
        employee,
        $expr: {
          $eq: [{ $year: "$createdAt" }, new Date().getFullYear()],
        },
      }),
      Review.findOne({
        quarter: "Q3",
        employee,
        $expr: {
          $eq: [{ $year: "$createdAt" }, new Date().getFullYear()],
        },
      }),
      Review.findOne({
        quarter: "Q4",
        employee,
        $expr: {
          $eq: [{ $year: "$createdAt" }, new Date().getFullYear()],
        },
      }),
    ]);
  
    const calculatePercent = (rating) => {
      return rating ? (rating.averageRating / 5) * 100 : 0;
    };
  
    const q1Percent = calculatePercent(q1);
    const q2Percent = calculatePercent(q2);
    const q3Percent = calculatePercent(q3);
    const q4Percent = calculatePercent(q4);
  
    const nonZeroPercentages = [q1Percent, q2Percent, q3Percent, q4Percent].filter((percent) => percent !== 0);
  
    const averagePerformance =
      nonZeroPercentages.length > 0
        ? nonZeroPercentages.reduce((sum, percent) => sum + percent, 0) / nonZeroPercentages.length
        : 0;
  
    const data = {
      q1Percent: Number(q1Percent.toFixed(2)),
      q2Percent: Number(q2Percent.toFixed(2)),
      q3Percent: Number(q3Percent.toFixed(2)),
      q4Percent: Number(q4Percent.toFixed(2)),
      averagePerformance: Number(averagePerformance.toFixed(2)),
    };
  
    res.status(200).json({ success: true, msg: `You have successfully retrieved performance rate`, data });
  });
  


module.exports = {assignReview,reviewerReview,employeeReview,peerTopeer,myAssessment,employeeMatrics,taskMetrics,reviewHr,getApeerReview,performanceRate}