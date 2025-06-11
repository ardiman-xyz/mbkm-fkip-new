<?php

namespace App\Http\Controllers;

use App\Models\Registration;
use App\Models\Student;
use App\Models\Logbook;
use App\Services\RegistrantService;
use App\Http\Requests\Registrant\StoreRegistrantRequest;
use App\Http\Requests\Registrant\UpdateRegistrantRequest;
use App\Http\Requests\Registrant\BulkActionRequest;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class RegistrantController extends Controller
{
    public function __construct(
        private RegistrantService $registrantService
    ) {}

    /**
     * Display a listing of registrants with filters and pagination
     */
    public function index(Request $request): Response
    {
        $data = $this->registrantService->getRegistrants($request);

        return Inertia::render('registrants/index', $data);
    }

    /**
     * Show the form for creating a new registrant
     */
    public function create(): Response
    {
        $data = $this->registrantService->getCreateData();

        return Inertia::render('registrants/create', $data);
    }

    /**
     * Store a newly created registrant in storage
     */
    // public function store(StoreRegistrantRequest $request): RedirectResponse
    // {
    //     try {
    //         $registrant = $this->registrantService->createRegistrant($request->validated());

    //         return redirect()
    //             ->route('registrants.show', $registrant)
    //             ->with('success', 'Registrant created successfully.');
    //     } catch (\Exception $e) {
    //         return back()
    //             ->withInput()
    //             ->withErrors(['error' => 'Failed to create registrant: ' . $e->getMessage()]);
    //     }
    // }

    /**
     * Display the specified registrant with detailed information
     */
    public function show(Registration $registrant): Response
    {
        $data = $this->registrantService->getRegistrantDetail($registrant);

        return Inertia::render('registrants/show', compact("data"));
    }

    /**
     * Show the form for editing the specified registrant
     */
    public function edit(Registration $registrant): Response
    {
        $data = $this->registrantService->getEditData($registrant);

        return Inertia::render('registrants/edit', $data);
    }

    /**
     * Update the specified registrant in storage
     */
    // public function update(UpdateRegistrantRequest $request, Registration $registrant): RedirectResponse
    // {
    //     try {
    //         $this->registrantService->updateRegistrant($registrant, $request->validated());

    //         return redirect()
    //             ->route('registrants.show', $registrant)
    //             ->with('success', 'Registrant updated successfully.');
    //     } catch (\Exception $e) {
    //         return back()
    //             ->withInput()
    //             ->withErrors(['error' => 'Failed to update registrant: ' . $e->getMessage()]);
    //     }
    // }

    /**
     * Remove the specified registrant from storage
     */
    public function destroy(Registration $registrant): RedirectResponse
    {
        try {
            $this->registrantService->deleteRegistrant($registrant);

            return redirect()
                ->route('registrants.index')
                ->with('success', 'Registrant deleted successfully.');
        } catch (\Exception $e) {
            return back()
                ->withErrors(['error' => 'Failed to delete registrant: ' . $e->getMessage()]);
        }
    }

    /**
     * Get registrant's logbook entries
     */
    public function logbooks(Registration $registrant): Response
    {
        $data = $this->registrantService->getLogbooks($registrant);

        return Inertia::render('registrants/logbooks', $data);
    }

    /**
     * Show specific logbook entry
     */
    public function showLogbook(Registration $registrant, Logbook $logbook): Response
    {
        // Ensure logbook belongs to this registrant
        if ($logbook->unit_pendaftar_id !== $registrant->id) {
            abort(404);
        }

        $data = $this->registrantService->getLogbookDetail($registrant, $logbook);

        return Inertia::render('registrants/logbook-detail', $data);
    }

    /**
     * Get registrant's report information
     */
    public function report(Registration $registrant): Response
    {
        $data = $this->registrantService->getReport($registrant);

        return Inertia::render('registrants/report', $data);
    }

    /**
     * Upload report document
     */
    public function uploadReport(Request $request, Registration $registrant): JsonResponse
    {
        $request->validate([
            'report' => 'required|file|mimes:pdf,doc,docx|max:10240', // 10MB max
            'video_url' => 'nullable|url'
        ]);

        try {
            $result = $this->registrantService->uploadReport($registrant, $request);

            return response()->json([
                'success' => true,
                'message' => 'Report uploaded successfully.',
                'data' => $result
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload report: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete report document
     */
    public function deleteReport(Registration $registrant): JsonResponse
    {
        try {
            $this->registrantService->deleteReport($registrant);

            return response()->json([
                'success' => true,
                'message' => 'Report deleted successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete report: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Approve registrant
     */
    public function approve(Registration $registrant): JsonResponse
    {
        try {
            $this->registrantService->approveRegistrant($registrant);

            return response()->json([
                'success' => true,
                'message' => 'Registrant approved successfully.',
                'data' => [
                    'status' => $registrant->fresh()->registration_status
                ]
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to approve registrant: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject registrant
     */
    public function reject(Request $request, Registration $registrant): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        try {
            $this->registrantService->rejectRegistrant($registrant, $request->reason);

            return response()->json([
                'success' => true,
                'message' => 'Registrant rejected successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject registrant: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Activate registrant
     */
    public function activate(Registration $registrant): JsonResponse
    {
        try {
            $this->registrantService->activateRegistrant($registrant);

            return response()->json([
                'success' => true,
                'message' => 'Registrant activated successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to activate registrant: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Deactivate registrant
     */
    public function deactivate(Registration $registrant): JsonResponse
    {
        try {
            $this->registrantService->deactivateRegistrant($registrant);

            return response()->json([
                'success' => true,
                'message' => 'Registrant deactivated successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to deactivate registrant: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Verify payment
     */
    public function verifyPayment(Registration $registrant): JsonResponse
    {
        try {
            $this->registrantService->verifyPayment($registrant);

            return response()->json([
                'success' => true,
                'message' => 'Payment verified successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to verify payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Reject payment
     */
    public function rejectPayment(Request $request, Registration $registrant): JsonResponse
    {
        $request->validate([
            'reason' => 'required|string|max:500'
        ]);

        try {
            $this->registrantService->rejectPayment($registrant, $request->reason);

            return response()->json([
                'success' => true,
                'message' => 'Payment rejected successfully.'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to reject payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk approve registrants
     */
    // public function bulkApprove(BulkActionRequest $request): JsonResponse
    // {
    //     try {
    //         $count = $this->registrantService->bulkApprove($request->registrant_ids);

    //         return response()->json([
    //             'success' => true,
    //             'message' => "{$count} registrants approved successfully."
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to approve registrants: ' . $e->getMessage()
    //         ], 500);
    //     }
    // }

    /**
     * Bulk reject registrants
     */
    // public function bulkReject(BulkActionRequest $request): JsonResponse
    // {
    //     $request->validate([
    //         'reason' => 'required|string|max:500'
    //     ]);

    //     try {
    //         $count = $this->registrantService->bulkReject($request->registrant_ids, $request->reason);

    //         return response()->json([
    //             'success' => true,
    //             'message' => "{$count} registrants rejected successfully."
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to reject registrants: ' . $e->getMessage()
    //         ], 500);
    //     }
    // }

    /**
     * Bulk delete registrants
     */
    // public function bulkDelete(BulkActionRequest $request): JsonResponse
    // {
    //     try {
    //         $count = $this->registrantService->bulkDelete($request->registrant_ids);

    //         return response()->json([
    //             'success' => true,
    //             'message' => "{$count} registrants deleted successfully."
    //         ]);
    //     } catch (\Exception $e) {
    //         return response()->json([
    //             'success' => false,
    //             'message' => 'Failed to delete registrants: ' . $e->getMessage()
    //         ], 500);
    //     }
    // }

    /**
     * Bulk export registrants
     */
    public function bulkExport(Request $request): JsonResponse
    {
        try {
            $filePath = $this->registrantService->exportRegistrants($request);

            return response()->json([
                'success' => true,
                'message' => 'Export completed successfully.',
                'download_url' => Storage::url($filePath)
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to export registrants: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Search registrants for AJAX requests
     */
    public function search(Request $request): JsonResponse
    {
        $results = $this->registrantService->searchRegistrants($request->q ?? '');

        return response()->json([
            'success' => true,
            'data' => $results
        ]);
    }

    /**
     * Get registrants statistics
     */
    public function statistics(): JsonResponse
    {
        $stats = $this->registrantService->getStatistics();

        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }

    /**
     * Get filter options for dropdowns
     */
    public function filterOptions(): JsonResponse
    {
        $options = $this->registrantService->getFilterOptions();

        return response()->json([
            'success' => true,
            'data' => $options
        ]);
    }
}