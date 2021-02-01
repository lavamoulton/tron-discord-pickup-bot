class CommandValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "CommandValidationError";
  }
};

module.exports = { CommandValidationError };
