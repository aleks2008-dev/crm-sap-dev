"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const cds_1 = __importDefault(require("@sap/cds"));
async function default_1() {
    const entities = cds_1.default.entities('crm');
    const { Orders, OrderItems, MechanicalParts, Interaction } = entities;
    this.before('SAVE', Orders, async (req) => {
        const { orderID } = req.data;
        if (!orderID)
            return;
        const draftItems = await SELECT.from(OrderItems.drafts).where({ order_orderID: orderID });
        let calculatedTotal = 0;
        for (const item of draftItems) {
            const partId = item.mechanicalPart_productID || item.mechanicalPart?.productID;
            if (!partId)
                return req.error(400, 'Spare part ID missing');
            const part = await SELECT.one.from(MechanicalParts).where({ productID: partId });
            if (!part)
                return req.error(404, 'Spare part not found');
            if (part.quantityInStock < item.quantity) {
                return req.error(400, `Insufficient stock. Available: ${part.quantityInStock}`, 'in/items');
            }
            item.price = part.price;
            calculatedTotal += item.quantity * part.price;
        }
        req.data.totalAmount = calculatedTotal;
        req.data.orderDate = new Date().toISOString();
    });
    this.after('SAVE', Orders, async (data) => {
        if (data.customer_customerID) {
            await INSERT.into(Interaction).entries({
                date: new Date().toISOString(),
                method: 'System',
                summary: `New Order Created: ${data.orderID}`,
                customer_customerID: data.customer_customerID
            });
        }
    });
}
