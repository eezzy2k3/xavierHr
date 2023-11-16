
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

const userSchema = mongoose.Schema(
  {
company:{
    type:mongoose.Schema.ObjectId,
    ref:"Company"
},
fullName: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["Male", "Female"],
  },
  phoneNumber: {
    type: String,
  },
  middleName: {
    type: String,
  },
  displayPicture: {
    type: String,
  },
nationality: {
    type: String,
  },
  dob: {
    type: String,
  },
  jobRole: {
    type: String,
  },
  department: {
    type: String,
  },
  address: {
    type: String,
  },
  nextofKinFirstName: {
    type: String,
  },
  nextofKinLastName: {
    type: String,
  },
  alternativeNumber: {
    type: String,
  },
  nextofKinContact: {
    type: String,
  },
  nextofKinNumber: {
    type: String,
  },
  managerFirstName: {
    type: String,
  },
  managerLastName: {
    type: String,
  },
  managerMiddleName: {
    type: String,
  },
 managerDepartment: {
    type: String,
  },
  managerJobRole: {
    type: String,
  },
  managerGender: {
    type: String,
  },
  managerEmail: {
    type: String,
  },
  managerContact: {
    type: String,
  },
  managerNumber: {
    type: String,
  },
  confirmationCode: String,
  email: {
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
  role: {
    type: String,
    enum: ["Employee", "Super-Admin", "Admin", "Supervisor"],
    default: "Employee",
  },
  status: {
    type: String,
    enum: ["Invited", "Active", "Deactivated"],
    default: "Invited",
  },
  isEmployed: {
    type: Boolean,
    default: true,
  },
  isConfirmed: {
    type: Boolean,
    default: false,
  },
  averageRating:{
    type:Number
  },
  nextofKinEmail: {
    type: String,
  },
  serviceDocument: [
    {
      title: {
        type: String,
      },
      content: {
        type: String,
      },
      uploadedAt: {
        type: String,
      },
    },
  ],
},
{ timestamps: true }
);

userSchema.plugin(mongoosePaginate);
const User = mongoose.model("User", userSchema);

module.exports = User;