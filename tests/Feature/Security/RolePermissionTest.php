<?php

namespace Tests\Feature\Security;

use App\Models\Jabatan;
use App\Models\Penjadwalan;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolePermissionTest extends TestCase
{
    use RefreshDatabase;

    private User $bupati;
    private User $sekda;
    private User $kabag1;
    private User $kabag2;
    private User $tu;

    protected function setUp(): void
    {
        parent::setUp();

        $j1 = Jabatan::factory()->create(['nama' => 'Bupati', 'level' => 1]);
        $j3 = Jabatan::factory()->create(['nama' => 'Sekda', 'level' => 3]);
        $j4 = Jabatan::factory()->create(['nama' => 'Kabag Umum', 'level' => 4]);
        $j4_2 = Jabatan::factory()->create(['nama' => 'Kabag Hukum', 'level' => 4]);
        $j7 = Jabatan::factory()->create(['nama' => 'TU', 'level' => 7]);

        $this->bupati = User::factory()->create(['role' => User::ROLE_PEJABAT, 'jabatan_id' => $j1->id, 'name' => 'Bupati']);
        $this->sekda = User::factory()->create(['role' => User::ROLE_PEJABAT, 'jabatan_id' => $j3->id, 'name' => 'Sekda']);
        $this->kabag1 = User::factory()->create(['role' => User::ROLE_PEJABAT, 'jabatan_id' => $j4->id, 'name' => 'Kabag 1']);
        $this->kabag2 = User::factory()->create(['role' => User::ROLE_PEJABAT, 'jabatan_id' => $j4_2->id, 'name' => 'Kabag 2']);
        $this->tu = User::factory()->create(['role' => User::ROLE_TU, 'jabatan_id' => $j7->id, 'name' => 'Staff TU']);
    }

    private function getPartialTentatif(User $user)
    {
        $response = $this->actingAs($user)->get(route('penjadwalan.tentatif.index'));
        $page = $response->viewData('page');
        $version = $page['version'] ?? null;

        return $this->actingAs($user)->getJson(route('penjadwalan.tentatif.index'), [
            'X-Inertia' => 'true',
            'X-Inertia-Partial-Data' => 'tentatif',
            'X-Inertia-Partial-Component' => 'Penjadwalan/Tentatif/Index',
            'X-Inertia-Version' => $version,
        ]);
    }

    public function test_bupati_can_monitor_all_schedules(): void
    {
        // Create a schedule for Kabag 1
        $surat = SuratMasuk::factory()->create(['created_by' => $this->tu->id, 'isi_ringkas' => 's1']);
        Penjadwalan::create([
            'surat_masuk_id' => $surat->id,
            'tanggal_agenda' => now()->addDay()->toDateString(),
            'waktu_mulai' => '08:00',
            'nama_kegiatan' => 'Rapat Kabag 1',
            'dihadiri_oleh_user_id' => $this->kabag1->id,
            'tempat' => 'Pendopo',
            'status' => Penjadwalan::STATUS_TENTATIF,
            'status_disposisi' => Penjadwalan::DISPOSISI_MENUNGGU,
        ]);

        $response = $this->getPartialTentatif($this->bupati);
        $response->assertOk();
        $response->assertJsonPath('props.tentatif.data.0.nama_kegiatan', 'Rapat Kabag 1');
    }

    public function test_kabag_cannot_monitor_unrelated_schedules(): void
    {
        // Create a schedule for Kabag 1 (involved)
        $surat1 = SuratMasuk::factory()->create(['created_by' => $this->tu->id, 'isi_ringkas' => 's1']);
        SuratMasukTujuan::factory()->create(['surat_masuk_id' => $surat1->id, 'tujuan_id' => $this->kabag1->id, 'status_penerimaan' => SuratMasukTujuan::STATUS_DITERIMA]);

        Penjadwalan::create([
            'surat_masuk_id' => $surat1->id,
            'tanggal_agenda' => now()->addDay()->toDateString(),
            'waktu_mulai' => '08:00',
            'nama_kegiatan' => 'Kegiatan Kabag 1',
            'dihadiri_oleh_user_id' => $this->kabag1->id,
            'tempat' => 'Pendopo 1',
            'status' => Penjadwalan::STATUS_TENTATIF,
            'status_disposisi' => Penjadwalan::DISPOSISI_MENUNGGU,
        ]);

        // Create a schedule for Kabag 2 (unrelated)
        $surat2 = SuratMasuk::factory()->create(['created_by' => $this->tu->id, 'isi_ringkas' => 's2']);
        Penjadwalan::create([
            'surat_masuk_id' => $surat2->id,
            'tanggal_agenda' => now()->addDay()->toDateString(),
            'waktu_mulai' => '09:00',
            'nama_kegiatan' => 'Kegiatan Kabag 2',
            'dihadiri_oleh_user_id' => $this->kabag2->id,
            'tempat' => 'Pendopo 2',
            'status' => Penjadwalan::STATUS_TENTATIF,
            'status_disposisi' => Penjadwalan::DISPOSISI_MENUNGGU,
        ]);

        $response = $this->getPartialTentatif($this->kabag1);
        $response->assertOk();
        $response->assertJsonCount(1, 'props.tentatif.data');
        $response->assertJsonPath('props.tentatif.data.0.nama_kegiatan', 'Kegiatan Kabag 1');
    }

    public function test_tu_can_monitor_schedules_they_created(): void
    {
        $surat = SuratMasuk::factory()->create(['created_by' => $this->tu->id, 'isi_ringkas' => 's1']);
        Penjadwalan::create([
            'surat_masuk_id' => $surat->id,
            'tanggal_agenda' => now()->addDay()->toDateString(),
            'waktu_mulai' => '08:00',
            'nama_kegiatan' => 'Rapat Penting',
            'dihadiri_oleh_user_id' => $this->kabag1->id,
            'tempat' => 'Pendopo',
            'status' => Penjadwalan::STATUS_TENTATIF,
            'status_disposisi' => Penjadwalan::DISPOSISI_MENUNGGU,
        ]);

        $response = $this->getPartialTentatif($this->tu);
        $response->assertOk();
        $response->assertJsonPath('props.tentatif.data.0.nama_kegiatan', 'Rapat Penting');
    }

    public function test_user_isolation_for_surat_masuk(): void
    {
        // Surat for Kabag 1
        $surat = SuratMasuk::factory()->create(['created_by' => $this->tu->id, 'isi_ringkas' => 'Rahasia Kabag 1']);
        SuratMasukTujuan::factory()->create([
            'surat_masuk_id' => $surat->id,
            'tujuan_id' => $this->kabag1->id,
            'status_penerimaan' => SuratMasukTujuan::STATUS_DITERIMA,
        ]);

        // Kabag 2 tries to view Kabag 1's surat in list
        $response = $this->actingAs($this->kabag2)->get(route('persuratan.surat-masuk.index'));
        $response->assertOk();
        $response->assertDontSee('Rahasia Kabag 1');

        // Try direct access
        $responseDirect = $this->actingAs($this->kabag2)->getJson(route('persuratan.surat-masuk.timeline', $surat->id));
        $responseDirect->assertStatus(404);
    }
}
