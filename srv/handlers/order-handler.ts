import cds, { Service, Request } from '@sap/cds';

export default async function (this: Service) {
    const { Orders, OrderItems } = cds.entities('crm');

    this.before('SAVE', 'Orders', async (req: Request) => {
        const { ID } = req.data;
        if (!ID) return;

        const items = await SELECT.from(OrderItems).where({ order_ID: ID });
        const total = items.reduce((sum: number, item: any) => sum + (item.quantity ?? 0) * (item.price ?? 0), 0);
        req.data.totalAmount = Math.round(total * 100) / 100;
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

        await UPDATE(Orders).set({ statusCode_code: newStatus }).where({ ID: id });

        if (comment) console.log(`Order ${id} status changed to ${newStatus}. Comment: ${comment}`);

        return SELECT.one.from(Orders).where({ ID: id });
    });
}
