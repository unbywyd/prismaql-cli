# PrismaQL CLI - Command-Line Interface for Prisma Schema Management

[![npm version](https://img.shields.io/npm/v/prismaql-cli?color=blue)](https://www.npmjs.com/package/prismaql-cli)
[![license](https://img.shields.io/npm/l/prismaql-cli.svg)](LICENSE.md)
[![GitHub issues](https://img.shields.io/github/issues/unbywyd/prismaql-cli)](https://github.com/unbywyd/prismaql-cli/issues)
[![GitHub stars](https://img.shields.io/github/stars/unbywyd/prismaql-cli?style=social)](https://github.com/unbywyd/prismaql-cli)

## Introduction

**PrismaQL CLI** is a command-line tool that leverages the **PrismaQL Core** engine to manage and edit **Prisma schemas** via a **SQL-like DSL**. It allows you to execute **query** and **mutation** commands directly in your terminal, enabling everything from listing models to creating complex relations.

Key advantages:

- **Structured DSL** – Easy-to-read and consistent command format.
- **Safe & Reversible Changes** – Dry-run mode, automatic backups, and validation steps.
- **Flexible** – Supports custom logic via the underlying PrismaQL Core engine.

> **Alpha Notice:** This project is under active development. Expect changes to APIs and features.

---

## Installation

Install globally using npm:

```bash
npm install -g prismaql-cli
```

This will give you the `prismaql` command in your terminal.

---

## Basic Usage

```bash
prismaql <command> [--dry]
```

- **`<command>`** – A PrismaQL DSL command like `GET MODELS;`, `ADD FIELD name TO User ({String});`, etc.
- **`--dry`** – (Optional) Performs a dry run without applying any changes to the schema.

### Examples

```bash
# Query all models
prismaql "GET MODELS;"

# Add a new field
prismaql "ADD FIELD email TO User ({String @unique});"

# Remove a model
prismaql "DELETE MODEL TempData;"
```

---

## Supported Commands

PrismaQL CLI supports the same **Query** and **Mutation** commands as the core library:

### 1. Query Commands

- `GET MODELS` – List all models with highlighting.
- `GET MODEL <name>` – Show details for a specific model (fields, relations, etc.).
- `GET ENUM_RELATIONS <enum>` – Show references to a specific enum across models.
- `GET FIELDS <model>` – List fields for a model.
- `GET FIELDS <field,field2> IN <model>` – Show specific fields.
- `GET RELATIONS <model,model2> (depth?=1)` – Display relations; optionally set a depth.
- `GET ENUMS (raw?)` / `GET ENUMS <enum, ...>` – Show one or more enums.
- `GET MODELS_LIST` – Display a sorted list of all models.
- `PRINT` – Print the entire schema in color.
- `VALIDATE` – Validate the schema.

### 2. Mutation Commands

- `ADD MODEL <name> ({...})` – Create a new model with a Prisma block.
- `ADD FIELD <name> TO <model> ({String})` – Add a field to a model.
- `ADD RELATION <modelA> TO <modelB> (type=1:M, ...)` – Create a relation between two models.
- `ADD ENUM <name> ({A|B|C})` – Create a new enum.
- `DELETE MODEL <name>` – Delete a model.
- `DELETE FIELD <name> IN <model>` – Remove a field.
- `DELETE RELATION <modelA>, <modelB> (relationName=...)` – Remove a relation.
- `DELETE ENUM <name>` – Delete an enum.
- `UPDATE FIELD <name> IN <model> ({...})` – Recreate a field (caution).
- `UPDATE ENUM <name> ({A|B}) (replace=?)` – Append or replace enum values.

Each command follows the **`ACTION COMMAND ARGS (PRISMA_BLOCK) (OPTIONS)`** pattern.

---


## Query Commands (READ-ONLY)

### `GET MODELS`

- **Description**: Lists all models with syntax highlighting.
- **Usage**: `GET MODELS;`

### `GET MODEL <name>`

- **Description**: Shows a detailed view of a specific model, including required fields and relations.
- **Usage**: `GET MODEL User;`

### `GET ENUM_RELATIONS <enum>`

- **Description**: Displays all models and fields referencing a specific enum.
- **Usage**: `GET ENUM_RELATIONS UserRoleEnum;`

### `GET FIELDS <model>`

- **Description**: Lists all fields of a given model.
- **Usage**: `GET FIELDS User;`

### `GET FIELDS <field, field2> IN <model>`

- **Description**: Retrieves and filters specific fields of a model.
- **Usage**: `GET FIELDS name, email IN User;`

### `GET RELATIONS <model, model2> (depth?=1)`

- **Description**: Shows relations among specified models. Accepts an optional depth.
- **Usage**: `GET RELATIONS User, Post (depth=2);`

### `GET ENUMS (raw?)`

- **Description**: Lists all enums in a formatted or raw representation.
- **Usage**: `GET ENUMS (raw=true);`

### `GET ENUMS <enum, enum>`

- **Description**: Filters and displays specific enums.
- **Usage**: `GET ENUMS UserRole, AnotherEnum;`

### `GET MODELS_LIST`

- **Description**: Outputs all model names in a sorted list.
- **Usage**: `GET MODELS_LIST;`

### `PRINT`

- **Description**: Prints the entire schema with color formatting.
- **Usage**: `PRINT;`

### `VALIDATE`

- **Description**: Validates the current schema, checking for errors.
- **Usage**: `VALIDATE;`

---

## Mutation Commands (WRITE OPERATIONS)

### `ADD MODEL <name> ({...})`

- **Description**: Creates a new model. Requires two parameters: `name` and a **Prisma block** with fields.
- **Example**: `ADD MODEL User ({ id Int @id @default(autoincrement()), name String });`

### `ADD FIELD <name> TO <model> ({String})`

- **Description**: Adds a new field to a model. Requires the field name, the model name, and a Prisma block describing field attributes.
- **Example**: `ADD FIELD email TO User ({String @unique});`

### `ADD RELATION <modelA> TO <modelB> (...options)`

- **Description**: Creates a relation between two models. Supports multiple options:
  - **`type`** (required): Defines the relation type: `"1:1" | "1:M" | "M:N"`.
  - **`pivotTable`** (optional): `string | true`. If `true`, a pivot table is created automatically. In `1:1` or `1:M`, it can create an intermediate table.
  - **`fkHolder`** (optional): Specifies which model holds the foreign key.
  - **`required`** (optional): Marks the relation as required (`true`) or optional (`false`). Defaults to `true`.
  - **`relationName`** (optional): Custom relation name. If omitted, a name is generated.
- **Example**:
  ```
  ADD RELATION User TO Profile (
      type=1:1,
      pivotTable=true,
      fkHolder=User,
      required=false,
      relationName=UserProfile
  );
  ```

### `ADD ENUM <name> ({A|B|C})`

- **Description**: Creates a new enum. The block can include values separated by `|`.
- **Example**: `ADD ENUM Role ({ADMIN|USER|SUPERUSER});`

### `DELETE MODEL <name>`

- **Description**: Removes a model by name.
- **Example**: `DELETE MODEL TempData;`

### `DELETE FIELD <name> IN <model>`

- **Description**: Removes a specific field from a model.
- **Example**: `DELETE FIELD email IN User;`

### `DELETE RELATION <modelA>, <modelB> (...options)`

- **Description**: Unlinks relations between two models. If no options are passed, **all** relations between them are removed.
  - **`fieldA`** (optional): Field name on Model A.
  - **`fieldB`** (optional): Field name on Model B.
  - **`relationName`** (optional): If a relation was named via `@relation("myRel")`, specify it here.
- **Example**:
  ```
  DELETE RELATION User, Post (
      fieldA=userId,
      fieldB=authorId,
      relationName=UserPosts
  );
  ```

### `DELETE ENUM <name>`

- **Description**: Removes an existing enum.
- **Example**: `DELETE ENUM Role;`

### `UPDATE FIELD <name> IN <model> ({...})`

- **Description**: Recreates the specified field in a model, which can break migrations if used carelessly.
- **Example**: `UPDATE FIELD email IN User ({String @unique @db.VarChar(255)});`

### `UPDATE ENUM <name> ({A|B})(replace?)`

- **Description**: Updates an enum. By default, new values are appended; with `replace=true`, the existing enum is replaced.
- **Example**:
  ```
  UPDATE ENUM Role ({ADMIN|SUPERADMIN}) (replace=true);
  ```

---

## Dry Run and Confirmation

- **`--dry`** – When you append this flag, the command simulates changes but **does not** modify the schema. This is useful for verifying correctness.
- **Confirmation Hooks** – If you integrate the CLI with a script, you can prompt users for confirmation after seeing the changes (the CLI provides a confirmation mechanism in interactive scenarios).

---

## Backup and Restore

By default, whenever the CLI applies a **mutation**, it stores the previous schema version under `.prisma/backups`. This helps to:

- **Rollback** if something breaks.
- **Track** incremental changes over time.

---

## CLI Workflow

1. **Prepare your Prisma schema** – Typically located in `prisma/schema.prisma`.
2. **Issue commands** – Use DSL statements like `GET MODELS`, `ADD FIELD`, etc.
3. **(Optional) Dry Run** – Evaluate changes with `--dry`.
4. **Apply & Backup** – The CLI commits changes to the schema, backing up the old version.
5. **Validate** – Run `VALIDATE` to ensure the schema remains consistent.

---

## Common Tips

- **Always Validate** – Use `VALIDATE` after major changes.
- **Use Dry Runs** – For complex changes, do a dry run first to ensure correctness.
- **Look for .prisma/backups** – If something goes wrong, you can restore from backups.
- **Combine Commands** – You can pass multiple statements separated by semicolons.

---

## Project Status

- **Alpha Version** – Some features may be incomplete or subject to change.
- **Contributions Welcome** – Please report issues and PRs on [GitHub](https://github.com/unbywyd/prismaql-cli).

---

## License

PrismaQL CLI is licensed under the **MIT License**.

© 2025 [Artyom Gorlovetskiy](https://unbywyd.com).
