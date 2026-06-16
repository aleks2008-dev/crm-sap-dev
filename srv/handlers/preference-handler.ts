import cds from '@sap/cds';

function extractProductCategories(orders: any[]): string[] {
    const categories = new Set<string>();
    for (const order of orders) {
        const text = `${order.summary || ''} ${order.description || ''}`.toLowerCase();
        if (text.includes('phone')) categories.add('Smartphones');
        if (text.includes('laptop')) categories.add('Laptops');
    }
    return Array.from(categories);
}

export default async function (this: any) {
    const { Customer, Preference, Interaction } = cds.entities('crm');

    this.on('analyzePreferences', async (req: any) => {
        const { customerID } = req.data;

        const orders = await SELECT.from(Interaction).where({ customer_customerID: customerID, method: 'Order' });

        const categories = extractProductCategories(orders);

        for (const category of categories) {
            await INSERT.into(Preference).entries({
                productCategory: category,
                customer_customerID: customerID,
                notes: 'Auto-detected from purchase history'
            });
        }
    });
}