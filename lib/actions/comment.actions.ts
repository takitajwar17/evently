"use server";

import { connectToDatabase } from "@/lib/database";
import Comment from "@/lib/database/models/comment.model";
import User from "@/lib/database/models/user.model";
import { handleError } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export type CreateCommentParams = {
  content: string;
  eventId: string;
  userId: string;
  parentId?: string | null;
  mentions?: string[];
  path: string;
};

const extractMentions = (content: string) => {
  const mentionRegex = /@(\w+)/g;
  return Array.from(content.matchAll(mentionRegex), (match) => match[1]);
};

const populateComment = (query: any) => {
  return query
    .populate({
      path: "author",
      model: User,
      select: "_id firstName lastName username photo",
    })
    .populate({
      path: "mentions",
      model: User,
      select: "_id firstName lastName username",
    })
    .populate({
      path: "replies",
      model: Comment,
      populate: [
        {
          path: "author",
          model: User,
          select: "_id firstName lastName username photo",
        },
        {
          path: "mentions",
          model: User,
          select: "_id firstName lastName username",
        },
      ],
    });
};

export async function createComment({
  content,
  eventId,
  userId,
  parentId = null,
  path,
}: CreateCommentParams) {
  try {
    await connectToDatabase();

    // Extract mentions from content
    const mentionedUsernames = extractMentions(content);
    const mentionedUsers =
      mentionedUsernames.length > 0
        ? await User.find({ username: { $in: mentionedUsernames } })
        : [];

    const mentionUserIds = mentionedUsers.map((user) => user._id);

    // Create the comment
    const comment = await Comment.create({
      content,
      event: eventId,
      author: userId,
      parentComment: parentId,
      mentions: mentionUserIds,
    });

    // If this is a reply, update parent comment
    if (parentId) {
      await Comment.findByIdAndUpdate(parentId, {
        $push: { replies: comment._id },
      });
    }

    // Update mentioned users
    if (mentionUserIds.length > 0) {
      await User.updateMany(
        { _id: { $in: mentionUserIds } },
        { $push: { mentions: comment._id } }
      );
    }

    // Update comment author's comments array
    await User.findByIdAndUpdate(userId, { $push: { comments: comment._id } });

    revalidatePath(path);

    return JSON.parse(JSON.stringify(comment));
  } catch (error) {
    handleError(error);
  }
}

export async function getCommentsByEvent(eventId: string) {
  try {
    await connectToDatabase();

    const comments = await populateComment(
      Comment.find({ event: eventId, parentComment: null }).sort({
        createdAt: "desc",
      })
    );

    return JSON.parse(JSON.stringify(comments));
  } catch (error) {
    handleError(error);
  }
}

export async function updateComment(
  commentId: string,
  content: string,
  path: string
) {
  try {
    await connectToDatabase();

    // Extract new mentions
    const mentionedUsernames = extractMentions(content);
    const mentionedUsers =
      mentionedUsernames.length > 0
        ? await User.find({ username: { $in: mentionedUsernames } })
        : [];

    const mentionUserIds = mentionedUsers.map((user) => user._id);

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      {
        content,
        mentions: mentionUserIds,
        updatedAt: new Date(),
      },
      { new: true }
    );

    revalidatePath(path);

    return JSON.parse(JSON.stringify(updatedComment));
  } catch (error) {
    handleError(error);
  }
}

const deleteRepliesRecursively = async (commentId: string) => {
  const replies = await Comment.find({ parentComment: commentId });
  for (const reply of replies) {
    await deleteRepliesRecursively(reply._id);
    await Comment.findByIdAndDelete(reply._id);
  }
};

export async function deleteComment(commentId: string, path: string) {
  try {
    await connectToDatabase();

    // Get the comment to be deleted
    const comment = await Comment.findById(commentId);
    if (!comment) throw new Error("Comment not found");

    // Remove comment reference from parent if it's a reply
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(comment.parentComment, {
        $pull: { replies: commentId },
      });
    }

    // Remove comment reference from mentioned users
    await User.updateMany(
      { _id: { $in: comment.mentions } },
      { $pull: { mentions: commentId } }
    );

    // Remove comment reference from author
    await User.findByIdAndUpdate(comment.author, {
      $pull: { comments: commentId },
    });

    // Delete all replies recursively
    await deleteRepliesRecursively(commentId);

    // Delete the comment
    await Comment.findByIdAndDelete(commentId);

    revalidatePath(path);
  } catch (error) {
    handleError(error);
  }
}

export async function getUserMentions(userId: string) {
  try {
    await connectToDatabase();

    const user = await User.findById(userId).populate({
      path: "mentions",
      populate: [
        {
          path: "author",
          model: User,
          select: "_id firstName lastName username photo",
        },
        {
          path: "event",
          select: "_id title",
        },
      ],
    });

    return JSON.parse(JSON.stringify(user?.mentions || []));
  } catch (error) {
    handleError(error);
  }
}
