"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const cds_1 = __importDefault(require("@sap/cds"));
const CUSTOMER_STATUS = {
    AT_RISK: 'At-Risk',
    ACTIVE: 'Active',
    INACTIVE: 'Inactive'
};
const INTERACTION_TYPE = {
    FEEDBACK: 'Feedback'
};
async function default_1() {
    const { Customer, Feedback, Interaction } = cds_1.default.entities('crm');
    this.before('SAVE', 'Customers', async (req) => {
        const { customerID } = req.data;
        if (!customerID)
            return;
        try {
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
            let targetStatus;
            if (avgRating > 0 && avgRating < 3.0) {
                targetStatus = CUSTOMER_STATUS.AT_RISK;
            }
            else if (recentInteraction) {
                targetStatus = CUSTOMER_STATUS.ACTIVE;
            }
            else {
                targetStatus = CUSTOMER_STATUS.INACTIVE;
            }
            req.data.statusCode_code = targetStatus;
        }
        catch (error) {
            console.error('Error calculating rating/status:', error);
            return req.error(500, 'Failed to calculate customer rating and status.');
        }
    });
    this.after('SAVE', 'Customers', async (data) => {
        const { customerID } = data;
        if (!customerID)
            return;
        try {
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
        catch (error) {
            console.error('Error logging interaction after Customer save:', error);
        }
    });
    this.on('calculateAverageRating', async (req) => {
        const { customerID } = req.data;
        try {
            const feedback = await SELECT.from(Feedback).where({ customer_customerID: customerID });
            const avg = feedback.length === 0
                ? 0
                : feedback.reduce((acc, f) => acc + f.rating, 0) / feedback.length;
            await UPDATE(Customer).set({ averageRating: avg }).where({ customerID });
            return avg;
        }
        catch (error) {
            console.error('Error recalculating average rating:', error);
            return req.error(500, 'Failed to recalculate average rating.');
        }
    });
    this.on('updateCustomerStatus', async (req) => {
        const { customerID } = req.data;
        try {
            const customer = await SELECT.one.from(Customer).where({ customerID });
            if (!customer)
                return req.error(404, `Customer with ID ${customerID} not found`);
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
            const recentInteraction = await SELECT.one.from(Interaction)
                .where({ customer_customerID: customerID })
                .and(`date >= '${sixMonthsAgo.toISOString()}'`);
            let targetStatus;
            if (customer.averageRating && customer.averageRating < 3.0) {
                targetStatus = CUSTOMER_STATUS.AT_RISK;
            }
            else if (recentInteraction) {
                targetStatus = CUSTOMER_STATUS.ACTIVE;
            }
            else {
                targetStatus = CUSTOMER_STATUS.INACTIVE;
            }
            await UPDATE(Customer).set({ statusCode_code: targetStatus }).where({ customerID });
            return true;
        }
        catch (error) {
            console.error('Error updating customer status:', error);
            return req.error(500, 'Failed to update customer status.');
        }
    });
}
