import dotenv from "dotenv"
dotenv.config()

import express from "express"
const server = express()
import cors from "cors"
import listEndpoints from "express-list-endpoints"
import cookieParser from "cookie-parser"

// const whitelist = ["http://localhost:3000"]
// const corsOptions = {
//   origin: (origin, callback) => {
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       callback(null, true)
//     } else {
//       callback(new Error("Not allowed by CORS"))
//     }
//   },
//   credentials: true,
// }
// server.use(cors(corsOptions))
server.use(cors())
server.use(cookieParser())
server.use(express.json())

import loginRouter from './services/login'

server.use("/login", loginRouter)

import mongoose from "mongoose"
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
