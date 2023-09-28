import { pipeToGlow, renderWithCharmd } from "./spinners.ts";
import {
  claiTheme,
  colors,
  Command,
  HfInference,
  Model,
  parseTomlConfig,
  runInference,
  runInferenceStream,
} from "../deps.ts";
import { CONFIG_PATH, fileExists } from "./config.ts";
import { selectModel } from "./model.ts";
import { charmdCmd, chatCmd, configCmd } from "./subcommands.ts";
const API_TOKEN = Deno.env.get("HUGGING");

if (import.meta.main) {
  await new Command()
    .name(colors.bold(`CL${colors.dim(`(${colors.green("A")})`)}I`))
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
    .option("-c, --charmd", "Print with charmd.")
    .option("-d, --debug", "Print debug info and quit.")
    .env(
      "HUGGING=<token:string>",
      "Used to authenticate your inferance requests. You can get your API token at https://huggingface.co/settings/tokens",
    )
    .arguments("<input:string>")
    .action(
      async (
        { model, tokens, time, debug, glow, charmd },
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
        const selected_model: Model = selectModel(
          config,
          // @ts-ignore Just do it.
          model,
          tokens,
          time,
          debug,
        );

        if (glow || charmd) {
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
          } else {
            await runInferenceStream(
              input,
              hf,
              selected_model,
              charmd = true,
            );
          }
        } else {
          switch (config.options.renderer) {
            case "glow": {
              await pipeToGlow(runInference, {
                input,
                client: hf,
                model: selected_model,
              }, {
                color: colors.bold.green,
                textColor: colors.white,
                text: "Generating",
              });
              break;
            }

            case "charmd": {
              await runInferenceStream(
                input,
                hf,
                selected_model,
                charmd = true,
              );
              break;
            }
            case "raw": { // Switch on Markdown flag and run inference.x
              await runInferenceStream(
                input,
                hf,
                selected_model,
              );
            }
          }
        }
      },
    )
    .command("config", configCmd)
    .reset()
    .command("chat", chatCmd)
    .parse(Deno.args);
}
