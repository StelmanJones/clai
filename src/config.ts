import { colors, parse, z } from "../deps.ts";
import * as path from "https://deno.land/std@0.201.0/path/mod.ts";
import {
  ArgumentValue,
  EnumType,
  Type,
  ValidationError,
} from "https://deno.land/x/cliffy@v1.0.0-rc.3/command/mod.ts";

const renderer_values = ["charmd", "glow", "raw"];

export const renderers = new EnumType(renderer_values);
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
export const rendererSchema = z.enum(["charmd", "glow", "raw"]).default("raw");
export const modelSchema = z.object({
  alias: z.string(),
  name: z.string(),
  template: z.string().includes("{{input}}", {
    message: "Your prompt template must contain the {{input}} matcher!",
  }),
  max_new_tokens: z.number().min(100),
  max_inf_time: z.number().min(5).max(120),
}).optional();

export type Model = z.infer<typeof modelSchema>;

const configSchema = z.object({
  model: z.array(modelSchema).optional(),

  options: z.object({
    default: z.string().optional(),
    renderer: rendererSchema,
  }),
});

export type ClaiConfig = z.infer<typeof configSchema>;

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
        "[options]\n\nglow=false",
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
    config = configSchema.parse(toml_data);
  } catch (e) {
    console.log(e);
    throw new Error("Failed to validate config file");
  }
  return config;
}
export const CONFIG_PATH = path.fromFileUrl(
  `file://${Deno.env.get("HOME")}/.config/clai/config.toml`,
);
