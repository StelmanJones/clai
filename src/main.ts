import {
  colors,
  Command,
  HfInference,
  log,
  parseTomlConfig,
  tty,
} from "../deps.ts";
import { CONFIG_PATH, fileExists } from "./config.ts";
import { selectModel } from "./model.ts";
import { runInference, runInferenceStream } from "../deps.ts";
import { forPromise } from "./spinners.ts";
const API_TOKEN = Deno.env.get("HUGGING");

if (import.meta.main) {
  await new Command()
    .name("CLAI")
    .version("1.0.0")
    .description(
      `Huggingface AI on the command line! \n\nMade by ${
        colors.brightMagenta(colors.bold("StelmanJones"))
      }. ${colors.bold(colors.dim("(https://github.com/StelmanJones)"))}`,
    )
    .option(
      "-m, --model [model:string]",
      "Specify which model to use.",
    )
    .option(
      "--tokens [tokens:integer]",
      "Max amount of tokens to generate.",
    )
    .option(
      "--time [time:integer]",
      "The max amount of time generating a query.",
    )
    .option("-d, --debug", "Print debug info and quit.")
    .option("--md", "Format the response as Markdown.")
    .env(
      "HUGGING=<token:string>",
      "Used to authenticate your inferance requests. You can get your API token at https://huggingface.co/settings/tokens",
    )
    .arguments("<query:string>")
    .action(
      async (
        { model, tokens, time, debug, md },
        query: string,
      ) => {
        const hf = new HfInference(API_TOKEN);
        await fileExists(CONFIG_PATH);
        const config = parseTomlConfig(CONFIG_PATH);
        if (debug) {
          console.log(config);
        }
        // @ts-ignore Just do it.
        let selected_model = selectModel(config, model, tokens, time, debug);
        if (md) {
          await forPromise(runInference, {
            input: query,
            client: hf,
            model: selected_model,
          }, {
            color: colors.bold.green,
            textColor: colors.bold.white,
            text: "Generating...",
          });
        } else {
          await runInferenceStream(
            query,
            hf,
            selected_model,
          );
        }
      },
    )
    .parse(Deno.args);
}
