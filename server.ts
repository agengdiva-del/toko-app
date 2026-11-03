/**
 * Arjawinangun Delivery (AWD) - Full-Stack Express Backend Server
 * Serves the REST API (/api/v1/*), AWD Admin Panel (/admin), and mounts Vite dev middleware.
 */

import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

// Body Parsers with generous limit for base64 photo uploads
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Static files from /public (e.g. config.js, supabase-layer.js, assets)
app.use(express.static(path.resolve(__dirname, 'public')));

// CORS headers for API calls
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Data persistence path
const DATA_DIR = path.resolve(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'awd_database.json');

// Initial seed data from Arjawinangun Delivery Ecosystem (synchronized with https://suderyderry.github.io/awd-admin/)
function getInitialData() {
  const ST = [
    'Jl. Raya Arjawinangun',
    'Jl. Ki Hajar Dewantara',
    'Jl. Pahlawan',
    'Jl. Cirebon–Bandung',
    'Jl. Mawar',
  ];
  const BL = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];

  const raw = {
    merchant: [
      ['Warung Bu Iis', 'Imas S.', 'Arjawinangun', 412, 0],
      ['Toko Kue Sari Rasa', 'Rina W.', 'Susukan', 327, 0],
      ['Bakso Pak Darto', 'Darto', 'Palimanan', 289, 1],
      ['Kopi Sawah', 'Yoga P.', 'Gegesik', 251, 0],
      ['Ayam Geprek Mantap', 'Dewi A.', 'Weru', 198, 0],
      ['Apotek Sehat', 'H. Rosid', 'Plumbon', 143, 2],
    ],
    driver: [
      ['Asep Ruhiyat', 'Honda Beat', 'Arjawinangun', 864, 0],
      ['Nandang S.', 'Yamaha Mio', 'Klangenan', 702, 0],
      ['Tono Wijaya', 'Honda Vario', 'Palimanan', 655, 1],
      ['Yayan Mulyana', 'Suzuki Satria', 'Jamblang', 590, 0],
      ['Dede Kurnia', 'Honda Scoopy', 'Weru', 12, 2],
      ['Iwan Setiawan', 'Yamaha NMAX', 'Gegesik', 431, 0],
    ],
    customer: [
      ['Siti Aminah', '0812-3456-0001', 'Arjawinangun', 58, 0],
      ['Budi Hartono', '0813-2211-0042', 'Susukan', 41, 0],
      ['Lilis Suryani', '0857-9000-0123', 'Palimanan', 37, 0],
      ['Agus Salim', '0821-7788-0456', 'Plumbon', 9, 1],
      ['Nur Hidayah', '0896-1234-0789', 'Gegesik', 22, 0],
      ['Fajar R.', '0878-5555-0321', 'Weru', 3, 2],
    ],
  };

  const T_STATUS: Record<string, string[]> = {
    merchant: ['Buka', 'Tutup', 'Ditangguhkan'],
    driver: ['Aktif', 'Tidak aktif', 'Menunggu verifikasi'],
    customer: ['Aktif', 'Belum verifikasi', 'Diblokir'],
  };

  let seq = 1;
  const D: any[] = [];

  const mx = (t: string, q: number, nm: string) => {
    const o: any = {
      email: t === 'customer' && q % 2 ? '' : nm.toLowerCase().replace(/[^a-z0-9]+/g, '.') + '@mail.id',
      login: ['OTP', 'Kata sandi', 'OTP', 'Akun Google'][q % 4],
      gps: '-6.7' + (10 + q) + ', 108.4' + (20 + q),
    };
    if (t === 'merchant') {
      Object.assign(o, {
        kat: ['Makanan', 'Kue', 'Makanan', 'Minuman', 'Makanan', 'Obat & kesehatan'][q % 6],
        jam: '07.00-21.00',
        ktp: '3209' + String(100000000000 + q * 7919),
        ktpf: 'ktp_' + q + '.jpg',
        bank: 'BRI',
        rek: '0021' + String(10000000 + q * 313),
        an: nm,
        vf: 'Disetujui',
      });
    }
    if (t === 'driver') {
      Object.assign(o, {
        ktp: '3209' + String(100000000000 + q * 7919),
        ktpf: 'ktp_' + q + '.jpg',
        sim: '1234' + String(10000000 + q * 3571),
        simf: 'sim_' + q + '.jpg',
        stnkf: 'stnk_' + q + '.jpg',
        bank: 'DANA',
        rek: '0812' + String(1000000 + q * 771),
        an: nm,
        vf: 'Disetujui',
      });
    }
    if (t === 'customer') {
      o.pay = q % 2 ? 'COD (bayar di tempat)' : 'Digital (QRIS/transfer/dompet)';
    }
    return o;
  };

  for (const t of Object.keys(raw) as (keyof typeof raw)[]) {
    raw[t].forEach((r) => {
      const q = seq++;
      D.push({
        id: t[0].toUpperCase() + q,
        t,
        name: r[0],
        sub: r[1],
        area: r[2],
        n: r[3],
        r: (4 + ((q * 7) % 10) / 10).toFixed(1),
        s: T_STATUS[t][r[4] as number],
        adr: ST[q % 5] + ' No. ' + (((q * 7) % 60) + 1) + ', ' + r[2],
        hp: t === 'customer' ? r[1] : '08' + (12 + (q % 9)) + '-' + ((1000 + q * 37) % 9000) + '-' + ((1000 + q * 53) % 9000),
        plate: 'E ' + ((2000 + q * 131) % 8000) + ' ' + ['AB', 'CD', 'XY', 'QZ'][q % 4],
        jn: BL[q % 6] + ' 2026',
        x: mx(t, q, r[0] as string),
      });
    });
  }

  const PR: Record<string, any[]> = {};
  let pq = 1;

  const PRD: Record<string, [string, string, number, number][]> = {
    'Warung Bu Iis': [
      ['Nasi Jamblang Komplit', 'Makanan', 18000, 40],
      ['Empal Gentong', 'Makanan', 25000, 25],
      ['Tahu Gejrot', 'Camilan', 8000, 30],
      ['Es Teh Manis', 'Minuman', 4000, 80],
    ],
    'Toko Kue Sari Rasa': [
      ['Brownies Kukus', 'Kue', 35000, 20],
      ['Kue Lapis Legit', 'Kue', 60000, 8],
      ['Nastar (toples)', 'Kue kering', 45000, 15],
    ],
    'Bakso Pak Darto': [
      ['Bakso Urat', 'Makanan', 20000, 35],
      ['Mie Ayam Bakso', 'Makanan', 18000, 30],
      ['Es Jeruk', 'Minuman', 5000, 60],
    ],
    'Kopi Sawah': [
      ['Kopi Susu Gula Aren', 'Minuman', 16000, 50],
      ['Es Kopi Hitam', 'Minuman', 12000, 40],
      ['Roti Bakar Cokelat', 'Camilan', 14000, 25],
    ],
    'Ayam Geprek Mantap': [
      ['Ayam Geprek Level 1', 'Makanan', 17000, 45],
      ['Ayam Geprek Level 3', 'Makanan', 18000, 45],
      ['Nasi Putih', 'Makanan', 4000, 99],
    ],
    'Apotek Sehat': [
      ['Paracetamol (strip)', 'Obat bebas', 6000, 70],
      ['Vitamin C 500 mg', 'Suplemen', 22000, 40],
      ['Masker Medis (kotak)', 'Alat kesehatan', 25000, 9],
    ],
  };

  D.filter((r) => r.t === 'merchant').forEach((r) => {
    PR[r.id] = (PRD[r.name] || [
      ['Paket Makanan Spesial', 'Makanan', 25000, 30],
      ['Minuman Segar', 'Minuman', 7000, 50],
    ]).map((a, j) => ({
      id: 'P' + pq++,
      n: a[0],
      k: a[1],
      h: a[2],
      st: a[3],
      on: 1,
      kd: r.id + '-' + String(j + 1).padStart(3, '0'),
      d: 'Menu terlaris di Arjawinangun Delivery.',
      img: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    }));
  });

  const V = [
    { t: 'merchant', v: '2.4.1', min: '2.3.0', ad: 86, fu: 0, mt: 0, ft: { Promosi: 1, Chat: 1, 'Stok otomatis': 1 }, an: '' },
    { t: 'driver', v: '3.1.0', min: '3.0.0', ad: 74, fu: 0, mt: 0, ft: { Navigasi: 1, 'Bukti foto': 1, 'Mode malam': 0 }, an: '' },
    { t: 'customer', v: '5.0.2', min: '4.9.0', ad: 91, fu: 0, mt: 0, ft: { 'Bayar QRIS': 1, Ulasan: 1, 'Lacak langsung': 1 }, an: '' },
  ];

  const O = [
    { id: 'ORD-2401', c: 'Siti Aminah', m: 'Warung Bu Iis', d: 'Asep Ruhiyat', s: 'Diantar', p: 48500 },
    { id: 'ORD-2402', c: 'Budi Hartono', m: 'Toko Kue Sari Rasa', d: '', s: 'Baru', p: 92000 },
    { id: 'ORD-2403', c: 'Lilis Suryani', m: 'Kopi Sawah', d: 'Nandang S.', s: 'Diproses', p: 36000 },
    { id: 'ORD-2404', c: 'Nur Hidayah', m: 'Ayam Geprek Mantap', d: 'Yayan Mulyana', s: 'Selesai', p: 54000 },
    { id: 'ORD-2405', c: 'Agus Salim', m: 'Bakso Pak Darto', d: '', s: 'Dibatalkan', p: 27000 },
  ];

  const CMS = [
    { n: 'Promo Gratis Ongkir Jumat', on: 1, jn: 'Diskon ongkir', ds: 'Gratis ongkir untuk pesanan di atas Rp 30.000 setiap hari Jumat.', img: '', pos: 'Tengah', link: '', st: '', en: '' },
    { n: 'Festival Kuliner Arjawinangun', on: 1, jn: 'Festival kuliner', ds: 'Jelajahi jajanan khas Arjawinangun bersama toko pilihan.', img: '', pos: 'Tengah', link: '', st: '', en: '' },
    { n: 'Ajak Teman, Dapat Voucher', on: 0, jn: 'Voucher', ds: 'Bagikan kode referral dan dapatkan voucher untuk Anda dan teman.', img: '', pos: 'Tengah', link: '', st: '', en: '' },
  ];

  const BN = { w: 1080, h: 540 };

  const NT = [
    { to: 'Semua pengguna', ti: 'Pemeliharaan Server Rutin', tm: 'Hari ini' },
    { to: 'Toko', ti: 'Fitur variasi menu baru aktif', tm: 'Hari ini' },
    { to: 'Driver', ti: 'Insentif jam sibuk aktif', tm: 'Kemarin' },
  ];

  const SET = { kom: '12', jam: '07.00 – 22.00', reg_m: 1, reg_d: 1, ver_d: 1, mt: 0 };

  const INB = [
    {
      id: 'M1',
      role: 'customer',
      from: 'Siti Aminah',
      subj: 'Pesanan terlambat (#C-118)',
      tm: '08.12',
      un: 1,
      msgs: [{ me: 0, tx: 'Pesanan saya ORD-2401 sudah 40 menit belum sampai. Mohon dicek ya.', tm: '08.12' }],
    },
    {
      id: 'M2',
      role: 'merchant',
      from: 'Warung Bu Iis',
      subj: 'Stok Nasi Jamblang habis',
      tm: '07.55',
      un: 1,
      msgs: [{ me: 0, tx: 'Stok Nasi Jamblang Komplit habis. Bagaimana cara menyembunyikan produk dari aplikasi pelanggan?', tm: '07.55' }],
    },
    {
      id: 'M3',
      role: 'driver',
      from: 'Asep Ruhiyat',
      subj: 'Pelanggan tidak bisa dihubungi',
      tm: '07.40',
      un: 1,
      msgs: [{ me: 0, tx: 'Pelanggan ORD-2403 tidak mengangkat telepon dan tidak ada di lokasi. Mohon arahan.', tm: '07.40' }],
    },
    {
      id: 'M4',
      role: 'customer',
      from: 'Budi Hartono',
      subj: 'Cara memakai voucher',
      tm: 'Kemarin',
      un: 0,
      msgs: [
        { me: 0, tx: 'Voucher gratis ongkir kok tidak bisa dipakai?', tm: '16.20' },
        { me: 1, tx: 'Voucher berlaku untuk pesanan di atas Rp 30.000. Silakan coba lagi ya.', tm: '16.45' },
      ],
    },
    {
      id: 'M5',
      role: 'merchant',
      from: 'Kopi Sawah',
      subj: 'Pencairan dana belum masuk',
      tm: 'Kemarin',
      un: 0,
      msgs: [{ me: 0, tx: 'Dana pesanan minggu lalu belum masuk rekening.', tm: '10.02' }],
    },
  ];

  const JN = [
    'Promo',
    'Festival kuliner',
    'Diskon ongkir',
    'Voucher',
    'Pengumuman',
    'Event',
    'Lainnya',
  ];

  const AU = [
    { t: '09:12', u: 'Admin Utama', m: 'Backend AWD dimulai dan siap menerima koneksi' },
    { t: '08:45', u: 'Sistem AWD', m: 'Sinkronisasi database Arjawinangun Delivery selesai' },
  ];

  return { D, PR, V, O, CMS, BN, NT, SET, INB, JN, AU };
}

// Database holder in memory
let db = getInitialData();

// Load from disk if exists
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (fs.existsSync(DB_FILE)) {
    const rawData = fs.readFileSync(DB_FILE, 'utf-8');
    db = JSON.parse(rawData);
    console.log('[AWD Backend] Loaded database from disk:', DB_FILE);
  } else {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
    console.log('[AWD Backend] Initialized new database at:', DB_FILE);
  }
} catch (err) {
  console.error('[AWD Backend] Database file init error:', err);
}

// Helper to persist database
function saveDb() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('[AWD Backend] Error saving database to disk:', err);
  }
}

// Helper to log audit event
function addAuditLog(m: string, u: string = 'Admin') {
  const d = new Date();
  const t = d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0');
  db.AU.unshift({ t, u, m });
  if (db.AU.length > 100) db.AU.pop();
  saveDb();
}

// ==========================================
// REST API v1 ROUTES (/api/v1/*)
// ==========================================

// 1. Health & Full Database Snapshot
app.get('/api/v1/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    app: 'Arjawinangun Delivery (AWD) Full-Stack Backend',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/v1/data', (req: Request, res: Response) => {
  res.json(db);
});

// 2. Pengguna (Users: Merchant, Driver, Customer)
app.get('/api/v1/pengguna', (req: Request, res: Response) => {
  const { role, status, q } = req.query;
  let list = db.D;
  if (role) {
    list = list.filter((r) => r.t === role);
  }
  if (status) {
    list = list.filter((r) => r.s === status);
  }
  if (q) {
    const term = String(q).toLowerCase();
    list = list.filter((r) => (r.name + r.sub + r.area + r.id).toLowerCase().includes(term));
  }
  res.json(list);
});

app.get('/api/v1/pengguna/:role/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const user = db.D.find((r) => r.id === id);
  if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
  res.json(user);
});

app.post('/api/v1/pengguna/:role', (req: Request, res: Response) => {
  const { role } = req.params;
  const body = req.body;
  const nextId = (role[0].toUpperCase()) + (db.D.length + 10);
  const newUser = {
    id: nextId,
    t: role,
    name: body.name || body.storeName || 'Pengguna Baru',
    sub: body.sub || body.ownerName || body.phone || '',
    area: body.area || body.district || 'Arjawinangun',
    n: 0,
    r: '5.0',
    s: role === 'merchant' ? 'Buka' : 'Aktif',
    adr: body.adr || body.fullAddress || 'Arjawinangun, Cirebon',
    hp: body.hp || body.ownerPhone || '085224158990',
    plate: body.plate || '',
    jn: 'Nov 2026',
    x: {
      email: body.email || '',
      login: 'Kata sandi',
      gps: body.gps || '-6.6508, 108.4124',
      vf: role === 'customer' ? 'Disetujui' : 'Menunggu',
      ...body,
    },
  };

  db.D.unshift(newUser);
  addAuditLog(`Mendaftarkan ${role} baru: ${newUser.name} (${newUser.id})`, 'Sistem Pendaftaran');
  res.status(201).json(newUser);
});

app.put('/api/v1/pengguna/:role/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.D.findIndex((r) => r.id === id);
  if (index === -1) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

  const existing = db.D[index];
  const updated = {
    ...existing,
    ...req.body,
    x: {
      ...(existing.x || {}),
      ...(req.body.x || {}),
    },
  };

  db.D[index] = updated;
  addAuditLog(`Memperbarui data pengguna ${id} (${updated.name})`, 'Admin');
  res.json(updated);
});

app.delete('/api/v1/pengguna/:role/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const index = db.D.findIndex((r) => r.id === id);
  if (index === -1) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

  const deleted = db.D.splice(index, 1)[0];
  delete db.PR[id];
  addAuditLog(`Menghapus ${deleted.t} ${deleted.name} (${id})`, 'Admin');
  res.json({ success: true, deleted });
});

app.put('/api/v1/pengguna/:id/verifikasi', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, alasan } = req.body;
  const user = db.D.find((r) => r.id === id);
  if (!user) return res.status(404).json({ error: 'Pengguna tidak ditemukan' });

  user.x = user.x || {};
  user.x.vf = status;
  if (status === 'Ditolak') {
    user.x.alasan = alasan || 'Dokumen belum lengkap';
  } else {
    delete user.x.alasan;
    if (user.s === 'Menunggu verifikasi') {
      user.s = user.t === 'merchant' ? 'Buka' : 'Aktif';
    }
  }

  addAuditLog(`Status verifikasi ${user.name} (${id}) diubah menjadi ${status}`, 'Admin');
  res.json(user);
});

// 3. Produk (/api/v1/produk)
app.get('/api/v1/produk', (req: Request, res: Response) => {
  const { merchantId } = req.query;
  if (merchantId) {
    return res.json(db.PR[String(merchantId)] || []);
  }
  res.json(db.PR);
});

app.post('/api/v1/produk', (req: Request, res: Response) => {
  const { merchantId, n, k, kd, h, st, d, img, variants } = req.body;
  const storeId = merchantId || Object.keys(db.PR)[0] || 'M1';
  db.PR[storeId] = db.PR[storeId] || [];

  const newProduct = {
    id: 'P' + Date.now(),
    n: n || 'Menu Baru',
    k: k || 'Makanan',
    kd: kd || storeId + '-PRD-' + (db.PR[storeId].length + 1),
    h: Number(h) || 20000,
    st: Number(st) || 20,
    d: d || '',
    img: img || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=400&q=80',
    on: 1,
    variants: variants || [],
  };

  db.PR[storeId].unshift(newProduct);
  addAuditLog(`Menambah produk ${newProduct.n} (${newProduct.kd}) di toko ${storeId}`, 'Merchant');
  res.status(201).json(newProduct);
});

app.put('/api/v1/produk/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let found = false;
  let updatedProduct: any = null;

  for (const storeId of Object.keys(db.PR)) {
    const pIndex = db.PR[storeId].findIndex((p) => p.id === id);
    if (pIndex !== -1) {
      db.PR[storeId][pIndex] = {
        ...db.PR[storeId][pIndex],
        ...req.body,
      };
      updatedProduct = db.PR[storeId][pIndex];
      found = true;
      break;
    }
  }

  if (!found) return res.status(404).json({ error: 'Produk tidak ditemukan' });
  addAuditLog(`Mengubah produk ${updatedProduct.n} (${id})`, 'Merchant');
  res.json(updatedProduct);
});

app.delete('/api/v1/produk/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  let deleted = false;

  for (const storeId of Object.keys(db.PR)) {
    const pIndex = db.PR[storeId].findIndex((p) => p.id === id);
    if (pIndex !== -1) {
      db.PR[storeId].splice(pIndex, 1);
      deleted = true;
      break;
    }
  }

  if (!deleted) return res.status(404).json({ error: 'Produk tidak ditemukan' });
  addAuditLog(`Menghapus produk ${id}`, 'Merchant');
  res.json({ success: true, id });
});

// 4. Pesanan (/api/v1/pesanan)
app.get('/api/v1/pesanan', (req: Request, res: Response) => {
  res.json(db.O);
});

app.post('/api/v1/pesanan', (req: Request, res: Response) => {
  const { c, m, d, s, p } = req.body;
  const newOrder = {
    id: 'ORD-' + (db.O.length + 2405),
    c: c || 'Pelanggan AWD',
    m: m || 'Warung Nasi Jamblang & Empal Bu Siti',
    d: d || '',
    s: s || 'Baru',
    p: Number(p) || 35000,
  };

  db.O.unshift(newOrder);
  addAuditLog(`Pesanan baru masuk: ${newOrder.id} (${newOrder.c} → ${newOrder.m})`, 'Pelanggan');
  res.status(201).json(newOrder);
});

app.put('/api/v1/pesanan/:id/status', (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, driver } = req.body;
  const order = db.O.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });

  order.s = status || order.s;
  if (driver) order.d = driver;
  addAuditLog(`Status pesanan ${id} diubah menjadi ${order.s}`, 'Sistem');
  res.json(order);
});

app.post('/api/v1/pesanan/:id/assign', (req: Request, res: Response) => {
  const { id } = req.params;
  const { driver } = req.body;
  const order = db.O.find((o) => o.id === id);
  if (!order) return res.status(404).json({ error: 'Pesanan tidak ditemukan' });

  order.d = driver;
  if (order.s === 'Baru') order.s = 'Diproses';
  addAuditLog(`Menugaskan driver ${driver} ke pesanan ${id}`, 'Dispatcher');
  res.json(order);
});

// 5. Spanduk & Promo (/api/v1/spanduk & /api/v1/jenis_promo)
app.get('/api/v1/spanduk', (req: Request, res: Response) => {
  res.json(db.CMS);
});

app.post('/api/v1/spanduk', (req: Request, res: Response) => {
  const { n, jn, ds, img, pos, link, st, en, on } = req.body;
  const banner = {
    n: n || 'Spanduk Promo',
    jn: jn || 'Promo',
    ds: ds || '',
    img: img || '',
    pos: pos || 'Tengah',
    link: link || '',
    st: st || '',
    en: en || '',
    on: on ?? 1,
  };

  db.CMS.unshift(banner);
  addAuditLog(`Menambah spanduk promo: ${banner.n}`, 'Admin');
  res.status(201).json(banner);
});

app.delete('/api/v1/spanduk/:index', (req: Request, res: Response) => {
  const index = Number(req.params.index);
  if (isNaN(index) || index < 0 || index >= db.CMS.length) {
    return res.status(404).json({ error: 'Spanduk tidak ditemukan' });
  }

  const deleted = db.CMS.splice(index, 1)[0];
  addAuditLog(`Menghapus spanduk: ${deleted.n}`, 'Admin');
  res.json({ success: true, deleted });
});

app.get('/api/v1/jenis_promo', (req: Request, res: Response) => {
  res.json(db.JN);
});

app.post('/api/v1/jenis_promo', (req: Request, res: Response) => {
  const { nama } = req.body;
  if (!nama || db.JN.includes(nama)) {
    return res.status(400).json({ error: 'Nama jenis promo tidak valid atau sudah ada' });
  }

  db.JN.push(nama);
  addAuditLog(`Menambah jenis promo: ${nama}`, 'Admin');
  res.status(201).json(db.JN);
});

// 6. Pengaturan Sistem (/api/v1/pengaturan/*)
app.get('/api/v1/pengaturan/sistem', (req: Request, res: Response) => {
  res.json(db.SET);
});

app.put('/api/v1/pengaturan/sistem', (req: Request, res: Response) => {
  db.SET = {
    ...db.SET,
    ...req.body,
  };
  addAuditLog(`Pengaturan sistem diperbarui (Komisi: ${db.SET.kom}%)`, 'Admin');
  res.json(db.SET);
});

app.get('/api/v1/pengaturan/ukuran_spanduk', (req: Request, res: Response) => {
  res.json(db.BN);
});

app.put('/api/v1/pengaturan/ukuran_spanduk', (req: Request, res: Response) => {
  const { w, h } = req.body;
  db.BN = {
    w: Number(w) || 1080,
    h: Number(h) || 540,
  };
  addAuditLog(`Ukuran spanduk diubah menjadi ${db.BN.w}x${db.BN.h}px`, 'Admin');
  res.json(db.BN);
});

// 7. Notifikasi & Kotak Masuk (/api/v1/notifikasi & /api/v1/pesan)
app.get('/api/v1/notifikasi', (req: Request, res: Response) => {
  res.json(db.NT);
});

app.post('/api/v1/notifikasi', (req: Request, res: Response) => {
  const { to, ti, tm, user_id, judul, pesan, jenis } = req.body;
  const notif = {
    to: to || (user_id ? 'Pengguna ' + user_id : 'Semua pengguna'),
    ti: ti || judul || 'Pemberitahuan AWD',
    tm: tm || 'Baru saja',
    pesan: pesan || '',
    jenis: jenis || 'Informasi',
  };

  db.NT.unshift(notif);
  addAuditLog(`Mengirim notifikasi "${notif.ti}" ke ${notif.to}`, 'Admin');
  res.status(201).json(notif);
});

app.get('/api/v1/pesan', (req: Request, res: Response) => {
  res.json(db.INB);
});

app.post('/api/v1/pesan/:id/balas', (req: Request, res: Response) => {
  const { id } = req.params;
  const { isi } = req.body;
  const msg = db.INB.find((m) => m.id === id);
  if (!msg) return res.status(404).json({ error: 'Pesan tidak ditemukan' });

  const now = new Date();
  const tm = now.getHours().toString().padStart(2, '0') + '.' + now.getMinutes().toString().padStart(2, '0');
  msg.msgs.push({ me: 1, tx: isi || 'Pesan Anda telah kami terima.', tm });
  msg.un = 0;
  msg.tm = tm;

  addAuditLog(`Membalas pesan dari ${msg.from} (${msg.role})`, 'Layanan Pelanggan');
  res.json(msg);
});

// 8. Versi Aplikasi (/api/v1/versi-aplikasi)
app.get('/api/v1/versi-aplikasi', (req: Request, res: Response) => {
  res.json(db.V);
});

app.put('/api/v1/versi-aplikasi/:app', (req: Request, res: Response) => {
  const { app: appType } = req.params;
  const target = db.V.find((v) => v.t === appType);
  if (!target) return res.status(404).json({ error: 'Aplikasi tidak ditemukan' });

  Object.assign(target, req.body);
  addAuditLog(`Pembaruan kontrol versi aplikasi ${appType}`, 'Admin');
  res.json(target);
});

// 9. Auth Endpoints
app.post('/api/v1/auth/login', (req: Request, res: Response) => {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    return res.status(400).json({ error: 'Nomor HP / Email dan kata sandi wajib diisi.' });
  }

  // Find merchant or return demo merchant
  const user = db.D.find((r) => r.hp === identifier || (r.x && r.x.email === identifier)) || db.D[0];
  res.json({
    success: true,
    token: 'jwt_awd_' + Buffer.from(user.id).toString('base64'),
    user,
    message: `Selamat datang kembali, ${user.name}!`,
  });
});

app.post('/api/v1/auth/register', (req: Request, res: Response) => {
  const body = req.body;
  const newMerchantId = 'M' + (db.D.filter((r) => r.t === 'merchant').length + 10);
  const newMerchant = {
    id: newMerchantId,
    t: 'merchant',
    name: body.storeName || 'Warung Baru Mitra',
    sub: body.ownerName || 'Pemilik Usaha',
    area: body.village || 'Arjawinangun',
    n: 0,
    r: '5.0',
    s: 'Buka',
    adr: body.fullAddress || 'Kec. Arjawinangun, Cirebon',
    hp: body.ownerPhone || '085224158990',
    plate: '',
    jn: 'Nov 2026',
    x: {
      email: body.email || '',
      login: 'Kata sandi',
      gps: body.gpsLocation ? `${body.gpsLocation.lat}, ${body.gpsLocation.lng}` : '-6.6508, 108.4124',
      vf: 'Menunggu',
      ...body,
    },
  };

  db.D.unshift(newMerchant);
  db.PR[newMerchantId] = [
    {
      id: 'P' + Date.now(),
      n: 'Menu Utama Unggulan',
      k: 'Makanan',
      kd: newMerchantId + '-001',
      h: 20000,
      st: 25,
      d: 'Menu terlezat khas warung.',
      img: body.storeLogoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
      on: 1,
    },
  ];

  addAuditLog(`Pendaftaran warung baru: ${newMerchant.name} oleh ${newMerchant.sub}`, 'Pendaftaran Mitra');
  res.status(201).json({
    success: true,
    user: newMerchant,
    message: 'Pendaftaran berhasil dikirim. Menunggu verifikasi admin.',
  });
});

// ==========================================
// SERVE AWD ADMIN PANEL (/admin)
// Injects live backend API synchronization
// ==========================================
const adminHtmlPath = path.resolve(__dirname, 'public/assets/aistudio/arjawinangun-delivery-admin__1__4f51c4a7.html');

app.get(['/admin', '/admin.html'], (req: Request, res: Response) => {
  if (fs.existsSync(adminHtmlPath)) {
    let content = fs.readFileSync(adminHtmlPath, 'utf-8');

    // Switch API.MOCK to false and add live sync initialization
    content = content.replace(
      'const API={MOCK:true,BASE:\'/api/v1\',token:null',
      'const API={MOCK:false,BASE:\'/api/v1\',token:\'awd_admin_secret_token\''
    );

    // Inject live init script to load live backend data on open
    const liveSyncScript = `
<script>
// AWD Live Backend Auto-Sync
(async function initLiveSync() {
  try {
    const res = await fetch('/api/v1/data');
    if (res.ok) {
      const data = await res.json();
      if (data.D && Array.isArray(data.D)) D = data.D;
      if (data.PR) Object.assign(PR, data.PR);
      if (data.V && Array.isArray(data.V)) V = data.V;
      if (data.O && Array.isArray(data.O)) O = data.O;
      if (data.CMS && Array.isArray(data.CMS)) CMS = data.CMS;
      if (data.BN) BN = data.BN;
      if (data.NT && Array.isArray(data.NT)) NT = data.NT;
      if (data.SET) Object.assign(SET, data.SET);
      if (data.INB && Array.isArray(data.INB)) INB = data.INB;
      if (data.JN && Array.isArray(data.JN)) { JN.length = 0; JN.push(...data.JN); }
      if (data.AU && Array.isArray(data.AU)) S.au = data.AU;
      if (typeof render === 'function') render();
      console.log('✅ [AWD Live Backend] Data successfully synchronized with Express API.');
    }
  } catch (e) {
    console.warn('⚠️ [AWD Live Backend] Sync error:', e);
  }
})();
</script>
`;
    content = content.replace('</body>', `${liveSyncScript}</body>`);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.send(content);
  } else {
    res.status(404).send('File admin template tidak ditemukan.');
  }
});

// ==========================================
// VITE INTEGRATION (Dev & Prod)
// ==========================================
async function startServer() {
  if (!isProduction) {
    // Mount Vite dev server as middleware
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        port: PORT,
        host: '0.0.0.0',
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    // Production static serving
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 [AWD Full-Stack] Server running on http://0.0.0.0:${PORT}`);
    console.log(`📱 [Merchant App] Available at http://0.0.0.0:${PORT}`);
    console.log(`🛡️ [Admin Panel] Available at http://0.0.0.0:${PORT}/admin`);
    console.log(`🔌 [REST API] Active at http://0.0.0.0:${PORT}/api/v1/health`);
  });
}

startServer();
