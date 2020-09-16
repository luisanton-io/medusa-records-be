"use strict";
// const express = require("express")
// const router = express()
// router.post("/", async (req, res, next) => {
//     try {
//         const { email, password } = req.body
//         const user = await UserModel.findByCredentials(email, password)
//         if (!user) throw new Error("Incorrect credentials")
//         const { token, refreshToken } = await authenticate(user)
//         res.cookie("accessToken", token, {
//           path:"/",
//           httpOnly: true
//         })
//         res.cookie("refreshToken", refreshToken, {
//           path:["/login/refreshToken", "/logout"],
//           httpOnly: true
//         })
//         res.send()
//     } catch (error) {
//         error.httpStatusCode = 400
//         next(error)
//     }    
// })
