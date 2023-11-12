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
  
  const nomineeSchema = new mongoose.Schema(
    {
        nominator: {
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

  nomineeSchema.plugin(mongoosePaginate);
const Nominee = mongoose.model("Nominee", nomineeSchema);

module.exports = Nominee;