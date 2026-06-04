import 'dotenv/config';
import { spawn } from 'node:child_process';

const {
  TELEGRAM_TOKEN,
  ALLOWED_CHAT_ID,
  CLAUDE_BIN = 'claude',
  CLAUDE_WORKDIR,
  CLAUDE_ALLOWED_TOOLS = 'Read,Grep,Glob,WebFetch,WebSearch',
} = process.env;

if (!TELEGRAM_TOKEN) {
  console.error('Missing TELEGRAM_TOKEN in .env');
  process.exit(1);
}

const API = `https://api.telegram.org/bot${TELEGRAM_TOKEN}`;

async function tg(method, body) {
  const res = await fetch(`${API}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!data.ok) throw new Error(`${method} failed: ${JSON.stringify(data)}`);
  return data.result;
}

function runClaude(prompt) {
  return new Promise((resolve, reject) => {
    const args = ['-p', prompt, '--allowedTools', CLAUDE_ALLOWED_TOOLS];
    const child = spawn(CLAUDE_BIN, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      cwd: CLAUDE_WORKDIR || undefined,
    });
    let out = '';
    let err = '';
    child.stdout.on('data', d => { out += d.toString(); });
    child.stderr.on('data', d => { err += d.toString(); });
    child.on('error', reject);
    child.on('close', code => {
      if (code === 0) resolve(out.trim());
      else reject(new Error(`claude exited ${code}: ${(err || out).trim()}`));
    });
  });
}

function chunk(text, size = 3900) {
  const out = [];
  for (let i = 0; i < text.length; i += size) out.push(text.slice(i, i + size));
  return out;
}

async function send(chatId, text) {
  for (const part of chunk(text || '(empty response)')) {
    await tg('sendMessage', { chat_id: chatId, text: part });
  }
}

async function handle(msg) {
  const chatId = msg.chat?.id;
  const text = msg.text;
  if (!chatId || !text) return;

  console.log(`message from chat ${chatId}: ${text.slice(0, 80)}`);

  if (ALLOWED_CHAT_ID && String(chatId) !== String(ALLOWED_CHAT_ID)) {
    await send(chatId, 'This bot is not enabled for this chat.');
    return;
  }

  // Accept either "/ask <prompt>" or a plain message.
  let prompt = text.trim();
  const m = prompt.match(/^\/ask(?:@\w+)?\s+([\s\S]+)/);
  if (m) prompt = m[1];
  else if (prompt.startsWith('/start')) {
    await send(chatId, 'Send me a message (or /ask <prompt>) and I will run Claude Code.');
    return;
  } else if (prompt.startsWith('/')) {
    return; // ignore other slash commands
  }

  await tg('sendChatAction', { chat_id: chatId, action: 'typing' });
  try {
    const reply = await runClaude(prompt);
    await send(chatId, reply);
  } catch (e) {
    await send(chatId, `Error: ${String(e.message).slice(0, 3500)}`);
  }
}

async function main() {
  const me = await tg('getMe', {});
  console.log(`Bot online as @${me.username}`);
  let offset = 0;
  // Long-poll for updates forever.
  for (;;) {
    try {
      const updates = await tg('getUpdates', { offset, timeout: 30 });
      for (const u of updates) {
        offset = u.update_id + 1;
        if (u.message) await handle(u.message);
      }
    } catch (e) {
      console.error('poll error:', e.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
}

main();
