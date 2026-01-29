<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class WilayahDesaSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Delete existing data
        DB::table('wilayah_desa')->delete();

        $data = [
            // Kecamatan 01 - Cipatujah
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '01', 'kode' => '2001', 'nama' => 'Ciheras'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '01', 'kode' => '2002', 'nama' => 'Cipatujah'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '01', 'kode' => '2003', 'nama' => 'Sindangkerta'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '01', 'kode' => '2004', 'nama' => 'Cikawungading'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '01', 'kode' => '2005', 'nama' => 'Bantarkalong'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '01', 'kode' => '2006', 'nama' => 'Darawati'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '01', 'kode' => '2007', 'nama' => 'Nagrog'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '01', 'kode' => '2008', 'nama' => 'Pameutingan'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '01', 'kode' => '2009', 'nama' => 'Tobongjaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '01', 'kode' => '2010', 'nama' => 'Cipanas'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '01', 'kode' => '2011', 'nama' => 'Kertasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '01', 'kode' => '2012', 'nama' => 'Ciandum'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '01', 'kode' => '2013', 'nama' => 'Nangelasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '01', 'kode' => '2014', 'nama' => 'Padawaras'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '01', 'kode' => '2015', 'nama' => 'Sukahurip'],

            // Kecamatan 02 - Karangnunggal
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '02', 'kode' => '2001', 'nama' => 'Cidadap'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '02', 'kode' => '2002', 'nama' => 'Ciawi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '02', 'kode' => '2003', 'nama' => 'Cikupa'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '02', 'kode' => '2004', 'nama' => 'Karangnunggal'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '02', 'kode' => '2005', 'nama' => 'Karangmekar'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '02', 'kode' => '2006', 'nama' => 'Cikukulu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '02', 'kode' => '2007', 'nama' => 'Cibatuireng'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '02', 'kode' => '2008', 'nama' => 'Cibatu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '02', 'kode' => '2009', 'nama' => 'Sarimanggu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '02', 'kode' => '2010', 'nama' => 'Sukawangun'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '02', 'kode' => '2011', 'nama' => 'Cintawangi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '02', 'kode' => '2012', 'nama' => 'Cikapinis'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '02', 'kode' => '2013', 'nama' => 'Sarimukti'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '02', 'kode' => '2014', 'nama' => 'Kujang'],

            // Kecamatan 03 - Cikalong
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '03', 'kode' => '2001', 'nama' => 'Cikalong'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '03', 'kode' => '2002', 'nama' => 'Kalapagenep'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '03', 'kode' => '2003', 'nama' => 'Cikancra'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '03', 'kode' => '2004', 'nama' => 'Singkir'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '03', 'kode' => '2005', 'nama' => 'Panyiaran'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '03', 'kode' => '2006', 'nama' => 'Cibeber'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '03', 'kode' => '2007', 'nama' => 'Cikadu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '03', 'kode' => '2008', 'nama' => 'Mandalajaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '03', 'kode' => '2009', 'nama' => 'Cidadali'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '03', 'kode' => '2010', 'nama' => 'Cimanuk'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '03', 'kode' => '2011', 'nama' => 'Sindangjaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '03', 'kode' => '2012', 'nama' => 'Kubangsari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '03', 'kode' => '2013', 'nama' => 'Tonjongsari'],

            // Kecamatan 04 - Pancatengah
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '04', 'kode' => '2001', 'nama' => 'Cibuniasih'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '04', 'kode' => '2002', 'nama' => 'Pangliaran'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '04', 'kode' => '2003', 'nama' => 'Tonjong'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '04', 'kode' => '2004', 'nama' => 'Cibongas'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '04', 'kode' => '2005', 'nama' => 'Tawang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '04', 'kode' => '2006', 'nama' => 'Neglasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '04', 'kode' => '2007', 'nama' => 'Cikawung'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '04', 'kode' => '2008', 'nama' => 'Jayamukti'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '04', 'kode' => '2009', 'nama' => 'Margaluyu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '04', 'kode' => '2010', 'nama' => 'Mekarsari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '04', 'kode' => '2011', 'nama' => 'Pancawangi'],

            // Kecamatan 05 - Cikatomas
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '05', 'kode' => '2001', 'nama' => 'Gunungsari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '05', 'kode' => '2002', 'nama' => 'Cilumba'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '05', 'kode' => '2003', 'nama' => 'Pakemitan'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '05', 'kode' => '2004', 'nama' => 'Cogreg'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '05', 'kode' => '2005', 'nama' => 'Cayur'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '05', 'kode' => '2006', 'nama' => 'Lengkongbarang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '05', 'kode' => '2007', 'nama' => 'Sindangasih'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '05', 'kode' => '2008', 'nama' => 'Tanjungbarang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '05', 'kode' => '2009', 'nama' => 'Linggalaksana'],

            // Kecamatan 06 - Cibalong
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '06', 'kode' => '2001', 'nama' => 'Cisempur'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '06', 'kode' => '2002', 'nama' => 'Setiawaras'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '06', 'kode' => '2003', 'nama' => 'Eureunpalay'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '06', 'kode' => '2004', 'nama' => 'Cibalong'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '06', 'kode' => '2005', 'nama' => 'Singajaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '06', 'kode' => '2006', 'nama' => 'Parung'],

            // Kecamatan 07 - Parungponteng
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '07', 'kode' => '2001', 'nama' => 'Parungponteng'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '07', 'kode' => '2002', 'nama' => 'Cigunung'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '07', 'kode' => '2003', 'nama' => 'Cibanteng'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '07', 'kode' => '2004', 'nama' => 'Barumekar'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '07', 'kode' => '2005', 'nama' => 'Cibungur'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '07', 'kode' => '2006', 'nama' => 'Burujuljaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '07', 'kode' => '2007', 'nama' => 'Girikencana'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '07', 'kode' => '2008', 'nama' => 'Karyabakti'],

            // Kecamatan 08 - Bantarkalong
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '08', 'kode' => '2001', 'nama' => 'Simpang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '08', 'kode' => '2002', 'nama' => 'Parakanhonje'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '08', 'kode' => '2003', 'nama' => 'Pamijahan'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '08', 'kode' => '2004', 'nama' => 'Sukamaju'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '08', 'kode' => '2005', 'nama' => 'Wangunsari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '08', 'kode' => '2006', 'nama' => 'Hegarwangi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '08', 'kode' => '2007', 'nama' => 'Wakap'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '08', 'kode' => '2008', 'nama' => 'Sirnagalih'],

            // Kecamatan 09 - Bojongasih
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '09', 'kode' => '2001', 'nama' => 'Mertajaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '09', 'kode' => '2002', 'nama' => 'Cikadongdong'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '09', 'kode' => '2003', 'nama' => 'Bojongasih'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '09', 'kode' => '2004', 'nama' => 'Sindangsari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '09', 'kode' => '2005', 'nama' => 'Girijaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '09', 'kode' => '2006', 'nama' => 'Toblongan'],

            // Kecamatan 10 - Culamega
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '10', 'kode' => '2001', 'nama' => 'Cikuya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '10', 'kode' => '2002', 'nama' => 'Cintabodas'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '10', 'kode' => '2003', 'nama' => 'Cipicung'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '10', 'kode' => '2004', 'nama' => 'Bojongsari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '10', 'kode' => '2005', 'nama' => 'Mekarlaksana'],

            // Kecamatan 11 - Bojonggambir
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '11', 'kode' => '2001', 'nama' => 'Bojongkapol'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '11', 'kode' => '2002', 'nama' => 'Pedangkamulyan'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '11', 'kode' => '2003', 'nama' => 'Bojonggambir'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '11', 'kode' => '2004', 'nama' => 'Ciroyom'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '11', 'kode' => '2005', 'nama' => 'Wandasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '11', 'kode' => '2006', 'nama' => 'Campakasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '11', 'kode' => '2007', 'nama' => 'Mangkonjaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '11', 'kode' => '2008', 'nama' => 'Kertanegla'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '11', 'kode' => '2009', 'nama' => 'Purwaraharja'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '11', 'kode' => '2010', 'nama' => 'Girimukti'],

            // Kecamatan 12 - Sodonghilir
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '12', 'kode' => '2001', 'nama' => 'Parumasan'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '12', 'kode' => '2002', 'nama' => 'Cukangkawung'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '12', 'kode' => '2003', 'nama' => 'Sodonghilir'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '12', 'kode' => '2004', 'nama' => 'Cikalong'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '12', 'kode' => '2005', 'nama' => 'Cipaingeun'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '12', 'kode' => '2006', 'nama' => 'Leuwidulang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '12', 'kode' => '2007', 'nama' => 'Muncang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '12', 'kode' => '2008', 'nama' => 'Sepatnunggal'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '12', 'kode' => '2009', 'nama' => 'Cukangjayaguna'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '12', 'kode' => '2010', 'nama' => 'Raksajaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '12', 'kode' => '2011', 'nama' => 'Pakalongan'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '12', 'kode' => '2012', 'nama' => 'Sukabakti'],

            // Kecamatan 13 - Taraju
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '13', 'kode' => '2001', 'nama' => 'Taraju'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '13', 'kode' => '2002', 'nama' => 'Cikubang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '13', 'kode' => '2003', 'nama' => 'Deudeul'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '13', 'kode' => '2004', 'nama' => 'Purwarahayu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '13', 'kode' => '2005', 'nama' => 'Singasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '13', 'kode' => '2006', 'nama' => 'Banyuasih'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '13', 'kode' => '2007', 'nama' => 'Raksasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '13', 'kode' => '2008', 'nama' => 'Kertaraharja'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '13', 'kode' => '2009', 'nama' => 'Pageralam'],

            // Kecamatan 14 - Salawu
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '14', 'kode' => '2001', 'nama' => 'Jahiang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '14', 'kode' => '2002', 'nama' => 'Serang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '14', 'kode' => '2003', 'nama' => 'Salawu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '14', 'kode' => '2004', 'nama' => 'Neglasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '14', 'kode' => '2005', 'nama' => 'Tanjungsari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '14', 'kode' => '2006', 'nama' => 'Tenjowaringin'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '14', 'kode' => '2007', 'nama' => 'Sundawenang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '14', 'kode' => '2008', 'nama' => 'Kawungsari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '14', 'kode' => '2009', 'nama' => 'Sukarasa'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '14', 'kode' => '2010', 'nama' => 'Kutawaringin'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '14', 'kode' => '2011', 'nama' => 'Karangmukti'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '14', 'kode' => '2012', 'nama' => 'Margalaksana'],

            // Kecamatan 15 - Puspahiang
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '15', 'kode' => '2001', 'nama' => 'Mandalasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '15', 'kode' => '2002', 'nama' => 'Sukasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '15', 'kode' => '2003', 'nama' => 'Puspasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '15', 'kode' => '2004', 'nama' => 'Puspahiang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '15', 'kode' => '2005', 'nama' => 'Luyubakti'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '15', 'kode' => '2006', 'nama' => 'Pusparahayu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '15', 'kode' => '2007', 'nama' => 'Cimanggu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '15', 'kode' => '2008', 'nama' => 'Puspajaya'],

            // Kecamatan 16 - Tanjungjaya
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '16', 'kode' => '2001', 'nama' => 'Cikeusal'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '16', 'kode' => '2002', 'nama' => 'Cibalanarik'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '16', 'kode' => '2003', 'nama' => 'Sukanagara'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '16', 'kode' => '2004', 'nama' => 'Tanjungjaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '16', 'kode' => '2005', 'nama' => 'Cilolohan'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '16', 'kode' => '2006', 'nama' => 'Cintajaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '16', 'kode' => '2007', 'nama' => 'Sukasenang'],

            // Kecamatan 17 - Sukaraja
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '17', 'kode' => '2001', 'nama' => 'Sukapura'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '17', 'kode' => '2002', 'nama' => 'Leuwibudah'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '17', 'kode' => '2003', 'nama' => 'Sirnajaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '17', 'kode' => '2004', 'nama' => 'Mekarjaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '17', 'kode' => '2005', 'nama' => 'Linggaraja'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '17', 'kode' => '2006', 'nama' => 'Janggala'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '17', 'kode' => '2007', 'nama' => 'Margalaksana'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '17', 'kode' => '2008', 'nama' => 'Tarunajaya'],

            // Kecamatan 18 - Salopa
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '18', 'kode' => '2001', 'nama' => 'Mandalahayu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '18', 'kode' => '2002', 'nama' => 'Mulyasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '18', 'kode' => '2003', 'nama' => 'Kawitan'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '18', 'kode' => '2004', 'nama' => 'Mandalawangi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '18', 'kode' => '2005', 'nama' => 'Karyawangi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '18', 'kode' => '2006', 'nama' => 'Tanjungsari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '18', 'kode' => '2007', 'nama' => 'Mandalaguna'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '18', 'kode' => '2008', 'nama' => 'Karyamandala'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '18', 'kode' => '2009', 'nama' => 'Banjarwaringin'],

            // Kecamatan 19 - Jatiwaras
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '19', 'kode' => '2001', 'nama' => 'Kaputihan'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '19', 'kode' => '2002', 'nama' => 'Setiawangi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '19', 'kode' => '2003', 'nama' => 'Sukakerta'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '19', 'kode' => '2004', 'nama' => 'Neglasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '19', 'kode' => '2005', 'nama' => 'Jatiwaras'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '19', 'kode' => '2006', 'nama' => 'Papayan'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '19', 'kode' => '2007', 'nama' => 'Ciwarak'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '19', 'kode' => '2008', 'nama' => 'Kersagalih'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '19', 'kode' => '2009', 'nama' => 'Mandalamekar'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '19', 'kode' => '2010', 'nama' => 'Kertarahayu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '19', 'kode' => '2011', 'nama' => 'Mandalahurip'],

            // Kecamatan 20 - Cineam
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '20', 'kode' => '2001', 'nama' => 'Cisarua'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '20', 'kode' => '2002', 'nama' => 'Cikondang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '20', 'kode' => '2003', 'nama' => 'Cijulang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '20', 'kode' => '2004', 'nama' => 'Ciampanan'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '20', 'kode' => '2005', 'nama' => 'Cineam'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '20', 'kode' => '2006', 'nama' => 'Rajadatu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '20', 'kode' => '2007', 'nama' => 'Ancol'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '20', 'kode' => '2008', 'nama' => 'Nagaratengah'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '20', 'kode' => '2009', 'nama' => 'Pasirmukti'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '20', 'kode' => '2010', 'nama' => 'Madiasari'],

            // Kecamatan 21 - Karang Jaya
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '21', 'kode' => '2001', 'nama' => 'Sirnajaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '21', 'kode' => '2002', 'nama' => 'Karangjaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '21', 'kode' => '2003', 'nama' => 'Karang Layung'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '21', 'kode' => '2004', 'nama' => 'Citalahab'],

            // Kecamatan 22 - Manonjaya
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '22', 'kode' => '2001', 'nama' => 'Cihaur'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '22', 'kode' => '2002', 'nama' => 'Cilangkap'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '22', 'kode' => '2003', 'nama' => 'Pasirpanjang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '22', 'kode' => '2004', 'nama' => 'Cibeber'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '22', 'kode' => '2005', 'nama' => 'Kamulyan'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '22', 'kode' => '2006', 'nama' => 'Manonjaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '22', 'kode' => '2007', 'nama' => 'Margaluyu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '22', 'kode' => '2008', 'nama' => 'Pasirbatang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '22', 'kode' => '2009', 'nama' => 'Kalimanggis'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '22', 'kode' => '2010', 'nama' => 'Margahayu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '22', 'kode' => '2011', 'nama' => 'Batusumur'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '22', 'kode' => '2012', 'nama' => 'Gunajaya'],

            // Kecamatan 23 - Gunung Tanjung
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '23', 'kode' => '2001', 'nama' => 'Cinunjang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '23', 'kode' => '2002', 'nama' => 'Gunungtanjung'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '23', 'kode' => '2003', 'nama' => 'Bojongsari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '23', 'kode' => '2004', 'nama' => 'Jatijaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '23', 'kode' => '2005', 'nama' => 'Tanjungsari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '23', 'kode' => '2006', 'nama' => 'Giriwangi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '23', 'kode' => '2007', 'nama' => 'Malatisuka'],

            // Kecamatan 24 - Singaparna
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '24', 'kode' => '2001', 'nama' => 'Cikunten'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '24', 'kode' => '2002', 'nama' => 'Singaparna'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '24', 'kode' => '2003', 'nama' => 'Cipakat'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '24', 'kode' => '2004', 'nama' => 'Cintaraja'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '24', 'kode' => '2005', 'nama' => 'Cikunir'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '24', 'kode' => '2006', 'nama' => 'Cikadongdong'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '24', 'kode' => '2007', 'nama' => 'Sukaasih'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '24', 'kode' => '2008', 'nama' => 'Sukamulya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '24', 'kode' => '2009', 'nama' => 'Singasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '24', 'kode' => '2010', 'nama' => 'Sukaherang'],

            // Kecamatan 25 - Mangunreja
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '25', 'kode' => '2001', 'nama' => 'Sukasukur'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '25', 'kode' => '2002', 'nama' => 'Salebu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '25', 'kode' => '2003', 'nama' => 'Mangunreja'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '25', 'kode' => '2004', 'nama' => 'Margajaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '25', 'kode' => '2005', 'nama' => 'Pasirsalam'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '25', 'kode' => '2006', 'nama' => 'Sukaluyu'],

            // Kecamatan 26 - Sukarame
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '26', 'kode' => '2001', 'nama' => 'Sukarame'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '26', 'kode' => '2002', 'nama' => 'Sukamenak'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '26', 'kode' => '2003', 'nama' => 'Sukakarsa'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '26', 'kode' => '2004', 'nama' => 'Padasuka'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '26', 'kode' => '2005', 'nama' => 'Sukarapih'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '26', 'kode' => '2006', 'nama' => 'Wargakerta'],

            // Kecamatan 27 - Cigalontang
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '27', 'kode' => '2001', 'nama' => 'Kersamaju'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '27', 'kode' => '2002', 'nama' => 'Nangtang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '27', 'kode' => '2003', 'nama' => 'Pusparaja'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '27', 'kode' => '2004', 'nama' => 'Jayapura'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '27', 'kode' => '2005', 'nama' => 'Lengkongjaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '27', 'kode' => '2006', 'nama' => 'Nanggerang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '27', 'kode' => '2007', 'nama' => 'Sukamanah'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '27', 'kode' => '2008', 'nama' => 'Sirnaraja'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '27', 'kode' => '2009', 'nama' => 'Cidugaleun'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '27', 'kode' => '2010', 'nama' => 'Parentas'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '27', 'kode' => '2011', 'nama' => 'Puspamukti'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '27', 'kode' => '2012', 'nama' => 'Tenjonagara'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '27', 'kode' => '2013', 'nama' => 'Cigalontang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '27', 'kode' => '2014', 'nama' => 'Sirnagalih'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '27', 'kode' => '2015', 'nama' => 'Tanjungkarang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '27', 'kode' => '2016', 'nama' => 'Sirnaputra'],

            // Kecamatan 28 - Leuwisari
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '28', 'kode' => '2001', 'nama' => 'Arjasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '28', 'kode' => '2002', 'nama' => 'Ciawang'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '28', 'kode' => '2003', 'nama' => 'Cigadog'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '28', 'kode' => '2004', 'nama' => 'Linggawangi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '28', 'kode' => '2005', 'nama' => 'Jayamukti'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '28', 'kode' => '2006', 'nama' => 'Mandalagiri'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '28', 'kode' => '2007', 'nama' => 'Linggamulya'],

            // Kecamatan 29 - Padakembang
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '29', 'kode' => '2001', 'nama' => 'Cilampunghilir'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '29', 'kode' => '2002', 'nama' => 'Rancapaku'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '29', 'kode' => '2003', 'nama' => 'Mekarjaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '29', 'kode' => '2004', 'nama' => 'Cisaruni'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '29', 'kode' => '2005', 'nama' => 'Padakembang'],

            // Kecamatan 30 - Sariwangi
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '30', 'kode' => '2001', 'nama' => 'Sariwangi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '30', 'kode' => '2002', 'nama' => 'Sukaharja'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '30', 'kode' => '2003', 'nama' => 'Jayaratu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '30', 'kode' => '2004', 'nama' => 'Linggasirna'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '30', 'kode' => '2005', 'nama' => 'Sirnasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '30', 'kode' => '2006', 'nama' => 'Sukamulih'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '30', 'kode' => '2007', 'nama' => 'Selawangi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '30', 'kode' => '2008', 'nama' => 'Jayaputra'],

            // Kecamatan 31 - Sukaratu
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '31', 'kode' => '2001', 'nama' => 'Linggajati'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '31', 'kode' => '2002', 'nama' => 'Tawangbanteng'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '31', 'kode' => '2003', 'nama' => 'Sinagar'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '31', 'kode' => '2004', 'nama' => 'Gunungsari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '31', 'kode' => '2005', 'nama' => 'Sukamahi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '31', 'kode' => '2006', 'nama' => 'Sukagalih'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '31', 'kode' => '2007', 'nama' => 'Sukaratu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '31', 'kode' => '2008', 'nama' => 'Indrajaya'],

            // Kecamatan 32 - Cisayong
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '32', 'kode' => '2001', 'nama' => 'Cisayong'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '32', 'kode' => '2002', 'nama' => 'Sukajadi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '32', 'kode' => '2003', 'nama' => 'Sukasukur'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '32', 'kode' => '2004', 'nama' => 'Sukamukti'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '32', 'kode' => '2005', 'nama' => 'Nusawangi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '32', 'kode' => '2006', 'nama' => 'Cikadu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '32', 'kode' => '2007', 'nama' => 'Cileuleus'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '32', 'kode' => '2008', 'nama' => 'Jatihurip'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '32', 'kode' => '2009', 'nama' => 'Sukasetia'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '32', 'kode' => '2010', 'nama' => 'Purwasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '32', 'kode' => '2011', 'nama' => 'Sukaraharja'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '32', 'kode' => '2012', 'nama' => 'Mekarwangi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '32', 'kode' => '2013', 'nama' => 'Santanamekar'],

            // Kecamatan 33 - Sukahening
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '33', 'kode' => '2001', 'nama' => 'Banyurasa'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '33', 'kode' => '2002', 'nama' => 'Calingcing'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '33', 'kode' => '2003', 'nama' => 'Sukahening'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '33', 'kode' => '2004', 'nama' => 'Kiarajangkung'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '33', 'kode' => '2005', 'nama' => 'Kudadepa'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '33', 'kode' => '2006', 'nama' => 'Banyuresmi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '33', 'kode' => '2007', 'nama' => 'Sundakerta'],

            // Kecamatan 34 - Rajapolah
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '34', 'kode' => '2001', 'nama' => 'Dawagung'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '34', 'kode' => '2002', 'nama' => 'Rajapolah'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '34', 'kode' => '2003', 'nama' => 'Manggungjaya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '34', 'kode' => '2004', 'nama' => 'Manggungsari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '34', 'kode' => '2005', 'nama' => 'Sukaraja'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '34', 'kode' => '2006', 'nama' => 'Rajamandala'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '34', 'kode' => '2007', 'nama' => 'Sukanagalih'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '34', 'kode' => '2008', 'nama' => 'Tanjungpura'],

            // Kecamatan 35 - Jamanis
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '35', 'kode' => '2001', 'nama' => 'Condong'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '35', 'kode' => '2002', 'nama' => 'Bojonggaok'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '35', 'kode' => '2003', 'nama' => 'Sindangraja'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '35', 'kode' => '2004', 'nama' => 'Karangmulya'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '35', 'kode' => '2005', 'nama' => 'Geresik'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '35', 'kode' => '2006', 'nama' => 'Karangsembung'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '35', 'kode' => '2007', 'nama' => 'Tanjungmekar'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '35', 'kode' => '2008', 'nama' => 'Karangresik'],

            // Kecamatan 36 - Ciawi
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '36', 'kode' => '2001', 'nama' => 'Gombong'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '36', 'kode' => '2002', 'nama' => 'Bugel'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '36', 'kode' => '2003', 'nama' => 'Margasari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '36', 'kode' => '2004', 'nama' => 'Pakemitan'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '36', 'kode' => '2005', 'nama' => 'Ciawi'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '36', 'kode' => '2006', 'nama' => 'Sukamantri'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '36', 'kode' => '2007', 'nama' => 'Pasirhuni'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '36', 'kode' => '2008', 'nama' => 'Citamba'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '36', 'kode' => '2009', 'nama' => 'Kertamukti'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '36', 'kode' => '2010', 'nama' => 'Kurniabakti'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '36', 'kode' => '2011', 'nama' => 'Pakemitankidul'],

            // Kecamatan 37 - Kadipaten
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '37', 'kode' => '2001', 'nama' => 'Kadipaten'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '37', 'kode' => '2002', 'nama' => 'Dirgahayu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '37', 'kode' => '2003', 'nama' => 'Cibahayu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '37', 'kode' => '2004', 'nama' => 'Mekarsari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '37', 'kode' => '2005', 'nama' => 'Buniasih'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '37', 'kode' => '2006', 'nama' => 'Pamoyanan'],

            // Kecamatan 38 - Pagerageung
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '38', 'kode' => '2001', 'nama' => 'Cipacing'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '38', 'kode' => '2002', 'nama' => 'Pagerageung'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '38', 'kode' => '2003', 'nama' => 'Sukamaju'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '38', 'kode' => '2004', 'nama' => 'Tanjungkerta'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '38', 'kode' => '2005', 'nama' => 'Puteran'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '38', 'kode' => '2006', 'nama' => 'Guranteng'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '38', 'kode' => '2007', 'nama' => 'Nanggewer'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '38', 'kode' => '2008', 'nama' => 'Sukapada'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '38', 'kode' => '2009', 'nama' => 'Pagersari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '38', 'kode' => '2010', 'nama' => 'Sukadana'],

            // Kecamatan 39 - Sukaresik
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '39', 'kode' => '2001', 'nama' => 'Cipondok'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '39', 'kode' => '2002', 'nama' => 'Sukamenak'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '39', 'kode' => '2003', 'nama' => 'Sukaratu'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '39', 'kode' => '2004', 'nama' => 'Banjarsari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '39', 'kode' => '2005', 'nama' => 'Tanjungsari'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '39', 'kode' => '2006', 'nama' => 'Sukapancar'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '39', 'kode' => '2007', 'nama' => 'Sukaresik'],
            ['provinsi_kode' => '32', 'kabupaten_kode' => '06', 'kecamatan_kode' => '39', 'kode' => '2008', 'nama' => 'Margamulya'],
        ];

        // Add timestamps
        $now = now();
        $data = array_map(function ($item) use ($now) {
            return array_merge($item, [
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }, $data);

        // Insert in chunks to avoid memory issues
        foreach (array_chunk($data, 100) as $chunk) {
            DB::table('wilayah_desa')->insert($chunk);
        }
    }
}
