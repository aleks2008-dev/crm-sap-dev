using { crm as my } from '../db/schema';

@requires: ['CRM-Admin', 'CRM-Sales', 'Warehouse-Manager']
service SalesOrderService @(path: '/orders', impl: './handlers/order-handler') {
    @restrict: [
        { grant: ['READ'],                        to: ['CRM-Admin', 'CRM-Sales', 'Warehouse-Manager'] },
        { grant: ['CREATE', 'UPDATE', 'DELETE'],   to: ['CRM-Admin', 'CRM-Sales'] }
    ]
    @odata.draft.enabled
    entity Orders as projection on my.Orders {
        *,
        statusCode : redirected to OrderStatusCodes,
        statusCode.criticality as criticality
    } actions {
        @restrict: [{ grant: '*', to: ['CRM-Admin', 'CRM-Sales'] }]
        action Orders_changeStatus(newStatus: String(20), comment: String(200)) returns Orders;
    };

    @restrict: [
        { grant: ['READ'],                        to: ['CRM-Admin', 'CRM-Sales', 'Warehouse-Manager'] },
        { grant: ['CREATE', 'UPDATE', 'DELETE'],   to: ['CRM-Admin', 'CRM-Sales'] }
    ]
    entity OrderItems as projection on my.OrderItems;

    @restrict: [
        { grant: 'READ',                          to: ['CRM-Admin', 'CRM-Sales', 'Warehouse-Manager'] },
        { grant: ['CREATE', 'UPDATE', 'DELETE'],   to: ['CRM-Admin', 'Warehouse-Manager'] }
    ]
    entity MechanicalParts as projection on my.MechanicalParts;

    @readonly
    entity OrderStatusCodes as projection on my.OrderStatusCodes;

    @readonly
    entity Customers as projection on my.Customer;
}