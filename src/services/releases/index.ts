import express, { NextFunction, Request, Response } from 'express'
import { Releases } from '../../models/releases/Releases'
import { ReleaseStatus } from '../../models/releases/ReleaseStatus'
import { authorize } from '../login/authTools'
const router = express.Router()

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const releases = await Releases.find({}, null, {sort: { date: 'desc'}})
        res.status(200).send(releases)
    } catch (error) {
        next(error)
    }
})

router.post("/", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { _id } = await Releases.create({
            ...req.body,
            status: ReleaseStatus.pending
        })
        res.status(201).send(_id)
    } catch (error) {
        next(error)
    }
})

router.put("/:id", authorize, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { status } = req.body
        await Releases.findByIdAndUpdate(req.params._id, { status })

        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

router.delete("/:id", authorize, async (req: Request, res: Response, next: NextFunction) => {
    try {
        Releases.findByIdAndDelete(req.params._id)
            .then( () =>
                res.status(202).send()
            )
    } catch (error) {
        next(error)
    }
})

export default router