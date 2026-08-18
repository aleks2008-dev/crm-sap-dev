"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const cds = require("@sap/cds");

const INTERACTION_TYPE_ORDER = 'Order';
const INTERACTION_METHOD_SYSTEM = 'System';

async function logOrderInteraction(Interaction, customerID, summary, description = '') {
    await INSERT.into(Interaction).entries({
        date: new Date().toISOString(),
        interactionType_code: INTERACTION_TYPE_ORDER,
        method: INTERACTION_METHOD_SYSTEM,
        summary,
        description,
        customer_customerID: customerID
    });
}

async function loadOrder(Orders, orderID) {
    return SELECT.one.from(Orders).where({ ID: orderID });
}

function orderIDFrom(req, data) {
    return data?.ID ?? req.params?.[0]?.ID ?? req.data?.ID;
}

module.exports = async function () {
    const { Orders, OrderItems } = this.entities;
    const { MechanicalParts, Interaction } = cds.entities('crm');

    this.before('SAVE', 'Orders', async (req) => {
        const { ID } = req.data;
        if (!ID) return;

        const items = await SELECT.from(OrderItems).where({ order_ID: ID });
        const total = items.reduce((sum, item) => sum + (item.quantity ?? 0) * (item.price ?? 0), 0);
        req.data.totalAmount = Math.round(total * 100) / 100;
    });

    this.before('UPDATE', 'Orders', async (req) => {
        const ID = orderIDFrom(req, req.data);
        if (!ID || req.data.statusCode_code === undefined) return;

        const existing = await SELECT.one.from(Orders).where({ ID });
        if (existing) req._previousStatus = existing.statusCode_code;
    });

    this.after('CREATE', 'Orders', async (data, req) => {
        if (data.IsActiveEntity === false) return;

        const ID = orderIDFrom(req, data);
        if (!ID) return;

        const order = await loadOrder(Orders, ID);
        if (!order?.customer_customerID) return;

        const amount = order.totalAmount != null ? ` (total: ${order.totalAmount})` : '';
        await logOrderInteraction(
            Interaction,
            order.customer_customerID,
            `New order created${amount}`,
            `Order ID: ${order.ID}`
        );
    });

    this.after('UPDATE', 'Orders', async (data, req) => {
        const ID = orderIDFrom(req, data);
        if (!ID) return;

        const order = await loadOrder(Orders, ID);
        if (!order?.customer_customerID) return;

        if (req._previousStatus !== undefined && req._previousStatus !== order.statusCode_code) {
            await logOrderInteraction(
                Interaction,
                order.customer_customerID,
                `Order status: ${order.statusCode_code}`,
                `Status changed from ${req._previousStatus} to ${order.statusCode_code}`
            );
        }
    });

    this.on('CREATE', 'OrderItems', async (req, next) => {
        const item = await next();
        const data = item ?? req.data;
        const orderID = data.order_ID ?? data.order?.ID;
        if (!orderID) return item;

        const order = await loadOrder(Orders, orderID);
        if (!order?.customer_customerID) return item;

        let partLabel = 'part';
        if (data.mechanicalPart_ID) {
            const part = await SELECT.one.from(MechanicalParts).where({ ID: data.mechanicalPart_ID });
            partLabel = part?.name || data.mechanicalPart_ID;
        }

        await logOrderInteraction(
            Interaction,
            order.customer_customerID,
            'Order item added',
            `Order ${orderID}: ${partLabel}, qty ${data.quantity ?? 0}, price ${data.price ?? 0}`
        );

        return item;
    });

    this.on('Orders_changeStatus', 'Orders', async (req) => {
        const { newStatus, comment } = req.data;
        const id = req.params[0].ID;

        const order = await SELECT.one.from(Orders).where({ ID: id });
        if (!order) return req.error(404, `Order ${id} not found`);

        const allowed = {
            NEW:        ['CONFIRMED', 'CANCELLED'],
            CONFIRMED:  ['SHIPPED', 'CANCELLED'],
            SHIPPED:    ['DELIVERED'],
            DELIVERED:  [],
            CANCELLED:  []
        };

        if (!allowed[order.statusCode_code]?.includes(newStatus))
            return req.error(400, `Transition from ${order.statusCode_code} to ${newStatus} is not allowed`);

        const previousStatus = order.statusCode_code;
        await UPDATE(Orders).set({ statusCode_code: newStatus }).where({ ID: id });

        if (order.customer_customerID) {
            const description = comment
                ? `Status changed from ${previousStatus} to ${newStatus}. Comment: ${comment}`
                : `Status changed from ${previousStatus} to ${newStatus}`;
            await logOrderInteraction(
                Interaction,
                order.customer_customerID,
                `Order status: ${newStatus}`,
                description
            );
        }

        return SELECT.one.from(Orders).where({ ID: id });
    });
};
