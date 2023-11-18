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

const companySchema = mongoose.Schema(
  {
    companyName: {
      type: String,
      Required: [true, "Please enter your company name"],
      
    },
    country: {
      type: String,
      Required: [true, "Please enter your country"],
      
    },
    industry: {
      type: String,
      Required: [true, "Please enter an industry"],
     
    },
    companyEmail: {
      type: String,
      Required: true,
      match: [
        /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/,
        "Please enter a valid email address",
      ],
      unique: true,
    },
    password: {
      type: String,
      Required: true,
      select: false,
    },
  
    phoneNumber: {
      type: String,
    },
    logo: {
      type: String,
    },
    jurisdiction: {
      type: String,
    },
    rcNo: {
      type: String,
    },
    taxIdNo: {
      type: String,
    },
    address: {
      type: String,
    },
    website: {
      type: String,
    },
    SubscriptionType: {
      type: String,
      enum:["earlyStage","startUp","growth"],
      default: "earlyStage",
    },
    isConfirmed:{
        type:Boolean,
        default:false
    },
    confirmationCode: String,
    role:{
      type:String,
      default:"HR"
  },

  },
  { timestamps: true }
);

companySchema.plugin(mongoosePaginate);
const Company = mongoose.model("Company", companySchema);

module.exports = Company;
