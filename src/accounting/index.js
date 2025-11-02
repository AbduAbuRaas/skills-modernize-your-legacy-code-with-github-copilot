#!/usr/bin/env node
// Simple Node.js port of the COBOL Account Management app
// Preserves original business logic and data flow (in-memory STORAGE-BALANCE)

const prompt = require('prompt-sync')({ sigint: true });

let STORAGE_BALANCE = 1000.00; // initial balance per run (matches data.cob)
let CONTINUE_FLAG = true;

function displayMenu() {
  console.log('--------------------------------');
  console.log('Account Management System');
  console.log('1. View Balance');
  console.log('2. Credit Account');
  console.log('3. Debit Account');
  console.log('4. Exit');
  console.log('--------------------------------');
}

function readChoice() {
  const raw = prompt('Enter your choice (1-4): ');
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? null : n;
}

function parseAmountString(raw) {
  const num = parseFloat(raw);
  if (Number.isNaN(num)) return 0.00;
  return Math.round(num * 100) / 100; // normalize to 2 decimal places
}

function readAmount(promptText) {
  const raw = prompt(promptText);
  return parseAmountString(raw);
}

function viewBalance() {
  console.log('Current balance: ' + STORAGE_BALANCE.toFixed(2));
}

function creditAccount() {
  const amount = readAmount('Enter credit amount: ');
  creditAmount(amount);
}

function debitAccount() {
  const amount = readAmount('Enter debit amount: ');
  return debitAmount(amount);
}

// Testable helpers that perform the core accounting logic using numeric amounts
function creditAmount(amount) {
  const a = Math.round(amount * 100) / 100;
  STORAGE_BALANCE = Math.round((STORAGE_BALANCE + a) * 100) / 100;
  return true;
}

function debitAmount(amount) {
  const a = Math.round(amount * 100) / 100;
  if (STORAGE_BALANCE >= a) {
    STORAGE_BALANCE = Math.round((STORAGE_BALANCE - a) * 100) / 100;
    return true;
  } else {
    return false;
  }
}

function mainLoop() {
  while (CONTINUE_FLAG) {
    displayMenu();
    const choice = readChoice();
    switch (choice) {
      case 1:
        viewBalance();
        break;
      case 2:
        creditAccount();
        break;
      case 3:
        debitAccount();
        break;
      case 4:
        CONTINUE_FLAG = false;
        break;
      default:
        console.log('Invalid choice, please select 1-4.');
    }
  }
  console.log('Exiting the program. Goodbye!');
}

if (require.main === module) {
  mainLoop();
}

module.exports = {
  // exports for potential unit testing in the future
  readAmount,
  viewBalance,
  creditAccount,
  debitAccount,
  // test helpers
  parseAmountString,
  creditAmount,
  debitAmount,
  getBalance: () => STORAGE_BALANCE,
  setBalance: (b) => { STORAGE_BALANCE = Math.round(b * 100) / 100; }
};
