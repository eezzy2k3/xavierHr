const express = require("express")
const {allUsers,allUsersHr,updateHr,employeeMatrics,deactivate } = require("../controllers/userManagement")
const {authorize,access}= require("../middlewares/auth")
const uploadPicture = require("../utils/pictureUpload")

const router = express.Router()

router.get("/all-users",authorize,allUsers)
router.get("/all-users-hr",authorize,allUsersHr)
router.put("/update-employee-hr/:userId",authorize,updateHr)
router.delete("/deactivate-employee-hr/:userId",authorize,deactivate)
router.get("/employee-status",authorize,employeeMatrics)


module.exports = router