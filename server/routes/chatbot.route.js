const router = require("express").Router();
const chatbotCtrl = require("../controllers/chatbot.controller");

router.post("/", chatbotCtrl.chatWithGemini);

module.exports = router;