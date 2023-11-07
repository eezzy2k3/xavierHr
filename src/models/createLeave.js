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
  
  const leaveSchema = new mongoose.Schema(
    {
      leaveType: {
        type: String,
      },
      maximumDays: {
        type: Number,
      },
      company: {
        type: mongoose.Schema.Types.ObjectId,
      },
    },
    { timestamps: true }
  );

  leaveSchema.plugin(mongoosePaginate);
const CreateLeave = mongoose.model("CreateLeave", leaveSchema);

module.exports = CreateLeave;