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
  
  const anonymousSchema = new mongoose.Schema(
    {
     
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company', 
      },
   
      
    
      
      message: {
        type: String,
      },
      
    
    },
    { timestamps: true }
  );

  anonymousSchema.plugin(mongoosePaginate);
const Anonymous = mongoose.model("Anonymous", anonymousSchema);

module.exports = Anonymous;