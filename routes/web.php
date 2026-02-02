<?php

use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    return redirect()->route('dashboard');
})->middleware('auth');

// Load Route Modules
require __DIR__ . '/modules/dashboard.php';
require __DIR__ . '/modules/profile.php';
require __DIR__ . '/modules/pengaturan.php';
require __DIR__ . '/modules/master.php';
require __DIR__ . '/modules/persuratan.php';
require __DIR__ . '/modules/penjadwalan.php';
require __DIR__ . '/modules/cuti.php';

require __DIR__ . '/auth.php';
