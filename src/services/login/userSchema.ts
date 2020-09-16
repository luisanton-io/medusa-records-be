import mongoose, { Schema } from "mongoose"
import bcrypt from "bcryptjs"
import validator from "validator"
import { getModelForClass, prop } from "@typegoose/typegoose"

class JwtToken {
  @prop()
  token!: string
}

class User {
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

  @prop()
  public refreshTokens?: JwtToken[]
}

const UserModel = getModelForClass(User)

export default UserModel

// const UserSchema: Schema = new Schema(
//   {
//     email: {
//       type: String,
//       required: true,
//       lowercase: true,
//       validate: async (value) => {
//         if (v.isEmail(value)) {
//           let user = await UserModel.findOne({ username: value })
//           if (user)
//             throw new Error("This username already exists!")
//         }
//         else
//           throw new Error("Invalid email.")
//       }
//     },
//     password: {
//       type: String,
//       required: true,
//       // minlength: 7,
//     },
//     refreshTokens: [
//       {
//         token: {
//           type: String,
//           required: true
//         }
//       }
//     ]
//   }
// )

// UserSchema.statics.findByCredentials = async (email, password) => {
//   const user = await UserModel.findOne({ email })

//   if (user) {
//     const isMatch = await bcrypt.compare(password, user.password)
//     if (isMatch) return user
//   } 
//   return null
// }

// UserSchema.methods.toJSON = function () {
//   const user = this
//   const userObject = user.toObject()

//   delete userObject.password
//   delete userObject.__v

//   return userObject
// }

// UserSchema.post("validate", function (error, doc, next) {
//   if (error) {
//     error.httpStatusCode = 400
//     next(error)
//   } else {
//     next()
//   }
// })

// UserSchema.pre("save", async function (next) {
//   const user = this

//   if (user.isModified("password")) {
//     user.password = await bcrypt.hash(user.password, 8)
//   }

//   next()
// })

// UserSchema.post("save", function (error, doc, next) {
//   if (error.name === "MongoError" && error.code === 11000) {
//     error.httpStatusCode = 400
//     next(error)
//   } else {
//     next()
//   }
// })

// const UserModel = mongoose.model("User", UserSchema)

// export default UserModel