<?php

namespace Tests\Feature\Persuratan;

use App\Models\DisposisiSurat;
use App\Models\Jabatan;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\TimelineSurat;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DisposisiFlowTest extends TestCase
{
    use RefreshDatabase;

    private User $tu;
    private User $bupati;
    private User $sekda;
    private User $kabag;
    private User $staff;
    private SuratMasuk $surat;

    protected function setUp(): void
    {
        parent::setUp();

        $jTU = Jabatan::factory()->create(['nama' => 'TU', 'level' => 7, 'can_dispose' => false]);
        $jBupati = Jabatan::factory()->create(['nama' => 'Bupati', 'level' => 1, 'can_dispose' => true]);
        $jSekda = Jabatan::factory()->create(['nama' => 'Sekda', 'level' => 3, 'can_dispose' => true]);
        $jKabag = Jabatan::factory()->create(['nama' => 'Kabag', 'level' => 4, 'can_dispose' => true]);
        $jStaff = Jabatan::factory()->create(['nama' => 'Staff', 'level' => 7, 'can_dispose' => false]);

        $this->tu = User::factory()->create(['role' => User::ROLE_TU, 'jabatan_id' => $jTU->id]);
        $this->bupati = User::factory()->create(['role' => User::ROLE_PEJABAT, 'jabatan_id' => $jBupati->id]);
        $this->sekda = User::factory()->create(['role' => User::ROLE_PEJABAT, 'jabatan_id' => $jSekda->id]);
        $this->kabag = User::factory()->create(['role' => User::ROLE_PEJABAT, 'jabatan_id' => $jKabag->id]);
        $this->staff = User::factory()->create(['role' => User::ROLE_PEJABAT, 'jabatan_id' => $jStaff->id]);

        $this->surat = SuratMasuk::factory()->create([
            'created_by' => $this->tu->id,
            'isi_ringkas' => 'Isi ringkas test disposisi',
            'status' => SuratMasuk::STATUS_BARU,
        ]);

        // Adress to Bupati as primary
        SuratMasukTujuan::factory()->create([
            'surat_masuk_id' => $this->surat->id,
            'tujuan_id' => $this->bupati->id,
            'is_primary' => true,
            'status_penerimaan' => SuratMasukTujuan::STATUS_DITERIMA,
        ]);
    }

    public function test_bupati_can_dispose_to_sekda(): void
    {
        $data = [
            'ke_user_id' => $this->sekda->id,
            'isi_disposisi' => 'Segera tindak lanjuti',
            'sifat_disposisi' => 'Segera',
            'catatan' => 'Catatan bupati',
        ];

        $response = $this->actingAs($this->bupati)
            ->from(route('persuratan.surat-masuk.index'))
            ->post(route('persuratan.surat-masuk.disposisi', $this->surat->id), $data);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('disposisi_surat', [
            'surat_masuk_id' => $this->surat->id,
            'dari_user_id' => $this->bupati->id,
            'ke_user_id' => $this->sekda->id,
        ]);

        $this->assertDatabaseHas('timeline_surat', [
            'surat_masuk_id' => $this->surat->id,
            'user_id' => $this->bupati->id,
            'aksi' => TimelineSurat::AKSI_DISPOSISI,
        ]);

        // Sekda should now be in tujuans
        $this->assertDatabaseHas('surat_masuk_tujuans', [
            'surat_masuk_id' => $this->surat->id,
            'tujuan_id' => $this->sekda->id,
        ]);
    }

    public function test_level_7_cannot_dispose(): void
    {
        $data = [
            'ke_user_id' => $this->kabag->id,
        ];

        $response = $this->actingAs($this->staff)
            ->post(route('persuratan.surat-masuk.disposisi', $this->surat->id), $data);

        // App masks 403 as 404
        $response->assertStatus(404);
    }

    public function test_disposisi_chain_works(): void
    {
        // 1. Bupati -> Sekda
        $this->actingAs($this->bupati)->post(route('persuratan.surat-masuk.disposisi', $this->surat->id), [
            'ke_user_id' => $this->sekda->id,
        ]);

        // 2. Sekda accepts
        $this->actingAs($this->sekda)->post(route('persuratan.surat-masuk.terima', $this->surat->id));

        // 3. Sekda -> Kabag
        $response = $this->actingAs($this->sekda)->post(route('persuratan.surat-masuk.disposisi', $this->surat->id), [
            'ke_user_id' => $this->kabag->id,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('disposisi_surat', [
            'dari_user_id' => $this->sekda->id,
            'ke_user_id' => $this->kabag->id,
        ]);
    }

    public function test_level_6_cannot_redispose_to_lower_level(): void
    {
        // Create a level 6 jabatan
        $jLevel6 = Jabatan::factory()->create(['nama' => 'Kasubag', 'level' => 6, 'can_dispose' => true]);
        $userLevel6 = User::factory()->create(['role' => User::ROLE_PEJABAT, 'jabatan_id' => $jLevel6->id]);

        // Dispose chain from Bupati down to level 6
        // 1. Bupati -> Sekda
        $this->actingAs($this->bupati)->post(route('persuratan.surat-masuk.disposisi', $this->surat->id), [
            'ke_user_id' => $this->sekda->id,
        ]);
        // 2. Sekda -> Kabag (level 4)
        $this->actingAs($this->sekda)->post(route('persuratan.surat-masuk.terima', $this->surat->id));
        $this->actingAs($this->sekda)->post(route('persuratan.surat-masuk.disposisi', $this->surat->id), [
            'ke_user_id' => $this->kabag->id,
        ]);
        // 3. Kabag -> Level 6
        $this->actingAs($this->kabag)->post(route('persuratan.surat-masuk.terima', $this->surat->id));
        $this->actingAs($this->kabag)->post(route('persuratan.surat-masuk.disposisi', $this->surat->id), [
            'ke_user_id' => $userLevel6->id,
        ]);

        // 4. Level 6 accepts
        /** @var User $userLevel6 */
        $this->actingAs($userLevel6)->post(route('persuratan.surat-masuk.terima', $this->surat->id));

        // 5. Level 6 mencoba redisposisi ke level di bawahnya (harus ditolak)
        /** @var User $userLevel6 */
        $response = $this->actingAs($userLevel6)->post(route('persuratan.surat-masuk.disposisi', $this->surat->id), [
            'ke_user_id' => $this->staff->id,
        ]);

        // App masks 403 as 404
        $response->assertStatus(404);

        $this->assertDatabaseMissing('disposisi_surat', [
            'surat_masuk_id' => $this->surat->id,
            'dari_user_id' => $userLevel6->id,
            'ke_user_id' => $this->staff->id,
        ]);
    }
}
