#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/bin.ts
var bin_exports = {};
__export(bin_exports, {
  default: () => bin_default
});
var import_chalk, import_inquirer, import_prismalux, import_boxen, import_prismaql, manager, highlightPrismaSchema, confirm, loadQueryRenderManager, bin_default;
var init_bin = __esm({
  "src/bin.ts"() {
    import_chalk = __toESM(require("chalk"), 1);
    import_inquirer = __toESM(require("inquirer"), 1);
    import_prismalux = require("prismalux");
    import_boxen = __toESM(require("boxen"), 1);
    import_prismaql = require("prismaql");
    manager = new import_prismaql.PrismaQlSchemaLoader(new import_prismaql.PrismaQlRelationCollector());
    highlightPrismaSchema = new import_prismalux.PrismaHighlighter();
    confirm = async (msg) => {
      console.log((0, import_boxen.default)(
        highlightPrismaSchema.highlight(msg),
        { padding: 1, margin: 1, borderStyle: "double" }
      ));
      console.log(import_chalk.default.greenBright("\u{1F389}\u{1F389}\u{1F389} Mutation is valid and can be applied.\n"));
      const { confirm: confirm2 } = await import_inquirer.default.prompt({
        type: "confirm",
        name: "confirm",
        message: import_chalk.default.yellowBright("Do you want to overwrite the Prisma file with these changes?")
      });
      return confirm2;
    };
    loadQueryRenderManager = async (options = {}) => {
      await manager.loadFromFile();
      const provider = new import_prismaql.PrismaQlProvider({
        queryHandler: import_prismaql.queryRendersHandler,
        mutationHandler: import_prismaql.mutationsHandler,
        loader: manager
      });
      return (sourceCommand) => {
        if (sourceCommand?.split(";").length > 2) {
          return provider.multiApply(sourceCommand, {
            save: true,
            dryRun: options.dry,
            confirm
          }).then((res) => {
            res.forEach((r, i) => {
              if (r?.result) {
                console.log(import_chalk.default.greenBright(`Command ${i + 1} result: 
${r.result}`));
              } else {
                console.error(`Command ${i + 1} error: ${r.error}`);
              }
            });
            console.log(import_chalk.default.greenBright("\nAll commands applied"));
          }).catch((e) => {
            console.error(`Error: ${e.message}`);
          });
        }
        const isValid = import_prismaql.prismaQlParser.isValid(sourceCommand);
        if (isValid instanceof Error) {
          console.log(import_chalk.default.redBright(`Invalid command: ${isValid.message}`));
          console.log(import_chalk.default.yellowBright("Example command pattern: ACTION COMMAND ...args (options) ({prismaBlock})"));
          return;
        } else {
          console.log(import_chalk.default.greenBright("Command is valid"));
        }
        provider.apply(sourceCommand, {
          save: true,
          dryRun: options.dry,
          confirm
        }).then((res) => {
          if (res?.response?.result) {
            console.log(import_chalk.default.greenBright(res.response.result));
          } else {
            console.error(`Error: ${res.response.error}`);
          }
        }).catch((e) => {
          console.log(import_chalk.default.redBright(`Error: ${e.message}`));
        });
      };
    };
    bin_default = loadQueryRenderManager;
  }
});

// src/index.cts
var loadQueryRenderManager2 = (init_bin(), __toCommonJS(bin_exports));
var { readFileSync } = require("fs");
var { resolve } = require("path");
var { version } = JSON.parse(readFileSync(resolve(process.cwd(), "package.json"), "utf-8"));
function showHelp() {
  console.log(`
Usage: prismaql <command> [--dry]

Options:
  --dry    Perform a dry run without applying changes
  --help   Show this help message
  --version  Show the CLI version

Examples:
  prismaql "GET MODEL User;"
  prismaql "ADD FIELD name ({String});" --dry
`);
}
async function main() {
  const args = process.argv.slice(2);
  if (args.length === 0 || args.includes("--help")) {
    showHelp();
    process.exit(0);
  }
  if (args.includes("--version")) {
    console.log(`PrismaQL CLI v${version}`);
    process.exit(0);
  }
  const command = args.find((arg) => !arg.startsWith("--"));
  if (!command) {
    console.error("Error: Missing command. Use --help for usage information.");
    process.exit(1);
  }
  const options = {
    dry: args.includes("--dry")
  };
  try {
    const queryManager = await loadQueryRenderManager2(options);
    await queryManager(command);
  } catch (error) {
    console.error("Error parsing command:", error.message);
    process.exit(1);
  }
}
main();
//# sourceMappingURL=index.cjs.map