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
  
  const assignReviewSchema = new mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company', 
          },
          employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
          },
          reviewer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
          },
          quarter: {
            type: String,
            enum: ["Q1","Q2","Q3","Q4"]
          },
        startDate: {
            type: String,
          },
          endDate: {
            type: String,
          },
         
          
      
    },
    { timestamps: true }
  );

  assignReviewSchema.plugin(mongoosePaginate);
const AssignReview = mongoose.model("AssignReview",  assignReviewSchema);

module.exports = AssignReview;