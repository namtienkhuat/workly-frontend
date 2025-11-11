'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
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
import { useGetSchools } from '@/hooks/useQueryData';
import { School } from '@/types/global';

interface SelectSchoolProps {
    value?: string;
    onChange: (value: string) => void;
}

const SelectSchool = ({ value, onChange }: SelectSchoolProps) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const { data: schoolData, isLoading: isLoadingSchools } = useGetSchools({
        search: search,
    });
    const schoolList: School[] = schoolData?.data ?? [];

    const handleSelect = (schoolId: string) => {
        onChange(schoolId);
        setOpen(false);
        setSearch('');
    };

    const currentSchool = schoolList.find((s) => s.schoolId === value);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-9 font-normal"
                >
                    {currentSchool ? currentSchool.name : 'Choose school'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search school..."
                        value={search}
                        onValueChange={(value: any) => setSearch(value)}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {isLoadingSchools ? 'Loading...' : 'No school found.'}
                        </CommandEmpty>
                        <CommandGroup>
                            {schoolList.map((school) => (
                                <CommandItem
                                    key={school.schoolId}
                                    value={`${school.schoolId}-${school.name}`}
                                    onSelect={() => handleSelect(school.schoolId)}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            value === school.schoolId ? 'opacity-100' : 'opacity-0'
                                        )}
                                    />
                                    {school.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default SelectSchool;
