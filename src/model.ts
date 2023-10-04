import { P } from "npm:ts-pattern";
import { ClaiConfig, Model, ModelSchema } from "../deps.ts";

export function selectModel(
  config: ClaiConfig,
  model?: string,
  tokens?: number,
  time?: number,
  debug?: boolean,
  topk?: number,
  topp?: number,
  temp?: number,
  truncate?: number,
  penalty?: number,
) {
  let selected_model: Model = ModelSchema.parse({
    alias: "llama",
    name: "meta-llama/Llama-2-70b-chat-hf",
    template: "[INST] {{input}} [/INST]",
    params: {
      max_new_tokens: 256,
      max_inf_time: 30,
    },
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
  if (temp) selected_model.params.temperature = temp;
  if (truncate) selected_model.params.truncate = truncate;
  if (penalty) selected_model.params.repetition_penalty = penalty;
  if (topk) selected_model.params.top_k = topk;
  if (topp) selected_model.params.top_p = topp;

  return selected_model;
}
