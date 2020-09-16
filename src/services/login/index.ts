import express, { NextFunction, Request, Response } from "express"
import Users from "./userSchema"
const router = express()

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const users = await Users.find({})
    res.status(200).send(users)
  } catch (error) {
    next(error)
  }
})

router.post("/signup", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { _id } = await Users.create(req.body)

    res.status(201).send(_id)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        // const { email, password } = req.body
        // const user = await UserModel.findByCredentials(email, password)
    
        // if (!user) throw new Error("Incorrect credentials")
    
        const { token, refreshToken } = { token:"testToken", refreshToken:"testRefreshToken"}//await authenticate(user)
    
        res.cookie("accessToken", token, {
          path:"/",
          httpOnly: true
        })
    
        res.cookie("refreshToken", refreshToken, {
          path:"/login/refreshToken",
          httpOnly: true
        })
    
        res.send()
    } catch (error) {
        error.httpStatusCode = 400
        next(error)
    }    
})

export default router