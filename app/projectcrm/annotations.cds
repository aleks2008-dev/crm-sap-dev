using AdminService from '../../srv/admin-service';

// ── Property Labels / Titles ───────────────────────────────────────────────────

annotate AdminService.Customers with {
    statusCode         @title: 'Status';
    statusCode_code    @title: 'Status';
    categoryGroup      @title: 'Category Group';
    categoryGroup_code @title: 'Category Group';
    averageRating      @title: 'Average Rating';
};

// ── Navigation Tips / QuickViews ─────────────────────────────────────────────

annotate AdminService.Customers with {
    statusCode @(
        Common.QuickInfo: 'Customer status details'
    );
    categoryGroup @(
        Common.QuickInfo: 'Customer category group'
    );
};

annotate AdminService.Interactions with {
    interactionType @(
        Common.QuickInfo: 'Type of customer interaction'
    );
    customer @(
        Common.QuickInfo: 'Related customer',
        UI.QuickViewFacets: [{
            $Type : 'UI.ReferenceFacet',
            Target : '@UI.FieldGroup#InteractionCustomerQuick'
        }]
    );
};

annotate AdminService.Interactions with @(
    UI.FieldGroup #InteractionCustomerQuick: {
        Label: 'Customer',
        Data: [
            { Value: customer.fullName },
            { Value: customer.email },
            { Value: customer.phone }
        ]
    }
);

// ── List Report ──────────────────────────────────────────────────────────────

annotate AdminService.Customers with @(
    // Использование имен ассоциаций позволяет Fiori лучше подтягивать названия
    UI.SelectionFields: [ statusCode, categoryGroup, averageRating ],

    UI.LineItem: [
        {
            Value: fullName,
            Label: 'Customer'
        },
        {
            Value: email,
            Label: 'Email'
        },
        {
            Value: phone,
            Label: 'Phone'
        },
        {
            Value: categoryGroup_code,
            Label: 'Category'
        },
        {
            Value: averageRating,
            Label: 'Avg Rating'
        },
        {
            Value: statusCode_code,
            Label: 'Status',
            Criticality: criticality,
            CriticalityRepresentation: #WithIcon
        }
    ]
);

// ── Object Page ───────────────────────────────────────────────────────────────

annotate AdminService.Customers with @(
    UI.HeaderInfo: {
        TypeName: 'Customer',
        TypeNamePlural: 'Customers',
        Title: { Value: fullName },
        Description: { Value: email }
    },

    UI.HeaderFacets: [{
        $Type: 'UI.ReferenceFacet',
        Target: '@UI.FieldGroup#Status'
    }],

    UI.FieldGroup #Status: {
        Data: [
            {
                Value: statusCode_code,
                Criticality: criticality,
                CriticalityRepresentation: #WithIcon
            },
            { Value: averageRating },
            { Value: categoryGroup_code }
        ]
    },

    // ── Three Main Tabs ──────────────────────────────────────────────────────
    UI.Facets: [
        {
            $Type: 'UI.CollectionFacet',
            ID: 'CustomerDetails',
            Label: 'Customer Details',
            Facets: [
                {
                    $Type: 'UI.ReferenceFacet',
                    Label: 'General Information',
                    Target: '@UI.FieldGroup#General'
                },
                {
                    $Type: 'UI.ReferenceFacet',
                    Label: 'Loyalty Program',
                    Target: 'loyaltyPrograms/@UI.LineItem'
                }
            ]
        },
        {
            $Type: 'UI.CollectionFacet',
            ID: 'ActivityTab',
            Label: 'Activity',
            Facets: [
                {
                    $Type: 'UI.ReferenceFacet',
                    Label: 'Interaction History',
                    Target: 'interactions/@UI.LineItem'
                },
                {
                    $Type: 'UI.ReferenceFacet',
                    Label: 'Notes',
                    Target: 'notes/@UI.LineItem'
                }
            ]
        },
        {
            $Type: 'UI.CollectionFacet',
            ID: 'FeedbackPreferences',
            Label: 'Feedback & Preferences',
            Facets: [
                {
                    $Type: 'UI.ReferenceFacet',
                    Label: 'Feedback History',
                    Target: 'feedbacks/@UI.LineItem'
                },
                {
                    $Type: 'UI.ReferenceFacet',
                    Label: 'Preferences',
                    Target: 'preferences/@UI.LineItem'
                }
            ]
        }
    ],

    UI.FieldGroup #General: {
        Data: [
            { Value: firstName },
            { Value: lastName },
            { Value: email },
            { Value: phone },
            { Value: statusCode_code },
            { Value: categoryGroup_code },
            { Value: averageRating }
        ]
    }
);

// ── Value Helps ───────────────────────────────────────────────────────────────

annotate AdminService.Customers with {
    statusCode @(
        Common.ValueList: {
            CollectionPath: 'StatusCodes',
            Parameters: [
                { $Type: 'Common.ValueListParameterOut', LocalDataProperty: statusCode_code, ValueListProperty: 'code' },
                { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
            ]
        },
        Common.ValueListWithFixedValues: true
    );
    categoryGroup @(
        Common.ValueList: {
            CollectionPath: 'CategoryGroups',
            Parameters: [
                { $Type: 'Common.ValueListParameterOut', LocalDataProperty: categoryGroup_code, ValueListProperty: 'code' },
                { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
            ]
        },
        Common.ValueListWithFixedValues: true
    );
};

// ── Interaction History Table ─────────────────────────────────────────────────

annotate AdminService.Interactions with @(
    UI.LineItem: [
        { Value: interactionType_code, Label: 'Type' },
        { Value: date,                 Label: 'Date' },
        { Value: method,               Label: 'Method' },
        { Value: summary,              Label: 'Summary' },
        { Value: description,          Label: 'Description' }
    ]
);

annotate AdminService.Interactions with {
    interactionType @(
        Common.ValueList: {
            CollectionPath: 'InteractionTypes',
            Parameters: [
                { $Type: 'Common.ValueListParameterOut', LocalDataProperty: interactionType_code, ValueListProperty: 'code' },
                { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
            ]
        },
        Common.ValueListWithFixedValues: true
    );
};

// ── Feedback Table ────────────────────────────────────────────────────────────

annotate AdminService.Feedbacks with @(
    UI.LineItem: [
        { Value: feedbackDate, Label: 'Date' },
        { Value: rating,       Label: 'Rating' },
        { Value: comments,     Label: 'Comments' }
    ]
);

// ── Preferences Table ─────────────────────────────────────────────────────────

annotate AdminService.Preferences with @(
    UI.LineItem: [
        { Value: productCategory_code, Label: 'Product Category' },
        { Value: notes,                Label: 'Notes' }
    ]
);

annotate AdminService.Preferences with {
    productCategory @(
        Common.ValueList: {
            CollectionPath: 'ProductCategories',
            Parameters: [
                { $Type: 'Common.ValueListParameterOut', LocalDataProperty: productCategory_code, ValueListProperty: 'code' },
                { $Type: 'Common.ValueListParameterDisplayOnly', ValueListProperty: 'name' }
            ]
        },
        Common.ValueListWithFixedValues: true
    );
};

// ── Notes Table ───────────────────────────────────────────────────────────────

annotate AdminService.CustomerNotes with @(
    UI.LineItem: [
        { Value: date,     Label: 'Date' },
        { Value: authorID, Label: 'Author' },
        { Value: content,  Label: 'Note' }
    ]
);

// ── Loyalty Programs Table ────────────────────────────────────────────────────

annotate AdminService.LoyaltyPrograms with @(
    UI.LineItem: [
        { Value: programName,    Label: 'Program' },
        { Value: tierLevel,      Label: 'Tier' },
        { Value: pointsEarned,   Label: 'Points Earned' },
        { Value: pointsRedeemed, Label: 'Points Redeemed' }
    ]
);