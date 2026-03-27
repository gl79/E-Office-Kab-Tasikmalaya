<?php

namespace Tests\Feature\Persuratan;

use App\Models\Jabatan;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\TimelineSurat;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SuratMasukStatusTest extends TestCase
{
    use RefreshDatabase;

    private User $tu;
    private User $pejabat;
    private SuratMasuk $surat;

    protected function setUp(): void
    {
        parent::setUp();

        $jabatanTu = Jabatan::factory()->create(['nama' => 'Tata Usaha', 'level' => 7]);
        $jabatanPejabat = Jabatan::factory()->create(['nama' => 'Bupati', 'level' => 1]);

        $this->tu = User::factory()->create([
            'role' => User::ROLE_TU,
            'jabatan_id' => $jabatanTu->id,
        ]);

        $this->pejabat = User::factory()->create([
            'role' => User::ROLE_PEJABAT,
            'jabatan_id' => $jabatanPejabat->id,
        ]);

        $this->surat = SuratMasuk::factory()->create([
            'created_by' => $this->tu->id,
            'isi_ringkas' => 'Isi ringkas test status',
            'status' => SuratMasuk::STATUS_BARU,
        ]);

        SuratMasukTujuan::factory()->create([
            'surat_masuk_id' => $this->surat->id,
            'tujuan_id' => $this->pejabat->id,
            'status_penerimaan' => SuratMasukTujuan::STATUS_MENUNGGU_PENERIMAAN,
        ]);
    }

    public function test_pejabat_can_accept_surat_masuk(): void
    {
        $response = $this->actingAs($this->pejabat)
            ->from(route('persuratan.surat-masuk.index'))
            ->post(route('persuratan.surat-masuk.terima', $this->surat->id));

        $response->assertRedirect(route('persuratan.surat-masuk.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('surat_masuk_tujuans', [
            'surat_masuk_id' => $this->surat->id,
            'tujuan_id' => $this->pejabat->id,
            'status_penerimaan' => SuratMasukTujuan::STATUS_DITERIMA,
        ]);

        $this->assertDatabaseHas('timeline_surat', [
            'surat_masuk_id' => $this->surat->id,
            'user_id' => $this->pejabat->id,
            'aksi' => TimelineSurat::AKSI_TERIMA,
        ]);
    }

    public function test_pejabat_level_7_can_accept_surat_masuk(): void
    {
        $jabatanLevel7 = Jabatan::factory()->create([
            'nama' => 'Kepala Bagian Umum',
            'level' => 7,
            'can_dispose' => false,
        ]);

        /** @var \App\Models\User $pejabatLevel7 */
        $pejabatLevel7 = User::factory()->create([
            'role' => User::ROLE_PEJABAT,
            'jabatan_id' => $jabatanLevel7->id,
        ]);

        $suratLevel7 = SuratMasuk::factory()->create([
            'created_by' => $this->tu->id,
            'status' => SuratMasuk::STATUS_BARU,
        ]);

        SuratMasukTujuan::factory()->create([
            'surat_masuk_id' => $suratLevel7->id,
            'tujuan_id' => $pejabatLevel7->id,
            'is_primary' => true,
            'is_tembusan' => false,
            'status_penerimaan' => SuratMasukTujuan::STATUS_MENUNGGU_PENERIMAAN,
        ]);

        $response = $this->actingAs($pejabatLevel7)
            ->from(route('persuratan.surat-masuk.index'))
            ->post(route('persuratan.surat-masuk.terima', $suratLevel7->id));

        $response->assertRedirect(route('persuratan.surat-masuk.index'));
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('surat_masuk_tujuans', [
            'surat_masuk_id' => $suratLevel7->id,
            'tujuan_id' => $pejabatLevel7->id,
            'status_penerimaan' => SuratMasukTujuan::STATUS_DITERIMA,
        ]);
    }

    public function test_surat_status_changes_to_diproses_after_first_acceptance(): void
    {
        // Initial status is baru
        $this->assertEquals(SuratMasuk::STATUS_BARU, $this->surat->status);

        // Pejabat accepts
        $this->actingAs($this->pejabat)->post(route('persuratan.surat-masuk.terima', $this->surat->id));

        $this->surat->refresh();
        $this->assertEquals(SuratMasuk::STATUS_DIPROSES, $this->surat->status);
    }

    public function test_tu_cannot_accept_surat_not_addressed_to_them(): void
    {
        $response = $this->actingAs($this->tu)->post(route('persuratan.surat-masuk.terima', $this->surat->id));

        // App masks Forbidden (403) as NotFound (404) in bootstrap/app.php
        $response->assertStatus(404);
    }
}
