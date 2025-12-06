'use client';

import searchService from '@/services/search/searchService';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function SearchPage() {
    const searchParams = useSearchParams();
    const query = searchParams.get('keyword');

    useEffect(() => {
        const fetchData = async () => {

            await searchService.getGlobalSearch({ keyword: query });
        };
        fetchData();
    }, [query]);
    return (
        <div>
            <h1>Search Page</h1>
            {query ? (
                <p>Searching for: <strong>{query}</strong></p>
            ) : (
                <p>No query provided</p>
            )}
        </div>
    );
}
