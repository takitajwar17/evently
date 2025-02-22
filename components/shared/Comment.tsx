"use client";

import { Button } from "@/components/ui/button";
import { deleteComment } from "@/lib/actions/comment.actions";
import { formatDateTime } from "@/lib/utils";
import Image from "next/image";
import { useState } from "react";
import CommentForm from "./CommentForm";

type User = {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  photo: string;
};

type CommentType = {
  _id: string;
  content: string;
  author: User;
  event: string;
  createdAt: string;
  mentions: User[];
  replies: CommentType[];
};

type CommentProps = {
  comment: CommentType;
  eventId: string;
  currentUserId: string;
  onDelete?: () => void;
};

const Comment = ({
  comment,
  eventId,
  currentUserId,
  onDelete,
}: CommentProps) => {
  const [isReplying, setIsReplying] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showReplies, setShowReplies] = useState(false);

  const isAuthor = currentUserId === comment.author._id;
  const commentDate = new Date(comment.createdAt);

  const handleDelete = async () => {
    try {
      await deleteComment(comment._id, `/events/${eventId}`);
      onDelete?.();
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const renderContent = () => {
    let content = comment.content;
    comment.mentions.forEach((user) => {
      const regex = new RegExp(`@${user.username}`, "g");
      content = content.replace(
        regex,
        `<span class="text-primary-500 font-semibold">@${user.username}</span>`
      );
    });
    return <div dangerouslySetInnerHTML={{ __html: content }} />;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start space-x-4">
        <Image
          src={comment.author.photo}
          alt={comment.author.username}
          width={40}
          height={40}
          className="rounded-full"
        />
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-semibold">
                {comment.author.firstName} {comment.author.lastName}
              </p>
              <p className="text-sm text-gray-500">
                @{comment.author.username}
              </p>
            </div>
            <p className="text-sm text-gray-500">
              {formatDateTime(commentDate).dateTime}
            </p>
          </div>

          {isEditing ? (
            <CommentForm
              eventId={eventId}
              userId={currentUserId}
              type="Update"
              initialContent={comment.content}
              commentId={comment._id}
            />
          ) : (
            <div className="prose prose-sm max-w-none">{renderContent()}</div>
          )}

          <div className="flex space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsReplying(!isReplying)}
            >
              Reply
            </Button>
            {isAuthor && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  className="text-red-500 hover:text-red-600"
                >
                  Delete
                </Button>
              </>
            )}
            {comment.replies.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplies(!showReplies)}
              >
                {showReplies ? "Hide" : "Show"} {comment.replies.length} Replies
              </Button>
            )}
          </div>
        </div>
      </div>

      {isReplying && (
        <div className="ml-14">
          <CommentForm
            eventId={eventId}
            userId={currentUserId}
            parentId={comment._id}
            type="Create"
          />
        </div>
      )}

      {showReplies && comment.replies.length > 0 && (
        <div className="ml-14 space-y-4">
          {comment.replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              eventId={eventId}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;
