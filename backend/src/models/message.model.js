import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    chat: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: false, 
      trim: true,
      default: "",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    fileUrl: { type: String, default: "" },
    fileName: { type: String, default: "" },
    deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  {
    timestamps: true,
  },
);

messageSchema.index({ chat: 1, createdAt: -1 });
messageSchema.index({ sender: 1, receiver: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
