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
const task = require("./src/jobs/cron")

// app.use(cookieparser())

connectDb()

app.use(cors())
task.start()
app.use("/api/v1/registeration",userRouter)
app.use("/api/v1/leave",leaveRouter)
app.use("/api/v1/award",awardRouter)

app.use(errorHandler)


let port = process.env.PORT
if(port == null || port == ""){
    port = 5000
}

const server = app.listen(port,()=>{
    console.log(`app is listening on ${port}`)
})
