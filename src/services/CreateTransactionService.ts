import { getCustomRepository, getRepository } from 'typeorm';

// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionsRepository from '../repositories/TransactionsRepository';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome') {
      if (balance.total < value) {
        throw new AppError("You don't have balance!");
      }
    }

    const checkIfCategoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (checkIfCategoryExists) {
      const category_id = checkIfCategoryExists.id;

      const transaction = transactionsRepository.create({
        title,
        category_id,
        type,
        value,
      });

      await transactionsRepository.save(transaction);

      return transaction;
    }

    const createdCategory = categoriesRepository.create({
      title: category,
    });

    await categoriesRepository.save(createdCategory);

    const transaction = transactionsRepository.create({
      title,
      category_id: createdCategory.id,
      category,
      type,
      value,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
