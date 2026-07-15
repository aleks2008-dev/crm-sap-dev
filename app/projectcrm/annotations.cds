using AdminService as service from '../../srv/admin-service';

annotate service.Customers with {
    @Common.Label : '{i18n>Customer.firstName}'
    firstName;
    @Common.Label : '{i18n>Customer.lastName}'
    lastName;
    @Common.Label : '{i18n>Customer.email}'
    email;
    @Common.Label : '{i18n>Customer.phone}'
    phone;
    @Common.Label : '{i18n>Customer.statusCode}'
    statusCode;
    @Common.Label : '{i18n>Customer.averageRating}'
    averageRating;
    @Common.Label : '{i18n>Customer.fullName}'
    fullName;
    @Common.Label : '{i18n>Customer.categoryGroup}'
    categoryGroup;
};

annotate service.Customers with @(
    UI.HeaderInfo : {
        TypeName       : '{i18n>Customer.singular}',
        TypeNamePlural : '{i18n>Customer.plural}',
        Title          : {
            $Type : 'UI.DataField',
            Value : fullName,
        },
        Description    : {
            $Type : 'UI.DataField',
            Value : email,
        },
    },
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            { $Type : 'UI.DataField', Value : firstName },
            { $Type : 'UI.DataField', Value : lastName },
            { $Type : 'UI.DataField', Value : email },
            { $Type : 'UI.DataField', Value : phone },
            { $Type : 'UI.DataField', Value : statusCode_code },
            { $Type : 'UI.DataField', Value : averageRating },
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
                { $Type  : 'UI.ReferenceFacet', ID : 'InteractionsFacet', Label : 'Interactions', Target : 'interactions/@UI.PresentationVariant' },
                { $Type  : 'UI.ReferenceFacet', ID : 'FeedbacksFacet',    Label : 'Feedbacks',    Target : 'feedbacks/@UI.LineItem' },
                { $Type  : 'UI.ReferenceFacet', ID : 'NotesFacet',        Label : 'Notes',        Target : 'notes/@UI.LineItem' },
            ],
        },
        {
            $Type  : 'UI.CollectionFacet',
            ID     : 'Tab3',
            Label  : 'Preferences',
            Facets : [
                { $Type  : 'UI.ReferenceFacet', ID : 'PreferencesFacet', Label : 'Preferences',   Target : 'preferences/@UI.LineItem' },
                { $Type  : 'UI.ReferenceFacet', ID : 'LoyaltyFacet',     Label : 'Loyalty Program', Target : 'loyaltyPrograms/@UI.LineItem' },
            ],
        },
    ],
    UI.SelectionFields : [
        statusCode_code,
        categoryGroup_code,
        averageRating,
        firstName,
        lastName,
    ],
    UI.LineItem : [
        { $Type : 'UI.DataField', Value : firstName },
        { $Type : 'UI.DataField', Value : lastName },
        { $Type : 'UI.DataField', Value : email },
        { $Type : 'UI.DataField', Value : phone },
        {
            $Type                   : 'UI.DataField',
            Value                   : statusCode_code,
            Criticality             : criticality,
            CriticalityRepresentation : #WithIcon,
        },
    ],
);

annotate service.Customers with {
    statusCode @Common.ValueListWithFixedValues : true;
    statusCode @Common.Text                     : statusCode.name;
    statusCode @Common.TextArrangement           : #TextFirst;
};

annotate service.Customers with {
    criticality @UI.Hidden : true;
};

annotate service.Customers with {
    categoryGroup @Common.ValueListWithFixedValues : true;
    categoryGroup @Common.Text                     : categoryGroup.name;
    categoryGroup @Common.TextArrangement           : #TextFirst;
};

annotate service.Interactions with @(
    UI.LineItem : [
        { $Type : 'UI.DataField', Label : 'Date',        Value : date },
        { $Type : 'UI.DataField', Label : 'Type',        Value : interactionType_code },
        { $Type : 'UI.DataField', Label : 'Method',      Value : method },
        { $Type : 'UI.DataField', Label : 'Summary',     Value : summary },
        { $Type : 'UI.DataField', Label : 'Description', Value : description },
    ],
    UI.SelectionFields : [
        interactionType_code,
        date,
    ],
    UI.PresentationVariant : {
        $Type          : 'UI.PresentationVariantType',
        SortOrder      : [{ Property : date, Descending : true }],
        MaxItems       : 5,
        Visualizations : ['@UI.LineItem'],
    },
);

annotate service.Interactions with {
    interactionType @Common.ValueListWithFixedValues : true;
    interactionType @Common.Text                     : interactionType.name;
    interactionType @Common.TextArrangement           : #TextFirst;
};

annotate service.Preferences with @(
    UI.LineItem : [
        { $Type : 'UI.DataField', Label : 'Category', Value : productCategory_code },
        { $Type : 'UI.DataField', Label : 'Notes',    Value : notes },
    ]
);

annotate service.Preferences with {
    productCategory @Common.ValueListWithFixedValues : true;
    productCategory @Common.Text                     : productCategory.name;
    productCategory @Common.TextArrangement           : #TextFirst;
};

annotate service.Feedbacks with @(
    UI.LineItem : [
        { $Type : 'UI.DataField', Label : 'Rating',   Value : rating },
        { $Type : 'UI.DataField', Label : 'Comments', Value : comments },
        { $Type : 'UI.DataField', Label : 'Date',     Value : feedbackDate },
    ]
);

annotate service.CustomerNotes with @(
    UI.LineItem : [
        { $Type : 'UI.DataField', Label : 'Date',    Value : date },
        { $Type : 'UI.DataField', Label : 'Author',  Value : authorID },
        { $Type : 'UI.DataField', Label : 'Content', Value : content },
    ]
);

annotate service.LoyaltyPrograms with @(
    UI.LineItem : [
        { $Type : 'UI.DataField', Label : 'Program',         Value : programName },
        { $Type : 'UI.DataField', Label : 'Tier',            Value : tierLevel },
        { $Type : 'UI.DataField', Label : 'Points Earned',   Value : pointsEarned },
        { $Type : 'UI.DataField', Label : 'Points Redeemed', Value : pointsRedeemed },
    ]
);

annotate service.StatusCodes with {
    code      @Common.Label : '{i18n>StatusCode.code}';
    name      @Common.Label : '{i18n>StatusCode.name}';
    colorCode @Common.Label : '{i18n>StatusCode.colorCode}';
};

annotate service.ProductCategories with {
    code @Common.Label : '{i18n>ProductCategory.code}';
    name @Common.Label : '{i18n>ProductCategory.name}';
};

annotate service.CategoryGroups with {
    code @Common.Label : '{i18n>CategoryGroup.code}';
    name @Common.Label : '{i18n>CategoryGroup.name}';
};

annotate service.InteractionTypes with {
    code @Common.Label : '{i18n>InteractionType.code}';
    name @Common.Label : '{i18n>InteractionType.name}';
};