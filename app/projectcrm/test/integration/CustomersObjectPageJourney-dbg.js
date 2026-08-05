sap.ui.define(["sap/ui/test/opaQunit", "./pages/JourneyRunner"], function (opaTest, __runner) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const runner = _interopRequireDefault(__runner);
  function journey() {
    QUnit.module("CustomersObjectPageObjectPage journey");
    opaTest("Navigate to CustomersObjectPageObjectPage", function (Given, When, Then) {
      Given.iStartMyApp();
      When.onTheCustomersList.onFilterBar().iExecuteSearch();
      Then.onTheCustomersList.onTable("").iCheckRows();
      When.onTheCustomersList.onTable("").iPressRow(0);
      Then.onTheCustomersObjectPage.iSeeThisPage();
    });
    opaTest("Teardown", function (Given) {
      // Cleanup
      Given.iTearDownMyApp();
    });
  }
  runner.run([journey]);
});
//# sourceMappingURL=CustomersObjectPageJourney-dbg.js.map
