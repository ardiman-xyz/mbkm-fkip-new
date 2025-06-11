<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use App\Models\Logbook;
use App\Services\LogbookService;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;

class LogbookController extends Controller
{
    public function __construct(
        private LogbookService $logbookService
    ) {}

    /**
     * Display logbook overview with all students
     */
    public function index(Request $request): Response
    {
        $data = $this->logbookService->getLogbookOverview($request);

        return Inertia::render('logbooks/index', $data);
    }

    /**
     * Display specific student's logbooks
     */
    public function studentLogbooks(Registration $registrant): Response
    {
        $data = $this->logbookService->getStudentLogbooks($registrant);

        return Inertia::render('logbooks/student', $data);
    }

    /**
     * Display specific logbook entry detail
     */
    public function show(Logbook $logbook): Response
    {
        $data = $this->logbookService->getLogbookDetail($logbook);

        return Inertia::render('logbooks/show', $data);
    }

    /**
     * Export logbooks to Excel/CSV
     */
    public function export(Request $request): JsonResponse
    {
        try {
            $filePath = $this->logbookService->exportLogbooks($request);

            return response()->json([
                'success' => true,
                'message' => 'Export completed successfully.',
                'download_url' => asset('storage/' . $filePath)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export logbooks: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get logbook statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = $this->logbookService->getLogbookStatistics();

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
}