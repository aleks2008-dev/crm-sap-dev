using { crm as db } from '../db/schema';

@requires: 'CRM-Admin'
service AdminService @(odata:'/admin', impl: './handlers/customer-handler') {
    @odata.draft.enabled
    entity Customers as projection on db.Customer {
        *,
        statusCode : redirected to StatusCodes,
        statusCode.criticality as criticality,
    };
    entity Interactions as projection on db.Interaction;
    entity Preferences as projection on db.Preference;
    entity Feedbacks as projection on db.Feedback;
    entity StatusCodes as projection on db.CustomerStatusCode;
    entity ProductCategories as projection on db.ProductCategory;

    action updateCustomerStatus(customerID : UUID) returns Boolean;
    action calculateAverageRating(customerID : UUID) returns Decimal(3,2);
}
