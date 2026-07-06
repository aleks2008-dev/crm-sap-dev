const cds = require('@sap/cds');

describe('CRM Sales Service Test Suite', () => {
  // Инициализируем тестовую среду CAP для текущего проекта
  const { GET, POST, expect } = cds.test(__dirname + '/..');

  let customerId;

  beforeAll(async () => {
    const { Customer } = cds.entities('crm');

    // Генерируем уникальный UUID для тестового клиента
    customerId = cds.utils.uuid();

    // Наполняем базу данных начальными тестовыми данными
    await INSERT.into(Customer).entries([
      {
        customerID: customerId,
        firstName: 'Alex',
        lastName: 'Smirnov',
        email: 'alex.smirnov@example.com',
        averageRating: 4.5
      }
    ]);
  });

  describe('Entity Operations & Authorizations', () => {
    test('GET /sales/Customers - Should fetch customers list (Readonly check)', async () => {
      const response = await GET('/sales/Customers');
      expect(response.status).to.equal(200);
      expect(response.data.value).to.be.an('array');
      
      const testCustomer = response.data.value.find(c => c.customerID === customerId);
      expect(testCustomer).to.exist;
      expect(testCustomer.firstName).to.equal('Alex');
    });

    test('POST /sales/Customers - Should block creation since entity is @readonly', async () => {
      try {
        await POST('/sales/Customers', {
          customerID: cds.utils.uuid(),
          firstName: 'Unauthorized',
          lastName: 'User'
        });
        expect.fail('Should not allow POST on a readonly entity');
      } catch (err) {
        // Ожидаем ошибку 403 Forbidden или 405 Method Not Allowed из-за @readonly
        expect(err.response.status).to.be.oneOf([403, 405]);
      }
    });
  });

  describe('Action: analyzePreferences', () => {
    test('POST /sales/analyzePreferences - Should automatically detect categories from orders', async () => {
      const { Interaction, Preference } = cds.entities('crm');

      // 1. Создаем интеракции с типом 'Order', содержащие ключевые слова в описании/теме
      await INSERT.into(Interaction).entries([
        {
          interactionID: cds.utils.uuid(),
          method: 'Order',
          summary: 'Purchased a brand new phone',
          description: 'Client chose the latest iOS smartphone model',
          customer_customerID: customerId
        },
        {
          interactionID: cds.utils.uuid(),
          method: 'Order',
          summary: 'Looking for a powerful laptop',
          description: 'Ordered a developer laptop upgrade',
          customer_customerID: customerId
        },
        {
          interactionID: cds.utils.uuid(),
          method: 'Call', // Метод не 'Order', должен игнорироваться парсером
          summary: 'Phone inquiry regarding shipment status',
          customer_customerID: customerId
        }
      ]);

      // 2. Вызываем кастомное действие analyzePreferences через SalesService API
      const response = await POST('/sales/analyzePreferences', { customerID: customerId });
      
      // Согласно спецификации handler'а, действие выполняет INSERT и завершается (status 204 No Content или 200)
      expect(response.status).to.be.oneOf([200, 204]);

      // 3. Проверяем, что в базе данных создались правильные предпочтения
      const preferences = await SELECT.from(Preference).where({ customer_customerID: customerId });
      
      // Ожидаем ровно 2 категории ('Smartphones' и 'Laptops')
      expect(preferences.length).to.equal(2);

      const productCategories = preferences.map(p => p.productCategory);
      expect(productCategories).to.include('Smartphones');
      expect(productCategories).to.include('Laptops');

      // Проверяем автоматическую подпись обработчика
      expect(preferences[0].notes).to.equal('Auto-detected from purchase history');
    });
  });
});