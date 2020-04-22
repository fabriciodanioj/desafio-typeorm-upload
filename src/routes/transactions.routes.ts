import { Router } from 'express';
import { getCustomRepository } from 'typeorm';

import multer from 'multer';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const transactionsRouter = Router();
const upload = multer(uploadConfig);

transactionsRouter.get('/', async (req, res) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);
  const transactions = await transactionsRepository.find();
  const balance = await transactionsRepository.getBalance();

  return res.status(200).send({ transactions, balance });
});

transactionsRouter.post('/', async (req, res) => {
  const { title, type, value, category } = req.body;

  const createTransactionService = new CreateTransactionService();

  const transaction = await createTransactionService.execute({
    title,
    type,
    value,
    category,
  });

  return res.status(200).send(transaction);
});

transactionsRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;

  const deleteTransactionService = new DeleteTransactionService();

  await deleteTransactionService.execute({ id });
  return res.send();
});

transactionsRouter.post('/import', upload.single('file'), async (req, res) => {
  const importTransactionsService = new ImportTransactionsService();

  const fileName = req.file.filename;

  const transactions = await importTransactionsService.execute(fileName);

  return res.send(transactions);
});

export default transactionsRouter;
