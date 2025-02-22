import { Schema, model, models } from "mongoose";

const CommentSchema = new Schema({
  content: { type: String, required: true },
  event: { type: Schema.Types.ObjectId, ref: "Event", required: true },
  author: { type: Schema.Types.ObjectId, ref: "User", required: true },
  parentComment: { type: Schema.Types.ObjectId, ref: "Comment", default: null },
  mentions: [{ type: Schema.Types.ObjectId, ref: "User" }],
  replies: [{ type: Schema.Types.ObjectId, ref: "Comment" }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Add text index for searching mentions and content
CommentSchema.index({ content: "text" });

const Comment = models.Comment || model("Comment", CommentSchema);

export default Comment;
