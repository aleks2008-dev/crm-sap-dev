const cds = require('@sap/cds');

describe('SalesOrderService Test Suite', () => {
  const { GET, POST, PATCH, expect } = cds.test(__dirname + '/..');

  const ADMIN = { auth: { username: 'admin' } };
  const ORDER_ID = 'c3d5e2a1-0001-4a12-8888-111111111111';
  const ORDER_ID_SHIPPED = 'c3d5e2a1-0003-4a12-8888-333333333333';
  const CUSTOMER_ALEX = '33333333-3333-3333-3333-333333333333';
  const CUSTOMER_JOHN = '55555555-5555-5555-5555-555555555555';

  test('GET /orders/Orders — returns order list', async () => {
    const { status, data } = await GET('/orders/Orders', ADMIN);

    expect(status).toBe(200);
    expect(Array.isArray(data.value)).toBe(true);
    expect(data.value.length).toBeGreaterThan(0);
    expect(data.value[0]).toHaveProperty('statusCode_code');
  });

  test('Orders_changeStatus — allows NEW → CONFIRMED and logs Interaction', async () => {
    const { Interaction } = cds.entities('crm');

    const { status, data } = await POST(
      `/orders/Orders(ID=${ORDER_ID},IsActiveEntity=true)/Orders_changeStatus`,
      { newStatus: 'CONFIRMED', comment: 'Confirmed in test' },
      ADMIN
    );

    expect(status).toBe(200);
    expect(data.statusCode_code).toBe('CONFIRMED');

    const logged = await SELECT.one.from(Interaction).where({
      customer_customerID: CUSTOMER_ALEX,
      summary: 'Order status: CONFIRMED'
    });
    expect(logged).toBeDefined();
    expect(logged.interactionType_code).toBe('Order');
    expect(logged.method).toBe('System');
    expect(logged.description).toContain('Confirmed in test');
  });

  test('PATCH order status — logs Interaction on form update', async () => {
    const { Interaction } = cds.entities('crm');

    const { status } = await PATCH(
      `/orders/Orders(ID=${ORDER_ID_SHIPPED},IsActiveEntity=true)`,
      { statusCode_code: 'DELIVERED' },
      ADMIN
    );

    expect(status).toBe(200);

    const logged = await SELECT.one.from(Interaction).where({
      customer_customerID: CUSTOMER_JOHN,
      summary: 'Order status: DELIVERED'
    });
    expect(logged).toBeDefined();
    expect(logged.description).toContain('SHIPPED');
    expect(logged.description).toContain('DELIVERED');
  });

  test('draft activate new order — logs Interaction', async () => {
    const { Interaction } = cds.entities('crm');
    const customerID = '66666666-6666-6666-6666-666666666666';

    const { status: draftStatus, data: draft } = await POST('/orders/Orders', {
      customer_customerID: customerID,
      statusCode_code: 'NEW',
      orderDate: new Date().toISOString()
    }, ADMIN);

    expect(draftStatus).toBe(201);
    expect(draft.IsActiveEntity).toBe(false);

    const { status: activateStatus } = await POST(
      `/orders/Orders(ID=${draft.ID},IsActiveEntity=false)/SalesOrderService.draftActivate`,
      {},
      ADMIN
    );

    expect(activateStatus).toBe(201);

    const logged = await SELECT.one.from(Interaction).where({
      customer_customerID: customerID,
      summary: { like: 'New order created%' }
    });
    expect(logged).toBeDefined();
    expect(logged.description).toContain(draft.ID);
  });

  test('Orders_changeStatus — rejects invalid transition', async () => {
    let error;
    try {
      await POST(
        `/orders/Orders(ID=${ORDER_ID},IsActiveEntity=true)/Orders_changeStatus`,
        { newStatus: 'DELIVERED' },
        ADMIN
      );
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.status || error.statusCode || error.response?.status).toBe(400);
    expect(error.message).toContain('not allowed');
  });
});
