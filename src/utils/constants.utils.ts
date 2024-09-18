import config from 'config';

export class Constants {
  // ================================================================
  // Correlation & Api params constants
  // ================================================================
  static readonly idParamApiObj = {
    name: 'id',
    type: String,
    required: true,
    example: 'test',
  };

  static readonly correlationIdHeader = 'X-Correlation-Id';
  static readonly correlationId = 'x-correlation-id';
  static readonly correlationIdHeaderObj = {
    name: Constants.correlationId,
    required: false,
    description: 'Do not use',
  };

  // ================================================================
  // Configuration constants
  // ================================================================
  static readonly configName: string = config.get('name');
  static readonly isSwaggerEnabled: boolean = config.get('swagger.enabled');
  static readonly isCompressionEnabled: boolean = config.get('compression.enabled');

  // ================================================================
  // Files constants
  // ================================================================
  static readonly maxFileSizeInBytes: number = 5242880; // 5 Megabytes
}
