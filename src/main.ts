import {
  claiTheme,
  colors,
  Command,
  HfInference,
  log,
  Model,
  parseTomlConfig,
  runInferenceStream,
} from "../deps.ts";
import {
  CONFIG_PATH,
  fileExists,
  isDebugEnabled,
  RendererType,
} from "./config.ts";
import { selectModel } from "./model.ts";
import { chatCmd, configCmd } from "./subcommands.ts";
import { highlightGreen } from "./theme.ts";
const API_TOKEN = Deno.env.get("HUGGING");

if (import.meta.main) {
  await new Command()
    .type("renderers", new RendererType())
    .example(
      "Renderers",
      `
    ${highlightGreen("charmd")} ${
        colors.bold.dim("(https://deno.land/x/charmd)")
      }
    ${highlightGreen("glow")} ${
        colors.bold.dim("(https://github.com/charmbracelet/glow)")
      }
    `,
    )
    .name(colors.bold(`CL${colors.dim(`(${colors.green("A")})`)}I`))
    .version("1.3.0")
    .description(
      `Huggingface AI on the command line! \n\nMade by ${
        claiTheme.highlight("StelmanJones")
      }. ${claiTheme.dimmed("(https://github.com/StelmanJones)")}`,
    )
    .option(
      "-r, --renderer [renderer:renderers]",
      "Select the renderer to use.",
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
    .env(
      "HUGGING=<token:string>",
      "Used to authenticate your inferance requests. You can get your API token at https://huggingface.co/settings/tokens",
    )
    .arguments("<input:string>")
    .action(
      async (
        { model, tokens, time, debug, renderer },
        input: string,
      ) => {
        // Inference client
        const hf = new HfInference(API_TOKEN);

        //Check config
        await fileExists(CONFIG_PATH);

        // Parse said config.
        const config = parseTomlConfig(CONFIG_PATH);
        if (isDebugEnabled()) {
          log.info(config);
        }

        //Select model based on config and flags.
        const selected_model: Model = selectModel(
          config,
          // @ts-ignore Just do it.
          model,
          tokens,
          time,
          debug,
        );

        if (renderer) {
          await runInferenceStream(input, hf, selected_model, renderer);
        } else {
          await runInferenceStream(
            input,
            hf,
            selected_model,
            config.options.renderer,
          );
        }
      },
    )
    .command("config", configCmd)
    .description("Configuration related commands.")
    .reset()
    .command("chat", chatCmd)
    .parse(Deno.args);
}
