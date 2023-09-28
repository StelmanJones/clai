import boxen, { CustomBorderStyle, Spacing } from "npm:boxen";
import { Boxes } from "npm:cli-boxes";
import type { LiteralUnion } from "https://cdn.skypack.dev/type-fest?dts";
import { z } from "../deps.ts";

type BoxColors = LiteralUnion<
  | "black"
  | "red"
  | "green"
  | "yellow"
  | "blue"
  | "magenta"
  | "cyan"
  | "white"
  | "gray"
  | "grey"
  | "blackBright"
  | "redBright"
  | "greenBright"
  | "yellowBright"
  | "blueBright"
  | "magentaBright"
  | "cyanBright"
  | "whiteBright",
  string
>;

export class Box {
  content: string;

  borderColor?: BoxColors;

  /**
	Style of the box border.
	@default 'single'
	*/
  borderStyle?: keyof Boxes | CustomBorderStyle;

  /**
	Reduce opacity of the border.
	@default false
	*/
  dimBorder?: boolean;

  /**
	Space between the text and box border.
	@default 0
	*/
  padding?: number | Spacing;

  /**
	Space around the box.
	@default 0
	*/
  margin?: number | Spacing;

  /**
	Float the box on the available terminal screen space.
	@default 'left'
	*/
  float?: "left" | "right" | "center";

  /**
	Color of the background.
	*/
  backgroundColor?: BoxColors;

  /**
	Align the text in the box based on the widest line.
	@default 'left'
	@deprecated Use `textAlignment` instead.
	*/
  align?: "left" | "right" | "center";

  /**
	Align the text in the box based on the widest line.
	@default 'left'
	*/
  textAlignment?: "left" | "right" | "center";

  /**
	Display a title at the top of the box.
	If needed, the box will horizontally expand to fit the title.
	@example
	```
	console.log(boxen('foo bar', {title: 'example'}));
	// ┌ example ┐
	// │foo bar  │
	// └─────────┘
	```
	*/
  title?: string;

  /**
	Align the title in the top bar.
	@default 'left'
	@example
	```
	console.log(boxen('foo bar foo bar', {title: 'example', titleAlignment: 'center'}));
	// ┌─── example ───┐
	// │foo bar foo bar│
	// └───────────────┘
	console.log(boxen('foo bar foo bar', {title: 'example', titleAlignment: 'right'}));
	// ┌────── example ┐
	// │foo bar foo bar│
	// └───────────────┘
	```
	*/
  titleAlignment?: "left" | "right" | "center";

  /**
	Set a fixed width for the box.
	__Note__: This disables terminal overflow handling and may cause the box to look broken if the user's terminal is not wide enough.
	@example
	```
	import boxen from 'boxen';
	console.log(boxen('foo bar', {width: 15}));
	// ┌─────────────┐
	// │foo bar      │
	// └─────────────┘
	```
	*/
  width?: number;

  /**
	Set a fixed height for the box.
	__Note__: This option will crop overflowing content.
	@example
	```
	import boxen from 'boxen';
	console.log(boxen('foo bar', {height: 5}));
	// ┌───────┐
	// │foo bar│
	// │       │
	// │       │
	// └───────┘
	```
	*/
  height?: number;

  /**
	__boolean__: Whether or not to fit all available space within the terminal.
	__function__: Pass a callback function to control box dimensions.
	@example
	```
	import boxen from 'boxen';
	console.log(boxen('foo bar', {
		fullscreen: (width, height) => [width, height - 1],
	}));
	```
	*/
  fullscreen?:
    | boolean
    | ((width: number, height: number) => [width: number, height: number]);

  constructor(builder: BoxBuilder) {
    this.content = builder.content;
    this.borderColor = builder.borderColor;
    this.borderStyle = builder.borderStyle;
    this.dimBorder = builder.dimBorder;
    this.padding = builder.padding;
    this.margin = builder.margin;
    this.float = builder.float;
    this.backgroundColor = builder.backgroundColor;
    this.textAlignment = builder.textAlignment;
    this.title = builder.title;
    this.titleAlignment = builder.titleAlignment;
    this.width = builder.width;
    this.height = builder.height;
    this.fullscreen = builder.fullscreen;
  }

  public render(): void {
    return console.log(
      boxen(this.content, {
        borderColor: this.borderColor,
        borderStyle: this.borderStyle,
        dimBorder: this.dimBorder,
        padding: this.padding,
        margin: this.margin,
        float: this.float,
        backgroundColor: this.backgroundColor,
        textAlignment: this.textAlignment,
        title: this.title,
        titleAlignment: this.titleAlignment,
        width: this.width,
        height: this.height,
        fullscreen: this.fullscreen,
      }),
    );
  }

  public toString(): string {
    return boxen(this.content, {
      borderColor: this.borderColor,
      borderStyle: this.borderStyle,
      dimBorder: this.dimBorder,
      padding: this.padding,
      margin: this.margin,
      float: this.float,
      backgroundColor: this.backgroundColor,
      textAlignment: this.textAlignment,
      title: this.title,
      titleAlignment: this.titleAlignment,
      width: this.width,
      height: this.height,
      fullscreen: this.fullscreen,
    });
  }
}

const BoxStyle = z.enum([
  "single",
  "double",
  "round",
  "bold",
  "singleDouble",
  "doubleSingle",
  "classic",
]);
export type BoxStyle = z.infer<typeof BoxStyle>;

export class BoxBuilder {
  private _content: string;

  private _borderColor?: BoxColors;

  /**
	Style of the box border.
	@default 'single'
	*/
  private _borderStyle?: keyof Boxes | CustomBorderStyle = "single";

  /**
	Reduce opacity of the border.
	@default false
	*/
  private _dimBorder?: boolean;

  /**
	Space between the text and box border.
	@default 0
	*/
  private _padding?: number | Spacing;

  /**
	Space around the box.
	@default 0
	*/
  private _margin?: number | Spacing;

  /**
	Float the box on the available terminal screen space.
	@default 'left'
	*/
  private _float?: "left" | "right" | "center";

  /**
	Color of the background.
	*/
  private _backgroundColor?: BoxColors;

  /**
	Align the text in the box based on the widest line.
	@default 'left'
	@deprecated Use `textAlignment` instead.
	*/
  private _align?: "left" | "right" | "center";

  /**
	Align the text in the box based on the widest line.
	@default 'left'
	*/
  private _textAlignment?: "left" | "right" | "center";

  /**
	Display a title at the top of the box.
	If needed, the box will horizontally expand to fit the title.
	@example
	```
	console.log(boxen('foo bar', {title: 'example'}));
	// ┌ example ┐
	// │foo bar  │
	// └─────────┘
	```
	*/
  private _title?: string;

  /**
	Align the title in the top bar.
	@default 'left'
	@example
	```
	console.log(boxen('foo bar foo bar', {title: 'example', titleAlignment: 'center'}));
	// ┌─── example ───┐
	// │foo bar foo bar│
	// └───────────────┘
	console.log(boxen('foo bar foo bar', {title: 'example', titleAlignment: 'right'}));
	// ┌────── example ┐
	// │foo bar foo bar│
	// └───────────────┘
	```
	*/
  private _titleAlignment?: "left" | "right" | "center";

  /**
	Set a fixed width for the box.
	__Note__: This disables terminal overflow handling and may cause the box to look broken if the user's terminal is not wide enough.
	@example
	```
	import boxen from 'boxen';
	console.log(boxen('foo bar', {width: 15}));
	// ┌─────────────┐
	// │foo bar      │
	// └─────────────┘
	```
	*/
  private _width?: number;

  /**
	Set a fixed height for the box.
	__Note__: This option will crop overflowing content.
	@example
	```
	import boxen from 'boxen';
	console.log(boxen('foo bar', {height: 5}));
	// ┌───────┐
	// │foo bar│
	// │       │
	// │       │
	// └───────┘
	```
	*/
  private _height?: number;

  /**
	__boolean__: Whether or not to fit all available space within the terminal.
	__function__: Pass a callback function to control box dimensions.
	@example
	```
	import boxen from 'boxen';
	console.log(boxen('foo bar', {
		fullscreen: (width, height) => [width, height - 1],
	}));
	```
	*/
  private _fullscreen?:
    | boolean
    | ((width: number, height: number) => [width: number, height: number]);

  constructor(content: string) {
    this._content = content;
  }

  public setContent(content: string): this {
    this._content = content;
    return this;
  }

  public setBorderColor(color: BoxColors): this {
    this._borderColor = color;
    return this;
  }
  public setBorderStyle(border: keyof Boxes | CustomBorderStyle): this {
    this._borderStyle = border;
    return this;
  }
  public setDimmedBorder(dim: boolean): this {
    this._dimBorder = dim;
    return this;
  }

  public setPadding(padding: number | Spacing): this {
    this._padding = padding;
    return this;
  }

  public setMargin(margin: number | Spacing): this {
    this._margin = margin;
    return this;
  }

  public setFloat(float: "left" | "right" | "center" = "left"): this {
    this._float = float;
    return this;
  }
  public setBackgroundColor(color: BoxColors): this {
    this._backgroundColor = color;
    return this;
  }
  public setTextAlignment(align: "left" | "right" | "center" = "left"): this {
    this._textAlignment = align;
    return this;
  }
  public setTitle(title: string): this {
    this._title = title;
    return this;
  }
  public setTitleAlignment(align: "left" | "right" | "center" = "left"): this {
    this._titleAlignment = align;
    return this;
  }

  public setWidth(width: number): this {
    this._width = width;
    return this;
  }
  public setHeight(height: number): this {
    this._height = height;
    return this;
  }
  public setFullscreen(fullscreen: boolean): this {
    this._fullscreen = fullscreen;
    return this;
  }

  public build(): Box {
    return new Box(this);
  }

  get content(): string {
    return this._content;
  }

  get borderColor(): BoxColors | undefined {
    return this._borderColor;
  }

  get borderStyle(): keyof Boxes | CustomBorderStyle {
    return this._borderStyle!;
  }

  get dimBorder(): boolean | undefined {
    return this._dimBorder;
  }

  get padding(): number | Spacing | undefined {
    return this._padding;
  }

  get margin(): number | Spacing | undefined {
    return this._margin;
  }

  get float(): "left" | "right" | "center" | undefined {
    return this._float;
  }

  get backgroundColor(): BoxColors | undefined {
    return this._backgroundColor;
  }

  get textAlignment(): "left" | "right" | "center" | undefined {
    return this._textAlignment;
  }

  get title(): string | undefined {
    return this._title;
  }

  get titleAlignment(): "left" | "right" | "center" | undefined {
    return this._titleAlignment;
  }

  get width(): number | undefined {
    return this._width;
  }

  get height(): number | undefined {
    return this._height;
  }

  get fullscreen():
    | boolean
    | ((width: number, height: number) => [width: number, height: number])
    | undefined {
    return this._fullscreen;
  }
}
