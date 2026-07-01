namespace crm;


entity CustomerStatusCode {
    key code : String(20);
    description : String (100);
    colorCode : String(7);
}

entity Customer {
    key customerID : UUID;
    firstName : String(50);
    lastName : String(50);
    email : String(100);
    phone : String(20);
    statusCode : Association to CustomerStatusCode;
    averageRating : Decimal(3,2);

    interactions: Composition of many Interaction on interactions.customer = $self;
    preferences: Association to many Preference on preferences.customer = $self;
    feedbacks: Composition of many Feedback on feedbacks.customer = $self;
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

entity MarketingCampaign {
    key campaignID : UUID;
    name : String (100);
    startDate : Date;
    endDate : Date;
    description : String (500);
    customer : Association to crm.Customer;
}

entity LoyaltyProgram {
    key loyaltyProgramID : UUID;
    programName : String(50);
    pointsEarned : Integer;
    pointsRedeemed : Integer;
    tierLevel : String(20);
    customer : Association to Customer;
}