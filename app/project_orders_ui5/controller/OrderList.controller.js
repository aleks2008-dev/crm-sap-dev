sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "projectordersui5/model/formatter",
    "projectordersui5/controller/BaseController"
], function (Controller, UIComponent, Filter, FilterOperator, MessageToast, MessageBox, formatter, BaseController) {
    "use strict";

    return BaseController.extend("projectordersui5.controller.OrderList", {
        formatter: formatter,

        onInit: function () {
            this._sFilterPartId = "";
            this._sFilterCustomerId = "";
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("orderList").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            var oRoleSelect = this.byId("roleSelect");
            var sRole = this.getModel("appView").getProperty("/role");
            if (oRoleSelect) {
                oRoleSelect.setSelectedKey(sRole);
            }
            this._refreshTable();
        },

        onRoleChange: function (oEvent) {
            var sRole = oEvent.getParameter("selectedItem").getKey();
            this.getOwnerComponent().setRole(sRole);
            MessageToast.show("Demo role: " + sRole);
        },

        onNavToParts: function () {
            this.navTo("partList");
        },

        _refreshTable: function () {
            var oTable = this.byId("ordersTable");
            var oBinding = oTable && oTable.getBinding("items");
            if (oBinding) {
                oBinding.refresh();
            }
        },

        _getBaseFilters: function () {
            return [new Filter("IsActiveEntity", FilterOperator.EQ, true)];
        },

        _buildFilters: function () {
            var aFilters = this._getBaseFilters();
            var sStatus = this.byId("filterStatus").getSelectedKey();
            var oDate = this.byId("filterOrderDate").getDateValue();
            var sAmount = this.byId("filterTotalAmount").getValue();
            var sCustomer = this.byId("filterCustomer").getValue();

            if (sStatus) {
                aFilters.push(new Filter("statusCode_code", FilterOperator.EQ, sStatus));
            }
            if (oDate) {
                aFilters.push(new Filter("orderDate", FilterOperator.GE, oDate.toISOString()));
            }
            if (sAmount) {
                aFilters.push(new Filter("totalAmount", FilterOperator.GE, Number(sAmount)));
            }
            if (this._sFilterCustomerId) {
                aFilters.push(new Filter("customer_customerID", FilterOperator.EQ, this._sFilterCustomerId));
            } else if (sCustomer) {
                aFilters.push(new Filter("customer/fullName", FilterOperator.Contains, sCustomer));
            }
            if (this._sFilterPartId) {
                aFilters.push(new Filter({
                    path: "items",
                    operator: FilterOperator.Any,
                    variable: "i",
                    condition: new Filter("i/mechanicalPart_ID", FilterOperator.EQ, this._sFilterPartId)
                }));
            }
            return aFilters;
        },

        onSearch: function () {
            var oBinding = this.byId("ordersTable").getBinding("items");
            oBinding.filter(this._buildFilters());
        },

        onClear: function () {
            this.byId("filterStatus").setSelectedKey("");
            this.byId("filterOrderDate").setValue("");
            this.byId("filterTotalAmount").setValue("");
            this.byId("filterCustomer").setValue("");
            this.byId("filterPart").setValue("");
            this._sFilterCustomerId = "";
            this._sFilterPartId = "";
            this.byId("ordersTable").getBinding("items").filter(this._getBaseFilters());
        },

        onOrderPress: function (oEvent) {
            var oItem = oEvent.getParameter("listItem") || oEvent.getSource();
            var oCtx = oItem.getBindingContext("orderModel");
            var sId = oCtx.getProperty("ID");
            this.navTo("orderDetail", { orderId: sId, draft: "false" });
        },

        onCreateOrder: function () {
            var oModel = this.getModel("orderModel");
            var oListBinding = oModel.bindList("/Orders");
            var oCreateCtx = oListBinding.create({
                orderDate: new Date().toISOString(),
                statusCode_code: "NEW"
            }, { $$updateGroupId: "$direct" });

            oCreateCtx.created().then(function () {
                var sId = oCreateCtx.getProperty("ID");
                this.navTo("orderDetail", { orderId: sId, draft: "true" });
            }.bind(this)).catch(function (oError) {
                MessageBox.error(oError.message || "Failed to create order draft");
            });
        },

        onCustomerFilterVH: function () {
            this.openCustomerDialog(function (oCustomer) {
                this._sFilterCustomerId = oCustomer.customerID || "";
                this.byId("filterCustomer").setValue(oCustomer.fullName || "");
            }.bind(this));
        },

        onPartFilterVH: function () {
            this.openPartDialog(function (oPart) {
                this.byId("filterPart").setValue(oPart.name || "");
                this._sFilterPartId = oPart.ID || "";
            }.bind(this));
        }
    });
});
