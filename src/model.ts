import { ClaiConfig, Model } from "../deps.ts";

export function selectModel(
  config: ClaiConfig,
  model?: string,
  tokens?: number,
  time?: number,
  debug?: boolean,
) {
  let selected_model: Model = {
    alias: "llama",
    name: "meta-llama/Llama-2-70b-chat-hf",
    template: "[INST] {{input}} [/INST]",
    max_new_tokens: 2000,
    max_query_time: 30,
  };
  if (model) {
    if (config.model) {
      for (const mod of config.model) {
        if (mod?.alias == model) {
          selected_model = mod;
        }
      }
    } else selected_model.name = model;
  } else if (config.options.default) {
    if (config.model) {
      for (const mod of config.model) {
        if (mod?.alias == config.options.default) {
          selected_model = mod;
        }
      }
    }
  }
  if (tokens) selected_model.max_new_tokens = tokens;
  if (time) selected_model.max_query_time = time;
  if (debug) {
    console.log(selected_model);
  }
  return selected_model;
}

export function getModelParent(task_name: string): string[] {
  let parents: string[];
  if (task_name == "text2text-generation") {
    parents = [
      "google",
      "facebook",
      "microsoft",
      "langboat",
      "bloom",
      "allenai",
      "mbzuai",
      "lmsys",
      "starmpcc",
      "haining",
      "kaludi",
    ];
  } else {
    parents = [
      "google",
      "facebook",
      "microsoft",
      "langboat",
      "databricks",
      "aisquared",
      "bloom",
      "allenai",
      "tiiuae",
      "openlm",
      "stabilityai",
      "eleutherai",
      "mbzuai",
      "cerebras",
      "open_assistant",
      "nomic_ai",
      "blinkdl",
      "lmsys",
      "together_computer",
      "mosaic_ml",
      "h20ai",
    ];
  }
  return parents;
}

export function getText2TextModel(m: string) {
}
