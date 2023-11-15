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
  
  const taskSchema = new mongoose.Schema(
    {
          employee: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User', 
          },
          company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company', 
          },
          taskAssigned: {
            type: Number,
          },
          taskCompleted: {
            type: Number,
          },
         
          
      
    },
    { timestamps: true }
  );

  taskSchema.plugin(mongoosePaginate);
const AssignedTask = mongoose.model("AssignedTask", taskSchema);

module.exports = AssignedTask;