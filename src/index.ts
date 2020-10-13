import dotenv from "dotenv"
dotenv.config()

import express from "express"
const server = express()

import cors, { CorsOptions } from "cors"
import listEndpoints from "express-list-endpoints"
import cookieParser from "cookie-parser"
import mongoose from "mongoose"
mongoose.set('returnOriginal', false)

import { genericErrorHandler } from "./errorHandlers"
import loginRouter from './services/login'
import releasesRouter from './services/releases'
import authorizeRouter from "./services/auth"
import { Releases } from "./models/releases/Releases"
import { ReleaseStatus } from "./models/releases/ReleaseStatus"

const whitelist = ["http://localhost:3000", "https://medusa-records.com", "http://medusa-records.com", "https://medusa-records.herokuapp.com"]
const corsOptions: CorsOptions = {
  origin: function (requestOrigin: string | undefined, callback: (error: Error | null, success: boolean | undefined) => void) {
    if ( (requestOrigin && whitelist.indexOf(requestOrigin) !== -1) || !requestOrigin ) {
      callback(null, true)
    } else {
      callback(new Error("Not allowed by CORS"), undefined)
    }
  },
  credentials: true,
}
server.use(cors(corsOptions))
// server.use(cors())
server.use(cookieParser())
server.use(express.json({limit:'9mb'}))

server.use("/login", loginRouter)
server.use("/releases", releasesRouter)
server.use("/checkAuth", authorizeRouter)

server.use(genericErrorHandler)

// setInterval( async () => {
//   const removingReleases = await Releases.find({status: ReleaseStatus.rejected})
//   removingReleases.forEach( release => release.deleteOne )
// }, 86400000)

const port = process.env.PORT

mongoose.connect(process.env.MONGO_DB!, {
    useNewUrlParser: true,
    useUnifiedTopology: true,  
}).then( () => {
    server.listen(port, () => {
        console.log(listEndpoints(server))
        console.log("Running on port: " + port)
    })
}).catch((err) => console.log(err))
