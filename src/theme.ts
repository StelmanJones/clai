import { colors } from "../deps.ts";
const highlight = colors.bold.brightMagenta;
const dimmed = colors.bold.dim;
const success = colors.green;
const warn = colors.yellow;
const error = colors.bold.red;
const glitchChars = "0123456789~!@#$£€%^&*()+=_ÄÅÖ-<>";
export const claiTheme = {
  highlight,
  dimmed,
  success,
  warn,
  error,
};

export function glitch(str: string) {
  const inputLength = str.length;
  const chunkSize = Math.max(1, Math.round(inputLength * 0.02));
  const chunks = [];

  for (let i = 0, length = inputLength; i < length; i++) {
    const currentChar = str[i];
    const skip = Math.round(Math.max(0, (Math.random() - 0.8) * chunkSize));
    chunks.push(str.substring(i, i + skip).replace(/[^\r\n]/g, " "));
    i += skip;
    if (currentChar && Math.random() > 0.950) {
      chunks.push(colors.green.bold(
        glitchChars[Math.floor(Math.random() * glitchChars.length)],
      ));
    } else if (Math.random() > 0.005) {
      chunks.push(currentChar);
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
