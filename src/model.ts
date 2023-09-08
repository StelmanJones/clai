import { ClaiConfig, Model, modelSchema } from "../deps.ts";

export function selectModel(
    config: ClaiConfig,
    model?: string,
    tokens?: number,
    time?: number,
    debug?: boolean,
) {
    let selected_model: Model = {
        alias: "llam",
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
