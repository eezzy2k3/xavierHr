const express = require("express")
const {assignReview,reviewerReview,employeeReview,peerTopeer,myAssessment,employeeMatrics} = require("../controllers/performance")
const {authorize,access}= require("../middlewares/auth")
const uploadPicture = require("../utils/pictureUpload")

const router = express.Router()

router.post("/assign-assesment",authorize,assignReview)
router.post("/create-assesment-reviewer",authorize,reviewerReview)
router.get("/peer-to-peer",authorize,peerTopeer)
router.get("/my-assessment",authorize,myAssessment)
router.get("/metrics",authorize,employeeMatrics)
router.post("/create-assesment-employee/:reviewId",authorize,employeeReview)


module.exports = router