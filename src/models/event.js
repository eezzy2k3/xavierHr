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
  
  const eventSchema = new mongoose.Schema(
    {
      eventName: {
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
      startDate: {
        type: String,
      },
      endDate: {
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

  eventSchema.plugin(mongoosePaginate);
const Event = mongoose.model("Event", eventSchema);

module.exports = Event;