import bcrypt from "bcryptjs"
// import validator from "validator"
import { getModelForClass, pre, prop } from "@typegoose/typegoose"
import { Credentials } from "./Credentials"

@pre<User>('save', async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 8)
  }
  next()
})

export class User {
  @prop({
    required: true,
    minlength: 5,
    validate: async (value) => {
      // if (!validator.isEmail(value)) throw new Error("Invalid email.")
      let user = await UserModel.findOne({ username: value })
      if (user) throw new Error("This username already exists!")
      return true
    }
  })
  public username!: string

  @prop({ required: true, minlength: 2 })
  public password!: string

  @prop({ type: () => [String], default: [] })
  public refreshTokens!: string[]

  public static async findByCredentials({ username, password }: Credentials) {
    const user = await UserModel.findOne({ username })
    if (!user) return null

    const isMatch = await bcrypt.compare(password, user.password)
    return isMatch ? user : null
  }
}


const UserModel = getModelForClass(User)

export default UserModel