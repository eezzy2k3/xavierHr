require("dotenv").config()

const express = require("express")

const app = express()

const connectDb = require("./config/config")
app.use(express.json())

const cors = require("cors")

app.use(express.urlencoded({extended:true}))

const errorHandler = require("./src/middlewares/errorHandler")

const userRouter = require("./src/routers/userRoute")
const leaveRouter = require("./src/routers/leaveRoute")
const awardRouter = require("./src/routers/awardRoute")
const wellnessRouter = require("./src/routers/eventRoute")
const performanceRouter = require("./src/routers/performanceRoute")
const managementRouter = require("./src/routers/userManagementRoute")
const {task,task2,task3} = require("./src/jobs/cron")

// app.use(cookieparser())

connectDb()

app.use(cors())
task.start()
task2.start()
task3.start()
app.use("/api/v1/registeration",userRouter)
app.use("/api/v1/leave",leaveRouter)
app.use("/api/v1/award",awardRouter)
app.use("/api/v1/wellness",wellnessRouter)
app.use("/api/v1/performance",performanceRouter)
app.use("/api/v1/management",managementRouter)

app.use(errorHandler)


let port = process.env.PORT
if(port == null || port == ""){
    port = 5000
}

const server = app.listen(port,()=>{
    console.log(`app is listening on ${port}`)
})
