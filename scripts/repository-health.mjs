import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, statSync, readFileSync } from "node:fs";
import path from "node:path";
import ts from "typescript";

const root = process.cwd();
const failures = [];
const warnings = [];

const registryNames = [
  "resourceDefinitions",
  "gameplayStatDefinitions",
  "upgrades",
  "careerStages",
  "promotionDefinitions",
  "uiSurfaceDefinitions",
  "unlockDefinitions",
];

const forbiddenPathRules = [
  [/^(QA-idle|QA-idle-[0-9]+|QA-idle-upload)(\/|$)/, "duplicate imported project folder"],
  [/^QA-idle-git-work\/QA-idle/, "nested duplicate imported project folder"],
  [/(^|\/)node_modules\//, "dependency folder"],
  [/(^|\/)dist\//, "generated build output"],
  [/(^|\/)__MACOSX\//, "archive metadata folder"],
  [/(^|\/)\._/, "archive metadata file"],
  [/(^|\/)\.pnpm-store\//, "package manager cache"],
  [/(^|\/)\.vite\//, "Vite cache"],
  [/\.tsbuildinfo$/, "TypeScript build cache"],
  [/\.log$/, "log file"],
  [/^vite\.config\.(js|d\.ts)$/, "generated Vite config artifact"],
];

function addFailure(message) {
  failures.push(message);
}

function addWarning(message) {
  warnings.push(message);
}

function runGit(args) {
  return execFileSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function splitNullDelimited(output) {
  return output.split("\0").filter(Boolean);
}

function normalizePath(filePath) {
  return filePath.replaceAll("\\", "/");
}

function listMarkdownFiles(directory) {
  const files = [];

  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);

    if (entry.isDirectory()) {
      files.push(...listMarkdownFiles(absolutePath));
    } else if (entry.isFile() && entry.name.endsWith(".md")) {
      files.push(absolutePath);
    }
  }

  return files;
}

function readSourceFile(relativePath) {
  const absolutePath = path.join(root, relativePath);
  return ts.createSourceFile(
    relativePath,
    readFileSync(absolutePath, "utf8"),
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
}

function propertyNameText(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }

  return undefined;
}

function propertyValueText(expression) {
  if (ts.isStringLiteral(expression) || ts.isNumericLiteral(expression)) {
    return expression.text;
  }

  if (
    ts.isPropertyAccessExpression(expression) ||
    ts.isIdentifier(expression) ||
    ts.isNoSubstitutionTemplateLiteral(expression)
  ) {
    return expression.getText();
  }

  return undefined;
}

function getObjectProperty(objectLiteral, propertyName) {
  return objectLiteral.properties.find(
    (property) =>
      ts.isPropertyAssignment(property) &&
      propertyNameText(property.name) === propertyName,
  );
}

function collectMvpIds() {
  const sourceFile = readSourceFile("src/types.ts");
  const ids = new Map();
  const values = new Map();

  function visitObject(objectLiteral, prefix) {
    for (const property of objectLiteral.properties) {
      if (!ts.isPropertyAssignment(property)) {
        continue;
      }

      const key = propertyNameText(property.name);

      if (!key) {
        continue;
      }

      const nextPrefix = `${prefix}.${key}`;
      const initializer = property.initializer;

      if (ts.isStringLiteral(initializer)) {
        ids.set(nextPrefix, initializer.text);

        if (!values.has(initializer.text)) {
          values.set(initializer.text, []);
        }

        values.get(initializer.text).push(nextPrefix);
      } else if (ts.isObjectLiteralExpression(initializer)) {
        visitObject(initializer, nextPrefix);
      }
    }
  }

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === "MVP_IDS"
    ) {
      const expression = ts.isAsExpression(node.initializer)
        ? node.initializer.expression
        : node.initializer;

      if (expression && ts.isObjectLiteralExpression(expression)) {
        visitObject(expression, "MVP_IDS");
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  for (const [value, references] of values.entries()) {
    if (references.length > 1) {
      addFailure(
        `Duplicate stable ID "${value}" in src/types.ts: ${references.join(", ")}.`,
      );
    }
  }

  return ids;
}

function resolveExpressionValue(expression, mvpIds) {
  const rawValue = propertyValueText(expression);

  if (!rawValue) {
    return undefined;
  }

  return mvpIds.get(rawValue) ?? rawValue;
}

function collectArrayObjects(sourceFile, variableName) {
  const objects = [];

  function visit(node) {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === variableName
    ) {
      const initializer = ts.isAsExpression(node.initializer)
        ? node.initializer.expression
        : node.initializer;

      if (initializer && ts.isArrayLiteralExpression(initializer)) {
        for (const element of initializer.elements) {
          if (ts.isObjectLiteralExpression(element)) {
            objects.push(element);
          }
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  return objects;
}

function collectRegistryIds(sourceFile, mvpIds) {
  const registries = new Map();

  for (const registryName of registryNames) {
    const ids = new Map();
    const objects = collectArrayObjects(sourceFile, registryName);

    for (const objectLiteral of objects) {
      const idProperty = getObjectProperty(objectLiteral, "id");

      if (!idProperty) {
        addFailure(`Missing id property in ${registryName} entry.`);
        continue;
      }

      const id = resolveExpressionValue(idProperty.initializer, mvpIds);

      if (!id) {
        addFailure(
          `Unable to resolve id expression "${idProperty.initializer.getText()}" in ${registryName}.`,
        );
        continue;
      }

      if (!ids.has(id)) {
        ids.set(id, []);
      }

      ids.get(id).push(idProperty.initializer.getText());
    }

    for (const [id, references] of ids.entries()) {
      if (references.length > 1) {
        addFailure(
          `Duplicate registry id "${id}" in ${registryName}: ${references.join(", ")}.`,
        );
      }
    }

    registries.set(registryName, new Set(ids.keys()));
  }

  return registries;
}

function checkForbiddenFiles() {
  const trackedFiles = splitNullDelimited(runGit(["ls-files", "-z"]));
  const untrackedFiles = splitNullDelimited(
    runGit(["ls-files", "--others", "--exclude-standard", "-z"]),
  );

  for (const filePath of [...trackedFiles, ...untrackedFiles]) {
    const normalized = normalizePath(filePath);
    const matchedRule = forbiddenPathRules.find(([pattern]) => pattern.test(normalized));

    if (matchedRule) {
      addFailure(`${normalized} is not allowed (${matchedRule[1]}).`);
    }
  }
}

function checkMarkdownLinks() {
  const markdownFiles = [
    path.join(root, "README.md"),
    ...listMarkdownFiles(path.join(root, "docs")),
  ];
  const markdownLinkPattern = /(?<!!)\[[^\]]+\]\(([^)]+)\)/g;

  for (const markdownFile of markdownFiles) {
    const contents = readFileSync(markdownFile, "utf8");
    const relativeMarkdownFile = normalizePath(path.relative(root, markdownFile));

    for (const match of contents.matchAll(markdownLinkPattern)) {
      const rawTarget = match[1].trim();

      if (
        rawTarget.startsWith("#") ||
        /^[a-z][a-z0-9+.-]*:/i.test(rawTarget) ||
        rawTarget.startsWith("mailto:")
      ) {
        continue;
      }

      const withoutTitle = rawTarget.match(/^([^"\s]+)(?:\s+".*")?$/)?.[1] ?? rawTarget;
      const withoutAnchor = withoutTitle.split("#")[0];

      if (!withoutAnchor) {
        continue;
      }

      const decodedTarget = decodeURIComponent(withoutAnchor);
      const absoluteTarget = path.resolve(path.dirname(markdownFile), decodedTarget);

      if (!existsSync(absoluteTarget)) {
        addFailure(`${relativeMarkdownFile} links to missing local path: ${rawTarget}.`);
        continue;
      }

      const stats = statSync(absoluteTarget);

      if (!stats.isFile() && !stats.isDirectory()) {
        addFailure(`${relativeMarkdownFile} links to unsupported path: ${rawTarget}.`);
      }
    }
  }
}

function checkRegistryReferences(sourceFile, mvpIds, registries) {
  const resourceIds = registries.get("resourceDefinitions");
  const gameplayStatIds = registries.get("gameplayStatDefinitions");
  const promotionIds = registries.get("promotionDefinitions");
  const uiSurfaceIds = registries.get("uiSurfaceDefinitions");
  const unlockIds = registries.get("unlockDefinitions");
  const modifierDefinitionIds = new Map();

  function rememberModifierDefinitionId(expression) {
    const value = resolveExpressionValue(expression, mvpIds);

    if (!value) {
      addFailure(
        `Unable to resolve modifier definition id expression "${expression.getText()}".`,
      );
      return;
    }

    if (!modifierDefinitionIds.has(value)) {
      modifierDefinitionIds.set(value, []);
    }

    modifierDefinitionIds.get(value).push(expression.getText());
  }

  function assertReference(set, value, label, sourceExpression) {
    if (!set?.has(value)) {
      addFailure(`${label} references unknown id "${value}" via ${sourceExpression}.`);
    }
  }

  function visit(node) {
    if (ts.isPropertyAssignment(node)) {
      const name = propertyNameText(node.name);
      const value = resolveExpressionValue(node.initializer, mvpIds);

      if (value) {
        switch (name) {
          case "resourceId":
            assertReference(resourceIds, value, "Registry", node.initializer.getText());
            break;
          case "targetStatId":
            assertReference(
              gameplayStatIds,
              value,
              "Modifier",
              node.initializer.getText(),
            );
            break;
          case "promotionId":
          case "completedPromotionId":
            assertReference(promotionIds, value, "Registry", node.initializer.getText());
            break;
          case "targetId":
          case "setCurrentStageId":
            if (name === "targetId") {
              assertReference(uiSurfaceIds, value, "Unlock", node.initializer.getText());
            }
            break;
          case "controlledByUnlockId":
            if (value !== "null") {
              assertReference(unlockIds, value, "UI surface", node.initializer.getText());
            }
            break;
          case "definitionId":
            rememberModifierDefinitionId(node.initializer);
            break;
        }
      }
    }

    ts.forEachChild(node, visit);
  }

  visit(sourceFile);

  for (const [id, references] of modifierDefinitionIds.entries()) {
    if (references.length > 1) {
      addFailure(
        `Duplicate modifier definition id "${id}" in src/gameData.ts: ${references.join(
          ", ",
        )}.`,
      );
    }
  }
}

function checkFileSizeWarnings() {
  const sourceFiles = splitNullDelimited(runGit(["ls-files", "-z", "--", "src"]));

  for (const filePath of sourceFiles) {
    const absolutePath = path.join(root, filePath);

    if (!existsSync(absolutePath) || !statSync(absolutePath).isFile()) {
      continue;
    }

    const lineCount = readFileSync(absolutePath, "utf8").split(/\r?\n/).length;

    if (lineCount > 500) {
      addWarning(`${normalizePath(filePath)} has ${lineCount} lines.`);
    }
  }
}

checkForbiddenFiles();
checkMarkdownLinks();

const mvpIds = collectMvpIds();
const gameDataSource = readSourceFile("src/gameData.ts");
const registries = collectRegistryIds(gameDataSource, mvpIds);

checkRegistryReferences(gameDataSource, mvpIds, registries);
checkFileSizeWarnings();

if (warnings.length > 0) {
  console.warn("Repository health warnings:");
  for (const warning of warnings) {
    console.warn(` - ${warning}`);
  }
}

if (failures.length > 0) {
  console.error("Repository health check failed:");
  for (const failure of failures) {
    console.error(` - ${failure}`);
  }
  process.exit(1);
}

console.log("Repository health check passed.");
