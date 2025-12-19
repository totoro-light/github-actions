require("./load-env")
const { execSync } = require("child_process")
const fs = require("fs")
const { log } = require("./log")
const { writeGitHubOutput } = require("./writeGitHubOutput")

// Get manual modules from GitHub Actions input or environment variable (for local testing)
const MANUAL_MODULES = process.env.INPUT_MANUAL_MODULES || process.env.MANUAL_MODULES || ""
// Get modules directory prefix (e.g., "apps/", "packages/", or "" for root level)
const MODULES_DIRECTORY = process.env.INPUT_MODULES_DIRECTORY || process.env.MODULES_DIRECTORY || "apps/"

// Function to execute git commands
function execGitCommand(command) {
  try {
    return execSync(command, { encoding: "utf8" }).trim()
  } catch (error) {
    log.error(`Error executing git command: ${command}`, error.message)
    return ""
  }
}

// Main logic
if (MANUAL_MODULES && MANUAL_MODULES !== "") {
  log.info(`Using manually selected modules: ${MANUAL_MODULES}`)

  // Convert comma-separated list to JSON array
  const manualModulesArray = Array.from(new Set(MANUAL_MODULES.split(",").map((module) => module.trim()).filter((module) => module)))
  const manualModulesJson = JSON.stringify(manualModulesArray)

  writeGitHubOutput("deploy-modules", manualModulesJson)
  writeGitHubOutput("has-changes", "true")
  log.info(`Manually selected modules: ${manualModulesJson}`)
} else {
  log.info("Auto-detecting changed modules...")

  // Get the list of changed files between HEAD and HEAD~1
  const changedFiles = execGitCommand("git diff --name-only HEAD~1 HEAD")
  log.info("Changed files:")
  log.info(changedFiles)

  if (changedFiles) {
    // Extract unique module names from the specified directory
    const changedModulesList = changedFiles
      .split("\n")
      .filter((file) => {
        // Handle different directory prefixes
        if (!MODULES_DIRECTORY || MODULES_DIRECTORY === "") {
          // Root level: include all files
          return true
        }
        // Specific directory: filter by prefix
        return file.startsWith(MODULES_DIRECTORY)
      })
      .map((file) => {
        // Extract module name based on directory structure
        if (!MODULES_DIRECTORY || MODULES_DIRECTORY === "") {
          // Root level: module is the first directory (e.g., "module1/file.js" -> "module1")
          return file.split("/")[0]
        }
        // Subdirectory: get the directory after the prefix
        // e.g., "apps/module1/file.js" with prefix "apps/" -> "module1"
        const parts = file.split("/")
        const prefixDepth = MODULES_DIRECTORY.split("/").filter(p => p).length
        return parts[prefixDepth]
      })
      .filter((module) => module && module.trim()) // Remove empty entries
      .filter((module, index, arr) => arr.indexOf(module) === index) // Remove duplicates
      .sort()

    if (changedModulesList.length > 0) {
      // Convert to JSON array for matrix strategy
      const changedModulesJson = JSON.stringify(changedModulesList)
      writeGitHubOutput("deploy-modules", changedModulesJson)
      writeGitHubOutput("has-changes", "true")
      log.info(`Auto-detected changed modules: ${changedModulesJson}`)
    } else {
      writeGitHubOutput("deploy-modules", "[]")
      writeGitHubOutput("has-changes", "false")
      const dirMsg = MODULES_DIRECTORY ? `${MODULES_DIRECTORY} directory` : "root level"
      log.info(`No modules changed in ${dirMsg}`)
    }
  } else {
    writeGitHubOutput("deploy-modules", "[]")
    writeGitHubOutput("has-changes", "false")
    log.info("No changes detected or git command failed")
  }
}
