import express, { NextFunction, Request, Response } from "express"
import Users from "../../models/Users"
import { Credentials } from '../../models/Credentials'
import { authorize, authenticate, issueRefreshedJWTs } from "../authTools"
import { RequestError } from "../../models/RequestError"
const router = express.Router()

router.get("/", authorize, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await Users.find({})
    res.status(200).send(users)
  } catch (error) {
    next(error)
  }
})

router.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { credentials } = req.body
    const { _id } = await Users.create(credentials)

    res.clearCookie("accessToken", {
      path:"/",
      httpOnly: true,
      sameSite: "none",
      secure: true
    })
    
    res.clearCookie("refreshToken", {
      path:"/login/refreshToken",
      httpOnly: true
      sameSite: "none",
      secure: true
    })
    
    res.status(201).send(_id)
  } catch (error) {
    res.status(500).send(error.message)
  }
})


router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const credentials = req.body.credentials as Credentials
        const user = await Users.findByCredentials(credentials)
    
        if (!user) throw new RequestError("Incorrect credentials", 400)
    
        const { token, refreshToken } = await authenticate(user)
    
        res.cookie("accessToken", token, {
          path:"/",
          httpOnly: true,
          sameSite: "none",
          secure: true
        })
        
        res.cookie("refreshToken", refreshToken, {
          path:"/login/refreshToken",
          httpOnly: true,
          sameSite: "none",
          secure: true
        })
    
        res.status(200).send()
    } catch (error) {
        next(error)
    }    
})

router.post("/refreshToken", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const oldRefreshToken = req.cookies.refreshToken
    if (!oldRefreshToken) throw new RequestError("Refresh token missing", 403)
    
    const { token, refreshToken } = await issueRefreshedJWTs(oldRefreshToken)

    res.clearCookie("refreshToken", {
      httpOnly: true,
      path: "/login/refreshToken"
    })

    res.cookie("accessToken", token, {
      httpOnly: true,
    })
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      path: "/login/refreshToken",
    })
    res.status(222).send()
  } catch (error) {
    next(error)
  }
})

export default router