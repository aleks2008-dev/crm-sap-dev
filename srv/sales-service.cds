using { crm as db } from '../db/schema';

@requires: 'CRM-Sales'
service SalesService @(path: '/sales', impl: './handlers/preference-handler') {
    
    @readonly
    entity Customers as projection on db.Customer excluding { tags };

    entity Interactions as projection on db.Interaction;

    @readonly
    entity Preferences as projection on db.Preference;

    entity Feedbacks as projection on db.Feedback;

    action analyzePreferences(customerID : UUID);
}