const cds = require('@sap/cds');

describe('SalesOrderService Test Suite', () => {
  const { GET, POST, PATCH, expect } = cds.test(__dirname + '/..');

  const ADMIN = { auth: { username: 'admin' } };
  const ORDER_ID = 'c3d5e2a1-0001-4a12-8888-111111111111';
  const ORDER_ID_SHIPPED = 'c3d5e2a1-0003-4a12-8888-333333333333';
  const CUSTOMER_ALEX = '33333333-3333-3333-3333-333333333333';
  const CUSTOMER_JOHN = '55555555-5555-5555-5555-555555555555';
  const PART_BRAKE_PADS = 'p1000000-0000-0000-0000-000000000005';

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

  test('CREATE order item — rejects quantity exceeding stock', async () => {
    const customerID = '77777777-7777-7777-7777-777777777777';

    const { data: draft } = await POST('/orders/Orders', {
      customer_customerID: customerID,
      statusCode_code: 'NEW',
      orderDate: new Date().toISOString()
    }, ADMIN);

    let error;
    try {
      await POST(`/orders/Orders(ID=${draft.ID},IsActiveEntity=false)/items`, {
        mechanicalPart_ID: PART_BRAKE_PADS,
        quantity: 100,
        price: 89.99
      }, ADMIN);
    } catch (err) {
      error = err;
    }

    expect(error).toBeDefined();
    expect(error.statusCode || error.status).toBe(400);
    expect(error.message).toContain('Insufficient stock');
  });

  test('CREATE order item — allows quantity within stock', async () => {
    const customerID = '88888888-8888-8888-8888-888888888888';

    const { data: draft } = await POST('/orders/Orders', {
      customer_customerID: customerID,
      statusCode_code: 'NEW',
      orderDate: new Date().toISOString()
    }, ADMIN);

    const { status, data } = await POST(`/orders/Orders(ID=${draft.ID},IsActiveEntity=false)/items`, {
      mechanicalPart_ID: PART_BRAKE_PADS,
      quantity: 2,
      price: 89.99
    }, ADMIN);

    expect(status).toBe(201);
    expect(data.mechanicalPart_ID).toBe(PART_BRAKE_PADS);
    expect(data.quantity).toBe(2);
  });

  test('PATCH draft order item quantity — keeps part and activates order', async () => {
    const { Interaction } = cds.entities('crm');
    const customerID = '66666666-6666-6666-6666-666666666666';
    const PART_OIL_FILTER = 'p1000000-0000-0000-0000-000000000002';

    const { data: draft } = await POST('/orders/Orders', {
      customer_customerID: customerID,
      statusCode_code: 'NEW',
      orderDate: new Date().toISOString()
    }, ADMIN);

    const { data: item } = await POST(`/orders/Orders(ID=${draft.ID},IsActiveEntity=false)/items`, {
      mechanicalPart_ID: PART_OIL_FILTER,
      quantity: 1,
      price: 25.50
    }, ADMIN);

    const { status: patchStatus, data: patched } = await PATCH(
      `/orders/Orders(ID=${draft.ID},IsActiveEntity=false)/items(ID=${item.ID},IsActiveEntity=false)`,
      { price: 23.00 },
      ADMIN
    );

    expect(patchStatus).toBe(200);
    expect(patched.mechanicalPart_ID).toBe(PART_OIL_FILTER);
    expect(patched.price).toBe('23.00');

    const { status: activateStatus } = await POST(
      `/orders/Orders(ID=${draft.ID},IsActiveEntity=false)/SalesOrderService.draftActivate`,
      {},
      ADMIN
    );

    expect(activateStatus).toBe(201);

    const logged = await SELECT.one.from(Interaction).where({
      customer_customerID: customerID,
      summary: { like: 'New order created%' },
      description: { like: `%${draft.ID}%` }
    });
    expect(logged).toBeDefined();
  });
});
