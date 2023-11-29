const Company = require("../models/company")
const User = require("../models/user")
const Leave = require("../models/leave")
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



const createLeave = asyncHandler(async(req,res,next)=>{

    let {
        startDate,
        endDate,
        relieverName,
        leaveType,
        reason
      } = req.body
      startDate = moment(startDate).format('YYYY MM DD');
      endDate = moment(endDate).format('YYYY MM DD');
      const fullName = req.user.fullName
      const userId = req.user.userId
      const company = req.user.company
      const email = req.user.email
      const displayPicture = req.user.displayPicture
      startDate = new Date(startDate);
      if (startDate <= Date.now()) {
        // Start date is not valid
        return next(new ErrorResponse("Start date must be greater than the current date and time.",400));
      }
      endDate = new Date(endDate);
      if (endDate <= startDate) {
        // End date is not valid
        return next(new ErrorResponse("End date must be greater than the start date.",400));
      }
      const companyDetails = await Company.findById(company)
      const companyEmail = companyDetails.companyEmail
      const leaveDaysRequested = getWeekdayCount(startDate, endDate);
      let leavetaken;
      leavetaken = await Leave.find({ leaveType,userId });
      if (leavetaken.length < 1) {
        let maximumDays = await CreateLeave.findOne({leaveType,company})
        maximumDays = maximumDays.maximumDays
  
        
      
        if (leaveDaysRequested > maximumDays) return next(new ErrorResponse(`You have exceeded the leave limit for ${leaveType}`,400));
        const leaveRequest = await Leave.create({startDate,endDate,relieverName,reason, leaveDaysRequested,
            leaveType,fullName,userId,company,email,displayPicture,leaveTaken:0})

            const message = `<h1>HR Approval Required</h1>
            <p>Hi HR</p>
            <p>A leave request from ${fullName} is awaiting your approval.</p>
            <p>Leave Details:</p>
            <ul>
                <li>Requested Dates: ${startDate} to ${endDate}</li>
                <li>Type of Leave: ${leaveType}</li>
            </ul>
            <footer>
            <p>@ Xavier Hr team | All rights reserved.</p>
            <p>1st Floor, Xavier House, 350 Borno Way, Yaba Lagos</p>
            <p>Terms | Privacy Policy</p>
        </footer>
           `
            try{
             await sendMail({
                  email:companyEmail,
                  subject:`Leave Approval required`,
                  message
              })
            }catch(error){
              console.log(error.message);
              next(new ErrorResponse("message could not be sent",500))
            }
    
            res.status(201).json({success:true,msg:"successfully created a leave",data:leaveRequest})
      }

      let totalDaysTaken = 0;

  // Calculate the total days taken for the specific leave type
  for (const request of  leavetaken) {
    totalDaysTaken += request.leaveDayApproved;
  }

    
      const lvType = await CreateLeave.findOne({leaveType,company})
      const max = lvType.maximumDays

      const total = totalDaysTaken + leaveDaysRequested
    
      if (total > max)
      return next(new ErrorResponse(`You have exceeded your leave limit for ${leaveType}`,400));
      const leaveRequest = await Leave.create({startDate,endDate,relieverName,reason,leaveDaysRequested,
        leaveType,fullName,userId,company,email,displayPicture,leaveTaken:totalDaysTaken})

        const message = `<h1>HR Approval Required</h1>
        <p>Hi HR</p>
        <p>A leave request from ${fullName} is awaiting your approval.</p>
        <p>Leave Details:</p>
        <ul>
            <li>Requested Dates: ${startDate} to ${endDate}</li>
            <li>Type of Leave: ${leaveType}</li>
        </ul>
        <footer>
            <p>@ Xavier Hr team | All rights reserved.</p>
            <p>1st Floor, Xavier House, 350 Borno Way, Yaba Lagos</p>
            <p>Terms | Privacy Policy</p>
        </footer>
       `
        try{
         await sendMail({
              email:companyEmail,
              subject:`Leave Approval required`,
              message
          })
        }catch(error){
          console.log(error.message);
          next(new ErrorResponse("message could not be sent",500))
        }

        res.status(201).json({success:true,msg:"successfully created a leave",data:leaveRequest})
})

const createLeaveType = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You do not have permission to carry out this operation"));
}
    const {leaveType,maximumDays} = req.body
    const company = req.user.userId
    const createLeave = await CreateLeave.create({leaveType,maximumDays,company})
    res.status(201).json({success:true,msg:"successfully created a new leave type",data:createLeave})
})

const typeOfLeave = asyncHandler(async(req,res,next)=>{

    const company = req.user.company
    const createLeave = await CreateLeave.find({company})
    res.status(200).json({success:true,msg:"successfully retrieved all leave types",data:createLeave})
})

const pendingHr = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You do not have permission to carry out this operation"));
}
  const company = req.user.userId
  const { page = 1, limit = 20, status, startDate, endDate } = req.query

  let query = {company};
  query.hrStatus = "Pending"

  if (startDate && endDate) {
    query.createdAt = { $gte: startDate, $lte: endDate };
  }

  const request = await Leave.paginate(query, {
    page,
    limit,
    sort: { createdAt: -1 },
  });
  
  if (!request.docs || request.docs.length === 0) {
    let data = request.docs
    res.status(200).json({
      success: true,
      msg: "No leave requests found for the specified criteria",
      data
    });
  } else {
    const paginatedLeave = await Promise.all(
      request.docs.map(async (leave) => {
        const { userId, leaveType } = leave; // Extract user ID and leave type from the paginated result
  
        const lvType = await CreateLeave.findOne({ leaveType, company });
        const leavetaken = await Leave.find({ leaveType, userId });
  
        let totalDaysTaken = 0;
  
        // Calculate the total days taken for the specific leave type
        for (const request of leavetaken) {
          totalDaysTaken += request.leaveDayApproved;
        }
  
        const max = lvType?.maximumDays;
        const daysleft = max - totalDaysTaken;
  
        return {
          ...leave.toObject(),
          totalDaysTaken,
          max,
          daysleft,
        };
      })
    );
  
    res.status(200).json({
      success: true,
      msg: "successfully retrieved paginated leave requests with daysleft",
      data: paginatedLeave,
    });
  }
  
})

const approvedHr = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You do not have permission to carry out this operation"));
}
  const company = req.user.userId
  const { page = 1, limit = 20, status, startDate, endDate } = req.query

  let query = {company};
  query.hrStatus = "Approved"

  if (startDate && endDate) {
    query.createdAt = { $gte: startDate, $lte: endDate };
  }

  const request = await Leave.paginate(query, {
    page,
    limit,
    sort: { createdAt: -1 },
  });
  
  if (!request.docs || request.docs.length === 0) {
    let data = request.docs
    res.status(200).json({
      success: true,
      msg: "No leave requests found for the specified criteria",
      data
    });
  } else {
    const paginatedLeave = await Promise.all(
      request.docs.map(async (leave) => {
        const { userId, leaveType } = leave; // Extract user ID and leave type from the paginated result
  
        const lvType = await CreateLeave.findOne({ leaveType, company });
        const leavetaken = await Leave.find({ leaveType, userId });
  
        let totalDaysTaken = 0;
  
        // Calculate the total days taken for the specific leave type
        for (const request of leavetaken) {
          totalDaysTaken += request.leaveDayApproved;
        }
  
        const max = lvType?.maximumDays;
        const daysleft = max - totalDaysTaken;
  
        return {
          ...leave.toObject(),
          totalDaysTaken,
          max,
          daysleft,
        };
      })
    );
  
    res.status(200).json({
      success: true,
      msg: "successfully retrieved paginated leave requests with daysleft",
      data: paginatedLeave,
    });
  }
  
})

const rejectedHr = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You do not have permission to carry out this operation"));
}
  const company = req.user.userId
  const { page = 1, limit = 20, status, startDate, endDate } = req.query

  let query = {company};
  query.hrStatus = "Rejected"

  if (startDate && endDate) {
    query.createdAt = { $gte: startDate, $lte: endDate };
  }

  const request = await Leave.paginate(query, {
    page,
    limit,
    sort: { createdAt: -1 },
  });
  
  if (!request.docs || request.docs.length === 0) {
    let data = request.docs
    res.status(200).json({
      success: true,
      msg: "No leave requests found for the specified criteria",
      data
    });
  } else {
    const paginatedLeave = await Promise.all(
      request.docs.map(async (leave) => {
        const { userId, leaveType } = leave; // Extract user ID and leave type from the paginated result
  
        const lvType = await CreateLeave.findOne({ leaveType, company });
        const leavetaken = await Leave.find({ leaveType, userId });
  
        let totalDaysTaken = 0;
  
        // Calculate the total days taken for the specific leave type
        for (const request of leavetaken) {
          totalDaysTaken += request.leaveDayApproved;
        }
  
        const max = lvType?.maximumDays;
        const daysleft = max - totalDaysTaken;
  
        return {
          ...leave.toObject(),
          totalDaysTaken,
          max,
          daysleft,
        };
      })
    );
  
    res.status(200).json({
      success: true,
      msg: "successfully retrieved paginated leave requests with daysleft",
      data: paginatedLeave,
    });
  }
  
})

const updateHr = asyncHandler(async(req,res,next)=>{
  if(req.user.role !== "HR"){
    return next(new ErrorResponse("You do not have permission to carry out this operation"));
}
  const {status,comment} = req.body
 const leaveId = req.params.id
  const request = await Leave.findById(leaveId)
 
  if (!request) {
    return next(new ErrorResponse("request does not exist",400));
  }
  if(request.company != req.user.userId){
    return next(new ErrorResponse("You do not have permission to carry out this operation"));
  }
  if(status === "Approved"){
    request.hrStatus = "Approved";
    request.hrApprovalDate = moment().format("YYYY-MM-DD HH:mm:ss");
    request.leaveDayApproved = request.leaveDaysRequested
  }
 if(status === "Rejected"){
  request.hrStatus = "Rejected"
  request.hrApprovalDate = moment().format("YYYY-MM-DD HH:mm:ss");
  request.hrComment = comment;
 }
 const message = ` <h1>Your leave request has been ${status}</h1>
 <p>Dear ${request.fullName},</p>
 <p>We are writing to inform you that your leave request has been ${status} by HR.</p>
 ${
   status === "Rejected"
     ? `<p>Reason for rejection: ${comment}</p>`
     : ""
 }
 <p>Please contact HR for further assistance or if you have any questions.</p>
 <footer>
 <p>@ Xavier Hr team | All rights reserved.</p>
 <p>1st Floor, Xavier House, 350 Borno Way, Yaba Lagos</p>
 <p>Terms | Privacy Policy</p>
</footer>
`
 try{
  await sendMail({
       email:request.email,
       subject:`Leave ${status}`,
       message
   })
 }catch(error){
   console.log(error.message);
   next(new ErrorResponse("message could not be sent",500))
 }
await request.save()
res.status(200).json({success:true,msg:"successfully updated leave status",data:request})
})

const employeeLeave = asyncHandler(async(req,res,next)=>{
  const userId = req.user.userId
  const { page = 1, limit = 20, status, startDate, endDate } = req.query

  let query = {userId};
  if(status){
    query.status = status
  }

  if (startDate && endDate) {
    query.createdAt = { $gte: startDate, $lte: endDate };
  }

  const request = await Leave.paginate(query, {
    page,
    limit,
    sort: { createdAt: -1 },
  });
  res.status(200).json({success:true,msg:"successfully retrieved all leaves",data:request})
})

const summary = asyncHandler(async(req,res,next)=>{
  const {userId,company} = req.user
  const leaveType = req.query.leaveType
  let summary = {}
  const lvType = await CreateLeave.findOne({leaveType,company})
 const leavetaken = await Leave.find({ leaveType,userId });
 if(!leavetaken){
  summary.totalDays = lvType?.maximumDays
  summary.appliedDays = 0
  summary.daysleft = lvType?.maximumDays
  summary.rejected = 0
  res.status(200).json({success:true,msg:"successfully retrieved leave summary",data:summary})
 }
 const rejected = await Leave.countDocuments({ leaveType,userId,hrStatus:"Rejected"})

 let totalDaysTaken = 0;

 // Calculate the total days taken for the specific leave type
 for (const request of  leavetaken) {
   totalDaysTaken += request.leaveDayApproved;
 }

 
 const max = lvType?.maximumDays

 const daysleft = max - totalDaysTaken
 summary.totalDays = lvType?.maximumDays
 summary.appliedDays = totalDaysTaken
 summary.daysleft = daysleft
 summary.rejected = rejected
 res.status(200).json({success:true,msg:"successfully retrieved leave summary",data:summary})
})


module.exports = {createLeave,createLeaveType,typeOfLeave,pendingHr,approvedHr,rejectedHr,updateHr,employeeLeave,summary }