import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

// Import our custom components
import { usePagination } from '@/hooks/use-pagination';
import DashboardFilters from './_components/DashboardFilters';
import DashboardHeader from './_components/DashboardHeader';
import StatisticsCards from './_components/StatisticsCards';
import StudentsTable from './_components/StudentsTable';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

interface Student {
    id: number;
    nim: string;
    name: string;
    study_program: string;
    academic_year: string;
    semester: string;
    activity_type: string;
    placement: string;
    location: string;
    phone: string;
    status: string;
    payment_status: string;
    report_status: string;
    registered_at: string;
    score: string | null;
}

interface Statistics {
    total: number;
    male: number;
    female: number;
    partners: number;
}

interface FilterOption {
    value: string;
    label: string;
}

interface Filters {
    academic_years: FilterOption[];
    placements: FilterOption[];
    semesters: FilterOption[];
    current_academic_year: string;
    current_placement: string;
    current_semester: string;
}

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface DashboardProps {
    students: {
        data: Student[];
        pagination: PaginationData;
    };
    statistics: Statistics;
    filters: Filters;
}

export default function Dashboard({ students, statistics, filters }: DashboardProps) {
    const [searchTerm, setSearchTerm] = useState('');

    const { isLoading, handlePageChange, handlePerPageChange, handleFilterChange } = usePagination({
        baseUrl: '/dashboard',
        onStart: () => {
            // Optional: Add loading state handling
        },
        onFinish: () => {
            // Optional: Add completion handling
        },
    });

    const handleRefresh = () => {
        window.location.reload();
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
    };

    const handleSearchSubmit = (value: string) => {
        // Trigger API call saat Enter ditekan
        handleFilterChange({ search: value });
    };

    const onFilterChange = (type: string, value: string) => {
        handleFilterChange({ [type]: value });
    };

    const handleClearAllFilters = () => {
        // Reset search term
        setSearchTerm('');

        // Reset all filters to 'all' including search
        handleFilterChange({
            academic_year: 'all',
            semester: 'all',
            placement: 'all',
            search: '',
        });
    };

    // Filter students based on search term (client-side for demo)
    const filteredStudents = students.data.filter(
        (student) =>
            student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.nim.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.placement.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.study_program.toLowerCase().includes(searchTerm.toLowerCase()),
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard MBKM FKIP" />

            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                {/* Header Component */}
                <DashboardHeader isLoading={isLoading} onRefresh={handleRefresh} />

                {/* Statistics Cards Component */}
                <StatisticsCards statistics={statistics} />

                {/* Filters Component */}
                <DashboardFilters
                    filters={filters}
                    searchTerm={searchTerm}
                    isLoading={isLoading}
                    onFilterChange={onFilterChange}
                    onSearchChange={handleSearchChange}
                    onSearchSubmit={handleSearchSubmit}
                    onClearFilters={handleClearAllFilters}
                />

                {/* Students Table Component with Pagination */}
                <StudentsTable
                    students={students.data}
                    pagination={students.pagination}
                    onPageChange={handlePageChange}
                    onPerPageChange={handlePerPageChange}
                />
            </div>
        </AppLayout>
    );
}
