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
  
  const adventureSchema = new mongoose.Schema(
    {
     
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company', 
      },
   
      
    
      
      name: {
        type: String,
      },
      venue: {
        type: String,
      },
      date: {
        type: String,
      },
      
    
    },
    { timestamps: true }
  );

  adventureSchema.plugin(mongoosePaginate);
const Adventure = mongoose.model("Adventure", adventureSchema);

module.exports = Adventure;