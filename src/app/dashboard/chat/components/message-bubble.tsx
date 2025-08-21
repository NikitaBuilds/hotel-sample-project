"use client";

import { Avatar } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import type { Message } from "@/services/group/chat";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
}

export function MessageBubble({ message, isCurrentUser }: MessageBubbleProps) {
  const time = formatDistanceToNow(new Date(message.created_at), {
    addSuffix: true,
  });

  if (message.message_type === "system") {
    return (
      <div className="flex justify-center my-2">
        <div className="bg-muted px-3 py-1 rounded-full text-xs text-muted-foreground">
          {message.content}
        </div>
      </div>
    );
  }

  return (
    <div
      className={`flex ${
        isCurrentUser ? "justify-end" : "justify-start"
      } gap-2 items-end`}
    >
      {!isCurrentUser && (
        <Avatar className="w-8 h-8">
          <div className="flex h-full w-full items-center justify-center bg-muted rounded-full">
            {message.user?.full_name?.charAt(0) || "?"}
          </div>
        </Avatar>
      )}

      <div
        className={`max-w-[75%] ${
          isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
        } rounded-2xl p-3`}
      >
        {!isCurrentUser && (
          <div className="text-xs font-medium mb-1">
            {message.user?.full_name || "Unknown User"}
          </div>
        )}
        <div className="whitespace-pre-wrap break-words">{message.content}</div>
        <div className="text-xs opacity-70 mt-1 text-right">{time}</div>
      </div>
    </div>
  );
}
