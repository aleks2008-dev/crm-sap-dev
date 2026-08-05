sap.ui.define(["sap/ui/test/opaQunit", "./pages/JourneyRunner"], function (opaTest, __runner) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const runner = _interopRequireDefault(__runner);
  function journey() {
    QUnit.module("CustomersListListReport journey");
    opaTest("Start application", function (Given, _When, Then) {
      Given.iStartMyApp();
      Then.onTheCustomersList.iSeeThisPage();
    });

    // Note: this test will only work if the ListReport page has a search field and shows data that matches the search term. Please ensure that the test data and search term are set up accordingly.
    // opaTest("Perform a global search and check the result", function (Given: Given, When: When, Then: Then) {
    //     When.onTheCustomersList.onFilterBar().iChangeSearchField("Search Term");
    //     When.onTheCustomersList.onFilterBar().iExecuteSearch();
    //     Then.onTheCustomersList.onTable("").iCheckRows();
    // });

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
//# sourceMappingURL=CustomersListJourney-dbg.js.map
