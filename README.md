# CRM CAP — dev container

1. Open folder in VS Code
2. Reopen in Container
3. `cds init` / `cds watch`
4. "cf login", "cds watch --profile production,hybrid", "Ctrl+C nmp test"
5. Browser: http://localhost:4004
for testing without JWT  "CDS_REQUIRES_AUTH_KIND=mocked cds watch --profile hybrid"
"cds deploy --to hana", "cds deploy --to hana --drop-schema"
6. npm test    npm test -- --coverage
7. sales_test.http  2→3→4,  test.http  3→5→6→7→8.
8. npm run lint, npm run lint:fix
