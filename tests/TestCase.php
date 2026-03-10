<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        // Hindari dependency manifest Vite saat menjalankan test HTTP/Inertia.
        $this->withoutVite();
    }
}
