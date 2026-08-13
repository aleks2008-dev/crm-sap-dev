using SalesOrderService from '../../srv/order-service';

// ── Dialog: Change Order Status ──────────────────────────────────────────────

annotate SalesOrderService.Orders actions {
    changeOrderStatus @(
        Common.IsActionCritical: true,
        UI.ParameterDefaultValue: newStatus,
        cds.odata.bindingParameter.collection: false
    ) with @(
        Common.Label: 'Change Status'
    );
};

annotate SalesOrderService.changeOrderStatus with @(
    UI.OperationGrouping: #Isolated
);

// ── List Report ───────────────────────────────────────────────────────────────

annotate SalesOrderService.Orders with @(
    UI.SelectionFields: [ statusCode_code, orderDate, totalAmount, customer_customerID, items.mechanicalPart_ID ],

    UI.LineItem: [
        { Value: ID,          Label: 'Order ID' },
        { Value: orderDate,   Label: 'Order Date' },
        { Value: totalAmount, Label: 'Total Amount' },
        { Value: statusCode_code, Label: 'Status' }
    ]
);

// ── Object Page ───────────────────────────────────────────────────────────────

annotate SalesOrderService.Orders with @(
    UI.HeaderInfo: {
        TypeName: 'Order',
        TypeNamePlural: 'Orders',
        Title: { Value: ID },
        Description: { Value: orderDate }
    },

    UI.FieldGroup #General: {
        Data: [
            { Value: orderDate },
            { Value: totalAmount },
            { Value: statusCode_code }
        ]
    },

    UI.Facets: [
        {
            $Type: 'UI.ReferenceFacet',
            Label: 'Order Details',
            Target: '@UI.FieldGroup#General'
        },
        {
            $Type: 'UI.ReferenceFacet',
            Label: 'Order Items',
            Target: 'items/@UI.LineItem'
        }
    ],

    UI.Identification: [{
        $Type: 'UI.DataFieldForAction',
        Action: 'SalesOrderService.changeOrderStatus',
        Label: 'Change Status'
    }]
);

// ── Value Helps ──────────────────────────────────────────────────────────────

annotate SalesOrderService.Orders with {
    statusCode @(
        Common.ValueList: {
            CollectionPath: 'OrderStatusCodes',
            Parameters: [
                { $Type: 'Common.ValueListParameterOut', LocalDataProperty: statusCode_code, ValueListProperty: 'code' },
                { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
            ]
        },
        Common.ValueListWithFixedValues: true
    );
    customer @(
        Common.ValueList: {
            CollectionPath: 'Customers',
            Parameters: [
                { $Type: 'Common.ValueListParameterOut', LocalDataProperty: customer_customerID, ValueListProperty: 'customerID' },
                { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'firstName' },
                { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'lastName' },
                { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'email' }
            ]
        }
    );
};

annotate SalesOrderService.changeOrderStatus with @(
    UI.ParameterDefaultValue: newStatus
) {
    newStatus @(
        Common.Label: 'New Status',
        Common.ValueList: {
            CollectionPath: 'OrderStatusCodes',
            Parameters: [
                { $Type: 'Common.ValueListParameterOut', LocalDataProperty: newStatus, ValueListProperty: 'code' },
                { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
            ]
        },
        Common.ValueListWithFixedValues: true
    );
    comment @(
        Common.Label: 'Comment',
        UI.MultiLineText: true
    );
};

annotate SalesOrderService.OrderItems with {
    mechanicalPart @(
        Common.ValueList: {
            CollectionPath: 'MechanicalParts',
            Parameters: [
                { $Type: 'Common.ValueListParameterOut', LocalDataProperty: mechanicalPart_ID, ValueListProperty: 'ID' },
                { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' },
                { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'price' }
            ]
        }
    );
};

// ── Order Items Table ─────────────────────────────────────────────────────────

annotate SalesOrderService.OrderItems with @(
    UI.LineItem: [
        { Value: mechanicalPart_ID, Label: 'Part' },
        { Value: quantity,          Label: 'Quantity' },
        { Value: price,             Label: 'Price' }
    ]
);
