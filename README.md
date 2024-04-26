# S3pweb Base Api

## Création d'une nouvelle API

1. Créer un nouveau dépot Bitbucket vide.
2. Cloner le nouveau projet.
3. Cloner le projet `s3pweb-base-api` dans un dossier temporaire.
4. Copier l'intégralité du contenu du projet dans le dossier de la nouvelle API.
5. Changer toutes les instances de `base-api` et `base_api` (dans le fichier prom.service.ts) par le nom de la nouvelle
   API.
6. Lancer la commande `npm i && npm run build && npm run test` pour vérifier que tout fonctionne correctement.

## NestJS Common

La lib `@s3pweb/nestjs-common` contient de nombreux utilitaires pour les services NestJS.
Pour plus d'information, voir la [documentation](https://bitbucket.org/s3pweb/s3pweb-nestjs-common/src/main/) de la
librairie.
