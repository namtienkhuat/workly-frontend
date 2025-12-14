'use client';
import { useState, useMemo, useEffect } from 'react';
import ApplicationCard, { Application } from './_components/ApplicationCard';
import { useGetMyApplications } from '@/hooks/useQueryData';

export default function MyApplicationsPage() {
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'ACCEPTED' | 'REJECTED'>(
        'ALL'
    );
    const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
    const [applications, setApplications] = useState<Application[]>([]);
    const { data: applicationsData } = useGetMyApplications({});

    useEffect(() => {
        if (applicationsData) {
            setApplications(applicationsData.data);
        }
    }, [applicationsData]);

    const filteredAndSortedApplications = useMemo(() => {
        let filtered = applications;

        // Filter by status
        if (statusFilter !== 'ALL') {
            filtered = filtered.filter((app) => app.status === statusFilter);
        }

        // Sort by date
        const sorted = [...filtered].sort((a, b) => {
            const dateA = new Date(a.createdAt).getTime();
            const dateB = new Date(b.createdAt).getTime();
            return sortOrder === 'newest' ? dateB - dateA : dateA - dateB;
        });

        return sorted;
    }, [applications, statusFilter, sortOrder]);

    return (
        <div className="container mx-auto px-4 py-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Applications</h1>
                    <p className="text-gray-600">Track the status of your job applications</p>
                </div>

                {/* Filter and Sort Controls */}
                <div className="mb-6 bg-white rounded-lg border border-border/40 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        {/* Status Filter Tabs */}
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setStatusFilter('ALL')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    statusFilter === 'ALL'
                                        ? 'bg-primary text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                All{' '}
                                {applications && applications.length > 0 && (
                                    <span>({applications.length})</span>
                                )}
                            </button>
                            <button
                                onClick={() => setStatusFilter('PENDING')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    statusFilter === 'PENDING'
                                        ? 'bg-yellow-600 text-white'
                                        : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
                                }`}
                            >
                                Pending
                                {applications && applications.length > 0 && (
                                    <span>
                                        ({applications.filter((a) => a.status === 'PENDING').length}
                                        )
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setStatusFilter('ACCEPTED')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    statusFilter === 'ACCEPTED'
                                        ? 'bg-green-600 text-white'
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                }`}
                            >
                                Accepted
                                {applications && applications.length > 0 && (
                                    <span>
                                        (
                                        {applications.filter((a) => a.status === 'ACCEPTED').length}
                                        )
                                    </span>
                                )}
                            </button>
                            <button
                                onClick={() => setStatusFilter('REJECTED')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    statusFilter === 'REJECTED'
                                        ? 'bg-red-600 text-white'
                                        : 'bg-red-100 text-red-700 hover:bg-red-200'
                                }`}
                            >
                                Rejected
                                {applications && applications.length > 0 && (
                                    <span>
                                        (
                                        {applications.filter((a) => a.status === 'REJECTED').length}
                                        )
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* Sort Dropdown */}
                        <div className="flex items-center gap-2">
                            <label htmlFor="sort" className="text-sm font-medium text-gray-700">
                                Sort by:
                            </label>
                            <select
                                id="sort"
                                value={sortOrder}
                                onChange={(e) =>
                                    setSortOrder(e.target.value as 'newest' | 'oldest')
                                }
                                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            >
                                <option value="newest">Newest First</option>
                                <option value="oldest">Oldest First</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Applications List */}
                {filteredAndSortedApplications.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-gray-400 text-lg">
                            {applications && applications.length === 0
                                ? 'No applications found. Start applying to jobs!'
                                : `No ${statusFilter.toLowerCase()} applications found.`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredAndSortedApplications.map((application) => (
                            <ApplicationCard key={application._id} application={application} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
