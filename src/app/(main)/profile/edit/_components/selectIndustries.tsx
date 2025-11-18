'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useGetAllIndustries } from '@/hooks/useQueryData';
import { Industry } from '@/types/global';

interface SelectIndustriesProps {
    value?: string[];
    onChange: (value: string[]) => void;
    industriesFromProfile?: Industry[];
}

const SelectIndustries = ({
    value: selectedIds = [],
    onChange,
    industriesFromProfile = [],
}: SelectIndustriesProps) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const { data: industriesData, isLoading } = useGetAllIndustries({ search });
    const allIndustriesFromSearch: Industry[] = industriesData?.data ?? [];

    const uniqueIndustries = new Map<string, Industry>();
    industriesFromProfile.forEach((industry: Industry) =>
        uniqueIndustries.set(industry.industryId, industry)
    );
    allIndustriesFromSearch.forEach((industry) =>
        uniqueIndustries.set(industry.industryId, industry)
    );
    const allIndustries = Array.from(uniqueIndustries.values());

    const selectedIndustries = allIndustries.filter((industry) =>
        selectedIds.includes(industry.industryId)
    );

    const handleSelect = (industryId: string) => {
        let newSelectedIds: string[];
        if (selectedIds.includes(industryId)) {
            newSelectedIds = selectedIds.filter((id) => id !== industryId);
        } else {
            newSelectedIds = [...selectedIds, industryId];
        }
        onChange(newSelectedIds);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full h-auto justify-start font-normal min-h-[36px] flex flex-wrap gap-1 py-1.5 px-3"
                >
                    {selectedIndustries.length > 0 ? (
                        selectedIndustries.map((industry) => (
                            <Badge
                                key={industry.industryId}
                                variant="secondary"
                                className="mr-1"
                                onClick={(e: any) => {
                                    e.stopPropagation();
                                    handleSelect(industry.industryId);
                                }}
                            >
                                {industry.name}
                                <X className="ml-1 h-3 w-3" />
                            </Badge>
                        ))
                    ) : (
                        <span className="text-muted-foreground">Select industries...</span>
                    )}
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>

            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search industries..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {isLoading ? 'Loading...' : 'No industry found.'}
                        </CommandEmpty>
                        <CommandGroup>
                            {allIndustries.map((industry) => (
                                <CommandItem
                                    key={industry.industryId}
                                    value={`${industry.industryId}-${industry.name}`}
                                    onSelect={() => handleSelect(industry.industryId)}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            selectedIds.includes(industry.industryId)
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        )}
                                    />
                                    {industry.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default SelectIndustries;
