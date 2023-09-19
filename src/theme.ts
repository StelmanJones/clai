import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/colors.ts";

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
/* 

console.log(highlight("TEST"));
console.log(dimmed("TEST"));
console.log(success("TEST"));
console.log(warn("TEST"));
console.log(error("TEST"));
*/

const modelArt = `
███╗░░░███╗░█████╗░██████╗░███████╗██╗░░░░░░██████╗
████╗░████║██╔══██╗██╔══██╗██╔════╝██║░░░░░██╔════╝
██╔████╔██║██║░░██║██║░░██║█████╗░░██║░░░░░╚█████╗░
██║╚██╔╝██║██║░░██║██║░░██║██╔══╝░░██║░░░░░░╚═══██╗
██║░╚═╝░██║╚█████╔╝██████╔╝███████╗███████╗██████╔╝
╚═╝░░░░░╚═╝░╚════╝░╚═════╝░╚══════╝╚══════╝╚═════╝░
`;

const configArt = `
░█████╗░░█████╗░███╗░░██╗███████╗██╗░██████╗░
██╔══██╗██╔══██╗████╗░██║██╔════╝██║██╔════╝░
██║░░╚═╝██║░░██║██╔██╗██║█████╗░░██║██║░░██╗░
██║░░██╗██║░░██║██║╚████║██╔══╝░░██║██║░░╚██╗
╚█████╔╝╚█████╔╝██║░╚███║██║░░░░░██║╚██████╔╝
░╚════╝░░╚════╝░╚═╝░░╚══╝╚═╝░░░░░╚═╝░╚═════╝░
`;

export const claiArt = {
  modelArt,
  configArt,
};
