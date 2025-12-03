import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface TenantFilterDropdownProps {
    value: string;
    onChange: (tenant: string) => void;
    options: { label: string; value: string }[];
}

export function TenantFilterDropdown({ value, onChange, options }: TenantFilterDropdownProps) {
    return (
        <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Tenant
            </label>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="w-full border-slate-200 focus:ring-brand-500 focus:border-brand-500 bg-slate-50/50 hover:bg-white transition-colors">
                    <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
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
    );
}
