<?php

namespace App\Http\Controllers\Cuti;

use App\Http\Controllers\Controller;
use App\Http\Requests\Cuti\StoreCutiRequest;
use App\Http\Requests\Cuti\UpdateCutiRequest;
use App\Http\Resources\Cuti\CutiResource;
use App\Models\Cuti;
use App\Models\User;
use App\Services\CutiService;
use App\Support\CacheHelper;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CutiController extends Controller
{
    /**
     * Display a listing of cuti.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Cuti::class);

        $filters = $request->only(['search', 'status']);
        $search = $filters['search'] ?? null;
        $status = $filters['status'] ?? null;
        $cacheKey = 'cuti_index_' . md5(json_encode($filters));

        return Inertia::render('Cuti/Index', [
            'cuti' => Inertia::defer(fn() => CacheHelper::tags(['cuti'])->remember($cacheKey, 60, function () use ($search, $status) {
                return CutiResource::collection(
                    Cuti::query()
                        ->with(['creator', 'updater'])
                        ->when($status, fn($query) => $query->where('status', $status))
                        ->search($search)
                        ->latest('created_at')
                        ->get()
                );
            })),
            'statusOptions' => Cuti::STATUS_OPTIONS,
            'filters' => $filters,
        ]);
    }

    /**
     * Show the form for creating a new cuti.
     */
    public function create()
    {
        $this->authorize('create', Cuti::class);

        return Inertia::render('Cuti/Create', [
            'users' => User::select(['id', 'name', 'nip', 'jabatan'])
                ->orderBy('name')
                ->get(),
            'jenisCutiOptions' => Cuti::JENIS_CUTI_OPTIONS,
        ]);
    }

    /**
     * Store a newly created cuti.
     */
    public function store(StoreCutiRequest $request)
    {
        $this->authorize('create', Cuti::class);

        DB::beginTransaction();
        try {
            $data = $request->validated();
            $pegawai = User::findOrFail($data['user_id']);
            $atasan = isset($data['atasan_id']) ? User::find($data['atasan_id']) : null;

            CutiService::create($data, $pegawai, $atasan);

            CacheHelper::flush(['cuti']);

            DB::commit();

            return redirect()->route('cuti.index')
                ->with('success', 'Pengajuan cuti berhasil disimpan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal menyimpan pengajuan cuti: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified cuti.
     */
    public function show(string $id)
    {
        $cuti = Cuti::with(['creator', 'updater', 'deleter'])->findOrFail($id);
        $this->authorize('view', $cuti);

        return Inertia::render('Cuti/Show', [
            'cuti' => new CutiResource($cuti),
            'statusOptions' => Cuti::STATUS_OPTIONS,
        ]);
    }

    /**
     * Show the form for editing the specified cuti.
     */
    public function edit(string $id)
    {
        $cuti = Cuti::with(['creator', 'updater'])->findOrFail($id);
        $this->authorize('update', $cuti);

        if ($cuti->status !== Cuti::STATUS_PENDING) {
            return redirect()->route('cuti.index')
                ->with('error', 'Pengajuan cuti hanya bisa diedit saat status pending.');
        }

        return Inertia::render('Cuti/Edit', [
            'cuti' => new CutiResource($cuti),
            'users' => User::select(['id', 'name', 'nip', 'jabatan'])
                ->orderBy('name')
                ->get(),
            'jenisCutiOptions' => Cuti::JENIS_CUTI_OPTIONS,
        ]);
    }

    /**
     * Update the specified cuti.
     */
    public function update(UpdateCutiRequest $request, string $id)
    {
        $cuti = Cuti::findOrFail($id);
        $this->authorize('update', $cuti);

        DB::beginTransaction();
        try {
            $data = $request->validated();
            $pegawai = User::findOrFail($data['user_id']);
            $atasan = isset($data['atasan_id']) ? User::find($data['atasan_id']) : null;

            CutiService::update($cuti, $data, $pegawai, $atasan);

            CacheHelper::flush(['cuti']);

            DB::commit();

            return redirect()->route('cuti.index')
                ->with('success', 'Pengajuan cuti berhasil diperbarui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->withInput()
                ->with('error', 'Gagal memperbarui pengajuan cuti: ' . $e->getMessage());
        }
    }

    /**
     * Cancel cuti (only while pending).
     */
    public function cancel(string $id)
    {
        $cuti = Cuti::findOrFail($id);
        $this->authorize('cancel', $cuti);

        DB::beginTransaction();
        try {
            CutiService::cancel($cuti);

            CacheHelper::flush(['cuti']);

            DB::commit();

            return redirect()->back()
                ->with('success', 'Pengajuan cuti berhasil dibatalkan.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Gagal membatalkan pengajuan cuti: ' . $e->getMessage());
        }
    }

    /**
     * Approve cuti (only while pending).
     */
    public function approve(string $id)
    {
        $cuti = Cuti::findOrFail($id);
        $this->authorize('approve', $cuti);

        DB::beginTransaction();
        try {
            CutiService::approve($cuti);

            CacheHelper::flush(['cuti']);

            DB::commit();

            return redirect()->back()
                ->with('success', 'Pengajuan cuti berhasil disetujui.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Gagal menyetujui pengajuan cuti: ' . $e->getMessage());
        }
    }

    /**
     * Reject cuti (only while pending).
     */
    public function reject(string $id)
    {
        $cuti = Cuti::findOrFail($id);
        $this->authorize('reject', $cuti);

        DB::beginTransaction();
        try {
            CutiService::reject($cuti);

            CacheHelper::flush(['cuti']);

            DB::commit();

            return redirect()->back()
                ->with('success', 'Pengajuan cuti berhasil ditolak.');
        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()
                ->with('error', 'Gagal menolak pengajuan cuti: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified cuti from storage (soft delete).
     */
    public function destroy(string $id)
    {
        $cuti = Cuti::findOrFail($id);
        $this->authorize('delete', $cuti);

        $cuti->delete();

        CacheHelper::flush(['cuti']);

        return redirect()->back()
            ->with('success', 'Pengajuan cuti berhasil dihapus.');
    }
}
