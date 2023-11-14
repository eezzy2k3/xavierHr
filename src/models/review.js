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
  
  const reviewSchema = new mongoose.Schema(
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
         numberOftaskAssigned: {
            type: Number,
          },
          numberOftaskCompleted: {
            type: Number,
          },
          collaboration: {
            type: String,
            default:"Collaboration"
          },
          collaborationReview: {
            type: Number,
          },
         collaborationComment: {
            type: String,
          },
          employeeCollaborationReview: {
            type: Number,
          },
          employeeCollaborationComment: {
            type: String,
          },
          creativity: {
            type: String,
            default:"Creativity"
          },
          creativityReview: {
            type: Number,
          },
          creativityComment: {
            type: String,
          },
          employeeCreativityReview: {
            type: Number,
          },
          employeeCreativityComment: {
            type: String,
          },
        communication: {
            type: String,
            default:"Communication"
          },
          communicationReview: {
            type: Number,
          },
          communicationComment: {
            type: String,
          },
          employeeCommunicationReview: {
            type: Number,
          },
          employeeCommunicationComment: {
            type: String,
          },
        timeManagement: {
            type: String,
            default:"Time Management"
          },
          timeManagementReview: {
            type: Number,
          },
          timeManagementComment: {
            type: String,
          },
          employeeTimeManagementReview: {
            type: Number,
          },
          employeeTimeManagementComment: {
            type: String,
          },
          problemSolving: {
            type: String,
            default:"Problem Solving"
          },
          problemSolvingReview: {
            type: Number,
          },
          problemSolvingComment: {
            type: String,
          },
          employeeProblemSolvingReview: {
            type: Number,
          },
          employeeProblemSolvingComment: {
            type: String,
          },
          quarter: {
            type: String,
            enum: ["Q1","Q2","Q3","Q4"]
          },
          averageRating:{
            type:Number
          }
         
         
          
      
    },
    { timestamps: true }
  );

  reviewSchema.statics.getAverageRating = async function(employee) {
    const obj = await this.aggregate([
      {
        $match: { employee: new mongoose.Types.ObjectId(employee) }
      },
      {
        $group: {
          _id: '$employee',
          averageRating: { $avg: '$averageRating' }
        }
      }
    ])
  
    try {
      await this.model('User').findByIdAndUpdate(employee, {
        averageRating:obj[0].averageRating
      })
    } catch (err) {
      console.error(err);
    }
  }
  
  // Call getAverageCost after save
  reviewSchema.post('save', async function() {
    await this.constructor.getAverageRating(this.employee);
  })
  


  reviewSchema.plugin(mongoosePaginate);


const Review = mongoose.model("Review",  reviewSchema);

module.exports = Review;