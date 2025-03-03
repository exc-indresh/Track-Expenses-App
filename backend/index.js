const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

mongoose.connect('mongodb://localhost:27017/expensesDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const expenseSchema = new mongoose.Schema({
  amount: Number,
  category: String,
  date: Date,
  description: String,
});

const Expense = mongoose.model('Expense', expenseSchema);

app.post('/expenses', async (req, res) => {
  try {
    const expense = new Expense(req.body);
    await expense.save();
    res.status(201).json(expense);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/expenses', async (req, res) => {
  try {
    const query = {};

    if (req.query.category) {
      query.category = { $regex: new RegExp(req.query.category, 'i') }; 
    }

    if (req.query.date) {
      query.date = new Date(req.query.date);
    }

    const expenses = await Expense.find(query);
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



app.get('/expenses/total', async (req, res) => {
  try {
    const { start, end } = req.query;
    const total = await Expense.aggregate([
      { $match: { date: { $gte: new Date(start), $lte: new Date(end) } } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    res.status(200).json(total.length ? { total: total[0].total } : { total: 0 });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(5000, () => console.log('Server running on port 5000'));