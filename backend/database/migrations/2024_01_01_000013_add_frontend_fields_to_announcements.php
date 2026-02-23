<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            // Add fields for frontend display
            $table->json('items')->nullable()->after('body'); // For service items list
            $table->text('info')->nullable()->after('items'); // For additional info (time, location, etc.)
            $table->text('note')->nullable()->after('info'); // For notes/reminders
            $table->string('link')->nullable()->after('note'); // For links to other pages
            $table->json('highlights')->nullable()->after('link'); // For event highlights
            $table->json('schedule')->nullable()->after('highlights'); // For schedule data
        });
    }

    public function down(): void
    {
        Schema::table('announcements', function (Blueprint $table) {
            $table->dropColumn([
                'items',
                'info',
                'note',
                'link',
                'highlights',
                'schedule'
            ]);
        });
    }
};

