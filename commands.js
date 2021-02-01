const yargs = require('yargs');
const { CommandValidationError } = require('./exceptions');

const COMMAND_PREFIX = "!";

const COMMAND_PARSER = createYargsParser();

const DEFAULT_REMOVAL_MINUTES = 360; // 6 hours
const MIN_REMOVAL_MINUTES = 15;
const MAX_REMOVAL_MINUTES = 360;

function createYargsParser() {
  return yargs
    .command({
      command: 'add [game] [tronAuth]',
      desc: 'Add a user to the player list of the game mode(s)',
      builder: (yargs) => yargs
        .option('autoremove', {
          alias: 'r',
          type: 'number',
          number: true
        })
    })
    .command({
      command: 'remove [game]',
      desc: 'Remove a user from the player list of the game mode(s)'
    })
    .command({
      command: 'autoremove <time>',
      desc: 'Remove a user from the player list of all game modes after "x" minutes',
      builder: (yargs) => yargs
        .positional('time', {
          type: 'number',
        })
    })
    .help(false) // Disable the help option on the parser
}

function parse(messageText) {
  if (!messageText.startsWith(COMMAND_PREFIX)) {
    return null;  // Ignore message
  }

  // Remove prefix from string
  commandWithoutPrefix = messageText.substring(1);

  var parsedArgs;
  var parserError;
  COMMAND_PARSER.parse(commandWithoutPrefix, function (err, argv, output) {
    parsedArgs = argv;

    // We cannot rethrow from this function, so we save the value for later
    // usage. See yargs docs on exitProcess() for more info.
    parserError = err;
  })

  if (parserError) {
    throw new CommandValidationError(parserError.message)
  }

  var commandType = parsedArgs._[0];
  let parsedOutput = {
    commandType: commandType
  }

  if (commandType === 'add') {
    parsedOutput.options = parseAddCommand(parsedArgs);
  } else if (commandType === 'remove') {
    parsedOutput.options = parseRemoveCommand(parsedArgs)
  } else if (commandType === 'autoremove') {
    parsedOutput.options = parseAutoRemoveCommand(parsedArgs);
  }

  return parsedOutput;
}

function parseAddCommand(args) {
  var removeInMinutes = args.autoremove || DEFAULT_REMOVAL_MINUTES;
  validateRemovalValue(removeInMinutes);

  return {
    game: args.game || null,
    tronAuth: args.tronAuth || null,
    removeInMinutes: removeInMinutes
  };
}

function parseRemoveCommand(args) {
  return {
    game: args.game || null
  }
}

function parseAutoRemoveCommand(args) {
  var removeInMinutes = args.time || DEFAULT_REMOVAL_MINUTES;
  validateRemovalValue(removeInMinutes);

  return {
    removeInMinutes: removeInMinutes
  }
}

function validateRemovalValue(removeInMinutes) {
  if (removeInMinutes < MIN_REMOVAL_MINUTES || removeInMinutes > MAX_REMOVAL_MINUTES) {
    throw new CommandValidationError(`The autoremove value must be in range [${MIN_REMOVAL_MINUTES}, ${MAX_REMOVAL_MINUTES}]`);
  }
}

// Allow the parse function to be imported
module.exports = { parse };
