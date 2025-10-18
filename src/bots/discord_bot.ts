import { Client, GatewayIntentBits, TextChannel } from "discord.js";
import { sendMessage } from "../ai_pipeline/model_inference.js";

export const dis_client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

dis_client.once("ready", () => {
  console.log(`Logged in as ${dis_client.user?.tag}!`);
});

dis_client.on("messageCreate", async (message) => {
  if (message.content) {
    if (message.author.bot) return;
    const ch = message.channel as TextChannel;
    ch.sendTyping();
    const res = await sendMessage([{ type: "text", text: message.content }]);
    message.reply(res);
  }
});
