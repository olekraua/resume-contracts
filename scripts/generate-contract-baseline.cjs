#!/usr/bin/env node

const cp = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const yaml = require("yaml");

const CONTRACT_FILE_NAMES = new Set(["openapi.yaml", "asyncapi.yaml"]);
const BASELINE_OUTPUT_PATH = "baselines/contracts-ci-baseline.json";
const CI_GATE_FILES = [
    ".github/workflows/ci.yml",
    ".spectral.yaml",
    "scripts/lint-contracts.cjs",
    "scripts/check-schema-compatibility.cjs",
    "package.json",
    "package-lock.json"
];

function runGit(args) {
    const result = cp.spawnSync("git", args, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"]
    });
    if (result.status !== 0) {
        throw new Error(result.stderr.trim() || `git ${args.join(" ")} failed`);
    }
    return (result.stdout || "").trim();
}

function listContractFiles() {
    return runGit(["ls-files"])
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((filePath) => {
            const fileName = path.basename(filePath);
            return CONTRACT_FILE_NAMES.has(fileName) && filePath.includes("/contracts/");
        })
        .sort();
}

function toSha256(content) {
    return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

function readContractDescriptor(rootDir, filePath) {
    const absolutePath = path.join(rootDir, filePath);
    const content = fs.readFileSync(absolutePath, "utf8");
    const parsed = yaml.parse(content) || {};

    return {
        path: filePath,
        title: String(parsed?.info?.title || ""),
        version: String(parsed?.info?.version || ""),
        sha256: toSha256(content)
    };
}

function readCiGateDescriptor(rootDir, filePath) {
    const absolutePath = path.join(rootDir, filePath);
    const content = fs.readFileSync(absolutePath, "utf8");
    return {
        path: filePath,
        sha256: toSha256(content)
    };
}

function buildBaseline(rootDir) {
    const contracts = listContractFiles().map((filePath) => readContractDescriptor(rootDir, filePath));
    const ciGateFiles = CI_GATE_FILES.map((filePath) => readCiGateDescriptor(rootDir, filePath));

    return {
        schema: "resume-contracts-baseline/v1",
        generatedAtUtc: new Date().toISOString(),
        git: {
            branch: runGit(["branch", "--show-current"]),
            commit: runGit(["rev-parse", "HEAD"])
        },
        contracts: {
            totalFiles: contracts.length,
            files: contracts
        },
        ciGates: {
            lintCommand: "npm run contracts:lint",
            compatibilityCommand: "npm run contracts:check",
            workflowPath: ".github/workflows/ci.yml",
            artifactHashes: ciGateFiles
        }
    };
}

function writeBaseline(rootDir, baseline) {
    const outputPath = path.join(rootDir, BASELINE_OUTPUT_PATH);
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(baseline, null, 2)}\n`, "utf8");
}

function main() {
    const rootDir = process.cwd();
    const baseline = buildBaseline(rootDir);
    writeBaseline(rootDir, baseline);
    console.log(
        `Baseline snapshot generated: ${BASELINE_OUTPUT_PATH} (contracts=${baseline.contracts.totalFiles}, commit=${baseline.git.commit})`
    );
}

try {
    main();
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
