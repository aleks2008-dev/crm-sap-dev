sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "projectordersui5/model/formatter",
    "projectordersui5/controller/BaseController"
], function (UIComponent, MessageToast, MessageBox, formatter, BaseController) {
    "use strict";

    return BaseController.extend("projectordersui5.controller.PartList", {
        formatter: formatter,

        onInit: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("partList").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function () {
            this.byId("partsTable").getBinding("items").refresh();
        },

        onNavBack: function () {
            this.navTo("orderList");
        },

        onNavToOrders: function () {
            this.navTo("orderList");
        },

        onPartPress: function (oEvent) {
            var oCtx = oEvent.getParameter("listItem").getBindingContext("orderModel");
            this.navTo("partDetail", { partId: oCtx.getProperty("ID") });
        },

        onCreatePart: function () {
            var oModel = this.getModel("orderModel");
            var oListBinding = oModel.bindList("/MechanicalParts");
            var oCreateCtx = oListBinding.create({
                name: "New Part",
                description: "",
                price: 0,
                quantityInStock: 0
            });
            oCreateCtx.created().then(function () {
                this.navTo("partDetail", { partId: oCreateCtx.getProperty("ID") });
            }.bind(this)).catch(function (oError) {
                MessageBox.error(oError.message || "Failed to create part");
            });
        }
    });
});
