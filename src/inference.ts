import { colors, HfInference, log, porcelain, tty } from "../deps.ts";
import Spinner, { Options } from "./spinners.ts";

export async function runInferenceStream(
  input: string,
  client: HfInference,
  model: {
    alias: string;
    name: string;
    max_new_tokens: number;
    max_inf_time: number;
    template: string;
  },
) {
  const formatted_input = formatPrompt(input, model.template);
  for await (
    const output of client.textGenerationStream({
      model: model.name,
      inputs: formatted_input,
      parameters: {
        max_time: model.max_inf_time,
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
  return res.generated_text;
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
