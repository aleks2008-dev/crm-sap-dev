sap.ui.define([
    "sap/ui/model/odata/v4/ODataModel"
], function (ODataModel) {
    "use strict";

    return {
        createOrderModel: function () {
            return new ODataModel({
                serviceUrl: "/orders/",
                synchronizationMode: "None",
                operationMode: "Server",
                autoExpandSelect: true,
                earlyRequests: true
            });
        }
    };
});
