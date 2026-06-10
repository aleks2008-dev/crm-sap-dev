using { crm as db } from '../db/schema';

@requires:  'CRM-Sales'
service SalesService {
    @readonly
    entity Customers as projection on db.Customer;

    @requires: 'CRM-Sales'
    entity Interactions as projection on db.Interaction;

    @readonly
    entity Preferences as projection on db.Preference;

    @readonly
    entity Feedbacks as projection on db.Feedback;

    action logInteraction(customerID : UUID);
}