const express = require("express")
const { registerCompany,confirmEmail,login,createUser,updateEmployeeProfile, confirmUserEmail} = require("../controllers/user")
const {authorize,access}= require("../middlewares/auth")
const uploadPicture = require("../utils/pictureUpload")

const router = express.Router()

router.post("/register-company",uploadPicture.single("companyLogo"),registerCompany)
router.post("/confirm-email/:userId",confirmEmail)
router.post("/confirm-employee/:userId",confirmUserEmail)
router.post("/login",login)
router.post("/register-employee",authorize,createUser)
router.post("/employee/set-data",authorize,uploadPicture.single("displayPicture"),updateEmployeeProfile)



module.exports = router