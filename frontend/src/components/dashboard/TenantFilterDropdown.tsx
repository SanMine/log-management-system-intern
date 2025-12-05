import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';

interface TenantFilterDropdownProps {
    value: string;
    onChange: (tenant: string) => void;
    options: { label: string; value: string }[];
}

export function TenantFilterDropdown({ value, onChange, options }: TenantFilterDropdownProps) {
    const { user } = useAuth();

    // For viewers, automatically set to their tenant and disable changing
    useEffect(() => {
        if (user?.role === 'VIEWER' && user?.tenantId !== null) {
            const viewerTenant = options.find(opt => opt.value === String(user.tenantId));
            if (viewerTenant && value !== viewerTenant.value) {
                onChange(viewerTenant.value);
            }
        }
    }, [user, options, onChange, value]);

    // Filter options based on role
    const filteredOptions = user?.role === 'VIEWER' && user?.tenantId !== null
        ? options.filter(opt => opt.value === String(user.tenantId))
        : options;

    const isViewerLocked = user?.role === 'VIEWER';

    return (
        <div className="flex-1 min-w-[200px]">
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                Tenant {isViewerLocked && <span className="text-xs font-normal">(Your Organization)</span>}
            </label>
            <Select value={value} onValueChange={onChange} disabled={isViewerLocked}>
                <SelectTrigger className={`w-full border-slate-200 focus:ring-brand-500 focus:border-brand-500 transition-colors ${isViewerLocked ? 'bg-slate-100 cursor-not-allowed' : 'bg-slate-50/50 hover:bg-white'}`}>
                    <SelectValue placeholder="Select tenant" />
                </SelectTrigger>
                <SelectContent>
                    {filteredOptions.map((option) => (
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
