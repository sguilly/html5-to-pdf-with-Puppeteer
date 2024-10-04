import { Constants } from './constants.utils';

export class Utils {
  public static isDevMode(): boolean {
    return Constants.configName === 'html5-to-pdf-with-Puppeteer-DEV';
  }

  public static isNullOrEmpty(value: unknown): boolean {
    return value == null || value === '';
  }

  public static getErrorMessage(err: unknown): string {
    return err instanceof Error ? err?.message : JSON.stringify(err);
  }
}
