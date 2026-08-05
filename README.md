# CRM CAP — dev container

1. Open folder in VS Code
2. Reopen in Container
3. `cds init` / `cds watch`
4. "cf login", "cds watch --profile production,hybrid", "Ctrl+C nmp test"
5. Browser: http://localhost:4004
for testing without JWT  "CDS_REQUIRES_AUTH_KIND=mocked cds watch --profile hybrid",   cds watch --profile hybrid
"cds deploy --to hana", "cds deploy --to hana --drop-schema"
6. npm test    npm test -- --coverage
7. npm run lint, npm run lint:fix

# 1. Залогиниться (сессия сбрасывается при перезапуске devcontainer)
cf login --sso

# 2. Собрать архив
mbt build

# 3. Задеплоить
cf deploy mta_archives/crm_sap_dev_1.0.0.mtar -f

CRM: https://f0a4dd9etrial-dev-crm-sap-dev-app.cfapps.us10-001.hana.ondemand.com/projectcrm/index.html

Orders: https://f0a4dd9etrial-dev-crm-sap-dev-app.cfapps.us10-001.hana.ondemand.com/project_orders/index.html