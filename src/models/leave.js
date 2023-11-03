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
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      userId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      leaveType: {
        type: String,
      },
      startDate: {
        type: String,
      },
      endDate: {
        type: String,
      },
      leaveDaysRequested: {
        type: Number,
      },
      reasonForLeave: {
        type: String,
      },
      contactName: {
        type: String,
      },
      contactEmail: {
        type: String,
      },
      contactNumber: {
        type: String,
      },
      jobRole: {
        type: String,
      },
      department: {
        type: String,
        enum: ["Operations", "Sales", "Engineering", "Product", "Growth", "Marketing", "Agent"],
      },
      relieverName: {
        type: String,
      },
      relieverEmail: {
        type: String,
      },
      relieverId: {
        type: mongoose.Schema.Types.ObjectId,
      },
      linemanagerName: {
        type: String,
      },
      linemanagerEmail: {
        type: String,
      },
      linemanagerId: {
        type: mongoose.Schema.Types.ObjectId,
      },
  
      linemanagerStatus: {
        type: String,
        default: "Pending",
      },
      hrStatus: {
        type: String,
        default: "Pending",
      },
      relieverStatus: {
        type: String,
        default: "Pending",
      },
      linemanagerApprovalDate: {
        type: String,
        default: "Not yet",
      },
      hrApprovalDate: {
        type: String,
        default: "Not yet",
      },
      relieverApprovalDate: {
        type: String,
        default: "Not yet",
      },
      status: {
        type: String,
        default: "Pending",
      },
      linemanagerComment: {
        type: String,
      },
      hrComment: {
        type: String,
      },
      relieverComment: {
        type: String,
      },
      displayPicture: {
        type: String,
      },
      availableLeaveDays: {
        type: Number,
      },
      leaveTaken: {
        type: String,
      },
      alternativeNumber: {
        type: String,
      },
    },
    { timestamps: true }
  );

  leaveSchema.plugin(mongoosePaginate);
const Leave = mongoose.model("Leave", userSchema);

module.exports = Leave;