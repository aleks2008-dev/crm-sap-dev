namespace crm;


entity CustomerStatusCode {
    key code : String(20);
    description : String (100);
    colorCode : String(7);
    criticality : Integer;
}

entity Customer {
    key customerID : UUID;
    firstName : String(50);
    lastName : String(50);
    email : String(100);
    phone : String(20);
    statusCode : Association to CustomerStatusCode;
    averageRating : Decimal(3,2);
    categoryGroup : String(50);

    interactions: Composition of many Interaction on interactions.customer = $self;
    preferences: Association to many Preference on preferences.customer = $self;
    feedbacks: Composition of many Feedback on feedbacks.customer = $self;
    tags: Association to many CustomerTags on tags.customer = $self;
}

entity Preference {
    key preferenceID : UUID;
    productCategory : String(50);
    notes : String(200);
    customer : Association to Customer;
}

entity Feedback {
    key feedbackID : UUID;
    rating : Integer;
    comments : String(500);
    feedbackDate : DateTime;
    customer : Association to Customer;
}

entity Interaction {
    key interactionID : UUID;
    date : DateTime;
    type : String(20);
    method : String(30);
    summary : String(200);
    description : String(1000);
    customer : Association to Customer;
}

entity CustomerNote {
    key noteID : UUID;
    content : String(1000);
    authorID : String(50);
    date : DateTime;
    customer : Association to Customer;
}

entity CustomerTag {
    key tagID : UUID;
    label : String(50);
    color : String(7);
    customers : Association to many CustomerTags on customers.tag = $self;
}

entity CustomerTags {
    key ID       : UUID;
    customer : Association to Customer;
    tag      : Association to CustomerTag;
}

entity MarketingCampaign {
    key campaignID : UUID;
    name : String (100);
    startDate : Date;
    endDate : Date;
    description : String (500);
    customers : Association to many CustomerCampaigns on customers.campaign = $self;
}

entity CustomerCampaigns {
    key ID        : UUID;
    customer  : Association to Customer;
    campaign  : Association to MarketingCampaign;
}

entity LoyaltyProgram {
    key loyaltyProgramID : UUID;
    programName : String(50);
    pointsEarned : Integer;
    pointsRedeemed : Integer;
    tierLevel : String(20);
    customer : Association to Customer;
}

entity ProductCategory {
    key code : String(50);
    description : String(100);
}