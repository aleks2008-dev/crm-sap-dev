import JourneyRunner from "sap/fe/test/JourneyRunner";
import ListReport from "sap/fe/test/ListReport";
import ObjectPage from "sap/fe/test/ObjectPage";
import CustomCustomersList from "./CustomersList";
import CustomCustomersObjectPage from "./CustomersObjectPage";

const runner = new JourneyRunner({
    launchUrl: sap.ui.require.toUrl("crm/projectcrm") + "/test/flp.html#app-preview",
    pages: {
        onTheCustomersList: new ListReport(
            {
                appId: "crm.projectcrm",
                componentId: "CustomersList",
                entitySet: "",
                contextPath: "/Customers"
            },
            CustomCustomersList
        ),
        onTheCustomersObjectPage: new ObjectPage(
            {
                appId: "crm.projectcrm",
                componentId: "CustomersObjectPage",
                entitySet: "",
                contextPath: "/Customers"
            },
            CustomCustomersObjectPage
        )
    },
    async: true
});

export default runner;
