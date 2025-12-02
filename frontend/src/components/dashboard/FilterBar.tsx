import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { timeRangeOptions, sourceOptions } from '@/data/mockData';
import { useState } from 'react';

export function FilterBar() {
    const [timeRange, setTimeRange] = useState('1h');
    const [source, setSource] = useState('all');

    return (
        <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Time Range
                    </label>
                    <Select value={timeRange} onValueChange={setTimeRange}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select time range" />
                        </SelectTrigger>
                        <SelectContent>
                            {timeRangeOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex-1 min-w-[200px]">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Source
                    </label>
                    <Select value={source} onValueChange={setSource}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select source" />
                        </SelectTrigger>
                        <SelectContent>
                            {sourceOptions.map((option) => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
