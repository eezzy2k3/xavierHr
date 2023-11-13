const express = require("express")
const {createEvent,allEvents,allEventsHr,createTraining,allTrainings,allTrainingsHr,deleteTraining,deleteEvent} = require("../controllers/event")
const {authorize,access}= require("../middlewares/auth")
const uploadPicture = require("../utils/pictureUpload")

const router = express.Router()

router.post("/create-event",uploadPicture.single("image"),authorize,createEvent)
router.get("/all-events",authorize,allEvents)
router.get("/all-events-hr",authorize,allEventsHr)
router.delete("/delete-event/:event",authorize,deleteEvent)
router.post("/create-training",authorize,uploadPicture.single("image"),createTraining)
router.get("/all-trainings",authorize,allTrainings)
router.get("/all-trainings-hr",authorize,allTrainingsHr)
router.delete("/delete-training/:training",authorize,deleteTraining)




module.exports = router