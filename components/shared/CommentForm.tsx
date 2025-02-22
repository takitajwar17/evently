"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createComment, updateComment } from "@/lib/actions/comment.actions";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";

type CommentFormProps = {
  eventId: string;
  userId: string;
  parentId?: string;
  initialContent?: string;
  commentId?: string;
  type: "Create" | "Update";
};

type FormData = {
  content: string;
};

const CommentForm = ({
  eventId,
  userId,
  parentId,
  initialContent = "",
  commentId,
  type,
}: CommentFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  const [mentionQuery, setMentionQuery] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      content: initialContent,
    },
  });

  const content = watch("content");

  useEffect(() => {
    if (initialContent) {
      setValue("content", initialContent);
    }
  }, [initialContent, setValue]);

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      if (type === "Create") {
        await createComment({
          content: data.content,
          eventId,
          userId,
          parentId,
          path: `/events/${eventId}`,
        });
        setValue("content", "");
      } else {
        await updateComment(commentId!, data.content, `/events/${eventId}`);
      }
    } catch (error) {
      console.error("Error submitting comment:", error);
    }
    setIsSubmitting(false);
  };

  const handleMentionInput = async (text: string, cursorPos: number) => {
    const textBeforeCursor = text.slice(0, cursorPos);
    const mentionMatch = textBeforeCursor.match(/@(\w*)$/);

    if (mentionMatch) {
      const query = mentionMatch[1];
      setMentionQuery(query);
      // Here you would typically fetch users matching the query
      // For now, we'll just show a placeholder
      setMentionSuggestions([
        { username: "user1", name: "User One" },
        { username: "user2", name: "User Two" },
      ]);
    } else {
      setMentionSuggestions([]);
    }
  };

  const insertMention = (username: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const text = textarea.value;
    const beforeMention = text.slice(0, cursorPosition).replace(/@\w*$/, "");
    const afterMention = text.slice(cursorPosition);
    const newText = `${beforeMention}@${username} ${afterMention}`;

    setValue("content", newText);
    setMentionSuggestions([]);
    textarea.focus();
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <div className="relative">
        <Textarea
          {...register("content", { required: "Comment cannot be empty" })}
          placeholder="Write a comment..."
          className="min-h-[100px] w-full rounded-lg border p-4"
          ref={(e) => {
            if (e) {
              register("content").ref(e);
              textareaRef.current = e;
            }
          }}
          onChange={(e) => {
            setValue("content", e.target.value);
            handleMentionInput(e.target.value, e.target.selectionStart || 0);
            setCursorPosition(e.target.selectionStart || 0);
          }}
        />
        {mentionSuggestions.length > 0 && (
          <div className="absolute bottom-full left-0 z-10 w-full max-w-sm rounded-lg border bg-white p-2 shadow-lg">
            {mentionSuggestions.map((user) => (
              <button
                key={user.username}
                type="button"
                className="w-full rounded p-2 text-left hover:bg-gray-100"
                onClick={() => insertMention(user.username)}
              >
                {user.name} (@{user.username})
              </button>
            ))}
          </div>
        )}
      </div>
      {errors.content && (
        <p className="text-sm text-red-500">{errors.content.message}</p>
      )}
      <Button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full"
        size="lg"
      >
        {isSubmitting
          ? "Submitting..."
          : type === "Create"
          ? "Post Comment"
          : "Update Comment"}
      </Button>
    </form>
  );
};

export default CommentForm;
