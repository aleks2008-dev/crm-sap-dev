using { crm as db } from '../db/schema';

@requires: 'CRM-Admin'
service AdminService @(odata:'/admin', impl: './handlers/customer-handler') {
    entity Customers as projection on db.Customer;
    entity Interactions as projection on db.Interaction;
    entity Preferences as projection on db.Preference;
    entity Feedbacks as projection on db.Feedback;
    entity StatusCodes as projection on db.CustomerStatusCode;

    action updateCustomerStatus(customerID : UUID) returns Boolean;
    action calculateAverageRating(customerID : UUID) returns Decimal(3,2); 
}