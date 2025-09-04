"use client";

import { useState, useEffect } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useProject } from "@/contexts/project-context";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import { Message, MessageContent } from "@/components/ai-elements/message";
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputSubmit,
  PromptInputToolbar,
} from "@/components/ai-elements/prompt-input";
import {
  Reasoning,
  ReasoningTrigger,
  ReasoningContent,
} from "@/components/ai-elements/reasoning";
import { Response } from "@/components/ai-elements/response";
import { Loader } from "@/components/ai-elements/loader";
import { DateSeparator } from "@/components/date-separator";
import { shouldShowDateSeparator, getMessageDate } from "@/lib/date-utils";

interface ExtendedMessage {
  id: string;
  role: string;
  parts: Array<{ type: string; text?: string }>;
  createdAt?: Date | string;
}

interface ChatInterfaceProps {
  threadId: string;
}

export function ChatInterface({ threadId }: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [messageMetadata, setMessageMetadata] = useState<Record<string, { createdAt?: Date | string }>>({});
  const { currentProject } = useProject();

  const { messages, sendMessage, status, setMessages } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/chat",
      body: { 
        threadId,
        projectId: currentProject?.id || null
      },
    }),
  });

  // Load messages when threadId changes
  useEffect(() => {
    fetch(`/api/threads/${threadId}`)
      .then(res => res.json())
      .then(data => {
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages);
          // Store metadata for date separators
          const metadata: Record<string, { createdAt?: Date | string }> = {};
          data.messages.forEach((msg: ExtendedMessage) => {
            if (msg.createdAt) {
              metadata[msg.id] = { createdAt: msg.createdAt };
            }
          });
          setMessageMetadata(metadata);
        }
      })
      .catch(error => {
        console.error("Failed to load messages:", error);
      });
  }, [threadId, setMessages]);

  return (
    <div className="flex flex-col h-full">
      <Conversation className="flex-1 min-h-0">
        <ConversationContent>
          {messages.map((m, index) => {
            const currentMetadata = messageMetadata[m.id] || {};
            const previousMetadata = index > 0 ? (messageMetadata[messages[index - 1].id] || {}) : null;
            const showDateSeparator = shouldShowDateSeparator(currentMetadata, previousMetadata);
            const messageDate = getMessageDate(currentMetadata);

            return (
              <div key={m.id}>
                {showDateSeparator && messageDate && (
                  <DateSeparator date={messageDate} />
                )}
                <Message from={m.role}>
                  <MessageContent>
                    {m.parts.map((part, i) => {
                      if (part.type === "text") {
                        if (m.role === "assistant") {
                          return <Response key={i}>{part.text}</Response>;
                        }
                        return <span key={i}>{part.text}</span>;
                      }
                      if (part.type === "reasoning")
                        return (
                          <Reasoning key={i} isStreaming={status === "streaming"}>
                            <ReasoningTrigger />
                            <ReasoningContent>{part.text}</ReasoningContent>
                          </Reasoning>
                        );
                      return null;
                    })}
                  </MessageContent>
                </Message>
              </div>
            );
          })}
          {status === "submitted" && <Loader />}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      <div className="flex-shrink-0 p-4 border-t bg-background">
        <PromptInput
          onSubmit={(e) => {
            e.preventDefault();
            if (input.trim()) {
              const messageText = input;
              const tempId = `temp-${Date.now()}`;
              
              // Store metadata for the new message
              setMessageMetadata(prev => ({
                ...prev,
                [tempId]: { createdAt: new Date() }
              }));
              
              sendMessage({ text: messageText });
              setInput("");
            }
          }}
        >
          <PromptInputTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="What would you like to know?"
            className="min-h-[60px] max-h-[200px]"
          />
          <PromptInputToolbar>
            <div className="flex-1"></div>
            <PromptInputSubmit disabled={!input} status={status} />
          </PromptInputToolbar>
        </PromptInput>
      </div>
    </div>
  );
}