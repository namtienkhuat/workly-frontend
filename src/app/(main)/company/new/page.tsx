'use client';

import { useEffect } from 'react';
import CreateCompanyCard from './_components/CreateCompanyCard';
import api from '@/utils/api';

const NewCompanyPage = () => {
    useEffect(() => {
        fetch('http://localhost:8000/api/v1/companies')
            .then((res) => {
                return res.json();
            })
            .then((data) => {
                console.log(data);
            });
    }, []);

    return (
        <div className="w-full max-w-md mx-auto py-8">
            <CreateCompanyCard />
        </div>
    );
};

export default NewCompanyPage;
