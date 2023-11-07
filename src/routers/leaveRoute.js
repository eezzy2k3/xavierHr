const express = require("express")
const { createLeave,createLeaveType,typeOfLeave,pendingHr,rejectedHr,approvedHr,updateHr,employeeLeave,summary} = require("../controllers/leave")
const {authorize,access}= require("../middlewares/auth")
const uploadPicture = require("../utils/pictureUpload")

const router = express.Router()

router.post("/create-leave",authorize,createLeave)
router.post("/create-type",authorize,createLeaveType)
router.get("/leave-types",authorize,typeOfLeave)
router.get("/hr/pending",authorize,pendingHr)
router.get("/hr/approved",authorize,approvedHr)
router.get("/hr/rejected",authorize,rejectedHr)
router.get("/my-leave",authorize,employeeLeave)
router.get("/summary",authorize,summary)
router.post("/hr/update-status/:id",authorize,updateHr)

module.exports = router