<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Student extends Model
{
    use HasFactory;

    protected $table = 'pengguna';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'tgl_bayar' => 'date',
    ];

    /**
     * Relationship to registrations (one to many)
     * One student can register for multiple MBKM programs
     */
    public function registrations(): HasMany
    {
        return $this->hasMany(Registration::class, 'nim', 'nim');
    }

    /**
     * Relationship to logbooks (one to many)
     * One student can have many logbook entries
     */
    public function logbooks(): HasMany
    {
        return $this->hasMany(Logbook::class, 'nim', 'nim');
    }

    /**
     * Scope to filter by study program
     */
    public function scopeByStudyProgram($query, $prodiId)
    {
        return $query->where('id_prodi', $prodiId);
    }

    /**
     * Scope to filter by academic year
     */
    public function scopeByAcademicYear($query, $year)
    {
        return $query->where('tahun_akademik', $year);
    }

    /**
     * Scope to filter by activity type
     */
    public function scopeByActivityType($query, $type)
    {
        return $query->where('jenis_kegiatan', $type);
    }

    /**
     * Accessor to get full name
     * Since no name field is visible, using NIM as identifier for now
     */
    public function getFullNameAttribute()
    {
        return $this->nim; // Temporarily using NIM
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
     * Accessor for activity status
     */
    public function getActivityStatusAttribute()
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
}   