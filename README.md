# Gestion des rendez-vous du DG - FDCUIC

Application web de gestion des rendez-vous du Directeur Général pour le **Fonds de Développement des Cultures Urbaines et des Industries Créatives**.

## 🚀 Démarrage rapide

```bash
# Installation des dépendances
npm install

# Lancement du serveur de développement
npm run dev
```

L'application sera accessible sur: **http://localhost:3001**

## 📋 Fonctionnalités

### Page Secrétaire (`/secretaire`)
- ✅ Gestion complète des rendez-vous (Créer, Modifier, Supprimer)
- ✅ Tableau avec 25 lignes (vides ou avec données)
- ✅ Export PDF (format A4 paysage)
- ✅ Export Excel (.xlsx)
- ✅ Statistiques en temps réel
- ✅ Formulaire de saisie complet avec validation

### Tableau de bord Directeur (`/directeur`)
- ✅ Vue d'ensemble avec statistiques
- ✅ Synchronisation automatique en temps réel
- ✅ Filtres: Tous | Aujourd'hui | À venir | Passés
- ✅ Tri automatique par date et heure

## 🎨 Champs du formulaire

- **Date** (obligatoire)
- **Heure** (obligatoire)
- **Interlocuteur** (obligatoire)
- **Motif / Objet du rendez-vous** (obligatoire)
- **Lieu** (obligatoire)
- **Statut**: Confirmé | En attente | Annulé | Reporté
- **Commentaires / Préparation** (optionnel)

## 🛠️ Technologies

- **Next.js 14** - Framework React
- **TypeScript** - Typage statique
- **TailwindCSS** - Framework CSS
- **jsPDF** - Export PDF
- **xlsx** - Export Excel
- **date-fns** - Manipulation de dates
- **Lucide React** - Icônes

## 📦 Structure du projet

```
├── app/
│   ├── secretaire/      # Page de gestion des rendez-vous
│   └── directeur/       # Tableau de bord du DG
├── components/          # Composants React réutilisables
├── lib/                # Logique métier et exports
├── types/              # Types TypeScript
└── public/             # Assets statiques (logo)
```

## 🔄 Synchronisation

Les données sont stockées dans le `localStorage` du navigateur et synchronisées automatiquement entre les pages secrétaire et directeur en temps réel.

> **Note**: Pour une solution multi-utilisateurs en production, il faudrait migrer vers une base de données backend (Parse, Supabase, Firebase, etc.).

## 🖨️ Exports

### PDF
- Format A4 paysage
- Logo FDCUIC et titres officiels
- Tableau formaté avec toutes les colonnes
- Nom: `Rendez-vous_DG_YYYY-MM-DD.pdf`

### Excel
- Format .xlsx
- En-tête FDCUIC
- Toutes les colonnes exportées
- Nom: `Rendez-vous_DG_YYYY-MM-DD.xlsx`

## 📱 Responsive

L'application est entièrement responsive et fonctionne sur:
- 🖥️ Desktop
- 📱 Tablette
- 📱 Mobile

## 🎯 Utilisation

### Pour la secrétaire

1. **Ajouter un rendez-vous**: Cliquer sur "Ajouter un rendez-vous"
2. **Modifier**: Cliquer sur l'icône crayon ✏️
3. **Supprimer**: Cliquer sur l'icône corbeille 🗑️
4. **Exporter PDF**: Cliquer sur "Exporter PDF"
5. **Exporter Excel**: Cliquer sur "Exporter Excel"

### Pour le Directeur

1. Accéder au "Tableau de bord DG"
2. Utiliser les filtres pour affiner la vue
3. Cliquer sur "Actualiser" pour recharger les données

## 📄 License

© 2025 FDCUIC - Tous droits réservés

---

**Développé pour le Fonds de Développement des Cultures Urbaines et des Industries Créatives**
