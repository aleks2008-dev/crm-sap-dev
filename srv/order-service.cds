using { crm as my } from '../db/schema';

service SalesOrderService {
    @odata.draft.enabled
    entity Orders as projection on my.Orders;
    
    entity OrderItems as projection on my.OrderItems;
    entity MechanicalParts as projection on my.MechanicalParts;
    
    @readonly 
    entity OrderStatusCodes as projection on my.OrderStatusCodes;
}