# PROMPT: EXECUTION PHASES - MODUL CUTI E-OFFICE

> **INSTRUKSI UNTUK AI EXECUTOR:**
> Anda akan membangun Modul Cuti secara bertahap (phase by phase).
> Setiap phase harus diselesaikan dan di-test sebelum lanjut ke phase berikutnya.
> 
> **WAJIB BACA DULU:**
> `PROMPT_TECHNICAL_SPECS_CUTI.md` - Spesifikasi teknis detail
> 
> **WORKING DIRECTORY:**
> - Development: `/home/claude`
> - Final Output: `/mnt/user-data/outputs`

---

## 📋 OVERVIEW PHASES

**Total: 5 Phases dalam 10 Hari Kerja**

```
Phase 0: Persiapan & Klarifikasi (Day 0 - 0.5 hari)
Phase 1: Database & Backend Foundation (Day 1-2)
Phase 2: CRUD Basic - Create & Read (Day 3-4)
Phase 3: Update, Delete & Approval Workflow (Day 5-7)
Phase 4: Frontend Enhancement & Polish (Day 8-9)
Phase 5: Integration & Final Testing (Day 10)
```

**Prinsip Eksekusi:**
- ✅ Selesaikan 1 phase sebelum lanjut ke phase berikutnya
- ✅ Test setiap feature setelah selesai dibuat
- ✅ Commit code setelah setiap phase selesai
- ✅ Dokumentasikan masalah yang ditemukan

---

# 🚀 PHASE 0: PERSIAPAN & KLARIFIKASI

**Estimasi:** 0.5 hari (Day 0)

## Objectives:
- Periksa existing project structure
- Klarifikasi pertanyaan teknis
- Setup development checklist

---

## STEP 0.1: Periksa Existing Project Structure

**ACTION:**
```bash
# 1. Lihat struktur project
view /mnt/user-data/uploads

# 2. Periksa tabel pegawai
view /mnt/user-data/uploads/database/migrations/*pegawai*
view /mnt/user-data/uploads/app/Models/Pegawai.php

# 3. Periksa tabel users
view /mnt/user-data/uploads/app/Models/User.php

# 4. Periksa existing components
view /mnt/user-data/uploads/resources/js/Components
```

**OUTPUT:**
Catat struktur tabel pegawai dan relasi dengan users.

---

## STEP 0.2: Klarifikasi Data Pegawai

**QUESTIONS TO ANSWER:**
1. Apakah tabel `pegawai` sudah ada?
2. Field apa saja yang ada di tabel pegawai? (nama, nip, jabatan, unit_kerja, dll)
3. Apakah ada field `atasan_id` di tabel pegawai?
4. Apakah ada relasi `pegawai` → `users`? (user_id?)
5. Primary key pegawai: ULID atau auto-increment?

**OUTPUT:**
Dokumentasikan di `/home/claude/PHASE_0_FINDINGS.md`

---

## STEP 0.3: Klarifikasi Role & Permission

**QUESTIONS TO ANSWER:**
1. Apakah sudah ada system role (admin, pegawai, atasan, hrd)?
2. Menggunakan package apa? (Spatie Permission?)
3. Bagaimana cara check role: `$user->hasRole('admin')`?
4. Apakah ada middleware role?

**OUTPUT:**
Dokumentasikan cara check role untuk dipakai di controller.

---

## STEP 0.4: Setup Development Checklist

**CREATE FILE:** `/home/claude/CUTI_DEVELOPMENT_CHECKLIST.md`

```markdown
# Development Checklist - Modul Cuti

## Phase 0: Persiapan ✅
- [ ] Periksa project structure
- [ ] Klarifikasi tabel pegawai
- [ ] Klarifikasi role & permission
- [ ] Buat development checklist

## Phase 1: Database & Backend Foundation
- [ ] Create migration cuti
- [ ] Create migration jenis_cuti
- [ ] Create seeder jenis_cuti
- [ ] Create Model Cuti
- [ ] Create Model JenisCuti
- [ ] Create CutiService
- [ ] Test database operations

## Phase 2: CRUD Basic
- [ ] Create CutiController
- [ ] Create Request validation
- [ ] Create Resource transformer
- [ ] Setup routes
- [ ] Create Index page
- [ ] Create Create page
- [ ] Test create & read operations

## Phase 3: Update, Delete & Approval
- [ ] Implement update cuti
- [ ] Implement delete cuti
- [ ] Implement approve cuti
- [ ] Implement reject cuti
- [ ] Create Edit page
- [ ] Create Show page with approval
- [ ] Test update, delete, approval

## Phase 4: Frontend Enhancement
- [ ] Create TableCuti component
- [ ] Create FormCuti component
- [ ] Create ModalApproval component
- [ ] Create StatusBadge component
- [ ] Implement tabs & filters
- [ ] Implement search
- [ ] Test responsive design

## Phase 5: Integration & Testing
- [ ] Add navigation menu
- [ ] Full flow testing
- [ ] Permission testing
- [ ] Responsive testing
- [ ] Bug fixing
- [ ] Documentation
```

---

## ✅ PHASE 0 COMPLETION CHECKLIST

- [ ] Sudah periksa semua existing structure
- [ ] Sudah jawab semua pertanyaan klarifikasi
- [ ] Development checklist sudah dibuat
- [ ] Siap mulai coding

---

# 🏗️ PHASE 1: DATABASE & BACKEND FOUNDATION

**Estimasi:** 2 hari (Day 1-2)

## Objectives:
- Buat migration tabel cuti & jenis_cuti
- Buat Model Cuti & JenisCuti
- Buat CutiService (business logic)
- Test database operations

---

## STEP 1.1: Create Migration Cuti

**ACTION:**
```bash
php artisan make:migration create_cuti_table
```

**FILE:** `database/migrations/xxxx_create_cuti_table.php`

**CODE:**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cuti', function (Blueprint $table) {
            // Primary Key
            $table->ulid('id')->primary();
            
            // Informasi Pegawai
            $table->date('tanggal_pengajuan');
            $table->foreignId('pegawai_id')->constrained('pegawai')->cascadeOnDelete();
            $table->foreignId('atasan_langsung_id')->constrained('pegawai')->restrictOnDelete();
            $table->foreignId('jenis_cuti_id')->constrained('jenis_cuti')->restrictOnDelete();
            $table->text('alasan_cuti');
            
            // Durasi & Lokasi
            $table->integer('lama_cuti'); // hari kerja
            $table->date('mulai_tanggal');
            $table->date('sampai_tanggal');
            $table->text('alamat_selama_cuti');
            
            // Status & Approval
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->timestamp('tanggal_approval')->nullable();
            $table->text('catatan_approval')->nullable();
            
            // Audit Trail
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();
            
            // Timestamps
            $table->timestamps();
            $table->softDeletes();
            
            // Indexes
            $table->index('pegawai_id');
            $table->index('atasan_langsung_id');
            $table->index('status');
            $table->index(['mulai_tanggal', 'sampai_tanggal']);
            $table->index('deleted_at');
            $table->index('jenis_cuti_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cuti');
    }
};
```

**TEST:**
```bash
php artisan migrate
```

**✅ CHECKPOINT:** Migration berhasil dijalankan tanpa error.

---

## STEP 1.2: Create Migration Jenis Cuti

**ACTION:**
```bash
php artisan make:migration create_jenis_cuti_table
```

**FILE:** `database/migrations/xxxx_create_jenis_cuti_table.php`

**CODE:**
```php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('jenis_cuti', function (Blueprint $table) {
            $table->id();
            $table->string('nama', 100);
            $table->string('kode', 20)->unique();
            $table->text('deskripsi')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('jenis_cuti');
    }
};
```

**TEST:**
```bash
php artisan migrate
```

---

## STEP 1.3: Create Seeder Jenis Cuti

**ACTION:**
```bash
php artisan make:seeder JenisCutiSeeder
```

**FILE:** `database/seeders/JenisCutiSeeder.php`

**CODE:**
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class JenisCutiSeeder extends Seeder
{
    public function run(): void
    {
        $jenisCuti = [
            [
                'nama' => 'Cuti Tahunan',
                'kode' => 'TAHUNAN',
                'deskripsi' => 'Cuti regular tahunan',
                'is_active' => true,
            ],
            [
                'nama' => 'Cuti Sakit',
                'kode' => 'SAKIT',
                'deskripsi' => 'Cuti karena sakit dengan surat dokter',
                'is_active' => true,
            ],
            [
                'nama' => 'Cuti Melahirkan',
                'kode' => 'MELAHIRKAN',
                'deskripsi' => 'Cuti khusus untuk pegawai wanita yang melahirkan',
                'is_active' => true,
            ],
            [
                'nama' => 'Cuti Besar',
                'kode' => 'BESAR',
                'deskripsi' => 'Cuti besar setelah masa kerja tertentu',
                'is_active' => true,
            ],
            [
                'nama' => 'Cuti Menikah',
                'kode' => 'MENIKAH',
                'deskripsi' => 'Cuti khusus untuk menikah',
                'is_active' => true,
            ],
            [
                'nama' => 'Cuti Penting',
                'kode' => 'PENTING',
                'deskripsi' => 'Cuti untuk kepentingan mendesak',
                'is_active' => true,
            ],
        ];

        DB::table('jenis_cuti')->insert($jenisCuti);
    }
}
```

**RUN SEEDER:**
```bash
php artisan db:seed --class=JenisCutiSeeder
```

---

## STEP 1.4: Create Model Cuti

**ACTION:**
```bash
php artisan make:model Cuti
```

**FILE:** `app/Models/Cuti.php`

**CODE:** (Copy lengkap dari PROMPT_TECHNICAL_SPECS_CUTI.md - Section Model Cuti.php)

**✅ CHECKPOINT:** Model Cuti created dengan relasi, scopes, dan helper methods.

---

## STEP 1.5: Create Model JenisCuti

**ACTION:**
```bash
php artisan make:model JenisCuti
```

**FILE:** `app/Models/JenisCuti.php`

**CODE:**
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class JenisCuti extends Model
{
    protected $table = 'jenis_cuti';
    
    protected $fillable = [
        'nama',
        'kode',
        'deskripsi',
        'is_active',
    ];
    
    protected $casts = [
        'is_active' => 'boolean',
    ];
    
    // Scope
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
    
    // Relationship
    public function cuti()
    {
        return $this->hasMany(Cuti::class, 'jenis_cuti_id');
    }
}
```

---

## STEP 1.6: Create CutiService

**ACTION:**
```bash
mkdir -p app/Services
```

**CREATE FILE:** `app/Services/CutiService.php`

**CODE:** (Copy lengkap dari PROMPT_TECHNICAL_SPECS_CUTI.md - Section CutiService.php)

**✅ CHECKPOINT:** CutiService created dengan 4 main methods:
- calculateWorkingDays()
- getHolidays()
- hasOverlapCuti()
- approveCuti()
- rejectCuti()

---

## STEP 1.7: Test Database Operations

**ACTION:**
```bash
php artisan tinker
```

**TEST COMMANDS:**
```php
// Test create cuti
$cuti = App\Models\Cuti::create([
    'tanggal_pengajuan' => now(),
    'pegawai_id' => 1, // sesuaikan dengan data pegawai
    'atasan_langsung_id' => 2,
    'jenis_cuti_id' => 1,
    'alasan_cuti' => 'Test cuti',
    'lama_cuti' => 5,
    'mulai_tanggal' => now()->addDays(1),
    'sampai_tanggal' => now()->addDays(5),
    'alamat_selama_cuti' => 'Jakarta',
]);

// Test relationships
$cuti->pegawai;
$cuti->atasanLangsung;
$cuti->jenisCuti;

// Test scopes
App\Models\Cuti::pending()->count();
App\Models\Cuti::approved()->count();

// Test service
$service = new App\Services\CutiService();
$workingDays = $service->calculateWorkingDays('2026-02-01', '2026-02-15');
echo $workingDays; // Should exclude weekends & holidays

// Test overlap detection
$hasOverlap = $service->hasOverlapCuti(1, '2026-02-01', '2026-02-05');
var_dump($hasOverlap);

// Test soft delete
$cuti->delete();
App\Models\Cuti::onlyTrashed()->count();

// Restore
$cuti->restore();
```

**✅ CHECKPOINT:** Semua test passed, CRUD & service berfungsi.

---

## ✅ PHASE 1 COMPLETION CHECKLIST

- [ ] Migration cuti & jenis_cuti berhasil
- [ ] Seeder jenis_cuti berhasil (6 jenis cuti)
- [ ] Model Cuti dengan relasi, scopes, helpers
- [ ] Model JenisCuti created
- [ ] CutiService created & tested
- [ ] ULID auto-generate berfungsi
- [ ] Audit trail berfungsi
- [ ] Soft delete berfungsi
- [ ] calculateWorkingDays tested
- [ ] hasOverlapCuti tested

**OUTPUT PHASE 1:**
Commit code: "Phase 1: Database & Backend Foundation completed"

---

# 📝 PHASE 2: CRUD BASIC - CREATE & READ

**Estimasi:** 2 hari (Day 3-4)

## Objectives:
- Buat CutiController (index, create, store)
- Buat Request validation
- Buat Resource transformer
- Setup routes
- Buat halaman Index (daftar cuti)
- Buat halaman Create (form cuti)
- Test create & read operations

---

## STEP 2.1: Create CutiController

**ACTION:**
```bash
php artisan make:controller CutiController
```

**FILE:** `app/Http/Controllers/CutiController.php`

**IMPLEMENT METHODS:**
1. `index()` - Daftar cuti (dengan tabs & filter)
2. `create()` - Form create
3. `store()` - Save cuti baru

**CODE SKELETON:**
```php
<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreCutiRequest;
use App\Http\Resources\CutiResource;
use App\Models\Cuti;
use App\Models\JenisCuti;
use App\Models\Pegawai;
use App\Services\CutiService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CutiController extends Controller
{
    protected $cutiService;
    
    public function __construct(CutiService $cutiService)
    {
        $this->cutiService = $cutiService;
    }
    
    public function index(Request $request)
    {
        $query = Cuti::with(['pegawai', 'jenisCuti', 'atasanLangsung']);
        
        // Filter by status (tabs)
        if ($request->status) {
            $query->where('status', $request->status);
        }
        
        // Filter by jenis cuti
        if ($request->jenis_cuti_id) {
            $query->where('jenis_cuti_id', $request->jenis_cuti_id);
        }
        
        // Filter by tahun
        if ($request->tahun) {
            $query->thisYear($request->tahun);
        }
        
        // Search pegawai name
        if ($request->search) {
            $query->whereHas('pegawai', function ($q) use ($request) {
                $q->where('nama', 'like', "%{$request->search}%");
            });
        }
        
        // Permission-based filter
        $user = auth()->user();
        if ($user->hasRole('pegawai')) {
            // Pegawai biasa: hanya lihat cuti sendiri
            $query->where('pegawai_id', $user->pegawai_id);
        } elseif ($user->hasRole('atasan')) {
            // Atasan: lihat cuti bawahan + cuti sendiri
            $query->where(function ($q) use ($user) {
                $q->where('atasan_langsung_id', $user->pegawai_id)
                  ->orWhere('pegawai_id', $user->pegawai_id);
            });
        }
        // Admin/HRD: lihat semua (no filter)
        
        $cuti = $query->latest('tanggal_pengajuan')->paginate(10);
        
        return Inertia::render('Cuti/Index', [
            'cuti' => CutiResource::collection($cuti),
            'jenisCuti' => JenisCuti::active()->get(),
            'filters' => $request->only(['status', 'jenis_cuti_id', 'tahun', 'search']),
        ]);
    }
    
    public function create()
    {
        $user = auth()->user();
        
        return Inertia::render('Cuti/Create', [
            'pegawai' => $user->hasRole('admin|hrd') 
                ? Pegawai::all() 
                : Pegawai::where('id', $user->pegawai_id)->get(),
            'jenisCuti' => JenisCuti::active()->get(),
        ]);
    }
    
    public function store(StoreCutiRequest $request)
    {
        $validated = $request->validated();
        
        $cuti = Cuti::create($validated);
        
        // TODO: Send notification to atasan
        
        return redirect()->route('cuti.index')
            ->with('success', 'Pengajuan cuti berhasil diajukan');
    }
}
```

---

## STEP 2.2: Create Request Validation

**ACTION:**
```bash
php artisan make:request StoreCutiRequest
```

**FILE:** `app/Http/Requests/StoreCutiRequest.php`

**CODE:**
```php
<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Services\CutiService;

class StoreCutiRequest extends FormRequest
{
    public function authorize()
    {
        return true;
    }

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
    
    public function messages()
    {
        return [
            'pegawai_id.required' => 'Pegawai harus dipilih',
            'atasan_langsung_id.different' => 'Atasan tidak boleh sama dengan pegawai',
            'mulai_tanggal.after_or_equal' => 'Tanggal mulai tidak boleh kurang dari tanggal pengajuan',
            'sampai_tanggal.after' => 'Tanggal sampai harus lebih besar dari tanggal mulai',
        ];
    }
    
    public function withValidator($validator)
    {
        $validator->after(function ($validator) {
            $cutiService = app(CutiService::class);
            
            // Calculate lama_cuti
            $lamaCuti = $cutiService->calculateWorkingDays(
                $this->mulai_tanggal,
                $this->sampai_tanggal
            );
            
            // Merge lama_cuti into request
            $this->merge(['lama_cuti' => $lamaCuti]);
            
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
}
```

---

## STEP 2.3: Create Resource Transformer

**ACTION:**
```bash
php artisan make:resource CutiResource
```

**FILE:** `app/Http/Resources/CutiResource.php`

**CODE:**
```php
<?php

namespace App\Http\Resources;

use Illuminate\Http\Resources\Json\JsonResource;

class CutiResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'tanggal_pengajuan' => $this->tanggal_pengajuan->format('Y-m-d'),
            'tanggal_pengajuan_formatted' => $this->tanggal_pengajuan->translatedFormat('d F Y'),
            
            'pegawai' => [
                'id' => $this->pegawai->id,
                'nama' => $this->pegawai->nama,
                'nip' => $this->pegawai->nip ?? null,
                'jabatan' => $this->pegawai->jabatan ?? null,
                'unit_kerja' => $this->pegawai->unit_kerja ?? null,
            ],
            
            'atasan_langsung' => [
                'id' => $this->atasanLangsung->id,
                'nama' => $this->atasanLangsung->nama,
            ],
            
            'jenis_cuti' => [
                'id' => $this->jenisCuti->id,
                'nama' => $this->jenisCuti->nama,
                'kode' => $this->jenisCuti->kode,
            ],
            
            'alasan_cuti' => $this->alasan_cuti,
            'lama_cuti' => $this->lama_cuti,
            'mulai_tanggal' => $this->mulai_tanggal->format('Y-m-d'),
            'sampai_tanggal' => $this->sampai_tanggal->format('Y-m-d'),
            'periode_cuti' => $this->periode_cuti,
            'alamat_selama_cuti' => $this->alamat_selama_cuti,
            
            'status' => $this->status,
            'status_badge' => $this->status_badge,
            'tanggal_approval' => $this->tanggal_approval?->format('Y-m-d H:i:s'),
            'catatan_approval' => $this->catatan_approval,
            
            'can_edit' => $this->canEdit(),
            'can_delete' => $this->canDelete(),
            'can_approve' => $this->canApprove(),
            
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
```

---

## STEP 2.4: Setup Routes

**FILE:** `routes/web.php`

**ADD:**
```php
use App\Http\Controllers\CutiController;

Route::middleware(['auth'])->prefix('cuti')->name('cuti.')->group(function () {
    Route::get('/', [CutiController::class, 'index'])->name('index');
    Route::get('/create', [CutiController::class, 'create'])->name('create');
    Route::post('/', [CutiController::class, 'store'])->name('store');
    Route::get('/{id}', [CutiController::class, 'show'])->name('show');
    Route::get('/{id}/edit', [CutiController::class, 'edit'])->name('edit');
    Route::put('/{id}', [CutiController::class, 'update'])->name('update');
    Route::delete('/{id}', [CutiController::class, 'destroy'])->name('destroy');
    
    // Approval
    Route::post('/{id}/approve', [CutiController::class, 'approve'])->name('approve');
    Route::post('/{id}/reject', [CutiController::class, 'reject'])->name('reject');
});

// API Routes
Route::middleware(['auth'])->prefix('api/cuti')->name('api.cuti.')->group(function () {
    Route::post('/calculate-working-days', [CutiController::class, 'calculateWorkingDays'])
        ->name('calculate-working-days');
});
```

---

## STEP 2.5: Create Index Page

**ACTION:**
```bash
mkdir -p resources/js/Pages/Cuti
```

**CREATE FILE:** `resources/js/Pages/Cuti/Index.jsx`

**CODE:**
```jsx
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import TableCuti from '@/Components/Cuti/TableCuti';

export default function Index({ auth, cuti, jenisCuti, filters }) {
    const [activeTab, setActiveTab] = useState(filters.status || 'all');
    
    const handleFilter = (newFilters) => {
        router.get(route('cuti.index'), {
            ...filters,
            ...newFilters,
        }, {
            preserveState: true,
        });
    };
    
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Cuti" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Header */}
                    <div className="flex justify-between items-center mb-6">
                        <h1 className="text-2xl font-semibold text-gray-900">
                            Cuti
                        </h1>
                        <a
                            href={route('cuti.create')}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                            + Ajukan Cuti
                        </a>
                    </div>
                    
                    {/* Tabs */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => {
                                    setActiveTab('all');
                                    handleFilter({ status: null });
                                }}
                                className={`${
                                    activeTab === 'all'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Semua
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('pending');
                                    handleFilter({ status: 'pending' });
                                }}
                                className={`${
                                    activeTab === 'pending'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Pending
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('approved');
                                    handleFilter({ status: 'approved' });
                                }}
                                className={`${
                                    activeTab === 'approved'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Disetujui
                            </button>
                            <button
                                onClick={() => {
                                    setActiveTab('rejected');
                                    handleFilter({ status: 'rejected' });
                                }}
                                className={`${
                                    activeTab === 'rejected'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700'
                                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                            >
                                Ditolak
                            </button>
                        </nav>
                    </div>
                    
                    {/* Table */}
                    <TableCuti 
                        data={cuti}
                        jenisCuti={jenisCuti}
                        filters={filters}
                        onFilter={handleFilter}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

---

## STEP 2.6: Create Form Page

**CREATE FILE:** `resources/js/Pages/Cuti/Create.jsx`

**CODE:**
```jsx
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import FormCuti from '@/Components/Cuti/FormCuti';

export default function Create({ auth, pegawai, jenisCuti }) {
    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Ajukan Cuti" />
            
            <div className="py-6">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                        Ajukan Cuti
                    </h1>
                    
                    <FormCuti 
                        pegawai={pegawai}
                        jenisCuti={jenisCuti}
                    />
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
```

---

## STEP 2.7: Create FormCuti Component

**CREATE FILE:** `resources/js/Components/Cuti/FormCuti.jsx`

**CODE:** (Implementasi lengkap form dengan auto-calculate working days)

**Key Features:**
- 2 sections: Informasi Pegawai & Durasi Lokasi
- Auto-calculate `lama_cuti` via API saat tanggal berubah
- Real-time validation
- Responsive layout

---

## STEP 2.8: Test Create & Read

**TEST:**
- [ ] Access /cuti → Daftar cuti tampil
- [ ] Tabs berfungsi (Semua, Pending, Approved, Rejected)
- [ ] Click "Ajukan Cuti" → Form terbuka
- [ ] Isi form lengkap
- [ ] Auto-calculate working days berfungsi
- [ ] Submit form → Data tersimpan
- [ ] Redirect ke index → Data muncul di tab Pending
- [ ] Permission-based display berfungsi

**✅ CHECKPOINT:** Create & Read berfungsi dengan baik.

---

## ✅ PHASE 2 COMPLETION CHECKLIST

- [ ] CutiController (index, create, store) created
- [ ] StoreCutiRequest validation created
- [ ] CutiResource created
- [ ] Routes registered
- [ ] Index page created
- [ ] Create page created
- [ ] FormCuti component created
- [ ] Auto-calculate working days via API
- [ ] Create cuti berfungsi
- [ ] Read cuti berfungsi
- [ ] Tabs & filters berfungsi
- [ ] Validation berfungsi

**OUTPUT PHASE 2:**
Commit code: "Phase 2: CRUD Basic - Create & Read completed"

---

# ✏️ PHASE 3: UPDATE, DELETE & APPROVAL WORKFLOW

**Estimasi:** 3 hari (Day 5-7)

## Objectives:
- Implement update cuti (hanya pending)
- Implement delete cuti (hanya pending)
- Implement approve/reject cuti
- Create Edit page
- Create Show page dengan approval actions
- Test approval workflow

---

## STEP 3.1: Add Update & Delete to Controller

**UPDATE:** `app/Http/Controllers/CutiController.php`

**ADD METHODS:**
```php
public function edit($id)
{
    $cuti = Cuti::with(['pegawai', 'jenisCuti', 'atasanLangsung'])
        ->findOrFail($id);
    
    // Check permission
    if (!$cuti->canEdit()) {
        return back()->with('error', 'Anda tidak memiliki akses untuk edit cuti ini');
    }
    
    $user = auth()->user();
    
    return Inertia::render('Cuti/Edit', [
        'cuti' => new CutiResource($cuti),
        'pegawai' => $user->hasRole('admin|hrd') 
            ? Pegawai::all() 
            : Pegawai::where('id', $user->pegawai_id)->get(),
        'jenisCuti' => JenisCuti::active()->get(),
    ]);
}

public function update(UpdateCutiRequest $request, $id)
{
    $cuti = Cuti::findOrFail($id);
    
    // Check permission & status
    if (!$cuti->canEdit()) {
        return back()->with('error', 'Cuti yang sudah disetujui/ditolak tidak bisa diedit');
    }
    
    $validated = $request->validated();
    $cuti->update($validated);
    
    return redirect()->route('cuti.index')
        ->with('success', 'Cuti berhasil diupdate');
}

public function destroy($id)
{
    $cuti = Cuti::findOrFail($id);
    
    // Check permission & status
    if (!$cuti->canDelete()) {
        return back()->with('error', 'Cuti yang sudah disetujui/ditolak tidak bisa dihapus');
    }
    
    $cuti->delete(); // Soft delete
    
    return redirect()->route('cuti.index')
        ->with('success', 'Cuti berhasil dihapus');
}
```

---

## STEP 3.2: Add Approval Methods to Controller

**ADD METHODS:**
```php
public function show($id)
{
    $cuti = Cuti::with(['pegawai', 'jenisCuti', 'atasanLangsung'])
        ->findOrFail($id);
    
    return Inertia::render('Cuti/Show', [
        'cuti' => new CutiResource($cuti),
    ]);
}

public function approve(Request $request, $id)
{
    $request->validate([
        'catatan_approval' => 'nullable|string|max:500',
    ]);
    
    $cuti = Cuti::findOrFail($id);
    
    if (!$cuti->canApprove()) {
        return back()->with('error', 'Anda tidak memiliki akses untuk menyetujui cuti ini');
    }
    
    $this->cutiService->approveCuti($id, $request->catatan_approval);
    
    return back()->with('success', 'Cuti berhasil disetujui');
}

public function reject(Request $request, $id)
{
    $request->validate([
        'catatan_approval' => 'required|string|max:500',
    ]);
    
    $cuti = Cuti::findOrFail($id);
    
    if (!$cuti->canApprove()) {
        return back()->with('error', 'Anda tidak memiliki akses untuk menolak cuti ini');
    }
    
    $this->cutiService->rejectCuti($id, $request->catatan_approval);
    
    return back()->with('success', 'Cuti berhasil ditolak');
}

public function calculateWorkingDays(Request $request)
{
    $request->validate([
        'start_date' => 'required|date',
        'end_date' => 'required|date|after:start_date',
    ]);
    
    $workingDays = $this->cutiService->calculateWorkingDays(
        $request->start_date,
        $request->end_date
    );
    
    return response()->json([
        'working_days' => $workingDays,
    ]);
}
```

---

## STEP 3.3: Create UpdateCutiRequest

**ACTION:**
```bash
php artisan make:request UpdateCutiRequest
```

**CODE:** (Similar dengan StoreCutiRequest, tambah exclude cuti ID saat check overlap)

---

## STEP 3.4: Create Edit Page

**CREATE FILE:** `resources/js/Pages/Cuti/Edit.jsx`

(Similar dengan Create.jsx, tapi pass data cuti ke FormCuti)

---

## STEP 3.5: Create Show Page

**CREATE FILE:** `resources/js/Pages/Cuti/Show.jsx`

**Features:**
- Display semua info cuti (read-only)
- Conditional actions:
  - Jika pegawai & pending: [Edit] [Hapus]
  - Jika atasan & pending: [Setujui] [Tolak]
  - Jika approved/rejected: [Tutup]

---

## STEP 3.6: Create ModalApproval Component

**CREATE FILE:** `resources/js/Components/Cuti/ModalApproval.jsx`

**Features:**
- Modal dengan form catatan
- Button: [Batal] [Tolak] [Setujui]
- Validation: Catatan wajib untuk reject

---

## STEP 3.7: Test Update, Delete & Approval

**TEST:**
- [ ] Edit cuti (pending) berfungsi
- [ ] Edit cuti (approved/rejected) tidak bisa
- [ ] Delete cuti (pending) berfungsi
- [ ] Delete cuti (approved/rejected) tidak bisa
- [ ] Approve cuti (hanya atasan) berfungsi
- [ ] Reject cuti (hanya atasan, catatan wajib) berfungsi
- [ ] Status badge berubah setelah approval

**✅ CHECKPOINT:** Update, Delete, Approval berfungsi.

---

## ✅ PHASE 3 COMPLETION CHECKLIST

- [ ] Update cuti implemented
- [ ] Delete cuti implemented
- [ ] Approve cuti implemented
- [ ] Reject cuti implemented
- [ ] Edit page created
- [ ] Show page created
- [ ] ModalApproval created
- [ ] Permission checks berfungsi
- [ ] Status immutability berfungsi

**OUTPUT PHASE 3:**
Commit code: "Phase 3: Update, Delete & Approval Workflow completed"

---

# 🎨 PHASE 4: FRONTEND ENHANCEMENT & POLISH

**Estimasi:** 2 hari (Day 8-9)

## Objectives:
- Create TableCuti component (reusable)
- Enhance FormCuti (real-time calculation)
- Create StatusBadge component
- Implement search & advanced filters
- Polish responsive design
- Add loading states

---

## STEP 4.1: Create TableCuti Component

**Features:**
- Responsive table (desktop: table, mobile: cards)
- Search bar
- Filter: Jenis Cuti, Tahun
- Conditional action buttons based on permission
- Pagination

---

## STEP 4.2: Create StatusBadge Component

**Features:**
- Color-coded badge (pending: yellow, approved: green, rejected: red)
- Icon (optional)

---

## STEP 4.3: Polish Responsive Design

**TEST:**
- [ ] Mobile (< 768px): Card view, single column
- [ ] Tablet (768-1024px): Responsive table
- [ ] Desktop (> 1024px): Full table

---

## ✅ PHASE 4 COMPLETION CHECKLIST

- [ ] TableCuti component created
- [ ] StatusBadge component created
- [ ] Search implemented
- [ ] Filters implemented
- [ ] Responsive design polished
- [ ] Loading states added

**OUTPUT PHASE 4:**
Commit code: "Phase 4: Frontend Enhancement completed"

---

# 🎉 PHASE 5: INTEGRATION & FINAL TESTING

**Estimasi:** 1 hari (Day 10)

## Objectives:
- Add navigation menu
- Full flow testing
- Bug fixing
- Documentation

---

## STEP 5.1: Add Navigation Menu

**UPDATE:** `resources/js/Layouts/AuthenticatedLayout.jsx`

**ADD:**
```jsx
<NavLink href={route('cuti.index')} active={route().current('cuti.*')}>
    Cuti
</NavLink>
```

---

## STEP 5.2: Full Flow Testing

**COMPLETE FLOW:**
1. Pegawai ajukan cuti → Status pending
2. Atasan lihat cuti → Detail
3. Atasan approve → Status approved
4. Test reject workflow
5. Test edit (pending only)
6. Test delete (pending only)
7. Test overlap detection
8. Test permission-based access

---

## STEP 5.3: Final Checklist

**Functional:**
- [ ] CRUD berfungsi
- [ ] Auto-calculate working days
- [ ] Overlap detection
- [ ] Approval workflow
- [ ] Permission-based access
- [ ] Search & filters

**UI/UX:**
- [ ] Responsive
- [ ] Loading states
- [ ] Error messages
- [ ] Success notifications

**Technical:**
- [ ] No console errors
- [ ] No PHP errors
- [ ] Performance < 3s
- [ ] Code documented

---

## ✅ PHASE 5 COMPLETION CHECKLIST

- [ ] Navigation menu added
- [ ] Full flow tested
- [ ] All bugs fixed
- [ ] Documentation updated

**OUTPUT PHASE 5:**
Commit code: "Phase 5: Integration & Final Testing completed - Modul Cuti v1.0.0"

---

# 🎯 FINAL SUCCESS CRITERIA

**Modul Cuti dianggap SELESAI:**

### Database & Backend:
- [x] Migration berhasil
- [x] Models dengan relasi
- [x] CutiService berfungsi
- [x] Validation berfungsi
- [x] Approval workflow

### Frontend:
- [x] CRUD operations
- [x] Auto-calculate working days
- [x] Tabs & filters
- [x] Responsive design
- [x] Permission-based display

### Testing:
- [x] Full flow tested
- [x] No errors
- [x] Performance OK

---

**END OF EXECUTION PHASES**

*Silakan eksekusi phase-by-phase sesuai urutan.*
*Good luck! 🚀*
