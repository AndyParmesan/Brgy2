<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ResidentController;
use App\Http\Controllers\Api\DocumentRequestController;
use App\Http\Controllers\Api\BlotterCaseController;
use App\Http\Controllers\Api\AnnouncementController;
use App\Http\Controllers\Api\ActivityLogController;
use App\Http\Controllers\Api\ContactController;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

// Public routes
Route::post('/login', [AuthController::class, 'login']);

// Public frontend routes (no authentication required)
Route::get('/public/announcements', [AnnouncementController::class, 'publicIndex']);
Route::get('/public/documents', [DocumentRequestController::class, 'publicDocuments']);
Route::post('/public/report', [BlotterCaseController::class, 'publicStore']);
Route::post('/public/document-request', [DocumentRequestController::class, 'publicStore']);
Route::post('/public/contact', [ContactController::class, 'store']);

// Protected routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    
    Route::get('/residents', [ResidentController::class, 'index']);
    Route::get('/document-requests', [DocumentRequestController::class, 'index']);
    Route::get('/blotter-cases', [BlotterCaseController::class, 'index']);
    Route::get('/announcements', [AnnouncementController::class, 'index']);
    Route::get('/activity-logs', [ActivityLogController::class, 'index']);
});


