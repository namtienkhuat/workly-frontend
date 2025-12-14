'use client';

import { useEffect, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { getLocations } from '@/services/apiServices';
import { Location } from '@/types/global';
import { MapPinIcon } from 'lucide-react';

interface SelectLocationProps {
    value?: string;
    onChange: (value: string) => void;
    placeholder?: string;
    showHelperText?: boolean;
    className?: string;
}

const SelectLocation = ({
    value,
    onChange,
    placeholder = 'Select your location',
    showHelperText = true,
    className,
}: SelectLocationProps) => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoadingLocations, setIsLoadingLocations] = useState(false);

    useEffect(() => {
        const fetchLocations = async () => {
            setIsLoadingLocations(true);
            const result = await getLocations();
            if (result.success && result.data) {
                setLocations(result.data);
            }
            setIsLoadingLocations(false);
        };
        fetchLocations();
    }, []);

    const selectedLocation = locations.find((loc) => loc.locationId === value);

    return (
        <div className={className}>
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger className="h-10">
                    <SelectValue placeholder={placeholder}>
                        {selectedLocation ? selectedLocation.name : placeholder}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {isLoadingLocations ? (
                        <SelectItem value="loading" disabled>
                            Loading...
                        </SelectItem>
                    ) : locations.length > 0 ? (
                        locations.map((location) => (
                            <SelectItem key={location.locationId} value={location.locationId}>
                                <div className="flex items-center gap-2">
                                    <MapPinIcon className="h-3.5 w-3.5 text-muted-foreground" />
                                    {location.name}
                                </div>
                            </SelectItem>
                        ))
                    ) : (
                        <SelectItem value="no-locations" disabled>
                            No locations available
                        </SelectItem>
                    )}
                </SelectContent>
            </Select>
            {showHelperText && (
                <p className="text-xs text-muted-foreground mt-1.5">
                    {isLoadingLocations && 'Loading locations...'}
                </p>
            )}
        </div>
    );
};

export default SelectLocation;
