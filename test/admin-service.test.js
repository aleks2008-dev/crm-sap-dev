const cds = require('@sap/cds');

const { expect, GET, POST } = cds.test(__dirname + '/..');

const ADMIN = { auth: { username: 'admin' } };

const ALEX_ID = '33333333-3333-3333-3333-333333333333';
const EMMA_ID = '44444444-4444-4444-4444-444444444444';
const JOHN_ID = '55555555-5555-5555-5555-555555555555';
const UNKNOWN_ID = '00000000-0000-0000-0000-000000000000';

describe('Тестирование Сервиса AdminService (CRM)', () => {

    // --- CRUD и валидация ---

    it('должен успешно возвращать список клиентов', async () => {
        const { status, data } = await GET('/admin/Customers', ADMIN);

        expect(status).toBe(200);
        expect(data.value).toBeInstanceOf(Array);
        expect(data.value.length).toBeGreaterThan(0);
        expect(data.value[0]).toHaveProperty('firstName');
        expect(data.value[0]).toHaveProperty('lastName');
    });

    it('должен выдать ошибку 400, если передан некорректный тип данных', async () => {
        let badRequestError;

        try {
            await POST('/admin/Customers', {
                firstName: 'Александр',
                lastName: 'Степков',
                email: 'test@innowise.com',
                averageRating: 'много_текста_вместо_decimal',
            }, ADMIN);
        } catch (error) {
            badRequestError = error;
        }

        expect(badRequestError).toBeDefined();
        expect(badRequestError.statusCode || badRequestError.status).toBe(400);
        expect(badRequestError.message).toContain('is not a valid Decimal');
    });

    it('должен обработать запрос с подменой (mock) данных из БД', async () => {
        const mockCustomers = [{
            customerID: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p',
            firstName: 'Иван',
            lastName: 'Иванов',
        }];
        const dbSpy = jest.spyOn(cds, 'run').mockResolvedValue(mockCustomers);

        const { status, data } = await GET('/admin/Customers', ADMIN);

        expect(status).toBe(200);
        expect(data.value[0].firstName).toBe('Иван');
        expect(data.value[0].lastName).toBe('Иванов');

        dbSpy.mockRestore();
    });

    // --- Business logic: calculateAverageRating ---

    it('calculateAverageRating должен вернуть 4.5 и обновить averageRating клиента', async () => {
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

    it('calculateAverageRating должен вернуть 0, если у клиента нет отзывов', async () => {
        const { status, data } = await POST(
            '/admin/calculateAverageRating',
            { customerID: JOHN_ID },
            ADMIN
        );

        expect(status).toBe(200);
        expect(Number(data.value)).toBe(0);
    });

    // --- Business logic: updateCustomerStatus ---

    it('updateCustomerStatus должен выставить At-Risk при averageRating < 3', async () => {
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

    it('updateCustomerStatus должен вернуть 404 для несуществующего клиента', async () => {
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