// ─────────────────────────────────────────────────────────────────────────────
// SetoranGmail.jsx — Main App
//
// IMPORT (di project lokal):
//   import { SEED_USERS, createUser, generateUserId, generateApiKey } from './users.js'
//   import { SEED_EMAILS, createEmailEntry, generateSubId } from './emails.js'
//
// .env dibaca via:
//   const ADMIN_EMAIL    = process.env.ADMIN_EMAIL    || 'qwerty@admin.com'
//   const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'superadmin'
//   const ROOM_A_PAYOUT  = Number(process.env.ROOM_A_PAYOUT) || 3500
//   ...
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from "react";

// ══ .env values (hardcoded di sini karena artifact browser, di prod pakai process.env) ══
const ENV = {
ADMIN_EMAIL:    "qwerty@admin.com",
ADMIN_PASSWORD: "superadmin",
ADMIN_USERNAME: "SuperAdmin",
APP_SECRET:     "sgm_super_secret_key_2026_jangan_bocor",
API_KEY_PREFIX: "sgp_",
ROOM_A_PAYOUT:  3500,
ROOM_B_PAYOUT:  4000,
ROOM_C_PAYOUT:  5000,
};

// ══ FROM: users.js ════════════════════════════════════════════════════════════
function genHex(bytes) {
try {
return Array.from(crypto.getRandomValues(new Uint8Array(bytes)))
.map(b => b.toString(16).padStart(2, "0")).join("");
} catch {
return Math.random().toString(16).slice(2).padEnd(bytes * 2, "0").slice(0, bytes * 2);
}
}
const generateApiKey = () => `${ENV.API_KEY_PREFIX}${genHex(20)}`;

function createUser(username, password, email) {
return {
userid: generateUserId(),
username, password, email,
role: "user",
saldo: 0,
bankType: "DANA",
bankNumber: "",
apiKey: generateApiKey(),
createdAt: new Date().toISOString(),
};
}

const SEED_USERS = [
{
userid: "sgm_a1b2c3d4e5f6",
username: ENV.ADMIN_USERNAME,
password: ENV.ADMIN_PASSWORD,
email: ENV.ADMIN_EMAIL,
role: "admin", saldo: 0, bankType: "", bankNumber: "",
apiKey: "sgp_adminkey00000000000000000000000000000000",
createdAt: "2026-01-01T00:00:00.000Z",
},
{
userid: "sgm_f1e2d3c4b5a6",
username: "Falz12", password: "user123",
email: "naufalfabyan50@gmail.com",
role: "user", saldo: 3500, bankType: "DANA", bankNumber: "082138076489",
apiKey: generateApiKey(), createdAt: "2026-03-10T08:00:00.000Z",
},
{
userid: "sgm_c6d5e4f3a2b1",
username: "kilha", password: "user123",
email: "kilha@gmail.com",
role: "user", saldo: 100000, bankType: "GoPay", bankNumber: "081234567890",
apiKey: generateApiKey(), createdAt: "2026-02-20T10:30:00.000Z",
},
];

// ══ FROM: emails.js ═══════════════════════════════════════════════════════════
const generateSubId = () => `sub_${genHex(4)}`;

function createEmailEntry(email, ownerid, ownerUsername, paymentOwner, room) {
return {
id: generateSubId(),
email, ownerid, ownerUsername, paymentOwner, room,
status: "pending", payout: 0, reason: null,
timestamp: new Date().toISOString(), processedAt: null,
};
}

const SEED_EMAILS = [
{ id: "sub_aa11bb22", email: "miziaomblauspaibir745@gmail.com", ownerid: "sgm_f1e2d3c4b5a6", ownerUsername: "Falz12", paymentOwner: "dana_082138076489", room: "Room A", status: "accepted", payout: 3500, reason: null, timestamp: "2026-05-23T21:16:00.000Z", processedAt: "2026-05-24T09:00:00.000Z" },
{ id: "sub_cc33dd44", email: "dazoawitrundaigar685@gmail.com", ownerid: "sgm_f1e2d3c4b5a6", ownerUsername: "Falz12", paymentOwner: "dana_082138076489", room: "Room A", status: "denied", payout: 0, reason: "akun terkena verifikasi robot — cek di checkgmail.online", timestamp: "2026-05-24T14:41:34.000Z", processedAt: "2026-05-25T10:00:00.000Z" },
{ id: "sub_ee55ff66", email: "botiardrepliavon878@gmail.com", ownerid: "sgm_f1e2d3c4b5a6", ownerUsername: "Falz12", paymentOwner: "dana_082138076489", room: "Room A", status: "denied", payout: 0, reason: "akun terkena verifikasi robot — cek di checkgmail.online", timestamp: "2026-05-24T14:32:06.000Z", processedAt: "2026-05-25T10:05:00.000Z" },
{ id: "sub_77889900", email: "test1kilha@gmail.com", ownerid: "sgm_c6d5e4f3a2b1", ownerUsername: "kilha", paymentOwner: "gopay_081234567890", room: "Room B", status: "accepted", payout: 4000, reason: null, timestamp: "2026-05-24T10:00:00.000Z", processedAt: "2026-05-25T08:00:00.000Z" },
{ id: "sub_aabbccdd", email: "pendingtest123@gmail.com", ownerid: "sgm_f1e2d3c4b5a6", ownerUsername: "Falz12", paymentOwner: "dana_082138076489", room: "Room B", status: "pending", payout: 0, reason: null, timestamp: "2026-05-29T08:00:00.000Z", processedAt: null },
];

// ══ Rooms config ══════════════════════════════════════════════════════════════
const ROOMS = [
{ id: "A", name: "Room A", payout: ENV.ROOM_A_PAYOUT, open: false },
{ id: "B", name: "Room B", payout: ENV.ROOM_B_PAYOUT, open: true },
{ id: "C", name: "Room C", payout: ENV.ROOM_C_PAYOUT, open: true },
];

const LEADERBOARD = [
{ rank: 1, username: "kilha...", acc: 248, prize: 100000 },
{ rank: 2, username: "Fitri...", acc: 65,  prize: 75000 },
{ rank: 3, username: "Suser",   acc: 30,   prize: 50000 },
];

// ══ Storage helpers (window.storage → persistent) ═════════════════════════════
const SDB = {
async getUsers() {
try { const r = await window.storage.get("sgm:users"); return r ? JSON.parse(r.value) : SEED_USERS; }
catch { return SEED_USERS; }
},
async setUsers(u) {
try { await window.storage.set("sgm:users", JSON.stringify(u)); } catch {}
},
async getEmails() {
try { const r = await window.storage.get("sgm:emails"); return r ? JSON.parse(r.value) : SEED_EMAILS; }
catch { return SEED_EMAILS; }
},
async setEmails(e) {
try { await window.storage.set("sgm:emails", JSON.stringify(e)); } catch {}
},
async getSession() {
try { const r = await window.storage.get("sgm:session"); return r ? JSON.parse(r.value) : null; }
catch { return null; }
},
async setSession(u) {
try { await window.storage.set("sgm:session", JSON.stringify(u)); } catch {}
},
async clearSession() {
try { await window.storage.delete("sgm:session"); } catch {}
},
};

// ══ Utils ══════════════════════════════════════════════════════════════════════
const fmtRp   = n => "Rp " + Number(n).toLocaleString("id-ID");
const fmtDate = s => new Date(s).toLocaleString("id-ID");
const paymentLabel = s => {
if (!s) return "-";
const [type, ...rest] = s.split("_");
return `${type.toUpperCase()} ${rest.join("_")}`;
};

// ══ CSS ════════════════════════════════════════════════════════════════════════
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Plus Jakarta Sans',sans-serif;background:#f0f2f8}
:root{--p:#5a4fcf;--p2:#7c6ff7;--pg:linear-gradient(135deg,#5a4fcf 0%,#a855f7 100%);--g:#10b981;--r:#ef4444;--o:#f59e0b}
.app{max-width:430px;margin:0 auto;min-height:100vh;background:#f0f2f8}

/* Navbar */
.nb{background:#fff;padding:10px 14px;display:flex;align-items:center;gap:8px;border-bottom:1px solid #e8eaf0;position:sticky;top:0;z-index:100;flex-wrap:wrap}
.nb-logo{font-weight:800;font-size:16px;color:var(--p)}
.nb-right{margin-left:auto;display:flex;align-items:center;gap:6px;flex-wrap:wrap}
.chip{background:#f3f0ff;color:var(--p);padding:3px 9px;border-radius:20px;font-size:11px;font-weight:700}
.chip-id{background:#e0f2fe;color:#0369a1;font-size:10px}
.btn-sm{padding:5px 11px;border-radius:20px;font-size:11px;font-weight:700;border:none;cursor:pointer}
.btn-purple{background:var(--p);color:#fff}
.btn-gray{background:#f0f2f8;color:#555}

/* Banner */
.banner{background:var(--pg);color:#fff;padding:12px 16px;font-size:12px;font-weight:500;line-height:1.5}

/* Hero */
.hero{background:var(--pg);margin:12px;border-radius:18px;padding:20px;color:#fff;position:relative;overflow:hidden;min-height:110px}
.hero h2{font-size:21px;font-weight:800}
.hero p{font-size:12px;opacity:.85;margin-top:2px}
.hero-robots{position:absolute;right:-8px;bottom:-4px;font-size:50px;opacity:.55}
.hero-bubble{background:#fff;color:#333;font-size:11px;font-weight:700;padding:3px 10px;border-radius:12px;display:inline-block;margin-bottom:8px;box-shadow:0 2px 8px rgba(0,0,0,.12)}

/* Grid */
.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:0 12px 12px}
.ic{background:#fff;border-radius:14px;padding:13px}
.ic.bl{border-left:4px solid var(--p)}
.ic.gl{border-left:4px solid var(--g)}
.ic h4{font-size:12px;font-weight:700}
.ic p{font-size:11px;color:#777;margin-top:2px}
.stat-row{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:0 12px 12px}
.sb{background:#fff;border-radius:14px;padding:13px 8px;text-align:center}
.sb .lbl{font-size:10px;font-weight:700;color:#999;letter-spacing:.5px;margin-bottom:3px}
.sb .val{font-size:20px;font-weight:800;color:#222}
.sb .val.rp{font-size:14px}

/* Card */
.card{background:#fff;border-radius:16px;margin:0 12px 12px;padding:16px}
.card-title{font-size:14px;font-weight:800;display:flex;align-items:center;gap:6px;margin-bottom:12px}

/* Leaderboard */
.lb-prizes{display:flex;gap:8px;margin-bottom:12px;overflow-x:auto;padding-bottom:4px}
.lb-p{border:2px solid;border-radius:12px;padding:9px 14px;min-width:96px;text-align:center;flex-shrink:0}
.lb-p.g{border-color:#f59e0b;background:#fffbeb}.lb-p.s{border-color:#94a3b8;background:#f8fafc}.lb-p.b{border-color:#b45309;background:#fef3c7}
.lb-p .amt{font-size:14px;font-weight:800}.lb-p .medal{font-size:11px}
.lb-row{display:flex;align-items:center;gap:8px;padding:7px 0;border-bottom:1px solid #f0f0f0;font-size:13px}
.lb-rank{background:#fef3c7;color:#92400e;width:24px;height:24px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:11px}
.lb-name{flex:1;font-weight:600}.lb-acc{color:#666;font-size:12px}.lb-prize-val{color:var(--o);font-weight:700}

/* Form */
.fg{margin-bottom:12px}
.fl{font-size:11px;font-weight:700;color:#555;margin-bottom:5px;display:flex;align-items:center;gap:4px}
.fi{width:100%;padding:11px 13px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:13px;outline:none;font-family:inherit;background:#fafafa;transition:border .2s}
.fi:focus{border-color:var(--p);background:#fff}
.fsel{width:100%;padding:11px 13px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:13px;outline:none;font-family:inherit;background:#fafafa}
.fta{width:100%;padding:11px 13px;border:1.5px solid #e5e7eb;border-radius:12px;font-size:12px;outline:none;font-family:inherit;background:#fafafa;resize:vertical;min-height:96px}
.btn-p{width:100%;padding:13px;background:var(--pg);color:#fff;border:none;border-radius:13px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:7px;transition:opacity .2s}
.btn-p:hover{opacity:.9}.btn-p:disabled{opacity:.5;cursor:not-allowed}
.btn-o{width:100%;padding:11px;background:#fff;color:#555;border:1.5px solid #e5e7eb;border-radius:13px;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:7px}

/* Alert */
.al{padding:11px 13px;border-radius:12px;font-size:12px;font-weight:500;margin-bottom:11px;display:flex;gap:7px;align-items:flex-start}
.al-i{background:#eff6ff;color:#1d4ed8;border-left:4px solid #3b82f6}
.al-s{background:#f0fdf4;color:#166534;border-left:4px solid #22c55e}
.al-w{background:#fffbeb;color:#92400e;border-left:4px solid #f59e0b}
.al-d{background:#fef2f2;color:#991b1b;border-left:4px solid #ef4444}
.closed-box{background:#fef2f2;border-radius:12px;padding:18px;text-align:center}
.closed-box h3{color:#dc2626;font-size:15px;font-weight:800;margin:7px 0}
.closed-box p{color:#666;font-size:12px}

/* Badge */
.badge{padding:3px 9px;border-radius:20px;font-size:10px;font-weight:800;display:inline-flex;align-items:center;gap:2px}
.b-acc{background:#d1fae5;color:#065f46}.b-den{background:#fee2e2;color:#991b1b}.b-pen{background:#fef3c7;color:#92400e}

/* History */
.hi{padding:13px 0;border-bottom:1px solid #f0f2f8}
.hi:last-child{border-bottom:none}
.hi-email{font-size:13px;font-weight:700;color:#222;word-break:break-all}
.hi-reason{font-size:11px;color:#666;margin-top:2px}
.hi-time{font-size:10px;color:#999;margin-top:3px}
.hi-row{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
.hi-pay{font-size:11px;color:#7c3aed;margin-top:2px;font-weight:600}

/* Tabs */
.tab-bar{display:flex;gap:5px;margin-bottom:13px;background:#f0f2f8;padding:4px;border-radius:12px}
.tab{flex:1;padding:7px;text-align:center;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;border:none;background:transparent;font-family:inherit;color:#666}
.tab.active{background:#fff;color:var(--p);box-shadow:0 2px 8px rgba(0,0,0,.08)}

/* Bottom nav */
.bnav{position:fixed;bottom:0;left:50%;transform:translateX(-50%);width:100%;max-width:430px;background:#fff;border-top:1px solid #e8eaf0;display:flex;z-index:100}
.bni{flex:1;display:flex;flex-direction:column;align-items:center;padding:9px 0 13px;cursor:pointer;font-size:10px;font-weight:700;color:#999;border:none;background:transparent;font-family:inherit;gap:2px}
.bni.active{color:var(--p)}
.bni .ni{width:38px;height:38px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:18px}
.bni.active .ni{background:var(--p);font-size:16px}

/* Page */
.page{padding-bottom:80px}

/* Profile */
.ph{background:var(--pg);padding:20px 16px 38px;color:#fff}
.ph h2{font-size:19px;font-weight:800}.ph p{font-size:12px;opacity:.8}
.pc{margin:-26px 12px 12px}
.ir{display:flex;justify-content:space-between;align-items:center;padding:5px 0}
.ik{font-size:10px;font-weight:700;color:#999;letter-spacing:.5px}
.iv{font-size:13px;font-weight:700}
.tag{display:inline-block;padding:3px 9px;border-radius:20px;font-size:10px;font-weight:700;background:#d1fae5;color:#065f46;margin-top:3px;margin-right:3px}

/* Page header */
.phdr{background:var(--pg);margin:12px;border-radius:18px;padding:18px;color:#fff;position:relative;overflow:hidden}
.phdr h2{font-size:19px;font-weight:800}.phdr p{font-size:12px;opacity:.85;margin-top:2px}
.phdr-bg{position:absolute;right:-18px;top:-18px;font-size:76px;opacity:.1}

/* Login */
.lp{min-height:100vh;background:linear-gradient(160deg,#5a4fcf 0%,#a855f7 55%,#f0f2f8 100%);display:flex;flex-direction:column;align-items:center;justify-content:center;padding:24px}
.lcard{background:#fff;border-radius:22px;padding:26px 22px;width:100%;max-width:380px;box-shadow:0 20px 60px rgba(90,79,207,.3)}
.llogo{text-align:center;margin-bottom:22px}
.llogo h1{font-size:24px;font-weight:800;color:var(--p)}.llogo p{font-size:12px;color:#888;margin-top:3px}
.div{display:flex;align-items:center;gap:9px;margin:14px 0;color:#bbb;font-size:12px}
.div::before,.div::after{content:'';flex:1;height:1px;background:#e5e7eb}
.btn-g{width:100%;padding:12px;background:#fff;border:1.5px solid #e5e7eb;border-radius:13px;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;display:flex;align-items:center;justify-content:center;gap:9px}
.btn-g:hover{background:#f9f9f9}
.glogo{width:20px;height:20px;border-radius:50%;background:conic-gradient(#4285f4 0 90deg,#ea4335 90deg 180deg,#fbbc04 180deg 270deg,#34a853 270deg 360deg);display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;font-weight:800}
.tlink{text-align:center;margin-top:14px;font-size:12px;color:#666}
.tlink span{color:var(--p);font-weight:700;cursor:pointer}

/* Admin */
.ai{display:flex;flex-direction:column;gap:5px;padding:13px 0;border-bottom:1px solid #f0f2f8}
.ai:last-child{border-bottom:none}
.aa{display:flex;gap:7px;margin-top:3px}
.btn-acc{flex:1;padding:9px;background:#d1fae5;color:#065f46;border:none;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit}
.btn-den{flex:1;padding:9px;background:#fee2e2;color:#991b1b;border:none;border-radius:10px;font-size:12px;font-weight:800;cursor:pointer;font-family:inherit}
.adm-hdr{background:var(--pg);color:#fff;padding:14px 16px;margin-bottom:12px}
.adm-hdr h1{font-size:19px;font-weight:800}
.adm-stat{background:#fff;border-radius:12px;padding:11px;text-align:center}
.adm-stat .n{font-size:22px;font-weight:800;color:var(--p)}
.adm-stat .l{font-size:10px;color:#888}

/* Search */
.search-box{position:relative;margin-bottom:12px}
.search-box input{padding-left:36px}
.search-icon{position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;pointer-events:none}

/* Toast */
.toast{position:fixed;bottom:88px;left:50%;transform:translateX(-50%);background:#222;color:#fff;padding:11px 18px;border-radius:12px;font-size:12px;font-weight:700;z-index:9999;white-space:nowrap;box-shadow:0 8px 24px rgba(0,0,0,.3);animation:su .3s ease}
@keyframes su{from{transform:translateX(-50%) translateY(18px);opacity:0}to{transform:translateX(-50%) translateY(0);opacity:1}}

/* Generated */
.gen-box{background:#f8f9ff;border:1.5px dashed var(--p2);border-radius:12px;padding:11px;font-size:11px;font-family:monospace;color:#333;max-height:130px;overflow-y:auto;white-space:pre-line;margin-top:9px}

/* Mutasi */
.mi{padding:11px 0;border-bottom:1px solid #f0f0f0}
.mi:last-child{border-bottom:none}
.mi-title{font-size:12px;font-weight:600}
.mi-date{font-size:10px;color:#999;margin-top:1px}
.mi-amt{font-size:14px;font-weight:800;margin-top:3px}
.red{color:#ef4444}.green{color:#10b981}

/* Saldo big */
.saldo-big{background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:14px;margin-bottom:13px}
.saldo-lbl{font-size:12px;color:#166534;font-weight:600;margin-bottom:3px}
.saldo-val{font-size:26px;font-weight:800;color:#166534}

/* Loading */
.loading{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#f0f2f8;font-size:32px;animation:spin 1s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
`;

// ══ Toast component ═══════════════════════════════════════════════════════════
function Toast({ msg }) {
return msg ? <div className="toast">{msg}</div> : null;
}

// ══ Login ═════════════════════════════════════════════════════════════════════
function LoginPage({ onLogin, users, setUsers }) {
const [mode, setMode] = useState("login");
const [form, setForm] = useState({ username: "", password: "", email: "" });
const [error, setError] = useState("");
const [loading, setLoading] = useState(false);

const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

const handleSubmit = async () => {
setError(""); setLoading(true);
await new Promise(r => setTimeout(r, 400));

if (mode === "login") {  
  const u = users.find(u =>  
    (u.username === form.username || u.email === form.username) &&  
    u.password === form.password  
  );  
  if (!u) { setError("Username / email atau password salah."); setLoading(false); return; }  
  await SDB.setSession(u);  
  onLogin(u);  
} else {  
  if (!form.username || !form.email || !form.password) { setError("Semua field harus diisi."); setLoading(false); return; }  
  if (users.find(u => u.username === form.username)) { setError("Username sudah dipakai."); setLoading(false); return; }  
  if (users.find(u => u.email === form.email)) { setError("Email sudah terdaftar."); setLoading(false); return; }  
  const nu = createUser(form.username, form.password, form.email);  
  const updated = [...users, nu];  
  setUsers(updated);  
  await SDB.setUsers(updated);  
  await SDB.setSession(nu);  
  onLogin(nu);  
}  
setLoading(false);

};

const handleGmail = async () => {
const u = users.find(u => u.username === "Falz12");
if (u) { await SDB.setSession(u); onLogin(u); }
};

return (
<div className="lp">
<div className="lcard">
<div className="llogo">
<h1>✉️ SetoranGmail</h1>
<p>{mode === "login" ? "Masuk ke akun kamu" : "Buat akun baru"}</p>
</div>

{error && <div className="al al-d" style={{ marginBottom: 12 }}>⚠️ {error}</div>}  

    <div className="fg">  
      <div className="fl">Username / Email</div>  
      <input className="fi" placeholder="Username atau email" value={form.username} onChange={set("username")} />  
    </div>  
    {mode === "register" && (  
      <div className="fg">  
        <div className="fl">Email</div>  
        <input className="fi" placeholder="email@gmail.com" value={form.email} onChange={set("email")} />  
      </div>  
    )}  
    <div className="fg">  
      <div className="fl">Password</div>  
      <input className="fi" type="password" placeholder="••••••••" value={form.password} onChange={set("password")} />  
    </div>  

    <button className="btn-p" onClick={handleSubmit} disabled={loading}>  
      {loading ? "⏳ Memproses..." : mode === "login" ? "🚀 Masuk" : "✨ Daftar"}  
    </button>  

    <div className="div">atau</div>  

    <button className="btn-g" onClick={handleGmail}>  
      <div className="glogo">G</div>  
      Lanjutkan dengan Gmail  
    </button>  

    <div className="tlink">  
      {mode === "login"  
        ? <>Belum punya akun? <span onClick={() => setMode("register")}>Daftar</span></>  
        : <>Sudah punya akun? <span onClick={() => setMode("login")}>Masuk</span></>}  
    </div>  
    <div style={{ textAlign: "center", marginTop: 12, fontSize: 11, color: "#aaa" }}>  
      Demo — admin: qwerty@admin.com / superadmin · user: Falz12 / user123  
    </div>  
  </div>  
</div>

);
}

// ══ User App ══════════════════════════════════════════════════════════════════
function UserApp({ user, users, setUsers, emails, setEmails, onLogout }) {
const [tab, setTab] = useState("setor");
const [toast, setToast] = useState("");
const [histTab, setHistTab] = useState("setoran");
const [selectedRoom, setSelectedRoom] = useState("");
const [emailInput, setEmailInput] = useState("");
const [genCount, setGenCount] = useState("");
const [generatedEmails, setGeneratedEmails] = useState([]);
const [withdrawBank, setWithdrawBank] = useState(user.bankType || "DANA");
const [withdrawAmount, setWithdrawAmount] = useState("");
const [withdrawNo, setWithdrawNo] = useState(user.bankNumber || "");

const currentUser = users.find(u => u.userid === user.userid) || user;
const saldo = currentUser.saldo;

const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 2600); };

const updateSaldo = async (newSaldo) => {
const updated = users.map(u => u.userid === user.userid ? { ...u, saldo: newSaldo } : u);
setUsers(updated);
await SDB.setUsers(updated);
};

const myEmails = emails.filter(e => e.ownerid === user.userid);
const pending  = myEmails.filter(e => e.status === "pending").length;
const accepted = myEmails.filter(e => e.status === "accepted").length;

const handleSetor = async () => {
const list = emailInput.trim().split(/[\n,]+/).map(e => e.trim()).filter(e => e.includes("@gmail.com"));
if (!selectedRoom) { showToast("⚠️ Pilih room dulu!"); return; }
if (!list.length)  { showToast("⚠️ Masukkan minimal 1 email Gmail!"); return; }
const room = ROOMS.find(r => r.id === selectedRoom);
if (!room?.open)   { showToast("🔒 Room ini sedang ditutup!"); return; }
const pay = `${withdrawBank.toLowerCase()}_${withdrawNo || "belum-diisi"}`;
const newEntries = list.map(email => createEmailEntry(email, user.userid, user.username, pay, room.name));
const updated = [...newEntries, ...emails];
setEmails(updated);
await SDB.setEmails(updated);
setEmailInput("");
showToast(`✅ ${list.length} email berhasil disetor!`);
};

const handleGenerate = () => {
const n = parseInt(genCount);
if (!n || n < 1 || n > 50) { showToast("⚠️ Masukkan angka 1–50!"); return; }
const chars = "abcdefghijklmnopqrstuvwxyz";
const emails = Array.from({ length: n }, () =>
Array.from({ length: 8 + Math.floor(Math.random() * 7) }, () =>
chars[Math.floor(Math.random() * 26)]).join("") +
Math.floor(Math.random() * 900 + 100) + "@gmail.com"
);
setGeneratedEmails(emails);
showToast(`✨ ${n} email digenerate!`);
};

const handleWithdraw = async () => {
const amt = parseInt(withdrawAmount);
if (!amt || amt < 1000)  { showToast("⚠️ Minimum Rp 1.000!"); return; }
if (amt > saldo)          { showToast("⚠️ Saldo tidak cukup!"); return; }
await updateSaldo(saldo - amt);
setWithdrawAmount("");
showToast(`💸 Withdraw ${fmtRp(amt)} diproses!`);
};

const bubbles = ["Halo halo! 🇮🇩", "Boo!! 👻", "Selamat datang! ✨", "Gaskeun setor! 🚀"];
const [bi] = useState(Math.floor(Math.random() * bubbles.length));

return (
<div className="app">
{/* Navbar */}
<div className="nb">
<div className="nb-logo">✉️ SetoranGmail</div>
<div className="nb-right">
<div className="chip">@{user.username}</div>
<div className="chip chip-id" title={user.userid}>{user.userid.slice(0, 14)}…</div>
<div className="chip">💳 {fmtRp(saldo)}</div>
<button className="btn-sm btn-purple">🤖 APK</button>
<button className="btn-sm btn-gray">❓ Tutorial</button>
</div>
</div>

<div className="banner">📢 Penyetoran dan pembayaran sedang di liburkan estimasi 2-3 hari setelah idul adha ya! mohon maaf atas ketidaknyamanannya.</div>  

  <div className="page">  
    {tab === "setor" && <SetoranPage user={user} myEmails={myEmails} pending={pending} accepted={accepted} saldo={saldo}  
      selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom}  
      emailInput={emailInput} setEmailInput={setEmailInput}  
      genCount={genCount} setGenCount={setGenCount}  
      generatedEmails={generatedEmails} setGeneratedEmails={setGeneratedEmails}  
      handleSetor={handleSetor} handleGenerate={handleGenerate} bubble={bubbles[bi]} />}  
    {tab === "saldo" && <SaldoPage saldo={saldo}  
      withdrawBank={withdrawBank} setWithdrawBank={setWithdrawBank}  
      withdrawAmount={withdrawAmount} setWithdrawAmount={setWithdrawAmount}  
      withdrawNo={withdrawNo} setWithdrawNo={setWithdrawNo}  
      handleWithdraw={handleWithdraw} myEmails={myEmails} />}  
    {tab === "riwayat" && <RiwayatPage myEmails={myEmails} histTab={histTab} setHistTab={setHistTab} />}  
    {tab === "profil" && <ProfilPage user={currentUser} users={users} setUsers={setUsers} onLogout={onLogout} showToast={showToast} />}  
  </div>  

  <div className="bnav">  
    {[["setor","📤","Setor"],["saldo","💳","Saldo"],["riwayat","🕐","Riwayat"],["profil","👤","Profil"]].map(([k,ic,lb]) => (  
      <button key={k} className={`bni ${tab===k?"active":""}`} onClick={() => setTab(k)}>  
        <div className="ni">{ic}</div>{lb}  
      </button>  
    ))}  
  </div>  
  <Toast msg={toast} />  
</div>

);
}

// ── Setor ─────────────────────────────────────────────────────────────────────
function SetoranPage({ user, myEmails, pending, accepted, saldo, selectedRoom, setSelectedRoom, emailInput, setEmailInput, genCount, setGenCount, generatedEmails, setGeneratedEmails, handleSetor, handleGenerate, bubble }) {
const room = ROOMS.find(r => r.id === selectedRoom);
return (
<>
<div className="hero">
<div className="hero-bubble">{bubble}</div>
<h2>✨ Hai, {user.username}!</h2>
<p>Mulai setor akun Gmail Anda hari ini.</p>
<div className="hero-robots">🤖</div>
</div>
<div className="info-grid">
<div className="ic bl"><h4>📅 Estimasi ACC 1-2 Hari</h4><p>Akun diproses setelah room ditutup.</p></div>
<div className="ic gl"><h4>⚡ Payout 1-2 Menit</h4><p>Setelah email berhasil di-ACC admin.</p></div>
</div>
<div className="stat-row">
<div className="sb"><div className="lbl">PENDING</div><div className="val">{pending}</div></div>
<div className="sb"><div className="lbl">DITERIMA</div><div className="val">{accepted}</div></div>
<div className="sb"><div className="lbl">SALDO</div><div className="val rp">{fmtRp(saldo)}</div></div>
</div>

{/* Leaderboard */}  
  <div className="card">  
    <div className="card-title">🏆 Leaderboard Mingguan</div>  
    <div style={{fontSize:11,color:"#888",marginBottom:9}}>2026-05-24 s/d 2026-05-30 · Reset 1j 7m lagi</div>  
    <div className="lb-prizes">  
      <div className="lb-p g"><div className="amt">Rp 100.000</div><div className="medal">🥇 Juara 1</div></div>  
      <div className="lb-p s"><div className="amt">Rp 75.000</div><div className="medal">🥈 Juara 2</div></div>  
      <div className="lb-p b"><div className="amt">Rp 50.000</div><div className="medal">🥉 Juara 3</div></div>  
    </div>  
    {LEADERBOARD.map(l => (  
      <div className="lb-row" key={l.rank}>  
        <div className="lb-rank">{l.rank}</div>  
        <div className="lb-name">{l.username}</div>  
        <div className="lb-acc" style={{marginRight:8}}>{l.acc} ACC</div>  
        <div className="lb-prize-val">{fmtRp(l.prize)}</div>  
      </div>  
    ))}  
    <div style={{background:"#eff6ff",padding:"9px 11px",borderRadius:10,fontSize:12,color:"#1d4ed8",fontWeight:600,marginTop:9}}>  
      Anda belum masuk top 10 — {accepted} ACC minggu ini  
    </div>  
  </div>  

  {/* Generate */}  
  <div className="card">  
    <div className="card-title">⭐ Generate Alamat Email</div>  
    <div className="fg">  
      <div className="fl"># Jumlah Email (maks. 50)</div>  
      <input className="fi" placeholder="Contoh: 5" value={genCount} onChange={e => setGenCount(e.target.value)} type="number" min={1} max={50} />  
    </div>  
    <button className="btn-p" onClick={handleGenerate}>⭐ Generate</button>  
    {generatedEmails.length > 0 && (  
      <>  
        <div className="gen-box">{generatedEmails.join("\n")}</div>  
        <button className="btn-o" style={{marginTop:7}} onClick={() => { setEmailInput(generatedEmails.join("\n")); setGeneratedEmails([]); }}>  
          📋 Pakai untuk Setoran  
        </button>  
      </>  
    )}  
  </div>  

  {/* Setor */}  
  <div className="card">  
    <div className="card-title">📤 Setor Email Baru</div>  
    <div className="fg">  
      <div className="fl">📋 Pilih Room</div>  
      <select className="fsel" value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)}>  
        <option value="">Pilih room...</option>  
        {ROOMS.map(r => <option key={r.id} value={r.id}>{r.name} — {fmtRp(r.payout)}/ACC {r.open?"✅":"🔒"}</option>)}  
      </select>  
    </div>  
    {room && !room.open && (  
      <div className="closed-box">  
        <div style={{fontSize:30}}>🔒</div>  
        <h3>SETORAN DITUTUP</h3>  
        <p>Room ini sedang ditutup. Silakan pilih room lain atau tunggu pembukaan.</p>  
      </div>  
    )}  
    <div className="fg">  
      <div className="fl">📝 Daftar Email (1 baris = 1 email)</div>  
      <textarea className="fta" placeholder={"user1@gmail.com\nuser2@gmail.com\n..."} value={emailInput} onChange={e => setEmailInput(e.target.value)} />  
    </div>  
    <button className="btn-p" onClick={handleSetor}>🚀 Kirim Setoran</button>  
    <div style={{marginTop:9,fontSize:11,color:"#888",textAlign:"center"}}>Max 500 email per setoran · Hanya akun @gmail.com</div>  
  </div>  
</>

);
}

// ── Saldo ─────────────────────────────────────────────────────────────────────
function SaldoPage({ saldo, withdrawBank, setWithdrawBank, withdrawAmount, setWithdrawAmount, withdrawNo, setWithdrawNo, handleWithdraw, myEmails }) {
return (
<>
<div className="phdr">
<h2>💳 Keuangan</h2>
<p>Kelola penarikan dan riwayat transaksi.</p>
<div className="phdr-bg">💳</div>
</div>
<div className="card">
<div className="card-title">💳 Penarikan Saldo</div>
<div className="saldo-big">
<div className="saldo-lbl">Saldo Tersedia</div>
<div className="saldo-val">{fmtRp(saldo)}</div>
</div>
<div className="al al-i">ℹ️ <div>E-Wallet (DANA, GoPay, OVO) — pembayaran <b>LANGSUNG</b> saat email di-ACC.</div></div>
<div className="al al-s">⚡ <div><b>Estimasi pencairan 1–2 menit</b><br/><span style={{fontSize:11}}>Dana dikirim setelah admin ACC email Anda.</span></div></div>
<div className="fg"><div className="fl">💳 Bank / E-Wallet</div>
<select className="fsel" value={withdrawBank} onChange={e => setWithdrawBank(e.target.value)}>
{["DANA","GoPay","OVO","BCA","BRI","Mandiri"].map(b => <option key={b}>{b}</option>)}
</select>
</div>
<div className="fg"><div className="fl">💰 Jumlah (Rp)</div>
<input className="fi" placeholder="Min. 1.000" type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} />
</div>
<div className="fg"><div className="fl">📱 Nomor Rekening / ID</div>
<input className="fi" value={withdrawNo} onChange={e => setWithdrawNo(e.target.value)} />
</div>
<button className="btn-p" onClick={handleWithdraw}>📤 Request Penarikan</button>
</div>

<div className="card">  
    <div className="card-title">📒 Buku Mutasi</div>  
    {myEmails.filter(e => e.status === "accepted").length === 0 && (  
      <div style={{color:"#bbb",fontSize:12,textAlign:"center",padding:"12px 0"}}>Belum ada transaksi</div>  
    )}  
    {myEmails.filter(e => e.status === "accepted").map(e => (  
      <div className="mi" key={e.id}>  
        <div className="mi-title">✅ ACC — {e.room} ({paymentLabel(e.paymentOwner)})</div>  
        <div className="mi-date">{fmtDate(e.timestamp)}</div>  
        <div style={{fontSize:10,color:"#10b981",fontWeight:700}}>[COMPLETED] {e.processedAt ? fmtDate(e.processedAt) : "-"}</div>  
        <div className="mi-amt green">+ {fmtRp(e.payout)}</div>  
      </div>  
    ))}  
  </div>  
</>

);
}

// ── Riwayat ───────────────────────────────────────────────────────────────────
function RiwayatPage({ myEmails, histTab, setHistTab }) {
  return (
    <>
      <div className="phdr">
        <h2>🕐 Riwayat</h2>
        <p>Semua aktivitas setoran akun Anda.</p>
        <div className="phdr-bg">🕐</div>
      </div>

      <div className="card">
        <div className="tab-bar">
          <button
            className={`tab ${histTab === "setoran" ? "active" : ""}`}
            onClick={() => setHistTab("setoran")}
          >
            📤 Setoran
          </button>

          <button
            className={`tab ${histTab === "penarikan" ? "active" : ""}`}
            onClick={() => setHistTab("penarikan")}
          >
            💳 Penarikan
          </button>
        </div>

        {histTab === "setoran" && (
          myEmails.length === 0 ? (
            <div style={{ color: "#bbb", fontSize: 12, textAlign: "center", padding: 14 }}>
              Belum ada setoran
            </div>
          ) : (
            myEmails.map(e => (
              <div key={e.id}>
                <div>{e.email}</div>
              </div>
            ))
          )
        )}

        {histTab === "penarikan" && (
          <div style={{ color: "#bbb", fontSize: 12, textAlign: "center", padding: 14 }}>
            Belum ada penarikan
          </div>
        )}
      </div>
    </>
  );
}

// ── Profil ────────────────────────────────────────────────────────────────────
function ProfilPage({ user, users, setUsers, onLogout, showToast }) {
const [editing, setEditing] = useState(false);
const [form, setForm] = useState({ bankType: user.bankType, bankNumber: user.bankNumber });

const saveBank = async () => {
const updated = users.map(u => u.userid === user.userid ? { ...u, ...form } : u);
setUsers(updated);
await SDB.setUsers(updated);
setEditing(false);
showToast("✅ Akun bank disimpan!");
};

const copyApiKey = () => { navigator.clipboard?.writeText(user.apiKey); showToast("📋 API key disalin!"); };

return (
<>
<div className="ph">
<div style={{fontSize:44,marginBottom:7}}>👤</div>
<h2>@{user.username}</h2>
<p>{user.email}</p>
</div>
<div className="card pc">
<div className="card-title">🆔 Identitas Akun</div>
<div className="ir"><div className="ik">USER ID</div></div>
<div style={{fontFamily:"monospace",fontSize:12,background:"#f0f2f8",padding:"6px 10px",borderRadius:8,wordBreak:"break-all",marginBottom:6}}>{user.userid}</div>
<div className="ir"><div className="ik">USERNAME</div><div className="iv">@{user.username}</div></div>
<div className="ir"><div className="ik">EMAIL</div><div className="iv" style={{fontSize:12,wordBreak:"break-all"}}>{user.email}</div></div>
<div className="ir"><div className="ik">DAFTAR</div><div className="iv" style={{fontSize:11}}>{fmtDate(user.createdAt)}</div></div>
<span className="tag">✅ TERVERIFIKASI</span>
</div>

<div className="card">  
    <div className="card-title">🏦 Akun Bank Default</div>  
    {editing ? (  
      <>  
        <div className="fg"><div className="fl">Bank / E-Wallet</div>  
          <select className="fsel" value={form.bankType} onChange={e => setForm(f => ({...f,bankType:e.target.value}))}>  
            {["DANA","GoPay","OVO","BCA","BRI","Mandiri"].map(b => <option key={b}>{b}</option>)}  
          </select>  
        </div>  
        <div className="fg"><div className="fl">Nomor Rekening / ID</div>  
          <input className="fi" value={form.bankNumber} onChange={e => setForm(f => ({...f,bankNumber:e.target.value}))} />  
        </div>  
        <button className="btn-p" onClick={saveBank}>💾 Simpan</button>  
      </>  
    ) : (  
      <>  
        <div className="ir"><div className="ik">METODE</div><div className="iv">{user.bankType || "-"}</div></div>  
        <div className="ir"><div className="ik">NOMOR</div><div className="iv">{user.bankNumber || "-"}</div></div>  
        <button className="btn-p" style={{marginTop:10}} onClick={() => setEditing(true)}>✏️ Ubah</button>  
      </>  
    )}  
  </div>  

  <div className="card">  
    <div className="card-title">&lt;/&gt; API Key</div>  
    <div style={{fontFamily:"monospace",fontSize:11,background:"#f8f9ff",padding:"9px 11px",borderRadius:10,wordBreak:"break-all",marginBottom:9}}>{user.apiKey}</div>  
    <div className="al al-i" style={{marginBottom:10}}>🛡️ Jaga kerahasiaan API key Anda. Jangan bagikan ke siapapun!</div>  
    <button className="btn-o" style={{marginBottom:7}} onClick={copyApiKey}>📋 Copy API Key</button>  
    <button className="btn-p">🔄 Regenerate</button>  
  </div>  

  <div className="card" style={{textAlign:"center"}}>  
    <button onClick={onLogout} style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444",fontWeight:800,fontSize:14,fontFamily:"inherit",padding:8}}>  
      🚪 Keluar Akun  
    </button>  
  </div>  
</>

);
}

// ══ Admin App ══════════════════════════════════════════════════════════════════
function AdminApp({ user, emails, setEmails, users, onLogout }) {
const [toast, setToast] = useState("");
const [adminTab, setAdminTab] = useState("pending");
const [denyReason, setDenyReason] = useState({});
const [search, setSearch] = useState("");

const showToast = msg => { setToast(msg); setTimeout(() => setToast(""), 2500); };

const handle = async (id, action) => {
const entry = emails.find(e => e.id === id);
const room  = ROOMS.find(r => r.name === entry?.room);
const payout = action === "accepted" ? (room?.payout || 3500) : 0;

const updated = emails.map(e => e.id === id ? {  
  ...e,  
  status: action,  
  payout,  
  reason: action === "denied" ? (denyReason[id] || "akun terkena verifikasi robot — cek di checkgmail.online") : null,  
  processedAt: new Date().toISOString(),  
} : e);  

// Update saldo user if accepted  
if (action === "accepted" && entry) {  
  const ownerId = entry.ownerid;  
  const updatedUsers = users.map(u => u.userid === ownerId ? { ...u, saldo: u.saldo + payout } : u);  
  await SDB.setUsers(updatedUsers);  
}  

setEmails(updated);  
await SDB.setEmails(updated);  
showToast(action === "accepted" ? "✅ Email di-ACC! Saldo user diupdate." : "❌ Email di-DENY!");

};

// Search: filter by email, ownerUsername, or userid
const q = search.toLowerCase().trim();
const allFiltered = q
? emails.filter(e =>
e.email.toLowerCase().includes(q) ||
e.ownerUsername.toLowerCase().includes(q) ||
e.ownerid.toLowerCase().includes(q) ||
e.room.toLowerCase().includes(q)
)
: emails.filter(e =>
adminTab === "pending" ? e.status === "pending" :
adminTab === "accepted" ? e.status === "accepted" : e.status === "denied"
);

const shown = q ? allFiltered : allFiltered;

const counts = {
pending:  emails.filter(e => e.status === "pending").length,
accepted: emails.filter(e => e.status === "accepted").length,
denied:   emails.filter(e => e.status === "denied").length,
};

return (
<div className="app">
<div className="adm-hdr">
<h1>🛡️ Admin Panel</h1>
<div style={{fontSize:12,opacity:.8}}>@{user.username} · {user.email}</div>
</div>

<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,padding:"0 12px 12px"}}>  
    <div className="adm-stat"><div className="n">{counts.pending}</div><div className="l">Pending</div></div>  
    <div className="adm-stat"><div className="n" style={{color:"#10b981"}}>{counts.accepted}</div><div className="l">ACC</div></div>  
    <div className="adm-stat"><div className="n" style={{color:"#ef4444"}}>{counts.denied}</div><div className="l">Denied</div></div>  
  </div>  

  <div style={{padding:"0 12px 12px"}}>  
    {/* Search */}  
    <div className="search-box">  
      <span className="search-icon">🔍</span>  
      <input  
        className="fi"  
        placeholder="Cari email, username, userid, atau room..."  
        value={search}  
        onChange={e => setSearch(e.target.value)}  
      />  
    </div>  

    {!q && (  
      <div className="tab-bar">  
        <button className={`tab ${adminTab==="pending"?"active":""}`} onClick={() => setAdminTab("pending")}>⏳ Pending</button>  
        <button className={`tab ${adminTab==="accepted"?"active":""}`} onClick={() => setAdminTab("accepted")}>✅ ACC</button>  
        <button className={`tab ${adminTab==="denied"?"active":""}`} onClick={() => setAdminTab("denied")}>❌ Denied</button>  
      </div>  
    )}  

    {q && (  
      <div className="al al-i" style={{marginBottom:10}}>  
        🔍 Menampilkan {shown.length} hasil untuk "<b>{search}</b>"  
      </div>  
    )}  

    <div className="card" style={{margin:0}}>  
      {shown.length === 0 && (  
        <div style={{color:"#bbb",textAlign:"center",padding:16,fontSize:12}}>  
          {q ? "Tidak ada hasil pencarian" : "Tidak ada data"}  
        </div>  
      )}  
      {shown.map(e => (  
        <div className="ai" key={e.id}>  
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>  
            <div style={{flex:1}}>  
              <div style={{fontWeight:700,fontSize:13,wordBreak:"break-all"}}>{e.email}</div>  
              <div style={{fontSize:11,color:"#888"}}>@{e.ownerUsername} · <span style={{fontFamily:"monospace",fontSize:10,color:"#aaa"}}>{e.ownerid}</span></div>  
              <div style={{fontSize:11,color:"#7c3aed",fontWeight:600}}>💳 {paymentLabel(e.paymentOwner)}</div>  
              <div style={{fontSize:10,color:"#aaa"}}>{e.room} · {fmtDate(e.timestamp)}</div>  
            </div>  
            <span className={`badge ${e.status==="accepted"?"b-acc":e.status==="denied"?"b-den":"b-pen"}`}>  
              {e.status==="accepted"?"✔ ACC":e.status==="denied"?"✖ DENIED":"⏳ PENDING"}  
            </span>  
          </div>  
          {e.reason && (  
            <div style={{fontSize:11,color:"#991b1b",background:"#fef2f2",padding:"5px 9px",borderRadius:8}}>{e.reason}</div>  
          )}  
          {e.status === "pending" && (  
            <>  
              <input className="fi" style={{fontSize:11,padding:"7px 10px"}}  
                placeholder="Alasan deny (opsional — default: verifikasi robot)"  
                value={denyReason[e.id] || ""}  
                onChange={ev => setDenyReason(d => ({...d, [e.id]: ev.target.value}))} />  
              <div className="aa">  
                <button className="btn-acc" onClick={() => handle(e.id, "accepted")}>✔ ACC</button>  
                <button className="btn-den" onClick={() => handle(e.id, "denied")}>✖ DENY</button>  
              </div>  
            </>  
          )}  
        </div>  
      ))}  
    </div>  

    <div style={{textAlign:"center",marginTop:16,paddingBottom:24}}>  
      <button onClick={onLogout} style={{background:"none",border:"none",cursor:"pointer",color:"#ef4444",fontWeight:800,fontSize:13,fontFamily:"inherit"}}>  
        🚪 Keluar Admin  
      </button>  
    </div>  
  </div>  
  <Toast msg={toast} />  
</div>

);
}

// ══ Root ═══════════════════════════════════════════════════════════════════════
export default function App() {
const [currentUser, setCurrentUser] = useState(null);
const [users,  setUsers]  = useState([]);
const [emails, setEmails] = useState([]);
const [ready,  setReady]  = useState(false);

// Load data from persistent storage on mount
useEffect(() => {
(async () => {
const [u, e, s] = await Promise.all([SDB.getUsers(), SDB.getEmails(), SDB.getSession()]);
setUsers(u);
setEmails(e);
if (s) {
// Re-validate session user still exists
const fresh = u.find(x => x.userid === s.userid);
if (fresh) setCurrentUser(fresh);
}
setReady(true);
})();
}, []);

const handleLogin  = u => setCurrentUser(u);
const handleLogout = async () => { await SDB.clearSession(); setCurrentUser(null); };

if (!ready) return <><style>{CSS}</style><div className="loading">⚙️</div></>;

return (
<>
<style>{CSS}</style>
{!currentUser && <LoginPage onLogin={handleLogin} users={users} setUsers={setUsers} />}
{currentUser?.role === "admin" && (
<AdminApp user={currentUser} emails={emails} setEmails={setEmails} users={users} onLogout={handleLogout} />
)}
{currentUser?.role === "user" && (
<UserApp user={currentUser} users={users} setUsers={setUsers} emails={emails} setEmails={setEmails} onLogout={handleLogout} />
)}
</>
);
  }
