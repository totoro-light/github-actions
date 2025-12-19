class Logger {
  info(message) {
    console.info(`[${new Date().toISOString()}] ${message}`)
  }

  error(message) {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`)
  }
}

module.exports = {
  log: new Logger(),
}
