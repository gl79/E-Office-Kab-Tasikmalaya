<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WilayahDesaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('wilayah_desa')->delete();

        // Build normalized kecamatan name → kode mapping from DB
        $kecamatanMap = [];
        $rows = DB::table('wilayah_kecamatan')
            ->where('provinsi_kode', '32')
            ->where('kabupaten_kode', '06')
            ->select('kode', 'nama')
            ->get();

        foreach ($rows as $row) {
            $key = strtolower(str_replace(' ', '', $row->nama));
            $kecamatanMap[$key] = $row->kode;
        }

        // Static desa data from API (https://geoentry.tasikmalayakab.go.id/api/desa)
        $apiData = $this->getDesaData();

        // Group by kecamatan, assign kode desa (2001, 2002, ...)
        $grouped = [];
        foreach ($apiData as $item) {
            $grouped[$item['kecamatan']][] = $item;
        }

        $now = now();
        $allData = [];

        foreach ($grouped as $kecNama => $desaList) {
            $key = strtolower(str_replace(' ', '', $kecNama));
            $kecKode = $kecamatanMap[$key] ?? null;

            if (!$kecKode) {
                throw new \RuntimeException("Kecamatan tidak ditemukan di DB: {$kecNama} (key: {$key})");
            }

            $code = 2001;
            foreach ($desaList as $desa) {
                $allData[] = [
                    'provinsi_kode' => '32',
                    'kabupaten_kode' => '06',
                    'kecamatan_kode' => $kecKode,
                    'kode' => str_pad($code, 4, '0', STR_PAD_LEFT),
                    'nama' => $desa['nama'],
                    'latitude' => $desa['latitude'],
                    'longitude' => $desa['longitude'],
                    'alamat' => $desa['alamat'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
                $code++;
            }
        }

        // Insert in chunks to avoid memory issues
        foreach (array_chunk($allData, 100) as $chunk) {
            DB::table('wilayah_desa')->insert($chunk);
        }
    }

    /**
     * Data desa statis dari API GeoEntry Kab. Tasikmalaya.
     * Di-generate otomatis, JANGAN edit manual.
     */
    private function getDesaData(): array
    {
        return [
                // Bantarkalong
                ['nama' => 'Hegarwangi', 'latitude' => -7.6202359, 'longitude' => 108.1100152, 'alamat' => 'Jl. Pemusa, Hegarwangi, Kec. Bantarkalong, Kabupaten Tasikmalaya, Jawa Barat 46187', 'kecamatan' => 'Bantarkalong'],
                ['nama' => 'Pamijahan', 'latitude' => -7.5700048, 'longitude' => 108.0849386, 'alamat' => 'Pamijahan, Kec. Bantarkalong, Kabupaten Tasikmalaya, Jawa Barat 46187', 'kecamatan' => 'Bantarkalong'],
                ['nama' => 'Parakanhonje', 'latitude' => -7.5989689, 'longitude' => 108.1098419, 'alamat' => 'Parakanhonje, Kec. Bantarkalong, Kabupaten Tasikmalaya, Jawa Barat 46187', 'kecamatan' => 'Bantarkalong'],
                ['nama' => 'Simpang', 'latitude' => -7.6287004, 'longitude' => 108.1050774, 'alamat' => 'Simpang, Kec. Bantarkalong, Kabupaten Tasikmalaya, Jawa Barat 46187', 'kecamatan' => 'Bantarkalong'],
                ['nama' => 'Sirnagalih', 'latitude' => -7.6236265, 'longitude' => 108.0722782, 'alamat' => 'Sirnagalih, Kec. Bantarkalong, Kabupaten Tasikmalaya, Jawa Barat 46187', 'kecamatan' => 'Bantarkalong'],
                ['nama' => 'Sukamaju', 'latitude' => -7.5399613, 'longitude' => 108.0939939, 'alamat' => 'Sukamaju, Kec. Bantarkalong, Kabupaten Tasikmalaya, Jawa Barat 46187', 'kecamatan' => 'Bantarkalong'],
                ['nama' => 'Wakap', 'latitude' => -7.5238835, 'longitude' => 108.0838453, 'alamat' => 'Wakap, Kec. Bantarkalong, Kabupaten Tasikmalaya, Jawa Barat 46187', 'kecamatan' => 'Bantarkalong'],
                ['nama' => 'Wangunsari', 'latitude' => -7.5406323, 'longitude' => 108.046225, 'alamat' => 'Jln, Wangunsari, Kec. Bantarkalong, Kabupaten Tasikmalaya, Jawa Barat 4618', 'kecamatan' => 'Bantarkalong'],

                // Bojongasih
                ['nama' => 'Bojongasih', 'latitude' => -7.5810017, 'longitude' => 108.1307327, 'alamat' => 'Bojongasih, Kec. Bojongasih, Kabupaten Tasikmalaya, Jawa Barat 46475', 'kecamatan' => 'Bojongasih'],
                ['nama' => 'Cikadongdong', 'latitude' => -7.5501754, 'longitude' => 108.1281797, 'alamat' => 'Cikadongdong, Kec. Bojongasih, Kabupaten Tasikmalaya, Jawa Barat 46475', 'kecamatan' => 'Bojongasih'],
                ['nama' => 'Girijaya', 'latitude' => -7.5729967, 'longitude' => 108.1314913, 'alamat' => 'Kp. Cisepet, Girijaya, Kec. Bojongasih, Kabupaten Tasikmalaya, Jawa Barat 46475', 'kecamatan' => 'Bojongasih'],
                ['nama' => 'Mertajaya', 'latitude' => -7.5662121, 'longitude' => 108.1041331, 'alamat' => 'Mertajaya, Kec. Bojongasih, Kabupaten Tasikmalaya, Jawa Barat 46475', 'kecamatan' => 'Bojongasih'],
                ['nama' => 'Sindangsari', 'latitude' => -7.5420952, 'longitude' => 108.1487961, 'alamat' => 'Sindangsari, Kec. Bojongasih, Kabupaten Tasikmalaya, Jawa Barat 46475', 'kecamatan' => 'Bojongasih'],
                ['nama' => 'Toblongan', 'latitude' => -7.5330354, 'longitude' => 108.1036992, 'alamat' => 'Toblongan, Kec. Bojongasih, Kabupaten Tasikmalaya, Jawa Barat 46475', 'kecamatan' => 'Bojongasih'],

                // Bojonggambir
                ['nama' => 'Bojonggambir', 'latitude' => -7.5107814, 'longitude' => 107.9763489, 'alamat' => 'Bojonggambir, Kec. Bojonggambir, Kabupaten Tasikmalaya, Jawa Barat 46475', 'kecamatan' => 'Bojonggambir'],
                ['nama' => 'Bojongkapol', 'latitude' => -7.5958958, 'longitude' => 107.9767018, 'alamat' => 'Jl. Cicomre No.01, Bojongkapol, Kec. Bojonggambir, Kabupaten Tasikmalaya, Jawa Barat 46475', 'kecamatan' => 'Bojonggambir'],
                ['nama' => 'Campakasari', 'latitude' => -7.6228331, 'longitude' => 107.9298543, 'alamat' => 'Jl. Jaya Bakti Cirangkong, Campakasari, Kec. Bojonggambir, Kabupaten Tasikmalaya, Jawa Barat 46475', 'kecamatan' => 'Bojonggambir'],
                ['nama' => 'Ciroyom', 'latitude' => -7.4919, 'longitude' => 107.970159, 'alamat' => 'Kantor, Ciroyom, Kec. Bojonggambir, Kabupaten Tasikmalaya, Jawa Barat 46475', 'kecamatan' => 'Bojonggambir'],
                ['nama' => 'Girimukti', 'latitude' => -7.5514825, 'longitude' => 107.9839761, 'alamat' => 'Girimukti, Kec. Bojonggambir, Kabupaten Tasikmalaya, Jawa Barat 46475', 'kecamatan' => 'Bojonggambir'],
                ['nama' => 'Kertanegla', 'latitude' => -7.5137028, 'longitude' => 107.9581244, 'alamat' => 'Kertanegla, Kec. Bojonggambir, Kabupaten Tasikmalaya, Jawa Barat 46475', 'kecamatan' => 'Bojonggambir'],
                ['nama' => 'Mangkonjaya', 'latitude' => -7.5061303, 'longitude' => 107.9784327, 'alamat' => 'Cibuntiris, Mangkonjaya, Kec. Bojonggambir, Kabupaten Tasikmalaya, Jawa Barat 46475', 'kecamatan' => 'Bojonggambir'],
                ['nama' => 'Pedangkamulyan', 'latitude' => -7.538906, 'longitude' => 107.9836157, 'alamat' => 'Pedangkamulyan, Kec. Bojonggambir, Kabupaten Tasikmalaya, Jawa Barat 46475', 'kecamatan' => 'Bojonggambir'],
                ['nama' => 'Purwaraharja', 'latitude' => -7.4921376, 'longitude' => 107.9878608, 'alamat' => 'Jl.Kp. Negla, Purwaraharja, Kec. Bojonggambir, Kabupaten Tasikmalaya, Jawa Barat 46475', 'kecamatan' => 'Bojonggambir'],
                ['nama' => 'Wandasari', 'latitude' => -7.569998, 'longitude' => 107.9580545, 'alamat' => 'Wandasari, Kec. Bojonggambir, Kabupaten Tasikmalaya, Jawa Barat 46475', 'kecamatan' => 'Bojonggambir'],

                // Ciawi
                ['nama' => 'Bugel', 'latitude' => -7.1835713, 'longitude' => 108.129326, 'alamat' => 'Bugel, Kec. Ciawi, Kabupaten Tasikmalaya, Jawa Barat 46156', 'kecamatan' => 'Ciawi'],
                ['nama' => 'Ciawi', 'latitude' => -7.1582217, 'longitude' => 108.1448858, 'alamat' => 'Jl. Zenal Asikin, Ciawi, Kec. Ciawi, Kabupaten Tasikmalaya, Jawa Barat 46156', 'kecamatan' => 'Ciawi'],
                ['nama' => 'Citamba', 'latitude' => -7.1579972, 'longitude' => 108.1257593, 'alamat' => 'Citamba, Kec. Ciawi, Kabupaten Tasikmalaya, Jawa Barat 46156', 'kecamatan' => 'Ciawi'],
                ['nama' => 'Gombong', 'latitude' => -7.1920603, 'longitude' => 108.1379617, 'alamat' => 'Gombong, Kec. Ciawi, Kabupaten Tasikmalaya, Jawa Barat 46156', 'kecamatan' => 'Ciawi'],
                ['nama' => 'Kertamukti', 'latitude' => -7.195781, 'longitude' => 108.1242014, 'alamat' => 'Kertamukti, Kec. Ciawi, Kabupaten Tasikmalaya, Jawa Barat 46156', 'kecamatan' => 'Ciawi'],
                ['nama' => 'Kurniabakti', 'latitude' => -7.1569713, 'longitude' => 108.1427717, 'alamat' => 'Kurniabakti, Kec. Ciawi, Kabupaten Tasikmalaya, Jawa Barat', 'kecamatan' => 'Ciawi'],
                ['nama' => 'Margasari', 'latitude' => -7.1684476, 'longitude' => 108.1317303, 'alamat' => 'Margasari, Kec. Ciawi, Kabupaten Tasikmalaya, Jawa Barat 46156', 'kecamatan' => 'Ciawi'],
                ['nama' => 'Pakamitankidul', 'latitude' => -7.1652108, 'longitude' => 108.1532104, 'alamat' => 'Pakemitankidul, Kabupaten Tasikmalaya, Jawa Barat', 'kecamatan' => 'Ciawi'],
                ['nama' => 'Pakemitan', 'latitude' => -7.1576309, 'longitude' => 108.1484529, 'alamat' => 'Jl. Raya Sumedang - Cibeureum No.302, Pakemitan, Kec. Ciawi, Kabupaten Tasikmalaya, Jawa Barat 46156', 'kecamatan' => 'Ciawi'],
                ['nama' => 'Pasirhuni', 'latitude' => -7.1414568, 'longitude' => 108.1402179, 'alamat' => 'Unnamed Road, Pasirhuni, Kec. Ciawi, Kabupaten Tasikmalaya, Jawa Barat 46156', 'kecamatan' => 'Ciawi'],
                ['nama' => 'Sukamantri', 'latitude' => -7.1444558, 'longitude' => 108.1472784, 'alamat' => 'Jl. Raya Perjuangan No.201, Sukamantri, Kec. Ciawi, Kabupaten Tasikmalaya, Jawa Barat 46156', 'kecamatan' => 'Ciawi'],

                // Cibalong
                ['nama' => 'Cibalong', 'latitude' => -7.5149575, 'longitude' => 108.1822658, 'alamat' => 'Cibalong, Kec. Cibalong, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Cibalong'],
                ['nama' => 'Cisempur', 'latitude' => -7.5860883, 'longitude' => 108.2108262, 'alamat' => 'Cisempur, Kec. Cibalong, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Cibalong'],
                ['nama' => 'Eureunpalay', 'latitude' => -7.5864547, 'longitude' => 108.1619592, 'alamat' => 'Eureunpalay, Kec. Cibalong, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Cibalong'],
                ['nama' => 'Parung', 'latitude' => -7.5392422, 'longitude' => 108.1773092, 'alamat' => 'Parung, Kec. Cibalong, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Cibalong'],
                ['nama' => 'Setiawaras', 'latitude' => -7.5675077, 'longitude' => 108.182143, 'alamat' => 'Setiawaras, Kec. Cibalong, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Cibalong'],
                ['nama' => 'Singajaya', 'latitude' => -7.5045139, 'longitude' => 108.1895628, 'alamat' => 'Raya Cibalong, Singajaya, Kec. Cibalong, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Cibalong'],

                // Cigalontang
                ['nama' => 'Cidugaleun', 'latitude' => -7.2995324, 'longitude' => 108.0400992, 'alamat' => 'Cidugaleun, Kec. Cigalontang, Kabupaten Tasikmalaya, Jawa Barat 46463', 'kecamatan' => 'Cigalontang'],
                ['nama' => 'Cigalontang', 'latitude' => -7.3211061, 'longitude' => 108.0050175, 'alamat' => 'Puspamukti, Kec. Cigalontang, Kabupaten Tasikmalaya, Jawa Barat 46463', 'kecamatan' => 'Cigalontang'],
                ['nama' => 'Jayapura', 'latitude' => -7.3516707, 'longitude' => 108.0318316, 'alamat' => 'Jayapura, Kec. Cigalontang, Kabupaten Tasikmalaya, Jawa Barat 46463', 'kecamatan' => 'Cigalontang'],
                ['nama' => 'Kersamaju', 'latitude' => -7.3169367, 'longitude' => 107.9451951, 'alamat' => 'Kersamaju, Kec. Cigalontang, Kabupaten Tasikmalaya, Jawa Barat 46463', 'kecamatan' => 'Cigalontang'],
                ['nama' => 'Lengkongjaya', 'latitude' => -7.3574591, 'longitude' => 108.0526228, 'alamat' => 'Lengkongjaya, Kec. Cigalontang, Kabupaten Tasikmalaya, Jawa Barat 46463', 'kecamatan' => 'Cigalontang'],
                ['nama' => 'Nangerang', 'latitude' => -7.3589971, 'longitude' => 108.0833806, 'alamat' => 'Nangerang, Kec. Cigalontang, Kabupaten Tasikmalaya, Jawa Barat 46463', 'kecamatan' => 'Cigalontang'],
                ['nama' => 'Nangtang', 'latitude' => -7.3484334, 'longitude' => 107.9867333, 'alamat' => 'Jl. Nangtang No.2002, Nangtang, Kec. Cigalontang, Kabupaten Tasikmalaya, Jawa Barat 46463', 'kecamatan' => 'Cigalontang'],
                ['nama' => 'Parentas', 'latitude' => -7.2329359, 'longitude' => 108.0193582, 'alamat' => 'Jl. Cigadog Hilir, Parentas, Kec. Cigalontang, Kabupaten Tasikmalaya, Jawa Barat 46463', 'kecamatan' => 'Cigalontang'],
                ['nama' => 'Puspamukti', 'latitude' => -7.3407856, 'longitude' => 108.008848, 'alamat' => 'Puspamukti, Kec. Cigalontang, Kabupaten Tasikmalaya, Jawa Barat 46463', 'kecamatan' => 'Cigalontang'],
                ['nama' => 'Pusparaja', 'latitude' => -7.3530318, 'longitude' => 108.0102215, 'alamat' => 'Pusparaja, Kec. Cigalontang, Kabupaten Tasikmalaya, Jawa Barat 46463', 'kecamatan' => 'Cigalontang'],
                ['nama' => 'Sirnagalih', 'latitude' => -7.2966936, 'longitude' => 107.930129, 'alamat' => 'Sirnagalih, Kec. Cigalontang, Kabupaten Tasikmalaya, Jawa Barat 46463', 'kecamatan' => 'Cigalontang'],
                ['nama' => 'Sirnaputra', 'latitude' => -7.3215523, 'longitude' => 108.0330253, 'alamat' => 'Sirnaputra, Kec. Cigalontang, Kabupaten Tasikmalaya, Jawa Barat 46463', 'kecamatan' => 'Cigalontang'],
                ['nama' => 'Sirnaraja', 'latitude' => -7.327177, 'longitude' => 108.0269874, 'alamat' => 'Sirnaraja, Kec. Cigalontang, Kabupaten Tasikmalaya, Jawa Barat 46463', 'kecamatan' => 'Cigalontang'],
                ['nama' => 'Sukamanah', 'latitude' => -7.3499215, 'longitude' => 108.0830138, 'alamat' => 'Jl. Desa Sukamanah, Sukamanah, Kec. Cigalontang, Kabupaten Tasikmalaya, Jawa Barat 46463', 'kecamatan' => 'Cigalontang'],
                ['nama' => 'Tanjungkarang', 'latitude' => -7.3309165, 'longitude' => 107.9701422, 'alamat' => 'Kp. Sukasenang Desa Tanjungkarang Kec. Kab., Puspamukti, Kec. Cigalontang, Kabupaten Tasikmalaya, Jawa Barat 46463', 'kecamatan' => 'Cigalontang'],
                ['nama' => 'Tenjonagara', 'latitude' => -7.3504501, 'longitude' => 108.0571033, 'alamat' => 'Tenjonagara, Kec. Cigalontang, Kabupaten Tasikmalaya, Jawa Barat 46463', 'kecamatan' => 'Cigalontang'],

                // Cikalong
                ['nama' => 'Cibeber', 'latitude' => -7.7080857, 'longitude' => 108.1959942, 'alamat' => 'Cibeber, Kec. Cikalong, Kabupaten Tasikmalaya, Jawa Barat 46195', 'kecamatan' => 'Cikalong'],
                ['nama' => 'Cidadali', 'latitude' => -7.7116482, 'longitude' => 108.2092955, 'alamat' => 'Cidadali, Kec. Cikalong, Kabupaten Tasikmalaya, Jawa Barat', 'kecamatan' => 'Cikalong'],
                ['nama' => 'Cikadu', 'latitude' => -7.7571755, 'longitude' => 108.2206552, 'alamat' => 'Cikadu, Kec. Cikalong, Kabupaten Tasikmalaya, Jawa Barat 46195', 'kecamatan' => 'Cikalong'],
                ['nama' => 'Cikalong', 'latitude' => -7.7659269, 'longitude' => 108.1735041, 'alamat' => 'Cikalong, Kec. Cikalong, Kabupaten Tasikmalaya, Jawa Barat 46195', 'kecamatan' => 'Cikalong'],
                ['nama' => 'Cikancra', 'latitude' => -7.7519427, 'longitude' => 108.2110028, 'alamat' => 'Jl. Cikancra Cijawer, Cikancra, Kec. Cikalong, Kabupaten Tasikmalaya, Jawa Barat 46195', 'kecamatan' => 'Cikalong'],
                ['nama' => 'Cimanuk', 'latitude' => -7.8122575, 'longitude' => 108.3160465, 'alamat' => 'Kalapagenep, Kec. Cikalong, Kabupaten Tasikmalaya, Jawa Barat 46195', 'kecamatan' => 'Cikalong'],
                ['nama' => 'Kalapagenep', 'latitude' => -7.8083295, 'longitude' => 108.2925038, 'alamat' => 'Kalapagenep, Kec. Cikalong, Kabupaten Tasikmalaya, Jawa Barat 46195', 'kecamatan' => 'Cikalong'],
                ['nama' => 'Kubangsari', 'latitude' => -7.7388662, 'longitude' => 108.2183048, 'alamat' => 'Jl. Batuwulung No.50, Kubangsari, Kec. Cikalong, Kabupaten Tasikmalaya, Jawa Barat 46195', 'kecamatan' => 'Cikalong'],
                ['nama' => 'Mandalajaya', 'latitude' => -7.7810217, 'longitude' => 108.1845142, 'alamat' => 'Mandalajaya, Kec. Cikalong, Kabupaten Tasikmalaya, Jawa Barat 46195', 'kecamatan' => 'Cikalong'],
                ['nama' => 'Panyiaran', 'latitude' => -7.7157761, 'longitude' => 108.1739247, 'alamat' => 'Panyiaran, Kec. Cikalong, Kabupaten Tasikmalaya, Jawa Barat 46195', 'kecamatan' => 'Cikalong'],
                ['nama' => 'Sindangjaya', 'latitude' => -7.7986018, 'longitude' => 108.2370529, 'alamat' => 'Sindangjaya, Kec. Cikalong, Kabupaten Tasikmalaya, Jawa Barat 46195', 'kecamatan' => 'Cikalong'],
                ['nama' => 'Singkir', 'latitude' => -7.7272391, 'longitude' => 108.1784751, 'alamat' => 'Singkir, Kec. Cikalong, Kabupaten Tasikmalaya, Jawa Barat', 'kecamatan' => 'Cikalong'],
                ['nama' => 'Tonjongsari', 'latitude' => -7.7371813, 'longitude' => 108.1816587, 'alamat' => 'Jl. Cikalong, Tonjongsari, Kec. Cikalong, Kabupaten Tasikmalaya, Jawa Barat 46195', 'kecamatan' => 'Cikalong'],

                // Cikatomas
                ['nama' => 'Cayur', 'latitude' => -7.5878644, 'longitude' => 108.2820317, 'alamat' => 'Cayur, Kec. Cikatomas, Kabupaten Tasikmalaya, Jawa Barat 46193', 'kecamatan' => 'Cikatomas'],
                ['nama' => 'Cilumba', 'latitude' => -7.6609616, 'longitude' => 108.2289039, 'alamat' => 'Cilumba, Kec. Cikatomas, Kabupaten Tasikmalaya, Jawa Barat 46193', 'kecamatan' => 'Cikatomas'],
                ['nama' => 'Cogreg', 'latitude' => -7.6388944, 'longitude' => 108.2961688, 'alamat' => 'Cogreg, Kec. Cikatomas, Kabupaten Tasikmalaya, Jawa Barat 46193', 'kecamatan' => 'Cikatomas'],
                ['nama' => 'Gunungsari', 'latitude' => -7.6720371, 'longitude' => 108.2178608, 'alamat' => 'Gunungsari, Kec. Cikatomas, Kabupaten Tasikmalaya, Jawa Barat 46193', 'kecamatan' => 'Cikatomas'],
                ['nama' => 'Lengkongbarang', 'latitude' => -7.5710363, 'longitude' => 108.2807813, 'alamat' => 'Tanjungbarang, Kec. Cikatomas, Kabupaten Tasikmalaya, Jawa Barat 46193', 'kecamatan' => 'Cikatomas'],
                ['nama' => 'Linggalaksana', 'latitude' => -7.6371864, 'longitude' => 108.2349608, 'alamat' => 'Cikatomas, Linggalaksana, Kec. Cikatomas, Kabupaten Tasikmalaya, Jawa Barat 46193', 'kecamatan' => 'Cikatomas'],
                ['nama' => 'Pakemitan', 'latitude' => -7.6224132, 'longitude' => 108.2567398, 'alamat' => 'Pakemitan, Cikatomas, Tasikmalaya Regency, West Java 46193', 'kecamatan' => 'Cikatomas'],
                ['nama' => 'Sindangasih', 'latitude' => -7.5780892, 'longitude' => 108.3249736, 'alamat' => 'Sindangasih, Kec. Cikatomas, Kabupaten Tasikmalaya, Jawa Barat 46193', 'kecamatan' => 'Cikatomas'],
                ['nama' => 'Tanjungbarang', 'latitude' => -7.5601054, 'longitude' => 108.2570536, 'alamat' => 'Tanjungbarang, Kec. Cikatomas, Kabupaten Tasikmalaya, Jawa Barat 46193', 'kecamatan' => 'Cikatomas'],

                // Cineam
                ['nama' => 'Ancol', 'latitude' => -7.3653466, 'longitude' => 108.3859296, 'alamat' => 'Jl. Manonjaya - Banjar No.16, Ancol, Kec. Cineam, Kabupaten Tasikmalaya, Jawa Barat 46198', 'kecamatan' => 'Cineam'],
                ['nama' => 'Ciampanan', 'latitude' => -7.3961723, 'longitude' => 108.3770173, 'alamat' => 'Jl. Raya Ciampanan, Ciampanan, Kec. Cineam, Kabupaten Tasikmalaya, Jawa Barat 46198', 'kecamatan' => 'Cineam'],
                ['nama' => 'Cijulang', 'latitude' => -7.4094545, 'longitude' => 108.3596168, 'alamat' => 'Jl. Karanglayung, Cijulang, Kec. Cineam, Kabupaten Tasikmalaya, Jawa Barat 46198', 'kecamatan' => 'Cineam'],
                ['nama' => 'Cikondang', 'latitude' => -7.4237163, 'longitude' => 108.3435088, 'alamat' => 'Cikondang, Kec. Cineam, Kabupaten Tasikmalaya, Jawa Barat 46198', 'kecamatan' => 'Cineam'],
                ['nama' => 'Cineam', 'latitude' => -7.3905749, 'longitude' => 108.3563493, 'alamat' => 'Jl. Ps. Wetan, Cineam, Kec. Cineam, Kabupaten Tasikmalaya, Jawa Barat 46198', 'kecamatan' => 'Cineam'],
                ['nama' => 'Cisarua', 'latitude' => -7.4575156, 'longitude' => 108.3519933, 'alamat' => 'Jln.singkup, RT./Rw/RW.02/01, Cisarua, Kec. Cineam, Kabupaten Tasikmalaya, Jawa Barat', 'kecamatan' => 'Cineam'],
                ['nama' => 'Madiasari', 'latitude' => -7.3786761, 'longitude' => 108.3537764, 'alamat' => 'Madiasari, Kec. Cineam, Kabupaten Tasikmalaya, Jawa Barat 46198', 'kecamatan' => 'Cineam'],
                ['nama' => 'Nagaratengah', 'latitude' => -7.4123647, 'longitude' => 108.3911996, 'alamat' => 'Nagaratengah, Kec. Cineam, Kabupaten Tasikmalaya, Jawa Barat 46198', 'kecamatan' => 'Cineam'],
                ['nama' => 'Pasirmukti', 'latitude' => -7.4399961, 'longitude' => 108.3425802, 'alamat' => 'Pasirmukti, Kec. Cineam, Kabupaten Tasikmalaya, Jawa Barat 46198', 'kecamatan' => 'Cineam'],
                ['nama' => 'Rajadatu', 'latitude' => -7.3805048, 'longitude' => 108.3870375, 'alamat' => 'Rajadatu, Kec. Cineam, Kabupaten Tasikmalaya, Jawa Barat 46198', 'kecamatan' => 'Cineam'],

                // Cipatujah
                ['nama' => 'Bantarkalong', 'latitude' => -7.6603156, 'longitude' => 108.0787142, 'alamat' => 'Bantar Kalong, Bantarkalong, Kec. Cipatujah, Kabupaten Tasikmalaya, Jawa Barat 46187', 'kecamatan' => 'Cipatujah'],
                ['nama' => 'Ciandum', 'latitude' => -7.7328343, 'longitude' => 107.9939606, 'alamat' => 'Ciandum, Kec. Cipatujah, Kabupaten Tasikmalaya, Jawa Barat 46189', 'kecamatan' => 'Cipatujah'],
                ['nama' => 'Ciheras', 'latitude' => -7.7342596, 'longitude' => 107.9627761, 'alamat' => 'Ciheras, Kec. Cipatujah, Kabupaten Tasikmalaya, Jawa Barat 46189', 'kecamatan' => 'Cipatujah'],
                ['nama' => 'Cikawunggading', 'latitude' => -7.7700363, 'longitude' => 108.1016663, 'alamat' => 'Cikawungading, Kec. Cipatujah, Kabupaten Tasikmalaya, Jawa Barat 46189', 'kecamatan' => 'Cipatujah'],
                ['nama' => 'Cipanas', 'latitude' => -7.7190739, 'longitude' => 107.9678712, 'alamat' => 'Ciheras, Kec. Cipatujah, Kabupaten Tasikmalaya, Jawa Barat 46189', 'kecamatan' => 'Cipatujah'],
                ['nama' => 'Cipatujah', 'latitude' => -7.742734, 'longitude' => 108.017696, 'alamat' => 'Cipatujah, Kec. Cipatujah, Kabupaten Tasikmalaya, Jawa Barat 46189', 'kecamatan' => 'Cipatujah'],
                ['nama' => 'Darawati', 'latitude' => -7.6816776, 'longitude' => 108.0499712, 'alamat' => 'Jl. Raya Cipatujah No.16, RT.01/RW.01, Kp. Ciceuri, Darawati, Kec. Cipatujah, Kabupaten Tasikmalaya, Jawa Barat 46189', 'kecamatan' => 'Cipatujah'],
                ['nama' => 'Kertasari', 'latitude' => -7.7178461, 'longitude' => 108.0766444, 'alamat' => 'Kertasari, Kec. Cipatujah, Kabupaten Tasikmalaya, Jawa Barat 46189', 'kecamatan' => 'Cipatujah'],
                ['nama' => 'Nagrog', 'latitude' => -7.6605391, 'longitude' => 108.0260153, 'alamat' => 'Jl. Tanjungsari, Nagrog, Kec. Cipatujah, Kabupaten Tasikmalaya, Jawa Barat 46189', 'kecamatan' => 'Cipatujah'],
                ['nama' => 'Nangelasari', 'latitude' => -7.6583535, 'longitude' => 108.0503099, 'alamat' => 'Nangelasari, Kec. Cipatujah, Kabupaten Tasikmalaya, Jawa Barat', 'kecamatan' => 'Cipatujah'],
                ['nama' => 'Padawaras', 'latitude' => -7.6922464, 'longitude' => 108.0471812, 'alamat' => 'Padawaras, Kec. Cipatujah, Kabupaten Tasikmalaya, Jawa Barat 46189', 'kecamatan' => 'Cipatujah'],
                ['nama' => 'Pameutingan', 'latitude' => -7.6789684, 'longitude' => 107.9668076, 'alamat' => 'Pameutingan, Kec. Cipatujah, Kabupaten Tasikmalaya, Jawa Barat 46189', 'kecamatan' => 'Cipatujah'],
                ['nama' => 'Sindangkerta', 'latitude' => -7.7619941, 'longitude' => 108.0577612, 'alamat' => 'Jl. Taman Lengsar, Sindangkerta, Kec. Cipatujah, Kabupaten Tasikmalaya, Jawa Barat 46189', 'kecamatan' => 'Cipatujah'],
                ['nama' => 'Sukahurip', 'latitude' => -7.6730829, 'longitude' => 107.9899303, 'alamat' => 'Sukahurip, Kec. Cipatujah, Kabupaten Tasikmalaya, Jawa Barat 46189', 'kecamatan' => 'Cipatujah'],
                ['nama' => 'Tobongjaya', 'latitude' => -7.6433692, 'longitude' => 108.0876113, 'alamat' => 'Tobongjaya, Kec. Cipatujah, Kabupaten Tasikmalaya, Jawa Barat 46189', 'kecamatan' => 'Cipatujah'],

                // Cisayong
                ['nama' => 'Cikadu', 'latitude' => -7.2556571, 'longitude' => 108.1532773, 'alamat' => 'Cikadu, Kec. Cisayong, Kabupaten Tasikmalaya, Jawa Barat 46153', 'kecamatan' => 'Cisayong'],
                ['nama' => 'Cileuleus', 'latitude' => -7.2329103, 'longitude' => 108.1630647, 'alamat' => 'Cileuleus, Kec. Cisayong, Kabupaten Tasikmalaya, Jawa Barat 46153', 'kecamatan' => 'Cisayong'],
                ['nama' => 'Cisayong', 'latitude' => -7.2573078, 'longitude' => 108.1454677, 'alamat' => 'Cisayong, Kec. Cisayong, Kabupaten Tasikmalaya, Jawa Barat 46153', 'kecamatan' => 'Cisayong'],
                ['nama' => 'Jatihurip', 'latitude' => -7.2659248, 'longitude' => 108.1862502, 'alamat' => 'Jatihurip, Kec. Cisayong, Kabupaten Tasikmalaya, Jawa Barat', 'kecamatan' => 'Cisayong'],
                ['nama' => 'Mekarwangi', 'latitude' => -7.2475966, 'longitude' => 108.1876616, 'alamat' => 'Raya Cibodas, Mekarwangi, Kec. Cisayong, Kabupaten Tasikmalaya, Jawa Barat 46153', 'kecamatan' => 'Cisayong'],
                ['nama' => 'Nusawangi', 'latitude' => -7.2450505, 'longitude' => 108.1783643, 'alamat' => 'Nusawangi, Kec. Cisayong, Kabupaten Tasikmalaya, Jawa Barat', 'kecamatan' => 'Cisayong'],
                ['nama' => 'Purwasari', 'latitude' => -7.2482568, 'longitude' => 108.157845, 'alamat' => 'Purwasari, Kec. Cisayong, Kabupaten Tasikmalaya, Jawa Barat 46153', 'kecamatan' => 'Cisayong'],
                ['nama' => 'Santanamekar', 'latitude' => -7.2537091, 'longitude' => 108.1340524, 'alamat' => 'Santanamekar, Kec. Cisayong, Kabupaten Tasikmalaya, Jawa Barat 46153', 'kecamatan' => 'Cisayong'],
                ['nama' => 'Sukajadi', 'latitude' => -7.2617721, 'longitude' => 108.1628383, 'alamat' => 'Jalan Raya, Sukajadi, Cisayong, Tasikmalaya Regency, West Java 46153', 'kecamatan' => 'Cisayong'],
                ['nama' => 'Sukamukti', 'latitude' => -7.2348768, 'longitude' => 108.1262281, 'alamat' => 'Sukamukti, Kec. Cisayong, Kabupaten Tasikmalaya, Jawa Barat 46153', 'kecamatan' => 'Cisayong'],
                ['nama' => 'Sukaraharja', 'latitude' => -7.2601403, 'longitude' => 108.1709489, 'alamat' => 'Sukaraharja, Kec. Cisayong, Kabupaten Tasikmalaya, Jawa Barat 46153', 'kecamatan' => 'Cisayong'],
                ['nama' => 'Sukasetia', 'latitude' => -7.2313495, 'longitude' => 108.1301936, 'alamat' => 'Sukasetia, Kec. Cisayong, Kabupaten Tasikmalaya, Jawa Barat 46153', 'kecamatan' => 'Cisayong'],
                ['nama' => 'Sukasukur', 'latitude' => -7.2687605, 'longitude' => 108.177864, 'alamat' => 'Jl. Sukasukur 18, Sukasukur, Kec. Cisayong, Kabupaten Tasikmalaya, Jawa Barat 46153', 'kecamatan' => 'Cisayong'],

                // Culamega
                ['nama' => 'Bojongsari', 'latitude' => -7.6400216, 'longitude' => 108.0333202, 'alamat' => 'Bojongsari, Kec. Culamega, Kabupaten Tasikmalaya, Jawa Barat 46188', 'kecamatan' => 'Culamega'],
                ['nama' => 'Cikuya', 'latitude' => -7.6003052, 'longitude' => 108.019954, 'alamat' => 'Cikuya, Kec. Culamega, Kabupaten Tasikmalaya, Jawa Barat 46188', 'kecamatan' => 'Culamega'],
                ['nama' => 'Cintabodas', 'latitude' => -7.5991945, 'longitude' => 108.0605475, 'alamat' => 'Cintabodas, Kec. Culamega, Kabupaten Tasikmalaya, Jawa Barat 46188', 'kecamatan' => 'Culamega'],
                ['nama' => 'Cipicung', 'latitude' => -7.5568896, 'longitude' => 108.0319523, 'alamat' => 'Cipicung, Kec. Culamega, Kabupaten Tasikmalaya, Jawa Barat 46188', 'kecamatan' => 'Culamega'],
                ['nama' => 'Mekarlaksana', 'latitude' => -7.5710082, 'longitude' => 108.0649793, 'alamat' => 'Kp.pajadun, Mekarlaksana, Kec. Culamega, Kabupaten Tasikmalaya, Jawa Barat 46188', 'kecamatan' => 'Culamega'],

                // Gunungtanjung
                ['nama' => 'Bojongsari', 'latitude' => -7.3899728, 'longitude' => 108.3094119, 'alamat' => 'Kp. Bojongari RT 01 RW 03 Desa Bojongsari, Bojongsari, Kec. Gunungtanjung, Kabupaten Tasikmalaya, Jawa Barat 46418', 'kecamatan' => 'Gunungtanjung'],
                ['nama' => 'Cinunjang', 'latitude' => -7.4201186, 'longitude' => 108.2836834, 'alamat' => 'Jl. Raya Salopa, Cinunjang, Kec. Gunungtanjung, Kabupaten Tasikmalaya, Jawa Barat 46418', 'kecamatan' => 'Gunungtanjung'],
                ['nama' => 'Giriwangi', 'latitude' => -7.4258633, 'longitude' => 108.296159, 'alamat' => 'Giriwangi, Kec. Gunungtanjung, Kabupaten Tasikmalaya, Jawa Barat 46418', 'kecamatan' => 'Gunungtanjung'],
                ['nama' => 'Gunungtanjung', 'latitude' => -7.4048924, 'longitude' => 108.2847135, 'alamat' => 'Gunungtanjung, Kec. Gunungtanjung, Kabupaten Tasikmalaya, Jawa Barat 46418', 'kecamatan' => 'Gunungtanjung'],
                ['nama' => 'Jatijaya', 'latitude' => -7.4095216, 'longitude' => 108.3115876, 'alamat' => 'Jl. kp pannusan gng cikodol, Jatijaya, Kec. Gunungtanjung, Kabupaten Tasikmalaya, Jawa Barat 46418', 'kecamatan' => 'Gunungtanjung'],
                ['nama' => 'Malatisuka', 'latitude' => -7.4496569, 'longitude' => 108.3045598, 'alamat' => 'Malatisuka, Kec. Gunungtanjung, Kabupaten Tasikmalaya, Jawa Barat 46418', 'kecamatan' => 'Gunungtanjung'],
                ['nama' => 'Tanjungsari', 'latitude' => -7.3909599, 'longitude' => 108.2861912, 'alamat' => 'Jl. Raya gn tj, Tanjungsari, Kec. Gunungtanjung, Kabupaten Tasikmalaya, Jawa Barat 46418', 'kecamatan' => 'Gunungtanjung'],

                // Jamanis
                ['nama' => 'Bojonggaok', 'latitude' => -7.19661, 'longitude' => 108.1656162, 'alamat' => 'Bojonggaok, Kec. Jamanis, Kabupaten Tasikmalaya, Jawa Barat 46175', 'kecamatan' => 'Jamanis'],
                ['nama' => 'Condong', 'latitude' => -7.1952197, 'longitude' => 108.1556543, 'alamat' => 'Sindangraja, Kec. Jamanis, Kabupaten Tasikmalaya, Jawa Barat 46175', 'kecamatan' => 'Jamanis'],
                ['nama' => 'Geresik', 'latitude' => -7.17122, 'longitude' => 108.1544842, 'alamat' => 'Geresik, Kec. Jamanis, Kabupaten Tasikmalaya, Jawa Barat 46175', 'kecamatan' => 'Jamanis'],
                ['nama' => 'Karangmulya', 'latitude' => -7.1855612, 'longitude' => 108.1540305, 'alamat' => 'Karangmulya, Kec. Jamanis, Kabupaten Tasikmalaya, Jawa Barat 46175', 'kecamatan' => 'Jamanis'],
                ['nama' => 'Karangresik', 'latitude' => -7.1771594, 'longitude' => 108.1717966, 'alamat' => 'Jl. Raya Sumedang - Cibeureum No.16, Karangresik, Kec. Jamanis, Kabupaten Tasikmalaya, Jawa Barat 46175', 'kecamatan' => 'Jamanis'],
                ['nama' => 'Karangsembung', 'latitude' => -7.1923181, 'longitude' => 108.1475181, 'alamat' => 'Jl. Timbulsari, RT.001/RW.006, Karangsembung, Kec. Jamanis, Kabupaten Tasikmalaya, Jawa Barat 46175', 'kecamatan' => 'Jamanis'],
                ['nama' => 'Sindangraja', 'latitude' => -7.1915938, 'longitude' => 108.1757613, 'alamat' => 'Sindangraja, Kec. Jamanis, Kabupaten Tasikmalaya, Jawa Barat 46175', 'kecamatan' => 'Jamanis'],
                ['nama' => 'Tanjungmekar', 'latitude' => -7.183962, 'longitude' => 108.1876462, 'alamat' => 'Tanjungmekar, Kec. Jamanis, Kabupaten Tasikmalaya, Jawa Barat 46175', 'kecamatan' => 'Jamanis'],

                // Jatiwaras
                ['nama' => 'Ciwarak', 'latitude' => -7.5053662, 'longitude' => 108.1991595, 'alamat' => 'Ciwarak, Kec. Jatiwaras, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Jatiwaras'],
                ['nama' => 'Jatiwaras', 'latitude' => -7.4817783, 'longitude' => 108.2240728, 'alamat' => 'Jl. Cioray, Jatiwaras, Kec. Jatiwaras, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Jatiwaras'],
                ['nama' => 'Kaputihan', 'latitude' => -7.4653803, 'longitude' => 108.2446147, 'alamat' => 'Kaputihan, Kec. Jatiwaras, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Jatiwaras'],
                ['nama' => 'Kersagalih', 'latitude' => -7.5183927, 'longitude' => 108.191825, 'alamat' => 'Jalan Mandala Mekar, Kersagalih, Kec. Jatiwaras, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Jatiwaras'],
                ['nama' => 'Kertarahayu', 'latitude' => -7.530492, 'longitude' => 108.2373556, 'alamat' => 'Kertarahayu, Kec. Jatiwaras, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Jatiwaras'],
                ['nama' => 'Mandalahurip', 'latitude' => -7.5662799, 'longitude' => 108.2310445, 'alamat' => 'Mandalahurip, Kec. Jatiwaras, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Jatiwaras'],
                ['nama' => 'Mandalamekar', 'latitude' => -7.5478883, 'longitude' => 108.2172121, 'alamat' => 'Mandalamekar, Kec. Jatiwaras, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Jatiwaras'],
                ['nama' => 'Neglasari', 'latitude' => -7.4667857, 'longitude' => 108.2225571, 'alamat' => 'Jl. Neglasari, Neglasari, Kec. Jatiwaras, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Jatiwaras'],
                ['nama' => 'Papayan', 'latitude' => -7.4655311, 'longitude' => 108.2031032, 'alamat' => 'Papayan, Kec. Jatiwaras, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Jatiwaras'],
                ['nama' => 'Setiawangi', 'latitude' => -7.452564, 'longitude' => 108.2554311, 'alamat' => 'Setiawangi, Kec. Jatiwaras, Kabupaten Tasikmalaya, Jawa Barat 46196', 'kecamatan' => 'Jatiwaras'],
                ['nama' => 'Sukakerta', 'latitude' => -7.4553358, 'longitude' => 108.209641, 'alamat' => 'Sukakerta, Kec. Jatiwaras, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Jatiwaras'],

                // Kadipaten
                ['nama' => 'Buniasih', 'latitude' => -7.1217753, 'longitude' => 108.1403052, 'alamat' => 'Jl. Raya Lkr. Gentong, Buniasih, Kec. Kadipaten, Kabupaten Tasikmalaya, Jawa Barat 46156', 'kecamatan' => 'Kadipaten'],
                ['nama' => 'Cibahayu', 'latitude' => -7.1229092, 'longitude' => 108.1209149, 'alamat' => 'Cibahayu, Kec. Kadipaten, Kabupaten Tasikmalaya, Jawa Barat 46156', 'kecamatan' => 'Kadipaten'],
                ['nama' => 'Dirgahayu', 'latitude' => -7.1225516, 'longitude' => 108.11613, 'alamat' => 'Dirgahayu, Kec. Kadipaten, Kabupaten Tasikmalaya, Jawa Barat 46156', 'kecamatan' => 'Kadipaten'],
                ['nama' => 'Kadipaten', 'latitude' => -7.1099104, 'longitude' => 108.1067823, 'alamat' => 'Jl. Nasional III, Kadipaten, Kec. Kadipaten, Kabupaten Tasikmalaya, Jawa Barat 46156', 'kecamatan' => 'Kadipaten'],
                ['nama' => 'Mekarsari', 'latitude' => -7.1347403, 'longitude' => 108.1361939, 'alamat' => 'Babakan nanggela, Mekarsari, Kec. Kadipaten, Kabupaten Tasikmalaya, Jawa Barat 46156', 'kecamatan' => 'Kadipaten'],
                ['nama' => 'Pamoyanan', 'latitude' => -7.1249016, 'longitude' => 108.1482204, 'alamat' => 'Jl. Nanggeleng - Cirahayu 42-3, Pamoyanan, Kec. Kadipaten, Kabupaten Tasikmalaya, Jawa Barat 46156', 'kecamatan' => 'Kadipaten'],

                // Karangjaya
                ['nama' => 'Citalahab', 'latitude' => -7.4935777, 'longitude' => 108.4241423, 'alamat' => 'Jl. Langkaplancar - Lakbok, Citalahab, Kec. karangjaya, Kabupaten Tasik, Jawa Barat 46198', 'kecamatan' => 'Karangjaya'],
                ['nama' => 'Karang Jaya', 'latitude' => -7.4282701, 'longitude' => 108.3928539, 'alamat' => 'Karangjaya, Kec. Karangjaya, Kabupaten Tasikmalaya, Jawa Barat 46198', 'kecamatan' => 'Karangjaya'],
                ['nama' => 'Karanglayung', 'latitude' => -7.420932, 'longitude' => 108.3804131, 'alamat' => 'Karanglayung, Kec. Karangjaya, Kabupaten Tasikmalaya, Jawa Barat 46198', 'kecamatan' => 'Karangjaya'],
                ['nama' => 'Sirnajaya', 'latitude' => -7.4516943, 'longitude' => 108.4126694, 'alamat' => 'Sirnajaya, Kec. Karangjaya, Kabupaten Tasikmalaya, Jawa Barat 46198', 'kecamatan' => 'Karangjaya'],

                // Karangnunggal
                ['nama' => 'Ciawi', 'latitude' => -7.6613718, 'longitude' => 108.1268227, 'alamat' => 'Ciawi, Karangnunggal, Tasikmalaya Regency, West Java 46186', 'kecamatan' => 'Karangnunggal'],
                ['nama' => 'Cibatu', 'latitude' => -7.6309054, 'longitude' => 108.1971309, 'alamat' => 'Cibatu, Karangnunggal, Tasikmalaya Regency, West Java 46186', 'kecamatan' => 'Karangnunggal'],
                ['nama' => 'Cibatuireng', 'latitude' => -7.6356365, 'longitude' => 108.1742432, 'alamat' => 'Cibatuireng, Kec. Karangnunggal, Kabupaten Tasikmalaya, Jawa Barat 46186', 'kecamatan' => 'Karangnunggal'],
                ['nama' => 'Cidadap', 'latitude' => -7.7721777, 'longitude' => 108.1397739, 'alamat' => 'Cidadap, Karangnunggal, Tasikmalaya Regency, West Java 46186', 'kecamatan' => 'Karangnunggal'],
                ['nama' => 'Cikapinis', 'latitude' => -7.6758666, 'longitude' => 108.1075427, 'alamat' => 'Cikapinis, Karangnunggal, Tasikmalaya Regency, West Java 46186', 'kecamatan' => 'Karangnunggal'],
                ['nama' => 'Cikukulu', 'latitude' => -7.6039689, 'longitude' => 108.1564868, 'alamat' => 'Cikukulu, Karangnunggal, Tasikmalaya Regency, West Java 46186', 'kecamatan' => 'Karangnunggal'],
                ['nama' => 'Cikupa', 'latitude' => -7.6471354, 'longitude' => 108.1220083, 'alamat' => 'Cikupa, Kec. Karangnunggal, Kabupaten Tasikmalaya, Jawa Barat 46186', 'kecamatan' => 'Karangnunggal'],
                ['nama' => 'Cintawangi', 'latitude' => -7.616159, 'longitude' => 108.1896402, 'alamat' => 'Cintawangi, Kec. Karangnunggal, Kabupaten Tasikmalaya, Jawa Barat 46186', 'kecamatan' => 'Karangnunggal'],
                ['nama' => 'Karangmekar', 'latitude' => -7.6233571, 'longitude' => 108.1369664, 'alamat' => 'Karangmekar, Karangnunggal, Tasikmalaya Regency, West Java 46186', 'kecamatan' => 'Karangnunggal'],
                ['nama' => 'Karangnunggal', 'latitude' => -7.630747, 'longitude' => 108.1326857, 'alamat' => 'Karangnunggal, Tasikmalaya Regency, West Java 46186', 'kecamatan' => 'Karangnunggal'],
                ['nama' => 'Kujang', 'latitude' => -7.7437575, 'longitude' => 108.1370683, 'alamat' => 'Kujang, Kec. Karangnunggal, Kabupaten Tasikmalaya, Jawa Barat 46186', 'kecamatan' => 'Karangnunggal'],
                ['nama' => 'Sarimanggu', 'latitude' => -7.6097021, 'longitude' => 108.1406722, 'alamat' => 'Sarimanggu, Kec. Karangnunggal, Kabupaten Tasikmalaya, Jawa Barat 46186', 'kecamatan' => 'Karangnunggal'],
                ['nama' => 'Sarimukti', 'latitude' => -7.6909264, 'longitude' => 108.1284255, 'alamat' => 'Sarimukti, Kec. Karangnunggal, Kabupaten Tasikmalaya, Jawa Barat 46186', 'kecamatan' => 'Karangnunggal'],
                ['nama' => 'Sukawangun', 'latitude' => -7.6287257, 'longitude' => 108.2164281, 'alamat' => 'Sukawangun, Kec. Karangnunggal, Kabupaten Tasikmalaya, Jawa Barat', 'kecamatan' => 'Karangnunggal'],

                // Leuwisari
                ['nama' => 'Arjasari', 'latitude' => -7.337893, 'longitude' => 108.1058822, 'alamat' => 'Arjasari, Leuwisari, Tasikmalaya Regency, West Java 46464', 'kecamatan' => 'Leuwisari'],
                ['nama' => 'Ciawang', 'latitude' => -7.3214736, 'longitude' => 108.113313, 'alamat' => 'Ciawang, Leuwisari, Tasikmalaya Regency, West Java 46464', 'kecamatan' => 'Leuwisari'],
                ['nama' => 'Cigadog', 'latitude' => -7.3026821, 'longitude' => 108.094887, 'alamat' => 'Cigadog, Leuwisari, Tasikmalaya Regency, West Java 46464', 'kecamatan' => 'Leuwisari'],
                ['nama' => 'Jayamukti', 'latitude' => -7.316956, 'longitude' => 108.0994924, 'alamat' => 'Jayamukti, Leuwisari, Tasikmalaya Regency, West Java 46464', 'kecamatan' => 'Leuwisari'],
                ['nama' => 'Linggamulya', 'latitude' => -7.3146291, 'longitude' => 108.0859063, 'alamat' => 'Linggamulya, Leuwisari, Tasikmalaya Regency, West Java 46464', 'kecamatan' => 'Leuwisari'],
                ['nama' => 'Linggawangi', 'latitude' => -7.3197551, 'longitude' => 108.0817709, 'alamat' => 'Jl Kancana No.38, Linggawangi, Kec. Leuwisari, Kabupaten Tasikmalaya, Jawa Barat 46464', 'kecamatan' => 'Leuwisari'],
                ['nama' => 'Mandalagiri', 'latitude' => -7.3034916, 'longitude' => 108.100546, 'alamat' => 'Mandalagiri, Leuwisari, Tasikmalaya Regency, West Java 46464', 'kecamatan' => 'Leuwisari'],

                // Mangunreja
                ['nama' => 'Mangunreja', 'latitude' => -7.3652514, 'longitude' => 108.1027837, 'alamat' => 'Jl. Sukaraja, Mangunreja, Kec. Mangunreja, Kabupaten Tasikmalaya, Jawa Barat 46462', 'kecamatan' => 'Mangunreja'],
                ['nama' => 'Margajaya', 'latitude' => -7.3741872, 'longitude' => 108.1194403, 'alamat' => 'Margajaya, Mangunreja, Tasikmalaya Regency, West Java 46462', 'kecamatan' => 'Mangunreja'],
                ['nama' => 'Pasirsalam', 'latitude' => -7.3947383, 'longitude' => 108.077967, 'alamat' => 'Pasirsalam, Mangunreja, Tasikmalaya Regency, West Java 46462', 'kecamatan' => 'Mangunreja'],
                ['nama' => 'Salebu', 'latitude' => -7.3727783, 'longitude' => 108.0683296, 'alamat' => 'Salebu, Mangunreja, Tasikmalaya Regency, West Java 46462', 'kecamatan' => 'Mangunreja'],
                ['nama' => 'Sukaluyu', 'latitude' => -7.3822196, 'longitude' => 108.0572176, 'alamat' => 'Unnamed Road, Sukaluyu, Kec. Mangunreja, Kabupaten Tasikmalaya, Jawa Barat 46462', 'kecamatan' => 'Mangunreja'],
                ['nama' => 'Sukasukur', 'latitude' => -7.3734717, 'longitude' => 108.0742551, 'alamat' => 'Sukasukur, Mangunreja, Tasikmalaya Regency, West Java 46462', 'kecamatan' => 'Mangunreja'],

                // Manonjaya
                ['nama' => 'Batusumur', 'latitude' => -7.3997881, 'longitude' => 108.3344835, 'alamat' => 'Batusumur, Manonjaya, Tasikmalaya Regency, West Java 46197', 'kecamatan' => 'Manonjaya'],
                ['nama' => 'Cibeber', 'latitude' => -7.3778217, 'longitude' => 108.2887306, 'alamat' => 'Cibeber, Manonjaya, Tasikmalaya Regency, West Java 46197', 'kecamatan' => 'Manonjaya'],
                ['nama' => 'Cihaur', 'latitude' => -7.3904521, 'longitude' => 108.3226503, 'alamat' => 'Cihaur, Manonjaya, Tasikmalaya Regency, West Java 46197', 'kecamatan' => 'Manonjaya'],
                ['nama' => 'Cilangkap', 'latitude' => -7.3626247, 'longitude' => 108.3353118, 'alamat' => 'Cilangkap, Manonjaya, Tasikmalaya Regency, West Java 46197', 'kecamatan' => 'Manonjaya'],
                ['nama' => 'Gunajaya', 'latitude' => -7.3721443, 'longitude' => 108.2734775, 'alamat' => 'Kantor, Desa, Gunajaya, Manonjaya, Tasikmalaya Regency, West Java 46197', 'kecamatan' => 'Manonjaya'],
                ['nama' => 'Kalimanggis', 'latitude' => -7.3647202, 'longitude' => 108.3086278, 'alamat' => 'Jl. Kalimanggis, Kalimanggis, Kec. Manonjaya, Kabupaten Tasikmalaya, Jawa Barat 46197', 'kecamatan' => 'Manonjaya'],
                ['nama' => 'Kamulyan', 'latitude' => -7.3526894, 'longitude' => 108.28908, 'alamat' => 'Jl. RTA. Prawira Adiningrat No.39, Margaluyu, Kec. Manonjaya, Kabupaten Tasikmalaya, Jawa Barat 46197', 'kecamatan' => 'Manonjaya'],
                ['nama' => 'Manonjaya', 'latitude' => -7.3514825, 'longitude' => 108.3085853, 'alamat' => 'Jl. Alun-alun 1-3, Manonjaya, Kec. Manonjaya, Kabupaten Tasikmalaya, Jawa Barat 46197', 'kecamatan' => 'Manonjaya'],
                ['nama' => 'Margahayu', 'latitude' => -7.3597303, 'longitude' => 108.2949557, 'alamat' => 'Jl. Cimuncang, Margahayu, Kec. Manonjaya, Kabupaten Tasikmalaya, Jawa Barat 46197', 'kecamatan' => 'Manonjaya'],
                ['nama' => 'Margaluyu', 'latitude' => -7.3481146, 'longitude' => 108.3076477, 'alamat' => 'Margaluyu, Manonjaya, Tasikmalaya Regency, West Java 46197', 'kecamatan' => 'Manonjaya'],
                ['nama' => 'Pasirbatang', 'latitude' => -7.3619097, 'longitude' => 108.3552302, 'alamat' => 'Pasirbatang, Manonjaya, Tasikmalaya Regency, West Java 46197', 'kecamatan' => 'Manonjaya'],
                ['nama' => 'Pasirpanjang', 'latitude' => -7.3640618, 'longitude' => 108.3149282, 'alamat' => 'Pasirpanjang, Manonjaya, Tasikmalaya Regency, West Java 46197', 'kecamatan' => 'Manonjaya'],

                // Padakembang
                ['nama' => 'Cilampunghilir', 'latitude' => -7.3302893, 'longitude' => 108.1262561, 'alamat' => 'Jl. Nangkaleah, Cilampunghilir, Kec. Padakembang, Kabupaten Tasikmalaya, Jawa Barat 46466', 'kecamatan' => 'Padakembang'],
                ['nama' => 'Cisaruni', 'latitude' => -7.3086195, 'longitude' => 108.1214354, 'alamat' => 'Cisaruni, Padakembang, Tasikmalaya Regency, West Java 46466', 'kecamatan' => 'Padakembang'],
                ['nama' => 'Mekarjaya', 'latitude' => -7.2961368, 'longitude' => 108.1263979, 'alamat' => 'Mekarjaya, Padakembang, Tasikmalaya Regency, West Java 46466', 'kecamatan' => 'Padakembang'],
                ['nama' => 'Padakembang', 'latitude' => -7.2988829, 'longitude' => 108.1126889, 'alamat' => 'Kp. Lukurung, Padakembang, Kec. Padakembang, Kabupaten Tasikmalaya, Jawa Barat 46466', 'kecamatan' => 'Padakembang'],
                ['nama' => 'Rancapaku', 'latitude' => -7.3187822, 'longitude' => 108.1410322, 'alamat' => 'Rancapaku, Padakembang, Tasikmalaya Regency, West Java 46466', 'kecamatan' => 'Padakembang'],

                // Pagerageung
                ['nama' => 'Cipacing', 'latitude' => -7.1431445, 'longitude' => 108.1641117, 'alamat' => 'Jl. Cikukuk Cipacing, Cipacing, Kec. Pagerageung, Kabupaten Tasikmalaya, Jawa Barat 46158', 'kecamatan' => 'Pagerageung'],
                ['nama' => 'Guranteng', 'latitude' => -7.0983455, 'longitude' => 108.194067, 'alamat' => 'Guranteng, Pagerageung, Tasikmalaya Regency, West Java 46158', 'kecamatan' => 'Pagerageung'],
                ['nama' => 'Nanggewer', 'latitude' => -7.1011321, 'longitude' => 108.1626318, 'alamat' => 'Nanggewer, Pagerageung, Tasikmalaya Regency, West Java 46158', 'kecamatan' => 'Pagerageung'],
                ['nama' => 'Pagerageung', 'latitude' => -7.1135368, 'longitude' => 108.1686669, 'alamat' => 'Pagerageung, Tasikmalaya Regency, West Java 46158', 'kecamatan' => 'Pagerageung'],
                ['nama' => 'Pagersari', 'latitude' => -7.1285537, 'longitude' => 108.1681788, 'alamat' => 'Pagersari, Pagerageung, Tasikmalaya Regency, West Java 46158', 'kecamatan' => 'Pagerageung'],
                ['nama' => 'Puteran', 'latitude' => -7.1198636, 'longitude' => 108.2014641, 'alamat' => 'Jl. Raya Pagerageung No.16, Puteran, Kec. Pagerageung, Kabupaten Tasikmalaya, Jawa Barat 46158', 'kecamatan' => 'Pagerageung'],
                ['nama' => 'Sukadana', 'latitude' => -7.1179674, 'longitude' => 108.1833067, 'alamat' => 'Sukadana, Tasikmalaya Regency, West Java', 'kecamatan' => 'Pagerageung'],
                ['nama' => 'Sukamaju', 'latitude' => -7.1314342, 'longitude' => 108.1788427, 'alamat' => 'Jl Desa, Sukamaju, Pagerageung, Tasikmalaya Regency, West Java 46158', 'kecamatan' => 'Pagerageung'],
                ['nama' => 'Sukapada', 'latitude' => -7.1182335, 'longitude' => 108.1476851, 'alamat' => 'Sukapada, Pagerageung, Tasikmalaya Regency, West Java 46158', 'kecamatan' => 'Pagerageung'],
                ['nama' => 'Tanjungkerta', 'latitude' => -7.126374, 'longitude' => 108.2119101, 'alamat' => 'Tanjungkerta, Pagerageung, Tasikmalaya Regency, West Java 46158', 'kecamatan' => 'Pagerageung'],

                // Pancatengah
                ['nama' => 'Cibongas', 'latitude' => -7.6606114, 'longitude' => 108.2741295, 'alamat' => 'Cibongas, Kec. Pancatengah, Kabupaten Tasikmalaya, Jawa Barat 46194', 'kecamatan' => 'Pancatengah'],
                ['nama' => 'Cibuniasih', 'latitude' => -7.7475859, 'longitude' => 108.2862297, 'alamat' => 'Unnamed Road, Cibuniasih, Kec. Pancatengah, Kabupaten Tasikmalaya, Jawa Barat 46194', 'kecamatan' => 'Pancatengah'],
                ['nama' => 'Cikawung', 'latitude' => -7.6750659, 'longitude' => 108.3105853, 'alamat' => 'Jl. Raya Cikawung No.45, Cikawung, Kec. Pancatengah, Kabupaten Tasikmalaya, Jawa Barat 46194', 'kecamatan' => 'Pancatengah'],
                ['nama' => 'Jayamukti', 'latitude' => -7.6981995, 'longitude' => 108.2829975, 'alamat' => 'Jayamukti, Pancatengah, Tasikmalaya Regency, West Java 46194', 'kecamatan' => 'Pancatengah'],
                ['nama' => 'Margaluyu', 'latitude' => -7.7598519, 'longitude' => 108.2743163, 'alamat' => 'Margaluyu, Pancatengah, Tasikmalaya Regency, West Java 46194', 'kecamatan' => 'Pancatengah'],
                ['nama' => 'Mekarsari', 'latitude' => -7.6665774, 'longitude' => 108.3380399, 'alamat' => 'Mekarsari, Pancatengah, Tasikmalaya Regency, West Java 46194', 'kecamatan' => 'Pancatengah'],
                ['nama' => 'Neglasari', 'latitude' => -7.6209346, 'longitude' => 108.3382312, 'alamat' => 'Jl. Cayur-Neglasari No.KM. 11, Neglasari, Kec. Pancatengah, Kabupaten Tasikmalaya, Jawa Barat 46194', 'kecamatan' => 'Pancatengah'],
                ['nama' => 'Pancawangi', 'latitude' => -7.7193554, 'longitude' => 108.2746877, 'alamat' => 'Pangliaran, Pancatengah, Tasikmalaya Regency, West Java 46194', 'kecamatan' => 'Pancatengah'],
                ['nama' => 'Pangliaran', 'latitude' => -7.7355581, 'longitude' => 108.278633, 'alamat' => 'Pangliaran, Pancatengah, Tasikmalaya Regency, West Java 46194', 'kecamatan' => 'Pancatengah'],
                ['nama' => 'Tawang', 'latitude' => -7.6603559, 'longitude' => 108.3257128, 'alamat' => 'Tawang, Pancatengah, Tasikmalaya Regency, West Java 46194', 'kecamatan' => 'Pancatengah'],
                ['nama' => 'Tonjong', 'latitude' => -7.6780443, 'longitude' => 108.2734986, 'alamat' => 'Tonjong, Pancatengah, Tasikmalaya Regency, West Java 46194', 'kecamatan' => 'Pancatengah'],

                // Parungponteng
                ['nama' => 'Barumekar', 'latitude' => -7.4902577, 'longitude' => 108.1577586, 'alamat' => 'Barumekar, Kec. Parungponteng, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Parungponteng'],
                ['nama' => 'Burujuljaya', 'latitude' => -7.4703301, 'longitude' => 108.1283995, 'alamat' => 'Burujuljaya, Kec. Parungponteng, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Parungponteng'],
                ['nama' => 'Cibanteng', 'latitude' => -7.4813954, 'longitude' => 108.1228354, 'alamat' => 'Lunjuk, Kp.Sukarintih, Cibanteng, Kec. Parungponteng, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Parungponteng'],
                ['nama' => 'Cibungur', 'latitude' => -7.506674, 'longitude' => 108.1364217, 'alamat' => 'Cibungur, Kec. Parungponteng, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Parungponteng'],
                ['nama' => 'Cigunung', 'latitude' => -7.494627, 'longitude' => 108.1117026, 'alamat' => 'Jl. Sodonghilir - Cipaingeun - Parungponteng, Cigunung, Kec. Parungponteng, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Parungponteng'],
                ['nama' => 'Girikencana', 'latitude' => -7.5127158, 'longitude' => 108.1603168, 'alamat' => 'kp. lengkongjaya, Girikencana, Kec. Parungponteng, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Parungponteng'],
                ['nama' => 'Karyabakti', 'latitude' => -7.5128695, 'longitude' => 108.0957357, 'alamat' => 'Karyabakti, Kec. Parungponteng, Kabupaten Tasikmalaya, Jawa Barat 46185', 'kecamatan' => 'Parungponteng'],
                ['nama' => 'Parungponteng', 'latitude' => -7.4932038, 'longitude' => 108.1516465, 'alamat' => 'Parungponteng, Kec. Parungponteng, Kabupaten Tasikmalaya, Jawa Barat 46476', 'kecamatan' => 'Parungponteng'],

                // Puspahiang
                ['nama' => 'Cimanggu', 'latitude' => -7.4106664, 'longitude' => 108.0813142, 'alamat' => 'Cimanggu, Kec. Puspahiang, Kabupaten Tasikmalaya, Jawa Barat 46471', 'kecamatan' => 'Puspahiang'],
                ['nama' => 'Luyubakti', 'latitude' => -7.4316944, 'longitude' => 108.0828116, 'alamat' => 'Luyubakti, Kec. Puspahiang, Kabupaten Tasikmalaya, Jawa Barat 46471', 'kecamatan' => 'Puspahiang'],
                ['nama' => 'Mandalasari', 'latitude' => -7.406732, 'longitude' => 107.988713, 'alamat' => 'Mandalasari, Puspahiang, Mandalasari, Tasikmalaya, Kabupaten Tasikmalaya, Jawa Barat 46471', 'kecamatan' => 'Puspahiang'],
                ['nama' => 'Puspahiang', 'latitude' => -7.4195681, 'longitude' => 108.0501123, 'alamat' => 'Puspahiang, Kec. Puspahiang, Kabupaten Tasikmalaya, Jawa Barat 46471', 'kecamatan' => 'Puspahiang'],
                ['nama' => 'Puspajaya', 'latitude' => -7.417085, 'longitude' => 108.0708836, 'alamat' => 'Jl. Kota Manggis No.Km.03, Puspajaya, Kec. Puspahiang, Kabupaten Tasikmalaya, Jawa Barat 46472', 'kecamatan' => 'Puspahiang'],
                ['nama' => 'Pusparahayu', 'latitude' => -7.4298533, 'longitude' => 108.0598956, 'alamat' => 'Jl. Ciparia, Desa, Pusparahayu, Kec. Puspahiang, Kabupaten Tasikmalaya, Jawa Barat 46471', 'kecamatan' => 'Puspahiang'],
                ['nama' => 'Puspasari', 'latitude' => -7.414637, 'longitude' => 108.0274425, 'alamat' => 'Puspasari, Kec. Puspahiang, Kabupaten Tasikmalaya, Jawa Barat 46471', 'kecamatan' => 'Puspahiang'],
                ['nama' => 'Sukasari', 'latitude' => -7.3935975, 'longitude' => 107.9880533, 'alamat' => 'Sukasari, Kec. Puspahiang, Kabupaten Tasikmalaya, Jawa Barat 46471', 'kecamatan' => 'Puspahiang'],

                // Rajapolah
                ['nama' => 'Dawagung', 'latitude' => -7.2350184, 'longitude' => 108.1890169, 'alamat' => 'Dawagung, Kec. Rajapolah, Kabupaten Tasikmalaya, Jawa Barat 46155', 'kecamatan' => 'Rajapolah'],
                ['nama' => 'Manggungjaya', 'latitude' => -7.2196845, 'longitude' => 108.1918511, 'alamat' => 'Jl. Margasari, Manggungjaya, Kec. Rajapolah, Kabupaten Tasikmalaya, Jawa Barat 46155', 'kecamatan' => 'Rajapolah'],
                ['nama' => 'Manggungsari', 'latitude' => -7.2066228, 'longitude' => 108.1873741, 'alamat' => 'Jl. Raya Rajapolah, Rajapolah, Kec. Rajapolah, Kabupaten Tasikmalaya, Jawa Barat 46155', 'kecamatan' => 'Rajapolah'],
                ['nama' => 'Rajamandala', 'latitude' => -7.2241702, 'longitude' => 108.1725568, 'alamat' => 'Jl Karang Mulya, Rajamandala, Kec. Rajapolah, Kabupaten Tasikmalaya, Jawa Barat 46155', 'kecamatan' => 'Rajapolah'],
                ['nama' => 'Rajapolah', 'latitude' => -7.2216438, 'longitude' => 108.1904215, 'alamat' => 'Jl. Raya Rajapolah, Rajapolah, Kec. Rajapolah, Kabupaten Tasikmalaya, Jawa Barat 46155', 'kecamatan' => 'Rajapolah'],
                ['nama' => 'Sukanagalih', 'latitude' => -7.2151343, 'longitude' => 108.1714014, 'alamat' => 'Jl. Sukanening KM 3, Sukanagalih, Kec. Rajapolah, Kabupaten Tasikmalaya, Jawa Barat 46155', 'kecamatan' => 'Rajapolah'],
                ['nama' => 'Sukaraja', 'latitude' => -7.2089323, 'longitude' => 108.1761541, 'alamat' => 'Jl. Sukaraja No.51, Sukaraja, Kec. Rajapolah, Kabupaten Tasikmalaya, Jawa Barat 46155', 'kecamatan' => 'Rajapolah'],
                ['nama' => 'Tanjungpura', 'latitude' => -7.1919713, 'longitude' => 108.1855148, 'alamat' => 'Jl. Bima Utama, Tanjungpura, Kec. Rajapolah, Kabupaten Tasikmalaya, Jawa Barat 46155', 'kecamatan' => 'Rajapolah'],

                // Salawu
                ['nama' => 'Jahiang', 'latitude' => -7.3931041, 'longitude' => 108.024722, 'alamat' => 'Jahiang, Salawu, Tasikmalaya Regency, West Java 46471', 'kecamatan' => 'Salawu'],
                ['nama' => 'Karangmukti', 'latitude' => -7.3679736, 'longitude' => 108.0237778, 'alamat' => 'Jl. Garut - Tasikmalaya No.16, Karangmukti, Kec. Salawu, Kabupaten Tasikmalaya, Jawa Barat 46471', 'kecamatan' => 'Salawu'],
                ['nama' => 'Kawungsari', 'latitude' => -7.3408926, 'longitude' => 107.9520229, 'alamat' => 'Tenjowaringin, Salawu, Tasikmalaya Regency, West Java', 'kecamatan' => 'Salawu'],
                ['nama' => 'Kutawaringin', 'latitude' => -7.3471664, 'longitude' => 107.96555, 'alamat' => 'Kutawaringin, Salawu, Tasikmalaya Regency, West Java 46471', 'kecamatan' => 'Salawu'],
                ['nama' => 'Margalaksana', 'latitude' => -7.3767888, 'longitude' => 108.0467606, 'alamat' => 'Margalaksana, Salawu, Tasikmalaya Regency, West Java', 'kecamatan' => 'Salawu'],
                ['nama' => 'Neglasari', 'latitude' => -7.3644441, 'longitude' => 107.9956233, 'alamat' => 'Neglasari, Kec. Salawu, Kabupaten Tasikmalaya, Jawa Barat 46471', 'kecamatan' => 'Salawu'],
                ['nama' => 'Salawu', 'latitude' => -7.372245, 'longitude' => 108.0299756, 'alamat' => 'Karangmukti, Salawu, Tasikmalaya Regency, West Java', 'kecamatan' => 'Salawu'],
                ['nama' => 'Serang', 'latitude' => -7.3708062, 'longitude' => 108.0481187, 'alamat' => 'Serang, Salawu, Tasikmalaya Regency, West Java 46471', 'kecamatan' => 'Salawu'],
                ['nama' => 'Sukarasa', 'latitude' => -7.390229, 'longitude' => 108.0300389, 'alamat' => 'Sukarasa, Kec. Salawu, Kabupaten Tasikmalaya, Jawa Barat 46471', 'kecamatan' => 'Salawu'],
                ['nama' => 'Sundawenang', 'latitude' => -7.3721111, 'longitude' => 107.9982686, 'alamat' => 'Sundawenang, Salawu, Tasikmalaya Regency, West Java', 'kecamatan' => 'Salawu'],
                ['nama' => 'Tanjungsari', 'latitude' => -7.3602583, 'longitude' => 107.983083, 'alamat' => 'Tanjungsari, Kec. Salawu, Kabupaten Tasikmalaya, Jawa Barat 46471', 'kecamatan' => 'Salawu'],
                ['nama' => 'Tenjowaringin', 'latitude' => -7.336847, 'longitude' => 107.9517278, 'alamat' => 'Tenjowaringin, Kec. Salawu, Kabupaten Tasikmalaya, Jawa Barat 46471', 'kecamatan' => 'Salawu'],

                // Salopa
                ['nama' => 'Banjarwaringin', 'latitude' => -7.4892242, 'longitude' => 108.2367487, 'alamat' => 'Jalan Raya, Banjarwaringin, Salopa, Tasikmalaya Regency, West Java 46192', 'kecamatan' => 'Salopa'],
                ['nama' => 'Karyamandala', 'latitude' => -7.5442724, 'longitude' => 108.2811313, 'alamat' => 'Jl. Haurkuning Mandalaguna, Karyamandala, Kec. Salopa, Kabupaten Tasikmalaya, Jawa Barat 46192', 'kecamatan' => 'Salopa'],
                ['nama' => 'Karyawangi', 'latitude' => -7.4517184, 'longitude' => 108.2724529, 'alamat' => 'Karyawangi, Salopa, Tasikmalaya Regency, West Java', 'kecamatan' => 'Salopa'],
                ['nama' => 'Kawitan', 'latitude' => -7.50971, 'longitude' => 108.2698515, 'alamat' => 'Kawitan, Salopa, Tasikmalaya Regency, West Java 46192', 'kecamatan' => 'Salopa'],
                ['nama' => 'Mandalaguna', 'latitude' => -7.5040211, 'longitude' => 108.279378, 'alamat' => 'Mandalaguna, Salopa, Tasikmalaya Regency, West Java 46192', 'kecamatan' => 'Salopa'],
                ['nama' => 'Mandalahayu', 'latitude' => -7.5275227, 'longitude' => 108.2716527, 'alamat' => 'Jalan Raya, Mandalahayu, Salopa, Tasikmalaya Regency, West Java 46192', 'kecamatan' => 'Salopa'],
                ['nama' => 'Mandalawangi', 'latitude' => -7.4937743, 'longitude' => 108.2518919, 'alamat' => 'Mandalawangi, Salopa, Tasikmalaya Regency, West Java 46192', 'kecamatan' => 'Salopa'],
                ['nama' => 'Mulyasari', 'latitude' => -7.5239215, 'longitude' => 108.3239898, 'alamat' => 'Mulyasari, Salopa, Tasikmalaya Regency, West Java 46192', 'kecamatan' => 'Salopa'],
                ['nama' => 'Tanjungsari', 'latitude' => -7.5054592, 'longitude' => 108.3034437, 'alamat' => 'Tanjungsari, Salopa, Tasikmalaya Regency, West Java 46192', 'kecamatan' => 'Salopa'],

                // Sariwangi
                ['nama' => 'Jayaputra', 'latitude' => -7.3262675, 'longitude' => 108.0713031, 'alamat' => 'Jayaputra, Sariwangi, Tasikmalaya Regency, West Java 46465', 'kecamatan' => 'Sariwangi'],
                ['nama' => 'Jayaratu', 'latitude' => -7.3214583, 'longitude' => 108.0622329, 'alamat' => 'Jayaratu, Sariwangi, Tasikmalaya Regency, West Java 46465', 'kecamatan' => 'Sariwangi'],
                ['nama' => 'Linggasirna', 'latitude' => -7.335558, 'longitude' => 108.0815237, 'alamat' => 'Linggasirna, Kec. Sariwangi, Kabupaten Tasikmalaya, Jawa Barat 46465', 'kecamatan' => 'Sariwangi'],
                ['nama' => 'Sariwangi', 'latitude' => -7.3289906, 'longitude' => 108.0788456, 'alamat' => 'Jl. Raya Sariwangi No.52, Sariwangi, Kec. Sariwangi, Kabupaten Tasikmalaya, Jawa Barat 46465', 'kecamatan' => 'Sariwangi'],
                ['nama' => 'Selawangi', 'latitude' => -7.3331116, 'longitude' => 108.0955542, 'alamat' => 'Selawangi, Sariwangi, Tasikmalaya Regency, West Java 46465', 'kecamatan' => 'Sariwangi'],
                ['nama' => 'Sirnasari', 'latitude' => -7.3061335, 'longitude' => 108.0627073, 'alamat' => 'Sukamulih, Tasikmalaya Regency, West Java', 'kecamatan' => 'Sariwangi'],
                ['nama' => 'Sukaharja', 'latitude' => -7.3103735, 'longitude' => 108.0532193, 'alamat' => 'Sukaharja, Sariwangi, Tasikmalaya Regency, West Java 46465', 'kecamatan' => 'Sariwangi'],
                ['nama' => 'Sukamulih', 'latitude' => -7.3125283, 'longitude' => 108.0688535, 'alamat' => 'babakan, Sukamulih, Kec. Sariwangi, Kabupaten Tasikmalaya, Jawa Barat 46465', 'kecamatan' => 'Sariwangi'],

                // Singaparna
                ['nama' => 'Cikadongdong', 'latitude' => -7.3471856, 'longitude' => 108.1649133, 'alamat' => 'Cikadongdong, Singaparna, Tasikmalaya Regency, West Java 46418', 'kecamatan' => 'Singaparna'],
                ['nama' => 'Cikunir', 'latitude' => -7.3446758, 'longitude' => 108.1489164, 'alamat' => 'Cikunir, Singaparna, Tasikmalaya Regency, West Java 46418', 'kecamatan' => 'Singaparna'],
                ['nama' => 'Cikunten', 'latitude' => -7.3551672, 'longitude' => 108.1057045, 'alamat' => 'Jl. Garut - Tasikmalaya No.12, Cikunten, Kec. Singaparna, Kabupaten Tasikmalaya, Jawa Barat 46414', 'kecamatan' => 'Singaparna'],
                ['nama' => 'Cintaraja', 'latitude' => -7.3452776, 'longitude' => 108.1410336, 'alamat' => 'Cintaraja, Singaparna, Tasikmalaya Regency, West Java', 'kecamatan' => 'Singaparna'],
                ['nama' => 'Cipakat', 'latitude' => -7.3535639, 'longitude' => 108.1226994, 'alamat' => 'Singaparna, Cipakat, Singaparna, Tasikmalaya Regency, West Java 46417', 'kecamatan' => 'Singaparna'],
                ['nama' => 'Singaparna', 'latitude' => -7.344763, 'longitude' => 108.1145833, 'alamat' => 'Singaparna, Tasikmalaya Regency, West Java 46411', 'kecamatan' => 'Singaparna'],
                ['nama' => 'Singasari', 'latitude' => -7.3547137, 'longitude' => 108.1080043, 'alamat' => 'Singasari, Singaparna, Tasikmalaya Regency, West Java 46412', 'kecamatan' => 'Singaparna'],
                ['nama' => 'Sukaasih', 'latitude' => -7.3644268, 'longitude' => 108.1221256, 'alamat' => 'Jl. KHZ. Mustafa, Sukarapih, Kec. Singaparna, Kabupaten Tasikmalaya, Jawa Barat 46461', 'kecamatan' => 'Singaparna'],
                ['nama' => 'Sukaherang', 'latitude' => -7.3472033, 'longitude' => 108.0972664, 'alamat' => 'Jl. Desa Sukaherang, Sukaherang, Kec. Singaparna, Kabupaten Tasikmalaya, Jawa Barat 46413', 'kecamatan' => 'Singaparna'],
                ['nama' => 'Sukamulya', 'latitude' => -7.3591211, 'longitude' => 108.1195253, 'alamat' => 'Jl. Raya Pemda, Sukamulya, Kec. Singaparna, Kabupaten Tasikmalaya, Jawa Barat 46416', 'kecamatan' => 'Singaparna'],

                // Sodonghilir
                ['nama' => 'Cikalong', 'latitude' => -7.4597739, 'longitude' => 108.0517038, 'alamat' => 'Cikalong, Kec. Sodonghilir, Kabupaten Tasikmalaya, Jawa Barat 40291', 'kecamatan' => 'Sodonghilir'],
                ['nama' => 'Cipaingeun', 'latitude' => -7.480995, 'longitude' => 108.0936873, 'alamat' => 'Cipaingeun, Sodonghilir, Tasikmalaya Regency, West Java 46473', 'kecamatan' => 'Sodonghilir'],
                ['nama' => 'Cukangjayaguna', 'latitude' => -7.504259, 'longitude' => 108.0066461, 'alamat' => 'Cukangjayaguna, Sodonghilir, Tasikmalaya Regency, West Java 46473', 'kecamatan' => 'Sodonghilir'],
                ['nama' => 'Cukangkawung', 'latitude' => -7.4748487, 'longitude' => 108.0153171, 'alamat' => 'Cukangkawung, Sodonghilir, Tasikmalaya Regency, West Java 46473', 'kecamatan' => 'Sodonghilir'],
                ['nama' => 'Leuwidulang', 'latitude' => -7.45891, 'longitude' => 108.1111304, 'alamat' => 'Leuwidulang, Kec. Sodonghilir, Kabupaten Tasikmalaya, Jawa Barat 46473', 'kecamatan' => 'Sodonghilir'],
                ['nama' => 'Muncang', 'latitude' => -7.4710891, 'longitude' => 108.0818854, 'alamat' => 'Jl. Sodonghilir - Cipaingeun - Parungponteng, Muncang, Kec. Sodonghilir, Kabupaten Tasikmalaya, Jawa Barat 46473', 'kecamatan' => 'Sodonghilir'],
                ['nama' => 'Pakalongan', 'latitude' => -7.4699978, 'longitude' => 108.1028825, 'alamat' => 'Pakalongan, Sodonghilir, Tasikmalaya Regency, West Java 46473', 'kecamatan' => 'Sodonghilir'],
                ['nama' => 'Parumasan', 'latitude' => -7.5199526, 'longitude' => 108.0434548, 'alamat' => 'Parumasan, Sodonghilir, Tasikmalaya Regency, West Java 46473', 'kecamatan' => 'Sodonghilir'],
                ['nama' => 'Raksajaya', 'latitude' => -7.4949871, 'longitude' => 108.0832246, 'alamat' => 'Gembor, Raksajaya, Sodonghilir, Tasikmalaya Regency, West Java 46473', 'kecamatan' => 'Sodonghilir'],
                ['nama' => 'Sepatnunggal', 'latitude' => -7.51387, 'longitude' => 108.0701388, 'alamat' => 'Sepatnunggal, Sodonghilir, Tasikmalaya Regency, West Java 46473', 'kecamatan' => 'Sodonghilir'],
                ['nama' => 'Sodonghilir', 'latitude' => -7.4847024, 'longitude' => 108.0494329, 'alamat' => 'Sodonghilir, Tasikmalaya Regency, West Java', 'kecamatan' => 'Sodonghilir'],
                ['nama' => 'Sukabakti', 'latitude' => -7.4942009, 'longitude' => 108.0312166, 'alamat' => 'Cukangkawung, Sodonghilir, Tasikmalaya Regency, West Java 46473', 'kecamatan' => 'Sodonghilir'],

                // Sukahening
                ['nama' => 'Banyurasa', 'latitude' => -7.2255528, 'longitude' => 108.1598718, 'alamat' => 'Banyurasa, Kec. Sukahening, Kabupaten Tasikmalaya, Jawa Barat 46155', 'kecamatan' => 'Sukahening'],
                ['nama' => 'Banyuresmi', 'latitude' => -7.2158128, 'longitude' => 108.1568712, 'alamat' => 'Kp. Banuherang, RT. 004 RW. 001, Ds. Banyuresmi, Banyuresmi, Kec. Sukahening, Kabupaten Tasikmalaya, Jawa Barat 46155', 'kecamatan' => 'Sukahening'],
                ['nama' => 'Calincing', 'latitude' => -7.2121815, 'longitude' => 108.1555611, 'alamat' => 'Calingcing, Kec. Sukahening, Kabupaten Tasikmalaya, Jawa Barat 46155', 'kecamatan' => 'Sukahening'],
                ['nama' => 'Kiarajangkung', 'latitude' => -7.2003313, 'longitude' => 108.1291826, 'alamat' => 'Kiarajangkung, Kec. Sukahening, Kabupaten Tasikmalaya, Jawa Barat 46155', 'kecamatan' => 'Sukahening'],
                ['nama' => 'Kudadepa', 'latitude' => -7.2151531, 'longitude' => 108.1323364, 'alamat' => 'JL.DESA Jl. Kp. Ciengang, Kudadepa, Kec. Sukahening, Kabupaten Tasikmalaya, Jawa Barat 46155', 'kecamatan' => 'Sukahening'],
                ['nama' => 'Sukahening', 'latitude' => -7.204551, 'longitude' => 108.1506312, 'alamat' => 'Jl. Rajapolah Sukahening, Sukahening, Kec. Sukahening, Kabupaten Tasikmalaya, Jawa Barat 46155', 'kecamatan' => 'Sukahening'],
                ['nama' => 'Sundakerta', 'latitude' => -7.2068097, 'longitude' => 108.1266527, 'alamat' => 'Sukahening, Kec. Sukahening, Kabupaten Tasikmalaya, Jawa Barat 46155', 'kecamatan' => 'Sukahening'],

                // Sukaraja
                ['nama' => 'Janggala', 'latitude' => -7.4551414, 'longitude' => 108.1932553, 'alamat' => 'Jl. Karangnunggal, Sukapura, Kec. Sukaraja, Kabupaten Tasikmalaya, Jawa Barat 46183', 'kecamatan' => 'Sukaraja'],
                ['nama' => 'Leuwibudah', 'latitude' => -7.4091841, 'longitude' => 108.1720112, 'alamat' => 'Jl. Raya Cibalanarik, Leuwibudah, Kec. Sukaraja, Kabupaten Tasikmalaya, Jawa Barat 46183', 'kecamatan' => 'Sukaraja'],
                ['nama' => 'Linggaraja', 'latitude' => -7.4258411, 'longitude' => 108.1424322, 'alamat' => 'Linggaraja, Kec. Sukaraja, Kabupaten Tasikmalaya, Jawa Barat 46183', 'kecamatan' => 'Sukaraja'],
                ['nama' => 'Margalaksana', 'latitude' => -7.4061022, 'longitude' => 108.1763658, 'alamat' => 'Margalaksana, Kec. Sukaraja, Kabupaten Tasikmalaya, Jawa Barat 46183', 'kecamatan' => 'Sukaraja'],
                ['nama' => 'Mekarjaya', 'latitude' => -7.4397585, 'longitude' => 108.1563422, 'alamat' => 'Mekarjaya, Sukaraja, Tasikmalaya Regency, West Java 46183', 'kecamatan' => 'Sukaraja'],
                ['nama' => 'Sirnajaya', 'latitude' => -7.4705125, 'longitude' => 108.1882787, 'alamat' => 'Ciganda, Cijoho, Mekarjaya, Kec. Sukaraja, Kabupaten Tasikmalaya, Jawa Barat 46183', 'kecamatan' => 'Sukaraja'],
                ['nama' => 'Sukapura', 'latitude' => -7.4480491, 'longitude' => 108.1847013, 'alamat' => 'Jl. Sukahurip No.288, Sukapura, Kec. Sukaraja, Kabupaten Tasikmalaya, Jawa Barat 46183', 'kecamatan' => 'Sukaraja'],
                ['nama' => 'Tarunajaya', 'latitude' => -7.4207272, 'longitude' => 108.1841143, 'alamat' => 'Kp. Cimawate KM5 Sukaraja, Tasikmalaya, Jawa Barat, Indonesia, Tarunajaya, Kec. Sukaraja, Kabupaten Tasikmalaya, Jawa Barat 46183', 'kecamatan' => 'Sukaraja'],

                // Sukarame
                ['nama' => 'Padasuka', 'latitude' => -7.3756695, 'longitude' => 108.1637316, 'alamat' => 'Padasuka, Kec. Sukarame, Kabupaten Tasikmalaya, Jawa Barat 46461', 'kecamatan' => 'Sukarame'],
                ['nama' => 'Sukakarsa', 'latitude' => -7.368287, 'longitude' => 108.1608872, 'alamat' => 'Sukakarsa, Kec. Sukarame, Kabupaten Tasikmalaya, Jawa Barat 46461', 'kecamatan' => 'Sukarame'],
                ['nama' => 'Sukamenak', 'latitude' => -7.3822766, 'longitude' => 108.1593899, 'alamat' => 'Suka Menak, Sukarame, Tasikmalaya Regency, West Java 46461', 'kecamatan' => 'Sukarame'],
                ['nama' => 'Sukarame', 'latitude' => -7.3604481, 'longitude' => 108.1374378, 'alamat' => 'Sukarame, Kec. Sukarame, Kabupaten Tasikmalaya, Jawa Barat 46461', 'kecamatan' => 'Sukarame'],
                ['nama' => 'Sukarapih', 'latitude' => -7.3784293, 'longitude' => 108.1349471, 'alamat' => 'Jl. KHZ. Mustafa, Sukarapih, Kec. Sukarame, Kabupaten Tasikmalaya, Jawa Barat 46461', 'kecamatan' => 'Sukarame'],
                ['nama' => 'Wargakerta', 'latitude' => -7.3837149, 'longitude' => 108.147929, 'alamat' => 'Jl. KHZ. Mustafa, Wargakerta, Kec. Sukarame, Kabupaten Tasikmalaya, Jawa Barat 46461', 'kecamatan' => 'Sukarame'],

                // Sukaratu
                ['nama' => 'Gunungsari', 'latitude' => -7.3197256, 'longitude' => 108.1568575, 'alamat' => 'Jl. Cipanas Galunggung, Gunungsari, Kec. Sukaratu, Kabupaten Tasikmalaya, Jawa Barat 46415', 'kecamatan' => 'Sukaratu'],
                ['nama' => 'Indrajaya', 'latitude' => -7.2684665, 'longitude' => 108.1372518, 'alamat' => 'Jl. Cicurug 1, Indrajaya, Kec. Sukaratu, Kabupaten Tasikmalaya, Jawa Barat 46415', 'kecamatan' => 'Sukaratu'],
                ['nama' => 'Linggajati', 'latitude' => -7.2792676, 'longitude' => 108.1158337, 'alamat' => 'Linggajati, Kec. Sukaratu, Kabupaten Tasikmalaya, Jawa Barat 46415', 'kecamatan' => 'Sukaratu'],
                ['nama' => 'Sinagar', 'latitude' => -7.279435, 'longitude' => 108.1313598, 'alamat' => 'Sinagar, Kec. Sukaratu, Kabupaten Tasikmalaya, Jawa Barat', 'kecamatan' => 'Sukaratu'],
                ['nama' => 'Sukagalih', 'latitude' => -7.2774037, 'longitude' => 108.1731922, 'alamat' => 'Sukagalih, Kec. Sukaratu, Kabupaten Tasikmalaya, Jawa Barat 46415', 'kecamatan' => 'Sukaratu'],
                ['nama' => 'Sukamahi', 'latitude' => -7.2796748, 'longitude' => 108.1670369, 'alamat' => 'Sukamahi, Kec. Sukaratu, Kabupaten Tasikmalaya, Jawa Barat 46415', 'kecamatan' => 'Sukaratu'],
                ['nama' => 'Sukaratu', 'latitude' => -7.2754655, 'longitude' => 108.1438259, 'alamat' => 'Sukaratu, Kec. Sukaratu, Kabupaten Tasikmalaya, Jawa Barat 46452', 'kecamatan' => 'Sukaratu'],
                ['nama' => 'Tawangbanteng', 'latitude' => -7.3144328, 'longitude' => 108.1444077, 'alamat' => 'Jl. Tawang Banteng - Cipanas Galunggung No.16, Tawangbanteng, Kec. Sukaratu, Kabupaten Tasikmalaya, Jawa Barat 46415', 'kecamatan' => 'Sukaratu'],

                // Sukaresik
                ['nama' => 'Banjarsari', 'latitude' => -7.1505186, 'longitude' => 108.1882293, 'alamat' => 'Jl. Banjarsari No.004, Banjarsari, Kec. Sukaresik, Kabupaten Tasikmalaya, Jawa Barat 46159', 'kecamatan' => 'Sukaresik'],
                ['nama' => 'Cipondok', 'latitude' => -7.1599818, 'longitude' => 108.1676183, 'alamat' => 'Jl. Cipanjang No.1 ,Cipondok, Sukaresik, 46159, Cipondok, Kec. Sukaresik, Kabupaten Tasikmalaya, Jawa Barat 46418', 'kecamatan' => 'Sukaresik'],
                ['nama' => 'Margamulya', 'latitude' => -7.1699715, 'longitude' => 108.1666417, 'alamat' => 'Jl. Raya Sukasenang No.53, Margamulya, Kec. Sukaresik, Kabupaten Tasikmalaya, Jawa Barat 46418', 'kecamatan' => 'Sukaresik'],
                ['nama' => 'Sukamenak', 'latitude' => -7.1695288, 'longitude' => 108.1804588, 'alamat' => 'Sukamenak, Kec. Sukaresik, Kabupaten Tasikmalaya, Jawa Barat 46418', 'kecamatan' => 'Sukaresik'],
                ['nama' => 'Sukapancar', 'latitude' => -7.1420483, 'longitude' => 108.1802219, 'alamat' => 'Sukapancar, Kec. Sukaresik, Kabupaten Tasikmalaya, Jawa Barat 46418', 'kecamatan' => 'Sukaresik'],
                ['nama' => 'Sukaratu', 'latitude' => -7.1564506, 'longitude' => 108.1895528, 'alamat' => 'Jl. Raya Sukaratu, Sukaratu, Kec. Sukaresik, Kabupaten Tasikmalaya, Jawa Barat 46471', 'kecamatan' => 'Sukaresik'],
                ['nama' => 'Sukaresik', 'latitude' => -7.1617047, 'longitude' => 108.1854584, 'alamat' => 'Sukaresik, Kec. Sukaresik, Kabupaten Tasikmalaya, Jawa Barat 46471', 'kecamatan' => 'Sukaresik'],
                ['nama' => 'Tanjungsari', 'latitude' => -7.1407662, 'longitude' => 108.1997382, 'alamat' => 'Tanjungsari, Kec. Sukaresik, Kabupaten Tasikmalaya, Jawa Barat 46471', 'kecamatan' => 'Sukaresik'],

                // Tanjungjaya
                ['nama' => 'Cibalanarik', 'latitude' => -7.3915207, 'longitude' => 108.1490542, 'alamat' => 'Jl. Sukaraja - Mangunreja, Cibalanarik, Kec. Tanjungjaya, Kabupaten Tasikmalaya, Jawa Barat 46184', 'kecamatan' => 'Tanjungjaya'],
                ['nama' => 'Cikeusal', 'latitude' => -7.4341369, 'longitude' => 108.113239, 'alamat' => 'Cikeusal, Kec. Tanjungjaya, Kabupaten Tasikmalaya, Jawa Barat 46184', 'kecamatan' => 'Tanjungjaya'],
                ['nama' => 'Cilolohan', 'latitude' => -7.4032069, 'longitude' => 108.1546343, 'alamat' => 'Cilolohan, Kec. Tanjungjaya, Kabupaten Tasikmalaya, Jawa Barat 46184', 'kecamatan' => 'Tanjungjaya'],
                ['nama' => 'Cintajaya', 'latitude' => -7.390908, 'longitude' => 108.135852, 'alamat' => 'Cintajaya, Kec. Tanjungjaya, Kabupaten Tasikmalaya, Jawa Barat 46184', 'kecamatan' => 'Tanjungjaya'],
                ['nama' => 'Sukanagara', 'latitude' => -7.4047389, 'longitude' => 108.1012904, 'alamat' => 'Sukanagara, Kec. Tanjungjaya, Kabupaten Tasikmalaya, Jawa Barat 46184', 'kecamatan' => 'Tanjungjaya'],
                ['nama' => 'Sukasenang', 'latitude' => -7.403975, 'longitude' => 108.1177215, 'alamat' => 'Sukasenang, Kec. Tanjungjaya, Kabupaten Tasikmalaya, Jawa Barat 46184', 'kecamatan' => 'Tanjungjaya'],
                ['nama' => 'Tanjungjaya', 'latitude' => -7.3853491, 'longitude' => 108.1261467, 'alamat' => 'Jl. Pasir Jaya, Tanjungjaya, Kec. Tanjungjaya, Kabupaten Tasikmalaya, Jawa Barat 46184', 'kecamatan' => 'Tanjungjaya'],

                // Taraju
                ['nama' => 'Banyuasih', 'latitude' => -7.4565978, 'longitude' => 107.9713899, 'alamat' => 'Jl.Raya Barat Taraju Bojonggambir No. 04, Banyuasih, Kec. Taraju, Kabupaten Tasikmalaya, Jawa Barat 46474', 'kecamatan' => 'Taraju'],
                ['nama' => 'Cikubang', 'latitude' => -7.4440823, 'longitude' => 108.0226381, 'alamat' => 'Unnamed Road, Cikubang, Kec. Taraju, Kabupaten Tasikmalaya, Jawa Barat 46474', 'kecamatan' => 'Taraju'],
                ['nama' => 'Deudeul', 'latitude' => -7.4313684, 'longitude' => 108.0269519, 'alamat' => 'Deudeul, Kec. Taraju, Kabupaten Tasikmalaya, Jawa Barat 46474', 'kecamatan' => 'Taraju'],
                ['nama' => 'Kertaraharja', 'latitude' => -7.4308365, 'longitude' => 108.0085977, 'alamat' => 'Kertaraharja, Kec. Taraju, Kabupaten Tasikmalaya, Jawa Barat 46474', 'kecamatan' => 'Taraju'],
                ['nama' => 'Pageralam', 'latitude' => -7.4349334, 'longitude' => 107.9930246, 'alamat' => 'Pageralam, Kec. Taraju, Kabupaten Tasikmalaya, Jawa Barat 46474', 'kecamatan' => 'Taraju'],
                ['nama' => 'Purwarahayu', 'latitude' => -7.4214679, 'longitude' => 107.9969831, 'alamat' => 'Unnamed Road, Purwarahayu, Kec. Taraju, Kabupaten Tasikmalaya, Jawa Barat 46474', 'kecamatan' => 'Taraju'],
                ['nama' => 'Raksasari', 'latitude' => -7.4601635, 'longitude' => 107.986787, 'alamat' => 'Raksasari, Kec. Taraju, Kabupaten Tasikmalaya, Jawa Barat', 'kecamatan' => 'Taraju'],
                ['nama' => 'Singasari', 'latitude' => -7.4568658, 'longitude' => 108.0003652, 'alamat' => 'Jl. Raya Taraju No.266, Singasari, Kec. Taraju, Kabupaten Tasikmalaya, Jawa Barat 46474', 'kecamatan' => 'Taraju'],
                ['nama' => 'Taraju', 'latitude' => -7.4585354, 'longitude' => 107.9806597, 'alamat' => 'Taraju, Kec. Taraju, Kabupaten Tasikmalaya, Jawa Barat', 'kecamatan' => 'Taraju'],
        ];
    }
}