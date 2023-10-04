import { toPathString } from "https://deno.land/std@0.196.0/fs/_util.ts";
import {
  claiTheme,
  colors,
  Command,
  CompletionsCommand,
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
import { configCmd } from "./subcommands.ts";
import { highlightGreen, rangeTooltip } from "./theme.ts";
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
    .name("clai")
    .version("1.3.0")
    .description(
      `Huggingface AI on the command line! \n\nMade by ${
        claiTheme.highlight("StelmanJones")
      }. ${claiTheme.dimmed("(https://github.com/StelmanJones)")}`,
    )
    .arguments("<input:string>")
    .option(
      "-r, --renderer [renderer:renderers]",
      "Select the renderer to use.",
    )
    .option(
      "-m, --model [model:string]",
      "Specify which model to use.",
    )
    .group("Inference Parameters")
    .option(
      "--tokens [tokens:integer]",
      `Max amount of tokens to generate.`,
    )
    .option(
      "--time [time:integer]",
      `The max amount of time generating a response. ${rangeTooltip(0, 120)}`,
    )
    .option(
      "-p, --penalty [penalty:number]",
      `Set repetition penalty. ${rangeTooltip(0, 100.0)}`,
    )
    .option(
      "-t, --temp [temperature:number]",
      `The value used to module the logits distribution. ${
        rangeTooltip(0, 100.0)
      }`,
    )
    .option(
      "-tk, --topk [topk:integer]",
      `The number of highest probability vocabulary tokens to keep for filtering.`,
    )
    .option(
      "-tp, --topp [topp:number]",
      `Tokens that are within the sample operation of text generation.`,
    )
    .option(
      "-T, --truncate [truncate:integer]",
      "Truncate inputs tokens to the given size.",
    )
    .group("Other")
    .option("-d, --debug", "Print debug info.")
    .env(
      "HUGGING=<token:string>",
      "Used to authenticate your inferance requests. You can get your API token at https://huggingface.co/settings/tokens",
    )
    .action(
      async (
        {
          model,
          tokens,
          time,
          temp,
          penalty,
          topk,
          topp,
          truncate,
          debug,
          renderer,
        },
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
          topk,
          topp,
          truncate,
          penalty,
          temp,
        );

        let selected_renderer: string | true;

        if (renderer) selected_renderer = renderer;
        else if (config.options.renderer) {
          selected_renderer = config.options.renderer;
        } else selected_renderer = "raw";

        await runInferenceStream(input, hf, selected_model, selected_renderer);
      },
    )
    .command("completions", new CompletionsCommand())
    .command("config", configCmd)
    .description("Configuration related commands.")
    .reset()
    .parse(Deno.args);
}
