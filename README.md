# CRM SAP CAP

A full-stack SAP Cloud Application Programming Model (CAP) solution for customer relationship management and sales order processing. Two SAP Fiori elements applications share a single HANA data model, secured with XSUAA role-based access, and deployed to SAP BTP Cloud Foundry via MTA.

## Overview

This project demonstrates end-to-end SAP development practices:

- **Domain model** — shared CDS schema with compositions, associations, and code lists
- **Service layer** — two OData services with `@restrict` rules and TypeScript event handlers
- **UI layer** — Fiori elements List Report / Object Page apps with draft support
- **Security** — XSUAA scopes, role templates, and role collections
- **Quality** — ESLint, Jest integration tests, GitHub Actions CI/CD
- **Operations** — MTA-based deployment to Cloud Foundry with HANA HDI and Approuter

### Key capabilities

**CRM (`AdminService`)**

- Customer master data with status criticality and category grouping
- Interaction history, notes, feedback, preferences, and loyalty programs
- Automatic recalculation of `averageRating` and customer status after feedback changes
- Custom actions: `updateCustomerStatus`, `calculateAverageRating`

**Sales Orders (`SalesOrderService`)**

- Draft-enabled order management with line items and mechanical parts
- Status changes via UI or `Orders_changeStatus` action
- Automatic CRM interaction logging when orders are created, updated, or items are added

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js 22, SAP CAP |
| Language | TypeScript (handlers), CDS |
| Database | SAP HANA Cloud (production), SQLite (tests) |
| UI | SAP Fiori elements, UI5 |
| Auth | SAP XSUAA |
| Deploy | Cloud Foundry MTA (`mbt`), Approuter |
| CI/CD | GitHub Actions |

## Architecture

```
┌─────────────────┐     ┌─────────────────┐
│  projectcrm     │     │ project_orders  │
│  (Fiori UI)     │     │  (Fiori UI)     │
└────────┬────────┘     └────────┬────────┘
         │                       │
         └───────────┬───────────┘
                     │ Approuter (xsuaa)
                     ▼
         ┌───────────────────────┐
         │   CAP Node.js Server  │
         │  AdminService /admin  │
         │  SalesOrderService    │
         │       /orders         │
         └───────────┬───────────┘
                     │
                     ▼
         ┌───────────────────────┐
         │   HANA HDI Container  │
         │     db/schema.cds     │
         └───────────────────────┘
```

Both services read and write the same physical database. Orders reference customers through an association; order lifecycle events are mirrored into CRM `Interaction` records by `srv/handlers/order-handler.ts`.

## Live application

After deployment, assign a role collection in BTP (see [Authorization](#authorization)).

| App | URL |
|-----|-----|
| CRM | https://f0a4dd9etrial-dev-crm-sap-dev-app.cfapps.us10-001.hana.ondemand.com/projectcrm/index.html |
| Orders | https://f0a4dd9etrial-dev-crm-sap-dev-app.cfapps.us10-001.hana.ondemand.com/project_orders/index.html |

## Project structure

```
db/schema.cds              Shared domain model (Customer, Orders, Parts, …)
srv/
  admin-service.cds        CRM OData service
  order-service.cds        Sales order OData service
  handlers/                TypeScript event handlers (compiled to dist/)
app/
  projectcrm/              CRM Fiori application
  project_orders/          Orders Fiori application
  xs-app.json              Approuter routes and auth
test/                      Backend tests (Jest + @cap-js/cds-test)
mta.yaml                   Multi-target application descriptor
xs-security.json           XSUAA scopes, roles, role collections
.github/workflows/         CI and CD pipelines
```

## Prerequisites

- [VS Code](https://code.visualstudio.com/) with Dev Containers extension
- Docker (for the dev container)
- SAP BTP trial subaccount with Cloud Foundry and HANA Cloud (for hybrid/production)
- Cloud Foundry CLI (`cf`) for manual deployment

## Getting started

### 1. Open the dev container

1. Clone the repository and open it in VS Code.
2. Run **Dev Containers: Reopen in Container** (`.devcontainer/` includes SAP CDS, ESLint, and related extensions).
3. Install dependencies:

```bash
npm install
```

### 2. Run locally

```bash
cds watch
```

Open http://localhost:4004 in your browser.

To run without JWT validation (mock authentication):

```bash
CDS_REQUIRES_AUTH_KIND=mocked cds watch --profile hybrid
```

To connect to HANA in BTP (hybrid mode):

```bash
cds watch --profile hybrid
```

Open a specific UI directly:

```bash
npm run watch-projectcrm
npm run watch-project_orders
```

Compile TypeScript handlers before production build:

```bash
npm run build
```

### 3. Deploy schema to HANA (optional)

```bash
cds deploy --to hana
cds deploy --to hana --drop-schema   # reset schema — use with caution
```

## Testing and code quality

Backend tests run against an in-memory SQLite database with mocked authentication. No Cloud Foundry or HANA connection is required.

```bash
npm test
npm test -- --coverage
npm test -- test/order-service.test.js   # run a single file

npm run lint
npm run lint:fix
```

| Test file | Coverage |
|-----------|----------|
| `test/admin-service.test.js` | AdminService authorization and CRUD |
| `test/customer-handler.test.js` | Customer metrics, feedback validation |
| `test/order-service.test.js` | Orders, draft activation, interaction logging |
| `test/sales-service.test.js` | Sales role restrictions |
| `test/support-service.test.js` | Support read-only access |

## Authorization

Roles are defined in `xs-security.json` and enforced with `@requires` and `@restrict` annotations on services and entities.

| Role template | Scope | Typical access |
|---------------|-------|----------------|
| **CRM-Admin** | `CRM-Admin` | Full CRM and order management |
| **CRM-Sales** | `CRM-Sales` | Customers, interactions, orders (no customer delete) |
| **CRM-Support** | `CRM-Support` | Read-only CRM |
| **Warehouse-Manager** | `Warehouse-Manager` | Mechanical parts management, read orders |

Role collections for BTP assignment:

- `CRM-Admin-RC-v2` — all roles (admin)
- `CRM-Sales-RC`
- `CRM-Support-RC`
- `Warehouse-Manager-RC`

In SAP BTP Cockpit: **Security → Users → Role Collections** → assign the appropriate collection to your user.

## Deployment

The `cf login` session is not persisted across dev container restarts.

```bash
cf login --sso

mbt build
cf deploy mta_archives/crm_sap_dev_1.0.0.mtar -f
```

Verify the deployment:

```bash
cf apps    # crm_sap_dev-app should show status "started"
```

The MTA archive bundles three modules: CAP server (`crm_sap_dev-srv`), HANA deployer (`crm_sap_dev-db-deployer`), and Approuter (`crm_sap_dev-app`).

## CI/CD

| Workflow | Trigger | Steps |
|----------|---------|-------|
| [ci.yml](.github/workflows/ci.yml) | Push / PR to `main` or `dev` | `npm ci` → lint → test |
| [deploy.yml](.github/workflows/deploy.yml) | Push to `main`, manual dispatch | test → `mbt build` → `cf deploy` |

For automated deployment, configure these GitHub repository secrets:

- `CF_API`
- `CF_USERNAME`
- `CF_PASSWORD`
- `CF_ORG`
- `CF_SPACE`

## Data model

Generate an entity-relationship diagram from the CDS schema:

```bash
cds compile db/schema.cds --to mermaid
```

In VS Code, use **CDS: Preview as diagram** (SAP CDS extension).

Core entities include `Customer`, `Interaction`, `Feedback`, `Orders`, `OrderItems`, and `MechanicalParts`, with code lists for customer status, order status, interaction types, and product categories.

## License

UNLICENSED
