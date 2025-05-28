require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const { Telegraf } = require('telegraf');

const app = express();

// Use environment variables
const bot = new Telegraf(process.env.BOT_TOKEN);
const YOUR_TELEGRAM_USER_ID = process.env.TELEGRAM_ID;

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

const MessageSchema = new mongoose.Schema({
  userId: String,
  username: String,
  message: String,
  reply: String,
});

const Message = mongoose.model('Message', MessageSchema);

app.use(cors());
app.use(bodyParser.json());

// Send message from user
app.post('/api/message', async (req, res) => {
  const { userId, username, message } = req.body;

  try {
    const saved = await Message.create({ userId, username, message });
    await bot.telegram.sendMessage(
      YOUR_TELEGRAM_USER_ID,
      `From ${username}: ${message}\nID:${saved._id}`
    );
    res.send({ success: true });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).send({ success: false });
  }
});

// Webhook for telegram bot reply
bot.on('text', async (ctx) => {
  const text = ctx.message.text;
  const parts = text.split('\nID:');
  if (parts.length < 2) return;

  const replyText = parts[0].trim();
  const id = parts[1].trim();

  try {
    await Message.findByIdAndUpdate(id, { reply: replyText });
  } catch (err) {
    console.error('Error updating message:', err);
  }
});

bot.launch();

app.get('/api/messages/:userId', async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.params.userId });
    res.send(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).send([]);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
