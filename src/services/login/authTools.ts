import jwt, { JsonWebTokenError, NotBeforeError, TokenExpiredError } from "jsonwebtoken"
import { DocumentType } from "@typegoose/typegoose"
import Users, { User } from "./userSchema"
import { Schema } from "mongoose"
import { Request, Response, NextFunction } from "express"
import { RequestError } from "../../models/RequestError"

export const authorize = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.cookies.accessToken
    const { _id } = await verifyJWT(token)
    const user = await Users.findById(_id)

    if (!user)
      throw new RequestError("Please authenticate", 401) 
    else {
      // req.token = token
      // req.user = user!
      req.body.token = token
      req.body.user = user
      next()
    }
  } catch (error) {
    next(error)
  }
}

export const authenticate = async (user: DocumentType<User>) => {
  try {
    // generate tokens
    const newAccessToken = await generateJWT({ _id: user._id })
    const newRefreshToken = await generateRefreshJWT({ _id: user._id })

    // user.refreshTokens = user.refreshTokens.concat({ token: newRefreshToken })
    console.log("Here are current tokens: " + user.refreshTokens)
    await user.updateOne({
      $push: {
        refreshTokens: newRefreshToken,
        // refreshTokens: { token: newRefreshToken },
      },
      // refreshTokens: [...user.refreshTokens, {token: newRefreshToken}]
    });
    return { token: newAccessToken, refreshToken: newRefreshToken }
  } catch (error) {
    console.log(error)
    throw new Error(error)
  }
}

interface JwtPayload {
  _id: Schema.Types.ObjectId
}

export const verifyJWT = (token: string) =>
  new Promise((res: (decoded: JwtPayload) => void, rej: (reason: Error) => void) =>
    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) rej(err)
      res(decoded as JwtPayload)
    })
  )

const generateJWT = (payload: JwtPayload) =>
  new Promise((res: (value: string) => void, rej: (reason: Error) => void) =>
    jwt.sign(
      payload,
      process.env.JWT_SECRET!,
      { expiresIn: '1h' },
      (err, token) => {
        if (err) rej(err)
        res(token!)
      }
    )
  )

const generateRefreshJWT = (payload: JwtPayload) =>
  new Promise((res: (value: string) => void, rej: (reason: Error) => void) =>
    jwt.sign(
      payload,
      process.env.REFRESH_JWT_SECRET!,
      { expiresIn: "1 week" },
      (err, token) => {
        if (err) rej(err)
        res(token!)
      }
    )
  )

export const issueRefreshedJWTs = async (oldRefreshToken: string) => {
  const { _id } = await verifyRefreshToken(oldRefreshToken)
  const user = await Users.findById(_id)

  if (!user) throw new Error(`Access is forbidden`)

  const currentRefreshToken = user.refreshTokens.find(
      (t) => t === oldRefreshToken
    )

  if (!currentRefreshToken) throw new Error(`Refresh token is wrong`)

  // generate tokens
  const newAccessToken = await generateJWT({ _id })
  const newRefreshToken = await generateRefreshJWT({ _id })

  // save in db
  const newRefreshTokens = user.refreshTokens.filter(
      (t) => t !== oldRefreshToken
    ).concat(newRefreshToken)

  await user.updateOne({
    refreshTokens: newRefreshTokens
  })

  return { token: newAccessToken, refreshToken: newRefreshToken }
}

const verifyRefreshToken = (token: string) =>
  new Promise((res: (decoded: JwtPayload) => void, rej: (reason: Error) => void) =>
    jwt.verify(token, process.env.REFRESH_JWT_SECRET!, (err, decoded) => {
      if (err) rej(err)
      res(decoded as JwtPayload)
    })
  )      