sap.ui.define([
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
], function (UIComponent, JSONModel) {
    "use strict";

    return UIComponent.extend("projectordersui5.Component", {
        metadata: {
            manifest: "json"
        },

        init: function () {
            UIComponent.prototype.init.apply(this, arguments);
            this._initAppViewModel();
            this.getRouter().initialize();
        },

        _initAppViewModel: function () {
            var sRole = this._detectRole();
            var oAppView = new JSONModel({
                role: sRole,
                canCreateOrder: sRole === "CRM-Admin" || sRole === "CRM-Sales",
                canEditOrder: sRole === "CRM-Admin" || sRole === "CRM-Sales",
                canChangeStatus: sRole === "CRM-Admin" || sRole === "CRM-Sales",
                canManageParts: sRole === "CRM-Admin" || sRole === "Warehouse-Manager",
                editMode: false,
                isDraft: false
            });
            this.setModel(oAppView, "appView");
        },

        _detectRole: function () {
            var oParams = new URLSearchParams(window.location.search);
            var sParamRole = oParams.get("role");
            var mRoles = {
                admin: "CRM-Admin",
                sales: "CRM-Sales",
                warehouse: "Warehouse-Manager"
            };
            if (sParamRole && mRoles[sParamRole]) {
                return mRoles[sParamRole];
            }
            return "CRM-Admin";
        },

        setRole: function (sRole) {
            var oAppView = this.getModel("appView");
            oAppView.setProperty("/role", sRole);
            oAppView.setProperty("/canCreateOrder", sRole === "CRM-Admin" || sRole === "CRM-Sales");
            oAppView.setProperty("/canEditOrder", sRole === "CRM-Admin" || sRole === "CRM-Sales");
            oAppView.setProperty("/canChangeStatus", sRole === "CRM-Admin" || sRole === "CRM-Sales");
            oAppView.setProperty("/canManageParts", sRole === "CRM-Admin" || sRole === "Warehouse-Manager");
        }
    });
});
