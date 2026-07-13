import cds, { Service, Request } from '@sap/cds';


const CUSTOMER_STATUS = {
    AT_RISK: 'At-Risk',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive'
} as const;

const INTERACTION_TYPE = {
    FEEDBACK: 'Feedback'
} as const;

export default async function (this: Service) {
    const { Customer, Feedback, Interaction } = cds.entities('crm');

    this.before('SAVE', 'Customers', async (req: Request) => {
        const { customerID } = req.data;
        if (!customerID) return;

        const drafts = await SELECT.from(Feedback).where({ customer_customerID: customerID });

        let totalRating = 0;
        let validFeedbackCount = 0;

        for (const f of drafts) {
            if (f.rating !== undefined && f.rating !== null) {
                if (f.rating < 1 || f.rating > 5) {
                    return req.error(400, 'The rating must be between 1 and 5.', 'in/feedbacks');
                }
                totalRating += f.rating;
                validFeedbackCount++;
            }
            if (typeof f.comments === 'string') {
                const trimmedComment = f.comments.trim();
                if (trimmedComment.length > 0 && trimmedComment.length < 5) {
                    return req.error(400, 'The comment must contain at least 5 characters.', 'in/feedbacks');
                }
            }
        }

        const avgRating = validFeedbackCount === 0 ? 0 : totalRating / validFeedbackCount;
        req.data.averageRating = avgRating;

        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const recentInteraction = await SELECT.one.from(Interaction)
            .where({ customer_customerID: customerID })
            .and(`date >= '${sixMonthsAgo.toISOString()}'`);

        let targetStatus: string;
        if (avgRating > 0 && avgRating < 3.0) {
            targetStatus = CUSTOMER_STATUS.AT_RISK;
        } else if (recentInteraction) {
            targetStatus = CUSTOMER_STATUS.ACTIVE;
        } else {
            targetStatus = CUSTOMER_STATUS.INACTIVE;
        }

        req.data.statusCode_code = targetStatus;
    });

    this.after('SAVE', 'Customers', async (data: any) => {
        const { customerID } = data;
        if (!customerID) return;

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
    });

    this.on('calculateAverageRating', async (req: Request) => {
        const { customerID } = req.data;
        const feedback = await SELECT.from(Feedback).where({ customer_customerID: customerID });
        const avg = feedback.length === 0 ? 0 : feedback.reduce((acc: number, f: { rating: number }) => acc + f.rating, 0) / feedback.length;
        await UPDATE(Customer).set({ averageRating: avg }).where({ customerID });
        return avg;
    });

}