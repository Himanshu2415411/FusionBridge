/**
 * Logger utility for UniBridge
 * Provides consistent logging across the application
 */

const fs = require('fs')
const path = require('path')

const LOG_LEVELS = {
  ERROR: 'ERROR',
  WARN: 'WARN',
  INFO: 'INFO',
  DEBUG: 'DEBUG',
}

const LOG_LEVEL_PRIORITY = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
}

class Logger {
  constructor(options = {}) {
    this.level = options.level || process.env.LOG_LEVEL || 'info'
    this.logDir = options.logDir || path.join(process.cwd(), 'logs')
    this.enableFile = options.enableFile !== false
    this.enableConsole = options.enableConsole !== false

    // Ensure log directory exists
    if (this.enableFile && !fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true })
    }
  }

  _shouldLog(level) {
    const currentLevelPriority =
      LOG_LEVEL_PRIORITY[this.level.toUpperCase()] || LOG_LEVEL_PRIORITY.INFO
    const messageLevelPriority = LOG_LEVEL_PRIORITY[level] || LOG_LEVEL_PRIORITY.INFO
    return messageLevelPriority <= currentLevelPriority
  }

  _format(level, message, data = null) {
    const timestamp = new Date().toISOString()
    const dataStr = data ? ` | ${JSON.stringify(data)}` : ''
    return `[${timestamp}] [${level}] ${message}${dataStr}`
  }

  _writeToFile(level, message, data) {
    if (!this.enableFile) return

    try {
      const filename = path.join(
        this.logDir,
        `${new Date().toISOString().split('T')[0]}.log`
      )
      const logMessage = this._format(level, message, data) + '\n'
      fs.appendFileSync(filename, logMessage, 'utf8')
    } catch (err) {
      console.error('Failed to write log to file:', err)
    }
  }

  _writeToConsole(level, message, data, color) {
    if (!this.enableConsole) return

    const formatted = this._format(level, message, data)
    if (color) {
      console.log(`${color}${formatted}\x1b[0m`)
    } else {
      console.log(formatted)
    }
  }

  error(message, data = null) {
    if (!this._shouldLog('ERROR')) return
    this._writeToFile('ERROR', message, data)
    this._writeToConsole('ERROR', message, data, '\x1b[31m') // Red
  }

  warn(message, data = null) {
    if (!this._shouldLog('WARN')) return
    this._writeToFile('WARN', message, data)
    this._writeToConsole('WARN', message, data, '\x1b[33m') // Yellow
  }

  info(message, data = null) {
    if (!this._shouldLog('INFO')) return
    this._writeToFile('INFO', message, data)
    this._writeToConsole('INFO', message, data, '\x1b[32m') // Green
  }

  debug(message, data = null) {
    if (!this._shouldLog('DEBUG')) return
    this._writeToFile('DEBUG', message, data)
    this._writeToConsole('DEBUG', message, data, '\x1b[36m') // Cyan
  }
}

// Create singleton instance
const logger = new Logger({
  level: process.env.LOG_LEVEL || 'info',
  enableFile: process.env.ENABLE_FILE_LOGS !== 'false',
  enableConsole: process.env.ENABLE_CONSOLE_LOGS !== 'false',
})

module.exports = logger
