import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionsRepository = getRepository(Transaction);

    const transactions = await transactionsRepository.find();

    let income = 0;
    let outcome = 0;
    let total = 0;

    transactions.map(transaction => {
      if (transaction.type === 'income') {
        income = transaction.value + income;
        return 0;
      }
      if (transaction.type === 'outcome') {
        outcome = transaction.value + outcome;
        return 0;
      }
      return 0;
    });

    total = income - outcome;

    const transaction = {
      income,
      outcome,
      total,
    };

    return transaction;
  }
}

export default TransactionsRepository;
