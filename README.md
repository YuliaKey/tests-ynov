# Projet Final : Industrialisation & Automatisation "Zero Touch"

## Architecture Globale

Ce projet déploie une stack applicative complète sur AWS de façon entièrement automatisée, sans intervention humaine sur les serveurs.

```text
GitHub Actions
     │
     ├── 1. Build & Push images Docker → Registre Privé (EC2 Registry)
     │
     ├── 2. Terraform → EC2 Applicative (t3.small, eu-west-3)
     │
     └── 3. Ansible → Configuration & Déploiement de la stack
```

### EC2 Registry (existante)

- **Type** : t3.micro — eu-west-3
- **Rôle** : Héberge le registre Docker privé (registry:2 + nginx + UI)
- **Ports exposés** : 80 (HTTP), 443 (HTTPS)
- **Authentification** : htpasswd (basic auth)
- **Certificat** : Auto-signé (SSL)

### EC2 Applicative (provisionnée à chaque déploiement)

- **Type** : t3.small — eu-west-3
- **OS** : Ubuntu 24.04 LTS (récupération dynamique via data source)
- **Stockage** : 20 GB gp3
- **Ports exposés** :
  - `22` — SSH (Ansible uniquement)
  - `3000` — Frontend React (public)
  - `8000` — API Python (public)
- **Clé SSH** : Générée à la volée par Terraform (non stockée dans le repo)

---
<div style="page-break-after: always;"></div>

## Stack Applicative

```text
┌─────────────────────────────────────────┐
│              EC2 Applicative            │
│                                         │
│  ┌───────────┐     ┌─────────────────┐  │
│  │  Frontend │     │   API Python    │  │
│  │  React    │────▶│   FastAPI       │  │
│  │  :3000    │     │   :8000         │  │
│  └───────────┘     └────────┬────────┘  │
│                             │           │
│                    ┌────────▼────────┐  │
│                    │   MySQL 9.6     │  │
│                    │   :3306         │  │
│                    └─────────────────┘  │
└─────────────────────────────────────────┘
```

| Service  | Image                                   | Port                      |
| -------- | --------------------------------------- | ------------------------- |
| Frontend | `<REGISTRY>/tests-ynov-frontend:latest` | 3000                      |
| API      | `<REGISTRY>/tests-ynov-api:latest`      | 8000                      |
| Database | `mysql:9.6`                             | 3306 (interne uniquement) |

---

## Pipeline CI/CD (`deploy.yml`)

Déclenché **manuellement** via `workflow_dispatch` depuis l'onglet Actions de GitHub.

### Job 1 — Build & Push

- Configure Docker pour accepter le registre privé auto-signé
- Build et push des images `tests-ynov-api:latest` et `tests-ynov-frontend:latest`

### Job 2 — Infrastructure Provisioning (Terraform)

- Génère une clé SSH RSA 4096 bits à la volée
- Recherche dynamique de la dernière AMI Ubuntu 24.04 LTS
- Crée le security group, la key pair et l'instance EC2
- Expose en output l'IP publique et la clé privée SSH
- Upload le `terraform.tfstate` et la `key.pem` comme artifacts (rétention 1 jour)

### Job 3 — Configuration & Deployment (Ansible)

- Génère un inventaire dynamique à partir de l'IP Terraform
- Attend que SSH soit disponible sur l'instance
- Exécute le playbook :
  - Installation de Docker et docker-compose-v2
  - Configuration du daemon Docker pour le registre privé (certificat auto-signé)
  - Authentification au registre privé
  - Copie des fichiers SQL d'initialisation
  - Déploiement de la stack via `docker compose up -d`
- Validation : curl sur le frontend (port 3000) et l'API (port 8000)

### Job 4 — Cleanup on Failure

- Se déclenche **uniquement en cas d'échec** des jobs précédents
- Télécharge le tfstate uploadé par le job Terraform
- Exécute `terraform destroy` pour éviter des instances orphelines sur AWS

---

## Prérequis — Secrets GitHub à configurer

Aller dans **Settings → Secrets and variables → Actions** du repo et créer les secrets suivants :

| Secret                  | Description              |
| ----------------------- | ------------------------ |
| `AWS_ACCESS_KEY_ID`     | Clé d'accès AWS          |
| `AWS_SECRET_ACCESS_KEY` | Clé secrète AWS          |
| `REGISTRY_URL`          | URL du registre privé    |
| `REGISTRY_USER`         | Utilisateur du registre  |
| `REGISTRY_PASSWORD`     | Mot de passe du registre |
| `MYSQL_ROOT_PASSWORD`   | Mot de passe root MySQL  |

---

## Structure du Repo

```text
.
├── .github/workflows/
│   ├── build_test_react.yml    # CI : tests, build, publish NPM
│   └── deploy.yml              # CD : déploiement complet zero-touch
├── ansible/
│   ├── playbook.yml            # Configuration du serveur et déploiement
│   └── docker-compose-prod.yml # Template docker-compose de production
├── infra/
│   └── main.tf                 # Infrastructure AWS (Terraform)
├── registry/
│   └── main.tf                 # Infrastructure du registre Docker (Terraform)
├── server/
│   ├── Dockerfile              # Image de l'API Python
│   └── main.py                 # Application FastAPI
├── sqlfiles/                   # Scripts d'initialisation MySQL
├── src/                        # Application React
└── react.Dockerfile            # Image du frontend React
```
