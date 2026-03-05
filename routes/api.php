<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/mcp', function (Request $request) {
    $serverPath = base_path('dev-tools/mcp/McpServer.php');

    if (!is_file($serverPath)) {
        return response()->json([
            'success' => false,
            'error' => 'MCP server tidak tersedia di environment ini.',
        ], 404);
    }

    require_once $serverPath;

    if (!class_exists(\DevTools\Mcp\McpServer::class)) {
        return response()->json([
            'success' => false,
            'error' => 'Class MCP server tidak ditemukan.',
        ], 500);
    }

    /** @var \DevTools\Mcp\McpServer $server */
    $server = new \DevTools\Mcp\McpServer();

    return $server->handle($request);
});
