const cds = require('@sap/cds');

const { expect, GET, POST } = cds.test(__dirname + '/..');

const ADMIN = { auth: { username: 'admin' } };

const ALEX_ID = '33333333-3333-3333-3333-333333333333';
const EMMA_ID = '44444444-4444-4444-4444-444444444444';
const JOHN_ID = '55555555-5555-5555-5555-555555555555';
const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000';

describe('AdminService (CRM) Test Suite', () => {

    // --- CRUD and validation ---

    it('returns customer list successfully', async () => {
        const { status, data } = await GET('/admin/Customers', ADMIN);

        expect(status).toBe(200);
        expect(data.value).toBeInstanceOf(Array);
        expect(data.value.length).toBeGreaterThan(0);
        expect(data.value[0]).toHaveProperty('firstName');
        expect(data.value[0]).toHaveProperty('lastName');
    });

    it('returns 400 when invalid data types are submitted', async () => {
        let badRequestError;

        try {
            await POST('/admin/Customers', {
                firstName: 'Alexander',
                lastName: 'Stepkov',
                email: 'test@innowise.com',
                averageRating: 'not_a_decimal',
            }, ADMIN);
        } catch (error) {
            badRequestError = error;
        }

        expect(badRequestError).toBeDefined();
        expect(badRequestError.statusCode || badRequestError.status).toBe(400);
        expect(badRequestError.message).toContain('is not a valid Decimal');
    });

    it('handles mocked database responses', async () => {
        const mockCustomers = [{
            customerID: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
            firstName: 'Ivan',
            lastName: 'Ivanov',
        }];
        const dbSpy = jest.spyOn(cds, 'run').mockResolvedValue(mockCustomers);

        const { status, data } = await GET('/admin/Customers', ADMIN);

        expect(status).toBe(200);
        expect(data.value[0].firstName).toBe('Ivan');
        expect(data.value[0].lastName).toBe('Ivanov');

        dbSpy.mockRestore();
    });

    // --- Business logic: calculateAverageRating ---

    it('calculateAverageRating returns 4.5 and updates customer averageRating', async () => {
        const { status, data } = await POST(
            '/admin/calculateAverageRating',
            { customerID: ALEX_ID },
            ADMIN
        );

        expect(status).toBe(200);
        expect(Number(data.value)).toBe(4.5);

        const customer = await GET(`/admin/Customers(${ALEX_ID})`, ADMIN);
        expect(Number(customer.data.averageRating)).toBe(4.5);
    });

    it('calculateAverageRating returns 0 when customer has no feedback', async () => {
        const { status, data } = await POST(
            '/admin/calculateAverageRating',
            { customerID: JOHN_ID },
            ADMIN
        );

        expect(status).toBe(200);
        expect(Number(data.value)).toBe(0);
    });

    // --- Business logic: updateCustomerStatus ---

    it('updateCustomerStatus sets At-Risk when averageRating is below 3', async () => {
        const { status, data } = await POST(
            '/admin/updateCustomerStatus',
            { customerID: EMMA_ID },
            ADMIN
        );

        expect(status).toBe(200);
        expect(data.value).toBe(true);

        const customer = await GET(`/admin/Customers(${EMMA_ID})`, ADMIN);
        expect(customer.data.statusCode_code).toBe('At-Risk');
    });

    it('updateCustomerStatus returns 404 for unknown customer', async () => {
        let notFoundError;

        try {
            await POST(
                '/admin/updateCustomerStatus',
                { customerID: UNKNOWN_ID },
                ADMIN
            );
        } catch (error) {
            notFoundError = error;
        }

        expect(notFoundError).toBeDefined();
        expect(notFoundError.statusCode || notFoundError.status).toBe(404);
        expect(notFoundError.message).toContain('not found');
    });
});
