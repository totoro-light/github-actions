const dotenv = require("dotenv")
const path = require("path")
const fs = require("fs")
const { log } = require("./log")

const envFiles = [
  ".env",
  ".env.local",
  ".env.development",
  ".env.development.local",
  ".env.production",
  ".env.production.local",
].reverse()

for (const envFile of envFiles) {
  const envPath = path.join(process.cwd(), envFile)
  if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath })
    log.info(`🚩 Loaded environment variables from ${envFile}`)
  }
}
