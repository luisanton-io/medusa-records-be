import { getModelForClass, prop } from "@typegoose/typegoose"
import { Genre } from "./Genre"
import { ReleaseStatus } from "./ReleaseStatus"

export class Release {

  @prop({ required: true })
  public firstName!: string

  @prop({ required: true })
  public lastName!: string

  @prop({ required: true })
  public email!: string

  @prop({ required: true })
  public mainArtist!: string
  
  @prop()
  public featurings?: string
  
  @prop({ required: true })
  public title!: string

  @prop({ required: true })
  public date!: Date

  @prop({ required: true, enum: Genre })
  public genre!: Genre

  @prop({ required: true })
  public audioURL!: string
  
  @prop({ required: true })
  public coverURL!: string
  
  @prop()
  public altContact?: string

  @prop({ required: true, enum: ReleaseStatus })
  public status!: ReleaseStatus

}

export const Releases = getModelForClass(Release)