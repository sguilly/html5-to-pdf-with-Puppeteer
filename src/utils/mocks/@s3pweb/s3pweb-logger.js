/* eslint-disable @typescript-eslint/no-unused-vars */
'use strict';

class Logger {
  constructor() {
    // -- Empty
  }

  get() {
    return this;
  }

  getChild(name) {
    return this;
  }

  child(name) {
    return this;
  }

  trace() {
    return jest.fn();
  }

  debug() {
    return jest.fn();
  }

  info() {
    return jest.fn();
  }

  warn() {
    return jest.fn();
  }

  error() {
    return jest.fn();
  }
}

const instanceLogger = new Logger();
module.exports.logger = instanceLogger.get();
