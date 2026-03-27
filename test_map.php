<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();
$request = Illuminate\Http\Request::create('/api/dashboard/map-markers', 'GET');
$user = App\Models\User::where('role', 'bupati')->first();
$request->setUserResolver(function () use ($user) {
    return $user;
});
$controller = app()->make(App\Http\Controllers\Dashboard\DashboardController::class);
$response = $controller->mapMarkers($request);
echo "RESPONSE_START:";
echo json_encode($response->getData());
echo "\nRESPONSE_END";
