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
  
  const gameSchema = new mongoose.Schema(
    {
     
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company', 
      },
   
      
    
      
      name: {
        type: String,
      },
      link: {
        type: String,
      },
      
    
    },
    { timestamps: true }
  );

  gameSchema.plugin(mongoosePaginate);
const Game = mongoose.model("Game", gameSchema);

module.exports = Game;