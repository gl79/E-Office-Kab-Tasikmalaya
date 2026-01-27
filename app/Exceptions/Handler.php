<?php

namespace App\Exceptions;

use Illuminate\Foundation\Exceptions\Handler as ExceptionHandler;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;
use Throwable;

class Handler extends ExceptionHandler
{
    /**
     * The list of the inputs that are never flashed to the session on validation exceptions.
     *
     * @var array<int, string>
     */
    protected $dontFlash = [
        'current_password',
        'password',
        'password_confirmation',
    ];

    /**
     * Register the exception handling callbacks for the application.
     */
    public function register(): void
    {
        $this->reportable(function (Throwable $e) {
            //
        });
    }

    /**
     * Render an exception into an HTTP response.
     */
    public function render($request, Throwable $e)
    {
        // Get status code from HTTP exception
        $statusCode = $e instanceof HttpExceptionInterface
            ? $e->getStatusCode()
            : 500;

        // Handle specific error codes with Inertia
        if (in_array($statusCode, [404, 403])) {
            return Inertia::render('Errors/NotFound', [
                'status' => $statusCode,
            ])
                ->toResponse($request)
                ->setStatusCode($statusCode);
        }

        // Handle 500 errors in production
        if ($statusCode === 500 && !config('app.debug')) {
            return Inertia::render('Errors/NotFound', [
                'status' => 500,
            ])
                ->toResponse($request)
                ->setStatusCode(500);
        }

        return parent::render($request, $e);
    }
}
