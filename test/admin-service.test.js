const cds = require('@sap/cds');

// Инициализируем утилиты CAP для нашего проекта
const { expect, GET, POST } = cds.test(__dirname + '/..');

describe('Тестирование Сервиса AdminService (CRM)', () => {
    
    // Тест 1: Проверяем чтение клиентов
    it('должен успешно возвращать список клиентов', async () => {
        const response = await GET('/admin/Customers');
        
        expect(response.status).toBe(200);
        expect(response.data.value).toBeInstanceOf(Array);
        // Проверяем, что данные из crm-Customer.csv успешно загрузились в память
        expect(response.data.value.length).toBeGreaterThan(0);
        
        // Проверяем наличие полей из твоей реальной схемы
        expect(response.data.value[0]).toHaveProperty('firstName');
        expect(response.data.value[0]).toHaveProperty('lastName');
    });

    // Тест 2: Проверяем валидацию структуры данных (OData Validation)
    it('должен выдать ошибку 400, если передан некорректный тип данных', async () => {
        let badRequestError;
        
        try {
            await POST('/admin/Customers', {
                firstName: "Александр",
                lastName: "Степков",
                email: "test@innowise.com",
                averageRating: "много_текста_вместо_decimal" // Это гарантированно ломает валидатор типов
            });
        } catch (error) {
            badRequestError = error;
        }

        // Проверяем, что ошибка перехвачена
        expect(badRequestError).toBeDefined();
        
        // Проверяем, что статус ошибки — 400 (поддерживаем оба возможных свойства для надежности)
        const statusCode = badRequestError.statusCode || badRequestError.status;
        expect(statusCode).toBe(400);
        
        // Проверяем текст ошибки, который нам выдал сервер
        expect(badRequestError.message).toContain('is not a valid Decimal');
    });

    // Тест 3: Проверяем Mocking базы данных
    it('должен обработать запрос с подменой (mock) данных из БД', async () => {
        // Подставляем фейковые данные, соответствующие твоей схеме
        const mockCustomers = [{ customerID: '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', firstName: 'Иван', lastName: 'Иванов' }];
        const dbSpy = jest.spyOn(cds, 'run').mockResolvedValue(mockCustomers);

        const response = await GET('/admin/Customers');

        expect(response.status).toBe(200);
        expect(response.data.value[0].firstName).toBe('Иван');
        expect(response.data.value[0].lastName).toBe('Иванов');

        // Очищаем шпиона
        dbSpy.mockRestore();
    });
});