# ICONIQUE.

> T'as la ref ?

Prototype jouable du jeu de cartes ICONIQUE : 100 références culturelles, 3 indices progressifs, un téléphone qui tourne.

## Lancer

```bash
cd iconique
npm install
npm run dev        # http://localhost:5173 (et l'URL « Network » pour tester sur téléphone, même Wi-Fi)
```

Production :

```bash
npm run build      # vérifie TypeScript + génère dist/
npm run preview    # sert dist/ en local
```

## Modifier les cartes

Tout le contenu est dans **`src/data/cards.ts`** (ref, indice1, indice2, indice3, source, annee).
Gardez des `id` uniques : les statistiques y sont rattachées.

Les modifications faites depuis **`/admin`** restent sur l'appareil (localStorage). Le bouton **Exporter** de `/admin` télécharge toutes les cartes (JSON) pour les reporter dans `cards.ts`.

## Admin / test

- `/admin` (ou `#admin`) : rechercher, modifier, désactiver, ajouter des cartes.
- Onglet **Performance des refs** : jouée, trouvée, taux, indice moyen, répartition par indice, jamais trouvée. Export CSV.

## Déployer

- **Netlify** : base directory `iconique`, build `npm run build`, publish `dist` (déjà dans `netlify.toml`).
- **Vercel** : root directory `iconique`, framework Vite (réécriture `/admin` dans `vercel.json`).

## Structure

```
src/
  components/   boutons, logo, formes graphiques, panneaux, barre de jeu
  context/      GameContext (joueurs, deck, tour, score, historique, persistance)
  data/         cards.ts — les 100 cartes
  screens/      accueil, règles, création, tour, jeu, passage, fin, admin/
  types/        types TypeScript
  utils/        stockage, mélange, cartes, statistiques
```
