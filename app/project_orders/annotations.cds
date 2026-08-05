using SalesOrderService from '../../srv/order-service';

// ── List Report ───────────────────────────────────────────────────────────────

annotate SalesOrderService.Orders with @(
    UI.SelectionFields: [ statusCode_code ],

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
    ]
);

// ── Value Help for Status ─────────────────────────────────────────────────────

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
};

// ── Order Items Table ─────────────────────────────────────────────────────────

annotate SalesOrderService.OrderItems with @(
    UI.LineItem: [
        { Value: mechanicalPart_ID, Label: 'Part' },
        { Value: quantity,          Label: 'Quantity' },
        { Value: price,             Label: 'Price' }
    ]
);
