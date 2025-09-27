import { Schema, model, models } from "mongoose";

const contactQuerySchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ContactQueryModel =
  models.ContactQuery || model("ContactQuery", contactQuerySchema);

export default ContactQueryModel;
