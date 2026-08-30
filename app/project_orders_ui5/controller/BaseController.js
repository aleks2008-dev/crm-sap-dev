sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "projectordersui5/model/formatter"
], function (Controller, UIComponent, Fragment, Filter, FilterOperator, formatter) {
    "use strict";

    return Controller.extend("projectordersui5.controller.BaseController", {
        formatter: formatter,

        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        navTo: function (sRoute, oParams) {
            this.getRouter().navTo(sRoute, oParams || {});
        },

        getModel: function (sName) {
            return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName);
        },

        _getFragmentId: function () {
            return this.getView().getId();
        },

        _closeFragmentDialog: function (sDialogId) {
            var oDialog = Fragment.byId(this._getFragmentId(), sDialogId);
            if (oDialog && typeof oDialog.close === "function") {
                oDialog.close();
            }
        },

        openCustomerDialog: function (fnConfirm) {
            this._fnCustomerConfirm = fnConfirm;
            if (!this._pCustomerDialog) {
                this._pCustomerDialog = Fragment.load({
                    id: this._getFragmentId(),
                    name: "projectordersui5.view.fragment.CustomerVH",
                    controller: this
                });
            }
            this._pCustomerDialog.then(function (oDialog) {
                if (!oDialog.getParent()) {
                    this.getView().addDependent(oDialog);
                }
                oDialog.open();
            }.bind(this));
        },

        openPartDialog: function (fnConfirm) {
            this._fnPartConfirm = fnConfirm;
            if (!this._pPartDialog) {
                this._pPartDialog = Fragment.load({
                    id: this._getFragmentId(),
                    name: "projectordersui5.view.fragment.PartVH",
                    controller: this
                });
            }
            this._pPartDialog.then(function (oDialog) {
                if (!oDialog.getParent()) {
                    this.getView().addDependent(oDialog);
                }
                oDialog.open();
            }.bind(this));
        },

        onCustomerVHConfirm: function (oEvent) {
            var oItem = oEvent.getParameter("selectedItem");
            if (oItem && this._fnCustomerConfirm) {
                this._fnCustomerConfirm(oItem.getBindingContext("orderModel").getObject());
            }
            this._closeFragmentDialog("customerSelectDialog");
        },

        onCustomerVHCancel: function () {
            this._closeFragmentDialog("customerSelectDialog");
        },

        onPartVHConfirm: function (oEvent) {
            var oItem = oEvent.getParameter("selectedItem");
            if (oItem && this._fnPartConfirm) {
                this._fnPartConfirm(oItem.getBindingContext("orderModel").getObject());
            }
            this._closeFragmentDialog("partSelectDialog");
        },

        onPartVHCancel: function () {
            this._closeFragmentDialog("partSelectDialog");
        },

        onCustomerVHSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oBinding = oEvent.getSource().getBinding("items");
            var aFilters = [];
            if (sValue) {
                aFilters.push(new Filter("tolower(fullName)", FilterOperator.Contains, sValue.toLowerCase()));
            }
            oBinding.filter(aFilters);
        },

        onPartVHSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oBinding = oEvent.getSource().getBinding("items");
            var aFilters = [];
            if (sValue) {
                aFilters.push(new Filter("tolower(name)", FilterOperator.Contains, sValue.toLowerCase()));
            }
            oBinding.filter(aFilters);
        }
    });
});
