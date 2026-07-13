import cds, { Service, Request } from '@sap/cds';

interface OrderInteraction {
    summary?: string;
    description?: string;
}

function extractProductCategories(orders: OrderInteraction[]): string[] {
    const categories = new Set<string>();
    for (const order of orders) {
        const text = `${order.summary || ''} ${order.description || ''}`.toLowerCase();
        if (text.includes('phone')) categories.add('Smartphones');
        if (text.includes('laptop')) categories.add('Laptops');
    }
    return Array.from(categories);
}

export default async function (this: Service) {
    const { Preference, Interaction } = cds.entities('crm');

    this.before('analyzePreferences', async (req: Request) => {
        if (!req.data.customerID) {
            return req.error(400, 'customerID is a mandatory field for analysis.');
        }
    });

    this.on('analyzePreferences', async (req: Request) => {
        const { customerID } = req.data;

        const orders: OrderInteraction[] = await SELECT.from(Interaction)
            .where({ customer_customerID: customerID, method: 'Order' });

        const categories = extractProductCategories(orders);

        for (const category of categories) {
            await INSERT.into(Preference).entries({
                productCategory_code: category,
                customer_customerID: customerID,
                notes: 'Auto-detected from purchase history'
            });
        }
    });
}