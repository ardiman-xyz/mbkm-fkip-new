<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Registration extends Model
{
    use HasFactory;

    protected $table = 'unit_pendaftar';
    protected $primaryKey = 'id';

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'tgl_bayar' => 'date',
    ];

    /**
     * Relationship to student (many to one)
     * Many registrations can belong to one student
     */
    public function student(): BelongsTo
    {
        return $this->belongsTo(Student::class, 'nim', 'nim');
    }

    /**
     * Relationship to logbooks (one to many)
     * One registration can have many logbook entries
     */
    public function logbooks(): HasMany
    {
        return $this->hasMany(Logbook::class, 'id_pendaftar', 'id');
    }

    /**
     * Scope to filter by activity type
     */
    public function scopeByActivityType($query, $type)
    {
        return $query->where('jenis_kegiatan', $type);
    }

    /**
     * Scope to filter by location
     */
    public function scopeByLocation($query, $location)
    {
        return $query->where('lokasi', $location);
    }

    /**
     * Scope to filter by academic year
     */
    public function scopeByAcademicYear($query, $year)
    {
        return $query->where('tahun_akademik', $year);
    }

    /**
     * Scope for paid registrations
     */
    public function scopePaid($query)
    {
        return $query->whereNotNull('bukti_bayar');
    }

    /**
     * Scope for unpaid registrations
     */
    public function scopeUnpaid($query)
    {
        return $query->whereNull('bukti_bayar');
    }

    /**
     * Scope for registrations with submitted reports
     */
    public function scopeWithReport($query)
    {
        return $query->whereNotNull('laporan');
    }

    /**
     * Scope for registrations without reports
     */
    public function scopeWithoutReport($query)
    {
        return $query->whereNull('laporan');
    }

    /**
     * Scope for completed registrations
     */
    public function scopeCompleted($query)
    {
        return $query->whereNotNull('nilai');
    }

    /**
     * Accessor for registration status
     */
    public function getRegistrationStatusAttribute()
    {
        if (!empty($this->nilai)) {
            return 'Completed';
        } elseif (!empty($this->laporan)) {
            return 'Awaiting Assessment';
        } elseif (!empty($this->bukti_bayar)) {
            return 'Active';
        } else {
            return 'Awaiting Payment';
        }
    }

    /**
     * Accessor for readable activity name
     */
    public function getActivityNameAttribute()
    {
        $mapping = [
            'magang' => 'Internship/Work Practice',
            'penelitian' => 'Research',
            'pertukaran' => 'Student Exchange',
            'kewirausahaan' => 'Entrepreneurship',
            'mengajar' => 'Teaching in Schools',
            'kkn' => 'Thematic Community Service'
        ];

        return $mapping[strtolower($this->jenis_kegiatan)] ?? $this->jenis_kegiatan;
    }

    /**
     * Accessor for status badge color
     */
    public function getStatusColorAttribute()
    {
        switch ($this->registration_status) {
            case 'Completed':
                return 'success';
            case 'Active':
                return 'primary';
            case 'Awaiting Assessment':
                return 'warning';
            case 'Awaiting Payment':
                return 'danger';
            default:
                return 'secondary';
        }
    }

    /**
     * Accessor for payment status
     */
    public function getPaymentStatusAttribute()
    {
        return !empty($this->bukti_bayar) ? 'Paid' : 'Unpaid';
    }

    /**
     * Accessor for report status
     */
    public function getReportStatusAttribute()
    {
        return !empty($this->laporan) ? 'Submitted' : 'Not Submitted';
    }

    /**
     * Accessor for assessment status
     */
    public function getAssessmentStatusAttribute()
    {
        return !empty($this->nilai) ? 'Assessed' : 'Not Assessed';
    }
}