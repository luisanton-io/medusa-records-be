import mongoose, { Schema } from "mongoose"
import bcrypt from "bcryptjs"
import validator from "validator"
import { arrayProp, getModelForClass, pre, prop } from "@typegoose/typegoose"
import { Credentials } from "../../models/Credentials"

@pre<User>('save', async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8)
  }
  next()
})

export class User {
  public _id!: Schema.Types.ObjectId;

  @prop({
    required: true,
    validate: async (value) => {
      if (!validator.isEmail(value)) throw new Error("Invalid email.")
      let user = await UserModel.findOne({ email: value })
      if (user) throw new Error("This username already exists!")
      return true
    }
  })
  public email!: string

  @prop({ required: true, minlength: 2 })
  public password!: string

  @prop({ type: () => [String], default: [] })
  public refreshTokens!: string[]

  public static async findByCredentials({ email, password }: Credentials) {
    const user = await UserModel.findOne({ email })
    if (!user) return null

    const isMatch = await bcrypt.compare(password, user.password)
    return isMatch ? user : null
  }
}


const UserModel = getModelForClass(User)

export default UserModel