'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, Plus, X } from 'lucide-react';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '@/components/ui/command';
import { cn } from '@/lib/utils';
import { useGetAllSkills } from '@/hooks/useQueryData';
import { Skill } from '@/types/global';

interface SelectSkillsProps {
    value?: string[];
    onChange: (value: string[]) => void;
    skillsFromProfile?: Skill[];
}

const SelectSkills = ({
    value: selectedIds = [],
    onChange,
    skillsFromProfile = [],
}: SelectSkillsProps) => {
    const [open, setOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [customSkills, setCustomSkills] = useState<Skill[]>([]);

    const { data: skillsData, isLoading } = useGetAllSkills({ search, page: 1, limit: 100 }, open);
    const allSkillsFromSearch: Skill[] = skillsData?.data ?? [];

    const uniqueSkills = new Map<string, Skill>();
    skillsFromProfile.forEach((skill: Skill) => uniqueSkills.set(skill.skillId, skill));
    allSkillsFromSearch.forEach((skill) => uniqueSkills.set(skill.skillId, skill));
    customSkills.forEach((skill) => uniqueSkills.set(skill.skillId, skill));
    const allSkills = Array.from(uniqueSkills.values());

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

    const handleAddNewSkill = () => {
        if (!search.trim()) return;

        const trimmedSearch = search.trim();
        const newSkillId = trimmedSearch.toLowerCase().replace(/ /g, '_');

        const existingSkill = allSkills.find(
            (skill) =>
                skill.skillId === newSkillId ||
                skill.name.toLowerCase() === trimmedSearch.toLowerCase()
        );

        if (existingSkill) {
            if (!selectedIds.includes(existingSkill.skillId)) {
                onChange([...selectedIds, existingSkill.skillId]);
            }
        } else {
            // Check if already selected (edge case)
            if (selectedIds.includes(newSkillId)) {
                setSearch('');
                return;
            }

            const newSkill: Skill = {
                skillId: newSkillId,
                name: trimmedSearch,
            };

            setCustomSkills((prev) => [...prev, newSkill]);
            onChange([...selectedIds, newSkill.skillId]);
        }

        setSearch('');
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
                            {search.trim() && (
                                <CommandItem
                                    value={`add-new-${search}`}
                                    onSelect={handleAddNewSkill}
                                    className="text-primary font-medium"
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add &quot;{search}&quot;
                                </CommandItem>
                            )}

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
