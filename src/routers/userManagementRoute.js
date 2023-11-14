const express = require("express")
const {allUsers,allUsersHr } = require("../controllers/userManagement")
const {authorize,access}= require("../middlewares/auth")
const uploadPicture = require("../utils/pictureUpload")

const router = express.Router()

router.get("/all-users",authorize,allUsers)
router.get("/all-users-hr",authorize,allUsersHr)


module.exports = router