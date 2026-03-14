const GEMINI_API_KEY = "AIzaSyA1RAH0rg-w1BCb5ySMVA4it8suUFSjwNA"; 
const SPREADSHEET_ID = "1tPSECufK0DIsQjdVYeVnCYMV04IbjxeaFRiVZtUSZWY";
const LINE_ACCESS_TOKEN = "RWqEyZDr4UnUUpMpzWDG8N7+3nuilSVpC7kwfz/kplC8mU/cy1KNvJErhAOTWJoDQ7jtXx6JjqDyzlNhXppGNPb6WsZsg5M9hMZo7uELbWgu+Pm+vjbTQbc4HuycCD5tYh/aRypgZQcPwbGhtRHzzAdB04t89/1O/w1cDnyilFU=";

function doGet() {
  return HtmlService.createHtmlOutputFromFile('index')
    .setTitle('MindBeat Live: AI Soulmate')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

function doPost(e) {
  try {
    const jsonData = JSON.parse(e.postData.contents);
    const event = jsonData.events[0];
    if (!event || !event.message) return;

    const replyToken = event.replyToken;
    const userId = event.source.userId;
    let replyText = "";

    // 1. จัดการข้อความประเภท TEXT
    if (event.message.type === 'text') {
      const userMessage = event.message.text.trim();

      // ✅ ฟีเจอร์: เช็ครหัสสมาชิก (ต้องเช็คก่อนส่งให้ AI)
      const cleanMessage = userMessage.trim().toLowerCase(); // ทำความสะอาดข้อความ

      if (cleanMessage === "รหัสของฉัน" || cleanMessage === "what's my id ?" || cleanMessage.includes("my id")) {
        const memberData = getMoodHistory(userId, "all");
        const myId = memberData.memberId;

        // ✅ ถ้าหาไม่เจอ (เป็น Guest) ให้สุ่มรหัสใหม่ให้เขาทันที!
        if (myId === "Guest" || !myId) {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          myId = "";
          for (let i = 0; i < 5; i++) {
            myId += chars.charAt(Math.floor(Math.random() * chars.length));
          }
          // บันทึก Log การสร้างรหัสครั้งแรกไว้ใน Sheet (เพื่อให้ระบบจำได้ในครั้งหน้า)
          saveToAll("[First ID Request]", "Activity | ✨ สวัสดี | 🎵 ยินดีที่ได้รู้จักนะ | 🌱 เริ่มต้นการเดินทางของใจไปพร้อมกัน", "TH", userId, myId);
        }

        let replyText = "";
        if (userMessage === "รหัสของฉัน") {
          replyText = `✨ รหัสสมาชิกของเธอคือ: ${myId}\n\nเราสร้างรหัสนี้ให้เธอโดยเฉพาะเลยนะ! เธอใช้รหัสนี้เข้าดู "บันทึกเรื่องราว" ผ่านเมนูด้านล่างได้เลยนะเพื่อน! 🎶`;
        } else {
          replyText = `✨ Your Member ID is: ${myId}\n\nI've just created this for you! You can use this ID to access your "Journey of Heart" on rich menu, my friend! 🎶https://shorturl.at/55lo6`;
        }

        sendLineReply(replyToken, replyText);
        return; // จบการทำงานทันที
      }

      // ✅ ถ้าไม่ใช่การถามรหัส -> ส่งให้ Gemini AI วิเคราะห์ตามปกติ
      let aiRaw = askGemini(userMessage, null, "TH");
      
      // ✨ เพิ่มบรรทัดนี้: ล้าง Tag <br> ออกให้หมด และเปลี่ยนเป็น \n (ขึ้นบรรทัดใหม่ที่ LINE อ่านออก)
      aiRaw = aiRaw.replace(/<br\s*\/?>/gi, '\n');

      const p = aiRaw.split('|');
      const memberData = getMoodHistory(userId, "all");
      
      saveToAll(userMessage, aiRaw, "TH", userId, memberData.memberId);
      
      replyText = `${p[1] || '✨ ไงเธอ'}\n\n${p[2] || ''}\n\n${p[3] || ''}`;
      sendLineReply(replyToken, replyText);

    } 

    // 2. จัดการประเภทอื่นๆ (สติ๊กเกอร์/รูปภาพ)
    else {
      const memberData = getMoodHistory(userId, "all");
      const mId = memberData.memberId;

      // ✅ กำหนดข้อความตอบกลับตามภาษา (TH/EN)
      if (lang === 'TH') {
        replyText = `✨ โอ้ เพื่อนรัก...\n\nเธอกำลังบอกอะไรเราผ่านสิ่งนี้หรือเปล่านะ? 🎵\n\n🌱 ถึงเราจะมองไม่เห็นภาพหรือสติ๊กเกอร์ชัดๆ แต่เราพร้อมฟังเธอเสมอนะ ลองพิมพ์เล่าเรื่องราวให้เราฟังหน่อยสิ เราอยากรู้ว่าเธอเป็นยังไงบ้าง`;
        
        // บันทึกข้อมูลลง Sheet (Ver. ไทย)
        saveToAll("[Sent Image/Sticker]", "Activity | ✨ โอ้ เพื่อนรัก | 🎵 (ส่งรูปภาพหรือสติ๊กเกอร์) | 🌱 พิมพ์เล่าให้เราฟังได้นะ", "TH", userId, mId);
      } else {
        // ✅ ข้อความภาษาอังกฤษ (EN)
        replyText = `✨ Oh, my friend...\n\nAre you trying to tell me something through this? 🎵\n\n🌱 Even though I can't see images or stickers clearly, I'm always here to listen. Try typing your story and letting me know how you're doing.`;
        
        // บันทึกข้อมูลลง Sheet (Ver. อังกฤษ)
        saveToAll("[Sent Image/Sticker]", "Activity | ✨ Hey friend | 🎵 (Sent Image/Sticker) | 🌱 Feel free to type your story", "EN", userId, mId);
      }
        sendLineReply(replyToken, replyText);
      }

  } catch (err) { 
    console.log("Error: " + err.message); 
  }
}

function sendLineReply(token, text) {
  UrlFetchApp.fetch("https://api.line.me/v2/bot/message/reply", {
    "method": "post",
    "headers": { "Content-Type": "application/json", "Authorization": "Bearer " + LINE_ACCESS_TOKEN },
    "payload": JSON.stringify({ "replyToken": token, "messages": [{ "type": "text", "text": text }] })
  });
}

function askGemini(message, dummy, lang) {
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" + GEMINI_API_KEY;
  
  const prompt = `You are an empathic "Best Friend" (เพื่อนที่รู้ใจ). Respond in ${lang === 'TH' ? 'Thai' : 'English'}. 
  Do NOT use romantic words. Use friendly terms like "เธอ", "เรา", "เพื่อน", "you", "friend", "my friend".
  
  Analyze: "${message}". 
  Provide response strictly in 4 parts separated by | as follows:
  1. One-word Mood
  2. A Warm Greeting with a friendly emoji (e.g., "✨ ไงเธอ", "👋 มานี่มาเพื่อน")
  3. A 4-line emotional song lyric starting with 🎵 (use \n for line breaks between the 4 lines)
  4. Heartfelt Reflection starting with 🌱 (Limit to 180 characters, warm and friendly)
  
  Strictly use | as separator. No bold text. No markdown.`;

  try {
    const res = UrlFetchApp.fetch(url, { 
      "method": "post", "contentType": "application/json", 
      "payload": JSON.stringify({ "contents": [{ "parts": [{ "text": prompt }] }] }) 
    });
    const json = JSON.parse(res.getContentText());
    return json.candidates[0].content.parts[0].text;
  } catch (e) {
    // Fallback ที่คุณโอเคแล้ว (ต้องมี Icon ด้วย)
    return lang === 'EN'
      ? "Peaceful | 👋 Hi friend | 🎵 Hope is still alive\nEven in the dark\nI am by your side\nLike a tiny spark | 🌱 I'm always here to listen."
      : "อบอุ่นใจ | ✨ สวัสดีจ้ะเพื่อน | 🎵 ใจดวงนี้ยังมีหวัง\nแม้ในวันที่มืดมิด\nฉันจะอยู่เคียงข้างเธอ\nในทุกก้าวที่เดินไป | 🌱 เราพร้อมรับฟังเธอนะ มีอะไรเล่ามาได้เสมอ";
  }
}

function getMoodHistory(searchKey, timeFilter) {
  try {
    const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    const sheet = ss.getSheets()[0];
    const data = sheet.getDataRange().getValues();
    const now = new Date();
    let foundUserId = "", foundMemberId = "";
    const safeKey = searchKey ? searchKey.toString().trim() : "";

    if (data.length > 1 && safeKey !== "") {
      for (let i = 1; i < data.length; i++) {
        const rUid = data[i][5] ? data[i][5].toString().trim() : "";
        const rMid = data[i][6] ? data[i][6].toString().trim() : "";
        if ((rUid === safeKey || rMid === safeKey) && rMid !== "" && rMid !== "Error") {
          foundUserId = rUid; foundMemberId = rMid; break;
        }
      }
    }

    if (!foundMemberId && safeKey.startsWith("U")) {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      for (let i = 0; i < 5; i++) foundMemberId += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const targetId = foundUserId || safeKey;
    let filtered = (targetId === "" || targetId === "Web-Guest") ? [] : data.filter((row, i) => i > 0 && row[5] == targetId);

    if (timeFilter === 'today') {
      filtered = filtered.filter(r => new Date(r[0]).toDateString() === now.toDateString());
    } else if (timeFilter === '7days') {
      const sevenDays = new Date(now.getTime() - (7 * 24 * 60 * 60 * 1000));
      filtered = filtered.filter(r => new Date(r[0]) >= sevenDays);
    }

    return { history: filtered.reverse().map(r => r.map(c => c instanceof Date ? c.toISOString() : c)), memberId: foundMemberId || "Guest" };
  } catch (e) { return { history: [], memberId: "Guest" }; }
}

function saveToAll(msg, aiRes, lang, uid, mid) {
  try {
    const p = aiRes.split('|');
    SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0].appendRow([new Date(), msg, p[0]||"", p[2]||"", p[3]||"", uid||("Guest-"+mid), mid||"Guest"]);
  } catch (e) {}
}
