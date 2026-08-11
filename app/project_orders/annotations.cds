using SalesOrderService from '../../srv/order-service';

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
    ]
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
