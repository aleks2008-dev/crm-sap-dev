import cds, { Service, Request } from '@sap/cds';

const INTERACTION_TYPE_ORDER = 'Order';
const INTERACTION_METHOD_SYSTEM = 'System';

type OrderRequest = Request & { _previousStatus?: string };

async function logOrderInteraction(
    Interaction: any,
    customerID: string,
    summary: string,
    description = ''
) {
    await INSERT.into(Interaction).entries({
        date: new Date().toISOString(),
        interactionType_code: INTERACTION_TYPE_ORDER,
        method: INTERACTION_METHOD_SYSTEM,
        summary,
        description,
        customer_customerID: customerID
    });
}

async function loadOrder(Orders: any, orderID: string) {
    return SELECT.one.from(Orders).where({ ID: orderID });
}

function orderIDFrom(req: Request, data: any): string | undefined {
    return data?.ID ?? req.params?.[0]?.ID ?? req.data?.ID;
}

async function validateStock(
    mechanicalPart_ID: string | undefined,
    quantity: number | undefined,
    MechanicalParts: any,
    req: Request
) {
    if (!mechanicalPart_ID) {
        return req.error(400, 'Mechanical part is required', 'in/items');
    }
    if (quantity == null || Number(quantity) <= 0) {
        return req.error(400, 'Quantity must be greater than 0', 'in/items');
    }

    const part = await SELECT.one.from(MechanicalParts).where({ ID: mechanicalPart_ID });
    if (!part) {
        return req.error(404, `Part ${mechanicalPart_ID} not found`, 'in/items');
    }

    if (Number(part.quantityInStock) < Number(quantity)) {
        return req.error(
            400,
            `Insufficient stock for "${part.name}". Available: ${part.quantityInStock}`,
            'in/items'
        );
    }
}

async function validateOrderItemsStock(
    items: any[],
    MechanicalParts: any,
    req: Request
) {
    const qtyByPart = new Map<string, number>();

    for (const item of items) {
        if (!item.mechanicalPart_ID) continue;
        qtyByPart.set(
            item.mechanicalPart_ID,
            (qtyByPart.get(item.mechanicalPart_ID) ?? 0) + Number(item.quantity ?? 0)
        );
    }

    for (const [partId, totalQty] of qtyByPart) {
        await validateStock(partId, totalQty, MechanicalParts, req);
    }
}

async function loadOrderItems(
    orderID: string,
    OrderItems: any,
    OrderItemDrafts: any
) {
    const draftItems = OrderItemDrafts
        ? await SELECT.from(OrderItemDrafts).where({ order_ID: orderID })
        : [];

    if (draftItems.length) return draftItems;

    return SELECT.from(OrderItems).where({ order_ID: orderID });
}

async function loadOrderItemByID(
    itemID: string,
    OrderItems: any,
    OrderItemDrafts: any
) {
    if (OrderItemDrafts) {
        const draftItem = await SELECT.one.from(OrderItemDrafts).where({ ID: itemID });
        if (draftItem) return draftItem;
    }

    return SELECT.one.from(OrderItems).where({ ID: itemID });
}

export default async function (this: Service) {
    const { Orders, OrderItems } = this.entities;
    const OrderItemDrafts = (OrderItems as any).drafts;
    const { MechanicalParts, Interaction } = cds.entities('crm');

    this.before('SAVE', 'Orders', async (req: Request) => {
        const { ID } = req.data;
        if (!ID) return;

        const items = await loadOrderItems(ID, OrderItems, OrderItemDrafts);
        await validateOrderItemsStock(items, MechanicalParts, req);

        const total = items.reduce((sum: number, item: any) => sum + (item.quantity ?? 0) * (item.price ?? 0), 0);
        req.data.totalAmount = Math.round(total * 100) / 100;
    });

    const validateOrderItemInput = async (req: Request) => {
        let { mechanicalPart_ID, quantity } = req.data;

        if (req.event === 'UPDATE') {
            const itemID = req.data.ID ?? (req.params?.[0] as any)?.ID;
            if (itemID) {
                const existing = await loadOrderItemByID(itemID, OrderItems, OrderItemDrafts);
                if (existing) {
                    mechanicalPart_ID ??= existing.mechanicalPart_ID;
                    quantity ??= existing.quantity;
                }
            }
        }

        if (!mechanicalPart_ID) return;
        if (quantity == null) return;

        return validateStock(mechanicalPart_ID, quantity, MechanicalParts, req);
    };

    this.before('CREATE', OrderItems, validateOrderItemInput);
    this.before('UPDATE', OrderItems, validateOrderItemInput);
    this.before('CREATE', OrderItemDrafts, validateOrderItemInput);
    this.before('UPDATE', OrderItemDrafts, validateOrderItemInput);

    this.before('UPDATE', 'Orders', async (req: OrderRequest) => {
        const ID = orderIDFrom(req, req.data);
        if (!ID || req.data.statusCode_code === undefined) return;

        const existing = await SELECT.one.from(Orders).where({ ID });
        if (existing) req._previousStatus = existing.statusCode_code;
    });

    this.after('CREATE', 'Orders', async (data: any, req: Request) => {
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

    this.after('UPDATE', 'Orders', async (data: any, req: OrderRequest) => {
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

    this.on('Orders_changeStatus', 'Orders', async (req: Request) => {
        const { newStatus, comment } = req.data;
        const id = (req.params[0] as any).ID;

        const order = await SELECT.one.from(Orders).where({ ID: id });
        if (!order) return req.error(404, `Order ${id} not found`);

        const allowed: Record<string, string[]> = {
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
}
