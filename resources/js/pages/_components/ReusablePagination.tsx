import { Button } from '@/components/ui/button';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronFirst, ChevronLast } from 'lucide-react';

interface PaginationData {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface ReusablePaginationProps {
    paginationData: PaginationData;
    onPageChange: (page: number) => void;
    onPerPageChange?: (perPage: number) => void;
    showPerPageSelector?: boolean;
    showInfo?: boolean;
    className?: string;
}

export default function ReusablePagination({
    paginationData,
    onPageChange,
    onPerPageChange,
    showPerPageSelector = true,
    showInfo = true,
    className = '',
}: ReusablePaginationProps) {
    const { current_page, last_page, per_page, total, from, to } = paginationData;

    // Generate page numbers to show
    const generatePageNumbers = () => {
        const pages: (number | string)[] = [];
        const delta = 2; // Number of pages to show on each side of current page

        // Always show first page
        if (last_page > 0) {
            pages.push(1);
        }

        // Calculate start and end for middle pages
        let start = Math.max(2, current_page - delta);
        let end = Math.min(last_page - 1, current_page + delta);

        // Add ellipsis after first page if needed
        if (start > 2) {
            pages.push('ellipsis-start');
        }

        // Add middle pages
        for (let i = start; i <= end; i++) {
            if (i !== 1 && i !== last_page) {
                pages.push(i);
            }
        }

        // Add ellipsis before last page if needed
        if (end < last_page - 1) {
            pages.push('ellipsis-end');
        }

        // Always show last page (if different from first)
        if (last_page > 1) {
            pages.push(last_page);
        }

        return pages;
    };

    const pageNumbers = generatePageNumbers();

    const handlePageClick = (page: number) => {
        if (page >= 1 && page <= last_page && page !== current_page) {
            onPageChange(page);
        }
    };

    const handlePerPageChange = (value: string) => {
        if (onPerPageChange) {
            onPerPageChange(parseInt(value));
        }
    };

    // Don't render if there's only one page
    if (last_page <= 1) {
        return null;
    }

    return (
        <div className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between ${className}`}>
            {/* Pagination Info */}
            {showInfo && (
                <div className="text-muted-foreground text-sm">
                    Menampilkan {from?.toLocaleString()} - {to?.toLocaleString()} dari {total?.toLocaleString()} data
                </div>
            )}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {/* Per Page Selector */}
                {showPerPageSelector && onPerPageChange && (
                    <div className="flex items-center gap-2">
                        <span className="text-muted-foreground text-sm">Tampilkan:</span>
                        <Select value={per_page.toString()} onValueChange={handlePerPageChange}>
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="25">25</SelectItem>
                                <SelectItem value="50">50</SelectItem>
                                <SelectItem value="100">100</SelectItem>
                            </SelectContent>
                        </Select>
                        <span className="text-muted-foreground text-sm">per halaman</span>
                    </div>
                )}

                {/* Pagination Navigation */}
                <Pagination>
                    <PaginationContent>
                        {/* First Page Button */}
                        <PaginationItem>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageClick(1)}
                                disabled={current_page === 1}
                                className="h-9 w-9 p-0"
                                aria-label="Halaman pertama"
                            >
                                <ChevronFirst className="h-4 w-4" />
                            </Button>
                        </PaginationItem>

                        {/* Previous Page Button */}
                        <PaginationItem>
                            <PaginationPrevious
                                onClick={() => handlePageClick(current_page - 1)}
                                className={current_page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                aria-disabled={current_page === 1}
                            />
                        </PaginationItem>

                        {/* Page Numbers */}
                        {pageNumbers.map((page, index) => (
                            <PaginationItem key={index}>
                                {typeof page === 'string' ? (
                                    <PaginationEllipsis />
                                ) : (
                                    <PaginationLink onClick={() => handlePageClick(page)} isActive={page === current_page} className="cursor-pointer">
                                        {page}
                                    </PaginationLink>
                                )}
                            </PaginationItem>
                        ))}

                        {/* Next Page Button */}
                        <PaginationItem>
                            <PaginationNext
                                onClick={() => handlePageClick(current_page + 1)}
                                className={current_page === last_page ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                aria-disabled={current_page === last_page}
                            />
                        </PaginationItem>

                        {/* Last Page Button */}
                        <PaginationItem>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageClick(last_page)}
                                disabled={current_page === last_page}
                                className="h-9 w-9 p-0"
                                aria-label="Halaman terakhir"
                            >
                                <ChevronLast className="h-4 w-4" />
                            </Button>
                        </PaginationItem>
                    </PaginationContent>
                </Pagination>
            </div>
        </div>
    );
}
