from pydub import AudioSegment
import speech_recognition as sr
from os import *

while (True):
	p = input()
	if ".opus" in p or ".ogg" in p:
		audio = AudioSegment.from_ogg(p)
		audio.export("media/input.wav", format="wav")
		AUDIO_FILE = path.join("media/input.wav")
		r = sr.Recognizer()
		with sr.AudioFile(AUDIO_FILE) as source:
			audio = r.record(source)
		print(r.recognize_google(audio, language="id"))
	elif ".mp3" in p:
		audio = AudioSegment.from_mp3(p)
		audio.export("media/input.wav", format="wav")
		AUDIO_FILE = path.join("media/input.wav")
		r = sr.Recognizer()
		with sr.AudioFile(AUDIO_FILE) as source:
			audio = r.record(source)
		print(r.recognize_google(audio, language="id"))
	elif ".aac" in p:
		audio = AudioSegment.from_file(p, "aac")
		audio.export("media/input.wav", format="wav")
		AUDIO_FILE = path.join("media/input.wav")
		r = sr.Recognizer()
		with sr.AudioFile(AUDIO_FILE) as source:
			audio = r.record(source)
		print(r.recognize_google(audio, language="id"))
	elif ".wma" in p:
		audio = AudioSegment.from_file(p, "wma")
		audio.export("media/input.wav", format="wav")
		AUDIO_FILE = path.join("media/input.wav")
		r = sr.Recognizer()
		with sr.AudioFile(AUDIO_FILE) as source:
			audio = r.record(source)
		print(r.recognize_google(audio, language="id"))
	elif ".m4a" in p:
		audio = AudioSegment.from_file(p, "m4a")
		audio.export("media/input.wav", format="wav")
		AUDIO_FILE = path.join("media/input.wav")
		r = sr.Recognizer()
		with sr.AudioFile(AUDIO_FILE) as source:
			audio = r.record(source)
		print(r.recognize_google(audio, language="id"))
	else:
		print("Format audio tidak dapat diproses!")
