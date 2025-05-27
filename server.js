// Basic structure for a user-to-telegram chat bridge using free tools

// 1. BACKEND: Node.js + Express + MongoDB + Telegram Bot API // File: server.js

const express = require('express'); const mongoose = require('mongoose'); const bodyParser = require('body-parser'); const cors = require('cors'); const { Telegraf } = require('telegraf');

const app = express(); const bot = new Telegraf('YOUR_TELEGRAM_BOT_TOKEN'); const YOUR_TELEGRAM_USER_ID = 'YOUR_TELEGRAM_USER_ID';

mongoose.connect('mongodb+srv://<user>:<pass>@cluster.mongodb.net/chat-app', { useNewUrlParser: true, useUnifiedTopology: true });

const MessageSchema = new mongoose.Schema({ userId: String, username: String, message: String, reply: String });

const Message = mongoose.model('Message', MessageSchema);

app.use(cors()); app.use(bodyParser.json());

// Send message from user app.post('/api/message', async (req, res) => { const { userId, username, message } = req.body; const saved = await Message.create({ userId, username, message }); await bot.telegram.sendMessage(YOUR_TELEGRAM_USER_ID, From ${username}: ${message}\nID:${saved._id}); res.send({ success: true }); });

// Webhook for telegram bot reply bot.on('text', async (ctx) => { const text = ctx.message.text; const parts = text.split('\nID:'); if (parts.length < 2) return; const replyText = parts[0]; const id = parts[1].trim(); await Message.findByIdAndUpdate(id, { reply: replyText }); });

bot.launch();

app.get('/api/messages/:userId', async (req, res) => { const messages = await Message.find({ userId: req.params.userId }); res.send(messages); });

app.listen(5000, () => console.log('Server started on port 5000'));

// 2. FRONTEND: React App (simplified) // Use fetch('/api/message') to send messages // Poll /api/messages/:userId to receive replies

