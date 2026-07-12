import type Opa5 from "sap/ui/test/Opa5";
import type { actions as ListReportActions, assertions as ListReportAssertions } from "sap/fe/test/ListReport";
import type { actions as ObjectPageActions, assertions as ObjectPageAssertions } from "sap/fe/test/ObjectPage";
import type { actions as TemplatePageActions, assertions as TemplatePageAssertions } from "sap/fe/test/TemplatePage";
import type Shell from "sap/fe/test/Shell";
import type BaseArrangements from "sap/fe/test/BaseArrangements";
import type { actions as CustomersListCustomActions, assertions as CustomersListCustomAssertions } from "../pages/CustomersList";
import type { actions as CustomersObjectPageCustomActions, assertions as CustomersObjectPageCustomAssertions } from "../pages/CustomersObjectPage";

export type Given = Opa5 & BaseArrangements & {
    iTearDownMyApp: () => Given;
    iStartMyApp: (sAppHash?: string, mInUrlParameters?: object) => Given;
    and: Given;
};

export type When = Opa5 & BaseArrangements & {
    onTheCustomersList: Opa5 & ListReportActions & TemplatePageActions & typeof CustomersListCustomActions;
    onTheCustomersObjectPage: Opa5 & ObjectPageActions & TemplatePageActions & typeof CustomersObjectPageCustomActions;
    onTheShell: Shell;
};

export type Then = Opa5 & BaseArrangements & {
    onTheCustomersList: Opa5 & ListReportAssertions & TemplatePageAssertions & typeof CustomersListCustomAssertions;
    onTheCustomersObjectPage: Opa5 & ObjectPageAssertions & TemplatePageAssertions & typeof CustomersObjectPageCustomAssertions;
    onTheShell: Shell;
};
