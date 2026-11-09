/* =========================================================
   PAUD AL-JAUHAR – pemuat situs (assets/situs.js)
   Dipanggil oleh index.html di setiap halaman.
   ========================================================= */
/* URL Web App Apps Script (Deploy > Manage deployments, berakhiran /exec) */
var API_URL = 'https://script.google.com/macros/s/AKfycbyYcNAGPvLZ6tnF9VAdm7sLof-NGktwO0VNXqOWLE79Q14fJ3vP7Zmi7ouczrmUWOWCVg/exec';
var BOOT_KEY = 'spmb_aljauhar_boot_v2';
var PREVIEW = !!window.__PREVIEW__;

/* Tautan lama /spmb/?lengkapi=…, ?petugas=…, ?uji=… dialihkan ke /daftar/ */
(function () {
  if (PREVIEW) return;
  var p = location.pathname.toLowerCase().replace(/\/+$/, '');
  if (p === '/spmb' && /[?&](lengkapi|petugas|uji)=/.test(location.search)) location.replace('/daftar/' + location.search + location.hash);
})();

async function api(fn, args) {
  if (PREVIEW) throw 'Ini halaman pratinjau, belum tersambung ke server.';
  const res = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify({ fn: fn, args: args || [] })
  });
  if (!res.ok) throw 'Server sedang sibuk (' + res.status + '). Coba lagi sebentar.';
  const out = await res.json();
  if (!out.ok) throw out.error || 'Terjadi kesalahan.';
  return out.data;
}

/* Minta data ke server sedini mungkin. */
window.__bootP = PREVIEW ? Promise.resolve(window.__MOCK__) : (function () {
  const prm = {};
  new URLSearchParams(location.search).forEach((v, k) => { prm[k] = v; });
  return api('getBoot', [prm]);
})();
window.__bootP.catch(() => {});

/* Alamat setiap halaman */
/* Alamat setiap halaman: kunci = nama halaman, nilai = alamat di domain */
const ALAMAT = {
  '': '', 'selayang-pandang': 'selayang-pandang', 'visi-misi': 'visi-misi', 'kegiatan-pembelajaran': 'kegiatan-pembelajaran',
  'guru-tendik': 'guru-tendik', 'kb-tk': 'kb-tk', 'kelas-trial': 'kelas-trial', 'spmb': 'spmb', 'cek-status': 'cek-status', 'daftar': 'daftar'
};
function href(r) { return PREVIEW ? '#' + (r || 'beranda') : '/' + (ALAMAT[r] ? ALAMAT[r] + '/' : ''); }

const IKON = {
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.3-.4.7-1.4.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 2.9 2.9 0 0 0-.9 2.2 5 5 0 0 0 1 2.7 11.6 11.6 0 0 0 4.4 3.9c1.7.7 2.3.8 3.1.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .2-1.3c-.1-.1-.3-.2-.5-.3Z"/></svg>',
  lokasi: '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  email: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="2"/><path d="m3.5 6.5 8.5 7 8.5-7" fill="none" stroke="currentColor" stroke-width="2"/></svg>',
  panah: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 9 6 6 6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>'
};

function templateSitus() {
  const a = (r, t, k) => '<a href="' + href(r) + '" data-rute="' + r + '"' + (k ? ' class="' + k + '"' : '') + '>' + t + '</a>';
  return '' +
'<header class="top" id="top"><div class="wrap">' +
  '<a class="brand" href="' + href('') + '" data-rute=""><img id="logo" class="hidden" alt=""><b id="brandName">PAUD AL-JAUHAR</b></a>' +
  '<button class="menu-btn" id="menuBtn" type="button" aria-expanded="false" aria-controls="navUtama" aria-label="Menu"><span></span><span></span><span></span></button>' +
  '<nav class="nav" id="navUtama" aria-label="Menu utama">' +
    '<div class="nav-grup"><button class="nav-induk" type="button" aria-expanded="false" data-grup="tentang">Tentang Kami' + IKON.panah + '</button><div class="nav-sub">' + a('selayang-pandang', 'Selayang Pandang') + a('visi-misi', 'Visi Misi') + a('kegiatan-pembelajaran', 'Kegiatan Pembelajaran') + a('guru-tendik', 'Guru &amp; Tendik') + '</div></div>' +
    '<div class="nav-grup"><button class="nav-induk" type="button" aria-expanded="false" data-grup="program">Program' + IKON.panah + '</button><div class="nav-sub">' + a('kb-tk', 'TK – KB – TPA') + a('kelas-trial', 'Kelas Trial') + '</div></div>' +
    a('spmb', 'SPMB') + a('cek-status', 'Cek Status') + a('daftar', 'Daftar', 'nav-daftar') +
  '</nav>' +
'</div></header>' +
'<main id="utama">' +
  '<section class="page-head hidden" id="pageHead"><div class="wrap"><nav class="remah" id="remah" aria-label="Lokasi halaman"></nav><h1 id="pageJudul"></h1><p id="pageSub"></p></div></section>' +
  '<div id="view-home">' +
    '<div id="banner" class="banner hidden" data-hal="home"><div class="slides" id="slides"></div></div>' +
    '<section class="hero" id="hero" data-hal="home"><div class="wrap">' +
      '<div class="hero-teks">' +
        '<span class="pita" id="heroTA">SPMB Tahun Ajaran</span>' +
        '<p class="judul-spmb" id="heroJudul">Sistem Penerimaan Murid Baru</p>' +
        '<h1 id="heroNama">PAUD AL&#8209;JAUHAR</h1>' +
        '<div class="akreditasi" id="heroAkr"><span class="bintang" aria-hidden="true"><svg viewBox="0 0 24 24"><path fill="#fff" d="M12 2.5l2.8 6 6.6.7-4.9 4.5 1.4 6.5L12 16.9l-5.9 3.3 1.4-6.5-4.9-4.5 6.6-.7z"/></svg></span><span>TERAKREDITASI <b id="heroAkrNilai">A</b></span></div>' +
        '<p class="program-teks" id="heroSub"></p>' +
        '<div class="aksi"><button class="btn btn-kuning" id="heroDaftar" onclick="startForm()">Isi formulir pendaftaran</button><a class="btn btn-garis" href="' + href('cek-status') + '">Cek status</a></div>' +
      '</div>' +
      '<div class="status-kartu" id="statusKartu"></div>' +
    '</div></section>' +
    '<section class="blok hidden" id="spmbIntro" data-hal="spmb"><div class="wrap sempit"><span class="alis">Tahun Ajaran <b id="spmbTA"></b></span><h2 class="judul">Sistem Penerimaan Murid Baru</h2><p class="lead" id="spmbPengantar"></p><div class="status-kartu" id="spmbStatus"></div></div></section>' +
    '<section class="blok" id="gelombang" data-hal="home spmb"><div class="wrap"><span class="alis">SPMB</span><h2 class="judul">Jadwal pendaftaran</h2><div class="gel-grid" id="gelGrid"></div><p id="gelNote" class="gelombang-note hidden"></p></div></section>' +
    '<figure class="hiasan hidden" data-hiasan="0" data-hal="home"></figure>' +
    '<section class="blok" id="selayang" data-hal="selayang-pandang"><div class="wrap">' +
      '<div class="sp-grid" id="spGrid"><div class="sp-teks"><span class="alis">Tentang Kami</span><h2 class="judul" id="spJudul">Selayang Pandang</h2><div id="spTeks"></div></div><div class="sp-gambar" id="spGambar"></div></div>' +
      '<div id="prestasiBox" class="hidden prestasi-box"><span class="alis">Prestasi</span><h2 class="judul">Prestasi dan pengakuan</h2><ul class="prestasi" id="prestasiList"></ul></div>' +
    '</div></section>' +
    '<section class="blok" id="pembelajaran" data-hal="kegiatan-pembelajaran"><div class="wrap"><div class="kp-grid">' +
      '<div class="kp-teks"><span class="alis">Tentang Kami</span><h2 class="judul">Kegiatan pembelajaran</h2><div id="kpTeks"></div></div>' +
      '<div class="kp-foto" id="kpFoto"></div>' +
    '</div></div></section>' +
    '<section class="blok kegiatan hidden" id="kegiatanBox" data-hal="kegiatan-pembelajaran"><div class="wrap"><span class="alis">Kegiatan</span><h2 class="judul">Kegiatan unggulan</h2><ul class="chip-list" id="kegiatanList"></ul></div></section>' +
    '<section class="blok" id="visimisi" data-hal="visi-misi"><div class="wrap sempit">' +
      '<div class="vm-visi"><span class="alis">Visi</span><p id="vmVisi"></p></div>' +
      '<div class="vm-misi"><span class="alis">Misi</span><ol id="vmMisi"></ol></div>' +
    '</div></section>' +
    '<section class="blok" id="guru" data-hal="guru-tendik"><div class="wrap">' +
      '<div class="judul-baris"><div><span class="alis">Pendidik &amp; tenaga kependidikan</span><h2 class="judul">Kenali tim kami</h2></div><div class="geser-tombol"><button type="button" class="bulat" aria-label="Geser ke kiri" onclick="geserGuru(-1)">&#8249;</button><button type="button" class="bulat" aria-label="Geser ke kanan" onclick="geserGuru(1)">&#8250;</button></div></div>' +
      '<div class="guru-rel" id="guruRel" tabindex="0" aria-label="Daftar guru dan tendik"></div>' +
    '</div></section>' +
    '<section class="blok" id="program" data-hal="kb-tk"><div class="wrap">' +
      '<span class="alis">Program</span><h2 class="judul">TK – KB – TPA</h2>' +
      '<div class="prog-grid" id="jjList"></div>' +
      '<div id="layananBox"><h3 class="judul-kecil">Pilihan layanan</h3><div class="layanan-grid" id="layananList"></div></div>' +
    '</div></section>' +
    '<section class="blok" id="trial" data-hal="kelas-trial"><div class="wrap"><div class="trial-grid">' +
      '<div class="trial-foto" id="trialFoto"></div>' +
      '<div class="trial-teks"><span class="alis">Program</span><h2 class="judul">Kelas Trial</h2><p class="lead" id="trialKet"></p>' +
        '<div class="jadwal-kartu"><span>Jadwal</span><b id="trialJadwal"></b></div><ul class="trial-info" id="trialInfo"></ul>' +
        '<a class="btn btn-navy" id="trialWa" target="_blank" rel="noopener">' + IKON.wa + 'Tanya Kelas Trial lewat WhatsApp</a></div>' +
    '</div></div></section>' +
    '<section class="blok" id="info" data-hal="spmb"><div class="wrap"><div class="info-grid">' +
      '<div class="kotak"><h3 class="judul-kecil">Dokumen yang diunggah</h3><ul class="syarat" id="syaratList"></ul><p class="catatan">Siapkan dalam bentuk foto atau PDF, masing-masing paling besar 3 MB. Foto dari kamera HP boleh.</p></div>' +
      '<div class="kotak"><h3 class="judul-kecil" id="infoJudul">Alur pendaftaran</h3><figure class="alur-gambar hidden" id="alurGambar"></figure><div id="infoTeks"></div></div>' +
    '</div></div></section>' +
    '<section class="blok hidden" id="galeriBox" data-hal="home"><div class="wrap"><span class="alis">Galeri</span><h2 class="judul">Galeri kegiatan</h2><div class="galeri" id="galeri" aria-roledescription="carousel" aria-label="Foto kegiatan sekolah" tabindex="0"></div><div class="g-titik" id="galeriTitik"></div></div></section>' +
    '<figure class="hiasan hidden" data-hiasan="1" data-hal="selayang-pandang"></figure>' +
    '<figure class="hiasan hidden" data-hiasan="2" data-hal="kegiatan-pembelajaran"></figure>' +
    '<section class="ajak" id="ajak" data-hal="home spmb"><div class="wrap">' +
      '<h2 id="ajakJudul">Daftarkan putra-putri Ayah Bunda di PAUD AL&#8209;JAUHAR sekarang!</h2>' +
      '<div class="ajak-tombol"><button class="btn btn-navy" id="ajakDaftar" onclick="startForm()">Isi formulir pendaftaran</button>' +
      '<a class="btn btn-brosur hidden brosur-link" target="_blank" rel="noopener"><svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M12 3v12M7 10l5 5 5-5M5 21h14"/></svg><span class="brosur-teks">Unduh brosur</span></a>' +
      '<small class="brosur-info hidden" id="brosurInfo"></small></div>' +
    '</div></section>' +
  '</div>' +
  '<div id="view-form" class="hidden"><div class="form-page"><div class="form-wrap">' +
    '<div class="form-banner" id="formBanner"></div>' +
    '<div class="form-top"><span class="langkah" id="stepLabel"></span><button class="btn btn-teks" onclick="simpanKeluar()">Simpan, lanjutkan nanti</button></div>' +
    '<div class="progress" aria-hidden="true"><i id="progressBar"></i></div><div class="bagian-nav" id="bagianNav"></div><div class="kartu" id="stepBody"></div>' +
  '</div></div></div>' +
  '<div id="view-done" class="hidden"><div class="selesai-page"><div class="form-wrap"><div class="kartu selesai">' +
    '<h2 style="font-size:2rem">Pendaftaran terkirim</h2><p style="margin-bottom:0">Nomor pendaftaran Ananda <b id="doneNama"></b></p><div class="noreg" id="doneNo"></div>' +
    '<p id="doneGel" style="font-weight:700;color:var(--navy)"></p><p id="donePesan"></p><div id="doneKurang"></div>' +
    '<div class="aksi"><a class="btn btn-hijau hidden" id="doneWa" target="_blank" rel="noopener">Kirim konfirmasi ke WhatsApp sekolah</a><button class="btn btn-kuning" onclick="copyNo()">Salin nomor pendaftaran</button><button class="btn btn-teks" onclick="goHome()">Kembali ke beranda</button></div>' +
  '</div></div></div></div>' +
  '<div id="view-status" class="hidden"><div class="selesai-page"><div class="form-wrap"><div class="kartu">' +
    '<h2>Cek status pendaftaran</h2><p class="petunjuk">Masukkan nomor pendaftaran dan tanggal lahir Ananda.</p>' +
    '<div class="status-form"><div class="field"><label for="cekNo">Nomor pendaftaran</label><input type="text" id="cekNo" placeholder="Contoh: TK-27-001" autocomplete="off" autocapitalize="characters"></div>' +
    '<div class="field"><label for="cekTgl">Tanggal lahir anak</label><input type="date" id="cekTgl"></div>' +
    '<button class="btn btn-navy" id="cekBtn" onclick="cekStatus()" style="width:100%">Cek status</button></div><div id="cekHasil"></div>' +
  '</div></div></div></div>' +
  '<div class="memuat-isi" id="memuatIsi" role="status"><span class="muter" aria-hidden="true"></span>Memuat halaman…</div>' +
'</main>' +
'<footer class="kaki"><div class="wrap kaki-grid">' +
  '<div class="kaki-merek"><div class="kaki-logo"><img id="footLogo" class="hidden" alt=""><b id="footNama">PAUD AL-JAUHAR</b></div>' +
    '<p class="kaki-baris hidden" id="footAlamat"></p><p class="kaki-baris hidden" id="footWa"></p><p class="kaki-baris hidden" id="footEmail"></p>' +
    '<div class="sosmed-ikon" id="footSosmed"></div><div id="footKontak" hidden></div></div>' +
  '<div class="kaki-menu"><h3>Tentang Kami</h3>' + a('selayang-pandang', 'Selayang Pandang') + a('visi-misi', 'Visi Misi') + a('kegiatan-pembelajaran', 'Kegiatan Pembelajaran') + a('guru-tendik', 'Guru &amp; Tendik') + '</div>' +
  '<div class="kaki-menu"><h3>Program</h3>' + a('kb-tk', 'TK – KB – TPA') + a('kelas-trial', 'Kelas Trial') + '</div>' +
  '<div class="kaki-menu"><h3>SPMB</h3>' + a('spmb', 'Info SPMB') + a('daftar', 'Daftar') + a('cek-status', 'Cek Status') + '</div>' +
'</div><div class="kaki-bawah"><div class="wrap"><span id="hakCipta">© ' + new Date().getFullYear() + ' PAUD AL-JAUHAR. All rights reserved.</span><a class="admin-link" id="adminLink" href="#" target="_blank" rel="noopener">Masuk admin</a></div></div></footer>';
}

/* Pasang kerangka begitu halaman siap, lalu jalankan aplikasi setelah data tersedia. */
(async function mulai() {
  if (document.readyState === 'loading') await new Promise(r => document.addEventListener('DOMContentLoaded', r));
  document.body.insertAdjacentHTML('afterbegin', templateSitus());
  const awal = document.getElementById('memuat'); if (awal) awal.remove();
  document.body.classList.add('memuat');
  pasangMenu();

  const pakaiCache = !PREVIEW && !location.search;
  let simpan = null;
  if (pakaiCache) { try { simpan = JSON.parse(localStorage.getItem(BOOT_KEY) || 'null'); } catch (e) {} }
  const segar = simpan && simpan.data && !simpan.data.error && Date.now() - (simpan.t || 0) < 14 * 24 * 3600 * 1000;

  let boot;
  if (segar) boot = simpan.data;
  else {
    try { boot = await window.__bootP; }
    catch (e) { boot = { error: 'Tidak dapat terhubung ke server. Periksa koneksi internet lalu muat ulang halaman. (' + e + ')' }; }
    if (pakaiCache && !boot.error) { try { localStorage.setItem(BOOT_KEY, JSON.stringify({ t: Date.now(), data: boot })); } catch (e) {} }
  }
  window.__BOOT__ = boot;
  if (boot.scriptUrl) document.getElementById('adminLink').href = boot.scriptUrl + '?page=admin';

  await jalankanApp();
  document.body.classList.remove('memuat');

  if (!segar) return;
  let baru;
  try { baru = await window.__bootP; } catch (e) { return; }
  if (!baru || baru.error) return;
  const beda = JSON.stringify(baru) !== JSON.stringify(simpan.data);
  try { localStorage.setItem(BOOT_KEY, JSON.stringify({ t: Date.now(), data: baru })); } catch (e) {}
  if (!beda) return;
  const belumMengisi = typeof S !== 'undefined' && !Object.keys(S.answers || {}).length && !Object.keys(S.files || {}).length && (S.page || 0) === 0;
  let terakhir = 0; try { terakhir = Number(sessionStorage.getItem('spmb_muat_ulang') || 0); } catch (e) {}
  if (belumMengisi && document.getElementById('view-form').classList.contains('hidden') && Date.now() - terakhir > 60000) {
    try { sessionStorage.setItem('spmb_muat_ulang', String(Date.now())); } catch (e) {}
    location.reload();
  }
})();

function jalankanApp() {
  return new Promise((res, rej) => {
    const s = document.createElement('script');
    const inline = document.getElementById('app-src');
    if (inline) { s.textContent = inline.textContent; document.body.appendChild(s); res(); return; }
    s.src = '/assets/app.js'; s.onload = res; s.onerror = () => { document.getElementById('memuatIsi').textContent = 'Halaman gagal dimuat. Muat ulang halaman.'; rej(); };
    document.body.appendChild(s);
  });
}

function pasangMenu() {
  const btn = document.getElementById('menuBtn'), nav = document.getElementById('navUtama'), top = document.getElementById('top');
  btn.addEventListener('click', () => { const buka = !nav.classList.contains('buka'); nav.classList.toggle('buka', buka); btn.setAttribute('aria-expanded', buka); document.body.classList.toggle('menu-terbuka', buka); });
  document.querySelectorAll('.nav-induk').forEach(b => b.addEventListener('click', e => {
    e.stopPropagation();
    const g = b.parentElement, buka = !g.classList.contains('buka');
    document.querySelectorAll('.nav-grup').forEach(x => { x.classList.remove('buka'); x.firstChild.setAttribute('aria-expanded', 'false'); });
    g.classList.toggle('buka', buka); b.setAttribute('aria-expanded', buka);
  }));
  document.addEventListener('click', e => { if (!e.target.closest('.nav-grup')) document.querySelectorAll('.nav-grup').forEach(x => { x.classList.remove('buka'); x.firstChild.setAttribute('aria-expanded', 'false'); }); });
  nav.addEventListener('click', e => { if (e.target.closest('a') || e.target === nav) { nav.classList.remove('buka'); btn.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-terbuka'); } });
  /* Di HP, menu dipindah langsung ke bawah <body> supaya bisa menutupi seluruh layar */
  const hp = window.matchMedia('(max-width:960px)'), wrap = top.querySelector('.wrap');
  const tempatkan = () => {
    if (hp.matches) { if (nav.parentElement !== document.body) document.body.appendChild(nav); }
    else { if (nav.parentElement !== wrap) wrap.appendChild(nav); nav.classList.remove('buka'); btn.setAttribute('aria-expanded', 'false'); document.body.classList.remove('menu-terbuka'); }
  };
  tempatkan();
  if (hp.addEventListener) hp.addEventListener('change', tempatkan); else if (hp.addListener) hp.addListener(tempatkan);
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && nav.classList.contains('buka')) btn.click(); });
  document.addEventListener('click', e => { if (nav.classList.contains('buka') && !nav.contains(e.target) && !btn.contains(e.target)) btn.click(); });
  const cek = () => top.classList.toggle('bergulir', window.scrollY > 8);
  window.addEventListener('scroll', cek, { passive: true }); cek();
}
