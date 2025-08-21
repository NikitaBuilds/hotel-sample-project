"use client";

import { useEffect, useRef } from "react";
import { NiceInput } from "@/components/ui/nice-input";
import { useActiveGroup } from "@/services/group/hooks";
import {
  useGroupMessages,
  useSendMessage,
  type Message,
} from "@/services/group/chat";
import { Card } from "@/components/ui/card";
import { useUser } from "@/services/supabase/use-user";
import { MessageBubble } from "./message-bubble";
import {
  ChatHeaderSkeleton,
  ChatInputSkeleton,
  ChatSkeleton,
} from "./chat-skeleton";

export function ChatContainer() {
  const { activeGroup } = useActiveGroup();
  const { user } = useUser();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    data: messagesData,
    isLoading,
    isError,
    refetch,
  } = useGroupMessages(activeGroup?.id || "", 1, 50, {
    enabled: !!activeGroup?.id,
  });

  const { mutate: sendMessage } = useSendMessage(activeGroup?.id || "");

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messagesData?.messages && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messagesData?.messages]);

  // Auto-refresh messages every 10 seconds
  useEffect(() => {
    if (!activeGroup?.id) return;

    const interval = setInterval(() => {
      refetch();
    }, 10000);

    return () => clearInterval(interval);
  }, [activeGroup?.id, refetch]);

  const handleSendMessage = (content: string) => {
    if (!activeGroup?.id || !content.trim()) return;

    sendMessage({
      content: content.trim(),
      message_type: "text",
    });
  };

  if (!activeGroup) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-64px)]">
        <Card className="p-8 max-w-md w-full text-center">
          <h2 className="text-xl font-semibold mb-4">No Active Group</h2>
          <p className="text-muted-foreground">
            Please select or create a group to start chatting.
          </p>
        </Card>
      </div>
    );
  }

  // Reverse the messages to show newest at the bottom
  const orderedMessages = messagesData?.messages
    ? [...messagesData.messages].reverse()
    : [];

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <ChatSkeleton />
        ) : isError ? (
          <div className="text-center p-4 text-red-500">
            Failed to load messages. Please try again.
          </div>
        ) : orderedMessages.length === 0 ? (
          <div className="text-center p-8 text-muted-foreground">
            No messages yet. Start the conversation!
          </div>
        ) : (
          <>
            {orderedMessages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                isCurrentUser={message.user?.id === user?.id}
              />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="border-t">
        {isLoading ? (
          <ChatInputSkeleton />
        ) : (
          <NiceInput
            placeholder="Type your message..."
            onSubmit={handleSendMessage}
            maxHeight={150}
          />
        )}
      </div>
    </div>
  );
}
