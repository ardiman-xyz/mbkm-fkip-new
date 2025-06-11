import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Calendar, GraduationCap, MapPin, Search, X } from 'lucide-react';

interface FilterOption {
    value: string;
    label: string;
}

interface Filters {
    academic_years: FilterOption[];
    placements: FilterOption[];
    semesters: FilterOption[];
    prodis: FilterOption[];
    current_academic_year: string;
    current_placement: string;
    current_semester: string;
    current_prodi: string;
}

interface DashboardFiltersProps {
    filters: Filters;
    searchTerm: string;
    isLoading: boolean;
    onFilterChange: (type: string, value: string) => void;
    onSearchChange: (value: string) => void;
    onSearchSubmit: (value: string) => void;
    onClearFilters: () => void;
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
    const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onSearchSubmit(searchTerm);
        }
    };

    const hasActiveFilters =
        filters.current_academic_year !== 'all' ||
        filters.current_placement !== 'all' ||
        filters.current_semester !== 'all' ||
        filters.current_prodi !== 'all' ||
        searchTerm.length > 0;

    return (
        <Card>
            <CardContent className="pt-6">
                <div className="space-y-4">
                    {/* Header dengan Clear Filters */}
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold">Filter Data</h3>
                        {hasActiveFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClearFilters}
                                disabled={isLoading}
                                className="text-muted-foreground hover:text-foreground"
                            >
                                <X className="mr-2 h-4 w-4" />
                                Clear Filters
                            </Button>
                        )}
                    </div>

                    {/* Filter Row */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {/* Academic Year Filter */}
                        <div className="space-y-2">
                            <Select
                                value={filters.current_academic_year}
                                onValueChange={(value) => onFilterChange('academic_year', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="w-full">
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

                        {/* Semester Filter */}
                        <div className="space-y-2">
                            <Select
                                value={filters.current_semester}
                                onValueChange={(value) => onFilterChange('semester', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="w-full">
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="text-muted-foreground h-4 w-4" />
                                        <SelectValue placeholder="Semua Semester" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {filters.semesters.map((semester) => (
                                        <SelectItem key={semester.value} value={semester.value}>
                                            {semester.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Program Studi Filter */}
                        <div className="space-y-2">
                            <Select value={filters.current_prodi} onValueChange={(value) => onFilterChange('prodi', value)} disabled={isLoading}>
                                <SelectTrigger className="w-full">
                                    <div className="flex items-center gap-2">
                                        <GraduationCap className="text-muted-foreground h-4 w-4" />
                                        <SelectValue placeholder="Semua Program Studi" />
                                    </div>
                                </SelectTrigger>
                                <SelectContent>
                                    {filters.prodis && filters.prodis.length > 0 ? (
                                        filters.prodis.map((prodi) => (
                                            <SelectItem key={prodi.value} value={prodi.value.toString()}>
                                                {prodi.label}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <SelectItem value="all">Semua Program Studi</SelectItem>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Placement Filter */}
                        <div className="space-y-2">
                            <Select
                                value={filters.current_placement}
                                onValueChange={(value) => onFilterChange('placement', value)}
                                disabled={isLoading}
                            >
                                <SelectTrigger className="w-full">
                                    <div className="flex items-center gap-2">
                                        <MapPin className="text-muted-foreground h-4 w-4" />
                                        <SelectValue placeholder="Semua Penempatan" />
                                    </div>
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
                    </div>

                    {/* Search Input */}
                    <div className="relative">
                        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 transform" />
                        <Input
                            placeholder="Cari mahasiswa, NIM, atau penempatan..."
                            value={searchTerm}
                            onChange={(e) => onSearchChange(e.target.value)}
                            onKeyPress={handleSearchKeyPress}
                            disabled={isLoading}
                            className="pl-10"
                        />
                    </div>

                    {/* Active Filters Display */}
                    {hasActiveFilters && (
                        <div className="flex flex-wrap gap-2">
                            <span className="text-muted-foreground text-sm">Active filters:</span>

                            {filters.current_academic_year !== 'all' && (
                                <div className="flex items-center gap-1 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700">
                                    <Calendar className="h-3 w-3" />
                                    {filters.academic_years.find((y) => y.value === filters.current_academic_year)?.label}
                                    <button onClick={() => onFilterChange('academic_year', 'all')} className="ml-1 hover:text-blue-900">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}

                            {filters.current_semester !== 'all' && (
                                <div className="flex items-center gap-1 rounded-md bg-green-50 px-2 py-1 text-xs text-green-700">
                                    <BookOpen className="h-3 w-3" />
                                    {filters.semesters.find((s) => s.value === filters.current_semester)?.label}
                                    <button onClick={() => onFilterChange('semester', 'all')} className="ml-1 hover:text-green-900">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}

                            {filters.current_prodi !== 'all' && (
                                <div className="flex items-center gap-1 rounded-md bg-purple-50 px-2 py-1 text-xs text-purple-700">
                                    <GraduationCap className="h-3 w-3" />
                                    {filters.prodis?.find((p) => p.value === filters.current_prodi)?.label}
                                    <button onClick={() => onFilterChange('prodi', 'all')} className="ml-1 hover:text-purple-900">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}

                            {filters.current_placement !== 'all' && (
                                <div className="flex items-center gap-1 rounded-md bg-orange-50 px-2 py-1 text-xs text-orange-700">
                                    <MapPin className="h-3 w-3" />
                                    {filters.placements.find((p) => p.value === filters.current_placement)?.label}
                                    <button onClick={() => onFilterChange('placement', 'all')} className="ml-1 hover:text-orange-900">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}

                            {searchTerm.length > 0 && (
                                <div className="flex items-center gap-1 rounded-md bg-gray-50 px-2 py-1 text-xs text-gray-700">
                                    <Search className="h-3 w-3" />"{searchTerm}"
                                    <button onClick={() => onSearchChange('')} className="ml-1 hover:text-gray-900">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
