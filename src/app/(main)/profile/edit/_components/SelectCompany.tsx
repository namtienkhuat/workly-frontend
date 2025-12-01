'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { CompanyProfile } from '@/types/global';
import api from '@/utils/api';
import { useQuery } from '@tanstack/react-query';

interface SelectCompanyProps {
    value?: string;
    onChange: (value: string) => void;
}

const SelectCompany = ({ value, onChange }: SelectCompanyProps) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const { data: companyData, isLoading: isLoadingCompanies } = useQuery({
        queryKey: ['companies', search],
        queryFn: async () => {
            const response = await api.get('/companies', {
                params: { search, limit: 20 },
            });
            return response.data;
        },
    });

    const companyList: CompanyProfile[] = companyData?.data ?? [];

    // Add "Other" option
    const allCompanies = [
        { companyId: 'UNLISTED', name: 'Other (Company not listed)' } as CompanyProfile,
        ...companyList,
    ];

    const handleSelect = (companyId: string) => {
        onChange(companyId);
        setOpen(false);
        setSearch('');
    };

    const currentCompany = allCompanies.find((c) => c.companyId === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-9 font-normal"
                >
                    {currentCompany ? currentCompany.name : 'Choose company'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search company..."
                        value={search}
                        onValueChange={(value: any) => setSearch(value)}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {isLoadingCompanies ? 'Loading...' : 'No company found.'}
                        </CommandEmpty>
                        <CommandGroup>
                            {allCompanies.map((company) => (
                                <CommandItem
                                    key={company.companyId}
                                    value={`${company.companyId}-${company.name}`}
                                    onSelect={() => handleSelect(company.companyId)}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value === company.companyId ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    {company.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default SelectCompany;

