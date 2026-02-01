<?php

namespace App\Http\Controllers;

use App\Models\ActivityLog;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class ActivityLogController extends Controller
{
    /**
     * Display activity logs listing.
     */
    public function index(Request $request): Response
    {
        // Get all users for filter dropdown
        $users = User::select('id', 'name', 'username')
            ->orderBy('name')
            ->get()
            ->map(fn($user) => [
                'id' => $user->id,
                'name' => $user->name,
                'username' => $user->username,
            ]);

        // Get action types
        $actionTypes = collect(ActivityLog::ACTION_LABELS)->map(fn($label, $key) => [
            'value' => $key,
            'label' => $label,
        ])->values();

        // Build query with eager loading (use actual columns, foto_url is an accessor)
        $query = ActivityLog::with('user:id,name,username,foto')
            ->orderBy('created_at', 'desc');

        // Get all logs for client-side filtering (limited for performance)
        $logs = $query->limit(500)->get()->map(fn($log) => [
            'id' => $log->id,
            'user_id' => $log->user_id,
            'user' => $log->user ? [
                'id' => $log->user->id,
                'name' => $log->user->name,
                'username' => $log->user->username,
                'foto_url' => $log->user->foto_url,
            ] : null,
            'action' => $log->action,
            'action_label' => $log->action_label,
            'model_type' => $log->model_type,
            'model_name' => $log->model_name,
            'model_id' => $log->model_id,
            'description' => $log->description,
            'ip_address' => $log->ip_address,
            'user_agent' => $log->formatted_user_agent,
            'properties' => $log->properties,
            'created_at' => $log->created_at->format('Y-m-d H:i:s'),
            'created_at_human' => $log->created_at->diffForHumans(),
        ]);

        return Inertia::render('Pengaturan/ActivityLogs/Index', [
            'logs' => $logs,
            'users' => $users,
            'actionTypes' => $actionTypes,
            'filters' => [
                'search' => $request->get('search'),
                'user_id' => $request->get('user_id'),
                'action' => $request->get('action'),
                'date_from' => $request->get('date_from'),
                'date_to' => $request->get('date_to'),
            ],
        ]);
    }
}
