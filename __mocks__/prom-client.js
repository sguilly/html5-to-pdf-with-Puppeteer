'use strict';

const promClient = {
  collectDefaultMetrics: jest.fn(),
  register: {
    contentType: 'text/plain; charset=utf-8; version=0.0.4',
    metrics: jest.fn(),
  },
  Counter: jest.fn(),
  Histogram: jest.fn(),
};

promClient.Counter.prototype.inc = jest.fn();
promClient.Histogram.prototype = {
  labels: () => promClient.Histogram.prototype,
  observe: jest.fn(),
};

module.exports = promClient;
