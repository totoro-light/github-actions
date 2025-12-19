const fs = require("fs")
const { log } = require("./log")

// Function to write to GitHub output using fs
function writeGitHubOutput(key, value) {
  if (process.env.GITHUB_OUTPUT) {
    try {
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `${key}=${value}\n`)
      log.info(`Wrote to GitHub output: ${key}=${value}`)
    } catch (error) {
      log.error(`Failed to write to GitHub output: ${error.message}`)
    }
  } else {
    log.info(`${key}=${value}`)
  }
}

module.exports = {
  writeGitHubOutput,
}
