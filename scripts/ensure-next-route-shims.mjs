import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const routeTypeDirs = [".next/types", ".next/dev/types"];
const shimContents = 'export type * from "./routes";\n';

for (const dir of routeTypeDirs) {
  const source = join(dir, "routes.d.ts");
  const target = join(dir, "routes.js.d.ts");

  if (!existsSync(source)) {
    continue;
  }

  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, shimContents, "utf8");
}
