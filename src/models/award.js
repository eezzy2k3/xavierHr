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
  
  const awardSchema = new mongoose.Schema(
    {
      name: {
        type: String,
      },
      description: {
        type: String,
      },

      reward: {
        type: String,
      },

      point: {
        type: Number,
      },
     
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company', 
      },
      NumberOfEmployee: {
        type: Number,
      },
      endNomination: {
        type: String,
      },
      endVoting: {
        type: String,
      },
      isWinner: {
        type: Boolean,
        default:false
      },
      
    },
    { timestamps: true }
  );

  awardSchema.plugin(mongoosePaginate);
const Award = mongoose.model("Award", awardSchema);

module.exports = Award;