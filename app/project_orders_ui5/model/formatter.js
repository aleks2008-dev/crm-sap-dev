sap.ui.define([], function () {
    "use strict";

    var mStatusStateByCode = {
        NEW: "None",
        CONFIRMED: "Information",
        SHIPPED: "Warning",
        DELIVERED: "Success",
        CANCELLED: "Error"
    };

    function criticalityToState(iCriticality) {
        var n = Number(iCriticality);
        if (isNaN(n)) {
            return "None";
        }
        if (n === 3) {
            return "Success";
        }
        if (n === 2) {
            return "Warning";
        }
        if (n === 1) {
            return "Error";
        }
        if (n === 0) {
            return "Information";
        }
        return "None";
    }

    return {
        formatStatusState: criticalityToState,

        formatOrderStatusState: function (iCriticality, iStatusCriticality, sStatusCode) {
            var sCode = sStatusCode ? String(sStatusCode).toUpperCase() : "";
            if (sCode && mStatusStateByCode[sCode]) {
                return mStatusStateByCode[sCode];
            }
            var iCrit = iCriticality;
            if (iCrit === null || iCrit === undefined || iCrit === "") {
                iCrit = iStatusCriticality;
            }
            if (iCrit !== null && iCrit !== undefined && iCrit !== "") {
                return criticalityToState(iCrit);
            }
            return "None";
        },

        formatStatusName: function (sName, sCode) {
            return sName || sCode || "";
        },

        formatDraftFlag: function (bIsDraft) {
            return bIsDraft === true || bIsDraft === "true";
        },

        formatCurrency: function (vAmount) {
            if (vAmount === null || vAmount === undefined || vAmount === "") {
                return "";
            }
            return Number(vAmount).toFixed(2);
        },

        formatOrderDate: function (vDate) {
            if (!vDate) {
                return "";
            }
            var oDate = vDate instanceof Date ? vDate : new Date(vDate);
            if (isNaN(oDate.getTime())) {
                return "";
            }
            return oDate.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
        },

        formatHasText: function (sValue) {
            return !!sValue;
        }
    };
});
