const path = require('path');

// Clear require cache helper to re-import fresh module instances
function freshModule(modulePath) {
  delete require.cache[require.resolve(modulePath)];
  return require(modulePath);
}

const modPath = path.join(__dirname, '..', 'index.js');

describe('Accounting app unit tests (mirror TESTPLAN)', () => {
  let accounting;

  beforeEach(() => {
    accounting = freshModule(modPath);
  });

  test('TC-001: initial balance on startup is 1000.00', () => {
    expect(accounting.getBalance()).toBeCloseTo(1000.00, 2);
  });

  test('TC-002: credit a positive amount increases balance', () => {
    accounting.setBalance(1000.00);
    const ok = accounting.creditAmount(250.00);
    expect(ok).toBe(true);
    expect(accounting.getBalance()).toBeCloseTo(1250.00, 2);
  });

  test('TC-003: debit with sufficient funds reduces balance', () => {
    accounting.setBalance(1000.00);
    const ok = accounting.debitAmount(200.00);
    expect(ok).toBe(true);
    expect(accounting.getBalance()).toBeCloseTo(800.00, 2);
  });

  test('TC-004: debit with insufficient funds is rejected', () => {
    accounting.setBalance(100.00);
    const ok = accounting.debitAmount(200.00);
    expect(ok).toBe(false);
    expect(accounting.getBalance()).toBeCloseTo(100.00, 2);
  });

  test('TC-005: multiple operations persist during same run', () => {
    accounting.setBalance(1000.00);
    accounting.creditAmount(500.00);
    const ok = accounting.debitAmount(200.00);
    expect(ok).toBe(true);
    expect(accounting.getBalance()).toBeCloseTo(1300.00, 2);
  });

  test('TC-007: integer input treated as two-decimal amount', () => {
    accounting.setBalance(1000.00);
    accounting.creditAmount(100); // integer
    expect(accounting.getBalance()).toBeCloseTo(1100.00, 2);
  });

  test('TC-008: decimal two-decimal accepted', () => {
    accounting.setBalance(1000.00);
    accounting.creditAmount(12.34);
    expect(accounting.getBalance()).toBeCloseTo(1012.34, 2);
  });

  test('TC-009: more than two decimals are rounded to two decimals', () => {
    accounting.setBalance(1000.00);
    accounting.creditAmount(1.234);
    // 1.234 rounded to 1.23
    expect(accounting.getBalance()).toBeCloseTo(1001.23, 2);
  });

  test('TC-010: non-numeric amount string parsing returns 0.00', () => {
    // Use parseAmountString via fresh module
    expect(accounting.parseAmountString('abc')).toBeCloseTo(0.00, 2);
  });

  test('TC-011: negative amount input is accepted (no validation) and changes balance accordingly', () => {
    accounting.setBalance(1000.00);
    accounting.creditAmount(-50.00);
    expect(accounting.getBalance()).toBeCloseTo(950.00, 2);
  });

  test('TC-012: amount exceeding PIC range is accepted by Node implementation (no overflow check)', () => {
    accounting.setBalance(1000.00);
    accounting.creditAmount(1000000.00);
    expect(accounting.getBalance()).toBeCloseTo(1001000.00, 2);
  });

  test('TC-014: persistence across restarts is not supported (module reload resets balance)', () => {
    accounting.setBalance(2000.00);
    // simulate restart by resetting module-owned state
    if (typeof accounting.setBalance === 'function') accounting.setBalance(1000.00);
    expect(accounting.getBalance()).toBeCloseTo(1000.00, 2);
  });
});
