import { ClaiConfig, Model, ModelSchema } from "../deps.ts";

export function selectModel(
  config: ClaiConfig,
  model?: string,
  tokens?: number,
  time?: number,
  debug?: boolean,
) {
  let selected_model: Model = ModelSchema.parse({
    alias: "llama",
    name: "meta-llama/Llama-2-70b-chat-hf",
    template: "[INST] {{input}} [/INST]",
  });
  if (model) {
    if (config.model) {
      for (const mod of config.model) {
        if (mod?.alias == model) {
          selected_model = ModelSchema.parse(mod);
        }
      }
    } else selected_model.name = model;
  } else if (config.options.default) {
    if (config.model) {
      for (const mod of config.model) {
        if (mod?.alias == config.options.default) {
          selected_model = ModelSchema.parse(mod);
        }
      }
    }
  }
  if (tokens) selected_model.params.max_new_tokens = tokens;
  if (time) selected_model.params.max_time = time;
  if (debug) {
    console.log(selected_model);
  }
  return selected_model;
}
