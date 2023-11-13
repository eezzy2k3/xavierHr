const Company = require("../models/company")
const User = require("../models/user")
const Leave = require("../models/leave")
const Event = require("../models/event")
const Training = require("../models/training")
const CreateLeave = require("../models/createLeave")
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

const createEvent = asyncHandler(async(req,res,next)=>{
    if(req.user.role !== "HR"){
        return next(new ErrorResponse("You do not have permission to carry out this operation"));
    }
    const company = req.user.userId
    let {eventName,link,location,category,startDate,endDate,description} = req.body
    startDate = moment(startDate).format('YYYY MM DD')
    endDate = moment(endDate).format('YYYY MM DD')

    const file = req.file

    if(!file)  return next(new ErrorResponse(`Please upload event image`,400))
    
    const uploader = async (path) => await cloudinary.uploads(path , 'cevent')
    
    let url;
 
   
    
    const {path} = file
    
    const newPath = await uploader(path)
    
    url = newPath.url
    
    
    fs.unlinkSync(path)
    const event = await Event.create({eventName,link,location,company,category,startDate,endDate,description,image:url.toString()})
    res.status(201).json({success:true,msg:"successfully created an event",data:event})
})

const allEvents = asyncHandler(async(req,res,next)=>{
    const company = req.user.company
    const { page = 1, limit = 20, } = req.query
  
    let query = {company};
   
  
    const request = await Event.paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    res.status(200).json({success:true,msg:"successfully retrieved all events",data:request})
})

const allEventsHr = asyncHandler(async(req,res,next)=>{
    const company = req.user.userId
    const { page = 1, limit = 20, } = req.query
  
    let query = {company};
   
  
    const request = await Event.paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    res.status(200).json({success:true,msg:"successfully retrieved all events",data:request})
})

const deleteEvent = asyncHandler(async(req,res,next)=>{
    if(req.user.role !== "HR"){
        return next(new ErrorResponse("You do not have permission to carry out this operation"));
    }
    const eventId = req.params.event
    const event = await Event.findById(eventId)
    if(!event){
        return next(new ErrorResponse("This event does not not exist"));
    }
    if(event.company != req.user.userId){
        return next(new ErrorResponse("You do not have permission to carry out this operation"));
    }
    await Event.findByIdAndDelete(eventId)
    res.status(200).json({success:true,msg:"successfully deleted an event",data:{}})
})
const createTraining = asyncHandler(async(req,res,next)=>{
    if(req.user.role !== "HR"){
        return next(new ErrorResponse("You do not have permission to carry out this operation"));
    }
    const company = req.user.userId
    let {trainingName,link,location,category,date,description} = req.body
    date = moment(date).format('YYYY MM DD')

    const file = req.file

    if(!file)  return next(new ErrorResponse(`Please upload training image`,400))
    
    const uploader = async (path) => await cloudinary.uploads(path , 'cevent')
    
    let url;
 
   
    
    const {path} = file
    
    const newPath = await uploader(path)
    
    url = newPath.url
    
    
    fs.unlinkSync(path)
    const training = await Training.create({trainingName,link,location,company,category,date,description,image:url.toString()})
    res.status(201).json({success:true,msg:"successfully created a training",data:training})
})

const allTrainings = asyncHandler(async(req,res,next)=>{
    const company = req.user.company
    const { page = 1, limit = 20, } = req.query
  
    let query = {company};
   
  
    const request = await Training.paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    res.status(200).json({success:true,msg:"successfully retrieved all trainings",data:request})
})

const allTrainingsHr = asyncHandler(async(req,res,next)=>{
    const company = req.user.userId
    const { page = 1, limit = 20, } = req.query
  
    let query = {company};
   
  
    const request = await Training.paginate(query, {
      page,
      limit,
      sort: { createdAt: -1 },
    });
    res.status(200).json({success:true,msg:"successfully retrieved all trainings",data:request})
})

const deleteTraining = asyncHandler(async(req,res,next)=>{
    if(req.user.role !== "HR"){
        return next(new ErrorResponse("You do not have permission to carry out this operation"));
    }
    const trainingId = req.params.training
    const training = await Training.findById(trainingId)
    if(!training){
        return next(new ErrorResponse("This training does not not exist"));
    }
    if(training.company != req.user.userId){
        return next(new ErrorResponse("You do not have permission to carry out this operation"));
    }
    await Training.findByIdAndDelete(trainingId)
    res.status(200).json({success:true,msg:"successfully deleted a training",data:{}})
})

module.exports = {createEvent,allEvents,allEventsHr,createTraining,allTrainings,allTrainingsHr,deleteTraining,deleteEvent }