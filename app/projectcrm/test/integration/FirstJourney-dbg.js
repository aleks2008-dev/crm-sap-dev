sap.ui.define(["sap/ui/test/opaQunit", "./pages/JourneyRunner"], function (opaTest, __runner) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const runner = _interopRequireDefault(__runner);
  function journey() {
    QUnit.module("First journey");
    opaTest("Start application", function (Given, _When, Then) {
      Given.iStartMyApp();
      Then.onTheCustomersList.iSeeThisPage();
    });
    opaTest("Navigate to ObjectPage", function (_Given, When, Then) {
      // Note: this test will fail if the ListReport page doesn't show any data

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
//# sourceMappingURL=FirstJourney-dbg.js.map
