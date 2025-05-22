import { router } from '@inertiajs/react';
import { useCallback, useState } from 'react';

interface UsePaginationProps {
    baseUrl?: string;
    preserveState?: boolean;
    preserveScroll?: boolean;
    onStart?: () => void;
    onFinish?: () => void;
}

interface PaginationParams {
    page?: number;
    per_page?: number;
    [key: string]: any;
}

export function usePagination({
    baseUrl = window.location.pathname,
    preserveState = true,
    preserveScroll = true,
    onStart,
    onFinish,
}: UsePaginationProps = {}) {
    const [isLoading, setIsLoading] = useState(false);

    const navigateToPage = useCallback(
        (params: PaginationParams) => {
            setIsLoading(true);
            onStart?.();

            // Get current URL parameters
            const currentParams = new URLSearchParams(window.location.search);

            // Update with new parameters
            Object.entries(params).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    currentParams.set(key, value.toString());
                }
            });

            // Navigate with updated parameters
            router.get(
                `${baseUrl}?${currentParams.toString()}`,
                {},
                {
                    preserveState,
                    preserveScroll,
                    onFinish: () => {
                        setIsLoading(false);
                        onFinish?.();
                    },
                },
            );
        },
        [baseUrl, preserveState, preserveScroll, onStart, onFinish],
    );

    const handlePageChange = useCallback(
        (page: number) => {
            navigateToPage({ page });
        },
        [navigateToPage],
    );

    const handlePerPageChange = useCallback(
        (perPage: number) => {
            // Reset to page 1 when changing per page
            navigateToPage({ page: 1, per_page: perPage });
        },
        [navigateToPage],
    );

    const handleFilterChange = useCallback(
        (filters: Record<string, any>) => {
            // Reset to page 1 when changing filters
            navigateToPage({ page: 1, ...filters });
        },
        [navigateToPage],
    );

    return {
        isLoading,
        handlePageChange,
        handlePerPageChange,
        handleFilterChange,
        navigateToPage,
    };
}
