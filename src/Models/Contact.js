import mongoose from "mongoose";

export const ContactStatus = {
  NEW: "new",
  READ: "read",
  REPLIED: "replied",
  ARCHIVED: "archived",
  RESOLED: "resolved",
};

const ContactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true },
    message: { type: String, required: true },
    webName: { type: String, required: true }, // multi-site support
    status: {
      type: String,
      enum: Object.values(ContactStatus),
      default: ContactStatus.NEW,
    },
    repliedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

const ContactMessage =
  mongoose.models.ContactMessage ||
  mongoose.model("ContactMessage", ContactMessageSchema);

export default ContactMessage;
