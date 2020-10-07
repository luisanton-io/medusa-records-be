import express, { NextFunction, Request, Response } from 'express'
import { authorize } from '../authTools'

const router = express.Router()

router.get("/", authorize, (req: Request, res: Response, next: NextFunction) => {
    res.status(204).send()
})

export default router