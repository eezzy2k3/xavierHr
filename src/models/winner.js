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
  
  const winnerSchema = new mongoose.Schema(
    {
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company', 
          },
          winner: {
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

  winnerSchema.plugin(mongoosePaginate);
const Winner = mongoose.model("Winner", winnerSchema);

module.exports = Winner;