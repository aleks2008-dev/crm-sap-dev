using { cuid, managed, sap } from '@sap/cds/common';

namespace crm;


entity CustomerStatusCode : sap.common.CodeList {
    key code        : String(20);
        colorCode   : String(7);
        criticality : Integer;
}

entity CustomerCategoryGroup : sap.common.CodeList {
    key code : String(50);
}

entity InteractionType : sap.common.CodeList {
    key code : String(20);
}

entity ProductCategory : sap.common.CodeList {
    key code : String(50);
}


entity Customer : managed {
    key customerID : UUID;
        @mandatory
        firstName      : String(50);
        @mandatory
        lastName       : String(50);
        fullName       : String = firstName || ' ' || lastName;
        @mandatory
        @assert.unique
        email          : String(100);
        phone          : String(20);
        statusCode     : Association to CustomerStatusCode;
        averageRating  : Decimal(3,2);
        categoryGroup  : Association to CustomerCategoryGroup;

        interactions    : Composition of many Interaction      on interactions.customer = $self;
        preferences     : Association to many Preference        on preferences.customer = $self;
        feedbacks       : Composition of many Feedback          on feedbacks.customer = $self;
        notes           : Composition of many CustomerNote      on notes.customer = $self;
        loyaltyPrograms : Composition of many LoyaltyProgram    on loyaltyPrograms.customer = $self;
        tags            : Association to many CustomerTags      on tags.customer = $self;
}

entity Preference : cuid {
        productCategory : Association to ProductCategory;
        notes           : String(200);
        customer        : Association to Customer;
}

entity Feedback : cuid {
        @mandatory
        @assert.range: [1, 5]
        rating        : Integer;
        comments      : String(500);
        feedbackDate  : DateTime;
        customer      : Association to Customer;
}

entity Interaction : cuid {
        date             : DateTime;
        interactionType  : Association to InteractionType;
        method           : String(30);
        summary          : String(200);
        description      : String(1000);
        customer         : Association to Customer;
}

entity CustomerNote : cuid, managed {
        @mandatory
        content   : String(1000);
        authorID  : String(50);
        date      : DateTime;
        customer  : Association to Customer;
}

entity CustomerTag : cuid {
        @mandatory
        label      : String(50);
        color      : String(7);
        customers  : Association to many CustomerTags on customers.tag = $self;
}

entity CustomerTags : cuid {
        customer : Association to Customer;
        tag      : Association to CustomerTag;
}

entity MarketingCampaign : cuid {
        @mandatory
        name         : String(100);
        startDate    : Date;
        endDate      : Date;
        description  : String(500);
        customers    : Association to many CustomerCampaigns on customers.campaign = $self;
}

entity CustomerCampaigns : cuid {
        customer  : Association to Customer;
        campaign  : Association to MarketingCampaign;
}

entity LoyaltyProgram : cuid {
        programName     : String(50);
        pointsEarned    : Integer;
        pointsRedeemed  : Integer;
        tierLevel       : String(20);
        customer        : Association to Customer;
}


entity Orders : cuid{
    orderDate        : DateTime;
    totalAmount      : Decimal(15, 2);
    statusCode       : Association to OrderStatusCodes;
    
    customer         : Association to Customer; 
    
    items            : Composition of many OrderItems on items.order = $self;
}

entity OrderItems : cuid {
    order            : Association to Orders;
    mechanicalPart   : Association to MechanicalParts;
    quantity         : Integer;
    price            : Decimal(15, 2);
}

entity MechanicalParts : cuid {
    name             : String(100);
    description      : String(255);
    price            : Decimal(15, 2);
    quantityInStock  : Integer;
}

entity OrderStatusCodes {
    key code        : String(20);
        name        : String(50);
        colorCode   : String(7);
        criticality : Integer;
}