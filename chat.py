from chatterbot import ChatBot
from chatterbot.trainers import ChatterBotCorpusTrainer

chatbot = ChatBot('RapidBot alpha v0.01a')
trainer = ChatterBotCorpusTrainer(chatbot)
trainer.train("chatterbot.corpus.rebahan")

while (True):
	p = input()
	print(chatbot.get_response(p))