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
  
  const leaderSchema = new mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company', 
          },
          employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
          },
          score: {
            type: Number,
          },
          numberOfAwards: {
            type: Number,
          },
         
          
      
    },
    { timestamps: true }
  );

  leaderSchema.plugin(mongoosePaginate);
const Leader = mongoose.model("Leader", leaderSchema);

module.exports = Leader;