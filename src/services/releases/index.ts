import express, { NextFunction, Request, Response } from 'express'
import { Releases } from '../../models/releases/Releases'
import { ReleaseStatus } from '../../models/releases/ReleaseStatus'
import { authorize } from '../login/authTools'
import cloudinary, { UploadApiErrorResponse, UploadApiResponse }  from 'cloudinary'
import { RequestError } from '../../models/RequestError'

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

        const coverBase64 = req.body.coverBase64
        delete req.body.coverBase64

        let release = {
            ...req.body,
            status: ReleaseStatus.pending,
            coverURL: "dummy.url"
        }
        
        const errors = await Releases.validate(release)

        if (errors) throw new RequestError(errors, 400)

        cloudinary.v2.uploader.upload(coverBase64, async (error: UploadApiErrorResponse, result: UploadApiResponse) => {
            console.log(result, error)   
            if (error) res.status(500).send({message: error})
            else {
                // Release is created only now, when we're sure all fields were
                // valid and also Cloudinary answered without errors.
                const { _id } = await Releases.create({
                    ...release,
                    coverURL: result.secure_url,
                })
                res.status(201).send({message: "Submitted!", id: _id})
            }
        })
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
        Releases.findByIdAndDelete(req.params.id)
            .then( () =>
                res.status(202).send()
            )
    } catch (error) {
        next(error)
    }
})

export default router