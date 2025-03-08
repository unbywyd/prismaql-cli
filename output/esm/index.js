#!/usr/bin/env node

// src/bin.ts
import chalk from "chalk";
import inquirer from "inquirer";
import { PrismaHighlighter } from "prismalux";
import boxen from "boxen";
import { mutationsHandler, prismaQlParser, PrismaQlProvider, PrismaQlRelationCollector, PrismaQlSchemaLoader, queryRendersHandler } from "prismaql";
var manager = new PrismaQlSchemaLoader(new PrismaQlRelationCollector());
var highlightPrismaSchema = new PrismaHighlighter();
var confirm = async (msg) => {
  console.log(boxen(
    highlightPrismaSchema.highlight(msg),
    { padding: 1, margin: 1, borderStyle: "double" }
  ));
  console.log(chalk.greenBright("\u{1F389}\u{1F389}\u{1F389} Mutation is valid and can be applied.\n"));
  const { confirm: confirm2 } = await inquirer.prompt({
    type: "confirm",
    name: "confirm",
    message: chalk.yellowBright("Do you want to overwrite the Prisma file with these changes?")
  });
  return confirm2;
};
var loadQueryRenderManager = async (options = {}) => {
  await manager.loadFromFile();
  const provider = new PrismaQlProvider({
    queryHandler: queryRendersHandler,
    mutationHandler: mutationsHandler,
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
            console.log(chalk.greenBright(`Command ${i + 1} result:`), `
${r.result}`);
          } else {
            console.error(`Command ${i + 1} error: ${r.error}`);
          }
        });
        console.log(chalk.greenBright("\nAll commands applied"));
      }).catch((e) => {
        console.error(`Error: ${e.message}`);
      });
    }
    const isValid = prismaQlParser.isValid(sourceCommand);
    if (isValid instanceof Error) {
      console.log(chalk.redBright(`Invalid command: ${isValid.message}`));
      console.log(chalk.yellowBright("Example command pattern: ACTION COMMAND ...args (options) ({prismaBlock})"));
      return;
    } else {
      console.log(chalk.greenBright("Command is valid"));
    }
    provider.apply(sourceCommand, {
      save: true,
      dryRun: options.dry,
      confirm
    }).then((res) => {
      if (res?.response?.result) {
        console.log(res.response.result);
      } else {
        console.error(`Error: ${res.response.error}`);
      }
    }).catch((e) => {
      console.log(chalk.redBright(`Error: ${e.message}`));
    });
  };
};
var bin_default = loadQueryRenderManager;

// src/index.ts
import { readFileSync } from "fs";
import { resolve } from "path";
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
    const queryManager = await bin_default(options);
    await queryManager(command);
  } catch (error) {
    console.error("Error parsing command:", error.message);
    process.exit(1);
  }
}
main();
//# sourceMappingURL=index.js.map