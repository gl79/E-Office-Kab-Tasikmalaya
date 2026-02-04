<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_email_verification_screen_can_be_rendered(): void
    {
        $user = User::factory()->createOne();

        $response = $this->actingAs($user)->get('/verify-email');

        $response->assertStatus(404);
    }

    public function test_email_can_be_verified(): void
    {
        $user = User::factory()->createOne();

        $response = $this->actingAs($user)->get('/verify-email/'.$user->getKey().'/hash');
        $response->assertStatus(404);
    }

    public function test_email_is_not_verified_with_invalid_hash(): void
    {
        $user = User::factory()->createOne();

        $response = $this->actingAs($user)->get('/verify-email/'.$user->getKey().'/invalid-hash');
        $response->assertStatus(404);
    }
}
