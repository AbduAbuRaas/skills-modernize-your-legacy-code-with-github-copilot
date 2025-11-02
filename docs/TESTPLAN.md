# Test Plan for COBOL Account Management

This test plan exercises the business logic implemented in the COBOL application in `src/cobol/` (main.cob, operations.cob, data.cob). Use this plan to validate behavior with business stakeholders. Fill in `Actual Result` and `Status` during testing.

Notes:
- The application uses an in-memory `STORAGE-BALANCE` initialized to 1000.00 per run. Tests that depend on specific balances should set the pre-condition by performing the required credit/debit steps or restarting the application.
- Amount fields use PIC 9(6)V99 (max 6 digits before decimal, 2 after).

| Test Case ID | Test Case Description | Pre-conditions | Test Steps | Expected Result | Actual Result | Status (Pass/Fail) | Comments |
|---|---|---|---|---|---|---:|---|
| TC-001 | Verify initial balance on startup | Fresh program start (no prior operations) | 1. Start program. 2. Choose option `1` (View Balance). | Program displays balance = 1000.00 (the value in `STORAGE-BALANCE`). | | | |
| TC-002 | Credit a positive amount increases balance | Start with known balance (e.g., 1000.00) | 1. Start program. 2. Choose `2` (Credit). 3. Enter `250.00`. 4. Choose `1` to view balance. | Program displays new balance = 1250.00. `STORAGE-BALANCE` updated accordingly. | | | |
| TC-003 | Debit with sufficient funds reduces balance | Balance >= debit amount (e.g., 1000.00) | 1. Start program. 2. Choose `3` (Debit). 3. Enter `200.00`. 4. Choose `1` to view balance. | Program subtracts amount and displays new balance = 800.00. `STORAGE-BALANCE` updated accordingly. | | | |
| TC-004 | Debit with insufficient funds is rejected | Balance less than requested debit (e.g., set balance to 100.00) | 1. Start program or set balance to 100.00 via prior steps. 2. Choose `3` (Debit). 3. Enter `200.00`. 4. Observe messages; choose `1` to verify balance. | Program displays message "Insufficient funds for this debit." and balance remains unchanged (100.00). | | | |
| TC-005 | Multiple operations persist during same run | Fresh run | 1. Start program. 2. Credit 500.00. 3. Debit 200.00. 4. View balance. | State persists in-memory during run. Balance reflects cumulative operations (1000 + 500 - 200 = 1300.00). | | | |
| TC-006 | Exit behavior | Running program | 1. Start program. 2. Choose `4` (Exit). | Program displays "Exiting the program. Goodbye!" and terminates. | | | |
| TC-007 | Amount format: integer input (no decimals) | Fresh run | 1. Start program. 2. Choose `2` (Credit). 3. Enter `100` (no decimals). 4. View balance. | Program treats `100` as `100.00` (adds 100.00). Balance updated accordingly. | | | |
| TC-008 | Amount format: decimal input (two decimals) | Fresh run | 1. Start program. 2. Choose `2` (Credit). 3. Enter `12.34`. 4. View balance. | Program accepts two-decimal input and updates balance (1000.00 + 12.34 = 1012.34). | | | |
| TC-009 | Amount format: more than two decimals | Fresh run | 1. Start program. 2. Choose `2` (Credit). 3. Enter `1.234` or `1.2` variations. 4. View balance. | PIC 9(6)V99 stores two decimal places: extra decimals may be truncated or rounded depending on runtime. Record actual observed behavior; if not accepted, note error. | | | |
| TC-010 | Non-numeric amount input | Fresh run | 1. Start program. 2. Choose `2` (Credit). 3. Enter `abc` (or other non-numeric). 4. Observe output and state. | Current implementation has no explicit input validation; behavior is implementation-defined. Record actual behavior (e.g., error, ignored input, or treated as 0). Flag as a validation gap if not rejected. | | | |
| TC-011 | Negative amount input | Fresh run | 1. Start program. 2. Choose `2` or `3`. 3. Enter `-50.00`. 4. Observe output and balance. | Current implementation doesn't validate sign. Record actual behavior. Business decision required: should negative amounts be rejected? | | | |
| TC-012 | Amount exceeds PIC range (overflow) | Fresh run | 1. Start program. 2. Choose `2` (Credit). 3. Enter `1000000.00` (one million). 4. Observe result. | PIC 9(6)V99 maximum is 999999.99. Entering larger values may overflow or be rejected. Record actual behavior and mark as defect if overflow occurs. | | | |
| TC-013 | Operation code exact-match dependency (internal) | N/A | 1. (Developer test) Call `Operations` or `DataProgram` with trimmed vs padded operation strings. | Current code expects 6-character operation codes (space-padded). If callers pass trimmed strings, code may not match and behavior may fail. Record findings and consider normalizing operation codes. | | | |
| TC-014 | Persistence across restarts | Start, perform operations, then restart program | 1. Start program. 2. Credit 100.00. 3. Exit. 4. Start program again. 5. View balance. | Current implementation stores balance in-memory only. After restart, balance returns to initial value 1000.00. Confirm restart resets balance. | | | |
| TC-015 | Concurrent access / multi-user (not supported) | Not applicable (single process) | Attempt to simulate multiple concurrent runs making changes (optional) | Current implementation uses program-local storage and does not support concurrent access or synchronization. Record if any unexpected behavior occurs. | | | |

---

Guidance for testers and stakeholders

- Fill in `Actual Result` and `Status` (Pass/Fail) for each test row during execution.
- For any test where the expected result is marked as "implementation-defined" or a validation gap, record the observed behavior and escalate for a stakeholder decision: either accept the current behavior or update the requirements to mandate validation/limits.
- After stakeholder sign-off on expected behaviors for ambiguous cases (non-numeric, negative, overflow), we can convert these test cases into automated unit and integration tests for the Node.js implementation.

Next steps (recommended)

- Convert deterministic tests (TC-001, TC-002, TC-003, TC-004, TC-005, TC-006, TC-014) into automated integration tests (shell scripts or unit tests) that compile the COBOL program and exercise flows via stdin.
- Define acceptance criteria for input validation (non-numeric, negative) and numeric limits, then add corresponding automated tests.
- While porting to Node.js, keep test IDs stable so test automation can map COBOL behavior to the new implementation.
