const express = require("express")
const {allUsers,allUsersHr,updateHr,employeeMatrics,deactivate,updateEmployee,getUserHr,updateCompany,getMessage,createAnonymous,createGame,createAdvanture,getAdventureHr,getAdventureEmployee,createAffirmation,latestAffirmation,allgamesEmployee,allgamesHr,latestAffirmationHr } = require("../controllers/userManagement")
const {authorize,access}= require("../middlewares/auth")
const uploadPicture = require("../utils/pictureUpload")

const router = express.Router()

router.get("/all-users",authorize,allUsers)
router.get("/all-users-hr",authorize,allUsersHr)
router.put("/update-employee-hr/:userId",authorize,updateHr)
router.put("/update-employee",authorize,updateEmployee)
router.put("/update-company",authorize,updateCompany)
router.delete("/deactivate-employee-hr/:userId",authorize,deactivate)
router.get("/employee-hr/:userId",authorize,getUserHr)
router.get("/employee-status",authorize,employeeMatrics)
router.post("/create-anonymous",authorize,createAnonymous)
router.post("/create-game",authorize,createGame)
router.post("/create-adventure",authorize,createAdvanture)
router.post("/create-affirmation",authorize,createAffirmation)
router.get("/get-anonymous",authorize,getMessage)
router.get("/get-adventure",authorize,getAdventureEmployee)
router.get("/get-adventure-hr",authorize,getAdventureHr)
router.get("/get-affirmation",authorize,latestAffirmation)
router.get("/get-affirmation-hr",authorize,latestAffirmationHr)
router.get("/get-games-hr",authorize,allgamesHr)
router.get("/get-games",authorize,allgamesEmployee)


module.exports = router