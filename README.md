## Introduction :
Ce repo a pour but de tester vos connaissances et compétences dans un environnement Laravel/NextJS. Nous vous fournissons une base de travail avec une séparation entre interface admin et interface public, ainsi que les logique de connexion, gestion de rôle et de permission. Un seed prêt à l'emploi vous permettra de mettre en place votre base de données.

## Prérequis : 
- Node 23.6.0
- PHP 8.4
- MySQL
- Intégrer les mots de passe ADMIN_PASSWORD et CATALOG_PASSWORD dans le .env de backend

## Initialisation du projet : 
- Dans le dossier backend, exécutez les commandes suivantes : ```composer install && php artisan migrate --seed && php artisan cache:clear && php artisan serve```
- Dans le dossier frontend, exécutez les commandes suivantes : ```npm install && npm run dev```

## À Faire :
- Créer une interface pour la création de produits côté admin
- Donner l'accès au catalogue pour le modifier
- Ne donner la possibilité de changer le prix qu'aux administrateurs d'après les permissions
- Donner la possibilité de modifier un produit au personne ayant le role Catalogue et Administrateur
- Créer un listing de produit avec pagination côté FrontOffice
- Créer un panier fonctionnel et optimisé
- Créer une documentation claire du travail rendu, avec spécifications techniques et explications des composants etc...

Créé le 19/09/2025 par Hugo
Mis à jour le 19/09/2025 par Tanguy

# backend
- Produits avec nom, sous-titre, description, format de base et prix de base.
- Plusieurs images par produit avec prise en charge des images par défaut.
- Gestion des stocks avec niveaux de stock.
-  Variantes de produits pour différents formats et quantités avec tarification dynamique.
-  Marques avec numéros de référence.
-  Fournisseurs liés aux marques.
-  Opérations CRUD complètes avec gestion des images.
-  Surveillance des niveaux de stock avec indicateurs d'état.