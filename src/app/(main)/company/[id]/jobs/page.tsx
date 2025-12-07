"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import "react-datepicker/dist/react-datepicker.css";
import InfiniteScroll from "react-infinite-scroll-component";
import { Job } from "@/models/jobModel";
import JobService from "@/services/job/jobService";
import { useParams } from "next/navigation";
import { useGetCompanyProfile } from "@/hooks/useQueryData";
import ProfileService from "@/services/profile/profileService";
import JobCard from "@/components/jobs/JobCard";
import SelectSkills from "@/app/(main)/profile/edit/_components/SelectSkills";
import SelectIndustries from "@/app/(main)/profile/edit/_components/selectIndustries";
import {
    Select as SelectSingle,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

interface OptionType {
    value: string;
    label: string;
}

const searchTypeOptions: OptionType[] = [
    { value: "title", label: "Job Title" },
    { value: "location", label: "Location" },
];

const CompanyJobs = () => {
    const [searchText, setSearchText] = useState("");
    const [searchType, setSearchType] = useState<OptionType | null>(searchTypeOptions[0] ?? null);
    const [canUploadCompany, setCanUploadCompany] = useState(false);
    const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);
    const [selectedTimesOption, setSelectedTimesOption] = useState<string>('');
    const params = useParams();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [pageSize] = useState(10);
    const [searchParams, setSearchParams] = useState<any>({});
    const [shouldFetch, setShouldFetch] = useState(false);


    // get profile for UI display
    const [companyProfile, setCompanyProfile] = useState();
    const { data: companyData } = useGetCompanyProfile(params.id as string);

    useEffect(() => {
        if (companyData?.data?.company) {
            setCompanyProfile(companyData?.data?.company);
        }
    }, [companyData]);

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const canAccess = await ProfileService.checkAccessCompany(params.id as string);
                setCanUploadCompany(canAccess?.data?.isAccess || false);
            } catch (error) {
                console.error('Check access error:', error);
                setCanUploadCompany(false);
            }
        };

        if (params.id) {
            checkAccess();
        }
    }, [params.id]);

    useEffect(() => {
        fetchInitialJobs();
    }, []);

    const buildSearchParams = () => {
        return {
            companyId: params.id,
            search: searchText || "",
            searchType: searchType?.value || "",
            skills: selectedSkills,
            industries: selectedIndustries,
            jobType: selectedTimesOption,
        };
    };

    const fetchInitialJobs = async () => {
        try {
            setLoading(true);
            const requestParams = {
                page: 1,
                pageSize: pageSize,
                ...buildSearchParams(),
            };

            const response = await JobService.getCompanyJobPaging(requestParams);

            if (response && response.data) {
                setJobs(response.data || []);
                setCurrentPage(1);

                const totalPages = response.pagination?.totalPages || 0;
                setHasMore(totalPages > 1);
                setSearchParams(buildSearchParams());
            }
        } catch (error) {
            console.error("Error fetching jobs:", error);
            setJobs([]);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    };

    const fetchMoreJobs = async () => {
        if (loading) return;

        console.log('Fetching more jobs...'); // Debug log

        try {
            const nextPage = currentPage + 1;
            const requestParams = {
                page: nextPage,
                pageSize: pageSize,
                ...searchParams,
            };

            const response = await JobService.getCompanyJobPaging(requestParams);

            if (response && response.data) {
                setJobs(prevJobs => [...prevJobs, ...response.data]);
                setCurrentPage(nextPage);

                const totalPages = response.pagination?.totalPages || 0;
                setHasMore(nextPage < totalPages);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Error fetching more jobs:", error);
            setHasMore(false);
        }
    };
    useEffect(() => {
        if (!shouldFetch) return;

        fetchInitialJobs();
        setShouldFetch(false);
    }, [
        searchText,
        searchType,
        selectedSkills,
        selectedIndustries,
        selectedTimesOption,
        currentPage,
        hasMore,
        shouldFetch
    ]);
    const handleSearch = () => {
        setCurrentPage(1);
        setHasMore(true);
        setShouldFetch(true);
    };

    const handleReset = () => {
        setSearchText("");
        setSearchType(searchTypeOptions[0] ?? null);
        setSelectedSkills([]);
        setSelectedIndustries([]);
        setSelectedTimesOption('');
        setCurrentPage(1);
        setHasMore(true);
        setShouldFetch(true);
    };

    return (
        <div className="py-4 mx-auto space-y-6">
            <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 border rounded px-3 py-1.5"
                    placeholder="Enter search..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyUp={(e) => e.key === "Enter" && handleSearch()}
                />
                <Select
                    options={searchTypeOptions}
                    value={searchType}
                    onChange={(option) => setSearchType(option)}
                    className="w-48"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
                <SelectSkills
                    value={selectedSkills}
                    onChange={setSelectedSkills}
                />
                <SelectIndustries
                    value={selectedIndustries}
                    onChange={setSelectedIndustries}
                />
                <SelectSingle value={selectedTimesOption} onValueChange={setSelectedTimesOption}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select employment type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                    </SelectContent>
                </SelectSingle>

                <div className="flex gap-3 ml-6">
                    <button
                        className="px-6 py-1.5 bg-gray-500 text-white rounded hover:bg-gray-600"
                        onClick={handleReset}
                    >
                        Reset
                    </button>
                    <button
                        className="px-6 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </div>
            </div>
            <div className="mt-6">
                {loading && jobs.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600">Loading jobs...</p>
                    </div>
                ) : jobs.length > 0 ? (
                    <InfiniteScroll
                        dataLength={jobs.length}
                        next={fetchMoreJobs}
                        hasMore={hasMore}
                        loader={
                            <div className="text-center py-4">
                                <p className="text-gray-600">Loading more jobs...</p>
                            </div>
                        }
                        endMessage={
                            <div className="text-center py-4">
                                <p className="text-gray-500">No more jobs to load</p>
                            </div>
                        }
                        scrollThreshold={0.9}
                    >
                        <div className="flex flex-col gap-6">
                            {jobs.map((job) => (
                                <JobCard
                                    key={job._id}
                                    job={job}
                                    isCompanyPage={true}
                                    canEdit={canUploadCompany}
                                    onReload={fetchInitialJobs}
                                    companyProfile={companyProfile}
                                />
                            ))}
                        </div>
                    </InfiniteScroll>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-gray-600">No jobs found. Try adjusting your search filters.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CompanyJobs;