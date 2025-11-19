'use client';

import { useState, useRef, useEffect } from 'react';
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
import { useGetIndustry } from '@/hooks/useQueryData';
import { Industry } from '@/types/global';

interface SelectIndustryProps {
    defaultValue?: string;
    value?: string;
    onChange: (value: string) => void;
}

const SelectIndustry = ({ defaultValue, value, onChange }: SelectIndustryProps) => {
    const [open, setOpen] = useState(false);
    const [searchIndustry, setSearchIndustry] = useState('');
    const [inputValue, setInputValue] = useState('');
    const searchTimeoutRef = useRef<NodeJS.Timeout>();

    const currentValue = value ?? defaultValue;

    const { data: industryData, isLoading: isLoadingIndustry } = useGetIndustry({
        search: searchIndustry,
    });
    const industryList: Industry[] = industryData?.data ?? [];

    // Debounce searchIndustry updates based on inputValue changes
    useEffect(() => {
        if (searchTimeoutRef.current) {
            clearTimeout(searchTimeoutRef.current);
        }

        searchTimeoutRef.current = setTimeout(() => {
            setSearchIndustry(inputValue);
        }, 500);

        return () => {
            if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
            }
        };
    }, [inputValue]);

    const handleSearchIndustry = (newValue: string) => {
        setInputValue(newValue);
    };

    const handleSelect = (industryId: string) => {
        onChange(industryId);
        setOpen(false);
        setSearchIndustry('');
        setInputValue('');
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between h-9 font-normal"
                >
                    {currentValue
                        ? industryList.find((industry) => industry.industryId === currentValue)
                              ?.name || 'Choose industry'
                        : 'Choose industry'}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search industry..."
                        value={inputValue}
                        onValueChange={handleSearchIndustry}
                    />
                    <CommandList>
                        <CommandEmpty>
                            {isLoadingIndustry ? 'Loading...' : 'No industry found.'}
                        </CommandEmpty>
                        <CommandGroup>
                            {industryList.map((industry) => (
                                <CommandItem
                                    key={industry.industryId}
                                    value={`${industry.industryId}-${industry.name}`}
                                    onSelect={() => handleSelect(industry.industryId)}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            currentValue === industry.industryId
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

export default SelectIndustry;
