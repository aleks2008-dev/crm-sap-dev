sap.ui.define(["sap/ui/test/actions/Press"], function (Press) {
  "use strict";

  const actions = {
    iPressSectionIconTabFilterButton(section) {
      return this.waitFor({
        id: new RegExp(`.*--fe::FacetSection::${section}-anchor$`),
        actions: new Press()
      });
    }
  };
  const assertions = {};
  class ObjectPage {
    actions = actions;
    assertions = assertions;
  }
  ObjectPage.actions = actions;
  ObjectPage.assertions = assertions;
  return ObjectPage;
});
//# sourceMappingURL=CustomersObjectPage-dbg.js.map
