# E-Office Implementation Guide

**Tech Stack:** Laravel 11 + Inertia.js + React + TypeScript + PostgreSQL + Tailwind CSS

Dokumen ini adalah referensi lengkap untuk implementasi fitur E-Office secara bertahap.

---

## Daftar Isi

1. [Database Schema](#1-database-schema)
2. [Models & Traits](#2-models--traits)
3. [Controllers & Validation](#3-controllers--validation)
4. [Frontend Pages](#4-frontend-pages)
5. [Reusable Components](#5-reusable-components)
6. [Best Practices](#6-best-practices)
7. [Implementation Phases](#7-implementation-phases)

---

## 1. Database Schema

### 1.1 Unit Kerja

```php
// database/migrations/xxxx_create_unit_kerja_table.php
Schema::create('unit_kerja', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->string('nama');
    $table->string('singkatan', 50)->nullable();

    // Audit Trails
    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
    $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
    $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

    $table->timestamps();
    $table->softDeletes();
});
```

### 1.2 Indeks Surat

```php
// database/migrations/xxxx_create_indeks_surat_table.php
Schema::create('indeks_surat', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->string('kode', 50)->unique();
    $table->string('nama');
    $table->integer('urutan')->default(0);

    // Audit Trails
    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
    $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
    $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

    $table->timestamps();
    $table->softDeletes();
});
```

### 1.3 Wilayah (4 Tabel)

```php
// database/migrations/xxxx_create_wilayah_tables.php

// Provinsi
Schema::create('wilayah_provinsi', function (Blueprint $table) {
    $table->char('kode', 2)->primary();
    $table->string('nama');
});

// Kabupaten
Schema::create('wilayah_kabupaten', function (Blueprint $table) {
    $table->char('provinsi_kode', 2);
    $table->char('kode', 2);
    $table->string('nama');
    $table->primary(['provinsi_kode', 'kode']);
    $table->foreign('provinsi_kode')
        ->references('kode')->on('wilayah_provinsi')
        ->cascadeOnDelete()->cascadeOnUpdate();
});

// Kecamatan
Schema::create('wilayah_kecamatan', function (Blueprint $table) {
    $table->char('provinsi_kode', 2);
    $table->char('kabupaten_kode', 2);
    $table->char('kode', 2);
    $table->string('nama');
    $table->primary(['provinsi_kode', 'kabupaten_kode', 'kode']);
    $table->foreign(['provinsi_kode', 'kabupaten_kode'])
        ->references(['provinsi_kode', 'kode'])->on('wilayah_kabupaten')
        ->cascadeOnDelete()->cascadeOnUpdate();
});

// Desa
Schema::create('wilayah_desa', function (Blueprint $table) {
    $table->char('provinsi_kode', 2);
    $table->char('kabupaten_kode', 2);
    $table->char('kecamatan_kode', 2);
    $table->char('kode', 4);
    $table->string('nama');
    $table->primary(['provinsi_kode', 'kabupaten_kode', 'kecamatan_kode', 'kode']);
    $table->foreign(['provinsi_kode', 'kabupaten_kode', 'kecamatan_kode'])
        ->references(['provinsi_kode', 'kabupaten_kode', 'kode'])->on('wilayah_kecamatan')
        ->cascadeOnDelete()->cascadeOnUpdate();
});
```

### 1.4 Surat Masuk

```php
// database/migrations/xxxx_create_surat_masuk_table.php
Schema::create('surat_masuk', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->string('kode', 64)->nullable()->index();
    $table->string('indeks', 512)->nullable();
    $table->string('nomor_urut', 64)->nullable();
    $table->string('perihal', 256)->nullable();
    $table->string('isi_ringkas', 512)->nullable();
    $table->string('asal_surat', 256)->nullable();
    $table->dateTime('tanggal_diterima')->nullable();
    $table->date('tanggal_surat')->nullable();
    $table->string('nomor_surat', 128)->nullable();
    $table->date('tanggal_kirim')->nullable();
    $table->string('penerima', 128)->nullable();
    $table->string('ttd', 128)->nullable();
    $table->string('sifat', 128)->nullable();
    $table->text('kepada')->nullable();
    $table->string('lampiran', 128)->nullable();
    $table->text('keterangan')->nullable();
    $table->string('nama_file', 512)->nullable();
    $table->enum('agenda_status', ['pending', 'scheduled', 'no_agenda'])->default('pending');

    // Audit Trails
    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
    $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
    $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

    $table->timestamps();
    $table->softDeletes();
});
```

### 1.5 Surat Keluar

```php
// database/migrations/xxxx_create_surat_keluar_table.php
Schema::create('surat_keluar', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->string('kode', 64)->nullable()->index();
    $table->string('indeks', 512)->nullable();
    $table->string('nomor_urut', 64)->nullable();
    $table->string('nomor_surat', 128)->nullable();
    $table->date('tanggal_surat')->nullable();
    $table->string('kepada', 256)->nullable();
    $table->string('isi_ringkas', 512)->nullable();
    $table->string('perihal', 256)->nullable();
    $table->string('pengolah', 256)->nullable();
    $table->string('kode_pengolah', 64)->nullable();
    $table->string('catatan', 512)->nullable();
    $table->string('lampiran', 128)->nullable();
    $table->string('sifat', 128)->nullable();
    $table->string('nama_file', 512)->nullable();

    // Audit Trails
    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
    $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
    $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

    $table->timestamps();
    $table->softDeletes();
});
```

### 1.6 Penjadwalan

```php
// database/migrations/xxxx_create_penjadwalan_table.php
Schema::create('penjadwalan', function (Blueprint $table) {
    $table->ulid('id')->primary();
    $table->foreignUlid('surat_masuk_id')->constrained('surat_masuk')->cascadeOnDelete();
    $table->date('tanggal_agenda');
    $table->time('waktu_mulai');
    $table->time('waktu_selesai')->nullable();
    $table->string('tempat');
    $table->string('kode_wilayah')->nullable()->comment('Format: xx.xx.xx.xxxx');
    $table->boolean('is_pemda_lama')->default(false);
    $table->text('keterangan')->nullable();
    $table->enum('status', ['definitif', 'tentatif'])->default('tentatif');
    $table->string('dihadiri_oleh')->nullable();
    $table->enum('status_disposisi', ['menunggu', 'bupati', 'diwakilkan'])->default('menunggu');
    $table->string('lokasi_type')->nullable()->comment('dalam_daerah, luar_daerah');

    // Audit Trails
    $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
    $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
    $table->foreignId('deleted_by')->nullable()->constrained('users')->nullOnDelete();

    $table->timestamps();
    $table->softDeletes();
});
```

### 1.7 Cuti

```php
// database/migrations/xxxx_create_cuti_table.php
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

    // Cuti Details
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
```

---

## 2. Models & Traits

### 2.1 HasAuditTrail Trait

```php
// app/Traits/HasAuditTrail.php
<?php

namespace App\Traits;

use Illuminate\Support\Facades\Auth;

trait HasAuditTrail
{
    public static function bootHasAuditTrail(): void
    {
        static::creating(function ($model) {
            if (Auth::check()) {
                $model->created_by = Auth::id();
            }
        });

        static::updating(function ($model) {
            if (Auth::check()) {
                $model->updated_by = Auth::id();
            }
        });

        static::deleting(function ($model) {
            if (Auth::check() && method_exists($model, 'isForceDeleting') && !$model->isForceDeleting()) {
                $model->deleted_by = Auth::id();
                $model->saveQuietly();
            }
        });
    }

    public function creator()
    {
        return $this->belongsTo(\App\Models\User::class, 'created_by');
    }

    public function updater()
    {
        return $this->belongsTo(\App\Models\User::class, 'updated_by');
    }

    public function deleter()
    {
        return $this->belongsTo(\App\Models\User::class, 'deleted_by');
    }
}
```

### 2.2 Model Template

```php
// app/Models/UnitKerja.php
<?php

namespace App\Models;

use App\Traits\HasAuditTrail;
use Illuminate\Database\Eloquent\Concerns\HasUlids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class UnitKerja extends Model
{
    use HasFactory, HasUlids, SoftDeletes, HasAuditTrail;

    protected $table = 'unit_kerja';

    protected $fillable = [
        'nama',
        'singkatan',
    ];
}
```

---

## 3. Controllers & Validation

### 3.1 Controller Template (CRUD + Archive)

```php
// app/Http/Controllers/Master/UnitKerjaController.php
<?php

namespace App\Http\Controllers\Master;

use App\Http\Controllers\Controller;
use App\Http\Requests\Master\UnitKerjaRequest;
use App\Models\UnitKerja;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UnitKerjaController extends Controller
{
    public function index(Request $request): Response
    {
        $query = UnitKerja::query()
            ->when($request->search, fn($q, $search) =>
                $q->where('nama', 'ilike', "%{$search}%")
                  ->orWhere('singkatan', 'ilike', "%{$search}%")
            )
            ->orderBy('nama');

        return Inertia::render('Master/UnitKerja/Index', [
            'data' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function store(UnitKerjaRequest $request): RedirectResponse
    {
        UnitKerja::create($request->validated());

        return back()->with('success', 'Unit Kerja berhasil ditambahkan.');
    }

    public function update(UnitKerjaRequest $request, UnitKerja $unitKerja): RedirectResponse
    {
        $unitKerja->update($request->validated());

        return back()->with('success', 'Unit Kerja berhasil diperbarui.');
    }

    public function destroy(UnitKerja $unitKerja): RedirectResponse
    {
        $unitKerja->delete();

        return back()->with('success', 'Unit Kerja berhasil dihapus.');
    }

    // Archive (Soft Deleted Items)
    public function archive(Request $request): Response
    {
        $query = UnitKerja::onlyTrashed()
            ->when($request->search, fn($q, $search) =>
                $q->where('nama', 'ilike', "%{$search}%")
            )
            ->orderBy('deleted_at', 'desc');

        return Inertia::render('Master/UnitKerja/Archive', [
            'data' => $query->paginate(10)->withQueryString(),
            'filters' => $request->only(['search']),
        ]);
    }

    public function restore(string $id): RedirectResponse
    {
        $unitKerja = UnitKerja::onlyTrashed()->findOrFail($id);
        $unitKerja->restore();

        return back()->with('success', 'Unit Kerja berhasil dipulihkan.');
    }

    public function forceDelete(string $id): RedirectResponse
    {
        $unitKerja = UnitKerja::onlyTrashed()->findOrFail($id);
        $unitKerja->forceDelete();

        return back()->with('success', 'Unit Kerja berhasil dihapus permanen.');
    }
}
```

### 3.2 Form Request Validation

```php
// app/Http/Requests/Master/UnitKerjaRequest.php
<?php

namespace App\Http\Requests\Master;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UnitKerjaRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'nama' => ['required', 'string', 'max:255'],
            'singkatan' => ['nullable', 'string', 'max:50'],
        ];
    }

    public function messages(): array
    {
        return [
            'nama.required' => 'Nama unit kerja wajib diisi.',
        ];
    }
}
```

### 3.3 Routes Pattern

```php
// routes/web.php

// Master Routes
Route::prefix('master')->name('master.')->middleware('auth')->group(function () {
    // Unit Kerja
    Route::resource('unit-kerja', UnitKerjaController::class)->except(['create', 'show', 'edit']);
    Route::get('unit-kerja/archive', [UnitKerjaController::class, 'archive'])->name('unit-kerja.archive');
    Route::post('unit-kerja/{id}/restore', [UnitKerjaController::class, 'restore'])->name('unit-kerja.restore');
    Route::delete('unit-kerja/{id}/force-delete', [UnitKerjaController::class, 'forceDelete'])->name('unit-kerja.force-delete');

    // Indeks Surat (same pattern)
    // ...
});
```

---

## 4. Frontend Pages

### 4.1 Index Page dengan Modal CRUD

```tsx
// resources/js/Pages/Master/UnitKerja/Index.tsx
import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AppLayout from "@/Layouts/AppLayout";
import { Button, Modal, Table, Pagination } from "@/Components/ui";
import { InputLabel, TextInput, InputError } from "@/Components/form";

interface UnitKerja {
    id: string;
    nama: string;
    singkatan: string | null;
    created_at: string;
}

interface Props {
    data: {
        data: UnitKerja[];
        links: any;
        meta: any;
    };
    filters: {
        search?: string;
    };
}

export default function Index({ data, filters }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<UnitKerja | null>(null);
    const [deleteItem, setDeleteItem] = useState<UnitKerja | null>(null);

    const form = useForm({
        nama: "",
        singkatan: "",
    });

    const openCreate = () => {
        form.reset();
        setEditItem(null);
        setShowModal(true);
    };

    const openEdit = (item: UnitKerja) => {
        form.setData({
            nama: item.nama,
            singkatan: item.singkatan || "",
        });
        setEditItem(item);
        setShowModal(true);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editItem) {
            form.put(route("master.unit-kerja.update", editItem.id), {
                onSuccess: () => setShowModal(false),
            });
        } else {
            form.post(route("master.unit-kerja.store"), {
                onSuccess: () => setShowModal(false),
            });
        }
    };

    const handleDelete = () => {
        if (deleteItem) {
            router.delete(route("master.unit-kerja.destroy", deleteItem.id), {
                onSuccess: () => setDeleteItem(null),
            });
        }
    };

    return (
        <AppLayout>
            <Head title="Unit Kerja" />

            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Unit Kerja</h1>
                <Button onClick={openCreate}>Tambah Unit Kerja</Button>
            </div>

            {/* Table */}
            <Table
                headers={[
                    { key: "nama", label: "Nama" },
                    { key: "singkatan", label: "Singkatan" },
                    { key: "actions", label: "Aksi", className: "w-32" },
                ]}
                data={data.data}
                renderRow={(item) => (
                    <>
                        <td className="px-4 py-3">{item.nama}</td>
                        <td className="px-4 py-3">{item.singkatan || "-"}</td>
                        <td className="px-4 py-3">
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => openEdit(item)}
                                >
                                    Edit
                                </Button>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => setDeleteItem(item)}
                                >
                                    Hapus
                                </Button>
                            </div>
                        </td>
                    </>
                )}
            />

            {/* Pagination */}
            <Pagination links={data.links} />

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title={editItem ? "Edit Unit Kerja" : "Tambah Unit Kerja"}
            >
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <InputLabel htmlFor="nama" value="Nama" />
                            <TextInput
                                id="nama"
                                value={form.data.nama}
                                onChange={(e) =>
                                    form.setData("nama", e.target.value)
                                }
                                className="mt-1 w-full"
                            />
                            <InputError
                                message={form.errors.nama}
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <InputLabel htmlFor="singkatan" value="Singkatan" />
                            <TextInput
                                id="singkatan"
                                value={form.data.singkatan}
                                onChange={(e) =>
                                    form.setData("singkatan", e.target.value)
                                }
                                className="mt-1 w-full"
                            />
                            <InputError
                                message={form.errors.singkatan}
                                className="mt-1"
                            />
                        </div>
                    </div>
                    <div className="mt-6 flex justify-end gap-3">
                        <Button
                            type="button"
                            variant="secondary"
                            onClick={() => setShowModal(false)}
                        >
                            Batal
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? "Menyimpan..." : "Simpan"}
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={!!deleteItem}
                onClose={() => setDeleteItem(null)}
                title="Hapus Unit Kerja"
                size="sm"
            >
                <p className="text-text-secondary">
                    Apakah Anda yakin ingin menghapus{" "}
                    <strong>{deleteItem?.nama}</strong>? Data akan dipindahkan
                    ke Archive.
                </p>
                <div className="mt-6 flex justify-end gap-3">
                    <Button
                        variant="secondary"
                        onClick={() => setDeleteItem(null)}
                    >
                        Batal
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Ya, Hapus
                    </Button>
                </div>
            </Modal>
        </AppLayout>
    );
}
```

### 4.2 Archive Page Pattern

```tsx
// resources/js/Pages/Master/UnitKerja/Archive.tsx
// Similar structure but with Restore and Force Delete actions
```

---

## 5. Reusable Components

### 5.1 Component Library Structure

```
resources/js/Components/
├── form/           # Form elements
│   ├── TextInput.tsx
│   ├── InputLabel.tsx
│   ├── InputError.tsx
│   ├── Checkbox.tsx
│   ├── Select.tsx      # NEW
│   ├── Textarea.tsx    # NEW
│   ├── DatePicker.tsx  # NEW
│   └── index.ts
├── layout/         # App shell
│   ├── Header.tsx
│   ├── Sidebar.tsx
│   ├── SidebarMenuItem.tsx
│   ├── Footer.tsx
│   └── index.ts
└── ui/             # Generic UI
    ├── Button.tsx
    ├── Modal.tsx
    ├── Table.tsx
    ├── Pagination.tsx
    ├── Toast.tsx
    ├── Card.tsx        # NEW
    ├── Badge.tsx       # NEW
    ├── SearchInput.tsx # NEW
    └── index.ts
```

### 5.2 New Components Needed

#### SearchInput Component

```tsx
// resources/js/Components/ui/SearchInput.tsx
interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

export default function SearchInput({
    value,
    onChange,
    placeholder = "Cari...",
}: SearchInputProps) {
    return (
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="pl-10 pr-4 py-2 border border-border-default rounded-lg w-full"
            />
            <svg
                className="absolute left-3 top-2.5 w-5 h-5 text-text-muted" /* ... */
            />
        </div>
    );
}
```

#### Select Component

```tsx
// resources/js/Components/form/Select.tsx
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    options: { value: string; label: string }[];
}
```

---

## 6. Best Practices

### 6.1 SPA Navigation

- Gunakan Inertia `Link` dengan `prefetch="hover"` untuk navigasi cepat
- Gunakan `router.post/put/delete` untuk form submission
- Gunakan `useForm` hook dari Inertia untuk form handling

### 6.2 PostgreSQL Specific

- Gunakan `ilike` untuk case-insensitive search
- Gunakan ULID sebagai primary key untuk sorting by creation time
- Gunakan `jsonb` untuk flexible data storage jika diperlukan

### 6.3 Flash Messages

```php
// Controller
return back()->with('success', 'Data berhasil disimpan.');
return back()->with('error', 'Gagal menyimpan data.');

// HandleInertiaRequests.php
'flash' => [
    'success' => $request->session()->get('success'),
    'error' => $request->session()->get('error'),
],

// AppLayout.tsx - automatic toast display
```

### 6.4 Validation Error Handling

```tsx
// Form errors automatically populated by Inertia
<InputError message={form.errors.field_name} />
```

---

## 7. Implementation Phases

### Phase 1: Data Master (Week 1)

1. ✅ Menu update (tambah Archive)
2. Migration + Model: Unit Kerja
3. CRUD + Archive: Unit Kerja
4. Migration + Model: Indeks Surat
5. CRUD + Archive: Indeks Surat

### Phase 2: Wilayah (Week 1)

1. Migration wilayah tables (4 tabel)
2. Seeder data wilayah Indonesia
3. Read-only pages (no CRUD)

### Phase 3: Persuratan (Week 2)

1. Migration + Model: Surat Masuk
2. CRUD + Archive: Surat Masuk
3. File upload untuk lampiran
4. Migration + Model: Surat Keluar
5. CRUD + Archive: Surat Keluar

### Phase 4: Penjadwalan (Week 2-3)

1. Migration + Model: Penjadwalan
2. Relasi ke Surat Masuk
3. Filter by status (tentatif/definitif)
4. CRUD + Archive

### Phase 5: Cuti (Week 3)

1. Migration + Model: Cuti
2. Relasi ke Users
3. Workflow approval (pending/approved/rejected)
4. CRUD + Archive

### Phase 6: Pengguna & Finalisasi (Week 3-4)

1. CRUD Pengguna (admin only)
2. Role-based menu filtering
3. Testing & bug fixes
4. Documentation update

---

## Menu Structure

```typescript
// resources/js/config/menu.ts
export const menuItems = [
    { label: "Dashboard", href: "/dashboard" },
    {
        label: "Data Master",
        children: [
            { label: "Kepegawaian", href: "/master/kepegawaian" },
            { label: "Pengguna", href: "/master/pengguna" },
            { label: "Unit Kerja", href: "/master/unit-kerja" },
            { label: "Indeks Surat", href: "/master/indeks-surat" },
            { label: "Archive", href: "/master/archive" },
        ],
    },
    {
        label: "Persuratan",
        children: [
            { label: "Surat Masuk", href: "/persuratan/surat-masuk" },
            { label: "Surat Keluar", href: "/persuratan/surat-keluar" },
            { label: "Archive", href: "/persuratan/archive" },
        ],
    },
    { label: "Cuti", href: "/cuti" },
    {
        label: "Penjadwalan",
        children: [
            { label: "Jadwal", href: "/penjadwalan/jadwal" },
            { label: "Jadwal Tentatif", href: "/penjadwalan/tentatif" },
            { label: "Jadwal Definitif", href: "/penjadwalan/definitif" },
            { label: "Archive", href: "/penjadwalan/archive" },
        ],
    },
];
```

---

## Quick Commands

```bash
# Create migration
php artisan make:migration create_unit_kerja_table

# Create model with factory
php artisan make:model UnitKerja -f

# Create controller
php artisan make:controller Master/UnitKerjaController

# Create form request
php artisan make:request Master/UnitKerjaRequest

# Run migrations
php artisan migrate

# Fresh migration with seeders
php artisan migrate:fresh --seed

# Build frontend
npm run build

# Development
npm run dev
```

---

_Last Updated: 2026-01-29_
