<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class EnsurePasswordChanged
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if ($user && ! $user->password_changed_at && ! $user->isSuperAdmin()) {
            // We will handle this via frontend modal, but we can also enforce it here if needed.
            // For SPA, it's better to pass a prop to the layout or check it in the layout.
            // However, if we want to STRICTLY block access, we can redirect to a specific page.
            // Given the requirement is a "Modal", we might just pass this state to Inertia.
            // But if we want to block API calls until password is changed, we can do it here.

            // For now, we will rely on the frontend Modal to force the change, 
            // but we can add a check here to prevent other actions if strictly required.
            // Let's just allow the request to proceed, but the frontend will block the UI.
        }

        return $next($request);
    }
}
