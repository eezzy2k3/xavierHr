const mongoose = require("mongoose");

const mongoosePaginate = require("mongoose-paginate-v2");


mongoosePaginate.paginate.options = {
    limit: 20,
    useEstimatedCount: false,
    customLabels: {
      totalDocs: "totalDocs",
      docs: "docs",
      limit: "perPage",
      page: "currentPage",
      nextPage: "nextPage",
      prevPage: "prevPage",
      totalPages: "totalPages",
      pagingCounter: "serialNo",
      meta: "pagination",
    },
  };
  
  const leaveSchema = new mongoose.Schema(
    {
      fullName: {
        type: String,
      },
      email: {
        type: String,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company', 
      },
      leaveType: {
        type: String,
      },
      startDate: {
        type: String,
      },
      endDate: {
        type: String,
      },
      leaveDaysRequested: {
        type: Number,
      },
      reasonForLeave: {
        type: String,
      },
    
      
      relieverName: {
        type: String,
      },
      
    
      hrStatus: {
        type: String,
        default: "Pending",
      },
      
      hrApprovalDate: {
        type: String,
        default: "Not yet",
      },
   
      hrComment: {
        type: String,
      },
     
      displayPicture: {
        type: String,
      },
      availableLeaveDays: {
        type: Number,
      },
      leaveTaken: {
        type: Number,
      },
      leaveDayApproved: {
        type: Number,
        default:0
      },
    
    },
    { timestamps: true }
  );

  leaveSchema.plugin(mongoosePaginate);
const Leave = mongoose.model("Leave", leaveSchema);

module.exports = Leave;