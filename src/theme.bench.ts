import { glitch } from "./theme.ts";

Deno.bench("Glitch Animation", (b) => {
  const t = "Generating";
  glitch(t);
});
