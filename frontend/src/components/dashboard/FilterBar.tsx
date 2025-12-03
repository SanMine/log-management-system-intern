import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { timeRangeOptions } from '@/data/mockData';
import { TenantFilterDropdown } from './TenantFilterDropdown';
import { useTenants } from '@/hooks/useTenants';

interface FilterBarProps {
    tenant: string;
    onTenantChange: (tenant: string) => void;
    timeRange?: string;
    onTimeRangeChange?: (timeRange: string) => void;
}

export function FilterBar({ tenant, onTenantChange, timeRange = 'last_24h', onTimeRangeChange }: FilterBarProps) {
    const { tenants } = useTenants();

    return (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6 shadow-sm flex flex-wrap gap-6 items-center animate-slide-up">
            <div className="flex-1 min-w-[200px]">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Time Range
                </label>
                <Select value={timeRange} onValueChange={onTimeRangeChange}>
                    <SelectTrigger className="w-full border-slate-200 focus:ring-brand-500 focus:border-brand-500 bg-slate-50/50 hover:bg-white transition-colors">
                        <SelectValue placeholder="Select time range" />
                    </SelectTrigger>
                    <SelectContent>
                        {timeRangeOptions.map((option) => (
                            <SelectItem
                                key={option.value}
                                value={option.value}
                                className="cursor-pointer focus:bg-brand-50 focus:text-brand-700"
                            >
                                {option.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <TenantFilterDropdown
                value={tenant}
                onChange={onTenantChange}
                options={tenants}
            />
        </div>
    );
}
