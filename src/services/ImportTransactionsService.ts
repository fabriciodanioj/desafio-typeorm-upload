import csv from 'csvtojson';
import fs from 'fs';

import uploadConfig from '../config/upload';

import Transaction from '../models/Transaction';
import CreateTransactionService from './CreateTransactionService';

class ImportTransactionsService {
  async execute(filename: string): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();
    const filePath = `${uploadConfig.directory}/${filename}`;

    const csvToJsonTransactions = await csv().fromFile(filePath);

    const transactions = await csvToJsonTransactions.reduce(
      async (acc, transaction) => {
        await acc;
        const createdTransaction = await createTransactionService.execute({
          category: transaction.category,
          title: transaction.title,
          type: transaction.type,
          value: transaction.value,
        });

        return [...(await acc), createdTransaction];
      },
      [],
    );

    await fs.promises.unlink(filePath);

    return transactions;
  }
}

export default ImportTransactionsService;
