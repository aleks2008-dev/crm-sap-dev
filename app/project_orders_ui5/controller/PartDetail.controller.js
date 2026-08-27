sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "projectordersui5/controller/BaseController"
], function (UIComponent, MessageToast, MessageBox, BaseController) {
    "use strict";

    return BaseController.extend("projectordersui5.controller.PartDetail", {
        onInit: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("partDetail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            this._sPartId = oEvent.getParameter("arguments").partId;
            this.getView().bindElement({
                path: "/MechanicalParts(ID=" + this._sPartId + ")",
                model: "orderModel"
            });
        },

        onNavBack: function () {
            this.navTo("partList");
        },

        onSave: function () {
            var oCtx = this.getView().getBindingContext("orderModel");
            oCtx.getModel().submitBatch("$auto").then(function () {
                MessageToast.show("Part saved");
            }).catch(function (oError) {
                MessageBox.error(oError.message || "Save failed");
            });
        },

        onDelete: function () {
            MessageBox.confirm("Delete this part?", {
                onClose: function (sAction) {
                    if (sAction !== MessageBox.Action.OK) {
                        return;
                    }
                    var oCtx = this.getView().getBindingContext("orderModel");
                    oCtx.delete().then(function () {
                        MessageToast.show("Part deleted");
                        this.navTo("partList");
                    }.bind(this)).catch(function (oError) {
                        MessageBox.error(oError.message || "Delete failed");
                    });
                }.bind(this)
            });
        }
    });
});
