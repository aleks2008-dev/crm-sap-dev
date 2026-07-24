import JourneyRunner from "sap/fe/test/JourneyRunner";
import ListReport from "sap/fe/test/ListReport";
import ObjectPage from "sap/fe/test/ObjectPage";
import CustomOrdersListGenerated from "./OrdersList.gen";
import CustomOrdersObjectPageGenerated from "./OrdersObjectPage.gen";

const runner = new JourneyRunner({
    launchUrl: sap.ui.require.toUrl("projectorders") + "/test/flp.html#app-preview",
    pages: {
        onTheOrdersListGenerated: new ListReport(
            {
                appId: "projectorders",
                componentId: "OrdersList",
                entitySet: "",
                contextPath: "/Orders"
            },
            CustomOrdersListGenerated
        ),
        onTheOrdersObjectPageGenerated: new ObjectPage(
            {
                appId: "projectorders",
                componentId: "OrdersObjectPage",
                entitySet: "",
                contextPath: "/Orders"
            },
            CustomOrdersObjectPageGenerated
        )
    },
    async: true
});

export default runner;
