export type TestFn = () => void;

let total = 0;
let failed = 0;
const failures: string[] = [];

export function assert(condition: undefined | boolean, message?: string) {
  if (!condition) {
    throw new Error(message || "Assert failed");
  }
}

export function assertEqual<T>(a: T, b: T, message?: string) {
  const pass = a === b;
  if (!pass) {
    throw new Error(
      message || `Expected ${JSON.stringify(a)} === ${JSON.stringify(b)}`,
    );
  }
}

export function assertArrIncludes<T>(arr: T[], item: T, message?: string) {
  if (!arr.includes(item)) {
    throw new Error(
      message ||
        `Expected array ${JSON.stringify(arr)} to contain ${JSON.stringify(item)}`,
    );
  }
}

export function run(name: string, fn: TestFn) {
  total++;
  try {
    fn();
    console.log(`Success: ${name}`);
  } catch (e) {
    failed++;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    console.error(`Failure: ${name} - ${e.message}`);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    failures.push(`${name} - ${e.message}`);
  }
}

export function summary() {
  console.log("------------------Summary: ------------------");
  console.log(`Tests: ${total}\nFailures: ${failed}`);
  if (failed > 0) {
    for (const f of failures) {
      console.log(`Failure: ${f}`);
    }
  }
}
