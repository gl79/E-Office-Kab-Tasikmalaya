<?php

namespace App\Http\Resources\Penjadwalan;

use App\Models\DisposisiSurat;
use App\Models\Penjadwalan;
use App\Models\SuratMasuk;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;

class PenjadwalanResource extends JsonResource
{
    /**
     * @param mixed $resource
     */
    public function __construct($resource)
    {
        parent::__construct($resource);
    }

    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            // Surat Masuk Info
            'surat_masuk' => $this->when($this->relationLoaded('suratMasuk'), function () {
                $sm = $this->suratMasuk;
                return [
                    'id' => $sm->id,
                    'nomor_agenda' => $sm->nomor_agenda,
                    'nomor_surat' => $sm->nomor_surat,
                    'tanggal_surat' => $sm->tanggal_surat?->format('Y-m-d'),
                    'tanggal_surat_formatted' => $sm->tanggal_surat_formatted,
                    'tanggal_diterima' => $sm->tanggal_diterima?->format('Y-m-d'),
                    'tanggal_diterima_formatted' => $sm->tanggal_diterima_formatted,
                    'asal_surat' => $sm->asal_surat,
                    'perihal' => $sm->perihal,
                    'sifat' => $sm->sifat,
                    'sifat_label' => $sm->sifat_label,
                    'file_path' => $sm->file_path,
                    'file_url' => $sm->file_path
                        ? Storage::url($sm->file_path)
                        : null,
                    // Extended fields for full detail view
                    'isi_ringkas' => $sm->isi_ringkas,
                    'lampiran' => $sm->lampiran,
                    'tanggal_diteruskan' => $sm->tanggal_diteruskan?->format('Y-m-d'),
                    'catatan_tambahan' => $sm->catatan_tambahan,
                    'tujuans' => $sm->relationLoaded('tujuans')
                        ? $sm->tujuans->map(function ($t) {
                            return [
                                'id' => $t->id,
                                'tujuan' => $t->tujuan,
                                'user' => $t->relationLoaded('user') && $t->user
                                    ? [
                                        'name' => $t->user->name,
                                        'jabatan_nama' => $t->user->jabatan_nama,
                                    ]
                                    : null,
                            ];
                        })
                        : [],
                    'jenis_surat' => $sm->relationLoaded('jenisSurat') && $sm->jenisSurat
                        ? ['id' => $sm->jenisSurat->id, 'nama' => $sm->jenisSurat->nama]
                        : null,
                    'indeks_berkas' => $sm->relationLoaded('indeksBerkas') && $sm->indeksBerkas
                        ? ['kode' => $sm->indeksBerkas->kode, 'nama' => $sm->indeksBerkas->nama]
                        : null,
                    'kode_klasifikasi' => $sm->relationLoaded('kodeKlasifikasi') && $sm->kodeKlasifikasi
                        ? ['kode' => $sm->kodeKlasifikasi->kode, 'nama' => $sm->kodeKlasifikasi->nama]
                        : null,
                    'staff_pengolah' => $sm->relationLoaded('staffPengolah') && $sm->staffPengolah
                        ? ['name' => $sm->staffPengolah->name, 'nip' => $sm->staffPengolah->nip]
                        : null,
                    'created_by' => $sm->relationLoaded('createdBy') && $sm->createdBy
                        ? ['name' => $sm->createdBy->name]
                        : null,
                    'created_at' => $sm->created_at?->format('Y-m-d H:i:s'),
                    'status_tindak_lanjut' => $sm->status_tindak_lanjut,
                    'status_tindak_lanjut_label' => $sm->status_tindak_lanjut_label,
                    'status_tindak_lanjut_disposisi_ke' => $this->resolveDisposisiRecipientLabel(),
                ];
            }),

            // Jadwal Info
            'nama_kegiatan' => $this->nama_kegiatan,
            'tanggal_agenda' => $this->tanggal_agenda?->format('Y-m-d'),
            'tanggal_agenda_formatted' => $this->tanggal_formatted,
            'tanggal_format_indonesia' => $this->tanggal_format_indonesia,
            'hari' => $this->hari,
            'waktu_mulai' => $this->waktu_mulai,
            'waktu_selesai' => $this->waktu_selesai,
            'sampai_selesai' => $this->sampai_selesai,
            'waktu_lengkap' => $this->waktu_lengkap,
            'file_path' => $this->file_path,
            'file_url' => $this->file_path ? Storage::url($this->file_path) : null,

            // Lokasi Info
            'lokasi_type' => $this->lokasi_type,
            'lokasi_type_label' => $this->lokasi_type_label,
            'kode_wilayah' => $this->kode_wilayah,
            'tempat' => $this->tempat,
            'wilayah_text' => $this->kode_wilayah
                ? \App\Support\WilayahHelper::getWilayahText($this->kode_wilayah)
                : null,

            // Status Info
            'status' => $this->status,
            'status_label' => $this->status_label,
            'status_formal' => $this->status_formal,
            'status_formal_label' => $this->status_formal_label,
            'status_disposisi' => $this->status_disposisi,
            'status_disposisi_label' => $this->status_disposisi_label,
            'status_tindak_lanjut' => $this->status_tindak_lanjut,
            'status_tindak_lanjut_label' => $this->status_tindak_lanjut,
            'status_tindak_lanjut_disposisi_ke' => $this->resolveDisposisiRecipientLabel(),
            'sumber_jadwal' => $this->sumber_jadwal,
            'sumber_jadwal_label' => $this->sumber_jadwal_label,
            'status_kehadiran_column_label' => $this->status_kehadiran_column_label,
            'dihadiri_oleh' => $this->dihadiri_oleh,
            'dihadiri_oleh_user_id' => $this->dihadiri_oleh_user_id,
            'status_kehadiran' => $this->status_kehadiran,
            'nama_yang_mewakili' => $this->nama_yang_mewakili,
            'has_disposisi_chain' => $this->hasDisposisiChain(),

            // Catatan
            'keterangan' => $this->keterangan,

            // Audit Trail
            'created_by' => $this->when($this->relationLoaded('creator'), function () {
                return $this->creator ? [
                    'id' => $this->creator->id,
                    'name' => $this->creator->name,
                ] : null;
            }),
            'updated_by' => $this->when($this->relationLoaded('updater'), function () {
                return $this->updater ? [
                    'id' => $this->updater->id,
                    'name' => $this->updater->name,
                ] : null;
            }),
            'deleted_by' => $this->when($this->relationLoaded('deleter'), function () {
                return $this->deleter ? [
                    'id' => $this->deleter->id,
                    'name' => $this->deleter->name,
                ] : null;
            }),

            // Timestamps
            'created_at' => $this->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at?->format('Y-m-d H:i:s'),
            'deleted_at' => $this->deleted_at?->format('Y-m-d H:i:s'),
            'deleted_at_formatted' => $this->deleted_at?->format('d/m/Y H:i'),

            // Permission flag untuk frontend
            'can_tindak_lanjut' => $this->determinePermissions()[0],
            'can_disposisi' => $this->determinePermissions()[1],
        ];
    }

    /**
     * Tentukan izin aksi Tindak Lanjut dan Disposisi untuk jadwal ini.
     * Mengembalikan array [can_tindak_lanjut, can_disposisi].
     */
    private function determinePermissions(): array
    {
        if (!Auth::check()) {
            return [false, false];
        }

        /** @var \App\Models\User $user */
        $user = Auth::user();

        // Aksi hanya berlaku untuk jadwal tentatif.
        if ($this->status !== Penjadwalan::STATUS_TENTATIF) {
            return [false, false];
        }

        // Tata Usaha hanya monitoring, tidak bisa tindak lanjut/disposisi.
        if ($user->isTU()) {
            return [false, false];
        }

        // Superadmin hanya monitoring pada halaman Tentatif.
        if ($user->isSuperAdmin()) {
            return [false, false];
        }

        // Jika tidak ada surat_masuk (Jadwal Custom)
        if (!$this->surat_masuk_id) {
            $canAction = $this->created_by === $user->id || $this->dihadiri_oleh_user_id === $user->id;
            return [$canAction, false];
        }

        if (!$this->isActiveSuratActor($user->id)) {
            return [false, false];
        }

        // Jika berhak, maka dia bisa Tindak Lanjut.
        // Untuk disposisi, cek aturan batas level Jabatannya (User::canDispose).
        return [true, $user->canDispose()];
    }

    private function isActiveSuratActor(int $userId): bool
    {
        if (!$this->surat_masuk_id) {
            return false;
        }

        $suratMasuk = $this->suratMasuk;
        if (!$suratMasuk instanceof SuratMasuk) {
            $suratMasuk = SuratMasuk::query()->find($this->surat_masuk_id, ['*']);
        }

        if (!$suratMasuk) {
            return false;
        }

        $tujuan = $suratMasuk->tujuans()
            ->where('tujuan_id', '=', $userId)
            ->where('is_primary', '=', true)
            ->where('is_tembusan', '=', false)
            ->first();

        if ($tujuan) {
            if ($tujuan->status_penerimaan !== \App\Models\SuratMasukTujuan::STATUS_DITERIMA) {
                return false;
            }

            $hasDisposed = DisposisiSurat::query()
                ->where('surat_masuk_id', '=', $suratMasuk->id)
                ->where('dari_user_id', '=', $userId)
                ->exists();

            if (!$hasDisposed) {
                return true;
            }
        }

        $lastDisposisiToUser = DisposisiSurat::query()
            ->where('surat_masuk_id', '=', $suratMasuk->id)
            ->where('ke_user_id', '=', $userId)
            ->latest()
            ->first();

        if (!$lastDisposisiToUser) {
            return false;
        }

        $tujuanDisposisi = $suratMasuk->tujuans()
            ->where('tujuan_id', '=', $userId)
            ->first();

        if (
            !$tujuanDisposisi
            || $tujuanDisposisi->status_penerimaan !== \App\Models\SuratMasukTujuan::STATUS_DITERIMA
        ) {
            return false;
        }

        $hasRedisposed = DisposisiSurat::query()
            ->where('surat_masuk_id', '=', $suratMasuk->id)
            ->where('dari_user_id', '=', $userId)
            ->exists();

        return !$hasRedisposed;
    }

    private function hasDisposisiChain(): bool
    {
        if (!$this->surat_masuk_id) {
            return false;
        }

        $suratMasuk = $this->suratMasuk;
        if (!$suratMasuk instanceof SuratMasuk) {
            $suratMasuk = SuratMasuk::query()->find($this->surat_masuk_id, ['*']);
        }

        if (!$suratMasuk) {
            return false;
        }

        if ($suratMasuk->relationLoaded('disposisis')) {
            return $suratMasuk->disposisis->isNotEmpty();
        }

        return $suratMasuk->disposisis()->exists();
    }

    private function resolveDisposisiRecipientLabel(): ?string
    {
        if (!$this->surat_masuk_id) {
            return null;
        }

        $suratMasuk = $this->suratMasuk;
        if (!$suratMasuk instanceof SuratMasuk) {
            $suratMasuk = SuratMasuk::query()
                ->with('disposisis.keUser.jabatanRelasi')
                ->find($this->surat_masuk_id, ['*']);
        }

        if (!$suratMasuk) {
            return null;
        }

        $disposisis = $suratMasuk->relationLoaded('disposisis')
            ? $suratMasuk->disposisis
            : $suratMasuk->disposisis()->with('keUser.jabatanRelasi')->get();

        /** @var \App\Models\DisposisiSurat|null $latestDisposisi */
        $latestDisposisi = $disposisis
            ->sortByDesc(fn(DisposisiSurat $disposisi) => $disposisi->created_at?->getTimestamp() ?? 0)
            ->first();

        if (!$latestDisposisi?->keUser) {
            return null;
        }

        return $this->formatDisposisiRecipientLabel($latestDisposisi->keUser);
    }

    /**
     * Format tujuan disposisi menjadi pola Jabatan - Unit.
     * Contoh: Kepala Bagian - Prokompim, Kepala Dinas - Kesehatan.
     */
    private function formatDisposisiRecipientLabel(User $user): ?string
    {
        $jabatan = trim((string) $user->jabatan_nama);
        $nama = trim((string) $user->name);

        if ($jabatan === '' && $nama === '') {
            return null;
        }

        if ($jabatan === '') {
            return $nama;
        }

        if ($nama === '') {
            return $jabatan;
        }

        $unit = preg_replace('/\s+/', ' ', $nama) ?? $nama;

        if (strcasecmp($jabatan, 'Kepala Bagian') === 0) {
            $unit = preg_replace('/^(kepala\s+bagian|kabag)\s+/i', '', $unit) ?? $unit;
        } elseif (strcasecmp($jabatan, 'Kepala Dinas') === 0) {
            $unit = preg_replace('/^(kepala\s+dinas|kadis)\s+/i', '', $unit) ?? $unit;
        }

        $unit = trim($unit);
        if ($unit === '') {
            return $jabatan;
        }

        // Fallback untuk nama seperti "Kepala RSUD ..." agar tetap terbaca wajar.
        if (str_starts_with(strtolower($unit), 'kepala ')) {
            $normalizedUnit = trim((string) preg_replace('/^kepala\s+/i', '', $unit));
            $unit = $normalizedUnit !== '' ? $normalizedUnit : $unit;
        }

        return "{$jabatan} - {$unit}";
    }
}
