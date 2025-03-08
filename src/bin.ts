import chalk from "chalk";
import inquirer from "inquirer";
import { PrismaHighlighter } from "prismalux";
import boxen from "boxen";
import { mutationsHandler, prismaQlParser, PrismaQlProvider, PrismaQlRelationCollector, PrismaQlSchemaLoader, queryRendersHandler } from "prismaql";
const manager = new PrismaQlSchemaLoader(new PrismaQlRelationCollector());
const highlightPrismaSchema = new PrismaHighlighter();

const confirm = async (msg: string) => {
    console.log(boxen(
        highlightPrismaSchema.highlight(msg),
        { padding: 1, margin: 1, borderStyle: "double" }
    ));

    console.log(chalk.greenBright("🎉🎉🎉 Mutation is valid and can be applied.\n"));
    const { confirm } = await inquirer.prompt({
        type: "confirm",
        name: "confirm",
        message: chalk.yellowBright("Do you want to overwrite the Prisma file with these changes?"),
    });
    return confirm;
}

const loadQueryRenderManager = async (options: Record<string, boolean | string | number> = {}) => {
    await manager.loadFromFile();
    const provider = new PrismaQlProvider({
        queryHandler: queryRendersHandler,
        mutationHandler: mutationsHandler,
        loader: manager,
    })
    return (sourceCommand: string) => {
        if (sourceCommand?.split(';').length > 2) {
            return provider.multiApply(sourceCommand, {
                save: true,
                dryRun: options.dry as boolean,
                confirm: confirm
            }).then(res => {
                res.forEach((r, i) => {
                    if (r?.result) {
                        console.log(chalk.greenBright(`Command ${i + 1} result:`), `\n${r.result}`);
                    } else {
                        console.error(`Command ${i + 1} error: ${r.error}`);
                    }
                });
                console.log(chalk.greenBright("\nAll commands applied"));
            }).catch(e => {
                console.error(`Error: ${e.message}`);
            });
        }
        const isValid = prismaQlParser.isValid(sourceCommand);
        if (isValid instanceof Error) {
            console.log(chalk.redBright(`Invalid command: ${isValid.message}`));
            console.log(chalk.yellowBright("Example command pattern: ACTION COMMAND ...args ({prismaBlock}) (options);"));
            return;
        } else {
            console.log(chalk.greenBright("Command is valid"));
        }
        provider.apply(sourceCommand, {
            save: true,
            dryRun: options.dry as boolean,
            confirm: confirm
        }).then(res => {
            if (res?.response?.result) {
                console.log(res.response.result);
            } else {
                console.error(`Error: ${res.response.error}`);
            }
        }).catch(e => {
            console.log(chalk.redBright(`Error: ${e.message}`));
        });
    }
}
export default loadQueryRenderManager;