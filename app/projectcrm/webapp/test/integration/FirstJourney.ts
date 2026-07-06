import opaTest from "sap/ui/test/opaQunit";
import type { Given, When, Then } from "./types/OpaJourneyTypes";
import runner from "./pages/JourneyRunner";

function journey() {
    QUnit.module("First journey");

    opaTest("Start application", function (Given: Given, _When: When, Then: Then) {
        Given.iStartMyApp();
        Then.onTheCustomersList.iSeeThisPage();
    });


    opaTest("Navigate to ObjectPage", function (_Given: Given, When: When, Then: Then) {
        // Note: this test will fail if the ListReport page doesn't show any data
        
        When.onTheCustomersList.onFilterBar().iExecuteSearch();
        
        Then.onTheCustomersList.onTable("").iCheckRows();

        When.onTheCustomersList.onTable("").iPressRow(0);
        Then.onTheCustomersObjectPage.iSeeThisPage();

    });

    opaTest("Teardown", function (Given: Given) {
        // Cleanup
        Given.iTearDownMyApp();
    });
}

runner.run([journey]);
