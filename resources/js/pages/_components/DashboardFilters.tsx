import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Building2, Calendar, Search, X } from 'lucide-react';

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

interface DashboardFiltersProps {
    filters: Filters;
    searchTerm: string;
    isLoading: boolean;
    onFilterChange: (type: string, value: string) => void;
    onSearchChange: (value: string) => void;
    onSearchSubmit: (value: string) => void;
    onClearFilters?: () => void;
}

export default function DashboardFilters({
    filters,
    searchTerm,
    isLoading,
    onFilterChange,
    onSearchChange,
    onSearchSubmit,
    onClearFilters,
}: DashboardFiltersProps) {
    // Check if any filter is active
    const hasActiveFilters =
        filters.current_academic_year !== 'all' || filters.current_semester !== 'all' || filters.current_placement !== 'all' || searchTerm.length > 0;

    const handleClearAllFilters = () => {
        // Reset all filters to default
        onFilterChange('academic_year', 'all');
        onFilterChange('semester', 'all');
        onFilterChange('placement', 'all');
        onSearchChange('');

        // Call custom clear function if provided
        if (onClearFilters) {
            onClearFilters();
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSearchSubmit(searchTerm);
        }
    };
    return (
        <Card>
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Filter Data</CardTitle>
                    {hasActiveFilters && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleClearAllFilters}
                            disabled={isLoading}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <X className="mr-2 h-4 w-4" />
                            Hapus Semua Filter
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <Select
                            value={filters.current_academic_year}
                            onValueChange={(value) => onFilterChange('academic_year', value)}
                            disabled={isLoading}
                        >
                            <SelectTrigger className="w-full sm:w-64">
                                <Calendar className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Tahun Akademik" />
                            </SelectTrigger>
                            <SelectContent>
                                {filters.academic_years.map((year) => (
                                    <SelectItem key={year.value} value={year.value}>
                                        {year.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filters.current_semester} onValueChange={(value) => onFilterChange('semester', value)} disabled={isLoading}>
                            <SelectTrigger className="w-full sm:w-48">
                                <BookOpen className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Semester" />
                            </SelectTrigger>
                            <SelectContent>
                                {filters.semesters.map((semester) => (
                                    <SelectItem key={semester.value} value={semester.value}>
                                        {semester.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={filters.current_placement} onValueChange={(value) => onFilterChange('placement', value)} disabled={isLoading}>
                            <SelectTrigger className="w-full sm:w-64">
                                <Building2 className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Penempatan" />
                            </SelectTrigger>
                            <SelectContent>
                                {filters.placements.map((placement) => (
                                    <SelectItem key={placement.value} value={placement.value}>
                                        {placement.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Search */}
                    <div className="relative">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
                        <Input
                            placeholder="Cari mahasiswa, NIM, atau penempatan... (tekan Enter)"
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyPress={handleKeyPress}
                            className="w-full pl-10 sm:w-80"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
