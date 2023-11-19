class TimeoutError extends Error {
  constructor() {
    super('TimeoutError');
  }
}

module.exports.TimeoutError = TimeoutError;
