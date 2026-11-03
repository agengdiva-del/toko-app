import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const T_STATUS = {
  merchant: ['Buka', 'Tutup', 'Ditangguhkan'],
  driver: ['Aktif', 'Tidak aktif', 'Menunggu verifikasi'],
  customer: ['Aktif', 'Belum verifikasi', 'Diblokir'],
};

let seq = 1;
const D = [];

const mx = (t, q, nm) => {
  const o = {
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

for (const t of Object.keys(raw)) {
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
      s: T_STATUS[t][r[4]],
      adr: ST[q % 5] + ' No. ' + (((q * 7) % 60) + 1) + ', ' + r[2],
      hp: t === 'customer' ? r[1] : '08' + (12 + (q % 9)) + '-' + ((1000 + q * 37) % 9000) + '-' + ((1000 + q * 53) % 9000),
      plate: 'E ' + ((2000 + q * 131) % 8000) + ' ' + ['AB', 'CD', 'XY', 'QZ'][q % 4],
      jn: BL[q % 6] + ' 2026',
      x: mx(t, q, r[0]),
    });
  });
}

const PR = {};
let pq = 1;

const PRD = {
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
  { t: '09:12', u: 'Admin Utama', m: 'Backend AWD disinkronkan dengan https://suderyderry.github.io/awd-admin/' },
  { t: '08:45', u: 'Sistem AWD', m: 'Sinkronisasi database Arjawinangun Delivery selesai' },
];

const db = { D, PR, V, O, CMS, BN, NT, SET, INB, JN, AU };

const targetPath = path.resolve(__dirname, '../data/awd_database.json');
fs.writeFileSync(targetPath, JSON.stringify(db, null, 2), 'utf-8');
console.log('Successfully written synchronized database to:', targetPath);
