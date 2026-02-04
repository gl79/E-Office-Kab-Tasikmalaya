<?php

namespace App\Http\Controllers\Cuti;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CutiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        return Inertia::render('Cuti/Index');
    }

    /**
     * Display archive for cuti (Coming Soon).
     */
    public function archive()
    {
        return Inertia::render('Cuti/Archive/Index');
    }
}
