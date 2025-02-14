// Copyright 2018-2023 the Deno authors. All rights reserved. MIT license.
import { green, red, stripColor } from "../fmt/colors.ts";
import { assertEquals, assertThrows } from "../assert/mod.ts";
import { format } from "./_format.ts";

// This file is copied from `std/assert`.

Deno.test("assert diff formatting (strings)", () => {
  assertThrows(
    () => {
      assertEquals([..."abcd"].join("\n"), [..."abxde"].join("\n"));
    },
    Error,
    `
    a\\n
    b\\n
${green("+   x")}\\n
${green("+   d")}\\n
${green("+   e")}
${red("-   c")}\\n
${red("-   d")}
`,
  );
});

// Check that the diff formatter overrides some default behaviours of
// `Deno.inspect()` which are problematic for diffing.
Deno.test("assert diff formatting", () => {
  // Wraps objects into multiple lines even when they are small. Prints trailing
  // commas.
  assertEquals(
    stripColor(format({ a: 1, b: 2 })),
    `{
  a: 1,
  b: 2,
}`,
  );

  // Wraps Object with getters
  assertEquals(
    format(Object.defineProperty({}, "a", {
      enumerable: true,
      get() {
        return 1;
      },
    })),
    `{
  a: [Getter: 1],
}`,
  );

  // Same for nested small objects.
  assertEquals(
    stripColor(format([{ x: { a: 1, b: 2 }, y: ["a", "b"] }])),
    `[
  {
    x: {
      a: 1,
      b: 2,
    },
    y: [
      "a",
      "b",
    ],
  },
]`,
  );

  // Grouping is disabled.
  assertEquals(
    stripColor(format(["i", "i", "i", "i", "i", "i", "i"])),
    `[
  "i",
  "i",
  "i",
  "i",
  "i",
  "i",
  "i",
]`,
  );
});

Deno.test("format() doesn't truncate long strings in object", () => {
  const str = format({
    foo:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  });
  assertEquals(
    str,
    `{
  foo: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
}`,
  );
});
