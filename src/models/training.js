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
  
  const trainingSchema = new mongoose.Schema(
    {
      trainingName: {
        type: String,
      },
      link: {
        type: String,
      },
    location: {
        type: String
      },
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company', 
      },
      category: {
        type: String,
      },
      date: {
        type: String,
      },
     
      
      image: {
        type: String,
      },
      
    
      description: {
        type: String,
      },
      
    
    
    },
    { timestamps: true }
  );

  trainingSchema.plugin(mongoosePaginate);
const Training = mongoose.model("Training", trainingSchema);

module.exports = Training;