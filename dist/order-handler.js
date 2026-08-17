"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const cds_1 = __importDefault(require("@sap/cds"));
async function default_1() {
    const { Orders, OrderItems } = cds_1.default.entities('crm');
    this.before('SAVE', 'Orders', async (req) => {
        const { ID } = req.data;
        if (!ID)
            return;
        const items = await SELECT.from(OrderItems).where({ order_ID: ID });
        const total = items.reduce((sum, item) => sum + (item.quantity ?? 0) * (item.price ?? 0), 0);
        req.data.totalAmount = Math.round(total * 100) / 100;
    });
    this.on('Orders_changeStatus', 'Orders', async (req) => {
        const { newStatus, comment } = req.data;
        const id = req.params[0].ID;
        const order = await SELECT.one.from(Orders).where({ ID: id });
        if (!order)
            return req.error(404, `Order ${id} not found`);
        const allowed = {
            NEW: ['CONFIRMED', 'CANCELLED'],
            CONFIRMED: ['SHIPPED', 'CANCELLED'],
            SHIPPED: ['DELIVERED'],
            DELIVERED: [],
            CANCELLED: []
        };
        if (!allowed[order.statusCode_code]?.includes(newStatus))
            return req.error(400, `Transition from ${order.statusCode_code} to ${newStatus} is not allowed`);
        await UPDATE(Orders).set({ statusCode_code: newStatus }).where({ ID: id });
        if (comment)
            console.log(`Order ${id} status changed to ${newStatus}. Comment: ${comment}`);
        return SELECT.one.from(Orders).where({ ID: id });
    });
}
