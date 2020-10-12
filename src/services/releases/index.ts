import express, { NextFunction, Request, Response } from 'express'
import { Releases } from '../../models/releases/Releases'
import { ReleaseStatus } from '../../models/releases/ReleaseStatus'
import { authorize } from '../authTools'
import { RequestError } from '../../models/RequestError'
import cloudinary, { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary'
import sgMail from '@sendgrid/mail'
import { acceptedEmail, acceptedText } from '../../models/Emails/acceptedEmail'
import { rejectedEmail, rejectedText } from '../../models/Emails/rejectedEmail'
import { subReceivedEmail, subReceivedText } from '../../models/Emails/subReceivedEmail'

sgMail.setApiKey(process.env.SENDGRID_KEY!)

const router = express.Router()
type ReleaseStatusString = keyof typeof ReleaseStatus

// router.get("/", async (req: Request, res: Response, next: NextFunction) => {
//     try {
//         if (Object.keys(req.query).length > 0) throw new RequestError("No query params allowed.", 400)

//         const releases = await Releases.find({}, null, {sort: { date: 'desc'}})
//         res.status(200).send(releases)
//     } catch (error) {
//         next(error)
//     }
// })

router.get("/home", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (Object.keys(req.query).length > 0) throw new RequestError("No query params allowed.", 400)

        const releases = await Releases.find({
            status: ReleaseStatus.accepted,
            displayOnHome: true,
            date: { $lte: (new Date()) }
        }, null, { sort: { date: 'desc' } })

        res.status(200).send(releases)
    } catch (error) {
        next(error)
    }
})

router.get("/accepted", async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (Object.keys(req.query).length > 0) throw new RequestError("No query params allowed.", 400)

        const releases = await Releases.find({ status: ReleaseStatus.accepted }, null, { sort: { date: 'desc' } })
        res.status(200).send(releases)
    } catch (error) {
        next(error)
    }
})

router.get("/pending", authorize, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (Object.keys(req.query).length > 0) throw new RequestError("No query params allowed.", 400)

        const releases = await Releases.find({ status: ReleaseStatus.pending }, null, { sort: { date: 'desc' } })
        res.status(200).send(releases)
    } catch (error) {
        next(error)
    }
})

router.get("/rejected", authorize, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (Object.keys(req.query).length > 0) throw new RequestError("No query params allowed.", 400)

        const releases = await Releases.find({ status: ReleaseStatus.rejected }, null, { sort: { date: 'desc' } })
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
            if (error) res.status(500).send({ message: error })
            else {
                // Release is created only now, when we're sure all fields were
                // valid and also Cloudinary answered without errors.
                const { _id } = await Releases.create({
                    ...release,
                    coverURL: result.secure_url,
                })
                const msg = {
                    to: release.email, 
                    from: 'medusarecordsx@gmail.com',
                    subject: release.firstName + ', Your Medusa Records Submission Was Received.',
                    text: `Hello, ${subReceivedText}`,
                    html: subReceivedEmail,
                }
                await sgMail.send(msg)        
                res.status(201).send({ message: "Submitted!", id: _id })
            }
        })
    } catch (error) {
        next(error)
    }
})

router.put("/accept/:id", authorize, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const release = (await Releases.findByIdAndUpdate(req.params.id, { status: ReleaseStatus.accepted }))!
        const msg = {
            to: release.email, 
            from: 'medusarecordsx@gmail.com',
            subject: 'Your Release Was Approved',
            text: `Hello, ${acceptedText}`,
            html: acceptedEmail,
        }
        await sgMail.send(msg)
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

router.put("/reject/:id", authorize, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const release = (await Releases.findByIdAndUpdate(req.params.id, { status: ReleaseStatus.rejected }))!
        const msg = {
            to: release.email, 
            from: 'medusarecordsx@gmail.com',
            subject: release.firstName + ' Medusa Records Submission Update.',
            text: `Hello, ${rejectedText}`,
            html: rejectedEmail,
        }
        await sgMail.send(msg)
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

router.put("/:id", authorize, async (req: Request, res: Response, next: NextFunction) => {
    try {
        Releases.findByIdAndUpdate(req.params.id, { ...req.body })
            .then(() => {
                res.status(204).send()
            })

    } catch (error) {
        next(error)
    }
})

router.delete("/:id", authorize, async (req: Request, res: Response, next: NextFunction) => {
    try {
        Releases.findByIdAndDelete(req.params.id)
            .then(() =>
                res.status(202).send()
            )
    } catch (error) {
        next(error)
    }
})

export default router