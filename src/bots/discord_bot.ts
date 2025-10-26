import {
  Client,
  GatewayIntentBits,
  ChannelType,
  TextChannel,
} from "discord.js";
import { sendMessage } from "../ai_pipeline/model_inference.js";

const TOKEN = process.env.DISCORD_BOT_TOKEN!;

// ================== CLIENT ==================
export const dis_client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

dis_client.once("ready", () => {
  console.log(`✅ Logged in as ${dis_client.user?.tag}!`);
});

// ================== MESSAGE HANDLER ==================
dis_client.on("messageCreate", async (message) => {
  if (message.author.bot || !message.guild) return;

  const channel = message.channel;

  // ✅ Check if it's in a forum or forum thread
  const isForumMessage =
    channel.type === ChannelType.GuildForum ||
    ((channel.type === ChannelType.PublicThread ||
      channel.type === ChannelType.PrivateThread ||
      channel.type === ChannelType.AnnouncementThread) &&
      channel.parent?.type === ChannelType.GuildForum);

  if (!isForumMessage) return; // Ignore non-forum channels

  // ================== LOGIC ==================
  // 1️⃣ If it's a new thread's first message → auto reply once
  if (
    channel.type === ChannelType.PublicThread ||
    channel.type === ChannelType.PrivateThread ||
    channel.type === ChannelType.AnnouncementThread
  ) {
    const fetchedMessages = await channel.messages.fetch({ limit: 2 });
    const messageCount = fetchedMessages.size;

    if (messageCount === 1) {
      // First message in the thread
      try {
        await channel.sendTyping();
        const res = await sendMessage([
          { type: "text", text: message.content },
        ]);
        await message.reply(res);
      } catch (err) {
        console.error("❌ Error:", err);
        await message.reply(
          "Something went wrong while processing your message."
        );
      }
      return;
    }
  }

  // 2️⃣ After first message, only respond if bot is tagged
  const botMentioned = message.mentions.has(dis_client.user!);
  if (!botMentioned) return;

  try {
    await message.channel.sendTyping();
    const content = message.content
      .replace(`<@${dis_client.user?.id}>`, "")
      .trim();
    const res = await sendMessage([{ type: "text", text: content }]);
    await message.reply(res);
  } catch (err) {
    console.error("❌ Error:", err);
    await message.reply("Something went wrong while processing your message.");
  }
});

// ================== LOGIN ==================
dis_client.login(TOKEN);
