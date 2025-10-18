import { DISCORD_BOT_KEY } from "../../config.js";
import { dis_client } from "./discord_bot.js";

export const authorize_bots = () => {
  dis_client.login(DISCORD_BOT_KEY);
};
