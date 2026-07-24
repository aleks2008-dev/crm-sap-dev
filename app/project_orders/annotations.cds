using SalesOrderService as service from '../../srv/order-service';
annotate service.Orders with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'orderDate',
                Value : orderDate,
            },
            {
                $Type : 'UI.DataField',
                Label : 'totalAmount',
                Value : totalAmount,
            },
            {
                $Type : 'UI.DataField',
                Label : 'statusCode_code',
                Value : statusCode_code,
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'General Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'orderDate',
            Value : orderDate,
        },
        {
            $Type : 'UI.DataField',
            Label : 'totalAmount',
            Value : totalAmount,
        },
        {
            $Type : 'UI.DataField',
            Label : 'statusCode_code',
            Value : statusCode_code,
        },
    ],
);

annotate service.Orders with {
    statusCode @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'OrderStatusCodes',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : statusCode_code,
                ValueListProperty : 'code',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'name',
            },
        ],
    }
};

