sap.ui.define([], function () {
    "use strict";

    return {
        formatStatusState: function (iCriticality) {
            if (iCriticality === 3) {
                return "Success";
            }
            if (iCriticality === 2) {
                return "Warning";
            }
            if (iCriticality === 1) {
                return "Error";
            }
            return "None";
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
        }
    };
});
