import { match, parse, z } from "../deps.ts";
import * as path from "https://deno.land/std@0.201.0/path/mod.ts";
import {
  ArgumentValue,
  EnumType,
  Type,
  ValidationError,
} from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";

const renderer_values = ["charmd", "glow", "raw"];
export const renderers = new EnumType(renderer_values);

export type Model = z.infer<typeof ModelSchema>;
export type ClaiConfig = z.infer<typeof ConfigSchema>;

export class RendererType extends Type<string> {
  private readonly renderers = ["charmd", "glow", "raw"];
  values(): Array<string> {
    return [
      `charmd`,
      `glow`,
      "raw",
    ];
  }

  public parse({ label, name, value }: ArgumentValue): string {
    if (!this.renderers.includes(value)) {
      throw new ValidationError(
        `${label} "${name}" must be a valid color, but got "${value}". Possible values are: ${
          this.renderers.join(", ")
        }`,
      );
    }
    return value;
  }

  complete(): Array<string> {
    return this.renderers;
  }
}

const TextGenerationArgsSchema = z.object({
  do_sample: z.boolean().optional(),
  max_new_tokens: z.number().int().min(0).default(512),
  max_time: z.number().min(0).max(120).default(30),
  num_return_sequences: z.number().int().min(1).optional(),
  repetition_penalty: z.number().min(0).max(100).optional(),
  return_full_text: z.boolean().default(false),
  temperature: z.number().min(0).max(100).optional(),
  top_k: z.number().int().optional(),
  top_p: z.number().min(0).max(1).optional(),
  truncate: z.number().int().optional(),
});
export const RendererSchema = z.enum(["charmd", "glow", "raw"]).default("raw");
export const ModelSchema = z.object({
  alias: z.string(),
  name: z.string(),
  template: z.string().includes("{{input}}", {
    message: "Your prompt template must contain the {{input}} matcher!",
  }),
  params: TextGenerationArgsSchema,
});

const ConfigSchema = z.object({
  model: z.array(ModelSchema).optional(),

  options: z.object({
    default: z.string().optional(),
    renderer: RendererSchema,
  }),
});

export async function fileExists(
  filepath: string,
): Promise<boolean> {
  try {
    const _file = await Deno.stat(filepath);

    return true;
  } catch (e) {
    if (e instanceof Deno.errors.NotFound) {
      await Deno.mkdir(path.dirname(filepath), {
        recursive: true,
      });
      await Deno.writeTextFile(
        filepath,
        '[options]\n\nrenderer="raw"',
      );
    }
  }
  return false;
}

export function parseTomlConfig(path: string): ClaiConfig {
  let toml_data: Record<string, unknown>;
  let config: ClaiConfig;
  try {
    toml_data = parse(Deno.readTextFileSync(path));
  } catch (e) {
    console.log(e);
    throw new Error("Failed to parse config file");
  }
  try {
    config = ConfigSchema.parse(toml_data);
  } catch (e) {
    console.log(e);
    throw new Error("Failed to validate config file");
  }
  return config;
}
export const CONFIG_PATH = path.fromFileUrl(
  `file://${Deno.env.get("HOME")}/.config/clai/config.toml`,
);

export function isDebugEnabled(): boolean {
  const val = Deno.env.get("CLAI_DEBUG");
  if (val) {
    return match(Number(val))
      .with(1, () => true)
      .with(0, () => false)
      .otherwise(() => false);
  } else {
    return false;
  }
}
