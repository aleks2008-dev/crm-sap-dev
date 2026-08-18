import cds, { Service, Request } from '@sap/cds';

const CUSTOMER_STATUS = {
    AT_RISK: 'At-Risk',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive'
} as const;

const INTERACTION_TYPE = {
    FEEDBACK: 'Feedback'
} as const;

type FeedbackRow = { rating?: number | null; comments?: string | null };

function validateFeedback(feedback: FeedbackRow, req: Request) {
    if (feedback.rating !== undefined && feedback.rating !== null) {
        if (feedback.rating < 1 || feedback.rating > 5) {
            return req.error(400, 'The rating must be between 1 and 5.', 'in/feedbacks');
        }
    }
    if (typeof feedback.comments === 'string') {
        const trimmedComment = feedback.comments.trim();
        if (trimmedComment.length > 0 && trimmedComment.length < 5) {
            return req.error(400, 'The comment must contain at least 5 characters.', 'in/feedbacks');
        }
    }
}

function averageFromFeedbacks(feedbacks: FeedbackRow[]) {
    let totalRating = 0;
    let validFeedbackCount = 0;

    for (const f of feedbacks) {
        if (f.rating !== undefined && f.rating !== null) {
            totalRating += f.rating;
            validFeedbackCount++;
        }
    }

    return validFeedbackCount === 0 ? 0 : totalRating / validFeedbackCount;
}

async function resolveTargetStatus(customerID: string, avgRating: number, Interaction: any) {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentInteraction = await SELECT.one.from(Interaction)
        .where({ customer_customerID: customerID })
        .and(`date >= '${sixMonthsAgo.toISOString()}'`);

    if (avgRating > 0 && avgRating < 3.0) return CUSTOMER_STATUS.AT_RISK;
    if (recentInteraction) return CUSTOMER_STATUS.ACTIVE;
    return CUSTOMER_STATUS.INACTIVE;
}

async function recalculateCustomerMetrics(
    customerID: string,
    entities: { Customer: any; Feedback: any; Interaction: any }
) {
    const { Customer, Feedback, Interaction } = entities;
    const feedbacks = await SELECT.from(Feedback).where({ customer_customerID: customerID });
    const avgRating = averageFromFeedbacks(feedbacks);
    const targetStatus = await resolveTargetStatus(customerID, avgRating, Interaction);

    await UPDATE(Customer).set({
        averageRating: avgRating,
        statusCode_code: targetStatus
    }).where({ customerID });

    return { avgRating, targetStatus };
}

async function logFeedbackInteractions(
    customerID: string,
    entities: { Feedback: any; Interaction: any }
) {
    const { Feedback, Interaction } = entities;
    const activeFeedbacks = await SELECT.from(Feedback).where({ customer_customerID: customerID });

    for (const feedback of activeFeedbacks) {
        const exists = await SELECT.one.from(Interaction).where({
            customer_customerID: customerID,
            description: feedback.comments || '',
            interactionType_code: INTERACTION_TYPE.FEEDBACK
        });

        if (!exists) {
            await INSERT.into(Interaction).entries({
                date: new Date().toISOString(),
                interactionType_code: INTERACTION_TYPE.FEEDBACK,
                method: INTERACTION_TYPE.FEEDBACK,
                summary: `Feedback submitted with rating ${feedback.rating}`,
                description: feedback.comments || '',
                customer_customerID: customerID
            });
        }
    }
}

export default async function (this: Service) {
    const entities = cds.entities('crm');
    const { Customer, Feedback, Interaction } = entities;

    this.before('SAVE', 'Customers', async (req: Request) => {
        const { customerID } = req.data;
        if (!customerID) return;

        try {
            const payloadFeedbacks: FeedbackRow[] = Array.isArray(req.data.feedbacks)
                ? req.data.feedbacks
                : [];

            for (const feedback of payloadFeedbacks) {
                const err = validateFeedback(feedback, req);
                if (err) return err;
            }
        } catch (error) {
            console.error('Error validating feedback:', error);
            return req.error(500, 'Failed to validate customer feedback.');
        }
    });

    const afterCustomerPersisted = async (data: any, req?: Request) => {
        const customerID = data.customerID ?? req?.params?.[0]?.customerID;
        if (!customerID) return;

        try {
            await logFeedbackInteractions(customerID, { Feedback, Interaction });
            await recalculateCustomerMetrics(customerID, { Customer, Feedback, Interaction });
        } catch (error) {
            console.error('Error updating customer after save:', error);
        }
    };

    this.after('SAVE', 'Customers', afterCustomerPersisted);
    this.after('UPDATE', 'Customers', afterCustomerPersisted);
    this.after('CREATE', 'Customers', afterCustomerPersisted);

    const afterFeedbackChanged = async (data: any) => {
        const customerID = data.customer_customerID;
        if (!customerID) return;

        try {
            await logFeedbackInteractions(customerID, { Feedback, Interaction });
            await recalculateCustomerMetrics(customerID, { Customer, Feedback, Interaction });
        } catch (error) {
            console.error('Error updating customer after feedback change:', error);
        }
    };

    this.before('CREATE', 'Feedbacks', async (req: Request) => {
        const err = validateFeedback(req.data, req);
        if (err) return err;
    });

    this.before('UPDATE', 'Feedbacks', async (req: Request) => {
        const err = validateFeedback(req.data, req);
        if (err) return err;
    });

    this.after('CREATE', 'Feedbacks', afterFeedbackChanged);
    this.after('UPDATE', 'Feedbacks', afterFeedbackChanged);
    this.after('DELETE', 'Feedbacks', afterFeedbackChanged);

    this.on('calculateAverageRating', async (req: Request) => {
        const { customerID } = req.data;

        try {
            const { avgRating } = await recalculateCustomerMetrics(customerID, { Customer, Feedback, Interaction });
            return avgRating;
        } catch (error) {
            console.error('Error recalculating average rating:', error);
            return req.error(500, 'Failed to recalculate average rating.');
        }
    });

    this.on('updateCustomerStatus', async (req: Request) => {
        const { customerID } = req.data;

        try {
            const customer = await SELECT.one.from(Customer).where({ customerID });
            if (!customer) return req.error(404, `Customer with ID ${customerID} not found`);

            const { targetStatus } = await recalculateCustomerMetrics(customerID, { Customer, Feedback, Interaction });
            return targetStatus === customer.statusCode_code || true;
        } catch (error) {
            console.error('Error updating customer status:', error);
            return req.error(500, 'Failed to update customer status.');
        }
    });
}
