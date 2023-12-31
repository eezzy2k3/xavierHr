const express = require("express")
const {assignReview,reviewerReview,employeeReview,peerTopeer,myAssessment,employeeMatrics,taskMetrics,reviewHr,getApeerReview,performanceRate} = require("../controllers/performance")
const {authorize,access}= require("../middlewares/auth")
const uploadPicture = require("../utils/pictureUpload")

const router = express.Router()

router.post("/assign-assesment",authorize,assignReview)
router.post("/create-assesment-reviewer",authorize,reviewerReview)
router.get("/peer-to-peer",authorize,peerTopeer)
router.get("/my-assessment",authorize,myAssessment)
router.get("/metrics",authorize,employeeMatrics)
router.get("/task-metrics",authorize,taskMetrics)
router.get("/performance-rate",authorize,performanceRate)
router.post("/create-assesment-employee/:reviewId",authorize,employeeReview)
router.get("/employee-review-hr/:employee",authorize,reviewHr)
router.get("/peer-review-single/:review",authorize,getApeerReview)


module.exports = router