#!/usr/bin/env node
'use strict';

var require$$0 = require('fs');
var require$$1 = require('path');
var require$$2 = require('os');
var require$$3 = require('crypto');
var require$$1$1 = require('child_process');

function getDefaultExportFromCjs (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

var detectChanges = {};

var loadEnv = {};

var main = {exports: {}};

var version = "17.2.1";
var require$$4 = {
	version: version};

var hasRequiredMain;

function requireMain () {
	if (hasRequiredMain) return main.exports;
	hasRequiredMain = 1;
	const fs = require$$0;
	const path = require$$1;
	const os = require$$2;
	const crypto = require$$3;
	const packageJson = require$$4;

	const version = packageJson.version;

	// Array of tips to display randomly
	const TIPS = [
	  '🔐 encrypt with Dotenvx: https://dotenvx.com',
	  '🔐 prevent committing .env to code: https://dotenvx.com/precommit',
	  '🔐 prevent building .env in docker: https://dotenvx.com/prebuild',
	  '📡 observe env with Radar: https://dotenvx.com/radar',
	  '📡 auto-backup env with Radar: https://dotenvx.com/radar',
	  '📡 version env with Radar: https://dotenvx.com/radar',
	  '🛠️  run anywhere with `dotenvx run -- yourcommand`',
	  '⚙️  specify custom .env file path with { path: \'/custom/path/.env\' }',
	  '⚙️  enable debug logging with { debug: true }',
	  '⚙️  override existing env vars with { override: true }',
	  '⚙️  suppress all logs with { quiet: true }',
	  '⚙️  write to custom object with { processEnv: myObject }',
	  '⚙️  load multiple .env files with { path: [\'.env.local\', \'.env\'] }'
	];

	// Get a random tip from the tips array
	function _getRandomTip () {
	  return TIPS[Math.floor(Math.random() * TIPS.length)]
	}

	function parseBoolean (value) {
	  if (typeof value === 'string') {
	    return !['false', '0', 'no', 'off', ''].includes(value.toLowerCase())
	  }
	  return Boolean(value)
	}

	function supportsAnsi () {
	  return process.stdout.isTTY // && process.env.TERM !== 'dumb'
	}

	function dim (text) {
	  return supportsAnsi() ? `\x1b[2m${text}\x1b[0m` : text
	}

	const LINE = /(?:^|^)\s*(?:export\s+)?([\w.-]+)(?:\s*=\s*?|:\s+?)(\s*'(?:\\'|[^'])*'|\s*"(?:\\"|[^"])*"|\s*`(?:\\`|[^`])*`|[^#\r\n]+)?\s*(?:#.*)?(?:$|$)/mg;

	// Parse src into an Object
	function parse (src) {
	  const obj = {};

	  // Convert buffer to string
	  let lines = src.toString();

	  // Convert line breaks to same format
	  lines = lines.replace(/\r\n?/mg, '\n');

	  let match;
	  while ((match = LINE.exec(lines)) != null) {
	    const key = match[1];

	    // Default undefined or null to empty string
	    let value = (match[2] || '');

	    // Remove whitespace
	    value = value.trim();

	    // Check if double quoted
	    const maybeQuote = value[0];

	    // Remove surrounding quotes
	    value = value.replace(/^(['"`])([\s\S]*)\1$/mg, '$2');

	    // Expand newlines if double quoted
	    if (maybeQuote === '"') {
	      value = value.replace(/\\n/g, '\n');
	      value = value.replace(/\\r/g, '\r');
	    }

	    // Add to object
	    obj[key] = value;
	  }

	  return obj
	}

	function _parseVault (options) {
	  options = options || {};

	  const vaultPath = _vaultPath(options);
	  options.path = vaultPath; // parse .env.vault
	  const result = DotenvModule.configDotenv(options);
	  if (!result.parsed) {
	    const err = new Error(`MISSING_DATA: Cannot parse ${vaultPath} for an unknown reason`);
	    err.code = 'MISSING_DATA';
	    throw err
	  }

	  // handle scenario for comma separated keys - for use with key rotation
	  // example: DOTENV_KEY="dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=prod,dotenv://:key_7890@dotenvx.com/vault/.env.vault?environment=prod"
	  const keys = _dotenvKey(options).split(',');
	  const length = keys.length;

	  let decrypted;
	  for (let i = 0; i < length; i++) {
	    try {
	      // Get full key
	      const key = keys[i].trim();

	      // Get instructions for decrypt
	      const attrs = _instructions(result, key);

	      // Decrypt
	      decrypted = DotenvModule.decrypt(attrs.ciphertext, attrs.key);

	      break
	    } catch (error) {
	      // last key
	      if (i + 1 >= length) {
	        throw error
	      }
	      // try next key
	    }
	  }

	  // Parse decrypted .env string
	  return DotenvModule.parse(decrypted)
	}

	function _warn (message) {
	  console.error(`[dotenv@${version}][WARN] ${message}`);
	}

	function _debug (message) {
	  console.log(`[dotenv@${version}][DEBUG] ${message}`);
	}

	function _log (message) {
	  console.log(`[dotenv@${version}] ${message}`);
	}

	function _dotenvKey (options) {
	  // prioritize developer directly setting options.DOTENV_KEY
	  if (options && options.DOTENV_KEY && options.DOTENV_KEY.length > 0) {
	    return options.DOTENV_KEY
	  }

	  // secondary infra already contains a DOTENV_KEY environment variable
	  if (process.env.DOTENV_KEY && process.env.DOTENV_KEY.length > 0) {
	    return process.env.DOTENV_KEY
	  }

	  // fallback to empty string
	  return ''
	}

	function _instructions (result, dotenvKey) {
	  // Parse DOTENV_KEY. Format is a URI
	  let uri;
	  try {
	    uri = new URL(dotenvKey);
	  } catch (error) {
	    if (error.code === 'ERR_INVALID_URL') {
	      const err = new Error('INVALID_DOTENV_KEY: Wrong format. Must be in valid uri format like dotenv://:key_1234@dotenvx.com/vault/.env.vault?environment=development');
	      err.code = 'INVALID_DOTENV_KEY';
	      throw err
	    }

	    throw error
	  }

	  // Get decrypt key
	  const key = uri.password;
	  if (!key) {
	    const err = new Error('INVALID_DOTENV_KEY: Missing key part');
	    err.code = 'INVALID_DOTENV_KEY';
	    throw err
	  }

	  // Get environment
	  const environment = uri.searchParams.get('environment');
	  if (!environment) {
	    const err = new Error('INVALID_DOTENV_KEY: Missing environment part');
	    err.code = 'INVALID_DOTENV_KEY';
	    throw err
	  }

	  // Get ciphertext payload
	  const environmentKey = `DOTENV_VAULT_${environment.toUpperCase()}`;
	  const ciphertext = result.parsed[environmentKey]; // DOTENV_VAULT_PRODUCTION
	  if (!ciphertext) {
	    const err = new Error(`NOT_FOUND_DOTENV_ENVIRONMENT: Cannot locate environment ${environmentKey} in your .env.vault file.`);
	    err.code = 'NOT_FOUND_DOTENV_ENVIRONMENT';
	    throw err
	  }

	  return { ciphertext, key }
	}

	function _vaultPath (options) {
	  let possibleVaultPath = null;

	  if (options && options.path && options.path.length > 0) {
	    if (Array.isArray(options.path)) {
	      for (const filepath of options.path) {
	        if (fs.existsSync(filepath)) {
	          possibleVaultPath = filepath.endsWith('.vault') ? filepath : `${filepath}.vault`;
	        }
	      }
	    } else {
	      possibleVaultPath = options.path.endsWith('.vault') ? options.path : `${options.path}.vault`;
	    }
	  } else {
	    possibleVaultPath = path.resolve(process.cwd(), '.env.vault');
	  }

	  if (fs.existsSync(possibleVaultPath)) {
	    return possibleVaultPath
	  }

	  return null
	}

	function _resolveHome (envPath) {
	  return envPath[0] === '~' ? path.join(os.homedir(), envPath.slice(1)) : envPath
	}

	function _configVault (options) {
	  const debug = parseBoolean(process.env.DOTENV_CONFIG_DEBUG || (options && options.debug));
	  const quiet = parseBoolean(process.env.DOTENV_CONFIG_QUIET || (options && options.quiet));

	  if (debug || !quiet) {
	    _log('Loading env from encrypted .env.vault');
	  }

	  const parsed = DotenvModule._parseVault(options);

	  let processEnv = process.env;
	  if (options && options.processEnv != null) {
	    processEnv = options.processEnv;
	  }

	  DotenvModule.populate(processEnv, parsed, options);

	  return { parsed }
	}

	function configDotenv (options) {
	  const dotenvPath = path.resolve(process.cwd(), '.env');
	  let encoding = 'utf8';
	  let processEnv = process.env;
	  if (options && options.processEnv != null) {
	    processEnv = options.processEnv;
	  }
	  let debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || (options && options.debug));
	  let quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || (options && options.quiet));

	  if (options && options.encoding) {
	    encoding = options.encoding;
	  } else {
	    if (debug) {
	      _debug('No encoding is specified. UTF-8 is used by default');
	    }
	  }

	  let optionPaths = [dotenvPath]; // default, look for .env
	  if (options && options.path) {
	    if (!Array.isArray(options.path)) {
	      optionPaths = [_resolveHome(options.path)];
	    } else {
	      optionPaths = []; // reset default
	      for (const filepath of options.path) {
	        optionPaths.push(_resolveHome(filepath));
	      }
	    }
	  }

	  // Build the parsed data in a temporary object (because we need to return it).  Once we have the final
	  // parsed data, we will combine it with process.env (or options.processEnv if provided).
	  let lastError;
	  const parsedAll = {};
	  for (const path of optionPaths) {
	    try {
	      // Specifying an encoding returns a string instead of a buffer
	      const parsed = DotenvModule.parse(fs.readFileSync(path, { encoding }));

	      DotenvModule.populate(parsedAll, parsed, options);
	    } catch (e) {
	      if (debug) {
	        _debug(`Failed to load ${path} ${e.message}`);
	      }
	      lastError = e;
	    }
	  }

	  const populated = DotenvModule.populate(processEnv, parsedAll, options);

	  // handle user settings DOTENV_CONFIG_ options inside .env file(s)
	  debug = parseBoolean(processEnv.DOTENV_CONFIG_DEBUG || debug);
	  quiet = parseBoolean(processEnv.DOTENV_CONFIG_QUIET || quiet);

	  if (debug || !quiet) {
	    const keysCount = Object.keys(populated).length;
	    const shortPaths = [];
	    for (const filePath of optionPaths) {
	      try {
	        const relative = path.relative(process.cwd(), filePath);
	        shortPaths.push(relative);
	      } catch (e) {
	        if (debug) {
	          _debug(`Failed to load ${filePath} ${e.message}`);
	        }
	        lastError = e;
	      }
	    }

	    _log(`injecting env (${keysCount}) from ${shortPaths.join(',')} ${dim(`-- tip: ${_getRandomTip()}`)}`);
	  }

	  if (lastError) {
	    return { parsed: parsedAll, error: lastError }
	  } else {
	    return { parsed: parsedAll }
	  }
	}

	// Populates process.env from .env file
	function config (options) {
	  // fallback to original dotenv if DOTENV_KEY is not set
	  if (_dotenvKey(options).length === 0) {
	    return DotenvModule.configDotenv(options)
	  }

	  const vaultPath = _vaultPath(options);

	  // dotenvKey exists but .env.vault file does not exist
	  if (!vaultPath) {
	    _warn(`You set DOTENV_KEY but you are missing a .env.vault file at ${vaultPath}. Did you forget to build it?`);

	    return DotenvModule.configDotenv(options)
	  }

	  return DotenvModule._configVault(options)
	}

	function decrypt (encrypted, keyStr) {
	  const key = Buffer.from(keyStr.slice(-64), 'hex');
	  let ciphertext = Buffer.from(encrypted, 'base64');

	  const nonce = ciphertext.subarray(0, 12);
	  const authTag = ciphertext.subarray(-16);
	  ciphertext = ciphertext.subarray(12, -16);

	  try {
	    const aesgcm = crypto.createDecipheriv('aes-256-gcm', key, nonce);
	    aesgcm.setAuthTag(authTag);
	    return `${aesgcm.update(ciphertext)}${aesgcm.final()}`
	  } catch (error) {
	    const isRange = error instanceof RangeError;
	    const invalidKeyLength = error.message === 'Invalid key length';
	    const decryptionFailed = error.message === 'Unsupported state or unable to authenticate data';

	    if (isRange || invalidKeyLength) {
	      const err = new Error('INVALID_DOTENV_KEY: It must be 64 characters long (or more)');
	      err.code = 'INVALID_DOTENV_KEY';
	      throw err
	    } else if (decryptionFailed) {
	      const err = new Error('DECRYPTION_FAILED: Please check your DOTENV_KEY');
	      err.code = 'DECRYPTION_FAILED';
	      throw err
	    } else {
	      throw error
	    }
	  }
	}

	// Populate process.env with parsed values
	function populate (processEnv, parsed, options = {}) {
	  const debug = Boolean(options && options.debug);
	  const override = Boolean(options && options.override);
	  const populated = {};

	  if (typeof parsed !== 'object') {
	    const err = new Error('OBJECT_REQUIRED: Please check the processEnv argument being passed to populate');
	    err.code = 'OBJECT_REQUIRED';
	    throw err
	  }

	  // Set process.env
	  for (const key of Object.keys(parsed)) {
	    if (Object.prototype.hasOwnProperty.call(processEnv, key)) {
	      if (override === true) {
	        processEnv[key] = parsed[key];
	        populated[key] = parsed[key];
	      }

	      if (debug) {
	        if (override === true) {
	          _debug(`"${key}" is already defined and WAS overwritten`);
	        } else {
	          _debug(`"${key}" is already defined and was NOT overwritten`);
	        }
	      }
	    } else {
	      processEnv[key] = parsed[key];
	      populated[key] = parsed[key];
	    }
	  }

	  return populated
	}

	const DotenvModule = {
	  configDotenv,
	  _configVault,
	  _parseVault,
	  config,
	  decrypt,
	  parse,
	  populate
	};

	main.exports.configDotenv = DotenvModule.configDotenv;
	main.exports._configVault = DotenvModule._configVault;
	main.exports._parseVault = DotenvModule._parseVault;
	main.exports.config = DotenvModule.config;
	main.exports.decrypt = DotenvModule.decrypt;
	main.exports.parse = DotenvModule.parse;
	main.exports.populate = DotenvModule.populate;

	main.exports = DotenvModule;
	return main.exports;
}

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
	const dotenv = requireMain();
	const path = require$$1;
	const fs = require$$0;
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
	const fs = require$$0;
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
	const MODULES_DIRECTORY = process.env.INPUT_MODULES_DIRECTORY || process.env.MODULES_DIRECTORY || "";

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
	  const manualModulesArray = Array.from(new Set(MANUAL_MODULES.split(",").map((module) => module.trim()).filter((module) => module)));
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
	      const dirMsg = MODULES_DIRECTORY ? `${MODULES_DIRECTORY} directory` : "root level";
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
