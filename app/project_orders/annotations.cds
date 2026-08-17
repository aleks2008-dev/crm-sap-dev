using SalesOrderService from '../../srv/order-service';

// ── Property Labels / Titles ───────────────────────────────────────────────────

annotate SalesOrderService.Orders with {
    ID                  @title: 'Order ID';
    orderDate           @title: 'Order Date';
    totalAmount         @title: 'Total Amount';
    
    statusCode          @title: 'Status';
    statusCode_code     @title: 'Status';
    
    customer            @title: 'Customer';
    customer_customerID @title: 'Customer';
};

annotate SalesOrderService.OrderItems with {
    mechanicalPart      @title: 'Mechanical Part';
    mechanicalPart_ID   @title: 'Mechanical Part';
    quantity            @title: 'Quantity';
    price               @title: 'Price';
};

// ── List Report ───────────────────────────────────────────────────────────────

annotate SalesOrderService.Orders with @(
    // Для ассоциаций (statusCode, customer, items.mechanicalPart) FilterBar сам возьмет красивый заголовок
    UI.SelectionFields: [ statusCode, orderDate, totalAmount, customer, items.mechanicalPart ],

    UI.LineItem: [
        { Value: ID,              Label: 'Order ID' },
        { Value: orderDate,       Label: 'Order Date' },
        { Value: totalAmount,     Label: 'Total Amount' },
        { Value: statusCode_code, Label: 'Status' }
    ]
);

// ── Object Page ───────────────────────────────────────────────────────────────

annotate SalesOrderService.Orders with @(
    UI.HeaderInfo: {
        TypeName: 'Order',
        TypeNamePlural: 'Orders',
        Title: { Value: customer.fullName }, // Крупный заголовок: имя клиента
        Description: { Value: ID }           // Мелкий подзаголовок: UUID заказа
    },

    UI.FieldGroup #General: {
        Data: [
            { Value: orderDate },
            { Value: totalAmount },
            { Value: statusCode_code }
        ]
    },

    UI.FieldGroup #Customer: {
        Data: [
            { Value: customer_customerID },
            { Value: customer.firstName },
            { Value: customer.lastName },
            { Value: customer.email },
            { Value: customer.phone }
        ]
    },

    UI.Facets: [
        {
            $Type: 'UI.CollectionFacet',
            ID: 'OrderDetails',
            Label: 'Order Details',
            Facets: [{
                $Type: 'UI.ReferenceFacet',
                Label: 'General',
                Target: '@UI.FieldGroup#General'
            }]
        },
        {
            $Type: 'UI.CollectionFacet',
            ID: 'OrderItems',
            Label: 'Order Items',
            Facets: [{
                $Type: 'UI.ReferenceFacet',
                Label: 'Items',
                Target: 'items/@UI.LineItem'
            }]
        },
        {
            $Type: 'UI.CollectionFacet',
            ID: 'CustomerInfo',
            Label: 'Customer',
            Facets: [{
                $Type: 'UI.ReferenceFacet',
                Label: 'Customer',
                Target: '@UI.FieldGroup#Customer'
            }]
        }
    ],

    UI.Identification: [{
        $Type: 'UI.DataFieldForAction',
        Action: 'SalesOrderService.Orders_changeStatus',
        Label: 'Change Status'
    }]
);

// ── Value Helps ───────────────────────────────────────────────────────────────

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
        Common.QuickInfo: 'Customer details',
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
        Common.QuickInfo: 'Mechanical part details',
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

// ── Mechanical Parts Table ────────────────────────────────────────────────────

annotate SalesOrderService.MechanicalParts with @(
    UI.LineItem: [
        { Value: name,            Label: 'Name' },
        { Value: description,     Label: 'Description' },
        { Value: price,           Label: 'Price' },
        { Value: quantityInStock, Label: 'In Stock' }
    ]
);