import Vault from 'hashi-vault-js';
import * as process from 'process';
import { Constants } from './constants.utils';

export class ConfigUtils {
  public static async getConfig(): Promise<any> {
    const vault = new Vault({
      https: true,
      baseUrl: process.env.VAULT_BASE_URL,
      rootPath: '',
      timeout: 60000,
    });

    const vaultEnv = process.env.VAULT_ENV;

    const token = await vault.loginWithAppRole(
      process.env.VAULT_ROLE ?? '',
      process.env.VAULT_SECRET ?? '',
    );

    if (ConfigUtils.isErrorResponse(token)) {
      throw new Error('Fail to login to Vault.');
    }

    const mongoSecrets = await vault.readKVSecret(
      token.client_token,
      `${vaultEnv}/mongo`,
      undefined,
      'kv',
    );
    const apiSecrets = await vault.readKVSecret(
      token.client_token,
      `${vaultEnv}/base-api`,
      undefined,
      'kv',
    );

    if (
      ConfigUtils.isErrorResponse(mongoSecrets) ||
      ConfigUtils.isErrorResponse(apiSecrets)
    ) {
      throw new Error('Fail to get some secrets.');
    }

    let loggerConfig: any = apiSecrets.data.logger;

    // ! Custom logger config
    if (Constants.convertConfigToBoolean(process.env.OVERRIDE_LOGGER)) {
      loggerConfig = {
        source: false,
        console: {
          enable: true,
          level: 'trace',
        },
      };
    }

    return {
      mongo: {
        resourcesUri: `${mongoSecrets.data.uri}resources${mongoSecrets.data.params}`,
        configurationUri: `${mongoSecrets.data.uri}configuration${mongoSecrets.data.params}`,
      },
      logger: {
        name: process.env.APP_NAME || 's3pweb-base-api-DEFAULT',
        logger: loggerConfig,
      },
    };
  }

  public static isErrorResponse(
    error:
      | Vault.LoginWithAppRoleResponse
      | Vault.ReadKVSecretResponse
      | Vault.ErrorResponse,
  ): error is Vault.ErrorResponse {
    return Object.hasOwnProperty.call(error, 'isVaultError');
  }
}
