'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useGetAllSchools } from '@/hooks/useQueryData';
import { School } from '@/types/global';

interface SelectSchoolProps {
    value?: string;
    onChange: (value: string) => void;
}

const SelectSchool = ({ value, onChange }: SelectSchoolProps) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [customSchools, setCustomSchools] = useState<School[]>([]);

    const { data: schoolData, isLoading: isLoadingSchools } = useGetAllSchools(
        {
            search: search,
        },
        open
    );
    const allSchoolsFromSearch: School[] = schoolData?.data ?? [];

    const uniqueSchools = new Map<string, School>();
    allSchoolsFromSearch.forEach((school) => uniqueSchools.set(school.schoolId, school));
    customSchools.forEach((school) => uniqueSchools.set(school.schoolId, school));
    const schoolList = Array.from(uniqueSchools.values());

    const handleSelect = (schoolId: string) => {
        onChange(schoolId);
        setOpen(false);
        setSearch('');
    };

    const handleAddNewSchool = () => {
        if (!search.trim()) return;

        const trimmedSearch = search.trim();
        const newSchoolId = trimmedSearch.toLowerCase().replace(/ /g, '_');

        const existingSchool = schoolList.find(
            (school) =>
                school.schoolId === newSchoolId ||
                school.name.toLowerCase() === trimmedSearch.toLowerCase()
        );

        if (existingSchool) {
            onChange(existingSchool.schoolId);
        } else {
            const newSchool: School = {
                schoolId: newSchoolId,
                name: trimmedSearch,
            };

            setCustomSchools((prev) => [...prev, newSchool]);
            onChange(newSchool.schoolId);
        }

        setSearch('');
        setOpen(false);
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
                            {search.trim() && (
                                <CommandItem
                                    value={`add-new-${search}`}
                                    onSelect={handleAddNewSchool}
                                    className="text-primary font-medium"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add &quot;{search}&quot;
                                </CommandItem>
                            )}

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
