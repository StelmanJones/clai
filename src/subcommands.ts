import {
  ClaiConfig,
  colors,
  Command,
  CONFIG_PATH,
  fileExists,
  parseTomlConfig,
} from "../deps.ts";
import { Row, Table } from "../deps.ts";

const showConfigCmd = new Command()
  .name("show")
  .description("List your options and configurated models.")
  .action(async () => {
    await fileExists(CONFIG_PATH);
    const config: ClaiConfig = parseTomlConfig(CONFIG_PATH);
    const _ = new Table()
      .header(Row.from(["Default", "Markdown"]))
      .body([[
        config.options.default || "",
        `${config.options.markdown || ""}`,
      ]])
      .border(true)
      .render();

    const modelRows: Row[] = [];
    if (config.model) {
      for (const model of config.model) {
        if (model) {
          const r = new Row(
            model.alias,
            model.name,
            model.template,
            `${model.max_new_tokens}`,
            `${model.max_inf_time}`,
          ).align("left");
          modelRows.push(r);
        }
      }
    }

    const _models = new Table()
      .header(
        Row.from([
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
