"use client";

import {
  AssistantRuntimeProvider,
  AttachmentAdapter,
  CompleteAttachment,
  PendingAttachment,
  useLocalRuntime,
  type ChatModelAdapter,
} from "@assistant-ui/react";

import {
  AssistantChatTransport,
  useChatRuntime,
} from "@assistant-ui/react-ai-sdk";
import { Thread } from "@/components/assistant-ui/thread";
import { useDataStreamRuntime } from "@assistant-ui/react-data-stream";
import { ThreadListSidebar } from "@/components/assistant-ui/threadlist-sidebar";

class VisionImageAdapter implements AttachmentAdapter {
  accept = "image/jpeg,image/png,image/webp,image/gif";
  async add({ file }: { file: File }): Promise<PendingAttachment> {
    // Validate file size (e.g., 20MB limit for most LLMs)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (file.size > maxSize) {
      throw new Error("Image size exceeds 20MB limit");
    }
    // Return pending attachment while processing
    return {
      id: crypto.randomUUID(),
      type: "image",
      name: file.name,
      file,
      status: { type: "running" },
    };
  }
  async send(attachment: PendingAttachment): Promise<CompleteAttachment> {
    // Convert image to base64 data URL
    const base64 = await this.fileToBase64DataURL(attachment.file);
    // Return in assistant-ui format with image content
    return {
      id: attachment.id,
      type: "image",
      name: attachment.name,
      content: [
        {
          type: "image",
          image: base64, // data:image/jpeg;base64,... format
        },
      ],
      status: { type: "complete" },
    };
  }
  async remove(attachment: PendingAttachment): Promise<void> {
    // Cleanup if needed (e.g., revoke object URLs if you created any)
  }
  private async fileToBase64DataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        // FileReader result is already a data URL
        resolve(reader.result as string);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

const MyModelAdapter: ChatModelAdapter = {
  async run({ messages, abortSignal }) {
    // Convert messages to format expected by your vision-capable API
    const formattedMessages = messages.map((msg) => {
      if (
        msg.role === "user" &&
        msg.content.some((part) => part.type === "image")
      ) {
        // Format for GPT-4V or similar vision models
        return {
          role: "user",
          content: msg.content.map((part) => {
            if (part.type === "text") {
              return { type: "text", text: part.text };
            }
            if (part.type === "image") {
              return {
                type: "image_url",
                image_url: { url: part.image },
              };
            }
            return part;
          }),
        };
      }
      // Regular text messages
      return {
        role: msg.role,
        content: msg.content
          .filter((c) => c.type === "text")
          .map((c) => c.text)
          .join("\n"),
      };
    });
    // Send to your vision-capable API
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: formattedMessages }),
      signal: abortSignal,
    });
    const data = await response.json();
    return {
      content: [{ type: "text", text: data.message }],
    };
  },
};
// Create runtime with vision image adapter

export const Assistant = () => {
  const runtime = useLocalRuntime(MyModelAdapter, {
    adapters: {
      attachments: new VisionImageAdapter(),
    },
  });
  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="grid h-dvh grid-cols-[200px_1fr] gap-x-2 px-4 py-4">
        <ThreadListSidebar />

        <Thread />
      </div>
    </AssistantRuntimeProvider>
  );
};
