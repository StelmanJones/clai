import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/colors.ts";
import { random } from "https://deno.land/x/lodash_es@v0.0.2/mod.ts";
const highlight = colors.bold.brightMagenta;
const dimmed = colors.bold.dim;
const success = colors.green;
const warn = colors.yellow;
const error = colors.bold.red;

export const claiTheme = {
  highlight,
  dimmed,
  success,
  warn,
  error,
};
const glitchChars = "0123456789~!@#$£€%^&*()+=_t";

export function glitch(text: string) {
  const chunkSize = Math.max(1, Math.round(text.length * 0.02));
  const chunks = [];

  for (let i = 0, length = text.length; i < length; i++) {
    const skip = Math.round(Math.max(0, (Math.random() - 0.8) * chunkSize));
    chunks.push(text.substring(i, i + skip).replace(/[^\r\n]/g, " "));
    i += skip;
    if (text[i]) {
      if (text[i] !== "\n" && text[i] !== "\r" && Math.random() > 0.990) {
        const effect = () => {
          let char =
            glitchChars[Math.floor(Math.random() * glitchChars.length)];
          switch (random(1, 7)) {
            case 1:
              char = colors.bold(char);
              break;
            case 2:
              char = colors.italic(char);
              break;
            case 3:
              char = colors.bold.italic(char);
              break;
            case 4:
              char = colors.dim(char);
              break;
            case 5:
              char = colors.bold.dim(char);
              break;
            case 6:
              char = colors.dim.italic(char);
              break;
            case 7:
              char = colors.dim.bold.italic(char);
              break;
          }
          return char;
        };
        chunks.push(
          effect(),
        );
      } else if (Math.random() > 0.005) {
        chunks.push(text[i]);
      }
    }
  }

  let result = chunks.join("");
  if (Math.random() > 0.99) {
    result = result.toUpperCase();
  } else if (Math.random() < 0.01) {
    result = result.toLowerCase();
  }

  return result;
}

/*

console.log(highlight("TEST"));
console.log(dimmed("TEST"));
console.log(success("TEST"));
console.log(warn("TEST"));
console.log(error("TEST"));
*/


