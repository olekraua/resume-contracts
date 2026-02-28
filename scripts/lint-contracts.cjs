#!/usr/bin/env node

const cp = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const CONTRACT_FILE_NAMES = new Set(["openapi.yaml", "asyncapi.yaml"]);

function runGit(args) {
    const result = cp.spawnSync("git", args, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"]
    });

    if (result.status !== 0) {
        throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
    }
    return result.stdout || "";
}

function listContractFiles() {
    const trackedFiles = runGit(["ls-files"]);
    const untrackedFiles = runGit(["ls-files", "--others", "--exclude-standard"]);

    return `${trackedFiles}\n${untrackedFiles}`
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((value, index, array) => array.indexOf(value) === index)
        .filter((filePath) => {
            const fileName = path.basename(filePath);
            return CONTRACT_FILE_NAMES.has(fileName) && filePath.includes("/contracts/");
        })
        .sort();
}

function resolveSpectralBinary(rootDir) {
    const binaryName = process.platform === "win32" ? "spectral.cmd" : "spectral";
    return path.join(rootDir, "node_modules", ".bin", binaryName);
}

function main() {
    const rootDir = process.cwd();
    const contractFiles = listContractFiles();

    if (contractFiles.length === 0) {
        console.log("No contract schema files were found.");
        return;
    }

    const spectralBinary = resolveSpectralBinary(rootDir);
    if (!fs.existsSync(spectralBinary)) {
        throw new Error(
            "Spectral CLI was not found. Run `npm ci` (or `npm install`) before linting contracts."
        );
    }

    const spectralRuleset = path.join(rootDir, ".spectral.yaml");
    const args = [
        "lint",
        "--ruleset",
        spectralRuleset,
        "--fail-severity",
        "warn",
        ...contractFiles
    ];

    const result = cp.spawnSync(spectralBinary, args, {
        stdio: "inherit"
    });

    if (result.error) {
        throw result.error;
    }

    if (typeof result.status === "number" && result.status !== 0) {
        process.exit(result.status);
    }

    console.log(`\nSpectral strict lint passed (${contractFiles.length} files scanned).`);
}

try {
    main();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
