import { debug } from "https://deno.land/std@0.201.0/log/mod.ts";
import {
  ClaiConfig,
  colors,
  Command,
  CONFIG_PATH,
  fileExists,
  parseTomlConfig,
  tty,
} from "../deps.ts";
import { Table } from "../deps.ts";
import { ansi } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/mod.ts";
import { Row } from "https://deno.land/x/cliffy@v1.0.0-rc.3/table/row.ts";
import { claiArt, claiTheme } from "./theme.ts";

const CONFIG_IMAGE =
  "https://storage.cloud.google.com/stelmanjonescdn/clai/config.png?authuser=3";

const showConfigCmd = new Command()
  .name("show")
  .description("List your options and configurated models.")
  .action(async () => {
    const config_img = await fetch(CONFIG_IMAGE);
    const img_buffer: ArrayBuffer = await config_img.arrayBuffer();

    await fileExists(CONFIG_PATH);
    const config: ClaiConfig = parseTomlConfig(CONFIG_PATH);
    console.log(ansi.image(img_buffer));
    console.log(colors.green(claiArt.configArt));
    let _ = new Table()
      .header(Row.from(["Default", "Markdown"]))
      .body([[
        config.options.default || "",
        `${config.options.markdown || ""}`,
      ]])
      .border(true)
      .render();

    console.log(colors.cyan(claiArt.modelArt));
    const modelRows: Row[] = [];
    if (config.model) {
      for (const model of config.model) {
        if (model) {
          const r = new Row(
            model.alias,
            model.name,
            model.template,
            `${model.max_new_tokens}`,
            `${model.max_query_time}`,
          ).align("left");
          modelRows.push(r);
        }
      }
    }

    let _models = new Table()
      .header(
        Row.from([
          claiTheme.highlight("Alias"),
          colors.bold("Name"),
          colors.bold("Template"),
          colors.bold("Max New Tokens"),
          colors.bold("Max Time"),
        ])
          .align("center"),
      )
      .body(modelRows)
      .maxColWidth(30)
      .border(true)
      .render();
  });
export const configCmd = new Command()
  .name("config")
  .command("show", showConfigCmd);
