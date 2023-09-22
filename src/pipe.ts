import * as io from "https://deno.land/std/io/mod.ts";
import { readLines } from "https://deno.land/std/io/mod.ts";
import { writeAll } from "https://deno.land/std@0.122.0/streams/conversion.ts";

export async function pipeThrough(
  reader: Deno.Reader,
  writer: Deno.Writer,
) {
  const encoder = new TextEncoder();
  for await (const line of readLines(reader)) {
    await writeAll(writer, encoder.encode(line));
  }
}
