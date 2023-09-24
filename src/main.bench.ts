import { HfInference } from "../deps.ts";
import { selectModel } from "./model.ts";
import { CONFIG_PATH, fileExists, parseTomlConfig } from "./config.ts";

const glow = false;
const API_TOKEN = Deno.env.get("HUGGING");
const debug = false;
const model = "falcon";
const tokens = 1000;
const time = 30;

Deno.bench("Main fn", async function () {
  // Inference client
  const hf = new HfInference(API_TOKEN);

  //Check config
  await fileExists(CONFIG_PATH);

  // Parse said config.
  const config = parseTomlConfig(CONFIG_PATH);
  if (debug) {
    console.log(config);
  }

  //Select model based on config and flags.
  // @ts-ignore Just do it.
  const selected_model = selectModel(config, model, tokens, time, debug);

  // Switch on Markdown flag and run inference.
  if (glow) {
    let i = 0;
  }
});
