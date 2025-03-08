#!/usr/bin/env node
import loadQueryRenderManager from './bin.js';
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
    if (args.length === 0 || args.includes('--help')) {
        showHelp();
        process.exit(0);
    }
    if (args.includes('--version')) {
        console.log(`PrismaQL CLI alpha`);
        process.exit(0);
    }
    const command = args.find(arg => !arg.startsWith('--'));
    if (!command) {
        console.error("Error: Missing command. Use --help for usage information.");
        process.exit(1);
    }
    const options = {
        dry: args.includes('--dry')
    };
    try {
        const queryManager = await loadQueryRenderManager(options);
        await queryManager(command);
    }
    catch (error) {
        console.error("Error parsing command:", error.message);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=index.js.map