sap.ui.define(["sap/fe/test/JourneyRunner", "sap/fe/test/ListReport", "sap/fe/test/ObjectPage", "./CustomersList", "./CustomersObjectPage"], function (JourneyRunner, ListReport, ObjectPage, __CustomCustomersList, __CustomCustomersObjectPage) {
  "use strict";

  function _interopRequireDefault(obj) {
    return obj && obj.__esModule && typeof obj.default !== "undefined" ? obj.default : obj;
  }
  const CustomCustomersList = _interopRequireDefault(__CustomCustomersList);
  const CustomCustomersObjectPage = _interopRequireDefault(__CustomCustomersObjectPage);
  const runner = new JourneyRunner({
    launchUrl: sap.ui.require.toUrl("crm/projectcrm") + "/test/flp.html#app-preview",
    pages: {
      onTheCustomersList: new ListReport({
        appId: "crm.projectcrm",
        componentId: "CustomersList",
        entitySet: "",
        contextPath: "/Customers"
      }, CustomCustomersList),
      onTheCustomersObjectPage: new ObjectPage({
        appId: "crm.projectcrm",
        componentId: "CustomersObjectPage",
        entitySet: "",
        contextPath: "/Customers"
      }, CustomCustomersObjectPage)
    },
    async: true
  });
  return runner;
});
//# sourceMappingURL=JourneyRunner-dbg.js.map
