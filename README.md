# PrismaQL - The Ultimate Prisma Schema Management Tool

[![npm version](https://img.shields.io/npm/v/prismaql?color=blue)](https://www.npmjs.com/package/prismaql)
[![license](https://img.shields.io/npm/l/prismaql.svg)](LICENSE.md)
[![GitHub issues](https://img.shields.io/github/issues/unbywyd/prismaql)](https://github.com/unbywyd/prismaql/issues)
[![GitHub stars](https://img.shields.io/github/stars/unbywyd/prismaql?style=social)](https://github.com/unbywyd/prismaql)

## Introduction

**PrismaQL** is a powerful tool for **programmatically managing and editing Prisma schema files** using a **SQL-like DSL**. It provides a structured and safe way to modify Prisma models, fields, relations, and enums while ensuring **schema integrity** through AST-based processing, validation, commit tracking, and automated backups.

This tool was developed to solve the **problem of extending Prisma schema dynamically** when building Prisma-based servers. Managing plugins, schema modifications, and database migrations programmatically within the Prisma schema itself is now possible with PrismaQL.

## Command Structure

PrismaQL follows a structured pattern for commands:

```
ACTION COMMAND ...ARGS ({PRISMA_BLOCK}) (OPTIONS)
```

### **Action Types**

PrismaQL supports **two types of actions:**

- **Query Actions (`GET`, `PRINT`, `VALIDATE`)** – Retrieve schema details without modifying the schema.
- **Mutation Actions (`ADD`, `DELETE`, `UPDATE`)** – Modify the schema structure.

### **Arguments & Formatting**

Arguments in PrismaQL follow specific formats:

- **Comma-separated values** – `GET ENUMS enum1, enum2`
- **Direct names** – `DELETE MODEL User`
- **Pattern-based syntax** – `ADD RELATION ModelA TO ModelB`
- **Prisma Block** – `{}` containing valid Prisma schema syntax, parsed using AST.
- **Options** – `(key=value, key2=value2, boolFlag)` where boolean flags are `true` by default when present.

### **Query Commands (`GET`, `PRINT`, `VALIDATE`)**

| Command                                    | Description                                                                        |
| ------------------------------------------ | ---------------------------------------------------------------------------------- |
| `GET MODELS`                               | Displays all models with syntax highlighting.                                      |
| `GET MODEL <name>`                         | Shows detailed information about a model, including relations and required fields. |
| `GET ENUM_RELATIONS <enum>`                | Displays which tables reference the given enum.                                    |
| `GET FIELDS <model>`                       | Lists all fields in the specified model.                                           |
| `GET FIELDS <field, field2> IN <model>`    | Filters and displays specific fields within a model.                               |
| `GET RELATIONS <model, model2> (depth?=1)` | Lists relations between models, supporting depth levels.                           |
| `GET ENUMS (raw?)`                         | Lists all enums, optionally in raw format.                                         |
| `GET ENUMS <enum, enum>`                   | Lists specific enums.                                                              |
| `GET MODELS_LIST`                          | Displays all model names in a sorted table.                                        |
| `PRINT`                                    | Prints the entire Prisma schema in a colorized format.                             |
| `VALIDATE`                                 | Validates the schema for correctness.                                              |

### **Mutation Commands (`ADD`, `DELETE`, `UPDATE`)**

| Command                                           | Description                                                             |
| ------------------------------------------------- | ----------------------------------------------------------------------- | -------------------------------------------------------------------- | --------------------------------------- |
| `ADD MODEL <name> ({...})`                        | Creates a new model with fields defined in a Prisma block.              |
| `ADD FIELD <name> TO <model> ({String})`          | Adds a new field to a model, requiring a valid Prisma field definition. |
| `ADD RELATION <modelA> TO <modelB> (...options)`  | Establishes a relation between two models.                              |
| `ADD ENUM <name> ({A                              | B                                                                       | C})`                                                                 | Creates an enum with specified options. |
| `DELETE MODEL <name>`                             | Deletes a model from the schema.                                        |
| `DELETE FIELD <name> IN <model>`                  | Removes a field from a model.                                           |
| `DELETE RELATION <modelA>, <modelB> (...options)` | Removes relations between models based on specified conditions.         |
| `DELETE ENUM <name>`                              | Deletes an enum.                                                        |
| `UPDATE FIELD <name> IN <model> ({...})`          | Recreates a field in a model (use with caution).                        |
| `UPDATE ENUM <name> ({A                           | B})(replace?)`                                                          | Updates an enum, either appending values or replacing it completely. |

## Execution Flow

1. A raw DSL command is parsed through **`PrismaQlDslParser`**.
2. The command is converted into an object:
   ```ts
   export interface PrismaQLParsedDSL<
     A extends PrismaQlDSLAction,
     C extends PrismaQLDSLCommand | undefined,
     T extends PrismaQlDSLType
   > {
     action: A;
     command?: C;
     args?: PrismaQLDSLArgs<A, C>;
     options?: PrismaQlDSLOptions<A, C>;
     prismaBlock?: string;
     raw: string;
     type: T;
   }
   ```
3. The parsed command is passed to the **PrismaQlProvider**.
4. The provider manages execution through **handlers** registered in `PrismaQlHandlerRegistry`:
   ```ts
   mutationsHandler.register("ADD", "MODEL", addModel);
   queryJSONHandler.register("GET", "MODEL", getJsonModel);
   ```
5. Mutations are executed with a **two-phase process**:
   - **Dry Run** – Ensures changes do not break the schema.
   - **Commit & Apply** – Saves changes after confirmation.
6. A backup of the previous schema version is stored in `.prisma/backups`.

## Conclusion

PrismaQL is a **powerful, structured, and extensible tool** for managing Prisma schemas programmatically. Whether you need to automate schema changes, manage dynamic plugins, or build custom Prisma integrations, PrismaQL provides the **best approach** to structured schema modifications.

## License

PrismaQL is licensed under the **MIT License**.
© 2025 [Artyom Gorlovetskiy](https://unbywyd.com).
