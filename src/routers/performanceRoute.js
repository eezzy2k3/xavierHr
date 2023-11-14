const express = require("express")
const {assignReview,reviewerReview,employeeReview} = require("../controllers/performance")
const {authorize,access}= require("../middlewares/auth")
const uploadPicture = require("../utils/pictureUpload")

const router = express.Router()

router.post("/assign-assesment",authorize,assignReview)
router.post("/create-assesment-reviewer",authorize,reviewerReview)
router.post("/create-assesment-employee/:reviewId",authorize,employeeReview)


module.exports = router