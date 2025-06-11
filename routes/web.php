<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\LogbookController;
use App\Http\Controllers\RegistrantController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, "index"])->name('dashboard');



    Route::prefix('registrants')->name('registrants.')->group(function () {
        
        // Show specific registrant details
        Route::get('/{registrant}', [RegistrantController::class, 'show'])->name('show');

    });
    Route::prefix('logbooks')->name('logbooks.')->group(function () {
        Route::get('/', [LogbookController::class, 'index'])->name('index');
        Route::get('/student/{registrant}', [LogbookController::class, 'studentLogbooks'])->name('student');
        Route::get('/entry/{logbook}', [LogbookController::class, 'show'])->name('show');
        Route::get('/export', [LogbookController::class, 'export'])->name('export');
        Route::get('/statistics', [LogbookController::class, 'statistics'])->name('statistics');
    });

});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
