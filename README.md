# S3pweb Base Api

## Création d'une nouvelle API

1. Créer un nouveau dépot Bitbucket vide.
2. Cloner le nouveau projet.
3. Cloner le projet `s3pweb-html5-to-pdf-with-Puppeteer` dans un dossier temporaire.
4. Copier l'intégralité du contenu du projet dans le dossier de la nouvelle API.
5. Changer toutes les instances de `html5-to-pdf-with-Puppeteer` et `base_api` (dans le fichier prom.service.ts) par le nom de la nouvelle
   API.
6. Lancer la commande `npm i && npm run build && npm run test` pour vérifier que tout fonctionne correctement.
7. Installer [detect-secrets](https://github.com/Yelp/detect-secrets?tab=readme-ov-file#installation) (en global sur la
   machine).
8. Une fois qu'il y a du code, on peut configurer
   le [pipeline Bitbucket](https://s3pweb.atlassian.net/wiki/spaces/S3PDEV/pages/2165833770/Int+gration+continue+CI+et+livraison+continue+CD).

## Nouveaux développements

Les branches doivent avoir un prefix en fonction de leur type :

- Les branches de correction de bug doivent être nommées de la manière suivante : `bugfix/*`.
- Les branches de fonctionnalités doivent être nommées de la manière suivante : `feature/*`.

D'autres types de branches peuvent être créées, mais elles doivent respecter la convention de nommage `type/titre`.

Elles doivent être créées à partir de la branche `develop` et être fusionnées dans la branche `develop` à la fin du
développement.

### Gestions des secrets

Le code ne doit pas contenir de secrets (clés API, mots de passe, etc.). Les secrets doivent être stockés dans Vault ou
dans un fichier .env qui ne doit pas être versionné (il est dans le `.gitignore`) un exemple de fichier `.env` (sans les
secrets) peut être trouvé dans le `README.md` du projet.

## Vérification des commits

Avant chaque commit, différentes vérifications sont effectuées automatiquement :

- Build : vérifie que le code compile correctement.
- Lint : vérifie que le code est conforme aux règles de style définies dans le fichier `eslintrc.js`.
- Test : vérifie que les tests unitaires passent correctement.
- Detect secrets : vérifie que le code ne contient pas de secrets (clés API, mots de passe, etc.).
- Commit lint : vérifie que le message de commit est conforme aux préconisations
  de [Conventional Commits](https://www.conventionalcommits.org/).

Si une des vérifications échoue, le commit est refusé.

## Intégration continue

Le projet est configuré pour utiliser Bitbucket Pipelines. Par défaut, le pipeline exécute les commandes suivantes :

- build
- lint
- test:ci

Le dépot doit posséder les branches suivantes pour que l'intégration continue soit fonctionnelle :

- `develop` : branche de principale de projet
- `main` : branche de livraison en production
- `preprod` : branche de livraison en pré-production

Les numéros de version sont gérés automatiquement par le pipeline lors des étapes de livraison en pré-production et en
production.

### Qualité de code

La qualité de code est vérifiée par SonarQube, l'analyse est consultable sur le serveur
de [Sonar](https://sonarcloud.io).

Les développements doivent être testés unitairement et en e2e. Si la couverture de test est inférieure à 50% ou que
Sonar a détecté des erreurs trop nombreuses ou des failles de sécurité potentilles, le pipeline sera en erreur et la
livraison ne pourra pas être effectuée.

## Déploiement

Le déploiement de l'API se fait automatiquement via Bitbucket Pipelines. Les branches `main` et `preprod` sont déployées
sur les environnements de production et de pré-production respectivement grâce aux fichiers docker-compose et après
avoir configuré les différents Portainer (avec les stacks et les fichiers .env).

L'accès à l'api se fait par le reverse-proxy Traefik qui est configuré dans les labels `traefik.*` de chaque
docker-compose. Il ne faut pas oublier de modifier les fichiers `*-TEMPLATE.yml` car ils écrasent les fichiers
correspondants à chaque livraison.

## Suivi du déploiement

### Metrics

Le suivi des metrics se fait via prometheus et grafana. Le fichier `prom.service.ts` contient les fonctions pour
interagir avec les metrics de l'application. Il est possible de rajouter des metrics personnalisées, mais il faut faire
attention à
la [cardinalité des données](https://grafana.com/blog/2022/02/15/what-are-cardinality-spikes-and-why-do-they-matter/)
pour ne pas surcharger le serveur Prometheus. Plus d'informations sur la [documentation](https://prometheus.io/docs/).
Un dashboard est à créer pour suivre les metrics de l'application sur [Grafana](https://grafana.s3pweb.io).

### Logs

Les logs de l'application sont envoyés à Elasticsearch et sont consultables via Kibana. Les logs sont envoyés via la lib
[@s3pweb/s3pweb-logger](https://github.com/s3pweb/s3pweb-logger), la configuration est modifiable dans le
fichier `config.utils.ts`. Le fichier `app.controller.ts` contient un exemple d'injection et d'utilisation du logger.

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
APP_NAME=html5-to-pdf-with-Puppeteer-REPO
TEST_MODE=false
COMPRESSION=true
SWAGGER=false
```

### Mongoose

La lib mongoose est utilisée pour la connexion à la base de données MongoDB, la gestion des modèles de données et la
manipulation des données. La [documentation MongoDB](https://docs.nestjs.com/techniques/mongodb) contient les bonnes
pratiques et les techniques pour utiliser mongoose avec NestJS.

Pour les tests unitaires, le fichier `mockMongooseModel.ts` permet de mocker les intéractions avec la BDD.
Le fichier `entities.service.spec.ts` contient un exemple d'utilisation.
Pour les tests e2e, il est préférable d'utiliser une base locale pour ne pas impacter les données réelles.
