import {
  claiTheme,
  colors,
  Command,
  HfInference,
  parseTomlConfig,
  runInference,
  runInferenceStream,
} from "../deps.ts";
import { CONFIG_PATH, fileExists } from "./config.ts";
import { selectModel } from "./model.ts";
import { pipeToGlow, spinners, withSpinner } from "./spinners.ts";
import { configCmd } from "./subcommands.ts";
const API_TOKEN = Deno.env.get("HUGGING");

if (import.meta.main) {
  await new Command()
    .name("CLAI")
    .version("1.2.0")
    .description(
      `Huggingface AI on the command line! \n\nMade by ${
        claiTheme.highlight("StelmanJones")
      }. ${claiTheme.dimmed("(https://github.com/StelmanJones)")}`,
    )
    .option(
      "-g, --glow",
      `Pipe the output to glow ${
        colors.dim.bold("(https://github.com/charmbracelet/glow)")
      }`,
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
      "The max amount of time generating a response.",
    )
    .option("-d, --debug", "Print debug info and quit.")
    .option("--md", "Format the response as Markdown.")
    .env(
      "HUGGING=<token:string>",
      "Used to authenticate your inferance requests. You can get your API token at https://huggingface.co/settings/tokens",
    )
    .arguments("<input:string>")
    .action(
      async (
        { model, tokens, time, debug, md, glow },
        input: string,
      ) => {
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

        if (glow) {
          await pipeToGlow(runInference, {
            input,
            client: hf,
            model: selected_model,
          }, {
            color: colors.bold.green,
            textColor: colors.white,
            text: "Generating",
          });
        } // Switch on Markdown flag and run inference.
        else if (md) {
          // withSpinner wraps the runInference call in a spinner.
          await withSpinner(runInference, {
            input,
            client: hf,
            model: selected_model,
          }, {
            color: colors.bold.brightGreen,
            textColor: colors.white,
            text: "Generating",
          });
        } else {
          await runInferenceStream(
            input,
            hf,
            selected_model,
          );
        }
      },
    )
    .command("config", configCmd)
    .parse(Deno.args);
}
