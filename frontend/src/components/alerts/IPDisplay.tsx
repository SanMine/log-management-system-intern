import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from '@/components/ui/hover-card';

interface IPDisplayProps {
    alert: {
        ip?: string;
        involved_ips?: string[];
    };
}

export function IPDisplay({ alert }: IPDisplayProps) {
    // Case 1: Multiple IPs (Distributed Attack)
    if (alert.involved_ips && alert.involved_ips.length > 0) {
        const totalIPs = alert.involved_ips.length;
        const firstIP = alert.involved_ips[0];
        const remainingCount = totalIPs - 1;

        return (
            <HoverCard>
                <HoverCardTrigger asChild>
                    <div className="font-mono text-sm text-mono-600 cursor-pointer hover:text-mono-700 transition-colors">
                        {firstIP}
                        {remainingCount > 0 && (
                            <span className="ml-1 text-orange-600 font-semibold">
                                (+{remainingCount})
                            </span>
                        )}
                    </div>
                </HoverCardTrigger>
                <HoverCardContent className="w-auto min-w-[200px]">
                    <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-slate-900">
                            IPs Involved ({totalIPs})
                        </h4>
                        <div className="space-y-1">
                            {alert.involved_ips.map((ip, index) => (
                                <div
                                    key={index}
                                    className="font-mono text-xs text-slate-700 py-1 px-2 bg-slate-50 rounded border border-slate-200"
                                >
                                    {ip}
                                </div>
                            ))}
                        </div>
                    </div>
                </HoverCardContent>
            </HoverCard>
        );
    }

    // Case 2: Single IP
    if (alert.ip) {
        return (
            <div className="font-mono text-sm text-mono-600">
                {alert.ip}
            </div>
        );
    }

    // Case 3: No IP
    return (
        <div className="text-slate-400 text-sm">
            —
        </div>
    );
}
