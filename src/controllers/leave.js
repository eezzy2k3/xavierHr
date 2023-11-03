const Company = require("../models/company")
const User = require("../models/user")
const Leave = require("../models/leave")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const sendMail = require("../utils/sendMail")
const ErrorResponse = require("../utils/errorResponse")
const asyncHandler = require("../middlewares/asyncHandler")
const fs = require("fs")
const cloudinary = require("../utils/cloudinary")
const {generateOTP} = require("../utils/generateCode")


const createLeave = asyncHandler(async(req,res,next)=>{

    let {
        firstName,
        lastName,
        userId,
        startDate,
        endDate,
        linemanagerEmail,
        relieverEmail,
        relieverName,
        leaveType,
      } = payload;
      const name = `${firstName} ${lastName}`;
      const linemanager = await this.User.findOne({ email: linemanagerEmail });
      if (!linemanager) return next(new ErrorResponse("This line manager does not exist"));
      const linemanagerId = linemanager._id;
      startDate = new Date(startDate);
      if (startDate <= Date.now()) {
        // Start date is not valid
        return next(new ErrorResponse("Start date must be greater than the current date and time."));
      }
      endDate = new Date(endDate);
      if (endDate <= startDate) {
        // End date is not valid
        return next(new ErrorResponse("End date must be greater than the start date."));
      }
      const leaveDaysRequested = getWeekdayCount(startDate, endDate);
      let leavetaken;
      leavetaken = await this.LeaveTaken.findOne({ userId });
      if (!leavetaken) {
        leavetaken = await this.LeaveTaken.create({
          userId,
        });
      }
      let leaveTaken;
      let availableLeaveDays;
      if (leaveType === "Annual Leave") {
        availableLeaveDays = 20 - leavetaken.annaulLeaveTaken;
        leaveTaken = leavetaken.annaulLeaveTaken;
      }
      if (leaveType === "Casual Leave") {
        availableLeaveDays = 5 - leavetaken.casualLeaveTaken;
        leaveTaken = leavetaken.casualLeaveTaken;
      }
      if (leaveType === "Sick Leave") {
        availableLeaveDays = 5 - leavetaken.sickLeaveTaken;
        leaveTaken = leavetaken.sickLeaveTaken;
      }
      if (leaveType === "Study Leave") {
        availableLeaveDays = 5 - leavetaken.studyLeaveTaken;
        leaveTaken = leavetaken.studyLeaveTaken;
      }
      if (leaveType === "Parental Leave") {
        const user = await this.User.findOne({ _id: userId });
        const days = user.gender === "Male" ? 10 : 60;
        availableLeaveDays = days - leavetaken.parentalLeaveTaken;
        leaveTaken = leavetaken.parentalLeaveTaken;
      }
    
      if (leaveType === "Compassionate Leave") {
        availableLeaveDays = 5 - leavetaken.compassionateLeaveTaken;
        leaveTaken = leavetaken.compassionateLeaveTaken;
      }
    
      if (leaveDaysRequested > availableLeaveDays)
      return next(new ErrorResponse(`You have exceeded your leave limit for ${leaveType}`));
})
