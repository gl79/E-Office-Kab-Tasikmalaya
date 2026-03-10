<?php

namespace Tests\Feature\Persuratan;

use App\Models\Jabatan;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\TimelineSurat;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class TimelineHistoryTest extends TestCase
{
    use RefreshDatabase;

    private User $tu;
    private User $bupati;
    private User $sekda;
    private SuratMasuk $surat;

    protected function setUp(): void
    {
        parent::setUp();

        $jabatanTu = Jabatan::factory()->create(['nama' => 'TU', 'level' => 7]);
        $jabatanBupati = Jabatan::factory()->create(['nama' => 'Bupati', 'level' => 1, 'can_dispose' => true]);
        $jabatanSekda = Jabatan::factory()->create(['nama' => 'Sekda', 'level' => 2, 'can_dispose' => true]);

        $this->tu = User::factory()->create(['role' => User::ROLE_TU, 'name' => 'Staff TU', 'jabatan_id' => $jabatanTu->id]);
        $this->bupati = User::factory()->create(['role' => User::ROLE_PEJABAT, 'name' => 'Bapak Bupati', 'jabatan_id' => $jabatanBupati->id]);
        $this->sekda = User::factory()->create(['role' => User::ROLE_PEJABAT, 'name' => 'Bapak Sekda', 'jabatan_id' => $jabatanSekda->id]);

        $this->surat = SuratMasuk::factory()->create([
            'created_by' => $this->tu->id,
            'isi_ringkas' => 'Test Timeline',
        ]);

        SuratMasukTujuan::factory()->create([
            'surat_masuk_id' => $this->surat->id,
            'tujuan_id' => $this->bupati->id,
            'status_penerimaan' => SuratMasukTujuan::STATUS_MENUNGGU_PENERIMAAN,
        ]);
    }

    public function test_timeline_records_major_actions(): void
    {
        // 1. Acceptance
        $this->actingAs($this->bupati)->post(route('persuratan.surat-masuk.terima', $this->surat->id));

        $this->assertDatabaseHas('timeline_surat', [
            'surat_masuk_id' => $this->surat->id,
            'user_id' => $this->bupati->id,
            'aksi' => TimelineSurat::AKSI_TERIMA,
            'keterangan' => "Surat diterima oleh {$this->bupati->name}",
        ]);

        // 2. Scheduling (MUST happen before disposisi because Bupati loses "actionable" status after disposing)
        $this->actingAs($this->bupati)->post(route('persuratan.surat-masuk.masukkan-jadwal', $this->surat->id));

        $this->assertDatabaseHas('timeline_surat', [
            'surat_masuk_id' => $this->surat->id,
            'user_id' => $this->bupati->id,
            'aksi' => TimelineSurat::AKSI_JADWALKAN,
            'keterangan' => "Surat dimasukkan ke Jadwal Tentatif oleh {$this->bupati->name}",
        ]);

        // 3. Disposition
        $this->actingAs($this->bupati)->post(route('persuratan.surat-masuk.disposisi', $this->surat->id), [
            'ke_user_id' => $this->sekda->id,
            'catatan' => 'Tindak lanjuti',
        ]);

        $this->assertDatabaseHas('timeline_surat', [
            'surat_masuk_id' => $this->surat->id,
            'user_id' => $this->bupati->id,
            'aksi' => TimelineSurat::AKSI_DISPOSISI,
            'keterangan' => "Bupati mendisposisi surat ke Sekda - Tindak lanjuti",
        ]);

        // 4. Verify order and count
        $timelines = TimelineSurat::where('surat_masuk_id', $this->surat->id)->orderBy('created_at')->get();
        $this->assertCount(3, $timelines);
        $this->assertEquals(TimelineSurat::AKSI_TERIMA, $timelines[0]->aksi);
        $this->assertEquals(TimelineSurat::AKSI_JADWALKAN, $timelines[1]->aksi);
        $this->assertEquals(TimelineSurat::AKSI_DISPOSISI, $timelines[2]->aksi);
    }
}
