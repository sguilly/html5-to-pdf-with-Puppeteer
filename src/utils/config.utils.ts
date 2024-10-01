import config from 'config';

export class ConfigUtils {
  public static async getConfig() {
    // Not so much important here but draw the structure for a potential Vault integration
    return {
      logger: {
        name: config.get('name'),
        logger: config.get('logger'),
      },
      maxConcurrency: config.get<number>('maxConcurrency'),
    };
  }
}
