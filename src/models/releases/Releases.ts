import { getModelForClass, pre, prop } from "@typegoose/typegoose"
import { Genre } from "./Genre"
import { ReleaseStatus } from "./ReleaseStatus"

@pre<Release>('validate', function () {
  if (this.featurings?.length === 0) {
    this.featurings = undefined
  }
})

export class Release {

  @prop({ required: true })
  public firstName!: string

  @prop({ required: true })
  public lastName!: string

  @prop({ required: true })
  public email!: string

  @prop({ required: true, type: () => [String] })
  public mainArtists!: string[]

  @prop({ type: () => [String] })
  public featurings?: string[]
  
  @prop({ required: true })
  public title!: string

  @prop({ required: true })
  public date!: Date

  @prop({ required: true, enum: Genre})
  public genre!: Genre

  @prop({ required: true })
  public audioURL!: string
  
  @prop({ required: true })
  public coverURL!: string
  
  @prop()
  public altContact?: string

  @prop()
  public displayOnHome?: boolean

  @prop()
  public fanLink?: string

  @prop({ required: true, enum: ReleaseStatus })
  public status!: ReleaseStatus

  public static async validate (data: unknown) {
    const model = new Releases(data)
    let errors = null
    await model.validate((err) => {
      console.log(err)
      errors = err
    })
    return errors
  }

}

export const Releases = getModelForClass(Release)