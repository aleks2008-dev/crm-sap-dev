sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/QuickView",
    "sap/m/QuickViewPage",
    "projectordersui5/model/formatter",
    "projectordersui5/controller/BaseController"
], function (UIComponent, MessageToast, MessageBox, QuickView, QuickViewPage, formatter, BaseController) {
    "use strict";

    return BaseController.extend("projectordersui5.controller.OrderDetail", {
        formatter: formatter,

        onInit: function () {
            var oRouter = UIComponent.getRouterFor(this);
            oRouter.getRoute("orderDetail").attachPatternMatched(this._onRouteMatched, this);
        },

        _onRouteMatched: function (oEvent) {
            var oArgs = oEvent.getParameter("arguments");
            this._sOrderId = oArgs.orderId;
            this._bIsDraft = oArgs.draft === "true";
            this.getModel("appView").setProperty("/isDraft", this._bIsDraft);
            this.getModel("appView").setProperty("/editMode", this._bIsDraft);
            this._bindOrder();
        },

        _orderPath: function () {
            var sId = this._sOrderId || "";
            if (sId && sId.indexOf("'") === -1) {
                sId = "'" + sId + "'";
            }
            return "/Orders(ID=" + sId + ",IsActiveEntity=" + !this._bIsDraft + ")";
        },

        _bindOrder: function () {
            var sPath = this._orderPath();
            this.getView().bindElement({
                path: sPath,
                model: "orderModel",
                parameters: {
                    $expand: "customer,items($expand=mechanicalPart),statusCode"
                },
                events: {
                    change: this._onBindingChange.bind(this)
                }
            });
        },

        _onBindingChange: function (oEvent) {
            var oCtx = oEvent.getSource().getBoundContext();
            if (!oCtx) {
                MessageBox.error("Order not found");
            }
        },

        _getOrderContext: function () {
            return this.getView().getBindingContext("orderModel");
        },

        onNavBack: function () {
            this.navTo("orderList");
        },

        onEdit: function () {
            var oCtx = this._getOrderContext();
            if (!oCtx) {
                return;
            }
            var oModel = this.getModel("orderModel");
            var oAction = oModel.bindContext("SalesOrderService.draftEdit(...)", oCtx);
            oAction.execute().then(function () {
                this._bIsDraft = true;
                this._sOrderId = oCtx.getProperty("ID");
                this.getModel("appView").setProperty("/isDraft", true);
                this.getModel("appView").setProperty("/editMode", true);
                this._bindOrder();
                MessageToast.show("Draft created");
            }.bind(this)).catch(function (oError) {
                MessageBox.error(oError.message || "Failed to start edit");
            });
        },

        onSave: function () {
            var oCtx = this._getOrderContext();
            if (!oCtx) {
                return;
            }
            var oModel = this.getModel("orderModel");
            oModel.submitBatch("$auto").then(function () {
                var oAction = oModel.bindContext("SalesOrderService.draftActivate(...)", oCtx);
                return oAction.execute();
            }).then(function () {
                this._bIsDraft = false;
                this._sOrderId = oCtx.getProperty("ID");
                this.getModel("appView").setProperty("/isDraft", false);
                this.getModel("appView").setProperty("/editMode", false);
                this._bindOrder();
                MessageToast.show("Order saved");
            }.bind(this)).catch(function (oError) {
                MessageBox.error(oError.message || "Failed to save order");
            });
        },

        onCancelEdit: function () {
            var oCtx = this._getOrderContext();
            if (!oCtx) {
                this.onNavBack();
                return;
            }
            if (!this._bIsDraft) {
                this.getModel("appView").setProperty("/editMode", false);
                this.onNavBack();
                return;
            }
            oCtx.delete("$direct").then(function () {
                MessageToast.show("Draft discarded");
                this.onNavBack();
            }.bind(this)).catch(function () {
                this._bIsDraft = false;
                this.getModel("appView").setProperty("/isDraft", false);
                this.getModel("appView").setProperty("/editMode", false);
                this._bindOrder();
                MessageToast.show("Edit cancelled");
            }.bind(this));
        },

        onDelete: function () {
            MessageBox.confirm("Delete this order?", {
                onClose: function (sAction) {
                    if (sAction !== MessageBox.Action.OK) {
                        return;
                    }
                    var oCtx = this._getOrderContext();
                    var oModel = this.getModel("orderModel");
                    oCtx.delete().then(function () {
                        MessageToast.show("Order deleted");
                        this.onNavBack();
                    }.bind(this)).catch(function (oError) {
                        MessageBox.error(oError.message || "Delete failed");
                    });
                }.bind(this)
            });
        },

        onSelectCustomer: function () {
            this.openCustomerDialog(function (oCustomer) {
                var oCtx = this._getOrderContext();
                oCtx.setProperty("customer_customerID", oCustomer.customerID, "$direct");
                oCtx.requestSideEffects(["customer"]).then(function () {
                    MessageToast.show("Customer selected");
                }).catch(function (oError) {
                    MessageBox.error(oError.message || "Failed to update customer");
                });
            }.bind(this));
        },

        onAddItem: function () {
            this.openPartDialog(function (oPart) {
                var oCtx = this._getOrderContext();
                var oModel = this.getModel("orderModel");
                var oListBinding = oModel.bindList(oCtx.getPath() + "/items", null, null, null, {
                    $$updateGroupId: "$direct"
                });
                var oCreateCtx = oListBinding.create({
                    mechanicalPart_ID: oPart.ID,
                    quantity: 1,
                    price: oPart.price
                }, { $$updateGroupId: "$direct" });
                oCreateCtx.created().then(function () {
                    return oCtx.requestSideEffects(["items", "totalAmount"]);
                }).then(function () {
                    MessageToast.show("Item added");
                }.bind(this)).catch(function (oError) {
                    MessageBox.error(oError.message || "Failed to add item");
                });
            }.bind(this));
        },

        onItemFieldChange: function (oEvent) {
            var oItemCtx = oEvent.getSource().getBindingContext("orderModel");
            if (!oItemCtx) {
                return;
            }
            var oOrderCtx = this._getOrderContext();
            if (oOrderCtx) {
                oOrderCtx.requestSideEffects(["totalAmount"]);
            }
        },

        onDeleteItem: function (oEvent) {
            var oItemCtx = oEvent.getSource().getBindingContext("orderModel");
            if (!oItemCtx) {
                return;
            }
            var oOrderCtx = this._getOrderContext();
            oItemCtx.delete("$direct").then(function () {
                return oOrderCtx.requestSideEffects(["items", "totalAmount"]);
            }).catch(function (oError) {
                MessageBox.error(oError.message || "Failed to delete item");
            });
        },

        onChangeStatus: function () {
            if (!this._oChangeStatusDialog) {
                this.loadFragment({
                    name: "projectordersui5.view.fragment.ChangeStatusDialog"
                }).then(function (oDialog) {
                    this._oChangeStatusDialog = oDialog;
                    this.getView().addDependent(oDialog);
                    oDialog.open();
                }.bind(this));
            } else {
                this._oChangeStatusDialog.open();
            }
        },

        onConfirmChangeStatus: function () {
            var sNewStatus = this.byId("newStatusCombo").getSelectedKey();
            var sComment = this.byId("statusComment").getValue();
            if (!sNewStatus) {
                MessageBox.error("Select a new status");
                return;
            }
            var oCtx = this._getOrderContext();
            var oModel = this.getModel("orderModel");
            var oAction = oModel.bindContext("SalesOrderService.Orders_changeStatus(...)", oCtx);
            oAction.setParameter("newStatus", sNewStatus);
            oAction.setParameter("comment", sComment || "");
            oAction.execute().then(function () {
                this._oChangeStatusDialog.close();
                this.byId("newStatusCombo").setSelectedKey("");
                this.byId("statusComment").setValue("");
                this._bindOrder();
                MessageToast.show("Status updated");
            }.bind(this)).catch(function (oError) {
                MessageBox.error(oError.message || "Status change failed");
            });
        },

        onCancelChangeStatus: function () {
            this._oChangeStatusDialog.close();
        },

        onCustomerQuickView: function () {
            var oCtx = this._getOrderContext();
            var oCustomer = (oCtx && oCtx.getObject()) ? (oCtx.getObject().customer || {}) : {};
            if (!oCustomer.fullName) {
                MessageToast.show("No customer selected");
                return;
            }
            if (!this._oQuickView) {
                this._oQuickView = new QuickView({ width: "20rem" });
                this.getView().addDependent(this._oQuickView);
            }
            this._oQuickView.destroyPages();
            this._oQuickView.addPage(new QuickViewPage({
                title: oCustomer.fullName || "Customer",
                description: oCustomer.email || "",
                groups: [{
                    heading: "Contact",
                    elements: [
                        { label: "Email", value: oCustomer.email || "" },
                        { label: "Phone", value: oCustomer.phone || "" }
                    ]
                }]
            }));
            this._oQuickView.openBy(this.byId("orderDetailPage"));
        }
    });
});
