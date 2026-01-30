<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsurePasswordChanged
{
    /**
     * Routes that are allowed even if password hasn't been changed.
     */
    protected array $allowedRoutes = [
        'password.force',
        'password.force_update',
        'logout',
    ];

    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        // Check if user needs to change password
        if ($user && !$user->password_changed_at && !$user->isSuperAdmin()) {
            // Allow access to specific routes
            if ($this->isAllowedRoute($request)) {
                return $next($request);
            }

            // Redirect to force password change page
            return redirect()->route('password.force');
        }

        return $next($request);
    }

    /**
     * Check if the current route is in the allowed list.
     */
    protected function isAllowedRoute(Request $request): bool
    {
        $currentRoute = $request->route()?->getName();

        if (!$currentRoute) {
            return false;
        }

        return in_array($currentRoute, $this->allowedRoutes);
    }
}
