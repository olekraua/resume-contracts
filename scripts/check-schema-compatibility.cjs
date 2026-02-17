#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");
const cp = require("node:child_process");
const yaml = require("yaml");
const openapiDiff = require("openapi-diff");
const { diff: asyncapiDiff } = require("@asyncapi/diff");

const CONTRACT_FILE_NAMES = new Set(["openapi.yaml", "asyncapi.yaml"]);
const SEMVER_PATTERN = /^(\d+)\.(\d+)\.(\d+)(?:[-+][0-9A-Za-z.-]+)?$/;

function runGit(args, options = {}) {
    const result = cp.spawnSync("git", args, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        ...options
    });
    return {
        ok: result.status === 0,
        status: result.status,
        stdout: result.stdout || "",
        stderr: result.stderr || ""
    };
}

function parseArgs() {
    const args = process.argv.slice(2);
    let baseRef = "";
    for (let i = 0; i < args.length; i += 1) {
        const arg = args[i];
        if (arg === "--base-ref" && args[i + 1]) {
            baseRef = args[i + 1];
            i += 1;
            continue;
        }
        if (arg.startsWith("--base-ref=")) {
            baseRef = arg.substring("--base-ref=".length);
        }
    }
    return { baseRef };
}

function resolveBaseRef(cliBaseRef) {
    if (cliBaseRef) {
        return cliBaseRef;
    }
    if (process.env.SCHEMA_BASE_REF) {
        return process.env.SCHEMA_BASE_REF;
    }
    if (process.env.GITHUB_BASE_REF) {
        return `origin/${process.env.GITHUB_BASE_REF}`;
    }
    return "HEAD~1";
}

function resolveBaseSha(baseRef) {
    const mergeBase = runGit(["merge-base", "HEAD", baseRef]);
    if (mergeBase.ok && mergeBase.stdout.trim()) {
        return mergeBase.stdout.trim();
    }

    const revParse = runGit(["rev-parse", baseRef]);
    if (revParse.ok && revParse.stdout.trim()) {
        return revParse.stdout.trim();
    }

    return "";
}

function listContractFiles() {
    const trackedFiles = runGit(["ls-files"]);
    if (!trackedFiles.ok) {
        throw new Error(`Failed to list tracked files: ${trackedFiles.stderr.trim()}`);
    }

    const untrackedFiles = runGit(["ls-files", "--others", "--exclude-standard"]);
    if (!untrackedFiles.ok) {
        throw new Error(`Failed to list untracked files: ${untrackedFiles.stderr.trim()}`);
    }

    return `${trackedFiles.stdout}\n${untrackedFiles.stdout}`
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((value, index, array) => array.indexOf(value) === index)
        .filter((filePath) => {
            const fileName = path.basename(filePath);
            return (
                CONTRACT_FILE_NAMES.has(fileName) &&
                filePath.includes("/contracts/")
            );
        })
        .sort();
}

function parseVersion(filePath, content) {
    let parsed;
    try {
        parsed = yaml.parse(content);
    } catch (error) {
        throw new Error(`[${filePath}] YAML parse failed: ${error.message}`);
    }

    const version = parsed?.info?.version;
    if (typeof version !== "string" || !version.trim()) {
        throw new Error(`[${filePath}] info.version is missing`);
    }

    const match = version.trim().match(SEMVER_PATTERN);
    if (!match) {
        throw new Error(
            `[${filePath}] info.version "${version}" must follow semver (MAJOR.MINOR.PATCH)`
        );
    }

    return {
        raw: version.trim(),
        major: Number(match[1]),
        minor: Number(match[2]),
        patch: Number(match[3])
    };
}

function compareVersion(left, right) {
    if (left.major !== right.major) {
        return left.major > right.major ? 1 : -1;
    }
    if (left.minor !== right.minor) {
        return left.minor > right.minor ? 1 : -1;
    }
    if (left.patch !== right.patch) {
        return left.patch > right.patch ? 1 : -1;
    }
    return 0;
}

function getContentFromBase(baseSha, filePath) {
    if (!baseSha) {
        return null;
    }
    const result = runGit(["show", `${baseSha}:${filePath}`]);
    if (result.ok) {
        return result.stdout;
    }

    const notFound =
        result.stderr.includes("does not exist in") ||
        result.stderr.includes("exists on disk, but not in") ||
        result.stderr.includes("Path '");
    if (notFound) {
        return null;
    }
    throw new Error(`[${filePath}] Failed to read file from base commit: ${result.stderr}`);
}

async function runDiff(filePath, previousContent, currentContent) {
    if (filePath.endsWith("openapi.yaml")) {
        const result = await openapiDiff.diffSpecs({
            sourceSpec: {
                content: previousContent,
                location: `${filePath}@base`,
                format: "openapi3"
            },
            destinationSpec: {
                content: currentContent,
                location: `${filePath}@head`,
                format: "openapi3"
            }
        });

        return {
            breakingCount: result.breakingDifferencesFound ? 1 : 0,
            nonBreakingCount: Array.isArray(result.nonBreakingDifferences)
                ? result.nonBreakingDifferences.length
                : 0,
            unclassifiedCount: Array.isArray(result.unclassifiedDifferences)
                ? result.unclassifiedDifferences.length
                : 0
        };
    }

    if (filePath.endsWith("asyncapi.yaml")) {
        const previousDoc = yaml.parse(previousContent);
        const currentDoc = yaml.parse(currentContent);
        const result = asyncapiDiff(previousDoc, currentDoc);

        return {
            breakingCount: result.breaking().length,
            nonBreakingCount: result.nonBreaking().length,
            unclassifiedCount: result.unclassified().length
        };
    }

    throw new Error(`[${filePath}] Unsupported schema type`);
}

async function main() {
    const { baseRef: cliBaseRef } = parseArgs();
    const baseRef = resolveBaseRef(cliBaseRef);
    const baseSha = resolveBaseSha(baseRef);
    const rootDir = process.cwd();
    const files = listContractFiles();
    const errors = [];
    let changedFiles = 0;

    if (files.length === 0) {
        console.log("No contract schema files were found.");
        return;
    }

    if (baseSha) {
        console.log(`Contract compatibility baseline: ${baseRef} (${baseSha})`);
    } else {
        console.log(`Contract compatibility baseline not found for "${baseRef}".`);
        console.log("Treating all contract files as newly introduced.");
    }

    for (const filePath of files) {
        const currentContent = fs.readFileSync(path.join(rootDir, filePath), "utf8");
        const currentVersion = parseVersion(filePath, currentContent);
        const previousContent = getContentFromBase(baseSha, filePath);

        if (previousContent === null) {
            if (currentVersion.raw !== "1.0.0") {
                errors.push(
                    `[${filePath}] New schema files must start with info.version 1.0.0; found ${currentVersion.raw}.`
                );
            }
            console.log(`[NEW] ${filePath} version ${currentVersion.raw}`);
            continue;
        }

        const previousVersion = parseVersion(filePath, previousContent);

        if (previousContent === currentContent) {
            if (previousVersion.raw !== currentVersion.raw) {
                errors.push(
                    `[${filePath}] info.version changed from ${previousVersion.raw} to ${currentVersion.raw}, but schema content is unchanged.`
                );
            }
            console.log(`[UNCHANGED] ${filePath} version ${currentVersion.raw}`);
            continue;
        }

        changedFiles += 1;
        const versionDiff = compareVersion(currentVersion, previousVersion);
        if (versionDiff <= 0) {
            errors.push(
                `[${filePath}] Schema changed, but info.version did not increase (${previousVersion.raw} -> ${currentVersion.raw}).`
            );
        }

        let diffResult;
        try {
            diffResult = await runDiff(filePath, previousContent, currentContent);
        } catch (error) {
            errors.push(`[${filePath}] Diff check failed: ${error.message}`);
            continue;
        }

        const hasPotentiallyBreakingChange =
            diffResult.breakingCount > 0 || diffResult.unclassifiedCount > 0;
        if (hasPotentiallyBreakingChange && currentVersion.major <= previousVersion.major) {
            errors.push(
                `[${filePath}] Potentially breaking changes require major version bump (${previousVersion.raw} -> ${currentVersion.raw}).`
            );
        }

        console.log(
            `[CHANGED] ${filePath} ${previousVersion.raw} -> ${currentVersion.raw} ` +
                `(breaking=${diffResult.breakingCount}, non-breaking=${diffResult.nonBreakingCount}, unclassified=${diffResult.unclassifiedCount})`
        );
    }

    if (errors.length > 0) {
        console.error("\nSchema compatibility checks failed:");
        for (const error of errors) {
            console.error(`- ${error}`);
        }
        process.exit(1);
    }

    console.log(
        `\nSchema compatibility checks passed (${files.length} files scanned, ${changedFiles} changed).`
    );
}

main().catch((error) => {
    console.error(error.message);
    process.exit(1);
});
