<?php

namespace Tests\Feature\Persuratan;

use App\Models\IndeksSurat;
use App\Models\Jabatan;
use App\Models\JenisSurat;
use App\Models\Penjadwalan;
use App\Models\SifatSurat;
use App\Models\SuratMasuk;
use App\Models\SuratMasukTujuan;
use App\Models\TimelineSurat;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class SuratMasukWorkflowTest extends TestCase
{
    use RefreshDatabase;

    private User $tu;
    private User $pejabat;

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

        // Seed some master data
        IndeksSurat::factory()->create(['level' => 1]); // for indeks_berkas_id
        IndeksSurat::factory()->create(['level' => 3]); // for kode_klasifikasi_id
        JenisSurat::factory()->create();
    }

    public function test_tu_can_create_surat_masuk_with_valid_data(): void
    {
        Storage::fake('public');

        $indeksBerkas = IndeksSurat::where('level', 1)->first();
        $kodeKlasifikasi = IndeksSurat::where('level', 3)->first();
        $jenisSurat = JenisSurat::first();

        $data = [
            'tanggal_surat' => now()->toDateString(),
            'asal_surat' => 'Instansi Penguji',
            'tujuan' => [(string) $this->pejabat->id],
            'nomor_surat' => 'TEST/SURAT/001',
            'sifat' => array_keys(SifatSurat::getOptions())[0],
            'lampiran' => '1',
            'perihal' => 'Test Perihal',
            'isi_ringkas' => 'Isi ringkas test',
            'tanggal_diterima' => now()->toDateString(),
            'nomor_agenda' => '0001',
            'indeks_berkas_id' => (string) $indeksBerkas->id,
            'jenis_surat_id' => (string) $jenisSurat->id,
            'kode_klasifikasi_id' => (string) $kodeKlasifikasi->id,
            'staff_pengolah_id' => (string) $this->tu->id,
            'tanggal_diteruskan' => now()->toDateString(),
            'file' => UploadedFile::fake()->create('surat.pdf', 500, 'application/pdf'),
        ];

        $response = $this->actingAs($this->tu)
            ->from(route('persuratan.surat-masuk.index'))
            ->post(route('persuratan.surat-masuk.store'), $data);

        $response->assertRedirect(route('persuratan.surat-masuk.index'));
        $this->assertDatabaseHas('surat_masuks', [
            'nomor_surat' => 'TEST/SURAT/001',
            'perihal' => 'Test Perihal',
            'status' => SuratMasuk::STATUS_BARU,
        ]);

        $surat = SuratMasuk::where('nomor_surat', 'TEST/SURAT/001')->first();
        $this->assertDatabaseHas('surat_masuk_tujuans', [
            'surat_masuk_id' => $surat->id,
            'tujuan_id' => $this->pejabat->id,
        ]);

        $this->assertNotNull($surat->file_path);
        $this->assertTrue(Storage::disk('public')->exists($surat->file_path));
    }

    public function test_surat_masuk_fails_if_required_data_is_missing(): void
    {
        $response = $this->actingAs($this->tu)
            ->from(route('persuratan.surat-masuk.index'))
            ->post(route('persuratan.surat-masuk.store'), []);

        $response->assertSessionHasErrors([
            'tanggal_surat',
            'asal_surat',
            'tujuan',
            'nomor_surat',
            'sifat',
            'perihal',
            'tanggal_diterima'
        ]);
    }

    public function test_nomor_agenda_cannot_be_manipulated_from_request(): void
    {
        Storage::fake('public');

        $data = [
            'tanggal_surat' => now()->toDateString(),
            'asal_surat' => 'Instansi Penguji',
            'tujuan' => [(string) $this->pejabat->id],
            'nomor_surat' => 'TEST/SURAT/002',
            'sifat' => array_keys(SifatSurat::getOptions())[0],
            'lampiran' => '0',
            'perihal' => 'Test Perihal',
            'isi_ringkas' => 'Isi ringkas test nomor agenda',
            'tanggal_diterima' => now()->toDateString(),
            'nomor_agenda' => 'MANIPULATED_AGENDA',
            'indeks_berkas_id' => (string) IndeksSurat::where('level', 1)->first()->id,
            'jenis_surat_id' => (string) JenisSurat::first()->id,
            'kode_klasifikasi_id' => (string) IndeksSurat::where('level', 3)->first()->id,
            'staff_pengolah_id' => (string) $this->tu->id,
            'tanggal_diteruskan' => now()->toDateString(),
            'file' => UploadedFile::fake()->create('surat.pdf', 500, 'application/pdf'),
        ];

        $this->actingAs($this->tu)
            ->from(route('persuratan.surat-masuk.index'))
            ->post(route('persuratan.surat-masuk.store'), $data);

        $surat = SuratMasuk::where('nomor_surat', 'TEST/SURAT/002')->first();
        $this->assertNotNull($surat, "Surat was not created.");
        $this->assertNotEquals('MANIPULATED_AGENDA', $surat->nomor_agenda);
        $this->assertStringStartsWith('SM/', $surat->nomor_agenda);
    }

    public function test_surat_only_can_be_scheduled_once(): void
    {
        $surat = SuratMasuk::factory()->create(['created_by' => $this->tu->id, 'isi_ringkas' => 'test']);
        SuratMasukTujuan::factory()->create([
            'surat_masuk_id' => $surat->id,
            'tujuan_id' => $this->pejabat->id,
            'status_penerimaan' => SuratMasukTujuan::STATUS_DITERIMA,
        ]);

        // First scheduling
        $response1 = $this->actingAs($this->pejabat)
            ->from(route('persuratan.surat-masuk.index'))
            ->post(route('persuratan.surat-masuk.masukkan-jadwal', $surat->id));

        $response1->assertRedirect();
        $response1->assertSessionHas('success');
        $this->assertDatabaseCount('penjadwalan', 1);

        // Second scheduling attempt
        $response2 = $this->actingAs($this->pejabat)
            ->from(route('persuratan.surat-masuk.index'))
            ->post(route('persuratan.surat-masuk.masukkan-jadwal', $surat->id));

        $response2->assertRedirect();
        $response2->assertSessionHas('error', 'Surat Masuk ini sudah dimasukkan ke Jadwal.');
        $this->assertDatabaseCount('penjadwalan', 1);
    }

    public function test_initial_status_is_baru(): void
    {
        $surat = SuratMasuk::factory()->create(['created_by' => $this->tu->id, 'isi_ringkas' => 'test']);
        $this->assertEquals(SuratMasuk::STATUS_BARU, $surat->status);
    }
}
