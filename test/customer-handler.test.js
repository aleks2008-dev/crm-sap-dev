const cds = require('@sap/cds');

describe('Customer Handler Test Suite', () => {
  const { POST, PATCH, expect } = cds.test(__dirname + '/..');

  let customerId;

  const updateCustomerStatus = (customerID) =>
    POST(
      `/admin/Customers(customerID=${customerID},IsActiveEntity=true)/AdminService.updateCustomerStatus`,
      {}
    );

  beforeAll(async () => {
    const { Customer, Feedback, Interaction } = cds.entities('crm');
    customerId = cds.utils.uuid();

    await INSERT.into(Customer).entries([{
      customerID: customerId,
      firstName: 'Test',
      lastName: 'Customer',
      email: 'test.customer@example.com',
      averageRating: 4.0
    }]);

    await INSERT.into(Feedback).entries([
      { feedbackID: cds.utils.uuid(), rating: 5, comments: 'Great!', customer_customerID: customerId },
      { feedbackID: cds.utils.uuid(), rating: 3, comments: 'OK',     customer_customerID: customerId }
    ]);

    await INSERT.into(Interaction).entries([{
      interactionID: cds.utils.uuid(),
      method: 'Call',
      summary: 'Recent call',
      date: new Date().toISOString(),
      customer_customerID: customerId
    }]);
  });

  describe('Action: calculateAverageRating', () => {
    test('returns correct average for existing feedbacks', async () => {
      const res = await POST('/admin/calculateAverageRating', { customerID: customerId });
      expect(res.status).toBe(200);
      expect(res.data.value).toBe(4); // (5+3)/2
    });

    test('returns 0 when no feedbacks exist', async () => {
      const emptyId = cds.utils.uuid();
      const { Customer } = cds.entities('crm');
      await INSERT.into(Customer).entries([{
        customerID: emptyId, firstName: 'Empty', lastName: 'User', email: 'empty@example.com'
      }]);
      const res = await POST('/admin/calculateAverageRating', { customerID: emptyId });
      expect(res.status).toBe(200);
      expect(res.data.value).toBe(0);
    });
  });

  describe('after SAVE Customers', () => {
    test('recalculates averageRating when feedback is added', async () => {
      const { Customer, Feedback } = cds.entities('crm');
      const saveId = cds.utils.uuid();
      const ADMIN = { auth: { username: 'admin' } };

      await INSERT.into(Customer).entries({
        customerID: saveId,
        firstName: 'Save',
        lastName: 'Test',
        email: 'save.test@example.com',
        averageRating: 4.0,
        statusCode_code: 'Active'
      });
      await INSERT.into(Feedback).entries([
        { ID: cds.utils.uuid(), rating: 5, comments: 'Great!', customer_customerID: saveId },
        { ID: cds.utils.uuid(), rating: 3, comments: 'Okay enough', customer_customerID: saveId }
      ]);

      await PATCH(`/admin/Customers(${saveId})`, { phone: '+100' }, ADMIN);

      let updated = await SELECT.one.from(Customer).where({ customerID: saveId });
      expect(Number(updated.averageRating)).toBe(4);

      await INSERT.into(Feedback).entries({
        ID: cds.utils.uuid(),
        rating: 1,
        comments: 'Poor experience here',
        customer_customerID: saveId
      });

      await PATCH(`/admin/Customers(${saveId})`, { phone: '+101' }, ADMIN);

      updated = await SELECT.one.from(Customer).where({ customerID: saveId });
      expect(Number(updated.averageRating)).toBe(3);
    });
  });

  describe('Action: updateCustomerStatus', () => {
    test('sets Active when recent interaction exists and rating >= 3', async () => {
      const res = await updateCustomerStatus(customerId);
      expect(res.status).toBe(200);
      expect(res.data.statusCode_code).toBe('Active');

      const { Customer } = cds.entities('crm');
      const updated = await SELECT.one.from(Customer).where({ customerID: customerId });
      expect(updated.statusCode_code).toBe('Active');
    });

    test('sets At-Risk when averageRating < 3', async () => {
      const atRiskId = cds.utils.uuid();
      const { Customer, Feedback } = cds.entities('crm');
      await INSERT.into(Customer).entries([{
        customerID: atRiskId, firstName: 'AtRisk', lastName: 'User',
        email: 'atrisk@example.com', averageRating: 2.0
      }]);
      await INSERT.into(Feedback).entries([{
        ID: cds.utils.uuid(), rating: 2, comments: 'Not good enough', customer_customerID: atRiskId
      }]);
      const res = await updateCustomerStatus(atRiskId);
      expect(res.status).toBe(200);
      const updated = await SELECT.one.from(Customer).where({ customerID: atRiskId });
      expect(updated.statusCode_code).toBe('At-Risk');
    });

    test('sets Inactive when no recent interaction and rating >= 3', async () => {
      const inactiveId = cds.utils.uuid();
      const { Customer } = cds.entities('crm');
      await INSERT.into(Customer).entries([{
        customerID: inactiveId, firstName: 'Inactive', lastName: 'User',
        email: 'inactive@example.com', averageRating: 4.0
      }]);
      const res = await updateCustomerStatus(inactiveId);
      expect(res.status).toBe(200);
      const updated = await SELECT.one.from(Customer).where({ customerID: inactiveId });
      expect(updated.statusCode_code).toBe('Inactive');
    });

    test('returns 404 for non-existent customer', async () => {
      let error;
      try {
        await updateCustomerStatus(cds.utils.uuid());
      } catch (err) {
        error = err;
      }
      expect(error).toBeDefined();
      expect(error.response.status).toBe(404);
    });
  });

});
