const { prefix } = require('../settings');
const color = require('../util/colors');
const moment = require('moment-timezone');
const set = require('../settings');
const {PythonShell} = require('python-shell');
const pyshell = new PythonShell('chat.py');
const pyspeech = new PythonShell('speech.py');
const _function = require('../lib');
const { decryptMedia } = require('@open-wa/wa-automate');
const { saveFile } = require('../util/fetcher');

const chatterbot_response = async (input) => new Promise ((resolve, reject) => {
  pyshell.send(`${input}`);
  pyshell.on('message', function (message) {
    resolve(message)
  });
})

const speech_response = async (input) => new Promise ((resolve, reject) => {
  pyspeech.send(`${input}`);
  pyspeech.on('message', function (message) {
    resolve(message)
  });
})

const processTime = (timestamp, now) => {
  // timestamp => timestamp when message was received
  return moment.duration(now - moment(timestamp * 1000)).asSeconds()
}

module.exports = async (client, message) => {
  const { id, body, mimetype, type, t, from, sender, content, caption, author, isGroupMsg, isMedia, chat, quotedMsg, quotedMsgObj, mentionedJidList } = message;
  try {
    const msgAmount = await client.getAmountOfLoadedMessages();
    if (msgAmount > 1000) await client.cutMsgCache();

    const { id, body, mimetype, type, t, from, sender, content, caption, author, isGroupMsg, isMedia, chat, quotedMsg, quotedMsgObj, mentionedJidList } = message;
    const { name, shortName, pushname, formattedName } = sender;
    const { formattedTitle, isGroup, contact, groupMetadata } = chat;

    const botOwner = set.owner;
    const botGroup = set.support;
    const botPrefix = set.prefix;

    const validMessage = caption ? caption : body;
    if (!validMessage || validMessage[0] != botPrefix) return;

    const command = validMessage.trim().split(' ')[0].slice(1);
    const arguments = validMessage.trim().split(' ').slice(1);
    const arg = validMessage.substring(validMessage.indexOf(' ') + 1)
    const q = arguments.join(' ')
    const urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

    const url = arguments.length !== 0 ? arguments[0] : ''

    // debug
    console.debug(color('green', '➜'), color('yellow', isGroup ? '[GROUP]' : '[PERSONAL]'), `${botPrefix}${command} | ${sender.id} ${isGroup ? 'FROM ' + formattedTitle : ''}`, color('yellow', moment().format()));

    const allChats = await client.getAllChats();
    switch (command) {
      case 'speed':
      case 'ping':
        await client.sendText(from, `Pong!!!!\nSpeed: ${processTime(t, moment())} _Second_`);
        break;

      case 'chat':
        if (arguments.length < 1) {
          if (quotedMsg != null) {
            const quotedchatter = await chatterbot_response(quotedMsg["text"]);
            await client.reply(from, quotedchatter, id);
            break;
          }
          else {
            return await client.reply(from, `⚠️ Contoh Penggunaan Perintah:\n${botPrefix}chat <kalimat>\natau reply teks dengan ${botPrefix}chat`, id);
          }
        }
        input = arguments.join(' ');
        const chatterresp = await chatterbot_response(input);
        await client.reply(from, chatterresp, id);
        break;

      case 'voice':
        if (arguments.length < 1) {
          if (quotedMsg != null) {
            const quotedvoice = _function.voiceUrl(quotedMsg["text"].trim().split(' ').slice(0));
            await client.sendPtt(from, quotedvoice, id);
            break;
          }
          else {
            return await client.reply(from, `⚠️ Contoh Penggunaan Perintah:\n${botPrefix}voice <kalimat>\natau reply teks dengan ${botPrefix}voice`, id);
          }
        }
        const voiceUrl = _function.voiceUrl(arguments);
        await client.sendPtt(from, voiceUrl, id);
        break;

      case 'hear':
        if (quotedMsg == null) return await client.reply(from, `⚠️ Contoh Penggunaan Perintah:\nreply sebuah Voice Note dengan *${botPrefix}hear*`, id);
        const encryptMediaAudio = quotedMsg
        const mediaDataAudio = await decryptMedia(encryptMediaAudio)
        const audioPath = await saveFile(mediaDataAudio, `voice.${sender.id}`)
        const speechresp = await speech_response(audioPath)
        await client.reply(from, speechresp, id);
        break;

      case 'menu':
      case 'bantuan':
      case 'help':
        return await client.reply(from, `Panduan:\n*${botPrefix}chat* untuk berbincang dgn Bot,\n*${botPrefix}voice* untuk text-to-speech,\n*${botPrefix}hear* untuk speech-to-text`, id);

      default:
        client.reply(from, `Salah command, gunakan:\n*${botPrefix}chat* untuk berbincang dgn Bot,\n*${botPrefix}voice* untuk text-to-speech,\n*${botPrefix}hear* untuk speech-to-text`, id);
        return console.debug(color('red', '➜'), color('yellow', isGroup ? '[GROUP]' : '[PERSONAL]'), `${botPrefix}${command} | ${sender.id} ${isGroup ? 'FROM ' + formattedTitle : ''}`, color('yellow', moment().format()));
    }

    return;
  } catch (err) {
    client.sendText(from, '_Traceback (most recent call last):_\n\nBotError: see changelog!')
    client.sendText(from, `error log\n\n${err}`)
    console.log(err);
  }
};
