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
  
  const votingSchema = new mongoose.Schema(
    {
        voter: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
          },
          nominatedUser: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
          },
          award: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Award', 
          },
         
          
      
    },
    { timestamps: true }
  );

  votingSchema.plugin(mongoosePaginate);
const Voting = mongoose.model("Voting", votingSchema);

module.exports = Voting;