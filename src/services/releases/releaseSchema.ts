import { getModelForClass, prop } from "@typegoose/typegoose"

export enum ReleaseStatus {
  pending,
  accepted,
  rejected
}

export class Release {

  @prop({ required: true })
  public title!: string

  @prop({ required: true })
  public date!: Date

  @prop({ required: true })
  public mainArtist!: string
  
  @prop()
  public feats?: string
  
  @prop({ required: true })
  public coverURL!: string

  @prop({ required: true })
  public audioURL!: string

  @prop({ required: true })
  public email!: string

  @prop()
  public altContact?: string

  @prop({ required: true })
  public status!: ReleaseStatus

}

const ReleaseModel = getModelForClass(Release)

export default ReleaseModel