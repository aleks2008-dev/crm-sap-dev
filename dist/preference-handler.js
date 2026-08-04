"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const cds_1 = __importDefault(require("@sap/cds"));
function extractProductCategories(orders) {
    const categories = new Set();
    for (const order of orders) {
        const text = `${order.summary || ''} ${order.description || ''}`.toLowerCase();
        if (text.includes('phone'))
            categories.add('Smartphones');
        if (text.includes('laptop'))
            categories.add('Laptops');
    }
    return Array.from(categories);
}
async function default_1() {
    const { Preference, Interaction } = cds_1.default.entities('crm');
    this.before('analyzePreferences', async (req) => {
        if (!req.data.customerID) {
            return req.error(400, 'customerID is a mandatory field for analysis.');
        }
    });
    this.on('analyzePreferences', async (req) => {
        const { customerID } = req.data;
        try {
            const orders = await SELECT.from(Interaction)
                .where({ customer_customerID: customerID, method: 'Order' });
            const categories = extractProductCategories(orders);
            for (const category of categories) {
                await INSERT.into(Preference).entries({
                    productCategory_code: category,
                    customer_customerID: customerID,
                    notes: 'Auto-detected from purchase history'
                });
            }
        }
        catch (error) {
            console.error('Error analyzing preferences:', error);
            return req.error(500, 'Failed to analyze customer preferences.');
        }
    });
}
