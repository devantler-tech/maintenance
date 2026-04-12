import pc from "picocolors";
import { createInterface } from "readline";

const stderrConsole = new console.Console(process.stderr);

/** Writes to stderr without coloring text red, unlike console.error */
export function stderr(...args: unknown[]) {
  stderrConsole.log(...args);
}

/** Writes to stderr. Useful for information that isn't the main output. */
export function info(...args: unknown[]) {
  stderr(...args);
}

/** Writes args to stderr, applying a color function to primitive values. */
function colorize(color: (s: string) => string, ...args: unknown[]): void {
  stderr(
    ...args.map((arg) => {
      switch (typeof arg) {
        case "string":
        case "number":
        case "bigint":
        case "boolean":
          return color(`${arg}`);
        default:
          return arg;
      }
    }),
  );
}

/** Writes to stderr and dims text. Useful for less important information. */
export function debug(...args: unknown[]) {
  colorize(pc.dim, ...args);
}

/** Writes to stderr with yellow color. Use for warnings and non-critical issues. */
export function warn(...args: unknown[]) {
  colorize(pc.yellow, ...args);
}

/**
 * Prompts the user for input on stdin.
 *
 * @param text - The prompt text to display
 * @returns Promise that resolves with the user's input
 */
export function prompt(text: string): Promise<string> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  return new Promise((resolve) => {
    rl.question(text, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}
