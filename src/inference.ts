import { colors, Command, HfInference, log, parseTomlConfig, tty } from "../deps.ts";
import { CONFIG_PATH, fileExists } from "./config.ts";
import { selectModel } from "./model.ts";

const FALCON_STOP_SEQUENCES = ["\nUser:", "<|endoftext|>", " User:", "###"];

export async function runInferenceStream(
    input: string,
    client: HfInference,
    model: {
        alias: string;
        name: string;
        max_new_tokens: number;
        max_query_time: number;
        template: string;
    },
) {
    const formatted_input = formatPrompt(input, model.template);
    for await (
        const output of client.textGenerationStream({
            model: model.name,
            inputs: formatted_input,
            parameters: {
                max_time: model.max_query_time,
                max_new_tokens: model.max_new_tokens,
                return_full_text: false,
            },
        }, { wait_for_model: true, use_cache: false })
    ) {
        if (output.token.text != null && !output.token.special) {
            tty.text(colors.dim(output.token.text));
        }
    }
}
export async function runInference(
    input: string,
    client: HfInference,
    model: {
        alias: string;
        name: string;
        max_new_tokens: number;
        max_query_time: number;
        template: string;
    },
) {
    const formatted_input = formatPrompt(input, model.template, true);

    const res = await client.textGeneration({
        model: model.name,
        inputs: formatted_input,
        parameters: {
            max_time: model.max_query_time,
            max_new_tokens: model.max_new_tokens,
            return_full_text: false,
        },
    }, { wait_for_model: true, use_cache: false });
    console.log(res.generated_text.slice(formatted_input.length));
}

export function formatPrompt(input: string, template: string, md?: boolean): string {
    if (md) return template.replace("{{input}}", input.trim() + "Format your response as Markdown.");
    return template.replace("{{input}}", input.trim());
}
