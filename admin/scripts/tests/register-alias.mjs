import { register } from "node:module";

// Preload hook: make `@/` imports resolvable for `node --test` runs.
register(new URL("./alias-hooks.mjs", import.meta.url));
