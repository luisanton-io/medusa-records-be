import { DocumentType } from "@typegoose/typegoose";
import { Request } from "express";
import { User } from "../services/login/userSchema";

export interface AuthorizedRequest extends Request {
  token: string,
  user: DocumentType<User>
}