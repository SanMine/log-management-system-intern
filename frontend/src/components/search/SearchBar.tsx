import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface SearchBarProps {
    onSearch: (query: string, page: number) => void;
    onClear: () => void;
    isLoading: boolean;
    currentPage: number;
    totalPages: number;
    hasResults: boolean;
    resultCount?: number;
}

/**
 * SearchBar Component
 * 
 * A reusable search bar with pagination controls for filtering log events.
 * 
 * Features:
 * - Free-text search input
 * - Search button (or press Enter)
 * - Clear button to reset search
 * - Pagination controls (Previous/Next)
 * - Loading state indicator
 */
export function SearchBar({
    onSearch,
    onClear,
    isLoading,
    currentPage,
    totalPages,
    hasResults,
    resultCount,
}: SearchBarProps) {
    // Local state for the search input
    const [searchInput, setSearchInput] = useState('');

    // Handle search submission
    const handleSearch = () => {
        if (searchInput.trim()) {
            onSearch(searchInput.trim(), 1); // Start from page 1
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    // Handle clear/reset
    const handleClear = () => {
        setSearchInput('');
        onClear();
    };

    // Handle pagination
    const handlePrevious = () => {
        if (currentPage > 1) {
            onSearch(searchInput, currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages) {
            onSearch(searchInput, currentPage + 1);
        }
    };

    return (
        <div className="space-y-3">
            {/* Search Input Row */}
            <div className="flex items-center gap-3">
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        type="text"
                        placeholder="Search logs by user, IP, event type, message..."
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={isLoading}
                        className="pl-10 pr-4 border-slate-200 focus:ring-brand-500 focus:border-brand-500 bg-white"
                    />
                </div>

                <Button
                    onClick={handleSearch}
                    disabled={isLoading || !searchInput.trim()}
                    className="bg-brand-600 hover:bg-brand-700 text-white"
                >
                    {isLoading ? (
                        <>
                            <span className="animate-spin mr-2">⏳</span>
                            Searching...
                        </>
                    ) : (
                        <>
                            <Search className="h-4 w-4 mr-2" />
                            Search
                        </>
                    )}
                </Button>

                {hasResults && (
                    <Button
                        onClick={handleClear}
                        variant="outline"
                        className="border-slate-200 hover:bg-slate-50"
                    >
                        <X className="h-4 w-4 mr-2" />
                        Clear
                    </Button>
                )}
            </div>

            {/* Pagination Controls (shown when there are search results) */}
            {hasResults && totalPages > 0 && (
                <div className="flex items-center justify-between text-sm">
                    <div className="text-slate-600">
                        {resultCount !== undefined && (
                            <span>
                                Found <strong>{resultCount}</strong> result{resultCount !== 1 ? 's' : ''}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handlePrevious}
                            disabled={currentPage <= 1 || isLoading}
                            variant="outline"
                            size="sm"
                            className="border-slate-200"
                        >
                            <ChevronLeft className="h-4 w-4 mr-1" />
                            Previous
                        </Button>

                        <span className="text-slate-600 px-3">
                            Page {currentPage} of {totalPages}
                        </span>

                        <Button
                            onClick={handleNext}
                            disabled={currentPage >= totalPages || isLoading}
                            variant="outline"
                            size="sm"
                            className="border-slate-200"
                        >
                            Next
                            <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
