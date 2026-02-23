<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('reference_no')->unique(); // ANN-2024-018
            $table->string('title');
            $table->text('summary')->nullable();
            $table->longText('body')->nullable();

            $table->string('priority')->default('Normal'); // High / Normal / Low
            $table->string('status')->default('Draft');    // Draft / Published / Archived
            $table->string('target_audience')->nullable(); // All households, Seniors, etc.

            $table->string('posted_by')->nullable();
            $table->date('published_on')->nullable();
            $table->date('expires_on')->nullable();

            $table->timestamps();
        });

        Schema::create('announcement_action_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('announcement_id')
                ->constrained('announcements')
                ->cascadeOnDelete();

            $table->string('description');
            $table->boolean('is_completed')->default(false);

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('announcement_action_items');
        Schema::dropIfExists('announcements');
    }
};


