sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/Fragment",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/m/MessageToast",
    "sap/m/QuickView",
    "sap/m/QuickViewPage",
    "projectordersui5/model/formatter"
], function (Controller, UIComponent, Fragment, Filter, FilterOperator, MessageToast, QuickView, QuickViewPage, formatter) {
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
        },

        _showQuickView: function (oAnchor, oPageConfig) {
            if (!this._oQuickView) {
                this._oQuickView = new QuickView({ width: "20rem" });
                this.getView().addDependent(this._oQuickView);
            }
            this._oQuickView.destroyPages();
            this._oQuickView.addPage(new QuickViewPage(oPageConfig));
            this._oQuickView.openBy(oAnchor);
        },

        _openCustomerQuickView: function (oAnchor, oCustomer) {
            if (!oCustomer || !oCustomer.fullName) {
                MessageToast.show("No customer selected");
                return;
            }
            this._showQuickView(oAnchor, {
                title: oCustomer.fullName || "Customer",
                description: oCustomer.email || "",
                groups: [{
                    heading: "Contact",
                    elements: [
                        { label: "Email", value: oCustomer.email || "" },
                        { label: "Phone", value: oCustomer.phone || "" }
                    ]
                }]
            });
        },

        _openStatusQuickView: function (oAnchor, oOrder) {
            if (!oOrder) {
                return;
            }
            var oStatus = oOrder.statusCode || {};
            this._showQuickView(oAnchor, {
                title: oStatus.name || oOrder.statusCode_code || "Status",
                groups: [{
                    heading: "Status",
                    elements: [
                        { label: "Code", value: oOrder.statusCode_code || "" },
                        { label: "Name", value: oStatus.name || "" }
                    ]
                }]
            });
        },

        _openPartQuickView: function (oAnchor, oPart) {
            if (!oPart || !oPart.name) {
                MessageToast.show("No part selected");
                return;
            }
            this._showQuickView(oAnchor, {
                title: oPart.name || "Part",
                description: oPart.description || "",
                groups: [{
                    heading: "Details",
                    elements: [
                        { label: "Price", value: this.formatter.formatCurrency(oPart.price) },
                        { label: "In Stock", value: oPart.quantityInStock != null ? String(oPart.quantityInStock) : "" }
                    ]
                }]
            });
        }
    });
});
