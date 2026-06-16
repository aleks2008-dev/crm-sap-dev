import cds from '@sap/cds';

export default async function (this: any) {
    const { Customer, Feedback } = cds.entities('crm');

    this.on('calculateAverageRating', async (req: any) => {
        const { customerID } = req.data;

        const feedback = await SELECT.from(Feedback).where({ customer_customerID: customerID });

        if (feedback.length === 0) return 0;

        const sum = feedback.reduce((acc: number, f: any) => acc + f.rating, 0);
        const avg = sum / feedback.length;

        await UPDATE(Customer).set({ averageRating: avg }).where({ customerID });
        return avg;
    });


    this.on('updateCustomerStatus', async (req: any) => {
        const { customerID } = req.data;

        const customer = await SELECT.one.from(Customer).where({ customerID });
        if (!customer) return req.error(404, `Customer with ID ${customerID} not found`);

        let targetStatus = 'Active';
        if (customer.averageRating && customer.averageRating < 3.0) {
            targetStatus = 'At-Risk'; 
        }

        await UPDATE(Customer).set({ statusCode_code: targetStatus }).where({ customerID });
        
        return true; 
    });
}