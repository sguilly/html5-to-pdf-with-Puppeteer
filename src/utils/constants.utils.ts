import { correlationId } from '@s3pweb/nestjs-common';

export class Constants {
  static readonly correlationIdHeaderObj = {
    name: correlationId,
    required: false,
    description: 'Do not use',
  };

  public static convertConfigToBoolean(value: any): boolean {
    return value === true || value === 'true';
  }

  public static convertConfigToNumber(value: any, defaultValue = 0): number {
    return Number(value) || defaultValue;
  }

  static readonly resourceDb = 'resources';
  static readonly configurationDb = 'configuration';

  public static sleep(seconds: number) {
    return new Promise((resolve) => {
      setTimeout(resolve, seconds * 1000);
    });
  }

  public static isNullOrEmpty(value: any): boolean {
    return value == null || value === '';
  }
}
