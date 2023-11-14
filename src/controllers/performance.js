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
    const { employee, reviewer, numberOftaskAssigned, numberOftaskCompleted,collaborationReview,collaborationComment,
        creativityReview, creativityComment,communicationReview,  communicationComment, timeManagementReview, timeManagementComment,problemSolvingReview, problemSolvingComment,quarter} = req.body
    const company = req.user.company
    const answer = collaborationReview +  creativityReview + communicationReview + timeManagementReview + problemSolvingReview
    const Rating = answer/5
    const averageRating = Number(Rating.toFixed(1))
    const review = await Review.create({employee, reviewer, numberOftaskAssigned, numberOftaskCompleted,collaborationReview,collaborationComment,
        creativityReview, creativityComment,communicationReview,  communicationComment, timeManagementReview, timeManagementComment,problemSolvingReview, problemSolvingComment,quarter,company,averageRating})
        const assigned = await AssignedTask.findOne({employee})
        if(assigned){
         assigned.taskAssigned = assigned.taskAssigned + numberOftaskAssigned
         assigned.taskCompleted =  assigned.taskCompleted + numberOftaskCompleted
         await assigned.save()
        }else{
         await AssignedTask.create({employee,taskAssigned:numberOftaskAssigned, taskCompleted:numberOftaskCompleted})
        }

        res.status(201).json({success:true,msg:`You have successfully  reviewed an assesment`,data:review})
})

const employeeReview = asyncHandler(async(req,res,next)=>{
    const reviewId = req.params.reviewId
    const { employeeCollaborationReview, employeeCollaborationComment,employeeCreativityReview,employeeCreativityComment, employeeCommunicationReview, employeeCommunicationComment,employeeTimeManagementReview,employeeTimeManagementComment,
        employeeProblemSolvingReview, employeeProblemSolvingComment} = req.body
        const review = await Review.findById(reviewId)
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


module.exports = {assignReview,reviewerReview,employeeReview}