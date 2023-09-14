import { writeAllSync } from "https://deno.land/std@0.122.0/streams/conversion.ts";
import { colors, HfInference,  tty } from "../deps.ts";
import * as stdColors from "https://deno.land/std@0.122.0/fmt/colors.ts";
export interface Spinner {
  interval: number;
  frames: string[];
}
export type Spinners = "windows" | "dots" | "arc";
export const spinners = {
  windows: {
    interval: 80,
    frames: ["/", "-", "\\", "|"],
  },
  dots: {
    interval: 80,
    frames: ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"],
  },
  arc: {
    interval: 100,
    frames: ["◜", "◠", "◝", "◞", "◡", "◟"],
  },
};
export type Chainable<T, E extends keyof T | null = null> = {
  [P in keyof T]: P extends E ? T[P] : Chainable<T, E> & T[P];
};

type ExcludedColorMethods = "setColorEnabled" | "getColorEnabled";

const glowCmd = new Deno.Command("glow", {
  stderr: "piped",
  stdin: "piped",
  stdout: "piped",
});

// Terminal escape sequences
const ESC = "\x1b[";

export function writeLine(
  writer: Deno.WriterSync,
  encoder: TextEncoder,
  text: string,
  indent?: number,
) {
  writeAllSync(
    writer,
    encoder.encode(`\r${indent ? ESC + indent + "C" : ""}${text}`),
  );
}

/**
 * Clears the line and performs a carriage return
 */
export function clearLine(writer: Deno.WriterSync, encoder: TextEncoder) {
  writeAllSync(writer, encoder.encode(ESC + "2K\r"));
}

/**
 * Hides the terminal cursor
 */
export function hideCursor(writer: Deno.WriterSync, encoder: TextEncoder) {
  writeAllSync(writer, encoder.encode(ESC + "?25l"));
}

/**
 * Shows the terminal cursor
 */
export function showCursor(writer: Deno.WriterSync, encoder: TextEncoder) {
  writeAllSync(writer, encoder.encode(ESC + "?25h"));
}
export interface Options {
  text: string;
  textIndex: number;
  color:
    & Chainable<typeof stdColors, ExcludedColorMethods>
    & ((str: string) => string);

  textColor:
    & Chainable<typeof stdColors, ExcludedColorMethods>
    & ((str: string) => string);
  spinner: Spinner;
  prefixText: string;
  indent: number;
  cursor: boolean;
  writer: Deno.WriterSync;
}
type InputOptions = Partial<Options>;

export default class CrayonSpinner {
  private options: Options = {
    text: "",
    textIndex: 0,
    color: colors.white,
    spinner: Deno.build.os === "windows" ? spinners.windows : spinners.dots,
    textColor: colors.white,
    prefixText: "",
    indent: 0,
    cursor: false,
    writer: Deno.stdout,
  };

  // deno-lint-ignore no-explicit-any
  private timeoutRef: any;
  private spinning = false;
  private currentFrame = 0;
  private textEncoder = new TextEncoder();

  constructor(options?: InputOptions | string) {
    if (!options) return;
    if (typeof options === "string") {
      options = {
        text: options,
      };
    }
    Object.assign(this.options, options);
    clearLine(this.options.writer, this.textEncoder);

    this.render();
  }

  public set(options: InputOptions | string) {
    if (typeof options === "string") {
      options = {
        text: options,
      };
      clearLine(this.options.writer, this.textEncoder);
    }
    Object.assign(this.options, options);
    this.render();
    return this;
  }

  public setSpinner(spinner: Spinners) {
    Object.assign(this.options.spinner, spinners[spinner]);
    return this;
  }
  /**
   * Starts the spinner
   * @param text The text to display after the spinner
   */
  start(text?: string) {
    if (this.spinning) {
      this.stop();
    }
    clearLine(this.options.writer, this.textEncoder);

    this.spinning = true;

    if (text) this.set(text);

    if (!this.options.cursor) {
      hideCursor(this.options.writer, this.textEncoder);
    }

    this.timeoutRef = setInterval(() => {
      this.currentFrame = (this.currentFrame + 1) %
        this.options.spinner.frames.length;

      this.render();
    }, this.options.spinner.interval);
    return this;
  }

  /**
   * Stops the spinner and holds it in a static state. Returns the instance.
   * @param options The options to apply after stopping the spinner
   */
  stopAndPersist(options?: InputOptions) {
    clearLine(this.options.writer, this.textEncoder);

    clearInterval(this.timeoutRef);
    this.spinning = false;
    if (options) this.set(options);
    clearLine(this.options.writer, this.textEncoder);

    return this;
  }

  /**
   * Renders the next frame of the spinner when it is stopped.
   */
  renderNextFrame() {
    if (this.spinning) {
      throw new Error(
        "You cannot manually render frames when the spinner is running, run stopAndPersist() first.",
      );
    }
    this.currentFrame = (this.currentFrame + 1) %
      this.options.spinner.frames.length;
    this.render();
    return this;
  }

  /**
   * Stops the spinner and clears its line
   */
  stop() {
    clearInterval(this.timeoutRef);
    clearLine(this.options.writer, this.textEncoder);
    clearLine(this.options.writer, this.textEncoder);

    if (!this.options.cursor) {
      showCursor(this.options.writer, this.textEncoder);
    }
    this.spinning = false;
    clearLine(this.options.writer, this.textEncoder);
    return this;
  }

  /**
   * Stops the spinner and leaves a message in its place
   * @param text The message to show when stopped
   * @param flair The icon to prepend the message
   */
  stopWithFlair(text: string = this.options.text, flair: string) {
    this.stop();
    clearLine(this.options.writer, this.textEncoder);

    writeLine(
      this.options.writer,
      this.textEncoder,
      `${flair} ${text}\n`,
      this.options.indent,
    );
    return this;
  }

  /**
   * Stops the spinner and leaves a success message.
   *
   * The function is a wrapper around ```stopWithFlair```.
   * @param text The message to be shown when stopped
   */
  succeed(text: string = this.options.text) {
    return this.stopWithFlair(
      text,
      colors.bold.green(
        Deno.build.os === "windows" ? String.fromCharCode(30) : "",
      ),
    );
  }

  /**
   * Stops the spinner and leaves a failure message.
   *
   * The function is a wrapper around ```stopWithFlair```.
   * @param text The message to be shown when stopped
   */
  fail(text: string = this.options.text) {
    return this.stopWithFlair(text, colors.bold.red("X"));
  }

  /**
   * Stops the spinner and leaves a warning message.
   *
   * The function is a wrapper around ```stopWithFlair```.
   * @param text The message to be shown when stopped
   */
  warn(text: string = this.options.text) {
    return this.stopWithFlair(text, colors.bold.yellow("!"));
  }

  /**
   * Stops the spinner and leaves an information message.
   *
   * The function is a wrapper around ```stopWithFlair```.
   * @param text The message to be shown when stopped
   */
  info(text: string = this.options.text) {
    return this.stopWithFlair(text, colors.bold.blue("i"));
  }

  /**
   * Returns whether the instance is currently spinning
   */
  isSpinning(): boolean {
    return this.spinning;
  }

  /**
   * Returns the current spinner frame
   */
  getFrame(): string {
    return this.options.spinner.frames[this.currentFrame];
  }

  /**
   * Gets the current text
   */
  getText(): string {
    return this.options.text;
  }

  /**
   * Renders each frame of the spinner
   */
  private render() {
    const textLength = this.options.text.length;
    if (this.options.textIndex === textLength - 1) this.options.textIndex = 0;
    else this.options.textIndex += 1;
    clearLine(this.options.writer, this.textEncoder);

    tty.eraseLine();

    writeLine(
      this.options.writer,
      this.textEncoder,
      `${this.options.prefixText}${
        this.options.color(
          this.options.spinner.frames[this.currentFrame],
        )
      } ${
        this.options.textColor(
          this.options.text.slice(0, this.options.textIndex) +
            colors.magenta(
              this.options.text[this.options.textIndex],
            ) +
            this.options.textColor(
              this.options.text.slice(this.options.textIndex + 1),
            ),
        )
      }`,
      this.options.indent,
    );
  }
}

/**
 * Starts a spinner for a promise
 */
export const withSpinner = async (
  // deno-lint-ignore ban-types
  action: Function,
  args: {
    input: string;
    client: HfInference;
    model: {
      alias: string;
      name: string;
      max_new_tokens: number;
      max_query_time: number;
      template: string;
    };
  },
  options: InputOptions,
) => {
  const spinner = new CrayonSpinner(options).start();

  await (async () => {
    try {
      const res = await action(args.input, args.client, args.model);

      tty.clearTerminal();
      spinner.succeed(res);
    } catch (e) {
      spinner.fail(e);
    }
  })();
  tty.clearTerminal();

  return spinner;
};

/*
export const pipeToGlow = async (
  // deno-lint-ignore ban-types
  action: Function,
  args: {
    input: string;
    client: HfInference;
    model: {
      alias: string;
      name: string;
      max_new_tokens: number;
      max_query_time: number;
      template: string;
    };
  },
  options: InputOptions,
) => {
  const spinner = new CrayonSpinner(options).start();

  await (async () => {
    try {


      const res = await action(args.input, args.client, args.model);
      tty.clearTerminal()
      spinner.succeed(res)
      const glow = await new Deno.Command("echo",{args:[`"${res}"`,"|","glow","-"]}).output()
      console.log(glow.success)
    } catch (e) {
      spinner.fail(e);
    }
  })();


  return spinner;
};
 */
