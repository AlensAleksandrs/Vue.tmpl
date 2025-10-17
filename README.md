# Vue Template (Vite + Tailwind + Playwright + Docker + K8s)

[![license: LGPL v3.0 or later](https://img.shields.io/badge/License-LGPL%20v3.0%2B-blue.svg)](https://www.gnu.org/licenses/lgpl-3.0.html)
[![version](https://img.shields.io/github/package-json/v/AlensAleksandrs/Vue.tmpl?filename=package.json)](https://github.com/AlensAleksandrs/ForumsKubs/blob/main/package.json)

A modern starter template for Vue 3 applications built with Vite.  
It comes with TailwindCSS, Vitest, Playwright, GitHub Actions CI/CD, Dockerfile, and Kubernetes deployment manifests out of the box.

---

### Table of contents

- [Installation](#installation)
  - [Prerequisites](#prerequisites)
  - [Development](#development)
  - [Testing](#testing)
  - [Deployment](#deployment)
- [Features](#features)
- [License](#license)
- [Links](#links)

---

## Installation

<h3 id="prerequisites"> 🔧 Prerequisites </h3>

> Jump to [Development stage](#development)

- [Node.js](https://nodejs.org/en/download) (v20.x recommended)
- [Vite](https://vitejs.dev/guide/)
- [Docker](https://docs.docker.com/get-docker/)
- [Kubernetes CLI](https://kubernetes.io/docs/tasks/tools/)

**Repository settings**

To run the GitHub Actions workflows (build/push + Kubernetes deploy via OIDC), configure these in Settings → Secrets and variables → Actions.

##### Secrets
- `DOCKER_USERNAME`  
  Your Docker Hub username.
- `DOCKER_TOKEN`  
  A Docker Hub [access token](https://hub.docker.com/settings/security) with permission to push images.
- `K8S_API_SERVER`
  Kubernetes API server URL (e.g. `https://<ip-or-dns>:6443`).
- `K8S_CA_CERT`
  PEM-encoded cluster CA certificate (multi-line). Example to extract:
```bash
kubectl config view --minify --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}' \
  | base64 -d > ca.crt
```
Add the file contents as the secret value.

##### Variables
- `PROJECT_NAME`  
  The name of your Docker Hub repository (example: `vue-tmpl`).

> ⚠ Repository name must be lowercase (Docker Hub enforced policy)!

#### Required workflow permissions
In the deploy job:

```bash
permissions:
  id-token: write
  contents: read
```

#### OIDC audience used by the workflow
OIDC audience used by the workflow

```bash
https://github.com/${{ github.repository_owner }}
```
Make sure your cluster accepts this audience (see the Kubernetes section below).

#### Kubernetes cluster configuration

1. **Make sure your cluster accepts this audience (see the Kubernetes section below).**

    *If using Terraform: Add to your Terraform module (authentication_config):
    ```bash
    authentication_config = <<-EOT
    apiVersion: apiserver.config.k8s.io/v1beta1
    kind: AuthenticationConfiguration
    jwt:
    - issuer:
        url: "https://token.actions.githubusercontent.com"
        audiences:
        - "https://github.com/Username"   # must match the workflow audience
      claimMappings:
        username:
          claim: sub
          prefix: "gh:"
        groups:
          claim: repository_owner
          prefix: "gh:"
      claimValidationRules:
      - claim: repository
        requiredValue: "Username/Project" # update
      - claim: ref
        requiredValue: "refs/heads/main"
    EOT
    ```
    Apply:
    ```bash
    terraform plan # Review
    terraform apply -auto-approve
    ```
2. **Namespace**
    
    All app resources live in `app-deploy`. Ensure it exists:
    ```bash
    kubectl create namespace app-deploy --dry-run=client -o yaml | kubectl apply -f -
    ```
   > You must assure that all resources live in this namespace!
   
3. **RBAC (least privilege: update Deployments only in `app-deploy`)**

    Create Role + RoleBinding (bind to the exact OIDC user for `main`):
    ```bash
    kubectl -n app-deploy apply -f - <<'YAML'
    apiVersion: rbac.authorization.k8s.io/v1
    kind: Role
    metadata:
      name: deployments-update-only
    rules:
    - apiGroups: ["apps"]
      resources: ["deployments"]
      verbs: ["get","list","watch","patch","update"]
    ---
    apiVersion: rbac.authorization.k8s.io/v1
    kind: RoleBinding
    metadata:
      name: gh-user-can-update-deployments
    subjects:
    - kind: User
      name: "gh:repo:Username/Project:ref:refs/heads/main" # Update
      apiGroup: rbac.authorization.k8s.io
    roleRef:
      kind: Role
      name: deployments-update-only
      apiGroup: rbac.authorization.k8s.io
    YAML
    ```
   (Optional) If you prefer granting to the whole owner group, bind Group: gh:Username instead — but only if your tokens include that group.
4. **Extracting API URL & CA**
    ```bash
    K8S_API_SERVER=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')
    echo "$K8S_API_SERVER"
    kubectl config view --minify --raw -o jsonpath='{.clusters[0].cluster.certificate-authority-data}' | base64 -d > ca.crt
    ```

<h3 id="development"> 🛠️ Development stage </h3>

> Jump to [Testing stage](#testing)

#### 1. Install dependencies

```bash
npm install
```

#### 2. Start the development script

```bash
npm run dev
```

This will:

- Watch your `src/` directory for changes
- Host a local development server at `http://localhost:5173`

#### 3. Build for production

```bash
npm run build
```

#### 3. Linting and formatting

The repository comes with pre-configured tools (triggered automatically upon commit via Husky hooks):

- `ESLint` - enforces JavaScript/TypeScript + Vue conventions
- `OXLint` - ultra-fast JavaScript/TypeScript linter
- `Prettier` - formats JSON, JS, TS, MD, and Vue files
- `Stylelint` - enforces CSS/Tailwind conventions

You can also run them manually:

```bash
npx oxlint "src/**/*.{js,ts,vue}"
npx eslint "src/**/*.{js,ts,vue}"
npx prettier --write .
npx stylelint "src/**/*.{css,vue}"
```

<h3 id="testing"> 🧪 Testing </h3>

> Jump to [Deployment stage](#deployment)

This template ships with Vitest (unit tests) and Playwright (E2E tests).

- Run unit tests with:
```bash
npm run test:unit
```
- Run end-to-end tests with:
```bash
npm run test:e2e
```

GitHub Actions workflow runs linting, unit tests, e2e tests, and Docker builds automatically on push.

<h3 id="deployment"> 🚀 Deployment </h3>

> Jump back to [Prerequisites](#prerequisites)

**Docker**
Build and run the Docker image:
```bash
docker build -t (name_of_project) .
docker run -p 8080:80 (name_of_project)
```

**Kubernetes**
A sample `deployment.yaml` is included:
```bash
kubectl apply -f k8s/deployment.yaml
```
Pair with a `Service` for production.

#### ✅ Done!

## Features

- Vue 3 + Vite + TailwindCSS
- Preconfigured unit + e2e testing
- GitHub Actions CI/CD with lint, test, Docker build
- Dockerfile with multi-stage build (Node → Nginx)
- Kubernetes manifests for deployment

## License

This template is licensed under the terms of the GPL-3 Open Source license and is available for free. 
Learn more in the license file found within the repository!

## Links

- [Vite Documentation](https://vitejs.dev/guide/)
- [VueJS Documentation](https://vuejs.org/)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Vitest](https://vitest.dev/)
- [Playwright](https://playwright.dev/)

---

Developed by [Alens Aleksandrs Čerņa](https://www.alens.lv)