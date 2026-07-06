using AdminService as service from '../../srv/admin-service';
annotate service.Customers with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'firstName',
                Value : firstName,
            },
            {
                $Type : 'UI.DataField',
                Label : 'lastName',
                Value : lastName,
            },
            {
                $Type : 'UI.DataField',
                Label : 'email',
                Value : email,
            },
            {
                $Type : 'UI.DataField',
                Label : 'phone',
                Value : phone,
            },
            {
                $Type : 'UI.DataField',
                Label : 'statusCode_code',
                Value : statusCode_code,
            },
            {
                $Type : 'UI.DataField',
                Label : 'averageRating',
                Value : averageRating,
            },
        ],
    },
    UI.Facets : [
        {
            $Type  : 'UI.CollectionFacet',
            ID     : 'Tab1',
            Label  : 'Customer Details',
            Facets : [
                {
                    $Type  : 'UI.ReferenceFacet',
                    ID     : 'GeneratedFacet1',
                    Label  : 'General Information',
                    Target : '@UI.FieldGroup#GeneratedGroup',
                },
            ],
        },
        {
            $Type  : 'UI.CollectionFacet',
            ID     : 'Tab2',
            Label  : 'Activity',
            Facets : [
                {
                    $Type  : 'UI.ReferenceFacet',
                    ID     : 'InteractionsFacet',
                    Label  : 'Interactions',
                    Target : 'interactions/@UI.LineItem',
                },
                {
                    $Type  : 'UI.ReferenceFacet',
                    ID     : 'FeedbacksFacet',
                    Label  : 'Feedbacks',
                    Target : 'feedbacks/@UI.LineItem',
                },
            ],
        },
        {
            $Type  : 'UI.CollectionFacet',
            ID     : 'Tab3',
            Label  : 'Preferences',
            Facets : [
                {
                    $Type  : 'UI.ReferenceFacet',
                    ID     : 'PreferencesFacet',
                    Label  : 'Preferences',
                    Target : 'preferences/@UI.LineItem',
                },
            ],
        },
    ],
    UI.SelectionFields : [
        statusCode_code,
        averageRating,
        firstName,
        lastName,
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'firstName',
            Value : firstName,
        },
        {
            $Type : 'UI.DataField',
            Label : 'lastName',
            Value : lastName,
        },
        {
            $Type : 'UI.DataField',
            Label : 'email',
            Value : email,
        },
        {
            $Type : 'UI.DataField',
            Label : 'phone',
            Value : phone,
        },
        {
            $Type                   : 'UI.DataField',
            Label                   : 'Status',
            Value                   : statusCode_code,
            Criticality             : criticality,
            CriticalityRepresentation : #WithIcon,
        },
    ],
);

annotate service.Customers with {
    statusCode @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'StatusCodes',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : statusCode_code,
                ValueListProperty : 'code',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'description',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'colorCode',
            },
        ],
    }
};

annotate service.Customers with {
    criticality @UI.Hidden : true;
};

annotate service.Interactions with @(
    UI.LineItem : [
        { $Type : 'UI.DataField', Label : 'Date',        Value : date },
        { $Type : 'UI.DataField', Label : 'Method',      Value : method },
        { $Type : 'UI.DataField', Label : 'Summary',     Value : summary },
        { $Type : 'UI.DataField', Label : 'Description', Value : description },
    ]
);

annotate service.Preferences with @(
    UI.LineItem : [
        { $Type : 'UI.DataField', Label : 'Category', Value : productCategory },
        { $Type : 'UI.DataField', Label : 'Notes',    Value : notes },
    ]
);

annotate service.Preferences with {
    productCategory @Common.ValueList : {
        $Type : 'Common.ValueListType',
        CollectionPath : 'ProductCategories',
        Parameters : [
            {
                $Type : 'Common.ValueListParameterInOut',
                LocalDataProperty : productCategory,
                ValueListProperty : 'code',
            },
            {
                $Type : 'Common.ValueListParameterDisplayOnly',
                ValueListProperty : 'description',
            },
        ],
    }
};

annotate service.Feedbacks with @(
    UI.LineItem : [
        { $Type : 'UI.DataField', Label : 'Rating',   Value : rating },
        { $Type : 'UI.DataField', Label : 'Comments', Value : comments },
        { $Type : 'UI.DataField', Label : 'Date',     Value : feedbackDate },
    ]
);

