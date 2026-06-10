import cds from '@sap/cds';
import { Feedbacks } from '../../gen/srv/@cds-models/AdminService';

export default async function (this: any) {
    const { Customer, Feedback, Interaction, CustomerStatusCode } = cds.entities ('crm');


    this.on('calculateAverageRating', async (req: any) =>{
        const { customerID } = req.data;
        const feedback = await SELECT.from(Feedback).where({ customer_ID: customerID });

        if (feedback.length === 0) return 0;

        const sum = feedback.reduce((acc: number, f: any) => acc + f.rating, 0);
        const avg = sum / feedback.length;

        await UPDATE(Customer).set({ averageRating: avg }).where({customerID});
        return avg;
    });
}