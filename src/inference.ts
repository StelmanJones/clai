import {
  colors,
  HfInference,
  type Model,
  renderMarkdown,
  tty,
} from "../deps.ts";
import { installGlow, Options } from "./spinners.ts";

export async function runInferenceStream(
  input: string,
  client: HfInference,
  model: Model,
  renderer: string | true,
) {
  const formatted_input = formatPrompt(input, model.template);
  for await (
    const output of client.textGenerationStream({
      model: model.name,
      inputs: formatted_input,
      parameters: model.params,
    }, { wait_for_model: true, use_cache: false })
  ) {
    if (output.token.text != null && !output.token.special) {
      tty.text(colors.dim(output.token.text));
    }
    switch (renderer) {
      case "charmd":
        {
          if (output.generated_text) {
            tty.clearScreen();
            tty.text(renderMarkdown(output.generated_text));
          }
        }
        break;
      case "glow": {
        if (output.generated_text) {
          tty.clearScreen();
          await renderWithGlow(output.generated_text);
        }
        break;
      }
      default: {
        break;
      }
    }
  }
}

export async function runInference(
  input: string,
  client: HfInference,
  model: Model,
) {
  const formatted_input = formatPrompt(input, model.template, true);

  const res = await client.textGeneration({
    model: model.name,
    inputs: formatted_input,
    parameters: model.params,
  }, { wait_for_model: true, use_cache: false });
  return res.generated_text;
}

export async function renderWithGlow(t: string) {
  await installGlow();

  let process: Deno.ChildProcess;
  const cmd = new Deno.Command("glow", {
    args: ["-"],
    stdin: "piped",
    stdout: "inherit",
  });
  try {
    //Spawn Glow subprocess.
    process = cmd.spawn();

    const writer = await process.stdin.getWriter();
    writer.write(new TextEncoder().encode(t));
    writer.releaseLock();
    await process.stdin.close();
    await process.output();
  } catch (e) {
    console.log(e);
  }
}

export function formatPrompt(
  input: string,
  template: string,
  glow?: boolean,
): string {
  if (glow) {
    return template.replace(
      "{{input}}",
      input.trim() + "Format the response as Markdown.",
    );
  }
  return template.replace("{{input}}", input.trim());
}

type InputOptions = Partial<Options>;
