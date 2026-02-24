<?php

use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__ . '/../routes/web.php',
        commands: __DIR__ . '/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
            \Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets::class,
        ]);

        // Register middleware aliases
        $middleware->alias([
            'role' => \App\Http\Middleware\CheckRole::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // AuthorizationException (Gate::denies / Policy / $this->authorize())
        // → masking sebagai 404 agar tidak membocorkan eksistensi resource
        $exceptions->render(function (AuthorizationException $e, $request) {
            if ($request->header('X-Inertia')) {
                return Inertia::render('Errors/NotFound', [
                    'status' => 404,
                ])
                    ->toResponse($request)
                    ->setStatusCode(404);
            }

            abort(404);
        });

        // HttpException — render 404/500 dengan Inertia
        $exceptions->render(function (HttpException $e, $request) {
            $status = $e->getStatusCode();

            if (in_array($status, [403, 404, 500])) {
                if ($request->header('X-Inertia')) {
                    return Inertia::render('Errors/NotFound', [
                        'status' => $status === 403 ? 404 : $status,
                    ])
                        ->toResponse($request)
                        ->setStatusCode($status === 403 ? 404 : $status);
                }

                // Non-Inertia: 403 → 404 masking
                if ($status === 403) {
                    abort(404);
                }
            }
        });
    })->create();
