import { NextFunction, Request, Response } from "express"
// // ERROR HANDLERS
// const badRequestHandler = (err, req, res, next) => {
//   if (err.httpStatusCode === 400) {
//     res.status(400).send(err.message)
//   }
//   next(err)
// } // 400

import { RequestError } from "./models/RequestError"

// const forbiddenHandler = (err, req, res, next) => {
//   if (err.httpStatusCode === 403) {
//     res.status(403).send(err.message || "Forbidden!")
//   }
//   next(err)
// } // 403

// const notFoundHandler = (err, req, res, next) => {
//   if (err.httpStatusCode === 404) {
//     res.status(404).send(err.message || "Resource not found!")
//   }
//   next(err)
// } // 404

// catch all
export const genericErrorHandler = (err: RequestError, req: Request, res: Response, next: NextFunction) => {
  if (!res.headersSent) {
    // checks if another error middleware already sent a response
    res.status(err.code || 500).send({message: err.message})
  }
}