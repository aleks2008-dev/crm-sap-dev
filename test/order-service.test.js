const cds = require('@sap/cds');

describe('SalesOrderService Test Suite', () => {
  const { GET, POST, expect } = cds.test(__dirname + '/..');

  const ADMIN = { auth: { username: 'admin' } };
  const ORDER_ID = 'c3d5e2a1-0001-4a12-8888-111111111111';

  test('GET /orders/Orders — returns order list', async () => {
    const { status, data } = await GET('/orders/Orders', ADMIN);

    expect(status).toBe(200);
    expect(Array.isArray(data.value)).toBe(true);
    expect(data.value.length).toBeGreaterThan(0);
    expect(data.value[0]).toHaveProperty('statusCode_code');
  });

  test('Orders_changeStatus — allows NEW → CONFIRMED', async () => {
    const { status, data } = await POST(
      `/orders/Orders(ID=${ORDER_ID},IsActiveEntity=true)/Orders_changeStatus`,
      { newStatus: 'CONFIRMED', comment: 'Confirmed in test' },
      ADMIN
    );

    expect(status).toBe(200);
    expect(data.statusCode_code).toBe('CONFIRMED');
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
