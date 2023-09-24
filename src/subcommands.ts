import {
  ClaiConfig,
  colors,
  Command,
  CONFIG_PATH,
  fileExists,
  log,
  parseTomlConfig,
} from "../deps.ts";
import { Row, Table } from "../deps.ts";
let chars = {
  "midMid": colors.dim("╋"),
  "mid": colors.dim("━"),
  "middle": colors.dim("┃"),
  "bottom": colors.dim("━"),
  "bottomLeft": colors.dim("┗"),
  "bottomRight": colors.dim("┛"),
  "bottomMid": colors.dim("┻"),
  "top": colors.dim("━"),
  "topLeft": colors.dim("┏"),
  "topMid": colors.dim("┳"),
  "topRight": colors.dim("┓"),
  "left": colors.dim("┃"),
  "leftMid": colors.dim("┣"),
  "right": colors.dim("┃"),
  "rightMid": colors.dim("┫"),
};

const getBorder = () => {
  const b = {};
  for (let [_k, v] of Object.entries(chars)) {
    v = colors.dim(v);
  }
  log.debug(b);
  return chars;
};

const showConfigCmd = new Command()
  .name("show")
  .description("List your options and configurated models.")
  .action(async () => {
    await fileExists(CONFIG_PATH);
    const config: ClaiConfig = parseTomlConfig(CONFIG_PATH);
    const _ = new Table()
      .header(
        Row.from([
          colors.bold.rgb24("Option", 0xbaf97e),
          colors.bold.rgb24("Value", 0xbaf97e),
        ]),
      )
      .body([["default", config.options.default || ""], [
        "glow",
        `${config.options.glow || ""}`,
      ]])
      .border(true)
      .chars(getBorder()).render();

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
          colors.bold.rgb24("Alias", 0xbaf97e),
          colors.bold.rgb24("Name", 0xbaf97e),
          colors.bold.rgb24("Template", 0xbaf97e),
          colors.bold.rgb24("Max New Tokens", 0xbaf97e),
          colors.bold.rgb24("Max Time", 0xbaf97e),
        ])
          .align("center"),
      )
      .body(modelRows)
      .maxColWidth(30)
      .border(true)
      .chars(getBorder())
      .render();
  });
export const configCmd = new Command()
  .name("config")
  .action(() => {
    console.log(configCmd.getHelp());
  })
  .command("show", showConfigCmd);
