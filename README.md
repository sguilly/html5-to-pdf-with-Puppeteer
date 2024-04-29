# S3pweb Base Api

## Création d'une nouvelle API

1. Créer un nouveau dépot Bitbucket vide.
2. Cloner le nouveau projet.
3. Cloner le projet `s3pweb-base-api` dans un dossier temporaire.
4. Copier l'intégralité du contenu du projet dans le dossier de la nouvelle API.
5. Changer toutes les instances de `base-api` et `base_api` (dans le fichier prom.service.ts) par le nom de la nouvelle
   API.
6. Lancer la commande `npm i && npm run build && npm run test` pour vérifier que tout fonctionne correctement.

## Intégration continue

Le projet est configuré pour utiliser Bitbucket Pipelines. Par défaut, le pipeline exécute les commandes suivantes :

- build
- lint
- test:ci

Le dépot doit posséder les branches suivantes :

- `develop` : branche de principale de projet
- `main` : branche de livraison en production
- `preprod` : branche de livraison en pré-production

Les branches de fonctionnalités doivent être nommées de la manière suivante : `feature/*`.
Elles doivent être créées à partir de la branche `develop` et fusionnées dans la branche `develop` à la fin du
développement.

## Déploiement

Le déploiement de l'API se fait automatiquement via Bitbucket Pipelines. Les branches `main` et `preprod` sont déployées
sur les environnements de production et de pré-production respectivement grâce aux fichiers docker-compose et après
avoir configuré les différents Portainer (avec les stacks et les fichiers .env).

L'accès à l'api se fait par le reverse-proxy Traefik qui est configuré dans les labels `traefik.*` de chaque
docker-compose. Il ne faut pas oublier de modifier les fichiers `*-TEMPLATE.yml` car ils écrasent les fichiers
correspondants à chaque livraison.

## Librairies utilisées

### NestJS Common

La lib `@s3pweb/nestjs-common` contient de nombreux utilitaires pour les services NestJS.
Pour plus d'information, voir la [documentation](https://bitbucket.org/s3pweb/s3pweb-nestjs-common/src/main/) de la
librairie.

### NestJS Config et Vault

La configuration de l'api est gérée par la lib `@nestjs/config`. La configuration est chargée depuis un fichier `.env`
et par Vault (grâce au fichier `./utils/config.utils.ts`). Pour se connecter à Vault, il faudra créer un rôle et un
secret pour la nouvelle api.

Exemple de fichier `.env` :

```properties
# Required
VAULT_ENV=test
VAULT_BASE_URL=https://vault-2.s3pweb.io/v1
VAULT_ROLE=
VAULT_SECRET=
# Optional
OVERRIDE_LOGGER=true
APP_NAME=base-api-REPO
TEST_MODE=false
```
