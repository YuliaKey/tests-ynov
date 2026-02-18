# Plan de Test - Stratégie UT vs IT

## Vue d'ensemble

Ce document décrit la stratégie de test pour l'application de formulaire d'inscription. Les tests sont divisés en deux catégories principales : les **Tests Unitaires (UT)** et les **Tests d'Intégration (IT)**.

### Résumé des métriques de couverture

- **Coverage global : 100%**
  - Statements: 100%
  - Branches: 100%
  - Functions: 100%
  - Lines: 100%

---

## 1. Tests Unitaires (UT)

Les tests unitaires valident des **fonctions isolées** avec des entrées/sorties précises, sans dépendances externes (pas de DOM, pas de React).

### 1.1 `module.test.js` - Fonction `calculateAge`

**Objectif**: Valider le calcul d'âge à partir d'une date de naissance.

| Scénario                 | Description                                                | Nombre de tests |
| ------------------------ | ---------------------------------------------------------- | --------------- |
| **Calculs valides**      | Calcul correct de l'âge pour différentes dates             | 2 tests         |
| **Validations d'entrée** | Paramètre manquant, types invalides (string, number, null) | 6 tests         |
| **Propriété birthDate**  | Objet sans birthDate, birthDate de type incorrect          | 2 tests         |
| **Dates invalides**      | Date invalide (Invalid Date), date future                  | 2 tests         |
| **Edge cases**           | Calcul indépendant de l'année actuelle                     | 1 test          |

**Total: 13 tests**

---

### 1.2 `validator.test.js` - Fonctions de validation

#### 1.2.1 `validateAge`

**Objectif**: Valider qu'une personne a au moins 18 ans.

| Scénario                  | Description                                   | Nombre de tests |
| ------------------------- | --------------------------------------------- | --------------- |
| **Majeurs valides**       | 18 ans exactement, 25 ans, 34 ans             | 3 tests         |
| **Mineurs invalides**     | 17, 10, 5, 0 ans (paramétrisé avec `it.each`) | 1 test (4 cas)  |
| **Propagation d'erreurs** | Erreurs de `calculateAge` (INVALID_PARAMETER) | 1 test          |

**Total: 5 tests** (couvrant 8 cas avec paramétrage)

---

#### 1.2.2 `validatePostalCode`

**Objectif**: Valider les codes postaux français (5 chiffres).

| Scénario                 | Description                                                      | Nombre de tests |
| ------------------------ | ---------------------------------------------------------------- | --------------- |
| **Codes valides**        | 75001, 01000, 00001, codes avec espaces trimés                   | 4 tests         |
| **Formats invalides**    | Trop court (123, 1234), trop long (123456), avec lettres (A1234) | 4+ tests        |
| **Protection XSS**       | Balises HTML `<script>`, protocole `javascript:`                 | 2 tests         |
| **Validations d'entrée** | Vide, undefined, null, types non-string, espaces uniquement      | 6 tests         |

**Total: ~16 tests**

---

#### 1.2.3 `validateName`

**Objectif**: Valider les noms (prénom/nom) avec accents, tirets, espaces.

| Scénario                 | Description                                                        | Nombre de tests |
| ------------------------ | ------------------------------------------------------------------ | --------------- |
| **Noms valides**         | Noms simples, avec accents (é, è, ç), tirets, espaces, apostrophes | 6+ tests        |
| **Noms invalides**       | Avec chiffres (Jean123), caractères spéciaux (@, #)                | 3+ tests        |
| **Protection XSS**       | Balises HTML, protocole `javascript:`                              | 2 tests         |
| **Validations d'entrée** | Vide, undefined, null, types non-string                            | 4 tests         |

**Total: ~15 tests**

---

#### 1.2.4 `validateEmail`

**Objectif**: Valider les adresses email selon les standards RFC.

| Scénario                 | Description                                                                                                 | Nombre de tests |
| ------------------------ | ----------------------------------------------------------------------------------------------------------- | --------------- |
| **Emails valides**       | Formats standards (user@example.com), avec sous-domaines, chiffres, caractères spéciaux autorisés (+, -, .) | 5+ tests        |
| **Emails invalides**     | Sans @, sans domaine, domaines invalides, espaces                                                           | 4+ tests        |
| **Protection XSS**       | Tentatives d'injection dans l'email                                                                         | 1 test          |
| **Validations d'entrée** | Vide, undefined, null, types non-string, trim automatique                                                   | 5 tests         |
| **Edge cases**           | Emails très longs (254 caractères max)                                                                      | 1 test          |

**Total: ~16 tests**

---

#### 1.2.5 `validateCity`

**Objectif**: Valider les noms de ville français (lettres, accents, tirets, espaces).

| Scénario                 | Description                                                           | Nombre de tests |
| ------------------------ | --------------------------------------------------------------------- | --------------- |
| **Villes valides**       | Paris, Saint-Denis, La Rochelle, Aix-en-Provence, avec accents (Séné) | 5 tests         |
| **Villes invalides**     | Avec chiffres (Paris75, 75001), caractères spéciaux (@, \_)           | 4 tests         |
| **Protection XSS**       | Balises `<script>`, `<img>`, protocole `javascript:`                  | 3 tests         |
| **Validations d'entrée** | Vide, undefined, null, types non-string, espaces uniquement           | 5 tests         |
| **Trimming**             | Espaces avant/après                                                   | 1 test          |

**Total: 22 tests**

---

**Total Tests Unitaires: 87 tests**

---

## 2. Tests d'Intégration (IT)

Les tests d'intégration valident le **comportement complet du formulaire** avec interactions utilisateur réelles (saisie, blur, submit), validation du DOM React, et effets de bord (localStorage, toaster).

### 2.1 `RegistrationForm.test.js` - Formulaire complet

#### 2.1.1 Tests de rendu et état initial

| Scénario                    | Description                                                                               |
| --------------------------- | ----------------------------------------------------------------------------------------- |
| **Rendu des champs**        | Vérifier que tous les champs sont présents (prénom, nom, email, date, code postal, ville) |
| **Bouton submit désactivé** | Le bouton est gris (disabled) au chargement initial                                       |

**Total: 2 tests**

---

#### 2.1.2 Tests de validation en temps réel

| Scénario                        | Description                                                          |
| ------------------------------- | -------------------------------------------------------------------- |
| **Erreur prénom invalide**      | Saisir un prénom avec chiffres (John123), vérifier message d'erreur  |
| **Erreur email invalide**       | Saisir un email incorrect, vérifier message d'erreur                 |
| **Erreur code postal invalide** | Saisir un code court (123), vérifier message d'erreur                |
| **Erreur âge < 18 ans**         | Saisir une date de naissance récente, vérifier message d'erreur      |
| **Erreur nom invalide**         | Saisir un nom avec chiffres, vérifier message d'erreur               |
| **Erreur ville invalide**       | Saisir une ville avec chiffres (Paris123), vérifier message d'erreur |
| **Erreur birthDate vide**       | Champ birthDate sans valeur après blur, vérifier message "required"  |

**Total: 7 tests**

---

#### 2.1.3 Tests d'interaction utilisateur chaotique

| Scénario                  | Description                                                                                                                                             |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Utilisateur chaotique** | Saisies multiples invalides → corrections → nouvelles erreurs → corrections finales. Simule un utilisateur réel qui se trompe et corrige plusieurs fois |
| **Validation onChange**   | Après avoir touché un champ (blur), les validations se déclenchent en temps réel sur onChange (pas besoin de re-blur)                                   |

**Total: 2 tests**

---

#### 2.1.4 Tests de soumission valide

| Scénario                              | Description                                                                                         |
| ------------------------------------- | --------------------------------------------------------------------------------------------------- |
| **Activation du bouton submit**       | Remplir tous les champs correctement → bouton devient actif (non disabled)                          |
| **Sauvegarde localStorage + toaster** | Soumettre un formulaire valide → données sauvegardées dans localStorage + toaster de succès affiché |
| **Reset du formulaire**               | Après soumission → tous les champs vidés, bouton redevient disabled                                 |
| **Masquage du toaster**               | Vérifier que le toaster disparaît après 3 secondes (utilise `jest.useFakeTimers()`)                 |

**Total: 4 tests**

---

#### 2.1.5 Tests de soumission invalide

| Scénario                 | Description                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------- |
| **Formulaire incomplet** | Remplir seulement un champ → bouton reste disabled, rien n'est sauvegardé, toaster n'apparaît pas |

**Total: 1 test**

---

#### 2.1.6 Tests de sécurité XSS

| Scénario           | Description                                                                                |
| ------------------ | ------------------------------------------------------------------------------------------ |
| **Protection XSS** | Saisir `<script>alert("xss")</script>` dans le champ prénom → message d'erreur XSS affiché |

**Total: 1 test**

---

#### 2.1.7 Tests de l'état du bouton submit

| Scénario                           | Description                                                                                        |
| ---------------------------------- | -------------------------------------------------------------------------------------------------- |
| **Bouton reste gris avec erreurs** | Remplir le formulaire avec une erreur → bouton reste disabled même si tous les champs sont remplis |

**Total: 1 test**

---

**Total Tests d'Intégration (RegistrationForm): 18 tests**

---

### 2.2 `App.test.js` - Composant principal

| Scénario                      | Description                                                    |
| ----------------------------- | -------------------------------------------------------------- |
| **Rendu du RegistrationForm** | Vérifier que le composant App affiche bien le RegistrationForm |

**Total: 1 test**

---

**Total Tests d'Intégration: 19 tests**
