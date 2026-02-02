# PROMPT: TECHNICAL SPECIFICATIONS - MODUL CUTI E-OFFICE

> **INSTRUKSI UNTUK AI EXECUTOR:**
> Anda adalah AI Developer Expert yang akan membangun Modul Cuti (Leave Management) untuk aplikasi E-Office.
> Baca dan pahami seluruh spesifikasi teknis di bawah ini sebelum mulai coding.

---

## 🎯 PROJECT CONTEXT

### Tech Stack yang Digunakan

```
Backend:  Laravel 12
PHP Version : 8.4
Frontend: Inertia.js + ReactJS
Database: PostgreSQL
Cache:    Redis
CSS:      Tailwind CSS v4
Pattern:  Single Page Application (SPA)
Design:   Mobile Responsive
Approach: Reusable Components
```

### Source Project

- **Modul yang sudah jadi:** Modul Persuratan, Modul Jadwal (gunakan sebagai referensi)
- **Working Directory:** `/home/claude` (untuk development)
- **Project Root:** Cek struktur existing di project

### Requirement Utama

1. **Follow existing project structure** - Sesuaikan dengan pola yang sudah ada
2. **Reusable components** - Buat komponen yang bisa dipakai ulang
3. **Best practices** - Ikuti Laravel 12 + React + Inertia best practices
4. **Mobile responsive** - Semua UI harus responsive
5. **Clean code** - Code harus bersih, readable, dan well-documented

---

## 📐 ARSITEKTUR SISTEM

### Database Schema

**Tabel Utama: `cuti`**

```sql
CREATE TABLE cuti (
    -- Primary Key
    id CHAR(26) PRIMARY KEY, -- ULID
    
    -- Informasi Pegawai
    tanggal_pengajuan DATE NOT NULL,
    pegawai_id BIGINT NOT NULL REFERENCES pegawai(id) ON DELETE CASCADE,
    atasan_langsung_id BIGINT NOT NULL REFERENCES pegawai(id) ON DELETE RESTRICT,
    jenis_cuti_id BIGINT NOT NULL REFERENCES jenis_cuti(id) ON DELETE RESTRICT,
    alasan_cuti TEXT NOT NULL,
    
    -- Durasi & Lokasi
    lama_cuti INTEGER NOT NULL, -- dalam hari kerja
    mulai_tanggal DATE NOT NULL,
    sampai_tanggal DATE NOT NULL,
    alamat_selama_cuti TEXT NOT NULL,
    
    -- Status & Approval
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    tanggal_approval TIMESTAMP NULL,
    catatan_approval TEXT NULL, -- catatan dari atasan saat approve/reject
    
    -- Audit Trail
    created_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    updated_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    deleted_by BIGINT NULL REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL
);

-- Indexes untuk Performance
CREATE INDEX idx_cuti_pegawai ON cuti(pegawai_id);
CREATE INDEX idx_cuti_atasan ON cuti(atasan_langsung_id);
CREATE INDEX idx_cuti_status ON cuti(status);
CREATE INDEX idx_cuti_tanggal ON cuti(mulai_tanggal, sampai_tanggal);
CREATE INDEX idx_cuti_deleted ON cuti(deleted_at);
CREATE INDEX idx_cuti_jenis ON cuti(jenis_cuti_id);
```

**Tabel Master: `jenis_cuti`**

```sql
CREATE TABLE jenis_cuti (
    id BIGSERIAL PRIMARY KEY,
    nama VARCHAR(100) NOT NULL,
    kode VARCHAR(20) NOT NULL UNIQUE,
    deskripsi TEXT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NULL,
    updated_at TIMESTAMP NULL
);

-- Data Master Jenis Cuti (Seeder)
INSERT INTO jenis_cuti (nama, kode, deskripsi) VALUES
('Cuti Tahunan', 'TAHUNAN', 'Cuti regular tahunan'),
('Cuti Sakit', 'SAKIT', 'Cuti karena sakit dengan surat dokter'),
('Cuti Melahirkan', 'MELAHIRKAN', 'Cuti khusus untuk pegawai wanita yang melahirkan'),
('Cuti Besar', 'BESAR', 'Cuti besar setelah masa kerja tertentu'),
('Cuti Menikah', 'MENIKAH', 'Cuti khusus untuk menikah'),
('Cuti Penting', 'PENTING', 'Cuti untuk kepentingan mendesak');
```

**Catatan Database:**

- Primary key menggunakan ULID (sama seperti modul lain)
- Soft delete untuk history
- Audit trail lengkap (created_by, updated_by, deleted_by)
- Foreign key ke tabel `pegawai` (pastikan tabel ini sudah ada)
- Foreign key ke tabel `users` untuk audit trail

### Relasi Database

- `cuti.pegawai_id` → `pegawai.id` (Pegawai yang mengajukan)
- `cuti.atasan_langsung_id` → `pegawai.id` (Atasan yang menyetujui)
- `cuti.jenis_cuti_id` → `jenis_cuti.id`
- `cuti.created_by/updated_by/deleted_by` → `users.id`

---

## 🔄 BUSINESS LOGIC FLOW

### Status Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    PEGAWAI MENGAJUKAN CUTI                  │
│  • Isi form pengajuan cuti                                  │
│  • Input: Pegawai, Atasan, Jenis Cuti, Alasan              │
│  • Input: Tanggal Mulai, Tanggal Sampai, Alamat            │
│  • Sistem auto-calculate lama cuti (hari kerja)            │
│  • Status: PENDING                                          │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       │ Pengajuan terkirim
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              ATASAN MENERIMA NOTIFIKASI                     │
│  • Lihat detail pengajuan cuti                              │
│  • Review: Pegawai, Jenis, Durasi, Alasan                  │
│  • Pilihan: APPROVE atau REJECT (dengan catatan)           │
└──────────────────────┬──────────────────────────────────────┘
                       │
            ┌──────────┴──────────┐
            │                     │
            ▼                     ▼
┌─────────────────────┐  ┌──────────────────────┐
│   APPROVED          │  │     REJECTED         │
│  • Status: Approved │  │  • Status: Rejected  │
│  • Set tanggal_     │  │  • Set tanggal_      │
│    approval         │  │    approval          │
│  • Catatan atasan   │  │  • Catatan atasan    │
│    tersimpan        │  │    (wajib)           │
│  • Tidak bisa       │  │  • Bisa diajukan     │
│    diedit lagi      │  │    ulang             │
└─────────────────────┘  └──────────────────────┘
            │                     │
            └──────────┬──────────┘
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                    RIWAYAT CUTI                             │
│  • Semua pengajuan cuti tersimpan                           │
│  • Bisa dilihat oleh pegawai & atasan                       │
│  • Filter by status, jenis cuti, tahun, pegawai            │
└─────────────────────────────────────────────────────────────┘
```

### Key Business Rules

**1. Validasi Tanggal:**

- `tanggal_pengajuan` = hari ini (default, bisa custom untuk admin)
- `mulai_tanggal` >= `tanggal_pengajuan`
- `sampai_tanggal` > `mulai_tanggal`
- Tidak boleh overlap dengan cuti yang sudah approved untuk pegawai yang sama

**2. Kalkulasi Lama Cuti (Auto-Calculate):**

- Hitung hanya **hari kerja** antara `mulai_tanggal` dan `sampai_tanggal`
- **Exclude:** Sabtu, Minggu, dan libur nasional
- Auto-calculate di backend saat form submit
- Tampilkan preview di frontend (real-time via API)
- Field `lama_cuti` adalah readonly (auto-calculated)

**3. Approval Workflow:**

- Hanya `atasan_langsung_id` yang bisa approve/reject
- Pegawai bisa cancel/edit pengajuan **hanya jika status = 'pending'**
- Setelah approved/rejected → **tidak bisa diedit/dihapus**
- Atasan **wajib** kasih catatan saat reject
- Atasan **opsional** kasih catatan saat approve

**4. Overlap Detection:**

- Cek overlap dengan cuti approved untuk pegawai yang sama
- Tidak boleh ada 2 cuti approved dengan tanggal yang overlap
- Formula:

  ```
  (mulai_A <= sampai_B) AND (sampai_A >= mulai_B) = OVERLAP
  ```

**5. Permissions:**

- **Pegawai Biasa:**
  - Create: Cuti untuk diri sendiri
  - Read: Cuti sendiri
  - Update: Cuti sendiri (hanya jika pending)
  - Delete: Cuti sendiri (hanya jika pending)
  
- **Atasan:**
  - Read: Cuti bawahannya + cuti sendiri
  - Approve/Reject: Cuti bawahannya (yang status pending)
  
- **Admin/HRD:**
  - Full access: Create (untuk siapa saja), Read all, Update, Delete, Approve/Reject

---

## 🎨 UI/UX SPECIFICATIONS

### Design System

**Color Palette (Tailwind CSS v4):**

```javascript
// Status Badge Colors
pending:  'bg-yellow-100 text-yellow-800 border-yellow-200'
approved: 'bg-green-100 text-green-800 border-green-200'
rejected: 'bg-red-100 text-red-800 border-red-200'

// Actions
primary:   'bg-blue-600 hover:bg-blue-700 text-white'
secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700'
success:   'bg-green-600 hover:bg-green-700 text-white'
danger:    'bg-red-600 hover:bg-red-700 text-white'
```

**Responsive Breakpoints:**

```javascript
mobile:  < 768px  → Card view, single column forms
tablet:  768-1024px → Responsive table, 2-column forms
desktop: > 1024px   → Full table, multi-column layout
```

---

## 📦 REQUIRED COMPONENTS

### Backend Components

```php
// Models
app/Models/Cuti.php
app/Models/JenisCuti.php

// Controllers
app/Http/Controllers/CutiController.php

// Requests
app/Http/Requests/StoreCutiRequest.php
app/Http/Requests/UpdateCutiRequest.php
app/Http/Requests/ApproveCutiRequest.php

// Resources
app/Http/Resources/CutiResource.php

// Services
app/Services/CutiService.php
```

### Frontend Components

```javascript
// Pages
resources/js/Pages/Cuti/Index.jsx
resources/js/Pages/Cuti/Create.jsx
resources/js/Pages/Cuti/Edit.jsx
resources/js/Pages/Cuti/Show.jsx

// Components
resources/js/Components/Cuti/TableCuti.jsx
resources/js/Components/Cuti/FormCuti.jsx
resources/js/Components/Cuti/ModalApproval.jsx
resources/js/Components/Cuti/CutiDetailCard.jsx
resources/js/Components/Cuti/StatusBadge.jsx
```

---

## 🔧 TECHNICAL REQUIREMENTS

### Backend (Laravel 12)

**1. Model Cuti.php:**

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Cuti extends Model
{
    use SoftDeletes;
    
    protected $table = 'cuti';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';
    
    protected $fillable = [
        'tanggal_pengajuan',
        'pegawai_id',
        'atasan_langsung_id',
        'jenis_cuti_id',
        'alasan_cuti',
        'lama_cuti',
        'mulai_tanggal',
        'sampai_tanggal',
        'alamat_selama_cuti',
        'status',
        'tanggal_approval',
        'catatan_approval',
        'created_by',
        'updated_by',
        'deleted_by',
    ];
    
    protected $casts = [
        'tanggal_pengajuan' => 'date',
        'mulai_tanggal' => 'date',
        'sampai_tanggal' => 'date',
        'tanggal_approval' => 'datetime',
    ];
    
    // Boot for ULID & Audit Trail
    protected static function boot()
    {
        parent::boot();
        
        static::creating(function ($model) {
            if (empty($model->id)) {
                $model->id = (string) Str::ulid();
            }
            if (auth()->check()) {
                $model->created_by = auth()->id();
            }
        });
        
        static::updating(function ($model) {
            if (auth()->check()) {
                $model->updated_by = auth()->id();
            }
        });
        
        static::deleting(function ($model) {
            if (auth()->check() && !$model->isForceDeleting()) {
                $model->deleted_by = auth()->id();
                $model->save();
            }
        });
    }
    
    // Relationships
    public function pegawai()
    {
        return $this->belongsTo(Pegawai::class, 'pegawai_id');
    }
    
    public function atasanLangsung()
    {
        return $this->belongsTo(Pegawai::class, 'atasan_langsung_id');
    }
    
    public function jenisCuti()
    {
        return $this->belongsTo(JenisCuti::class, 'jenis_cuti_id');
    }
    
    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
    
    // Scopes
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
    
    public function scopeApproved($query)
    {
        return $query->where('status', 'approved');
    }
    
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }
    
    public function scopeByPegawai($query, $pegawaiId)
    {
        return $query->where('pegawai_id', $pegawaiId);
    }
    
    public function scopeByAtasan($query, $atasanId)
    {
        return $query->where('atasan_langsung_id', $atasanId);
    }
    
    public function scopeThisYear($query, $tahun = null)
    {
        $tahun = $tahun ?? now()->year;
        return $query->whereYear('tanggal_pengajuan', $tahun);
    }
    
    // Accessors
    public function getPeriodeCutiAttribute()
    {
        return $this->mulai_tanggal->format('d M') . ' - ' . 
               $this->sampai_tanggal->format('d M Y');
    }
    
    public function getStatusBadgeAttribute()
    {
        return match($this->status) {
            'pending' => ['color' => 'warning', 'text' => 'Menunggu'],
            'approved' => ['color' => 'success', 'text' => 'Disetujui'],
            'rejected' => ['color' => 'danger', 'text' => 'Ditolak'],
            default => ['color' => 'default', 'text' => $this->status],
        };
    }
    
    // Helper Methods
    public function canEdit()
    {
        return $this->status === 'pending' && 
               (auth()->id() === $this->created_by || auth()->user()->hasRole('admin|hrd'));
    }
    
    public function canDelete()
    {
        return $this->status === 'pending' && 
               (auth()->id() === $this->created_by || auth()->user()->hasRole('admin|hrd'));
    }
    
    public function canApprove()
    {
        $user = auth()->user();
        return $this->status === 'pending' && 
               ($user->pegawai_id === $this->atasan_langsung_id || $user->hasRole('admin|hrd'));
    }
}
```

**2. Service: CutiService.php**

```php
<?php

namespace App\Services;

use App\Models\Cuti;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;

class CutiService
{
    /**
     * Calculate working days between two dates (exclude weekends and holidays)
     * 
     * @param string|Carbon $startDate
     * @param string|Carbon $endDate
     * @return int
     */
    public function calculateWorkingDays($startDate, $endDate)
    {
        $start = Carbon::parse($startDate);
        $end = Carbon::parse($endDate);
        
        $workingDays = 0;
        $holidays = $this->getHolidays($start->year);
        
        while ($start <= $end) {
            // Skip Saturday (6) and Sunday (0)
            if (!in_array($start->dayOfWeek, [0, 6])) {
                // Skip holidays
                if (!in_array($start->format('Y-m-d'), $holidays)) {
                    $workingDays++;
                }
            }
            $start->addDay();
        }
        
        return $workingDays;
    }
    
    /**
     * Get list of holidays (libur nasional) for a specific year
     * Cache for 24 hours
     * 
     * @param int $year
     * @return array
     */
    private function getHolidays($year)
    {
        return Cache::remember("holidays_{$year}", 86400, function () use ($year) {
            // TODO: Ambil dari table libur_nasional atau API
            // Untuk sementara, hardcode libur nasional 2026
            if ($year == 2026) {
                return [
                    '2026-01-01', // Tahun Baru
                    '2026-02-12', // Imlek
                    '2026-03-22', // Nyepi
                    '2026-03-31', // Idul Fitri
                    '2026-04-01', // Idul Fitri
                    '2026-04-10', // Wafat Isa Al-Masih
                    '2026-05-01', // Hari Buruh
                    '2026-05-21', // Kenaikan Isa Al-Masih
                    '2026-06-01', // Pancasila
                    '2026-06-07', // Idul Adha
                    '2026-06-27', // Tahun Baru Islam
                    '2026-08-17', // Kemerdekaan RI
                    '2026-09-05', // Maulid Nabi
                    '2026-12-25', // Natal
                ];
            }
            return [];
        });
    }
    
    /**
     * Check if there's overlap with approved leave
     * 
     * @param int $pegawaiId
     * @param string|Carbon $mulaiTanggal
     * @param string|Carbon $sampaiTanggal
     * @param string|null $excludeCutiId
     * @return bool
     */
    public function hasOverlapCuti($pegawaiId, $mulaiTanggal, $sampaiTanggal, $excludeCutiId = null)
    {
        $query = Cuti::byPegawai($pegawaiId)
            ->approved()
            ->where(function ($q) use ($mulaiTanggal, $sampaiTanggal) {
                // Check overlap: (StartA <= EndB) AND (EndA >= StartB)
                $q->where(function ($q2) use ($mulaiTanggal, $sampaiTanggal) {
                    $q2->where('mulai_tanggal', '<=', $sampaiTanggal)
                       ->where('sampai_tanggal', '>=', $mulaiTanggal);
                });
            });
        
        if ($excludeCutiId) {
            $query->where('id', '!=', $excludeCutiId);
        }
        
        return $query->exists();
    }
    
    /**
     * Approve cuti
     * 
     * @param string $cutiId
     * @param string|null $catatan
     * @return Cuti
     */
    public function approveCuti($cutiId, $catatan = null)
    {
        $cuti = Cuti::findOrFail($cutiId);
        
        if ($cuti->status !== 'pending') {
            throw new \Exception('Hanya cuti dengan status pending yang bisa disetujui');
        }
        
        $cuti->update([
            'status' => 'approved',
            'tanggal_approval' => now(),
            'catatan_approval' => $catatan,
        ]);
        
        // TODO: Send notification to pegawai
        
        return $cuti->fresh();
    }
    
    /**
     * Reject cuti
     * 
     * @param string $cutiId
     * @param string $catatan (required)
     * @return Cuti
     */
    public function rejectCuti($cutiId, $catatan)
    {
        if (empty($catatan)) {
            throw new \Exception('Catatan wajib diisi saat menolak cuti');
        }
        
        $cuti = Cuti::findOrFail($cutiId);
        
        if ($cuti->status !== 'pending') {
            throw new \Exception('Hanya cuti dengan status pending yang bisa ditolak');
        }
        
        $cuti->update([
            'status' => 'rejected',
            'tanggal_approval' => now(),
            'catatan_approval' => $catatan,
        ]);
        
        // TODO: Send notification to pegawai
        
        return $cuti->fresh();
    }
}
```

**3. Validation Rules:**

```php
// StoreCutiRequest.php
public function rules()
{
    return [
        'tanggal_pengajuan' => 'required|date',
        'pegawai_id' => 'required|exists:pegawai,id',
        'atasan_langsung_id' => 'required|exists:pegawai,id|different:pegawai_id',
        'jenis_cuti_id' => 'required|exists:jenis_cuti,id',
        'alasan_cuti' => 'required|string|max:500',
        'mulai_tanggal' => 'required|date|after_or_equal:tanggal_pengajuan',
        'sampai_tanggal' => 'required|date|after:mulai_tanggal',
        'alamat_selama_cuti' => 'required|string|max:300',
    ];
}

public function withValidator($validator)
{
    $validator->after(function ($validator) {
        $cutiService = app(CutiService::class);
        
        // Calculate lama_cuti
        $this->merge([
            'lama_cuti' => $cutiService->calculateWorkingDays(
                $this->mulai_tanggal,
                $this->sampai_tanggal
            )
        ]);
        
        // Check overlap
        if ($cutiService->hasOverlapCuti(
            $this->pegawai_id,
            $this->mulai_tanggal,
            $this->sampai_tanggal
        )) {
            $validator->errors()->add(
                'mulai_tanggal',
                'Tanggal cuti overlap dengan cuti yang sudah disetujui'
            );
        }
    });
}
```

---

## 📱 FRONTEND SPECIFICATIONS

### Page: Index (Daftar Cuti)

**Features:**

- Tabs: Semua | Pending | Approved | Rejected
- Search: Pegawai name
- Filter: Jenis Cuti, Tahun
- Table dengan columns:
  - Pegawai
  - Jenis Cuti
  - Periode (01-15 Feb 2026)
  - Lama (10 hari)
  - Status (badge)
  - Aksi (Detail, Edit, Hapus, Approve/Reject)
- Pagination
- Button "Ajukan Cuti" (top-right)

**Permission-based Display:**

- Pegawai: Hanya lihat cuti sendiri
- Atasan: Lihat cuti bawahan + cuti sendiri
- Admin/HRD: Lihat semua cuti

### Page: Create/Edit (Form Cuti)

**Layout: 2 Sections**

**Section 1: Informasi Pegawai**

- Tanggal Pengajuan (date, default: today)
- Pegawai (select dropdown)
  - Pegawai biasa: auto-select, readonly
  - Admin: bisa pilih pegawai lain
- Atasan Langsung (select dropdown)
- Jenis Cuti (select dropdown dari master)
- Alasan Cuti (textarea, max 500 chars)

**Section 2: Durasi & Lokasi**

- Mulai Tanggal (date picker, min: tanggal_pengajuan)
- Sampai Tanggal (date picker, min: mulai_tanggal)
- **Lama Cuti** (readonly, auto-calculated)
  - Display: "10 hari kerja"
  - Update real-time saat tanggal berubah
  - API call: `/api/cuti/calculate-working-days`
- Alamat Selama Cuti (textarea, max 300 chars)

**Action Buttons:**

- Batal (back to index)
- Ajukan Cuti / Update Cuti

**Validations:**

- Real-time validation
- Show error messages
- Disable submit saat ada error

### Page: Show (Detail Cuti)

**Layout: Card-based**

**Informasi Pegawai:**

- Nama Pegawai
- NIP
- Jabatan
- Unit Kerja

**Detail Cuti:**

- Tanggal Pengajuan
- Jenis Cuti
- Alasan
- Periode (01-15 Feb 2026)
- Lama (10 hari kerja)
- Alamat Selama Cuti

**Status & Approval:**

- Status (badge besar)
- Tanggal Approval (jika sudah approved/rejected)
- Catatan Atasan (jika ada)

**Action Buttons (conditional):**

**Jika Pegawai & Status Pending:**

- [Edit] [Hapus]

**Jika Atasan & Status Pending:**

- [Setujui] [Tolak]
  - Klik → Modal approval muncul
  - Modal berisi:
    - Textarea catatan (required untuk reject, optional untuk approve)
    - Button: [Batal] [Tolak] [Setujui]

**Jika Approved/Rejected:**

- [Tutup] (read-only)

---

## 🧪 TESTING CHECKLIST

### Functional Testing

- [ ] Create cuti baru
- [ ] Auto-calculate working days berfungsi (exclude weekend & libur)
- [ ] Validasi tanggal berfungsi
- [ ] Validasi overlap cuti berfungsi
- [ ] Edit cuti (hanya pending) berfungsi
- [ ] Delete cuti (hanya pending) berfungsi
- [ ] Approve cuti (hanya atasan) berfungsi
- [ ] Reject cuti (hanya atasan, catatan wajib) berfungsi
- [ ] Status tidak bisa berubah setelah approved/rejected
- [ ] Permission-based access berfungsi
- [ ] Search berfungsi
- [ ] Filter (jenis cuti, tahun, status) berfungsi
- [ ] Pagination berfungsi

### UI/UX Testing

- [ ] Responsive di mobile (< 768px)
- [ ] Responsive di tablet (768-1024px)
- [ ] Responsive di desktop (> 1024px)
- [ ] Loading states tampil
- [ ] Error messages jelas
- [ ] Success notifications muncul
- [ ] Status badge dengan color yang benar
- [ ] Form validation real-time

---

## 📝 API ENDPOINTS

### Web Routes

```php
GET    /cuti               // Index (daftar cuti)
GET    /cuti/create        // Form create
POST   /cuti               // Store cuti
GET    /cuti/{id}          // Show detail
GET    /cuti/{id}/edit     // Form edit
PUT    /cuti/{id}          // Update cuti
DELETE /cuti/{id}          // Delete cuti (soft)
POST   /cuti/{id}/approve  // Approve cuti
POST   /cuti/{id}/reject   // Reject cuti
```

### API Routes (for AJAX)

```php
POST /api/cuti/calculate-working-days
  Request: { start_date, end_date }
  Response: { working_days: 10 }
```

---

## 🚨 IMPORTANT REMINDERS

### CRITICAL POINTS

1. **ULID for Primary Key**

   ```php
   protected static function boot()
   {
       parent::boot();
       static::creating(function ($model) {
           if (empty($model->id)) {
               $model->id = (string) Str::ulid();
           }
       });
   }
   ```

2. **Auto-Calculate Working Days**
   - Backend: `CutiService::calculateWorkingDays()`
   - Frontend: Real-time via API call
   - Exclude: Saturday, Sunday, libur nasional

3. **Overlap Detection**
   - Query: `(StartA <= EndB) AND (EndA >= StartB)`
   - Hanya cek cuti approved
   - Exclude cuti yang sedang diedit (saat update)

4. **Approval Rules**
   - Hanya atasan langsung yang bisa approve/reject
   - Catatan **wajib** untuk reject
   - Catatan **opsional** untuk approve
   - Set `tanggal_approval` = now()

5. **Permission Checks**
   - Pegawai: Cuti sendiri only
   - Atasan: Cuti bawahan + sendiri
   - Admin/HRD: All access

6. **Status Immutability**
   - Setelah approved/rejected → **TIDAK BISA** diedit/dihapus
   - Hanya pending yang bisa diedit/dihapus

---

## ❓ QUESTIONS TO CLARIFY BEFORE STARTING

**IMPORTANT: Jawab pertanyaan ini dulu sebelum mulai coding!**

1. **Tabel Pegawai:**
   - Apakah tabel `pegawai` sudah ada?
   - Struktur tabel pegawai seperti apa?
   - Field apa saja yang ada (nama, nip, jabatan, dll)?

2. **Relasi Pegawai - User:**
   - Apakah ada relasi antara `pegawai` dan `users`?
   - Satu user punya satu pegawai (One-to-One)?
   - Atau bagaimana strukturnya?

3. **Atasan Langsung:**
   - Apakah di tabel `pegawai` ada field `atasan_id`?
   - Atau atasan ditentukan dari struktur organisasi terpisah?

4. **Libur Nasional:**
   - Apakah ada tabel `libur_nasional`?
   - Atau hardcode di service?
   - Atau ambil dari API external?

5. **Role & Permission:**
   - Apakah sudah ada system role (admin, pegawai, atasan)?
   - Menggunakan package apa? (Spatie Permission?)

---

## 📋 SUCCESS CRITERIA

Modul Cuti dianggap **SELESAI** jika:

### Database & Backend

- [x] Migration cuti & jenis_cuti berhasil
- [x] Model dengan relasi lengkap
- [x] ULID auto-generate
- [x] Audit trail berfungsi
- [x] Soft delete berfungsi
- [x] CutiService dengan calculateWorkingDays berfungsi
- [x] Validation (tanggal, overlap) berfungsi
- [x] Approval workflow berfungsi

### Frontend

- [x] CRUD operations berfungsi
- [x] Auto-calculate working days (real-time)
- [x] Form validation
- [x] Status badge dengan color benar
- [x] Tabs & filters berfungsi
- [x] Permission-based display
- [x] Responsive design

### Testing

- [x] Full CRUD tested
- [x] Overlap detection tested
- [x] Approval workflow tested
- [x] Permission-based access tested
- [x] No console errors
- [x] No PHP errors
- [x] Performance < 3 detik

---

**END OF TECHNICAL SPECIFICATIONS**

*File Eksekusi: PROMPT_EXECUTION_PHASES_CUTI.md*
