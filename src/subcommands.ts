import {
  BoxBuilder,
  ClaiConfig,
  colors,
  Command,
  CONFIG_PATH,
  fileExists,
  keypress,
  KeyPressEvent,
  log,
  parseTomlConfig,
  tty,
} from "../deps.ts";
import { Row, Table } from "../deps.ts";
import { isDebugEnabled } from "./config.ts";
import { highlightGreen } from "./theme.ts";
const chars = {
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
          highlightGreen("Option"),
          highlightGreen("Value"),
        ]),
      )
      .body([["Default", config.options.default || ""], [
        "Renderer",
        `${config.options.renderer || ""}`,
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
            `${model.params.max_new_tokens}`,
            `${model.params.max_time}`,
          ).align("left");
          modelRows.push(r);
        }
      }
    }

    const _models = new Table()
      .header(
        Row.from([
          highlightGreen("Alias"),
          highlightGreen("Name"),
          highlightGreen("Template"),
          highlightGreen("Max New Tokens"),
          highlightGreen("Max Time"),
        ])
          .align("center"),
      )
      .body(modelRows)
      .maxColWidth(30)
      .border(true)
      .chars(getBorder())
      .render();
  });

export const editConfigCmd = new Command()
  .name("edit")
  .description("Edit the config file.")
  .action(async () => {
    const editor = Deno.env.get("EDITOR") || "nano";
    const path = CONFIG_PATH;
    const editorCmd = new Deno.Command(editor, { args: [path] });
    if (isDebugEnabled()) {
      log.info("Command: " + editor + " " + path);
    }

    const process = await editorCmd.spawn();
    const status = await process.status;
    if (isDebugEnabled()) {
      log.info(colors.bold.yellow("Status Code: ") + status.code);
      log.info(colors.yellow.bold("Succeeded: " + status.success));
    }
  });
export const configCmd = new Command()
  .name("config")
  .action(() => {
    console.log(configCmd.getHelp());
  })
  .command("show", showConfigCmd)
  .reset()
  .command("edit", editConfigCmd);

export const chatCmd = new Command()
  .name("chat")
  .description("Start an interactive chat session.")
  .action(async () => {
    const term = tty({ reader: Deno.stdin, writer: Deno.stdout });
    term.cursorSave();
    term.cursorHide();

    const b = new BoxBuilder("Hello World!").setFullscreen(true).setTitle(
      "Chat",
    )
      .setMargin(2)
      .build();
    b.render();

    const k: KeyPressEvent = await keypress();
    if (k.key === "q") {
      term.cursorShow();
      term.cursorRestore();
      Deno.exit(0);
    }
  });

