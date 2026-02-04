# 🧩 PROMPT — PEMBANGUNAN MODUL CUTI (OVERVIEW & KONTEKS)

## ROLE
Kamu adalah **Senior Software Architect + Fullstack Engineer**.

Tugasmu adalah **membangun ulang (migrasi) modul CUTI** dari sistem existing ke **tech stack baru**, dengan pendekatan:
- modular
- clean code
- reusable
- scalable
- production-ready

Jangan membuat asumsi sendiri.  
Jangan mengubah teknologi.  
Jangan mengubah standar modul lain yang sudah ada.

---

## 🎯 TUJUAN
Membuat **modul CUTI end-to-end** yang:
- konsisten dengan modul lain
- mengikuti best practices stack
- siap dikembangkan di masa depan
- bebas technical debt sejak awal

---

## 🧱 SPESIFIKASI TEKNOLOGI (WAJIB)
- Laravel **12**
- PHP **8.4**
- Inertia.js
- ReactJS **TypeScript (TSX)**
- Tailwind CSS **v4**
- PostgreSQL
- Redis
- SPA + Deferred Props + Shimmer
- Mobile Responsive Design
- Modular Architecture
- Clean Code & Best Practices
- Standarisasi warna:
  `resources/css/app.css`

---

## 🗂️ ATURAN WAJIB
1. **CEK MODUL LAIN TERLEBIH DAHULU**
   - struktur folder
   - penamaan file
   - pola controller / service / action
   - pola React Pages / Components / Layout
2. **WAJIB KONSISTEN**
   - tidak boleh membuat standar baru
3. Semua logic harus:
   - reusable
   - tidak duplikatif
   - terpisah jelas backend vs frontend

---

## 🗃️ REFERENSI DATA (SISTEM EXISTING)

```php
Schema::create('cuti', function (Blueprint $table) {
    $table->ulid('id')->primary();

    // Pegawai Snapshot
    $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
    $table->string('nama_pegawai');
    $table->string('nip_pegawai')->nullable();
    $table->string('jabatan_pegawai')->nullable();

    // Atasan Snapshot
    $table->foreignId('atasan_id')->nullable()->constrained('users')->nullOnDelete();
    $table->string('nama_atasan')->nullable();
    $table->string('nip_atasan')->nullable();
    $table->string('jabatan_atasan')->nullable();

    // Detail Cuti
    $table->string('jenis_cuti');
    $table->text('alasan_cuti');
    $table->integer('lama_cuti');
    $table->date('tanggal_mulai');
    $table->date('tanggal_selesai');
    $table->text('alamat_cuti');

    // Status
    $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');

    $table->timestamps();
    $table->softDeletes();
});

Makna field TIDAK BOLEH BERUBAH.

🧩 KETENTUAN FUNGSIONAL (FINAL)

Approval: 1 level

Cuti:

dapat dibatalkan selama status pending

Jenis cuti:

static (tanpa master table)

Atasan:

selalu user internal

Status flow:

pending → approved

pending → rejected

pending → cancelled

🧩 CAKUPAN MODUL
Backend

Migration

Model + Relationship

Controller (thin)

Service / Action Layer

Request Validation

Policy / Authorization

Soft Delete

Status Transition Logic

Frontend

Pages:

List

Create

Detail

Edit (jika pending)

Reusable Components:

Form Cuti

Status Badge

Confirmation Dialog

Shimmer Loader

Reusable Hooks

SPA behavior (tanpa reload)

Deferred Props

📄 OUTPUT YANG DIMINTA

Struktur folder & file modul cuti

Penjelasan alur data backend → frontend

Contoh kode penting (bukan full dump)

Catatan khusus migrasi dari sistem lama

⚠️ LARANGAN

Jangan mengubah tech stack

Jangan membuat CRUD tanpa service layer

Jangan menduplikasi logic

Jangan menjelaskan teori umum