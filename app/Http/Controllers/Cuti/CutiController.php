<?php

namespace App\Http\Controllers\Cuti;

use App\Http\Controllers\Controller;
use App\Models\Cuti;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CutiController extends Controller
{
    /**
     * Display the cuti page.
     */
    public function index(Request $request)
    {
        $this->authorize('viewAny', Cuti::class);

        return Inertia::render('Cuti/Index');
    }
}
