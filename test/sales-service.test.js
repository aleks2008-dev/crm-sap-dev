const cds = require('@sap/cds');

describe('CRM Sales Service Test Suite', () => {
  const { GET, POST, expect } = cds.test(__dirname + '/..');

  let customerId;

  beforeAll(async () => {
    const { Customer } = cds.entities('crm');

    customerId = cds.utils.uuid();

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
      expect(response.status).toBe(200);
      expect(Array.isArray(response.data.value)).toBe(true);

      const testCustomer = response.data.value.find(c => c.customerID === customerId);
      expect(testCustomer).toBeDefined();
      expect(testCustomer.firstName).toBe('Alex');
    });

    test('POST /sales/Customers - Should block creation since entity is @readonly', async () => {
      let error;
      try {
        await POST('/sales/Customers', {
          customerID: cds.utils.uuid(),
          firstName: 'Unauthorized',
          lastName: 'User'
        });
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect([403, 405]).toContain(error.response.status);
    });
  });

  describe('Action: analyzePreferences', () => {
    test('POST /sales/analyzePreferences - Should automatically detect categories from orders', async () => {
      const { Interaction, Preference } = cds.entities('crm');

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
          method: 'Call',
          summary: 'Phone inquiry regarding shipment status',
          customer_customerID: customerId
        }
      ]);

      const response = await POST('/sales/analyzePreferences', { customerID: customerId });
      expect([200, 204]).toContain(response.status);

      const preferences = await SELECT.from(Preference).where({ customer_customerID: customerId });
      expect(preferences.length).toBe(2);

      const productCategories = preferences.map(p => p.productCategory);
      expect(productCategories).toContain('Smartphones');
      expect(productCategories).toContain('Laptops');
      expect(preferences[0].notes).toBe('Auto-detected from purchase history');
    });
  });
});
