using { crm as db } from '../db/schema';

@requires: 'CRM-Support'
service SupportService @(path: '/support') {
    @readonly entity Customers      as projection on db.Customer;
    @readonly entity Interactions   as projection on db.Interaction;
    @readonly entity Feedbacks      as projection on db.Feedback;
    @readonly entity CustomerNotes  as projection on db.CustomerNote;
}
