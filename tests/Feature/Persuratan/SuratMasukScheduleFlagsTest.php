<?php

namespace Tests\Feature\Persuratan;

use App\Models\Penjadwalan;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\User;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Tests\TestCase;

class SuratMasukScheduleFlagsTest extends TestCase
{
    use RefreshDatabase;

    public function test_bupati_melihat_can_schedule_true_untuk_surat_target_yang_belum_dijadwalkan(): void
    {
        $bupati = $this->makeUser(User::ROLE_PIMPINAN, 'Bupati', 'Bupati');
        $creator = $this->makeUser(User::ROLE_TU, 'TU', 'Tata Usaha');

        $surat = $this->makeSuratMasuk($creator);
        SuratMasukTujuan::create([
            'surat_masuk_id' => $surat->id,
            'tujuan_id' => $bupati->id,
            'tujuan' => $bupati->name,
            'nomor_agenda' => 'SM/0099/' . date('Y'),
        ]);

        $items = $this->fetchSuratMasukItems($bupati);
        $item = collect($items)->firstWhere('id', $surat->id);

        $this->assertNotNull($item);
        $this->assertSame('SM/0099/' . date('Y'), $item['nomor_agenda']);
        $this->assertTrue((bool) ($item['can_schedule'] ?? false));
        $this->assertFalse((bool) ($item['can_finalize_schedule'] ?? false));
        $this->assertFalse((bool) ($item['can_view_schedule'] ?? false));
    }

    public function test_bupati_melihat_can_view_schedule_true_setelah_surat_sudah_dijadwalkan(): void
    {
        $bupati = $this->makeUser(User::ROLE_PIMPINAN, 'Bupati', 'Bupati');
        $delegasi = $this->makeUser(User::ROLE_USER, 'Delegasi', 'Staf');
        $creator = $this->makeUser(User::ROLE_TU, 'TU', 'Tata Usaha');

        $surat = $this->makeSuratMasuk($creator);
        SuratMasukTujuan::create([
            'surat_masuk_id' => $surat->id,
            'tujuan_id' => $bupati->id,
            'tujuan' => $bupati->name,
            'nomor_agenda' => 'SM/0100/' . date('Y'),
        ]);

        Penjadwalan::create([
            'surat_masuk_id' => $surat->id,
            'tanggal_agenda' => now()->addDay()->toDateString(),
            'waktu_mulai' => '08:00:00',
            'waktu_selesai' => '09:00:00',
            'sampai_selesai' => false,
            'nama_kegiatan' => $surat->perihal,
            'lokasi_type' => Penjadwalan::LOKASI_DALAM_DAERAH,
            'kode_wilayah' => '32.06.01.0001',
            'tempat' => 'Pendopo',
            'status' => Penjadwalan::STATUS_TENTATIF,
            'status_disposisi' => Penjadwalan::DISPOSISI_DIWAKILKAN,
            'dihadiri_oleh' => $delegasi->name,
            'dihadiri_oleh_user_id' => $delegasi->id,
        ]);

        $items = $this->fetchSuratMasukItems($bupati);
        $item = collect($items)->firstWhere('id', $surat->id);

        $this->assertNotNull($item);
        $this->assertFalse((bool) ($item['can_schedule'] ?? false));
        $this->assertFalse((bool) ($item['can_finalize_schedule'] ?? false));
        $this->assertTrue((bool) ($item['can_view_schedule'] ?? false));
    }

    public function test_penerima_delegasi_melihat_can_finalize_schedule_true(): void
    {
        $delegasi = $this->makeUser(User::ROLE_USER, 'Delegasi', 'Staf');
        $creator = $this->makeUser(User::ROLE_TU, 'TU', 'Tata Usaha');

        $surat = $this->makeSuratMasuk($creator);
        SuratMasukTujuan::create([
            'surat_masuk_id' => $surat->id,
            'tujuan_id' => $delegasi->id,
            'tujuan' => $delegasi->name,
            'nomor_agenda' => 'SM/0101/' . date('Y'),
        ]);

        Penjadwalan::create([
            'surat_masuk_id' => $surat->id,
            'tanggal_agenda' => now()->addDay()->toDateString(),
            'waktu_mulai' => '10:00:00',
            'waktu_selesai' => '11:00:00',
            'sampai_selesai' => false,
            'nama_kegiatan' => $surat->perihal,
            'lokasi_type' => Penjadwalan::LOKASI_DALAM_DAERAH,
            'kode_wilayah' => '32.06.01.0001',
            'tempat' => 'Ruang Rapat',
            'status' => Penjadwalan::STATUS_TENTATIF,
            'status_disposisi' => Penjadwalan::DISPOSISI_DIWAKILKAN,
            'dihadiri_oleh' => $delegasi->name,
            'dihadiri_oleh_user_id' => $delegasi->id,
        ]);

        $items = $this->fetchSuratMasukItems($delegasi);
        $item = collect($items)->firstWhere('id', $surat->id);

        $this->assertNotNull($item);
        $this->assertFalse((bool) ($item['can_schedule'] ?? false));
        $this->assertTrue((bool) ($item['can_finalize_schedule'] ?? false));
        $this->assertFalse((bool) ($item['can_view_schedule'] ?? false));
    }

    public function test_superadmin_melihat_flag_penjadwalan_sesuai_kondisi_surat(): void
    {
        $superadmin = $this->makeUser(User::ROLE_SUPERADMIN, 'Superadmin', 'Administrator');
        $creator = $this->makeUser(User::ROLE_TU, 'TU', 'Tata Usaha');

        $suratBelumJadwal = $this->makeSuratMasuk($creator);
        $suratSudahJadwal = $this->makeSuratMasuk($creator);

        Penjadwalan::create([
            'surat_masuk_id' => $suratSudahJadwal->id,
            'tanggal_agenda' => now()->addDay()->toDateString(),
            'waktu_mulai' => '09:00:00',
            'waktu_selesai' => '10:00:00',
            'sampai_selesai' => false,
            'nama_kegiatan' => $suratSudahJadwal->perihal,
            'lokasi_type' => Penjadwalan::LOKASI_DALAM_DAERAH,
            'kode_wilayah' => '32.06.01.0001',
            'tempat' => 'Pendopo',
            'status' => Penjadwalan::STATUS_TENTATIF,
            'status_disposisi' => Penjadwalan::DISPOSISI_MENUNGGU,
            'dihadiri_oleh' => 'Bupati',
            'dihadiri_oleh_user_id' => null,
        ]);

        $items = $this->fetchSuratMasukItems($superadmin);
        $itemBelum = collect($items)->firstWhere('id', $suratBelumJadwal->id);
        $itemSudah = collect($items)->firstWhere('id', $suratSudahJadwal->id);

        $this->assertNotNull($itemBelum);
        $this->assertTrue((bool) ($itemBelum['can_schedule'] ?? false));
        $this->assertFalse((bool) ($itemBelum['can_finalize_schedule'] ?? false));
        $this->assertFalse((bool) ($itemBelum['can_view_schedule'] ?? false));

        $this->assertNotNull($itemSudah);
        $this->assertFalse((bool) ($itemSudah['can_schedule'] ?? false));
        $this->assertTrue((bool) ($itemSudah['can_finalize_schedule'] ?? false));
        $this->assertFalse((bool) ($itemSudah['can_view_schedule'] ?? false));
    }

    public function test_bupati_melihat_can_view_schedule_true_pada_jadwal_definitif(): void
    {
        $bupati = $this->makeUser(User::ROLE_PIMPINAN, 'Bupati', 'Bupati');
        $creator = $this->makeUser(User::ROLE_TU, 'TU', 'Tata Usaha');

        $surat = $this->makeSuratMasuk($creator);
        SuratMasukTujuan::create([
            'surat_masuk_id' => $surat->id,
            'tujuan_id' => $bupati->id,
            'tujuan' => $bupati->name,
            'nomor_agenda' => 'SM/0102/' . date('Y'),
        ]);

        $this->createPenjadwalan($surat, Penjadwalan::STATUS_DEFINITIF, $bupati->id, $bupati->name);

        $items = $this->fetchSuratMasukItems($bupati);
        $item = collect($items)->firstWhere('id', $surat->id);

        $this->assertNotNull($item);
        $this->assertFalse((bool) ($item['can_schedule'] ?? false));
        $this->assertFalse((bool) ($item['can_finalize_schedule'] ?? false));
        $this->assertTrue((bool) ($item['can_view_schedule'] ?? false));
    }

    public function test_superadmin_melihat_can_view_schedule_true_pada_jadwal_definitif(): void
    {
        $superadmin = $this->makeUser(User::ROLE_SUPERADMIN, 'Superadmin', 'Administrator');
        $creator = $this->makeUser(User::ROLE_TU, 'TU', 'Tata Usaha');

        $surat = $this->makeSuratMasuk($creator);
        $this->createPenjadwalan($surat, Penjadwalan::STATUS_DEFINITIF, null, 'Bupati');

        $items = $this->fetchSuratMasukItems($superadmin);
        $item = collect($items)->firstWhere('id', $surat->id);

        $this->assertNotNull($item);
        $this->assertFalse((bool) ($item['can_schedule'] ?? false));
        $this->assertFalse((bool) ($item['can_finalize_schedule'] ?? false));
        $this->assertTrue((bool) ($item['can_view_schedule'] ?? false));
    }

    public function test_penerima_delegasi_tidak_memiliki_flag_aksi_pada_jadwal_definitif(): void
    {
        $delegasi = $this->makeUser(User::ROLE_USER, 'Delegasi', 'Staf');
        $creator = $this->makeUser(User::ROLE_TU, 'TU', 'Tata Usaha');

        $surat = $this->makeSuratMasuk($creator);
        SuratMasukTujuan::create([
            'surat_masuk_id' => $surat->id,
            'tujuan_id' => $delegasi->id,
            'tujuan' => $delegasi->name,
            'nomor_agenda' => 'SM/0103/' . date('Y'),
        ]);

        $this->createPenjadwalan($surat, Penjadwalan::STATUS_DEFINITIF, $delegasi->id, $delegasi->name);

        $items = $this->fetchSuratMasukItems($delegasi);
        $item = collect($items)->firstWhere('id', $surat->id);

        $this->assertNotNull($item);
        $this->assertFalse((bool) ($item['can_schedule'] ?? false));
        $this->assertFalse((bool) ($item['can_finalize_schedule'] ?? false));
        $this->assertFalse((bool) ($item['can_view_schedule'] ?? false));
    }

    private function fetchSuratMasukItems(User $user): array
    {
        $inertiaVersion = app(HandleInertiaRequests::class)
            ->version(Request::create(route('persuratan.surat-masuk.index'), 'GET'));

        $response = $this->actingAs($user)->get(route('persuratan.surat-masuk.index'), [
            'X-Inertia' => 'true',
            'X-Inertia-Version' => $inertiaVersion,
            'X-Requested-With' => 'XMLHttpRequest',
            'X-Inertia-Partial-Component' => 'Persuratan/SuratMasuk/Index',
            'X-Inertia-Partial-Data' => 'suratMasuk',
        ]);

        $response->assertOk();
        $response->assertHeader('X-Inertia', 'true');
        $response->assertJsonPath('component', 'Persuratan/SuratMasuk/Index');

        return $response->json('props.suratMasuk') ?? [];
    }

    private function makeUser(string $role, string $name, ?string $jabatan = null): User
    {
        return User::factory()->create([
            'name' => $name,
            'username' => Str::slug($name) . '_' . Str::lower(Str::random(4)),
            'role' => $role,
            'jabatan' => $jabatan,
            'password_changed_at' => now(),
        ]);
    }

    private function makeSuratMasuk(User $creator): SuratMasuk
    {
        return SuratMasuk::create([
            'nomor_agenda' => 'SM/' . str_pad((string) random_int(1, 9999), 4, '0', STR_PAD_LEFT) . '/' . date('Y'),
            'tanggal_diterima' => now()->toDateString(),
            'tanggal_surat' => now()->toDateString(),
            'asal_surat' => 'Instansi Uji',
            'nomor_surat' => 'NS-' . Str::upper(Str::random(8)),
            'sifat' => 'biasa',
            'lampiran' => 0,
            'perihal' => 'Undangan Kegiatan Uji',
            'isi_ringkas' => 'Ringkasan isi surat uji.',
            'created_by' => $creator->id,
            'updated_by' => $creator->id,
        ]);
    }

    private function createPenjadwalan(
        SuratMasuk $surat,
        string $status,
        ?int $dihadiriOlehUserId = null,
        ?string $dihadiriOleh = null
    ): Penjadwalan {
        return Penjadwalan::create([
            'surat_masuk_id' => $surat->id,
            'tanggal_agenda' => now()->addDay()->toDateString(),
            'waktu_mulai' => '09:00:00',
            'waktu_selesai' => '10:00:00',
            'sampai_selesai' => false,
            'nama_kegiatan' => $surat->perihal,
            'lokasi_type' => Penjadwalan::LOKASI_DALAM_DAERAH,
            'kode_wilayah' => '32.06.01.0001',
            'tempat' => 'Pendopo',
            'status' => $status,
            'status_disposisi' => Penjadwalan::DISPOSISI_DIWAKILKAN,
            'dihadiri_oleh' => $dihadiriOleh,
            'dihadiri_oleh_user_id' => $dihadiriOlehUserId,
        ]);
    }
}
