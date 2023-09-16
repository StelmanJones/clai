import { bgBlack } from "https://deno.land/std@0.196.0/fmt/colors.ts";
import { Tui, handleInput, handleKeyboardControls, Theme } from "https://deno.land/x/tui@2.1.3/mod.ts";
import* as comps from "https://deno.land/x/tui@2.1.3/src/types.ts";
import { crayon } from "https://deno.land/x/crayon@3.3.3/mod.ts";
import { ui } from "../deps.ts";    
const tui = new Tui({
    refreshRate: 1000 / 60,
    style: crayon.bgBlack
})

handleInput(tui)
handleKeyboardControls(tui)
tui.dispatch()
tui.run()

const baseTheme: Theme = {
  base: crayon.bgLightBlue,
  focused: crayon.bgCyan,
  active: crayon.bgBlue,
  disabled: crayon.bgLightBlack.black,
};


new ui.BoxObject({
  parent: tui,
  theme: baseTheme,
  rectangle: {
    column: 2,
    row: 3,
    height: 5,
    width: 10,
  },
  zIndex: 0,
});