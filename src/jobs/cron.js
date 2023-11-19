const cron = require("node-cron")
const Company = require("../models/company")
const User = require("../models/user")
const Award = require("../models/award")
const Nominee = require("../models/nominee")
const Voting = require("../models/voting")
const Leave = require("../models/leave")
const Winner = require("../models/winner")
const Leader = require("../models/leader")
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
const mongoose = require("mongoose");

const task = cron.schedule('* * * * *', async(req,res) => {
    const award = await Award.find()
    const now = moment().format('YYYY MM DD HH mm')
    for(let i = 0; i<award.length; i++){
        if(now > award[i].endVoting && award[i].isWinner == false ){
            const highest = await  Voting.aggregate([
                {
                  $match: { award:new mongoose.Types.ObjectId(award[i]._id) },
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
                  $limit: 1,
                },
              ])
              if(highest.length > 0){
                const winner = highest[0]._id
                const point = award[i].point
                await Winner.create({company:award[i].company,winner,award:award[i]._id})
                const winnerCount = await Winner.countDocuments({winner})
                const leaderBoard = await Leader.findOne({employee:winner})
                if(leaderBoard){
                 leaderBoard.score = leaderBoard.score + point
                 leaderBoard.numberOfAwards = winnerCount
                 await leaderBoard.save()
                }else{
                 await Leader.create({company:award[i].company,employee:winner,score:point,numberOfAwards:winnerCount})
                }
                award[i].isWinner = true
            await award[i].save()
            console.log("There is a winner")
              }
        }
   }
    
  })

  const task2 = cron.schedule('0 0 * * *', async(req,res) => {
    const leaves = await Leave.find()
    const now = moment().format('YYYY MM DD HH mm')
    for(let i = 0; i<leaves.length; i++){
      const startDate = moment(leaves[i].startDate,'ddd MMM DD YYYY HH:mm:ss Z').format('YYYY MM DD HH mm')
      const endDate = moment(leaves[i].endDate,'ddd MMM DD YYYY HH:mm:ss Z').format('YYYY MM DD HH mm')
      if(now >= startDate && endDate > now && leaves[i].hrStatus == "Approved"){
        const userId = leaves[i].userId
        const user = await User.findById(userId)
        if(user.status == "Active"){
          user.status = "Leave"
        await user.save()
        console.log("employee status changed to Leave")
        }
        
       
      }
       
        
  }
})

const task3 = cron.schedule('0 0 * * *', async(req,res) => {
  const leaves = await Leave.find()
  const now = moment().format('YYYY MM DD HH mm')
  for(let i = 0; i<leaves.length; i++){
    const startDate = moment(leaves[i].startDate,'ddd MMM DD YYYY HH:mm:ss Z').format('YYYY MM DD HH mm')
    const endDate = moment(leaves[i].endDate,'ddd MMM DD YYYY HH:mm:ss Z').format('YYYY MM DD HH mm')
    if(now > startDate && now > endDate  && leaves[i].hrStatus == "Approved"){
      const userId = leaves[i].userId
      const user = await User.findById(userId)
      if(user.status == "Leave"){
        user.status = "Active"
        await user.save()
        console.log("employee status changed to Active")
      }
    
    }
     
      
}
})

  
  module.exports = {task,task2,task3}