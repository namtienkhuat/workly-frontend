'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge'; // <-- Dùng Badge để hiển thị
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
import { useGetSkills } from '@/hooks/useQueryData';
import { Skill } from '@/types/global';

interface SelectSkillsProps {
    value?: string[];
    onChange: (value: string[]) => void;
}

const SelectSkills = ({ value: selectedIds = [], onChange }: SelectSkillsProps) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');

    const { data: skillsData, isLoading } = useGetSkills({ search });
    // const allSkills: Skill[] = skillsData?.data ?? [];
    const allSkills: Skill[] = [
        { skillId: 'skill_01', name: 'JavaScript' },
        { skillId: 'skill_02', name: 'TypeScript' },
        { skillId: 'skill_03', name: 'React' },
        { skillId: 'skill_04', name: 'Node.js' },
        { skillId: 'skill_05', name: 'Express' },
        { skillId: 'skill_06', name: 'HTML/CSS' },
        { skillId: 'skill_07', name: 'GraphQL' },
        { skillId: 'skill_08', name: 'SQL' },
        { skillId: 'skill_09', name: 'PostgreSQL' },
        { skillId: 'skill_10', name: 'MongoDB' },
        { skillId: 'skill_11', name: 'Docker' },
        { skillId: 'skill_12', name: 'Kubernetes' },
        { skillId: 'skill_13', name: 'AWS' },
        { skillId: 'skill_14', name: 'CI/CD' },
        { skillId: 'skill_15', name: 'Unit Testing' },
        { skillId: 'skill_16', name: 'E2E Testing' },
        { skillId: 'skill_17', name: 'Microservices' },
        { skillId: 'skill_18', name: 'Design Patterns' },
        { skillId: 'skill_19', name: 'Algorithms' },
        { skillId: 'skill_20', name: 'System Design' },
    ];

    const selectedSkills = allSkills.filter((skill) => selectedIds.includes(skill.skillId));

    const handleSelect = (skillId: string) => {
        let newSelectedIds: string[];
        if (selectedIds.includes(skillId)) {
            newSelectedIds = selectedIds.filter((id) => id !== skillId);
        } else {
            newSelectedIds = [...selectedIds, skillId];
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
                    {selectedSkills.length > 0 ? (
                        selectedSkills.map((skill) => (
                            <Badge
                                key={skill.skillId}
                                variant="secondary"
                                className="mr-1"
                                onClick={(e: any) => {
                                    e.stopPropagation();
                                    handleSelect(skill.skillId);
                                }}
                            >
                                {skill.name}
                                <X className="ml-1 h-3 w-3" />
                            </Badge>
                        ))
                    ) : (
                        <span className="text-muted-foreground">Select skills...</span>
                    )}
                    <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command shouldFilter={false}>
                    <CommandInput
                        placeholder="Search skills..."
                        value={search}
                        onValueChange={setSearch}
                    />
                    <CommandList>
                        <CommandEmpty>{isLoading ? 'Loading...' : 'No skill found.'}</CommandEmpty>
                        <CommandGroup>
                            {allSkills.map((skill) => (
                                <CommandItem
                                    key={skill.skillId}
                                    value={`${skill.skillId}-${skill.name}`}
                                    onSelect={() => handleSelect(skill.skillId)}
                                >
                                    <Check
                                        className={cn(
                                            'mr-2 h-4 w-4',
                                            selectedIds.includes(skill.skillId)
                                                ? 'opacity-100'
                                                : 'opacity-0'
                                        )}
                                    />
                                    {skill.name}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};

export default SelectSkills;
