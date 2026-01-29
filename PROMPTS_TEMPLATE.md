# Prompting Templates for E-Office Implementation

Copy-paste setiap prompt ke AI agent untuk eksekusi per fase.
Pastikan agent sudah membaca file `IMPLEMENTATION_GUIDE.md` sebelum memulai.

---

## PHASE 1A: Menu Update & Database Setup

````
Saya sedang migrasi project E-Office dari Laravel Livewire ke Laravel 11 + Inertia.js + React + TypeScript + PostgreSQL.

Baca file IMPLEMENTATION_GUIDE.md di project root untuk referensi lengkap.

**Tugas Phase 1A:**

1. Update `resources/js/config/menu.ts`:
   - Tambah submenu "Archive" di Data Master (href: /master/archive)
   - Tambah submenu "Archive" di Persuratan (href: /persuratan/archive)
   - Tambah submenu "Archive" di Penjadwalan (href: /penjadwalan/archive)
   - Tambah submenu "Archive" di Cuti (href: /cuti/archive)

2. Buat trait HasAuditTrail di `app/Traits/HasAuditTrail.php` sesuai guide

3. Buat migration `create_unit_kerja_table.php`:
   - ulid id primary
   - nama (string, required)
   - singkatan (string 50, nullable)
   - created_by, updated_by, deleted_by (foreign ke users, nullable)
   - timestamps + softDeletes

4. Buat migration `create_indeks_surat_table.php`:
   - ulid id primary
   - kode (string 50, unique)
   - nama (string, required)
   - urutan (integer, default 0)
   - created_by, updated_by, deleted_by
   - timestamps + softDeletes

5. Buat model `app/Models/UnitKerja.php` dengan: HasFactory, HasUlids, SoftDeletes, HasAuditTrail

6. Buat model `app/Models/IndeksSurat.php` dengan pattern yang sama

7. Buat seeder `UnitKerjaSeeder` dengan 5 data contoh

8. Buat seeder `IndeksSuratSeeder` dengan 5 data contoh

9. Update `DatabaseSeeder.php` untuk memanggil kedua seeder

10. Jalankan: `php artisan migrate:fresh --seed` dan `npm run build`

**Git commit:**
```bash
git add .
git commit -m "feat(database): add unit_kerja, indeks_surat migrations with models and seeders"
````

```

---

## PHASE 1B: CRUD Unit Kerja

```

Lanjutkan dari Phase 1A. Baca IMPLEMENTATION_GUIDE.md untuk referensi.

**Tugas Phase 1B - CRUD Unit Kerja:**

1. Buat `app/Http/Controllers/Master/UnitKerjaController.php`:
    - index(): list dengan search & pagination
    - store(): create new
    - update(): edit existing
    - destroy(): soft delete
    - archive(): list soft deleted
    - restore(): restore dari archive
    - forceDelete(): permanent delete

2. Buat `app/Http/Requests/Master/UnitKerjaRequest.php`:
    - nama: required, string, max:255
    - singkatan: nullable, string, max:50

3. Tambah routes di `routes/web.php`:

```php
Route::prefix('master')->name('master.')->middleware('auth')->group(function () {
    Route::resource('unit-kerja', UnitKerjaController::class)->except(['create', 'show', 'edit']);
    Route::get('unit-kerja/archive', [UnitKerjaController::class, 'archive'])->name('unit-kerja.archive');
    Route::post('unit-kerja/{id}/restore', [UnitKerjaController::class, 'restore'])->name('unit-kerja.restore');
    Route::delete('unit-kerja/{id}/force-delete', [UnitKerjaController::class, 'forceDelete'])->name('unit-kerja.force-delete');
});
```

4. Buat `resources/js/Pages/Master/UnitKerja/Index.tsx`:
    - Tabel dengan search input
    - Tombol Tambah → buka modal create
    - Tombol Edit per row → buka modal edit
    - Tombol Hapus per row → konfirmasi → soft delete
    - Gunakan komponen dari @/Components/ui dan @/Components/form

5. Buat `resources/js/Pages/Master/UnitKerja/Archive.tsx`:
    - Tabel data yang sudah dihapus
    - Tombol Restore per row
    - Tombol Hapus Permanen per row

6. Jalankan: `npm run build` dan test

**Git commit:**

```bash
git add .
git commit -m "feat(master): complete CRUD unit_kerja with archive functionality"
```

```

---

## PHASE 1C: CRUD Indeks Surat

```

Lanjutkan dari Phase 1B. Pattern sama seperti Unit Kerja.

**Tugas Phase 1C - CRUD Indeks Surat:**

1. Buat `app/Http/Controllers/Master/IndeksSuratController.php` (copy pattern dari UnitKerjaController)

2. Buat `app/Http/Requests/Master/IndeksSuratRequest.php`:
    - kode: required, string, max:50, unique (kecuali saat update)
    - nama: required, string, max:255
    - urutan: nullable, integer, min:0

3. Tambah routes di `routes/web.php` (pattern sama)

4. Buat `resources/js/Pages/Master/IndeksSurat/Index.tsx`:
    - Tabel dengan kolom: Kode, Nama, Urutan, Aksi
    - Modal CRUD

5. Buat `resources/js/Pages/Master/IndeksSurat/Archive.tsx`

6. Jalankan: `npm run build` dan test

**Git commit:**

```bash
git add .
git commit -m "feat(master): complete CRUD indeks_surat with archive functionality"
```

```

---

## PHASE 2: Wilayah (Read-only)

```

Lanjutkan dari Phase 1. Baca IMPLEMENTATION_GUIDE.md untuk schema wilayah.

**Tugas Phase 2 - Wilayah Tables:**

1. Buat migration `create_wilayah_tables.php` dengan 4 tabel:
    - wilayah_provinsi (kode char(2) primary, nama)
    - wilayah_kabupaten (composite primary key)
    - wilayah_kecamatan (composite primary key)
    - wilayah_desa (composite primary key)

2. Buat 4 models:
    - WilayahProvinsi (hasMany kabupaten)
    - WilayahKabupaten (belongsTo provinsi, hasMany kecamatan)
    - WilayahKecamatan (belongsTo kabupaten, hasMany desa)
    - WilayahDesa (belongsTo kecamatan)

3. Buat seeder `WilayahSeeder` dengan data minimal:
    - 1 provinsi (Jawa Barat)
    - 1 kabupaten (Tasikmalaya)
    - 3-5 kecamatan
    - 5-10 desa

4. Buat controller `WilayahController` dengan method untuk cascading dropdown (API):
    - getKabupaten(provinsiKode)
    - getKecamatan(provinsiKode, kabupatenKode)
    - getDesa(provinsiKode, kabupatenKode, kecamatanKode)

5. Halaman wilayah tidak wajib, fokus ke API untuk digunakan di form lain

6. Jalankan: `php artisan migrate:fresh --seed` dan test

**Git commit:**

```bash
git add .
git commit -m "feat(wilayah): add wilayah tables with cascading API"
```

```

---

## PHASE 3A: Surat Masuk

```

Lanjutkan dari Phase 2. Baca IMPLEMENTATION_GUIDE.md untuk schema surat_masuk.

**Tugas Phase 3A - Surat Masuk:**

1. Buat migration `create_surat_masuk_table.php` sesuai guide (semua field)

2. Buat model `SuratMasuk` dengan:
    - HasUlids, SoftDeletes, HasAuditTrail
    - Fillable semua field
    - Relasi ke User (creator, updater, deleter)

3. Buat `SuratMasukController` dengan CRUD + Archive

4. Buat `SuratMasukRequest` dengan validasi semua field

5. Tambah routes dengan pattern resource + archive

6. Buat `resources/js/Pages/Persuratan/SuratMasuk/Index.tsx`:
    - Tabel dengan kolom utama: Kode, Nomor Surat, Perihal, Asal Surat, Tanggal, Aksi
    - Modal detail untuk lihat semua field
    - Modal form untuk create/edit (banyak field, gunakan grid layout)
    - Upload file untuk lampiran

7. Buat `resources/js/Pages/Persuratan/SuratMasuk/Archive.tsx`

8. Jalankan: `npm run build` dan test

**Git commit:**

```bash
git add .
git commit -m "feat(persuratan): complete CRUD surat_masuk with file upload"
```

```

---

## PHASE 3B: Surat Keluar

```

Lanjutkan dari Phase 3A. Pattern sama, schema berbeda.

**Tugas Phase 3B - Surat Keluar:**

1. Buat migration `create_surat_keluar_table.php` sesuai guide

2. Buat model `SuratKeluar` dengan pattern sama

3. Buat `SuratKeluarController` dengan CRUD + Archive

4. Buat `SuratKeluarRequest`

5. Tambah routes

6. Buat pages: Index.tsx, Archive.tsx

7. Jalankan: `npm run build` dan test

**Git commit:**

```bash
git add .
git commit -m "feat(persuratan): complete CRUD surat_keluar with file upload"
```

```

---

## PHASE 4: Penjadwalan

```

Lanjutkan dari Phase 3. Baca IMPLEMENTATION_GUIDE.md untuk schema penjadwalan.

**Tugas Phase 4 - Penjadwalan:**

1. Buat migration `create_penjadwalan_table.php` sesuai guide (relasi ke surat_masuk)

2. Buat model `Penjadwalan` dengan:
    - Relasi belongsTo SuratMasuk
    - HasUlids, SoftDeletes, HasAuditTrail

3. Buat `PenjadwalanController` dengan:
    - index(): semua jadwal
    - tentatif(): filter status = tentatif
    - definitif(): filter status = definitif
    - CRUD methods
    - archive, restore, forceDelete

4. Buat `PenjadwalanRequest`

5. Tambah routes untuk jadwal, tentatif, definitif, archive

6. Buat pages:
    - `Penjadwalan/Jadwal/Index.tsx` (semua jadwal)
    - `Penjadwalan/Tentatif/Index.tsx` (filter tentatif)
    - `Penjadwalan/Definitif/Index.tsx` (filter definitif)
    - `Penjadwalan/Archive.tsx`

7. Form dengan:
    - Select surat masuk (dropdown dengan search)
    - Date picker untuk tanggal_agenda
    - Time picker untuk waktu_mulai, waktu_selesai
    - Select status (tentatif/definitif)
    - Cascading dropdown wilayah

8. Jalankan: `npm run build` dan test

**Git commit:**

```bash
git add .
git commit -m "feat(penjadwalan): complete CRUD with tentatif/definitif filtering"
```

```

---

## PHASE 5: Cuti

```

Lanjutkan dari Phase 4. Baca IMPLEMENTATION_GUIDE.md untuk schema cuti.

**Tugas Phase 5 - Cuti:**

1. Buat migration `create_cuti_table.php` sesuai guide

2. Buat model `Cuti` dengan:
    - Relasi belongsTo User (user_id, atasan_id)
    - HasUlids, SoftDeletes

3. Buat `CutiController` dengan:
    - index(): list dengan filter status
    - store(): create dengan status = pending
    - approve(id): ubah status ke approved
    - reject(id): ubah status ke rejected
    - CRUD + Archive

4. Buat `CutiRequest`

5. Tambah routes

6. Buat pages:
    - `Cuti/Index.tsx` dengan tabs/filter: Semua, Pending, Approved, Rejected
    - `Cuti/Archive.tsx`
    - Form dengan date range picker (tanggal_mulai - tanggal_selesai)

7. Auto-fill snapshot pegawai dari user yang login

8. Jalankan: `npm run build` dan test

**Git commit:**

```bash
git add .
git commit -m "feat(cuti): complete CRUD with approval workflow"
```

```

---

## PHASE 6: Pengguna

```

Lanjutkan dari Phase 5.

**Tugas Phase 6 - Pengguna (Admin):**

1. Buat `PenggunaController` untuk manage users:
    - index(): list users
    - store(): create dengan password hashing
    - update(): update, password optional
    - destroy(): soft delete
    - archive, restore, forceDelete

2. Buat `PenggunaRequest` dengan:
    - name: required
    - username: required, unique
    - email: required, email, unique
    - password: required (create), nullable (update)
    - role: required, in:superadmin,tu,sekpri_bupati,sekpri_wakil_bupati

3. Tambah routes

4. Buat pages: Index.tsx, Archive.tsx

5. Password field hanya required saat create, optional saat edit

6. Jalankan: `npm run build` dan test

**Git commit:**

```bash
git add .
git commit -m "feat(master): complete CRUD pengguna with role management"
```

```

---

## PHASE 7: Finalisasi

```

Finalisasi project setelah semua CRUD selesai.

**Tugas Phase 7:**

1. Review semua routes dan pastikan konsisten

2. Tambah role-based menu filtering di Sidebar (filter menu berdasarkan user role)

3. Test semua CRUD operations

4. Test semua Archive/Restore functions

5. Test session timeout (5 menit)

6. Bersihkan console.log dan commented code

7. Update IMPLEMENTATION_GUIDE.md dengan status completed

8. Jalankan final test: `php artisan migrate:fresh --seed && npm run build`

**Git commit:**

```bash
git add .
git commit -m "chore: finalize project, cleanup, and documentation update"
```

````

---

## Quick Reference Commands

```bash
# Migration
php artisan make:migration create_table_name_table
php artisan migrate
php artisan migrate:fresh --seed

# Model
php artisan make:model ModelName -f

# Controller
php artisan make:controller Folder/ControllerName

# Request
php artisan make:request Folder/RequestName

# Seeder
php artisan make:seeder SeederName
php artisan db:seed --class=SeederName

# Build
npm run build
npm run dev

# Git
git add .
git status
git commit -m "type(scope): description"
git push origin develop
````

---

_Template ini dibuat untuk eksekusi bertahap dengan AI agent lain._
