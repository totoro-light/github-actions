#!/usr/bin/env node
'use strict';

var require$$0 = require('dotenv');
var require$$1 = require('path');
var require$$2 = require('fs');
var require$$1$1 = require('child_process');

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var detectChanges = {};

var loadEnv = {};

var log;
var hasRequiredLog;

function requireLog () {
	if (hasRequiredLog) return log;
	hasRequiredLog = 1;
	class Logger {
	  info(message) {
	    console.info(`[${new Date().toISOString()}] ${message}`);
	  }

	  error(message) {
	    console.error(`[${new Date().toISOString()}] ERROR: ${message}`);
	  }
	}

	log = {
	  log: new Logger(),
	};
	return log;
}

var hasRequiredLoadEnv;

function requireLoadEnv () {
	if (hasRequiredLoadEnv) return loadEnv;
	hasRequiredLoadEnv = 1;
	const dotenv = require$$0;
	const path = require$$1;
	const fs = require$$2;
	const { log } = requireLog();

	const envFiles = [
	  ".env",
	  ".env.local",
	  ".env.development",
	  ".env.development.local",
	  ".env.production",
	  ".env.production.local",
	].reverse();

	for (const envFile of envFiles) {
	  const envPath = path.join(process.cwd(), envFile);
	  if (fs.existsSync(envPath)) {
	    dotenv.config({ path: envPath });
	    log.info(`🚩 Loaded environment variables from ${envFile}`);
	  }
	}
	return loadEnv;
}

var writeGitHubOutput_1;
var hasRequiredWriteGitHubOutput;

function requireWriteGitHubOutput () {
	if (hasRequiredWriteGitHubOutput) return writeGitHubOutput_1;
	hasRequiredWriteGitHubOutput = 1;
	const fs = require$$2;
	const { log } = requireLog();

	// Function to write to GitHub output using fs
	function writeGitHubOutput(key, value) {
	  if (process.env.GITHUB_OUTPUT) {
	    try {
	      fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`);
	      log.info(`Wrote to GitHub output: ${key}=${value}`);
	    } catch (error) {
	      log.error(`Failed to write to GitHub output: ${error.message}`);
	    }
	  } else {
	    log.info(`${key}=${value}`);
	  }
	}

	writeGitHubOutput_1 = {
	  writeGitHubOutput,
	};
	return writeGitHubOutput_1;
}

var hasRequiredDetectChanges;

function requireDetectChanges () {
	if (hasRequiredDetectChanges) return detectChanges;
	hasRequiredDetectChanges = 1;
	requireLoadEnv();
	const { execSync } = require$$1$1;
	const { log } = requireLog();
	const { writeGitHubOutput } = requireWriteGitHubOutput();

	// Get manual modules from GitHub Actions input or environment variable (for local testing)
	const MANUAL_MODULES = process.env.INPUT_MANUAL_MODULES || process.env.MANUAL_MODULES || "";
	// Get modules directory prefix (e.g., "apps/", "packages/", or "" for root level)
	const MODULES_DIRECTORY = process.env.INPUT_MODULES_DIRECTORY || process.env.MODULES_DIRECTORY || "apps/";

	// Function to execute git commands
	function execGitCommand(command) {
	  try {
	    return execSync(command, { encoding: "utf8" }).trim()
	  } catch (error) {
	    log.error(`Error executing git command: ${command}`, error.message);
	    return ""
	  }
	}

	// Main logic
	if (MANUAL_MODULES && MANUAL_MODULES !== "") {
	  log.info(`Using manually selected modules: ${MANUAL_MODULES}`);

	  // Convert comma-separated list to JSON array
	  const manualModulesArray = Array.from(new Set(MANUAL_MODULES.split(",").filter((module) => module.trim())));
	  const manualModulesJson = JSON.stringify(manualModulesArray);

	  writeGitHubOutput("deploy-modules", manualModulesJson);
	  writeGitHubOutput("has-changes", "true");
	  log.info(`Manually selected modules: ${manualModulesJson}`);
	} else {
	  log.info("Auto-detecting changed modules...");

	  // Get the list of changed files between HEAD and HEAD~1
	  const changedFiles = execGitCommand("git diff --name-only HEAD~1 HEAD");
	  log.info("Changed files:");
	  log.info(changedFiles);

	  if (changedFiles) {
	    // Extract unique module names from the specified directory
	    const changedModulesList = changedFiles
	      .split("\n")
	      .filter((file) => {
	        // Handle different directory prefixes
	        if (MODULES_DIRECTORY === "") {
	          // Root level: include all files
	          return true
	        }
	        // Specific directory: filter by prefix
	        return file.startsWith(MODULES_DIRECTORY)
	      })
	      .map((file) => {
	        // Extract module name based on directory structure
	        if (MODULES_DIRECTORY === "") {
	          // Root level: module is the first directory (e.g., "module1/file.js" -> "module1")
	          return file.split("/")[0]
	        }
	        // Subdirectory: get the directory after the prefix
	        // e.g., "apps/module1/file.js" with prefix "apps/" -> "module1"
	        const parts = file.split("/");
	        const prefixDepth = MODULES_DIRECTORY.split("/").filter(p => p).length;
	        return parts[prefixDepth]
	      })
	      .filter((module) => module && module.trim()) // Remove empty entries
	      .filter((module, index, arr) => arr.indexOf(module) === index) // Remove duplicates
	      .sort();

	    if (changedModulesList.length > 0) {
	      // Convert to JSON array for matrix strategy
	      const changedModulesJson = JSON.stringify(changedModulesList);
	      writeGitHubOutput("deploy-modules", changedModulesJson);
	      writeGitHubOutput("has-changes", "true");
	      log.info(`Auto-detected changed modules: ${changedModulesJson}`);
	    } else {
	      writeGitHubOutput("deploy-modules", "[]");
	      writeGitHubOutput("has-changes", "false");
	      const dirMsg = `${MODULES_DIRECTORY} directory` ;
	      log.info(`No modules changed in ${dirMsg}`);
	    }
	  } else {
	    writeGitHubOutput("deploy-modules", "[]");
	    writeGitHubOutput("has-changes", "false");
	    log.info("No changes detected or git command failed");
	  }
	}
	return detectChanges;
}

var detectChangesExports = requireDetectChanges();
var index = /*@__PURE__*/getDefaultExportFromCjs(detectChangesExports);

module.exports = index;
