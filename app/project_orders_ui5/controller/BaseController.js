sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/ui/core/Fragment",
    "projectordersui5/model/formatter"
], function (Controller, UIComponent, MessageToast, MessageBox, Fragment, formatter) {
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

        openCustomerDialog: function (fnConfirm) {
            if (!this._oCustomerDialog) {
                this._oCustomerDialog = this.loadFragment({
                    name: "projectordersui5.view.fragment.CustomerVH"
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    this._fnCustomerConfirm = fnConfirm;
                    return oDialog;
                }.bind(this));
            }
            this._oCustomerDialog = Promise.resolve(this._oCustomerDialog).then(function (oDialog) {
                this._fnCustomerConfirm = fnConfirm;
                oDialog.open();
                return oDialog;
            }.bind(this));
        },

        openPartDialog: function (fnConfirm) {
            if (!this._oPartDialog) {
                this._oPartDialog = this.loadFragment({
                    name: "projectordersui5.view.fragment.PartVH"
                }).then(function (oDialog) {
                    this.getView().addDependent(oDialog);
                    this._fnPartConfirm = fnConfirm;
                    return oDialog;
                }.bind(this));
            }
            this._oPartDialog = Promise.resolve(this._oPartDialog).then(function (oDialog) {
                this._fnPartConfirm = fnConfirm;
                oDialog.open();
                return oDialog;
            }.bind(this));
        },

        onCustomerVHConfirm: function (oEvent) {
            var oItem = oEvent.getParameter("selectedItem");
            if (oItem && this._fnCustomerConfirm) {
                this._fnCustomerConfirm(oItem.getBindingContext("orderModel").getObject());
            }
            oEvent.getSource().close();
        },

        onCustomerVHCancel: function (oEvent) {
            oEvent.getSource().close();
        },

        onPartVHConfirm: function (oEvent) {
            var oItem = oEvent.getParameter("selectedItem");
            if (oItem && this._fnPartConfirm) {
                this._fnPartConfirm(oItem.getBindingContext("orderModel").getObject());
            }
            oEvent.getSource().close();
        },

        onPartVHCancel: function (oEvent) {
            oEvent.getSource().close();
        }
    });
});
