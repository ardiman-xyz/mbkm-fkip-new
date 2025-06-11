import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import {
    AlertCircle,
    BookOpen,
    Calendar,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Clock,
    Download,
    Eye,
    FileText,
    Filter,
    GraduationCap,
    Search,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

interface RecentLogbook {
    id: number;
    week: number | null;
    date: string;
    activity_name: string | null;
    objective: string | null;
    notes: string | null;
    completion_percentage: number;
}

interface Student {
    id: number;
    nim: string;
    name: string;
    study_program: string;
    academic_year: string;
    semester: string;
    activity_type: string;
    placement: string;
    logbook_stats: {
        total_entries: number;
        completed_entries: number;
        partial_entries: number;
        incomplete_entries: number;
        completion_rate: number;
        average_completion: number;
        weeks_covered: number;
        latest_entry: string | null;
    };
    recent_logbooks: RecentLogbook[];
    status: string;
}

interface Statistics {
    total_logbooks: number;
    total_students: number;
    average_entries_per_student: number;
    completed_logbooks: number;
    completion_rate: number;
    latest_entry_date: string | null;
    total_weeks_covered: number;
}

interface FilterOption {
    value: string;
    label: string;
}

interface Filters {
    academic_years: FilterOption[];
    prodis: FilterOption[];
}

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface LogbooksIndexProps {
    students: {
        data: Student[];
        pagination: PaginationData;
    };
    statistics: Statistics;
    filters: Filters;
}

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Logbook Mahasiswa',
        href: '/logbooks',
    },
];

export default function LogbooksIndex({ students, statistics, filters }: LogbooksIndexProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [currentFilters, setCurrentFilters] = useState({
        academic_year: 'all',
        prodi: 'all',
    });
    const [isLoading, setIsLoading] = useState(false);

    const getCompletionBadge = (rate: number) => {
        if (rate === 100) {
            return (
                <Badge variant="outline" className="border-green-200 bg-green-100 text-green-800">
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    Lengkap
                </Badge>
            );
        } else if (rate >= 75) {
            return (
                <Badge variant="outline" className="border-blue-200 bg-blue-100 text-blue-800">
                    <Clock className="mr-1 h-3 w-3" />
                    Hampir Lengkap
                </Badge>
            );
        } else if (rate > 0) {
            return (
                <Badge variant="outline" className="border-yellow-200 bg-yellow-100 text-yellow-800">
                    <Clock className="mr-1 h-3 w-3" />
                    Sebagian
                </Badge>
            );
        } else {
            return (
                <Badge variant="outline" className="border-red-200 bg-red-100 text-red-800">
                    <AlertCircle className="mr-1 h-3 w-3" />
                    Belum Lengkap
                </Badge>
            );
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { color: string; icon: typeof CheckCircle2 }> = {
            Active: { color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle2 },
            Completed: { color: 'bg-blue-100 text-blue-800 border-blue-200', icon: CheckCircle2 },
            'Awaiting Assessment': { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
            'Awaiting Payment': { color: 'bg-red-100 text-red-800 border-red-200', icon: AlertCircle },
        };

        const config = statusConfig[status] || statusConfig['Awaiting Payment'];
        const Icon = config.icon;

        return (
            <Badge variant="outline" className={`${config.color} text-xs`}>
                <Icon className="mr-1 h-3 w-3" />
                {status}
            </Badge>
        );
    };

    const handleFilterChange = (key: string, value: string) => {
        setCurrentFilters((prev) => ({ ...prev, [key]: value }));
        setIsLoading(true);

        router.get(
            '/logbooks',
            {
                ...currentFilters,
                [key]: value,
                search: searchTerm,
            },
            {
                preserveState: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handleSearch = () => {
        setIsLoading(true);

        router.get(
            '/logbooks',
            {
                ...currentFilters,
                search: searchTerm,
            },
            {
                preserveState: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const clearFilters = () => {
        setCurrentFilters({
            academic_year: 'all',
            prodi: 'all',
        });
        setSearchTerm('');
        setIsLoading(true);

        router.get(
            '/logbooks',
            {},
            {
                preserveState: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handlePageChange = (page: number) => {
        setIsLoading(true);

        router.get(
            '/logbooks',
            {
                ...currentFilters,
                search: searchTerm,
                page: page,
            },
            {
                preserveState: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    const handlePerPageChange = (perPage: number) => {
        setIsLoading(true);

        router.get(
            '/logbooks',
            {
                ...currentFilters,
                search: searchTerm,
                per_page: perPage,
                page: 1, // Reset to first page when changing per page
            },
            {
                preserveState: true,
                onFinish: () => setIsLoading(false),
            },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Logbook Mahasiswa" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Logbook Mahasiswa</h1>
                        <p className="text-muted-foreground">Monitor dan kelola aktivitas logbook mahasiswa MBKM</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Export Data
                        </Button>
                    </div>
                </div>

                {/* Statistics Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Mahasiswa</CardTitle>
                            <Users className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_students}</div>
                            <p className="text-muted-foreground text-xs">{statistics.average_entries_per_student} entry rata-rata per mahasiswa</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Logbook</CardTitle>
                            <FileText className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.total_logbooks}</div>
                            <p className="text-muted-foreground text-xs">{statistics.total_weeks_covered} minggu tercakup</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Tingkat Penyelesaian</CardTitle>
                            <TrendingUp className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{statistics.completion_rate}%</div>
                            <Progress value={statistics.completion_rate} className="mt-2" />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Logbook Lengkap</CardTitle>
                            <CheckCircle2 className="text-muted-foreground h-4 w-4" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{statistics.completed_logbooks}</div>
                            <p className="text-muted-foreground text-xs">Entry yang sudah lengkap</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-5 w-5" />
                            Filter Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* Filter Row */}
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                            {/* Academic Year Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Tahun Akademik</label>
                                <Select value={currentFilters.academic_year} onValueChange={(value) => handleFilterChange('academic_year', value)}>
                                    <SelectTrigger>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="text-muted-foreground h-4 w-4" />
                                            <SelectValue placeholder="Semua Tahun Akademik" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filters.academic_years.map((year) => (
                                            <SelectItem key={year.value} value={year.value}>
                                                {year.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Program Studi Filter */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Program Studi</label>
                                <Select value={currentFilters.prodi} onValueChange={(value) => handleFilterChange('prodi', value)}>
                                    <SelectTrigger>
                                        <div className="flex items-center gap-2">
                                            <GraduationCap className="text-muted-foreground h-4 w-4" />
                                            <SelectValue placeholder="Semua Program Studi" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent>
                                        {filters.prodis.map((prodi) => (
                                            <SelectItem key={prodi.value} value={prodi.value}>
                                                {prodi.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Search Row */}
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <div className="relative flex-1">
                                <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                                <Input
                                    placeholder="Cari nama mahasiswa atau NIM..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="pl-10"
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={handleSearch} variant="default" className="flex-shrink-0">
                                    <Search className="mr-2 h-4 w-4" />
                                    Cari
                                </Button>
                                <Button onClick={clearFilters} variant="outline" className="flex-shrink-0">
                                    <X className="mr-2 h-4 w-4" />
                                    Reset Filter
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Students Table */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <BookOpen className="h-5 w-5" />
                            Data Logbook Mahasiswa
                        </CardTitle>
                        <CardDescription>
                            Menampilkan {students.pagination.from} - {students.pagination.to} dari {students.pagination.total} mahasiswa
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-[200px]">Mahasiswa</TableHead>
                                        <TableHead>Program Studi</TableHead>
                                        <TableHead>Tahun Akademik</TableHead>
                                        <TableHead className="w-[300px]">Aktivitas Logbook</TableHead>
                                        <TableHead>Status Penyelesaian</TableHead>
                                        <TableHead>Status Mahasiswa</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {students.data.map((student) => (
                                        <TableRow key={student.id}>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-medium">{student.name}</div>
                                                    <div className="text-muted-foreground font-mono text-sm">{student.nim}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="text-sm">{student.study_program}</div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="text-sm">{student.academic_year}</div>
                                                    <div className="text-muted-foreground text-xs">{student.semester}</div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-3">
                                                    {/* Statistik ringkas */}
                                                    <div className="flex items-center gap-4 border-b pb-2 text-sm">
                                                        <div className="flex items-center gap-1">
                                                            <FileText className="text-muted-foreground h-4 w-4" />
                                                            <span className="font-medium">{student.logbook_stats.total_entries}</span>
                                                            <span className="text-muted-foreground">entries</span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <span className="text-muted-foreground text-xs">Progress:</span>
                                                            <span className="text-xs font-medium">{student.logbook_stats.completion_rate}%</span>
                                                        </div>
                                                    </div>

                                                    {/* Recent Activities */}
                                                    <div className="space-y-2">
                                                        {student.recent_logbooks && student.recent_logbooks.length > 0 ? (
                                                            student.recent_logbooks.map((logbook, index) => (
                                                                <div key={logbook.id} className="space-y-1 text-xs">
                                                                    <div className="flex items-center gap-2">
                                                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                                                        <span className="text-muted-foreground font-medium">
                                                                            {logbook.week ? `Week ${logbook.week}` : 'No Week'} - {logbook.date}
                                                                        </span>
                                                                        <Badge
                                                                            variant="outline"
                                                                            className={`px-1 py-0 text-xs ${
                                                                                logbook.completion_percentage === 100
                                                                                    ? 'border-green-200 bg-green-50 text-green-700'
                                                                                    : logbook.completion_percentage > 0
                                                                                      ? 'border-yellow-200 bg-yellow-50 text-yellow-700'
                                                                                      : 'border-red-200 bg-red-50 text-red-700'
                                                                            }`}
                                                                        >
                                                                            {logbook.completion_percentage}%
                                                                        </Badge>
                                                                    </div>
                                                                    {logbook.activity_name && (
                                                                        <div className="pl-4 text-gray-700">
                                                                            <div className="font-medium">
                                                                                {logbook.activity_name.length > 60
                                                                                    ? logbook.activity_name.substring(0, 60) + '...'
                                                                                    : logbook.activity_name}
                                                                            </div>
                                                                        </div>
                                                                    )}
                                                                    {logbook.objective && (
                                                                        <div className="pl-4 text-gray-600">
                                                                            <span className="text-muted-foreground">Tujuan: </span>
                                                                            {logbook.objective.length > 80
                                                                                ? logbook.objective.substring(0, 80) + '...'
                                                                                : logbook.objective}
                                                                        </div>
                                                                    )}
                                                                    {index < student.recent_logbooks.length - 1 && (
                                                                        <div className="border-b border-gray-100 pb-1"></div>
                                                                    )}
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <div className="text-muted-foreground text-xs italic">Belum ada aktivitas logbook</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getCompletionBadge(student.logbook_stats.completion_rate)}</TableCell>
                                            <TableCell>{getStatusBadge(student.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button size="sm" variant="outline" asChild>
                                                        <Link href={`/logbooks/student/${student.id}`}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Detail
                                                        </Link>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {students.pagination.last_page > 1 && (
                            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="text-muted-foreground text-sm">
                                        Showing {students.pagination.from} - {students.pagination.to} of {students.pagination.total} students
                                    </div>
                                    <Select
                                        value={students.pagination.per_page.toString()}
                                        onValueChange={(value) => handlePerPageChange(parseInt(value))}
                                    >
                                        <SelectTrigger className="w-20">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="10">10</SelectItem>
                                            <SelectItem value="15">15</SelectItem>
                                            <SelectItem value="25">25</SelectItem>
                                            <SelectItem value="50">50</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <span className="text-muted-foreground text-sm">per page</span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(students.pagination.current_page - 1)}
                                        disabled={students.pagination.current_page === 1 || isLoading}
                                    >
                                        <ChevronLeft className="h-4 w-4" />
                                        Previous
                                    </Button>

                                    <div className="flex items-center gap-1">
                                        {/* Show page numbers */}
                                        {(() => {
                                            const { current_page, last_page } = students.pagination;
                                            const pages = [];

                                            // Always show first page
                                            if (current_page > 3) {
                                                pages.push(
                                                    <Button
                                                        key={1}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePageChange(1)}
                                                        disabled={isLoading}
                                                    >
                                                        1
                                                    </Button>,
                                                );
                                                if (current_page > 4) {
                                                    pages.push(
                                                        <span key="dots1" className="px-2">
                                                            ...
                                                        </span>,
                                                    );
                                                }
                                            }

                                            // Show pages around current page
                                            for (let i = Math.max(1, current_page - 2); i <= Math.min(last_page, current_page + 2); i++) {
                                                pages.push(
                                                    <Button
                                                        key={i}
                                                        variant={current_page === i ? 'default' : 'outline'}
                                                        size="sm"
                                                        onClick={() => handlePageChange(i)}
                                                        disabled={isLoading}
                                                    >
                                                        {i}
                                                    </Button>,
                                                );
                                            }

                                            // Always show last page
                                            if (current_page < last_page - 2) {
                                                if (current_page < last_page - 3) {
                                                    pages.push(
                                                        <span key="dots2" className="px-2">
                                                            ...
                                                        </span>,
                                                    );
                                                }
                                                pages.push(
                                                    <Button
                                                        key={last_page}
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handlePageChange(last_page)}
                                                        disabled={isLoading}
                                                    >
                                                        {last_page}
                                                    </Button>,
                                                );
                                            }

                                            return pages;
                                        })()}
                                    </div>

                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handlePageChange(students.pagination.current_page + 1)}
                                        disabled={students.pagination.current_page === students.pagination.last_page || isLoading}
                                    >
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
