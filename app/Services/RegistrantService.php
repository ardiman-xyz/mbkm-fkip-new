<?php

namespace App\Services;

use App\Models\Registration;
use App\Models\Student;
use App\Models\Logbook;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Illuminate\Pagination\LengthAwarePaginator;

class RegistrantService
{
    private const CACHE_TTL = 300; // 5 minutes
    private const CACHE_PREFIX = 'registrants_';

    /**
     * Get paginated registrants with filters
     */
    public function getRegistrants(Request $request): array
    {
        $perPage = $request->get('per_page', 15);
        $page = $request->get('page', 1);
        $search = $request->get('search', '');
        $status = $request->get('status', 'all');
        $activityType = $request->get('activity_type', 'all');
        $academicYear = $request->get('academic_year', 'all');
        $semester = $request->get('semester', 'all');
        $prodi = $request->get('prodi', 'all');

        $query = Registration::with(['student'])
            ->when($search, function ($q) use ($search) {
                return $q->where(function ($query) use ($search) {
                    $query->where('nim', 'like', "%{$search}%")
                          ->orWhereHas('student', function ($studentQuery) use ($search) {
                              $studentQuery->where('nama_lengkap', 'like', "%{$search}%");
                          })
                          ->orWhere('lokasi', 'like', "%{$search}%");
                });
            })
            ->when($status !== 'all', function ($q) use ($status) {
                switch ($status) {
                    case 'pending_payment':
                        return $q->whereNull('bukti_bayar');
                    case 'active':
                        return $q->whereNotNull('bukti_bayar')->whereNull('nilai');
                    case 'awaiting_assessment':
                        return $q->whereNotNull('laporan')->whereNull('nilai');
                    case 'completed':
                        return $q->whereNotNull('nilai');
                    default:
                        return $q;
                }
            })
            ->when($activityType !== 'all', function ($q) use ($activityType) {
                return $q->where('jenis_kegiatan', $activityType);
            })
            ->when($academicYear !== 'all', function ($q) use ($academicYear) {
                return $q->where('tahun_akademik', $academicYear);
            })
            ->when($semester !== 'all', function ($q) use ($semester) {
                return $q->where('semester', $semester);
            })
            ->latest();

        $registrants = $query->paginate($perPage, ['*'], 'page', $page);

        // Transform data
        $registrants->getCollection()->transform(function ($registration) {
            return $this->transformRegistrant($registration);
        });

        return [
            'registrants' => [
                'data' => $registrants->items(),
                'pagination' => [
                    'current_page' => $registrants->currentPage(),
                    'last_page' => $registrants->lastPage(),
                    'per_page' => $registrants->perPage(),
                    'total' => $registrants->total(),
                    'from' => $registrants->firstItem(),
                    'to' => $registrants->lastItem(),
                ]
            ],
            'statistics' => $this->getStatistics(),
            'filters' => [
                'activity_types' => $this->getActivityTypes(),
                'academic_years' => $this->getAcademicYears(),
                'semesters' => $this->getSemesters(),
                'statuses' => $this->getStatuses(),
                'prodis' => $this->getStudyPrograms(),
            ]
        ];
    }

    /**
     * Get data for create form
     */
    public function getCreateData(): array
    {
        return [
            'activity_types' => $this->getActivityTypes(),
            'academic_years' => $this->getAcademicYears(),
            'semesters' => $this->getSemesters(),
            'study_programs' => $this->getStudyPrograms(),
        ];
    }

    /**
     * Create new registrant
     */
    public function createRegistrant(array $data): Registration
    {
        return DB::transaction(function () use ($data) {
            $registration = Registration::create($data);
            
            // Clear cache
            $this->clearCache();
            
            return $registration;
        });
    }

    /**
     * Get registrant detail with related data
     */
    public function getRegistrantDetail(Registration $registrant): array
    {
        $registrant->load(['student', 'logbooks' => function ($query) {
            $query->orderBy('mingguKe', 'desc')->orderBy('tgl_kegiatan', 'desc');
        }]);
    
        return [
            'registrant' => $this->transformRegistrant($registrant, true),
            'logbooks' => $registrant->logbooks->map(function ($logbook) {
                return $this->transformLogbook($logbook);
            }),
            'statistics' => $this->getRegistrantStatistics($registrant),
        ];
    }
    /**
     * Get data for edit form
     */
    public function getEditData(Registration $registrant): array
    {
        return [
            'registrant' => $this->transformRegistrant($registrant, true),
            'activity_types' => $this->getActivityTypes(),
            'academic_years' => $this->getAcademicYears(),
            'semesters' => $this->getSemesters(),
            'study_programs' => $this->getStudyPrograms(),
        ];
    }

    /**
     * Update registrant
     */
    public function updateRegistrant(Registration $registrant, array $data): Registration
    {
        return DB::transaction(function () use ($registrant, $data) {
            $registrant->update($data);
            
            // Clear cache
            $this->clearCache();
            
            return $registrant->fresh();
        });
    }

    /**
     * Delete registrant
     */
    public function deleteRegistrant(Registration $registrant): bool
    {
        return DB::transaction(function () use ($registrant) {
            // Delete related logbooks
            $registrant->logbooks()->delete();
            
            // Delete report files if exists
            if ($registrant->laporan) {
                Storage::delete($registrant->laporan);
            }
            
            $result = $registrant->delete();
            
            // Clear cache
            $this->clearCache();
            
            return $result;
        });
    }

    /**
     * Get registrant's logbooks
     */
    public function getLogbooks(Registration $registrant): array
    {
        $logbooks = $registrant->logbooks()
            ->orderBy('minggu', 'desc')
            ->orderBy('tgl_kegiatan', 'desc')
            ->get();

        return [
            'registrant' => $this->transformRegistrant($registrant),
            'logbooks' => $logbooks->map(function ($logbook) {
                return $this->transformLogbook($logbook);
            }),
            'statistics' => [
                'total_entries' => $logbooks->count(),
                'completed_entries' => $logbooks->where('completion_percentage', 100)->count(),
                'average_completion' => $logbooks->avg('completion_percentage'),
            ]
        ];
    }

    /**
     * Get logbook detail
     */
    public function getLogbookDetail(Registration $registrant, Logbook $logbook): array
    {
        return [
            'registrant' => $this->transformRegistrant($registrant),
            'logbook' => $this->transformLogbook($logbook),
        ];
    }

    /**
     * Get registrant's report
     */
    public function getReport(Registration $registrant): array
    {
        return [
            'registrant' => $this->transformRegistrant($registrant),
            'report' => [
                'document_url' => $registrant->laporan ? Storage::url($registrant->laporan) : null,
                'document_name' => $registrant->laporan ? basename($registrant->laporan) : null,
                'video_url' => $registrant->video_url,
                'submission_date' => $registrant->updated_at?->format('Y-m-d'),
                'status' => $registrant->nilai ? 'approved' : ($registrant->laporan ? 'submitted' : 'not_submitted'),
            ]
        ];
    }

    /**
     * Upload report
     */
    public function uploadReport(Registration $registrant, Request $request): array
    {
        return DB::transaction(function () use ($registrant, $request) {
            $data = [];
            
            if ($request->hasFile('report')) {
                // Delete old report if exists
                if ($registrant->laporan) {
                    Storage::delete($registrant->laporan);
                }
                
                $path = $request->file('report')->store('reports', 'public');
                $data['laporan'] = $path;
            }
            
            if ($request->filled('video_url')) {
                $data['video_url'] = $request->video_url;
            }
            
            $registrant->update($data);
            
            return [
                'document_url' => isset($data['laporan']) ? Storage::url($data['laporan']) : null,
                'video_url' => $data['video_url'] ?? null,
            ];
        });
    }

    /**
     * Delete report
     */
    public function deleteReport(Registration $registrant): void
    {
        DB::transaction(function () use ($registrant) {
            if ($registrant->laporan) {
                Storage::delete($registrant->laporan);
                $registrant->update(['laporan' => null, 'video_url' => null]);
            }
        });
    }

    /**
     * Approve registrant
     */
    public function approveRegistrant(Registration $registrant): void
    {
        $registrant->update([
            'nilai' => 'A', // Default grade, could be customizable
            'status' => 'approved',
            'approved_at' => now(),
        ]);
        
        $this->clearCache();
    }

    /**
     * Reject registrant
     */
    public function rejectRegistrant(Registration $registrant, string $reason): void
    {
        $registrant->update([
            'status' => 'rejected',
            'rejection_reason' => $reason,
            'rejected_at' => now(),
        ]);
        
        $this->clearCache();
    }

    /**
     * Activate registrant
     */
    public function activateRegistrant(Registration $registrant): void
    {
        $registrant->update(['status' => 'active']);
        $this->clearCache();
    }

    /**
     * Deactivate registrant
     */
    public function deactivateRegistrant(Registration $registrant): void
    {
        $registrant->update(['status' => 'inactive']);
        $this->clearCache();
    }

    /**
     * Verify payment
     */
    public function verifyPayment(Registration $registrant): void
    {
        $registrant->update([
            'payment_verified' => true,
            'payment_verified_at' => now(),
        ]);
        
        $this->clearCache();
    }

    /**
     * Reject payment
     */
    public function rejectPayment(Registration $registrant, string $reason): void
    {
        $registrant->update([
            'payment_verified' => false,
            'payment_rejection_reason' => $reason,
            'bukti_bayar' => null, // Remove payment proof
        ]);
        
        $this->clearCache();
    }

    /**
     * Transform registrant data
     */
    private function transformRegistrant(Registration $registration, bool $detailed = false): array
    {
        $base = [
            'id' => $registration->id,
            'nim' => $registration->nim,
            'name' => $registration->student?->nama_lengkap ?? 'Unknown',
            'study_program' => $this->getStudyProgramName($registration->id_prodi),
            'academic_year' => $registration->tahun_akademik,
            'semester' => $registration->semester,
            'activity_type' => $registration->jenis_kegiatan,
            'placement' => $registration->lokasi,
            'phone' => $registration->no_hp,
            'status' => $this->determineStatus($registration),
            'payment_status' => !empty($registration->bukti_bayar) ? 'paid' : 'unpaid',
            'report_status' => !empty($registration->laporan) ? 'submitted' : 'not_submitted',
            'registered_at' => $registration->created_at?->format('Y-m-d'),
            'score' => $registration->nilai,
            'gender' => $this->getGenderFromStudent($registration),
        ];

        if ($detailed) {
            $base = array_merge($base, [
                'email' => $registration->student?->email,
                'payment_proof' => $registration->bukti_bayar ? Storage::url($registration->bukti_bayar) : null,
                'report_document' => $registration->laporan ? Storage::url($registration->laporan) : null,
                'video_url' => $registration->video_url,
                'payment_verified' => $registration->payment_verified ?? false,
                'payment_verified_at' => $registration->payment_verified_at?->format('Y-m-d H:i:s'),
                'approved_at' => $registration->approved_at?->format('Y-m-d H:i:s'),
                'rejected_at' => $registration->rejected_at?->format('Y-m-d H:i:s'),
                'rejection_reason' => $registration->rejection_reason,
                'created_at' => $registration->created_at?->format('Y-m-d H:i:s'),
                'updated_at' => $registration->updated_at?->format('Y-m-d H:i:s'),
            ]);
        }

        return $base;
    }

    /**
     * Transform logbook data
     */
        private function transformLogbook(Logbook $logbook): array
    {
        // Handle tanggal dengan safety check
        $activityDate = null;
        $activityDateFormatted = null;
        $createdAt = null;
        
        try {
            if ($logbook->tgl_kegiatan) {
                if ($logbook->tgl_kegiatan instanceof \Carbon\Carbon) {
                    $activityDate = $logbook->tgl_kegiatan->format('Y-m-d');
                    $activityDateFormatted = $logbook->tgl_kegiatan->format('d F Y');
                } else {
                    $activityDate = $logbook->tgl_kegiatan;
                    $activityDateFormatted = $logbook->tgl_kegiatan;
                }
            }
        } catch (\Exception $e) {
            $activityDate = $logbook->tgl_kegiatan ?? null;
            $activityDateFormatted = $logbook->tgl_kegiatan ?? 'Invalid Date';
        }

        // Handle created_at
        try {
            if ($logbook->date_created) {
                if ($logbook->date_created instanceof \Carbon\Carbon) {
                    $createdAt = $logbook->date_created->format('Y-m-d H:i:s');
                } else {
                    $createdAt = $logbook->date_created; // Jika string, gunakan langsung
                }
            }
        } catch (\Exception $e) {
            $createdAt = $logbook->date_created ?? null;
        }

        return [
            'id' => $logbook->id,
            'week' => $logbook->minggu_ke,
            'activity_date' => $activityDate,
            'activity_date_formatted' => $activityDateFormatted,
            'activity_name' => $logbook->nama_kegiatan,
            'activity_objective' => $logbook->tujuan_kegiatan,
            'notes' => $logbook->catatan,
            'conclusion' => $logbook->kesimpulan,
            'completion_status' => $logbook->completion_status,
            'completion_percentage' => $logbook->completion_percentage,
            'created_at' => $createdAt,
        ];
    }
    /**
     * Get registrant statistics
     */
    private function getRegistrantStatistics(Registration $registrant): array
    {
        $logbooks = $registrant->logbooks;
        
        // Handle last activity date with safety check
        $lastActivityDate = null;
        try {
            $maxDate = $logbooks->max('tgl_kegiatan');
            if ($maxDate) {
                if ($maxDate instanceof \Carbon\Carbon) {
                    $lastActivityDate = $maxDate->format('Y-m-d');
                } else {
                    // Jika string, gunakan langsung atau coba parse
                    $lastActivityDate = $maxDate;
                }
            }
        } catch (\Exception $e) {
            $lastActivityDate = null;
        }
        
        return [
            'total_logbooks' => $logbooks->count(),
            'completed_logbooks' => $logbooks->where('completion_percentage', 100)->count(),
            'partial_logbooks' => $logbooks->whereBetween('completion_percentage', [1, 99])->count(),
            'incomplete_logbooks' => $logbooks->where('completion_percentage', 0)->count(),
            'average_completion' => $logbooks->avg('completion_percentage') ?? 0,
            'total_weeks' => $logbooks->max('minggu_ke') ?? 0, // ubah dari 'minggu' ke 'minggu_ke'
            'last_activity_date' => $lastActivityDate,
        ];
    }

    /**
     * Get overall statistics
     */
    public function getStatistics(): array
    {
        return Cache::remember(self::CACHE_PREFIX . 'statistics', self::CACHE_TTL, function () {
            $total = Registration::count();
            $pendingPayment = Registration::whereNull('bukti_bayar')->count();
            $active = Registration::whereNotNull('bukti_bayar')->whereNull('nilai')->count();
            $awaitingAssessment = Registration::whereNotNull('laporan')->whereNull('nilai')->count();
            $completed = Registration::whereNotNull('nilai')->count();

            return [
                'total_registrants' => $total,
                'pending_payment' => $pendingPayment,
                'active' => $active,
                'awaiting_assessment' => $awaitingAssessment,
                'completed' => $completed,
                'completion_rate' => $total > 0 ? round(($completed / $total) * 100, 2) : 0,
                'payment_rate' => $total > 0 ? round((($total - $pendingPayment) / $total) * 100, 2) : 0,
            ];
        });
    }

    /**
     * Bulk operations
     */
    public function bulkApprove(array $registrantIds): int
    {
        return DB::transaction(function () use ($registrantIds) {
            $count = Registration::whereIn('id', $registrantIds)
                ->whereNull('nilai')
                ->update([
                    'nilai' => 'A',
                    'status' => 'approved',
                    'approved_at' => now(),
                ]);
            
            $this->clearCache();
            return $count;
        });
    }

    public function bulkReject(array $registrantIds, string $reason): int
    {
        return DB::transaction(function () use ($registrantIds, $reason) {
            $count = Registration::whereIn('id', $registrantIds)
                ->update([
                    'status' => 'rejected',
                    'rejection_reason' => $reason,
                    'rejected_at' => now(),
                ]);
            
            $this->clearCache();
            return $count;
        });
    }

    public function bulkDelete(array $registrantIds): int
    {
        return DB::transaction(function () use ($registrantIds) {
            // Delete related logbooks
            Logbook::whereIn('unit_pendaftar_id', $registrantIds)->delete();
            
            // Delete report files
            $registrants = Registration::whereIn('id', $registrantIds)->get();
            foreach ($registrants as $registrant) {
                if ($registrant->laporan) {
                    Storage::delete($registrant->laporan);
                }
                if ($registrant->bukti_bayar) {
                    Storage::delete($registrant->bukti_bayar);
                }
            }
            
            $count = Registration::whereIn('id', $registrantIds)->delete();
            
            $this->clearCache();
            return $count;
        });
    }

    /**
     * Export registrants
     */
    public function exportRegistrants(Request $request): string
    {
        $registrants = Registration::with(['student'])
            ->when($request->registrant_ids, function ($q) use ($request) {
                return $q->whereIn('id', $request->registrant_ids);
            })
            ->get();

        $data = $registrants->map(function ($registration) {
            return [
                'NIM' => $registration->nim,
                'Name' => $registration->student?->nama_lengkap ?? 'Unknown',
                'Study Program' => $this->getStudyProgramName($registration->id_prodi),
                'Academic Year' => $registration->tahun_akademik,
                'Semester' => $registration->semester,
                'Activity Type' => $registration->jenis_kegiatan,
                'Placement' => $registration->lokasi,
                'Phone' => $registration->no_hp,
                'Status' => $this->determineStatus($registration),
                'Payment Status' => !empty($registration->bukti_bayar) ? 'Paid' : 'Unpaid',
                'Report Status' => !empty($registration->laporan) ? 'Submitted' : 'Not Submitted',
                'Score' => $registration->nilai,
                'Registered At' => $registration->created_at?->format('Y-m-d H:i:s'),
            ];
        });

        $filename = 'registrants_export_' . now()->format('Y_m_d_H_i_s') . '.csv';
        $filepath = 'exports/' . $filename;

        // Create CSV content
        $csvContent = '';
        
        // Header
        if ($data->isNotEmpty()) {
            $csvContent .= implode(',', array_keys($data->first())) . "\n";
        }
        
        // Data rows
        foreach ($data as $row) {
            $csvContent .= implode(',', array_map(function ($value) {
                return '"' . str_replace('"', '""', $value ?? '') . '"';
            }, $row)) . "\n";
        }

        Storage::put($filepath, $csvContent);
        
        return $filepath;
    }

    /**
     * Search registrants
     */
    public function searchRegistrants(string $query): array
    {
        if (empty($query)) {
            return [];
        }

        $registrants = Registration::with(['student'])
            ->where(function ($q) use ($query) {
                $q->where('nim', 'like', "%{$query}%")
                  ->orWhereHas('student', function ($studentQuery) use ($query) {
                      $studentQuery->where('nama_lengkap', 'like', "%{$query}%");
                  })
                  ->orWhere('lokasi', 'like', "%{$query}%");
            })
            ->limit(10)
            ->get();

        return $registrants->map(function ($registration) {
            return [
                'id' => $registration->id,
                'nim' => $registration->nim,
                'name' => $registration->student?->nama_lengkap ?? 'Unknown',
                'placement' => $registration->lokasi,
                'status' => $this->determineStatus($registration),
            ];
        })->toArray();
    }

    /**
     * Helper methods for filter options
     */
    private function getActivityTypes(): array
    {
        return Cache::remember(self::CACHE_PREFIX . 'activity_types', self::CACHE_TTL * 4, function () {
            $types = Registration::select('jenis_kegiatan')
                ->distinct()
                ->whereNotNull('jenis_kegiatan')
                ->pluck('jenis_kegiatan')
                ->map(fn($type) => ['value' => $type, 'label' => ucwords(str_replace('_', ' ', $type))])
                ->prepend(['value' => 'all', 'label' => 'All Activity Types']);
            
            return $types->toArray();
        });
    }

    private function getAcademicYears(): array
    {
        return Cache::remember(self::CACHE_PREFIX . 'academic_years', self::CACHE_TTL * 4, function () {
            return Registration::select('tahun_akademik')
                ->distinct()
                ->whereNotNull('tahun_akademik')
                ->orderBy('tahun_akademik', 'desc')
                ->pluck('tahun_akademik')
                ->map(fn($year) => ['value' => $year, 'label' => $year])
                ->prepend(['value' => 'all', 'label' => 'All Academic Years'])
                ->toArray();
        });
    }

    private function getSemesters(): array
    {
        return [
            ['value' => 'all', 'label' => 'All Semesters'],
            ['value' => 'Ganjil', 'label' => 'Odd Semester'],
            ['value' => 'Genap', 'label' => 'Even Semester'],
        ];
    }

    private function getStatuses(): array
    {
        return [
            ['value' => 'all', 'label' => 'All Statuses'],
            ['value' => 'pending_payment', 'label' => 'Pending Payment'],
            ['value' => 'active', 'label' => 'Active'],
            ['value' => 'awaiting_assessment', 'label' => 'Awaiting Assessment'],
            ['value' => 'completed', 'label' => 'Completed'],
        ];
    }

    /**
     * Get study programs from database
     */
    private function getStudyPrograms(): array
    {
        return Cache::remember(self::CACHE_PREFIX . 'study_programs', self::CACHE_TTL * 4, function () {
            // Ambil data dari tabel prodi
            $prodis = DB::table('prodi')
                ->select('id_prodi', 'nama_prodi')
                ->where('status', 'A') // Hanya yang aktif
                ->orderBy('nama_prodi')
                ->get();

            // Transform ke format yang dibutuhkan
            $prodiOptions = $prodis->map(function ($prodi) {
                return [
                    'value' => $prodi->id_prodi,
                    'label' => $prodi->nama_prodi
                ];
            })->toArray();

            // Tambahkan option "Semua Program Studi" di awal
            array_unshift($prodiOptions, [
                'value' => 'all',
                'label' => 'Semua Program Studi'
            ]);

            return $prodiOptions;
        });
    }

    /**
     * Get study program name by ID from database
     */
    private function getStudyProgramName($prodiId): string
    {
        return Cache::remember(self::CACHE_PREFIX . "study_program_{$prodiId}", self::CACHE_TTL * 4, function () use ($prodiId) {
            $prodi = DB::table('prodi')
                ->where('id_prodi', $prodiId)
                ->first();

            return $prodi ? $prodi->nama_prodi : 'Program Studi Tidak Dikenal';
        });
    }

    /**
     * Get filter options for API
     */
    public function getFilterOptions(): array
    {
        return [
            'activity_types' => $this->getActivityTypes(),
            'academic_years' => $this->getAcademicYears(),
            'semesters' => $this->getSemesters(),
            'statuses' => $this->getStatuses(),
            'study_programs' => $this->getStudyPrograms(),
        ];
    }

    /**
     * Helper methods
     */
    private function determineStatus(Registration $registration): string
    {
        if (!empty($registration->nilai)) {
            return 'completed';
        } elseif (!empty($registration->laporan)) {
            return 'awaiting_assessment';
        } elseif (!empty($registration->bukti_bayar)) {
            return 'active';
        } else {
            return 'pending_payment';
        }
    }


    private function getGenderFromStudent(Registration $registration): string
    {
        $gender = $registration->student?->jenis_kelamin;
        return $gender === 'L' ? 'Male' : ($gender === 'P' ? 'Female' : 'Unknown');
    }

    /**
     * Clear cache
     */
    private function clearCache(): void
    {
        Cache::forget(self::CACHE_PREFIX . 'statistics');
        Cache::forget(self::CACHE_PREFIX . 'activity_types');
        Cache::forget(self::CACHE_PREFIX . 'academic_years');
    }
}