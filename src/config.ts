import { parse, z } from "../deps.ts";
import * as path from "https://deno.land/std@0.201.0/path/mod.ts";

export const rendererSchema = z.enum(["charmd", "glow", "raw"]).default("raw");
export type Renderer = z.infer<typeof rendererSchema>;

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
