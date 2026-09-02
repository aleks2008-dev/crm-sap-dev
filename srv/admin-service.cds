using { crm as db } from '../db/schema';

@requires: 'CRM-Admin'
service AdminService @(odata:'/admin', impl: './handlers/customer-handler') {

    @restrict: [
        { grant: 'READ',                          to: ['CRM-Admin', 'CRM-Sales', 'CRM-Support'] },
        { grant: ['CREATE', 'UPDATE', 'DELETE'],   to: 'CRM-Admin' }
    ]
    @odata.draft.enabled
    entity Customers as projection on db.Customer {
        *,
        statusCode : redirected to StatusCodes,
        statusCode.criticality as criticality,
        categoryGroup : redirected to CategoryGroups,
    } actions {
        @restrict: [{ grant: '*', to: 'CRM-Admin' }]
        action updateCustomerStatus() returns Customers;
    };

    @restrict: [
        { grant: 'READ',                to: ['CRM-Admin', 'CRM-Sales', 'CRM-Support'] },
        { grant: ['CREATE', 'UPDATE'],   to: ['CRM-Admin', 'CRM-Sales'] },
        { grant: 'DELETE',              to: 'CRM-Admin' }
    ]
    entity Interactions as projection on db.Interaction {
        *,
        interactionType : redirected to InteractionTypes,
    };

    @restrict: [
        { grant: 'READ', to: ['CRM-Admin', 'CRM-Sales', 'CRM-Support'] }
    ]
    entity InteractionTypes as projection on db.InteractionType;

    @restrict: [
        { grant: 'READ',                to: ['CRM-Admin', 'CRM-Sales', 'CRM-Support'] },
        { grant: ['CREATE', 'UPDATE', 'DELETE'], to: ['CRM-Admin', 'CRM-Sales'] }
    ]
    entity Preferences as projection on db.Preference {
        *,
        productCategory : redirected to ProductCategories,
    };

    @restrict: [
        { grant: 'READ',                to: ['CRM-Admin', 'CRM-Sales', 'CRM-Support'] },
        { grant: ['CREATE', 'UPDATE'],  to: ['CRM-Admin', 'CRM-Sales'] },
        { grant: 'DELETE',              to: 'CRM-Admin' }
    ]
    entity Feedbacks as projection on db.Feedback;

    @restrict: [
        { grant: 'READ',   to: ['CRM-Admin', 'CRM-Sales', 'CRM-Support'] },
        { grant: '*',      to: 'CRM-Admin' }
    ]
    entity StatusCodes as projection on db.CustomerStatusCode;

    @restrict: [
        { grant: 'READ',   to: ['CRM-Admin', 'CRM-Sales', 'CRM-Support'] },
        { grant: '*',      to: 'CRM-Admin' }
    ]
    entity ProductCategories as projection on db.ProductCategory;

    @restrict: [
        { grant: 'READ',                to: ['CRM-Admin', 'CRM-Sales', 'CRM-Support'] },
        { grant: ['CREATE', 'DELETE'],  to: 'CRM-Admin' }
    ]
    entity CustomerTags as projection on db.CustomerTags;

    @restrict: [
        { grant: 'READ',                to: ['CRM-Admin', 'CRM-Sales'] },
        { grant: ['CREATE', 'DELETE'],  to: 'CRM-Admin' }
    ]
    entity CustomerCampaigns as projection on db.CustomerCampaigns;

    @restrict: [
        { grant: 'READ', to: ['CRM-Admin', 'CRM-Sales'] },
        { grant: '*',    to: 'CRM-Admin' }
    ]
    entity MarketingCampaigns as projection on db.MarketingCampaign;

    @restrict: [
        { grant: 'READ', to: ['CRM-Admin', 'CRM-Sales', 'CRM-Support'] },
        { grant: '*',    to: 'CRM-Admin' }
    ]
    entity Tags as projection on db.CustomerTag;

    @restrict: [
        { grant: 'READ',                          to: ['CRM-Admin', 'CRM-Sales', 'CRM-Support'] },
        { grant: ['CREATE', 'UPDATE', 'DELETE'],   to: 'CRM-Admin' }
    ]
    entity CustomerNotes as projection on db.CustomerNote;

    @restrict: [
        { grant: 'READ',                to: ['CRM-Admin', 'CRM-Sales', 'CRM-Support'] },
        { grant: ['CREATE', 'UPDATE', 'DELETE'], to: 'CRM-Admin' }
    ]
    entity LoyaltyPrograms as projection on db.LoyaltyProgram;

    @restrict: [
        { grant: 'READ', to: ['CRM-Admin', 'CRM-Sales', 'CRM-Support'] },
        { grant: '*',    to: 'CRM-Admin' }
    ]
    entity CategoryGroups as projection on db.CustomerCategoryGroup;

    @restrict: [{ grant: '*', to: ['CRM-Admin', 'CRM-Sales'] }]
    action calculateAverageRating(customerID : UUID) returns Decimal(3,2);
}