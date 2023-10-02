const Transaction = require('../schemas/transaction.schema');
const mongoose = require("mongoose");
const {getUserBalance, updateUserBalance} = require("./user.controller");
const addTransaction = async (type, category, amount, date, comment, owner) => {
    return Transaction.create({type, category, amount, date, comment, owner});
}

const deleteTransaction = async (transactionId) => {
    const transaction = await getTransactionById(transactionId);
    const type = transaction.type;
    const amount = transaction.amount;
    const owner = transaction.owner;
    let balance = await getUserBalance(owner);
    if (type === 'income') {
        balance -= amount;
    }
    if (type === 'expense') {
        balance += amount;
    }
    await updateUserBalance(owner, balance);
    return Transaction.findOneAndDelete({_id: transactionId})
}

const updateTransaction = async (transactionId, type, category, amount, date, comment, owner) => {
    return Transaction.findOneAndReplace({id: transactionId},{type, category, amount, date, comment, owner});
}

const getTransactionById = async (transactionId) => {
    return Transaction.findOne({_id: transactionId});
}

const getUserTransactions = async (userId) => {
    const userIdToObjectId = new mongoose.Types.ObjectId(userId);
    return Transaction.find({owner: userIdToObjectId});
}

const getUserStatisticsByDate = async (userId, transactionsDate) => {
    const transactions = await getUserTransactions(userId);
    const transactionsFilteredByDate = transactions.filter(transaction => {
        const transactionDate = new Date(transaction.date);
        const transactionYear = transactionDate.getFullYear();
        const transactionMonth = transactionDate.getMonth() + 1;
        const [year, month] = transactionsDate.split('-').map(Number);
        return transactionYear === year && transactionMonth === month;
    });
    let sumOfIncome = 0;
    let sumOfExpense = 0;

    for (const transaction of transactionsFilteredByDate) {
        if (transaction.type === 'income') {
            sumOfIncome += transaction.amount;
        } else if (transaction.type === 'expense') {
            sumOfExpense += transaction.amount;
        }
    }
    return [transactionsFilteredByDate, sumOfIncome, sumOfExpense];
}

module.exports = {
    addTransaction,
    getTransactionById,
    getUsersTransactions: getUserTransactions,
    getUserStatisticsByDate,
    updateTransaction,
    deleteTransaction,
}