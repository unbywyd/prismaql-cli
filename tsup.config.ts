import { defineConfig } from "tsup";

export default defineConfig([
    {
        entry: ["src/**/*.ts"],
        format: ["esm"],
        outDir: "output/esm",
        sourcemap: true,
        dts: true,
        splitting: false,
        clean: true,
        bundle: false,
        target: "es2022",
        outExtension: () => ({ js: ".js" }),
    },

    {
        entry: ["src/**/*.cts"],
        format: ["cjs"],
        outDir: "output/cjs",
        sourcemap: true,
        splitting: false,
        clean: false,
        bundle: true,
        external: ["fs", "path", "boxen", "chalk", "inquirer", "prismalux", "prismaql"],
        target: "es2022",
        outExtension: () => ({ js: ".cjs" }),
    }
]);