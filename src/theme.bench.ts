import { glitch } from "./theme.ts";
import { colors } from "https://deno.land/x/cliffy@v1.0.0-rc.3/ansi/mod.ts";

Deno.bench("Glitch Animation", (b) => {
  const t = "Generating";
  glitch(t);
});
