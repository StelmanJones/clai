import { colors, Command, HfInference, log, parseTomlConfig, tty } from "../deps.ts";
import { CONFIG_PATH, fileExists } from "./config.ts";

const ENDPOINT = "https://api-inference.huggingface.co/models/";
const API_TOKEN = Deno.env.get("HUGGING");

export async function queryML(
    query: string,
    client: HfInference,
    markdown: boolean,
    model: {
        alias: string;
        name: string;
        max_new_tokens: number;
        max_query_time: number;
        prefix: string;
        suffix: string;
    },
) {
    const formatted_input = `${model.prefix} ${query} ${model.suffix}`;

    for await (
        const output of client.textGenerationStream({
            model: model.name,
            inputs: formatted_input,
            parameters: { max_time: model.max_query_time, max_new_tokens: model.max_new_tokens },
        }, { wait_for_model: true, use_cache: false })
    ) {
        if (output.token.text != null) {
            tty.text(colors.dim(output.token.text));
        }
    }
}

const default_model = {
    alias: "llam",
    name: "meta-llama/Llama-2-70b-chat-hf",
    prefix: "[INST]",
    suffix: "[/INST]",
    max_new_tokens: 2000,
    max_query_time: 30,
};

if (import.meta.main) {
    await new Command()
        .name("CLAI")
        .version("0.1.0")
        .description("Huggingface AI on the command line!")
        .option("-m, --model [model:string]", "Specify which model to use.")
        .option("--tokens [tokens:integer]", "Max amount of tokens to generate.")
        .option("--time [time:integer]", "The max amount of time generating a query.")
        .option("-d, --debug", "Print debug info and quit.")
        .env(
            "HUGGING=<token:string>",
            "Used to authenticate your inferance requests. You can get your API token at https://huggingface.co/settings/tokens",
        )
        .arguments("<query:string>")
        .action(async ({ model, tokens, time, debug }, query: string) => {
            const hf = new HfInference(API_TOKEN);
            await fileExists(CONFIG_PATH);
            const config = parseTomlConfig(CONFIG_PATH);
            if (debug) {
                console.log(config);
            }
            let selected_model = default_model;

            if (model) {
                if (config.model) {
                    for (const mod of config.model) {
                        if (mod?.alias == model) selected_model = mod;
                        if (mod?.alias == config.options.default && mod != undefined) selected_model = mod;
                    }
                }
            }
            tokens ? tokens : selected_model.max_new_tokens;
            time ? time : selected_model.max_query_time;
            if (debug) {
                console.log(selected_model);
            }

            await queryML(query, hf, config.options.markdown, selected_model);
        })
        .parse(Deno.args);
}
