import cds, { Service, Request } from '@sap/cds';

export default async function (this: Service) {
    const { Orders } = cds.entities('crm');

    this.on('changeOrderStatus', 'Orders', async (req: Request) => {
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
