import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Message",
    default: null
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// İndeksler
chatSchema.index({ participants: 1 });
chatSchema.index({ lastActivity: -1 });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
