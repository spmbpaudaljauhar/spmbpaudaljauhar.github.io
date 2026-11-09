const BOOT = window.__BOOT__;
const DRAFT_KEY = 'spmb_aljauhar_draft_v3' + (BOOT.uji ? '_uji' : BOOT.petugas ? '_petugas' : '');
const INTI_PETUGAS = ['jenjang', 'nama_anak', 'tanggal_lahir', 'nama_ortu', 'hp'];
function wajibNow(q) { return q.wajib && (!S.d.petugas || INTI_PETUGAS.indexOf(q.id) >= 0); }
const S = { d: BOOT, answers: {}, files: {}, page: 0, pages: [], slideTimer: null };
const $ = (s, el) => (el || document).querySelector(s);
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const BULAN = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
const tgl = s => { const p = String(s || '').split('-'); return p.length === 3 ? Number(p[2]) + ' ' + BULAN[Number(p[1]) - 1] + ' ' + p[0] : s; };
const tglPendek = s => { const p = String(s || '').split('-'); return p.length === 3 ? Number(p[2]) + ' ' + BULAN[Number(p[1]) - 1].slice(0, 3) : s; };
function rupiah(n) { const x = Number(String(n || '').replace(/\D/g, '')); return x ? 'Rp' + x.toLocaleString('id-ID') : ''; }
function run(fn) {
  const args = Array.prototype.slice.call(arguments, 1);
  return api(fn, args);
}
function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.setAttribute('role', 'status'); t.textContent = msg; document.body.appendChild(t); setTimeout(() => t.remove(), 3600); }
function store(k, v) { try { if (v === undefined) return JSON.parse(localStorage.getItem(k) || 'null'); if (v === null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) { return null; } }
function waNum(n) { let x = String(n).replace(/\D/g, ''); if (x.startsWith('0')) x = '62' + x.slice(1); return x; }

function show(v) { ['home', 'form', 'done', 'status'].forEach(n => $('#view-' + n).classList.toggle('hidden', n !== v)); window.scrollTo(0, 0); }
function goHome(anchor) { show('home'); renderCTA(); if (anchor) setTimeout(() => { const el = document.getElementById(anchor); if (el) el.scrollIntoView(); }, 30); }

/* ---------- beranda ---------- */
function imgs(pos) { return S.d.images.filter(i => i.posisi === pos); }
function lines(s) { return String(s || '').split('\n').map(x => x.replace(/^[\s\-•*]+/, '').trim()).filter(Boolean); }

function renderHome() {
  if (S.d.error) { document.body.innerHTML = '<div style="padding:40px;font-family:sans-serif;max-width:60ch;margin:auto"><h2>Halaman belum siap</h2><p>' + esc(S.d.error) + '</p></div>'; return; }
  const st = S.d.settings, nama = st.namaSekolah || 'PAUD AL-JAUHAR';
  $('#brandName').textContent = nama; $('#footNama').textContent = nama;
  const logo = imgs('logo')[0];
  if (logo) { $('#logo').src = logo.url; $('#logo').alt = 'Logo ' + nama; $('#logo').classList.remove('hidden'); }

  const banners = imgs('banner');
  if (banners.length) {
    $('#banner').classList.remove('hidden'); $('#hero').classList.add('ringkas');
    $('#slides').innerHTML = banners.map((b, i) => '<div class="slide' + (i ? '' : ' on') + '"><img src="' + esc(b.url) + '" alt="' + esc(b.keterangan || 'Poster ' + nama) + '"' + (i ? ' loading="lazy"' : ' fetchpriority="high"') + '></div>').join('') +
      (banners.length > 1 ? '<div class="dots">' + banners.map((b, i) => '<button aria-label="Poster ' + (i + 1) + '" class="' + (i ? '' : 'on') + '" onclick="slide(' + i + ',true)"></button>').join('') + '</div>' : '');
    if (banners.length > 1) S.slideTimer = setInterval(() => slide(-1), 6000);
  }
  $('#heroTA').textContent = 'SPMB Tahun Ajaran ' + (st.tahunAjaran || '');
  if (st.brosurId) {
    const url = 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(st.brosurId);
    document.querySelectorAll('.brosur-link').forEach(a => { a.href = url; a.classList.remove('hidden'); });
    document.querySelectorAll('.brosur-teks').forEach(x => { x.textContent = st.teksBrosur || 'Unduh brosur'; });
    $('#brosurInfo').classList.remove('hidden');
    $('#brosurInfo').textContent = (st.brosurTipe || 'File') + (st.brosurUkuran ? ' · ' + (Number(st.brosurUkuran) >= 1024 ? (Number(st.brosurUkuran) / 1024).toFixed(1) + ' MB' : st.brosurUkuran + ' KB') : '');
  }
  $('#heroJudul').textContent = String(st.judulHero || 'Sistem Penerimaan Murid Baru').replace(/Seleksi Penerimaan/g, 'Sistem Penerimaan');
  $('#heroNama').textContent = nama.replace(/-/g, '\u2011');
  if (st.akreditasi) $('#heroAkrNilai').textContent = st.akreditasi; else $('#heroAkr').classList.add('hidden');
  if (S.d.petugas) {
    const u = document.createElement('div'); u.className = 'mode-sekolah'; u.setAttribute('role', 'status');
    u.title = 'Hanya program, nama anak, tanggal lahir, nama orang tua, dan nomor WA yang wajib. Isian lain dan berkas boleh menyusul.';
    u.innerHTML = '<span class="titik"></span>Mode pengisian langsung di sekolah'; document.body.appendChild(u);
    let t; window.addEventListener('scroll', () => { u.classList.add('redup'); clearTimeout(t); t = setTimeout(() => u.classList.remove('redup'), 700); }, { passive: true });
  }
  if (S.d.lengkapi) { setTimeout(renderLengkapi, 0); }
  if (S.d.uji) { const u = document.createElement('div'); u.className = 'uji-bar'; u.textContent = 'Mode uji coba: formulir dibuka untuk admin. Data yang dikirim diberi nomor UJI dan tidak dihitung dalam kuota.'; document.body.prepend(u); }
  $('#heroSub').textContent = st.subjudulHero || '';

  // status gelombang
  const g = S.d.gel, list = g.list || [];
  const akt = list.find(x => x.state === 'aktif');
  let sk = '';
  if (g.open && akt) {
    sk = '<div class="label">Pendaftaran sedang dibuka</div><div class="nama-gel">Gelombang ' + esc(akt.nama) + '</div><div>' + tglPendek(akt.mulai) + ' sampai ' + tgl(akt.selesai) + '</div>';
  } else if (g.open) {
    sk = '<div class="label">Status</div><div class="nama-gel">Pendaftaran dibuka</div>';
  } else {
    sk = '<div class="label">Status</div><div class="nama-gel">Pendaftaran belum dibuka</div><div>' + esc(g.alasan || st.pesanTutup || '') + '</div>';
    $('#statusKartu').classList.add('tutup');
  }
  $('#statusKartu').innerHTML = sk;
  if (list.length) {
    $('#gelGrid').innerHTML = list.map(x => '<div class="tiket ' + x.state + '"><span class="tanda ' + x.state + '">' + ({ aktif: 'Sedang dibuka', akan: 'Akan dibuka', penuh: 'Kuota penuh', selesai: 'Selesai' })[x.state] + '</span>' +
      '<h3 style="margin-top:10px">' + esc(x.nama) + '</h3><div class="tgl">' + tglPendek(x.mulai) + ' – ' + tgl(x.selesai) + '</div></div>').join('');
    const note = noteGelombang();
    if (note) { $('#gelNote').textContent = note; $('#gelNote').classList.remove('hidden'); }
  } else $('#gelombang').classList.add('hidden');

  imgs('hiasan').slice(0, 3).forEach((h, i) => { const f = $('[data-hiasan="' + i + '"]'); f.innerHTML = '<img src="' + esc(h.url) + '" alt="" loading="lazy">'; f.classList.remove('hidden'); });

  $('#spJudul').innerHTML = 'Selayang Pandang<br><span style="white-space:nowrap">' + esc(nama).replace(/-/g, '\u2011') + '</span>';
  $('#spTeks').innerHTML = String(st.selayangPandang || '').split(/\n\s*\n/).filter(p => p.trim()).map(p => '<p>' + esc(p.trim()).replace(/\n/g, '<br>') + '</p>').join('');
  const sp = imgs('selayang');
  if (sp.length) $('#spGambar').innerHTML = sp.map(i => '<img src="' + esc(i.url) + '" alt="' + esc(i.keterangan) + '" loading="lazy">').join(''); else $('#spGrid').classList.add('tanpa-gambar');
  const pres = lines(st.prestasi);
  if (pres.length) { $('#prestasiList').innerHTML = pres.map(p => '<li>' + esc(p) + '</li>').join(''); $('#prestasiBox').classList.remove('hidden'); }
  const keg = lines(st.kegiatanUnggulan);
  if (keg.length) { $('#kegiatanList').innerHTML = keg.map(k => '<li>' + esc(k) + '</li>').join(''); $('#kegiatanBox').classList.remove('hidden'); }

  $('#jjList').innerHTML = S.d.jenjang.map(j => '<span><b>' + esc(j.nama) + '</b>' + (j.keterangan ? '<small>' + esc(j.keterangan) + '</small>' : '') + '</span>').join('');
  const lay = String(st.layanan || '').split('\n').map(l => l.split('|').map(x => x.trim())).filter(x => x[0]);
  if (lay.length) { $('#layananList').innerHTML = lay.map(x => '<span><b>' + esc(x[0]) + '</b>' + (x[1] ? '<small>' + esc(x[1]) + '</small>' : '') + '</span>').join(''); $('#layananList').classList.remove('hidden'); }
  const alur = imgs('alur');
  if (alur.length) { $('#alurGambar').innerHTML = alur.map(x => '<img src="' + esc(x.url) + '" alt="' + esc(x.keterangan || 'Bagan alur pendaftaran') + '" loading="lazy">').join(''); $('#alurGambar').classList.remove('hidden'); }
  $('#syaratList').innerHTML = S.d.docs.map(d => '<li><b>' + esc(d.nama) + '</b>' + (d.wajib ? '' : ' (jika ada)') + (d.keterangan ? '<small>' + esc(d.keterangan) + '</small>' : '') + '</li>').join('');
  if (st.infoPendaftaran && st.infoPendaftaran.trim()) $('#infoTeks').innerHTML = '<div style="white-space:pre-line">' + esc(st.infoPendaftaran) + '</div>';
  else $('#infoTeks').classList.add('hidden');

  const gal = imgs('galeri');
  if (gal.length) { pasangGaleri(gal); $('#galeriBox').classList.remove('hidden'); }

  $('#footAlamat').textContent = st.alamat || '';
  const k = [];
  if (st.whatsapp) k.push('<span>WhatsApp <a href="https://wa.me/' + waNum(st.whatsapp) + '" target="_blank" rel="noopener">' + esc(st.whatsapp) + '</a></span>');
  if (st.instagram) k.push('<span>Instagram ' + esc(st.instagram) + '</span>');
  if (st.facebook) k.push('<span>Facebook ' + esc(st.facebook) + '</span>');
  if (st.tiktok) k.push('<span>TikTok ' + esc(st.tiktok) + '</span>');
  if (st.youtube) k.push('<span>YouTube ' + esc(st.youtube) + '</span>');
  if (st.email) k.push('<span>Email <a href="mailto:' + esc(st.email) + '">' + esc(st.email) + '</a></span>');
  $('#footKontak').innerHTML = k.join('');
  const fb = imgs('formulir')[0];
  if (fb) $('#formBanner').innerHTML = '<img src="' + esc(fb.url) + '" alt="" loading="lazy">';
  renderCTA();
}
function renderCTA() {
  const dr = store(DRAFT_KEY);
  const label = !S.d.gel.open ? 'Pendaftaran ditutup' : adaDraft(dr) ? 'Lanjutkan pendaftaran' : 'Isi formulir pendaftaran';
  ['#heroDaftar', '#ajakDaftar'].forEach(s => { $(s).textContent = label; $(s).disabled = !S.d.gel.open; });
  $('#ajak').classList.toggle('hidden', !S.d.gel.open);
}
function noteGelombang() {
  const list = S.d.gel.list || [];
  const i = list.findIndex(x => x.state === 'aktif') >= 0 ? list.findIndex(x => x.state === 'aktif') : list.findIndex(x => x.state === 'akan');
  if (i < 0 || !list[i].kuota) return '';
  const lanjut = list.slice(i + 1).find(x => x.state === 'akan' || x.state === 'aktif');
  if (!lanjut) return '';
  return 'Apabila kuota ' + list[i].nama + ' sudah terpenuhi maka pendaftaran akan ditutup dan dilanjutkan dengan ' + lanjut.nama + '.';
}
/* ---------- galeri: satu foto penuh, geser otomatis ---------- */
const G = { i: 0, n: 0, timer: null, jeda: 5000, tahan: false };
function pasangGaleri(list) {
  G.n = list.length;
  $('#galeri').innerHTML = list.map((x, i) => '<figure class="g-slide' + (i ? '' : ' on') + '" aria-hidden="' + (i ? 'true' : 'false') + '"><div class="g-latar" data-bg="' + esc(x.url) + '"></div>' +
      '<img data-src="' + esc(x.url) + '" alt="' + esc(x.keterangan || 'Foto kegiatan ' + (i + 1)) + '">' + (x.keterangan ? '<figcaption>' + esc(x.keterangan) + '</figcaption>' : '') + '</figure>').join('') +
    (G.n > 1 ? '<button class="g-nav g-prev" aria-label="Foto sebelumnya" onclick="geserGaleri(-1,true)">&#8249;</button><button class="g-nav g-next" aria-label="Foto berikutnya" onclick="geserGaleri(1,true)">&#8250;</button><span class="g-hitung" id="gHitung"></span><i class="g-progres" id="gProgres"></i>' : '');
  $('#galeriTitik').innerHTML = G.n > 1 && G.n <= 30 ? list.map((x, i) => '<button aria-label="Foto ' + (i + 1) + '" onclick="keGaleri(' + i + ',true)"></button>').join('') : '';
  muatFoto(0); muatFoto(1);
  keGaleri(0);
  const box = $('#galeri');
  box.addEventListener('mouseenter', () => { G.tahan = true; jedaGaleri(); });
  box.addEventListener('mouseleave', () => { G.tahan = false; jalanGaleri(); });
  box.addEventListener('keydown', e => { if (e.key === 'ArrowRight') geserGaleri(1, true); if (e.key === 'ArrowLeft') geserGaleri(-1, true); });
  let x0 = null;
  box.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; if (Math.abs(dx) > 40) geserGaleri(dx < 0 ? 1 : -1, true); x0 = null; });
  document.addEventListener('visibilitychange', () => { if (document.hidden) jedaGaleri(); else jalanGaleri(); });
}
function muatFoto(i) {
  const f = document.querySelectorAll('#galeri .g-slide')[(i + G.n) % G.n]; if (!f) return;
  const img = f.querySelector('img'), bg = f.querySelector('.g-latar');
  if (img.dataset.src) { img.src = img.dataset.src; img.removeAttribute('data-src'); }
  if (bg.dataset.bg) { bg.style.backgroundImage = 'url("' + bg.dataset.bg + '")'; bg.removeAttribute('data-bg'); }
}
function keGaleri(i, manual) {
  if (!G.n) return;
  G.i = (i + G.n) % G.n;
  document.querySelectorAll('#galeri .g-slide').forEach((x, k) => { x.classList.toggle('on', k === G.i); x.setAttribute('aria-hidden', k === G.i ? 'false' : 'true'); });
  document.querySelectorAll('#galeriTitik button').forEach((x, k) => x.classList.toggle('on', k === G.i));
  if ($('#gHitung')) $('#gHitung').textContent = (G.i + 1) + ' / ' + G.n;
  muatFoto(G.i); muatFoto(G.i + 1);
  jalanGaleri();
}
function geserGaleri(d, manual) { keGaleri(G.i + d, manual); }
function jedaGaleri() { clearTimeout(G.timer); const p = $('#gProgres'); if (p) { p.style.transition = 'none'; p.style.width = '0'; } }
function jalanGaleri() {
  jedaGaleri();
  if (G.n < 2 || G.tahan || document.hidden || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const p = $('#gProgres');
  if (p) { void p.offsetWidth; p.style.transition = 'width ' + G.jeda + 'ms linear'; p.style.width = '100%'; }
  G.timer = setTimeout(() => geserGaleri(1), G.jeda);
}
function slide(i, manual) {
  const s = document.querySelectorAll('#slides .slide'), d = document.querySelectorAll('#slides .dots button');
  const cur = Array.prototype.findIndex.call(s, x => x.classList.contains('on'));
  const n = i < 0 ? (cur + 1) % s.length : i;
  s.forEach((x, k) => x.classList.toggle('on', k === n)); d.forEach((x, k) => x.classList.toggle('on', k === n));
  if (manual && S.slideTimer) { clearInterval(S.slideTimer); S.slideTimer = null; }
}

/* ---------- formulir: satu halaman per bagian ---------- */
function applies(item) { return !item.jenjang.length || item.jenjang.indexOf(S.answers.jenjang) >= 0; }
function visible(q, d) {
  if (!q.syarat) return true;
  const neg = q.syarat.indexOf('!=') >= 0;
  const p = q.syarat.split(neg ? '!=' : '='); const sumber = S.d.questions.find(x => x.id === p[0].trim());
  const v = sumber && (d || 0) < 6 && !visible(sumber, (d || 0) + 1) ? '' : S.answers[p[0].trim()]; const want = (p[1] || '').trim();
  const cocok = Array.isArray(v) ? v.indexOf(want) >= 0 : String(v || '') === want;
  return neg ? !cocok : cocok;
}
function docsAktif() { return S.d.docs.filter(d => applies(d) && visible(d)); }
function ketSyaratDok(d) {
  if (!d.syarat) return '';
  const neg = d.syarat.indexOf('!=') >= 0, p = d.syarat.split(neg ? '!=' : '='), q = S.d.questions.find(x => x.id === p[0].trim());
  return (neg ? 'tidak perlu jika ' : 'hanya jika ') + (q ? q.label.toLowerCase() : p[0]) + ' ' + (p[1] || '').trim().toLowerCase();
}
function namaProgram(kode) { const j = S.d.jenjang.find(x => x.kode === kode); return j ? j.nama : kode; }
function buildPages() {
  const pages = [{ type: 'intro', bagian: 'Persiapan' }];
  const max = Number(S.d.settings.maksPerHalaman) || 0;
  const order = [], map = {};
  S.d.questions.filter(applies).filter(q => visible(q)).forEach(q => { if (!map[q.bagian]) { map[q.bagian] = []; order.push(q.bagian); } map[q.bagian].push(q); });
  order.forEach(b => {
    const groups = []; let cur = [];
    map[b].forEach(q => { if (q.halamanBaru && cur.length) { groups.push(cur); cur = []; } cur.push(q); });
    if (cur.length) groups.push(cur);
    const final = [];
    groups.forEach(g => {
      if (max > 0 && g.length > max) { const n = Math.ceil(g.length / max), size = Math.ceil(g.length / n); for (let i = 0; i < n; i++) final.push(g.slice(i * size, (i + 1) * size)); }
      else final.push(g);
    });
    final.forEach((g, i) => pages.push({ type: 'bagian', bagian: b, qs: g, part: i + 1, parts: final.length }));
  });
  if (docsAktif().length) pages.push({ type: 'dokumen', bagian: 'Dokumen' });
  pages.push({ type: 'review', bagian: 'Periksa dan kirim' });
  S.pages = pages;
}
function adaDraft(dr) { return dr && (Object.keys(dr.answers || {}).length || (dr.page || 0) > 0); }
function saveDraft() { store(DRAFT_KEY, { answers: S.answers, files: S.files, page: S.page, waktu: Date.now() }); }

function startForm() {
  if (!S.d.gel.open) { toast(S.d.gel.alasan || 'Pendaftaran sedang ditutup.'); return; }
  const dr = store(DRAFT_KEY);
  if (adaDraft(dr) && !Object.keys(S.answers).length) {
    show('form'); $('#stepLabel').textContent = ''; $('#progressBar').style.width = '0'; $('#bagianNav').innerHTML = '';
    const w = new Date(dr.waktu || Date.now());
    $('#stepBody').innerHTML = '<div class="lanjut-kartu"><h2>Lanjutkan isian sebelumnya?</h2><p class="petunjuk">Ada isian formulir yang tersimpan di perangkat ini sejak ' + w.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' }) + ' pukul ' + w.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + '.</p>' +
      '<div class="aksi"><button class="btn btn-navy" onclick="pulihkan()">Lanjutkan isian</button><button class="btn btn-garis" onclick="mulaiBaru()">Mulai dari awal</button></div></div>';
    return;
  }
  buildPages(); show('form'); renderPage();
}
function pulihkan() {
  const dr = store(DRAFT_KEY) || {};
  S.answers = dr.answers || {};
  const batas = Date.now() - 6 * 24 * 3600 * 1000;
  S.files = {}; Object.keys(dr.files || {}).forEach(k => { if ((dr.files[k].ts || 0) > batas) S.files[k] = dr.files[k]; });
  buildPages(); S.page = Math.min(dr.page || 0, S.pages.length - 1); renderPage();
}
function mulaiBaru() { store(DRAFT_KEY, null); S.answers = {}; S.files = {}; S.page = 0; buildPages(); renderPage(); }
function simpanKeluar() { saveDraft(); toast('Isian tersimpan di perangkat ini. Buka situs ini lagi dari HP/laptop yang sama untuk melanjutkan.'); goHome(); }

function introHtml() {
  const st = S.d.settings, g = S.d.gel, a = (g.list || []).find(x => x.state === 'aktif');
  const siap = lines(st.dataPersiapan);
  let h = '<h2>Sebelum mulai mengisi</h2><p class="petunjuk">Pengisian formulir membutuhkan waktu sekitar <b>10–15 menit</b>. Mohon luangkan waktu sejenak dan siapkan berkas berikut agar pengisian lancar.</p>' +
    '<div class="siap-grid"><div class="siap"><h3>Berkas yang diunggah</h3><ul>' + S.d.docs.map(d => '<li>' + esc(d.nama) + (d.wajib ? '' : ' (jika ada)') + '</li>').join('') + '</ul><small>Foto dari kamera HP boleh, maksimal 3 MB per file.</small></div>' +
    (siap.length ? '<div class="siap"><h3>Data yang perlu disiapkan</h3><ul>' + siap.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul></div>' : '') + '</div>';
  if (st.biayaPendaftaran || st.infoPembayaran) h += '<div class="info-box kuning"><b>Transfer biaya pendaftaran terlebih dahulu</b>, karena bukti transfer diunggah di akhir formulir.<div style="white-space:pre-line;margin-top:6px">' + (st.biayaPendaftaran ? 'Biaya pendaftaran <b>' + esc(rupiah(st.biayaPendaftaran)) + '</b>\n' : '') + esc(st.infoPembayaran || '') + '</div></div>';
  if (a) h += '<div class="info-box">Pendaftaran gelombang <b>' + esc(a.nama) + '</b>, ' + tglPendek(a.mulai) + ' sampai ' + tgl(a.selesai) + '.</div>';
  const n = noteGelombang(); if (n) h += '<div class="info-box kuning">' + esc(n) + '</div>';
  return h + '<p class="catatan-kecil">Isian tersimpan otomatis di perangkat ini. Jika terputus, buka kembali situs ini dari HP atau laptop yang sama untuk melanjutkan.</p>';
}
function renderPage() {
  const p = S.pages[S.page];
  const total = S.pages.length - 1;
  $('#stepLabel').textContent = p.type === 'intro' ? 'Persiapan' : 'Langkah ' + S.page + ' dari ' + total;
  $('#progressBar').style.width = (S.page / total * 100) + '%';
  const secs = [];
  S.pages.forEach(x => { if (x.type !== 'intro' && secs.indexOf(x.bagian) < 0) secs.push(x.bagian); });
  const curSec = secs.indexOf(p.bagian);
  $('#bagianNav').innerHTML = p.type === 'intro' ? '' : secs.map((b, i) => '<span class="' + (i < curSec ? 'selesai' : i === curSec ? 'aktif' : '') + '">' + esc(b) + '</span>').join('');
  const last = S.page === S.pages.length - 1;
  let h = '';
  if (p.type === 'intro') h = introHtml();
  else if (p.type === 'bagian') h = '<h2>' + esc(p.bagian) + '</h2>' + (p.parts > 1 ? '<span class="hal">Halaman ' + p.part + ' dari ' + p.parts + '</span>' : '') + '<div style="height:14px"></div>' + fieldsHtml(p.qs);
  else if (p.type === 'dokumen') {
    const st = S.d.settings;
    h = '<h2>Unggah dokumen</h2><p class="petunjuk">Setiap file maksimal 3 MB. Foto yang lebih besar akan diperkecil otomatis.</p>';
    if (st.biayaPendaftaran || st.infoPembayaran) h += '<div class="info-box kuning" style="white-space:pre-line">' + (st.biayaPendaftaran ? 'Biaya pendaftaran <b>' + esc(rupiah(st.biayaPendaftaran)) + '</b>\n' : '') + esc(st.infoPembayaran || '') + '</div>';
    h += docsAktif().map(dokHtml).join('');
  } else h = reviewHtml();
  h += '<div id="formAlert"></div><div class="nav-form">' +
    (S.page > 0 ? '<button class="btn btn-garis" onclick="prev()">Kembali</button>' : '<button class="btn btn-garis" onclick="goHome()">Batal</button>') +
    '<div class="kanan">' + (last ? '<button class="btn btn-kuning" id="kirimBtn" onclick="kirim()">Kirim pendaftaran</button>' : '<button class="btn btn-navy" onclick="next()">' + (p.type === 'intro' ? 'Mulai mengisi' : 'Lanjut') + '</button>') + '</div></div>';
  $('#stepBody').innerHTML = h;
  bindPage(p);
}
function fieldsHtml(qs) {
  let out = '', i = 0;
  const kecil = x => x && ['teks', 'angka', 'tanggal', 'telepon', 'dropdown', 'nik', 'email'].indexOf(x.tipe) >= 0 && x.label.length < 40 && !x.syarat;
  while (i < qs.length) {
    const q = qs[i], n = qs[i + 1];
    if (kecil(q) && kecil(n) && !n.halamanBaru) { out += '<div class="dua">' + fieldHtml(q) + fieldHtml(n) + '</div>'; i += 2; }
    else { out += fieldHtml(q); i++; }
  }
  return out;
}
function isLain(o) { return /:\s*$/.test(String(o)); }
/** Membaca pilihan yang dicentang; pilihan "Lainnya:" disimpan sebagai "Lainnya: isian orang tua". */
function bacaPilihan(q) {
  const body = $('#stepBody');
  const vals = [];
  body.querySelectorAll('input[name="q_' + q.id + '"]').forEach(inp => {
    const teks = inp.parentNode.querySelector('.lain-teks');
    if (teks) { teks.disabled = !inp.checked; }
    if (!inp.checked) return;
    vals.push(isLain(inp.value) ? inp.value.replace(/:\s*$/, '').trim() + ': ' + (teks ? teks.value.trim() : '') : inp.value);
  });
  return q.tipe === 'kotak_centang' ? vals : (vals[0] || '');
}
function fieldHtml(q) {
  const v = S.answers[q.id], id = 'q_' + q.id;
  const ket = q.keterangan ? '<small class="ket">' + esc(q.keterangan) + '</small>' : '';
  const err = '<span class="err" role="alert"></span>';
  const radios = (type, opts, arr) => '<div class="opsi' + (opts.length > 4 && q.tipe !== 'yatidak' ? ' kolom' : '') + '" role="' + (type === 'radio' ? 'radiogroup' : 'group') + '" aria-labelledby="l_' + q.id + '">' + opts.map(o => {
    if (isLain(o)) {
      const base = o.slice(0, -1).trim();
      const cur = (arr || [v]).find(x => String(x || '').indexOf(base + ':') === 0);
      const teks = cur ? String(cur).slice(base.length + 1).trim() : '';
      return '<label class="lain"><input type="' + type + '" name="' + id + '" value="' + esc(o) + '"' + (cur ? ' checked' : '') + '>' + esc(base) +
        '<input type="text" class="lain-teks" data-lain="' + esc(q.id) + '" value="' + esc(teks) + '" placeholder="tulis sendiri" aria-label="' + esc(base) + ', tulis sendiri"' + (cur ? '' : ' disabled') + '></label>';
    }
    return '<label><input type="' + type + '" name="' + id + '" value="' + esc(o) + '"' + ((arr ? arr.indexOf(o) >= 0 : v === o) ? ' checked' : '') + '>' + esc(o) + '</label>';
  }).join('') + '</div>';
  if (q.tipe === 'jenjang') return '<div class="field" id="f_' + q.id + '"><span class="lbl" id="l_' + q.id + '">' + esc(q.label) + '</span>' + ket +
    '<div class="program" role="radiogroup" aria-labelledby="l_' + q.id + '">' + S.d.jenjang.map(j => '<label><input type="radio" name="' + id + '" value="' + esc(j.kode) + '"' + (v === j.kode ? ' checked' : '') + '><span><b>' + esc(j.nama) + '</b>' + (j.keterangan ? '<small>' + esc(j.keterangan) + '</small>' : '') + '</span></label>').join('') + '</div>' + err + '</div>';
  if (q.tipe === 'yatidak') return '<div class="field yt" id="f_' + q.id + '"><span class="lbl" id="l_' + q.id + '">' + esc(q.label) + ket + '</span>' + radios('radio', q.opsi.length ? q.opsi : ['Ya', 'Tidak']) + err + '</div>';
  if (q.tipe === 'pilihan') return '<div class="field" id="f_' + q.id + '"><span class="lbl" id="l_' + q.id + '">' + esc(q.label) + '</span>' + radios('radio', q.opsi) + ket + err + '</div>';
  if (q.tipe === 'rentang_jam') {
    const arr = Array.isArray(v) ? v : [];
    return '<div class="field" id="f_' + q.id + '"><span class="lbl" id="l_' + q.id + '">' + esc(q.label) + '</span>' + ket + '<div class="rentang">' +
      (q.opsi.length ? q.opsi : ['Jam']).map((baris, i) => {
        const nilai = (arr.find(x => String(x).indexOf(baris + ':') === 0) || '').slice(baris.length + 1).split('s.d').map(x => x.trim());
        return '<div class="rentang-baris"><span class="rentang-nama">' + esc(baris) + '</span><input type="time" data-r="' + i + '" data-pos="0" value="' + esc(nilai[0] || '') + '" aria-label="' + esc(baris) + ' mulai">' +
          '<span class="sd">s.d</span><input type="time" data-r="' + i + '" data-pos="1" value="' + esc(nilai[1] || '') + '" aria-label="' + esc(baris) + ' sampai"></div>';
      }).join('') + '</div>' + err + '</div>';
  }
  if (q.tipe === 'kotak_centang') return '<div class="field" id="f_' + q.id + '"><span class="lbl" id="l_' + q.id + '">' + esc(q.label) + '</span>' + ket + radios('checkbox', q.opsi, Array.isArray(v) ? v : []) + err + '</div>';
  const val = esc(v == null ? '' : v);
  const map = {
    paragraf: '<textarea id="' + id + '" rows="2">' + val + '</textarea>',
    angka: '<input type="text" inputmode="decimal" id="' + id + '" value="' + val + '">',
    tanggal: '<input type="date" id="' + id + '" value="' + val + '">',
    email: '<input type="email" id="' + id + '" value="' + val + '" autocomplete="email" inputmode="email">',
    telepon: '<input type="tel" id="' + id + '" value="' + val + '" inputmode="tel" autocomplete="tel" placeholder="08…">',
    nik: '<input type="text" id="' + id + '" value="' + val + '" inputmode="numeric" maxlength="16" placeholder="16 digit angka">',
    dropdown: '<select id="' + id + '"><option value="">Pilih…</option>' + q.opsi.map(o => '<option' + (v === o ? ' selected' : '') + '>' + esc(o) + '</option>').join('') + '</select>'
  };
  return '<div class="field" id="f_' + q.id + '"><label for="' + id + '" id="l_' + q.id + '">' + esc(q.label) + '</label>' + (map[q.tipe] || '<input type="text" id="' + id + '" value="' + val + '">') + ket + err + '</div>';
}
const ICON_DOK = '<svg viewBox="0 0 24 24" fill="none" stroke="#1F3F95" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>';
function dokHtml(d) {
  const f = S.files[d.id];
  const acc = d.format.map(x => x === 'jpg' ? 'image/jpeg' : x === 'png' ? 'image/png' : 'application/pdf').concat(d.format.indexOf('jpg') >= 0 ? ['image/*'] : []).join(',');
  return '<div class="dok' + (f ? ' ok' : '') + '" id="d_' + d.id + '"><div class="ikon">' + (f && f.thumb ? '<img src="' + f.thumb + '" alt="">' : ICON_DOK) + '</div>' +
    '<div class="dok-teks"><b>' + esc(d.nama) + '</b><small>' + (d.keterangan ? esc(d.keterangan) + ' ' : '') + d.format.join(', ').toUpperCase() + ', maks. ' + d.maksMB + ' MB</small><span class="status" aria-live="polite">' + (f ? 'Terunggah: ' + esc(f.name) : '') + '</span></div>' +
    '<span class="btn ' + (f ? 'btn-garis' : 'btn-navy') + ' btn-kecil pilih">' + (f ? 'Ganti' : 'Pilih file') + '<input type="file" accept="' + acc + '" data-doc="' + d.id + '" aria-label="Pilih file ' + esc(d.nama) + '"></span></div>';
}
function pemicu(id) { return id === 'jenjang' || S.d.questions.concat(S.d.docs).some(x => x.syarat && x.syarat.split(/!?=/)[0].trim() === id); }
function bindPage(p) {
  const body = $('#stepBody');
  if (p.type === 'bagian') p.qs.forEach(q => {
    const id = 'q_' + q.id;
    const after = () => {
      const f = $('#f_' + q.id); if (f) f.classList.remove('salah'); saveDraft();
      if (!S.d.lengkapi && pemicu(q.id)) { const y = window.scrollY; buildPages(); S.page = Math.max(1, S.pages.findIndex(pg => pg.qs && pg.qs.some(x => x.id === q.id))); saveDraft(); renderPage(); window.scrollTo(0, y); }
    };
    if (q.tipe === 'rentang_jam') {
      const baca = () => {
        const rows = q.opsi.length ? q.opsi : ['Jam'];
        S.answers[q.id] = rows.map((b, i) => {
          const a = body.querySelector('#f_' + q.id + ' input[data-r="' + i + '"][data-pos="0"]').value, z = body.querySelector('#f_' + q.id + ' input[data-r="' + i + '"][data-pos="1"]').value;
          return a || z ? b + ': ' + a + ' s.d ' + z : '';
        }).filter(Boolean);
        $('#f_' + q.id).classList.remove('salah'); saveDraft();
      };
      body.querySelectorAll('#f_' + q.id + ' input[type=time]').forEach(t => { t.addEventListener('input', baca); t.addEventListener('change', baca); });
      return;
    }
    if (['pilihan', 'yatidak', 'kotak_centang', 'jenjang'].indexOf(q.tipe) >= 0) {
      body.querySelectorAll('input[name="' + id + '"]').forEach(inp => inp.addEventListener('change', () => {
        if (q.tipe === 'kotak_centang') {
          let vals = Array.prototype.map.call(body.querySelectorAll('input[name="' + id + '"]:checked'), x => x.value);
          const none = /^tidak/i.test(q.opsi[0] || '') ? q.opsi[0] : null;
          if (none && inp.checked) {
            vals = inp.value === none ? [none] : vals.filter(x => x !== none);
            body.querySelectorAll('input[name="' + id + '"]').forEach(x => { x.checked = vals.indexOf(x.value) >= 0; });
          }
          S.answers[q.id] = bacaPilihan(q);
        } else S.answers[q.id] = bacaPilihan(q);
        const t = inp.parentNode.querySelector('.lain-teks');
        if (t && inp.checked) setTimeout(() => t.focus(), 0);
        after();
      }));
      body.querySelectorAll('.lain-teks[data-lain="' + q.id + '"]').forEach(t => t.addEventListener('input', () => {
        S.answers[q.id] = bacaPilihan(q); $('#f_' + q.id).classList.remove('salah'); saveDraft();
      }));
    } else {
      const el = document.getElementById(id);
      const upd = () => {
        if (q.tipe === 'nik') el.value = el.value.replace(/\D/g, '').slice(0, 16);
        if (q.tipe === 'angka') el.value = el.value.replace(/[^\d.,]/g, '');
        S.answers[q.id] = el.value;
      };
      el.addEventListener('input', () => { upd(); $('#f_' + q.id).classList.remove('salah'); saveDraft(); });
      el.addEventListener('change', () => { upd(); after(); });
    }
  });
  if (p.type === 'dokumen') body.querySelectorAll('input[type=file]').forEach(inp => inp.addEventListener('change', () => uploadDoc(inp)));
}
function kosong(v) { return v == null || (Array.isArray(v) ? !v.length : !String(v).trim()); }
/* ---------- lengkapi data (tautan khusus per anak) ---------- */
function renderLengkapi() {
  const L = S.d.lengkapi;
  show('form');
  ['#stepLabel', '#bagianNav'].forEach(x => { if ($(x)) $(x).innerHTML = ''; });
  $('#progressBar').parentNode.classList.add('hidden');
  const simpan = document.querySelector('.form-top .btn-teks'); if (simpan) simpan.classList.add('hidden');
  if (L.error) { $('#stepBody').innerHTML = '<h2>Tautan tidak bisa dibuka</h2><p class="petunjuk">' + esc(L.error) + '</p>'; return; }
  S.answers = Object.assign({}, L.answers);
  const qs = S.d.questions.filter(q => L.qIds.indexOf(q.id) >= 0);
  const docs = S.d.docs.filter(d => L.dIds.indexOf(d.id) >= 0);
  if (!qs.length && !docs.length) { $('#stepBody').innerHTML = '<h2>Data sudah lengkap</h2><p class="petunjuk">Terima kasih, data pendaftaran Ananda ' + esc(L.nama) + ' (' + esc(L.noReg) + ') sudah lengkap.</p>'; return; }
  const per = {}, urut = [];
  qs.forEach(q => { if (!per[q.bagian]) { per[q.bagian] = []; urut.push(q.bagian); } per[q.bagian].push(q); });
  const st = S.d.settings;
  $('#stepBody').innerHTML = '<h2>Lengkapi data pendaftaran</h2><p class="petunjuk">Ananda <b>' + esc(L.nama) + '</b>, nomor pendaftaran <b>' + esc(L.noReg) + '</b>. Isi yang sudah tersedia dulu; sisanya bisa dilengkapi lain waktu lewat tautan yang sama.</p>' +
    urut.map(b => '<h3 style="font:600 1.1rem var(--display);color:var(--navy);margin:18px 0 10px">' + esc(b) + '</h3>' + fieldsHtml(per[b])).join('') +
    (docs.length ? '<h3 style="font:600 1.1rem var(--display);color:var(--navy);margin:18px 0 10px">Dokumen</h3>' +
      (docs.some(d => /transfer|bayar/i.test(d.nama)) && (st.biayaPendaftaran || st.infoPembayaran) ? '<div class="info-box kuning" style="white-space:pre-line">' + (st.biayaPendaftaran ? 'Biaya pendaftaran <b>' + esc(rupiah(st.biayaPendaftaran)) + '</b>\n' : '') + esc(st.infoPembayaran || '') + '</div>' : '') +
      docs.map(dokHtml).join('') : '') +
    '<div id="formAlert"></div><div class="nav-form"><div class="kanan"><button class="btn btn-kuning" id="lengkapiBtn" onclick="kirimLengkapi()">Kirim data</button></div></div>';
  bindPage({ type: 'bagian', qs: qs });
  bindPage({ type: 'dokumen' });
  S.lengkapiQs = qs; S.lengkapiDocs = docs;
}
async function kirimLengkapi() {
  const L = S.d.lengkapi;
  let salah = null;
  S.lengkapiQs.forEach(q => { const m = !kosong(S.answers[q.id]) ? cekIsian(Object.assign({}, q, { wajib: false })) : ''; if (m) { const el = $('#f_' + q.id); el.classList.add('salah'); el.querySelector('.err').textContent = m; if (!salah) salah = el; } });
  if (salah) { salah.scrollIntoView({ behavior: 'smooth', block: 'center' }); return; }
  if (document.querySelector('.dok[data-sedang]')) { toast('Tunggu sampai semua file selesai diunggah.'); return; }
  const answers = {}, files = {};
  S.lengkapiQs.forEach(q => { if (!kosong(S.answers[q.id])) answers[q.id] = S.answers[q.id]; });
  S.lengkapiDocs.forEach(d => { if (S.files[d.id]) files[d.id] = S.files[d.id].fileId; });
  if (!Object.keys(answers).length && !Object.keys(files).length) { toast('Belum ada isian atau berkas yang diisi.'); return; }
  const b = $('#lengkapiBtn'); b.disabled = true; b.textContent = 'Mengirim…';
  try {
    const r = await run('submitLengkapi', { noReg: L.noReg, kode: L.kode, answers: answers, files: files });
    $('#stepBody').innerHTML = r.kurang.length
      ? '<h2>Terima kasih, data tersimpan</h2><p class="petunjuk">Masih ada yang perlu dilengkapi:</p><ul>' + r.kurang.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul><p class="petunjuk">Silakan buka kembali tautan yang sama untuk melengkapinya, atau bawa berkasnya ke sekolah.</p><div class="nav-form"><button class="btn btn-navy" onclick="location.reload()">Lengkapi sisanya sekarang</button></div>'
      : '<h2>Data sudah lengkap</h2><p class="petunjuk">Terima kasih, data pendaftaran Ananda ' + esc(L.nama) + ' sudah lengkap.</p>';
  } catch (e) { b.disabled = false; b.textContent = 'Kirim data'; $('#formAlert').innerHTML = '<div class="alert">' + esc(e) + '</div>'; }
}
function cekIsian(q) {
  const v = S.answers[q.id];
  if (wajibNow(q) && kosong(v)) return ['pilihan', 'yatidak', 'dropdown', 'jenjang'].indexOf(q.tipe) >= 0 ? 'Pilih salah satu.' : q.tipe === 'kotak_centang' ? 'Pilih minimal satu.' : 'Wajib diisi.';
  if (q.tipe === 'rentang_jam') {
    const rows = q.opsi.length ? q.opsi : ['Jam'], arr = Array.isArray(v) ? v : [];
    const kurang = rows.filter(b => { const x = arr.find(y => String(y).indexOf(b + ':') === 0); return !x || /:\s*s\.d|s\.d\s*$/.test(x); });
    if (kurang.length && (q.wajib || arr.length)) return 'Lengkapi jam mulai dan selesai untuk: ' + kurang.join(', ') + '.';
    return '';
  }
  if (kosong(v)) return '';
  if ([].concat(v).some(x => /:\s*$/.test(String(x)))) return 'Tuliskan jawaban untuk pilihan "' + String([].concat(v).find(x => /:\s*$/.test(String(x)))).replace(/:\s*$/, '') + '".';
  if (q.tipe === 'nik' && !/^\d{16}$/.test(v)) return 'NIK harus 16 digit angka. Sekarang ' + String(v).length + ' digit.';
  if (q.tipe === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) return 'Format email belum benar, contoh: nama@gmail.com';
  if (q.tipe === 'telepon' && String(v).trim() !== '-' && String(v).replace(/\D/g, '').length < 9) return 'Nomor terlalu pendek.';
  return '';
}
function validate(p) {
  let first = null;
  if (p.type === 'bagian') p.qs.forEach(q => {
    const m = cekIsian(q); if (!m) return;
    const el = $('#f_' + q.id); if (!el) return;
    el.classList.add('salah'); el.querySelector('.err').textContent = m; if (!first) first = el;
  });
  if (p.type === 'dokumen') docsAktif().forEach(d => {
    if (d.wajib && !S.d.petugas && !S.files[d.id]) { const el = $('#d_' + d.id); el.classList.add('salah'); el.querySelector('.status').textContent = 'Belum diunggah.'; if (!first) first = el; }
  });
  if (first) {
    first.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const f = first.querySelector('input,select,textarea'); if (f) setTimeout(() => f.focus({ preventScroll: true }), 350);
    const n = document.querySelectorAll('#stepBody .salah').length;
    toast(n > 1 ? n + ' isian belum lengkap.' : 'Ada isian yang belum lengkap.');
  }
  return !first;
}
function next() {
  const p = S.pages[S.page];
  if (!validate(p)) return;
  if (document.querySelector('.dok[data-sedang]')) { toast('Tunggu sampai semua file selesai diunggah.'); return; }
  S.page = Math.min(S.page + 1, S.pages.length - 1); saveDraft(); renderPage(); window.scrollTo(0, 0);
}
function prev() { S.page = Math.max(S.page - 1, 0); saveDraft(); renderPage(); window.scrollTo(0, 0); }
function lompat(i) { S.page = i; saveDraft(); renderPage(); window.scrollTo(0, 0); }

/* ---------- unggah ---------- */
function bacaURL(b) { return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej('File tidak bisa dibaca.'); r.readAsDataURL(b); }); }
function muatGambar(src) { return new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej('Foto tidak bisa dibuka. Coba pilih foto lain atau ubah ke JPG.'); i.src = src; }); }
async function perkecil(file, maxBytes) {
  const img = await muatGambar(await bacaURL(file));
  let side = 1800, q = 0.82, blob = null;
  for (let t = 0; t < 6; t++) {
    const k = Math.min(1, side / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas'); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
    const ctx = c.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height); ctx.drawImage(img, 0, 0, c.width, c.height);
    blob = await new Promise(r => c.toBlob(r, 'image/jpeg', q));
    if (blob && blob.size <= maxBytes) break;
    side = Math.round(side * 0.8); q = Math.max(0.6, q - 0.06);
  }
  return new File([blob], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' });
}
async function thumb(file) {
  try { const img = await muatGambar(await bacaURL(file)); const c = document.createElement('canvas'); const k = 104 / Math.max(img.naturalWidth, img.naturalHeight); c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); return c.toDataURL('image/jpeg', 0.7); } catch (e) { return ''; }
}
async function uploadDoc(inp) {
  const d = S.d.docs.find(x => x.id === inp.dataset.doc);
  let file = inp.files[0];
  if (!file || !d) return;
  const box = $('#d_' + d.id), st = box.querySelector('.status');
  box.classList.remove('salah', 'ok'); box.setAttribute('data-sedang', '1');
  const isImg = /^image\//.test(file.type);
  const isPdf = file.type === 'application/pdf' || /\.pdf$/i.test(file.name);
  const max = d.maksMB * 1024 * 1024;
  try {
    if (isImg) {
      if (d.format.indexOf('jpg') < 0 && d.format.indexOf('png') < 0) throw 'Dokumen ini harus PDF.';
      const okType = (file.type === 'image/jpeg' && d.format.indexOf('jpg') >= 0) || (file.type === 'image/png' && d.format.indexOf('png') >= 0);
      if (!okType || file.size > 900 * 1024) { st.textContent = 'Memperkecil foto…'; file = await perkecil(file, Math.min(max * 0.9, 1.5 * 1024 * 1024)); }
    } else if (isPdf) {
      if (d.format.indexOf('pdf') < 0) throw 'Dokumen ini harus berupa foto (JPG/PNG).';
      if (file.size > max) throw 'PDF lebih dari ' + d.maksMB + ' MB. Foto dokumennya saja dengan kamera HP, atau kecilkan PDF-nya.';
    } else throw 'Format file harus ' + d.format.join(', ').toUpperCase() + '.';
    if (file.size > max) throw 'Ukuran file masih lebih dari ' + d.maksMB + ' MB.';
    st.textContent = 'Mengunggah…';
    const data = (await bacaURL(file)).split(',')[1];
    const r = await run('uploadTemp', { docId: d.id, name: file.name, mime: file.type || 'application/pdf', data: data });
    S.files[d.id] = { fileId: r.fileId, name: r.name, ts: Date.now(), thumb: isImg ? await thumb(file) : '' };
    saveDraft();
    box.outerHTML = dokHtml(d);
    $('#d_' + d.id + ' input[type=file]').addEventListener('change', e => uploadDoc(e.target));
  } catch (e) {
    box.removeAttribute('data-sedang'); box.classList.add('salah'); st.textContent = 'Gagal: ' + e;
  }
}

/* ---------- periksa & kirim ---------- */
function fmtVal(q, v) {
  if (kosong(v)) return '–';
  if (Array.isArray(v)) return esc(v.join(', '));
  if (q.tipe === 'tanggal') return esc(tgl(v));
  if (q.tipe === 'jenjang') return esc(namaProgram(v));
  return esc(v);
}
function reviewHtml() {
  let h = '<h2>Periksa kembali</h2><p class="petunjuk">Pastikan data sudah benar. Tekan "Ubah" untuk memperbaiki.</p>';
  const seen = {};
  S.pages.forEach((p, i) => {
    if (p.type === 'bagian') {
      const first = !seen[p.bagian]; seen[p.bagian] = 1;
      h += '<div class="review-bagian"' + (first ? '' : ' style="border-top:0;padding-top:0"') + '>' + (first ? '<header><h3>' + esc(p.bagian) + '</h3><button class="btn btn-teks" onclick="lompat(' + i + ')">Ubah</button></header>' : '') +
        '<dl>' + p.qs.map(q => '<dt>' + esc(q.label) + '</dt><dd>' + fmtVal(q, S.answers[q.id]) + '</dd>').join('') + '</dl></div>';
    }
    if (p.type === 'dokumen') h += '<div class="review-bagian"><header><h3>Dokumen</h3><button class="btn btn-teks" onclick="lompat(' + i + ')">Ubah</button></header><dl>' +
      docsAktif().map(d => '<dt>' + esc(d.nama) + '</dt><dd>' + (S.files[d.id] ? esc(S.files[d.id].name) : '–') + '</dd>').join('') + '</dl></div>';
  });
  return h + '<label class="setuju"><input type="checkbox" id="setuju">Saya menyatakan bahwa data yang saya isi benar dan dapat dipertanggungjawabkan.</label>';
}
async function kirim() {
  if (!$('#setuju').checked) { $('#formAlert').innerHTML = '<div class="alert">Centang pernyataan di atas terlebih dahulu.</div>'; return; }
  for (let i = 1; i < S.pages.length - 1; i++) {
    const p = S.pages[i];
    const bad = p.type === 'bagian' ? p.qs.some(q => cekIsian(q)) : p.type === 'dokumen' ? docsAktif().some(d => d.wajib && !S.d.petugas && !S.files[d.id]) : false;
    if (bad) { S.page = i; renderPage(); validate(p); return; }
  }
  const btn = $('#kirimBtn'); btn.disabled = true; btn.textContent = 'Mengirim…';
  const files = {}; docsAktif().forEach(d => { if (S.files[d.id]) files[d.id] = S.files[d.id].fileId; });
  const answers = {}; S.d.questions.filter(applies).forEach(q => { answers[q.id] = visible(q) && S.answers[q.id] != null ? S.answers[q.id] : ''; });
  try {
    const r = await run('submitRegistration', { answers: answers, files: files, uji: S.d.uji || '', petugas: S.d.petugas || '', masuk: (S.d.jalan && S.d.jalan.token) || '' });
    const kirimJawaban = Object.assign({}, answers);
    store(DRAFT_KEY, null); S.answers = {}; S.files = {}; S.page = 0;
    $('#doneNo').textContent = r.noReg; $('#doneNama').textContent = r.nama;
    $('#doneGel').textContent = 'Program ' + r.jenjang + (r.gelombang ? ', gelombang ' + r.gelombang : '') + ', tahun ajaran ' + r.tahunAjaran;
    $('#donePesan').textContent = S.d.settings.pesanSukses || '';
    $('#doneKurang').innerHTML = r.kurang && r.kurang.length ? '<div class="info-box kuning" style="text-align:left"><b>Data/berkas yang masih perlu dilengkapi:</b><ul style="margin:6px 0 0;padding-left:20px">' + r.kurang.map(x => '<li>' + esc(x) + '</li>').join('') + '</ul>' +
      '<div style="margin-top:10px">Lengkapi kapan saja lewat tautan ini (simpan atau kirim ke orang tua):<br><a href="' + esc(r.link) + '" target="_blank" rel="noopener" style="word-break:break-all">' + esc(r.link) + '</a></div></div>' : '';
    const wa = S.d.settings.whatsapp;
    if (wa && !S.d.petugas) {
      const tpl = S.d.settings.pesanKonfirmasiWA || 'Assalamu’alaikum, saya {nama_ortu}. Saya sudah mendaftarkan Ananda {nama_anak} ({program}, gelombang {gelombang}) dengan nomor pendaftaran {no_pendaftaran}. Bukti transfer sudah saya unggah. Terima kasih.';
      const nilai = Object.assign({}, kirimJawaban, { nama_anak: r.nama, nama_ortu: kirimJawaban.nama_ortu || '', no_pendaftaran: r.noReg, program: r.jenjang, jenjang: r.jenjang, gelombang: r.gelombang || '-', tahun_ajaran: r.tahunAjaran, nama_sekolah: S.d.settings.namaSekolah || 'PAUD AL-JAUHAR' });
      const teks = tpl.replace(/\{(\w+)\}/g, (m, k) => nilai[k] != null && nilai[k] !== '' ? [].concat(nilai[k]).join(', ') : m);
      $('#doneWa').href = 'https://wa.me/' + waNum(wa) + '?text=' + encodeURIComponent(teks);
      $('#doneWa').classList.remove('hidden');
    }
    show('done');
  } catch (e) {
    btn.disabled = false; btn.textContent = 'Kirim pendaftaran';
    $('#formAlert').innerHTML = '<div class="alert">Pendaftaran belum terkirim. ' + esc(e) + '</div>';
  }
}
function copyNo() {
  const t = $('#doneNo').textContent, ok = () => toast('Nomor pendaftaran disalin.');
  if (navigator.clipboard) navigator.clipboard.writeText(t).then(ok).catch(() => salinManual(t, ok)); else salinManual(t, ok);
}
function salinManual(t, cb) { const a = document.createElement('textarea'); a.value = t; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); cb(); } catch (e) { toast('Salin manual: ' + t); } a.remove(); }

/* ---------- cek status ---------- */
async function cekStatus() {
  const no = $('#cekNo').value.trim(), t = $('#cekTgl').value, out = $('#cekHasil');
  if (!no || !t) { out.innerHTML = '<div class="alert">Isi nomor pendaftaran dan tanggal lahir.</div>'; return; }
  const b = $('#cekBtn'); b.disabled = true; b.textContent = 'Mencari…';
  try {
    const r = await run('cekStatus', no, t);
    out.innerHTML = '<div class="hasil"><div style="display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;align-items:center"><div><b style="font:600 1.3rem var(--display);color:var(--navy)">' + esc(r.nama) + '</b><br><small>' + esc(r.noReg) + ', ' + esc(r.jenjang) + (r.gelombang ? ', ' + esc(r.gelombang) : '') + '</small></div><span class="pil ' + esc(r.status) + '">' + esc(r.status) + '</span></div>' +
      '<p style="margin:12px 0 0">Biaya pendaftaran: <b>' + (r.biaya ? 'sudah diterima' : 'sedang diperiksa') + '</b></p>' +
      (r.kurang && r.kurang.length ? '<div class="info-box kuning" style="margin-top:12px"><b>Masih perlu dilengkapi:</b> ' + esc(r.kurang.join(', ')) + (r.link ? '<div style="margin-top:10px"><a class="btn btn-navy" href="' + esc(r.link) + '" target="_top">Lengkapi sekarang</a></div>' : '') + '</div>' : '') +
      (r.catatan ? '<p style="margin:10px 0 0"><b>Catatan dari sekolah:</b><br>' + esc(r.catatan).replace(/\n/g, '<br>') + '</p>' : '') + '</div>';
  } catch (e) { out.innerHTML = '<div class="alert">' + esc(e) + '</div>'; }
  b.disabled = false; b.textContent = 'Cek status';
}


/* =========================================================
   Lapisan situs: halaman-halaman, menu, animasi
   ========================================================= */
const DEF_WEB = {
  visi: '', misi: '',
  kegiatanPembelajaran: 'Pembelajaran di PAUD AL-JAUHAR menggunakan Model Pembelajaran Proyek dengan Media Loose Parts. Anak diberi kebebasan menentukan kegiatan bermain sesuai topik, dan guru berperan sebagai fasilitator.\n\nSetiap kegiatan dirancang menyenangkan melalui pendekatan bermain sambil belajar, dengan menanamkan nilai-nilai agama sebagai pembentuk karakter.',
  spmbPengantar: 'Pendaftaran murid baru dilakukan secara online. Siapkan dokumen yang diperlukan, isi formulir sampai selesai, lalu simpan nomor pendaftaran untuk mengecek status.',
  trialKeterangan: 'Kelas perkenalan untuk anak berusia 2-5 tahun terhadap kegiatan bermain sambil belajar yang menyenangkan di lingkungan sekolah.',
  trialJadwal: 'Setiap hari Sabtu, 08.00 – 11.00', trialInfo: '',
  urlInstagram: 'https://www.instagram.com/paudaljauhar/', urlTiktok: 'https://www.tiktok.com/@paudaljauhar',
  urlYoutube: 'https://www.youtube.com/@paudaljauhar', urlFacebook: 'https://www.facebook.com/p/Paud-Aljauhar-100011631941579/'
};
function stWeb(k) { const v = S.d.settings[k]; return v === undefined ? DEF_WEB[k] : v; }

const RUTE = {
  '': { judul: '' },
  'selayang-pandang': { judul: 'Selayang Pandang', induk: 'Tentang Kami' },
  'visi-misi': { judul: 'Visi dan Misi', induk: 'Tentang Kami' },
  'kegiatan-pembelajaran': { judul: 'Kegiatan Pembelajaran', induk: 'Tentang Kami' },
  'guru-tendik': { judul: 'Guru dan Tenaga Kependidikan', induk: 'Tentang Kami' },
  'kb-tk': { judul: 'TK – KB – TPA', induk: 'Program' },
  'kelas-trial': { judul: 'Kelas Trial', induk: 'Program' },
  'spmb': { judul: 'SPMB', induk: '' },
  'cek-status': { judul: 'Cek Status Pendaftaran', induk: 'SPMB' },
  'daftar': { judul: 'Formulir Pendaftaran', induk: 'SPMB' }
};
function ruteSekarang() {
  if (PREVIEW) { const h = location.hash.slice(1).toLowerCase(); return h in RUTE ? h : ''; }
  const p = location.pathname.replace(/^\/+|\/+$/g, '').toLowerCase();
  const r = Object.keys(ALAMAT).find(k => ALAMAT[k] === p);
  return r === undefined ? '' : r;
}
function paramTetap() {
  if (PREVIEW) return '';
  const p = new URLSearchParams(location.search);
  p.delete('lengkapi'); p.delete('k');
  const q = p.toString();
  return q ? '?' + q : '';
}
function keRute(r, simpanParam) {
  if (PREVIEW) { location.hash = r || 'beranda'; return; }
  location.href = href(r) + (simpanParam ? paramTetap() : '');
}

const startFormAsli = startForm, goHomeAsli = goHome;
startForm = function () {
  if (S.rute !== 'daftar' && S.d.gel && S.d.gel.open) { keRute('daftar', true); return; }
  return startFormAsli();
};
goHome = function (anchor) {
  if (S.rute !== '') { if (PREVIEW) { keRute(''); return; } location.href = href('') + paramTetap() + (anchor ? '#' + anchor : ''); return; }
  return goHomeAsli(anchor);
};

function terapkanRute() {
  const r = ruteSekarang(), info = RUTE[r], nama = S.d.settings.namaSekolah || 'PAUD AL-JAUHAR';
  S.rute = r;
  document.body.dataset.hal = r || 'home';
  document.querySelectorAll('[data-hal]').forEach(el => el.classList.toggle('bukan-hal', el.dataset.hal.split(' ').indexOf(r || 'home') < 0));
  document.querySelectorAll('a[data-rute]').forEach(x => x.classList.toggle('aktif', x.dataset.rute === r && !x.classList.contains('brand')));
  document.querySelectorAll('.nav-grup').forEach(g => g.classList.toggle('aktif', !!g.querySelector('a.aktif')));

  const ph = $('#pageHead');
  if (r && r !== 'daftar') {
    ph.classList.remove('hidden');
    $('#pageJudul').textContent = r === 'spmb' ? 'SPMB ' + (S.d.settings.tahunAjaran || '') : info.judul;
    $('#pageSub').textContent = r === 'spmb' ? 'Sistem Penerimaan Murid Baru ' + nama : r === 'guru-tendik' ? 'Pendidik dan tenaga kependidikan ' + nama : '';
    $('#remah').innerHTML = '<a href="' + href('') + '">Beranda</a>' + (info.induk ? '<span>' + esc(info.induk) + '</span>' : '') + '<span aria-current="page">' + esc(info.judul) + '</span>';
  } else ph.classList.add('hidden');

  document.title = (r ? info.judul + ' · ' : '') + nama + (r ? '' : ' · ' + (S.d.settings.subjudulHero || 'Magelang'));

  if (r === 'cek-status') show('status');
  else if (r === 'daftar' && S.d.jalanError) {
    show('home'); document.querySelectorAll('[data-hal]').forEach(el => el.classList.add('bukan-hal'));
    ph.classList.remove('hidden'); $('#pageJudul').textContent = 'Tautan tidak berlaku'; $('#pageSub').textContent = S.d.jalanError;
  }
  else if (r === 'daftar') {
    if (S.d.lengkapi) { /* renderLengkapi membuka formulirnya sendiri */ }
    else if (S.d.gel.open) startFormAsli();
    else { show('home'); document.querySelectorAll('[data-hal]').forEach(el => el.classList.toggle('bukan-hal', el.dataset.hal.split(' ').indexOf('spmb') < 0)); ph.classList.remove('hidden'); $('#pageJudul').textContent = 'Pendaftaran ditutup'; $('#pageSub').textContent = S.d.gel.alasan || S.d.settings.pesanTutup || ''; }
  }
  else { show('home'); renderCTA(); }
  pasangReveal();
}

/* ---------- isi halaman baru ---------- */
function renderSitus() {
  const st = S.d.settings, nama = st.namaSekolah || 'PAUD AL-JAUHAR';

  // selayang pandang: judul tanpa pengulangan
  $('#spJudul').textContent = 'Mengenal ' + nama;

  // SPMB
  $('#spmbTA').textContent = st.tahunAjaran || '';
  $('#spmbPengantar').textContent = stWeb('spmbPengantar');
  $('#spmbStatus').innerHTML = $('#statusKartu').innerHTML;
  $('#spmbStatus').classList.toggle('tutup', $('#statusKartu').classList.contains('tutup'));
  $('#spmbIntro').classList.remove('hidden');
  $('#ajakDaftar').textContent = S.d.gel.open ? 'Daftar sekarang' : 'Pendaftaran ditutup';

  // Visi misi
  const visi = String(stWeb('visi') || '').trim(), misi = lines(stWeb('misi'));
  $('#vmVisi').textContent = visi || 'Visi sekolah sedang disiapkan.';
  $('#vmMisi').innerHTML = misi.length ? misi.map(m => '<li>' + esc(m) + '</li>').join('') : '<li class="kosong">Misi sekolah sedang disiapkan.</li>';

  // Kegiatan pembelajaran: paragraf, baris berawalan - jadi daftar berpoin
  $('#kpTeks').innerHTML = teksKaya(stWeb('kegiatanPembelajaran')) || '<p class="kosong">Informasi kegiatan pembelajaran segera hadir.</p>';
  const kp = imgs('pembelajaran');
  $('#kpFoto').innerHTML = kp.map(i => '<figure><img src="' + esc(i.url) + '" alt="' + esc(i.keterangan || 'Kegiatan pembelajaran') + '" loading="lazy">' + (i.keterangan ? '<figcaption>' + esc(i.keterangan) + '</figcaption>' : '') + '</figure>').join('');
  $('#pembelajaran .kp-grid').classList.toggle('tanpa-foto', !kp.length);

  // Guru & tendik
  const guru = imgs('guru');
  $('#guruRel').innerHTML = guru.length ? guru.map(g => {
    const p = String(g.keterangan || '').split('|'), nm = (p[0] || '').trim(), jb = p.slice(1).join('|').trim();
    return '<figure class="guru-kartu"><div class="guru-foto"><img src="' + esc(g.url) + '" alt="' + esc(nm) + '" loading="lazy"></div><figcaption><b>' + esc(nm) + '</b>' + (jb ? '<span>' + esc(jb) + '</span>' : '') + '</figcaption></figure>';
  }).join('') : '<p class="kosong">Profil guru dan tendik segera hadir.</p>';
  document.querySelector('#guru .geser-tombol').classList.toggle('hidden', guru.length < 2);

  // Program dengan foto
  $('#jjList').innerHTML = S.d.jenjang.map(j => {
    const f = imgs('program_' + j.kode)[0];
    return '<article class="prog-kartu"><div class="prog-foto">' + (f ? '<img src="' + esc(f.url) + '" alt="' + esc(f.keterangan || j.nama) + '" loading="lazy">' : '<span class="prog-inisial" aria-hidden="true">' + esc(j.kode) + '</span>') + '</div>' +
      '<div class="prog-isi"><h3>' + esc(j.nama) + '</h3>' + (j.keterangan ? '<p>' + esc(j.keterangan) + '</p>' : '') + '</div></article>';
  }).join('');
  const lay = String(st.layanan || '').split('\n').map(l => l.split('|').map(x => x.trim())).filter(x => x[0]);
  $('#layananList').innerHTML = lay.map(x => '<div class="layanan-kartu"><b>' + esc(x[0]) + '</b>' + (x[1] ? '<span>' + esc(x[1]) + '</span>' : '') + '</div>').join('');
  $('#layananList').classList.remove('hidden');
  $('#layananBox').classList.toggle('hidden', !lay.length);

  // Kelas trial
  const tf = imgs('trial')[0];
  $('#trialFoto').innerHTML = tf ? '<img src="' + esc(tf.url) + '" alt="' + esc(tf.keterangan || 'Kelas Trial ' + nama) + '" loading="lazy">' : '<div class="foto-kosong" aria-hidden="true"></div>';
  $('#trialKet').textContent = stWeb('trialKeterangan');
  $('#trialJadwal').textContent = stWeb('trialJadwal');
  const ti = lines(stWeb('trialInfo'));
  $('#trialInfo').innerHTML = ti.map(x => '<li>' + esc(x) + '</li>').join('');
  $('#trialInfo').classList.toggle('hidden', !ti.length);
  if (st.whatsapp) $('#trialWa').href = 'https://wa.me/' + waNum(st.whatsapp) + '?text=' + encodeURIComponent('Assalamu’alaikum, saya ingin bertanya tentang Kelas Trial di ' + nama + '.');
  else $('#trialWa').classList.add('hidden');

  // Kaki situs
  const logo = imgs('logo')[0];
  if (logo) { $('#footLogo').src = logo.url; $('#footLogo').alt = 'Logo ' + nama; $('#footLogo').classList.remove('hidden'); }
  const baris = (id, ikon, html) => { const el = $('#' + id); if (html) { el.innerHTML = IKON[ikon] + '<span>' + html + '</span>'; el.classList.remove('hidden'); } else el.classList.add('hidden'); };
  baris('footAlamat', 'lokasi', st.alamat ? esc(st.alamat) : '');
  baris('footWa', 'wa', st.whatsapp ? '<a href="https://wa.me/' + waNum(st.whatsapp) + '" target="_blank" rel="noopener">' + esc(st.whatsapp) + '</a>' : '');
  baris('footEmail', 'email', st.email ? '<a href="mailto:' + esc(st.email) + '">' + esc(st.email) + '</a>' : '');
  const sos = [['urlInstagram', 'Instagram', 'ig'], ['urlTiktok', 'TikTok', 'tt'], ['urlYoutube', 'YouTube', 'yt'], ['urlFacebook', 'Facebook', 'fb']]
    .filter(x => String(stWeb(x[0]) || '').trim())
    .map(x => { let u = String(stWeb(x[0])).trim(); if (!/^https?:\/\//i.test(u)) u = 'https://' + u; return '<a class="sos ' + x[2] + '" href="' + esc(u) + '" target="_blank" rel="noopener" aria-label="' + x[1] + ' ' + esc(nama) + '" title="' + x[1] + '">' + SOSMED[x[2]] + '</a>'; });
  $('#footSosmed').innerHTML = sos.join('');
  $('#hakCipta').textContent = '© ' + new Date().getFullYear() + ' ' + nama + '. All rights reserved.';
}
const SOSMED = {
  ig: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="3" width="18" height="18" rx="5" fill="none" stroke="#fff" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="#fff" stroke-width="2"/><circle cx="17.3" cy="6.7" r="1.2" fill="#fff"/></svg>',
  tt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#25F4EE" d="M9.6 10.3v-1a7 7 0 0 0-1-.1 6 6 0 0 0-3.4 11 6 6 0 0 1 4.4-9.9Z"/><path fill="#FE2C55" d="M9.8 18.6a2.8 2.8 0 0 0 2.8-2.7V3h2.3a4.4 4.4 0 0 1-.1-1h-3.1v12.9a2.8 2.8 0 0 1-4 2.4 2.8 2.8 0 0 0 2.1 1.3Zm9.2-11.1v-1a4.4 4.4 0 0 1-2.4-.7A4.4 4.4 0 0 0 19 7.5Z"/><path fill="#fff" d="M16.6 5.8A4.4 4.4 0 0 1 15.5 3h-.9a4.5 4.5 0 0 0 2 2.8Zm-7.9 6.4a2.8 2.8 0 0 0-1.3 5.2 2.8 2.8 0 0 1 3.1-4.3v-3.3a6.2 6.2 0 0 0-.9 0V11a2.8 2.8 0 0 0-.9 1.2Zm10.3-4.7v3.2a7.9 7.9 0 0 1-4.6-1.5v6.7a6 6 0 0 1-9.6 4.9 6 6 0 0 0 10.6-3.9V10.2a7.9 7.9 0 0 0 4.6 1.5V8.5a4.6 4.6 0 0 1-1-.1Z"/></svg>',
  yt: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M10 8.5v7l6-3.5-6-3.5Z"/></svg>',
  fb: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#fff" d="M13.4 21v-7.4h2.5l.4-2.9h-2.9V8.9c0-.8.2-1.4 1.4-1.4h1.6V4.9a20 20 0 0 0-2.3-.1c-2.2 0-3.8 1.4-3.8 3.9v2.1H7.8v2.9h2.5V21Z"/></svg>'
};

function teksKaya(t) {
  return String(t || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => {
    const b = p.split('\n').map(x => x.trim());
    if (b.every(x => /^[-•*]\s*/.test(x))) return '<ul class="kp-daftar">' + b.map(x => '<li>' + esc(x.replace(/^[-•*]\s*/, '')) + '</li>').join('') + '</ul>';
    return '<p>' + b.map(esc).join('<br>') + '</p>';
  }).join('');
}

/* ---------- guru: geser ke samping ---------- */
function geserGuru(d) { const rel = $('#guruRel'); const k = rel.querySelector('.guru-kartu'); rel.scrollBy({ left: d * ((k ? k.offsetWidth : 240) + 20) * 2, behavior: 'smooth' }); }

/* ---------- animasi muncul ke atas ---------- */
let pengamat = null;
function pasangReveal() {
  const target = document.querySelectorAll('#view-home .alis, #view-home .judul, #view-home .judul-kecil, #view-home .lead, #view-home .status-kartu, .tiket, .sp-teks p, .kp-teks p, .kp-daftar li, .kp-foto figure, .sp-gambar img, .prestasi li, .chip-list li, .vm-visi, .vm-misi li, .guru-kartu, .prog-kartu, .layanan-kartu, .trial-foto, .jadwal-kartu, .trial-info, #trialWa, #info .kotak, .galeri, #ajak .wrap > *, .hero-teks > *, .page-head .wrap > *');
  if (!('IntersectionObserver' in window) || matchMedia('(prefers-reduced-motion: reduce)').matches) { target.forEach(el => el.classList.add('tampil')); return; }
  if (!pengamat) pengamat = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('tampil'); pengamat.unobserve(e.target); } }), { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  const urut = new Map();
  target.forEach(el => {
    if (el.classList.contains('tampil')) return;
    const induk = el.parentElement, n = urut.get(induk) || 0; urut.set(induk, n + 1);
    el.classList.add('reveal'); el.style.transitionDelay = Math.min(n, 6) * 70 + 'ms';
    pengamat.observe(el);
  });
}

/* ---------- penanda pendaftaran tahun berjalan ---------- */
function tandaJalan() {
  if (!S.d.jalan || document.querySelector('.mode-jalan')) return;
  const u = document.createElement('div'); u.className = 'mode-sekolah mode-jalan'; u.setAttribute('role', 'status');
  u.innerHTML = '<span class="titik"></span>Pendaftaran tahun berjalan · TA ' + esc(S.d.jalan.ta);
  document.body.appendChild(u);
}

/* ---------- mulai ---------- */
S.rute = ruteSekarang();
renderHome();
if (!S.d.error) {
  renderSitus();
  terapkanRute();
  tandaJalan();
  if (PREVIEW) window.addEventListener('hashchange', () => { terapkanRute(); window.scrollTo(0, 0); });
  if (!PREVIEW && S.rute === '' && location.hash) setTimeout(() => { const el = document.getElementById(location.hash.slice(1)); if (el) el.scrollIntoView(); }, 60);
}
