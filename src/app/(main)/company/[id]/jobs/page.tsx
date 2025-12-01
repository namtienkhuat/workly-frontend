"use client";
import React, { useState, useEffect } from "react";
import Select from "react-select";
import JobCard from "../../_components/JopCard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import InfiniteScroll from "react-infinite-scroll-component";
import { Job } from "@/models/jobModel";
import JobService from "@/services/job/jobService";
import { useParams } from "next/navigation";
import { useGetAllIndustries, useGetAllSkills } from "@/hooks/useQueryData";
import ProfileService from "@/services/profile/profileService";

interface OptionType {
    value: string;
    label: string;
}

const timeOptions: OptionType[] = [
    { value: "partime", label: "Part-time" },
    { value: "fulltime", label: "Full-time" },
];

const searchTypeOptions: OptionType[] = [
    { value: "title", label: "Job Title" },
    { value: "location", label: "Location" },
];

const CompanyJobs = () => {
    const [searchText, setSearchText] = useState("");
    const [searchType, setSearchType] = useState<OptionType | null>(searchTypeOptions[0] ?? null);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [canUploadCompany, setCanUploadCompany] = useState(false);
    const [skillOptions, setSkillOptions] = useState<OptionType[]>([])
    const [industryOptions, setIndustryOptions] = useState<OptionType[]>([])
    const [selectedSkills, setSelectedSkills] = useState<OptionType[]>([]);
    const [selectedIndustries, setSelectedIndustries] = useState<OptionType[]>([]);
    const [selectedTimesOption, setSelectedTimesOption] = useState<OptionType[]>([]);
    const params = useParams();

    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [pageSize] = useState(10);
    const [searchParams, setSearchParams] = useState<any>({});
    const { data: industriesData } = useGetAllIndustries();
    const { data: skillData } = useGetAllSkills();

    useEffect(() => {
        const checkAccess = async () => {
            try {
                const canAccess = await ProfileService.checkAccessCompany(params.id as string);
                setCanUploadCompany(canAccess);
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
        if (skillData && skillData.data && Array.isArray(skillData.data)) {
            setSkillOptions(skillData.data.map((s: any) => {
                return {
                    value: s.skillId.toLowerCase(),
                    label: s.name
                }
            }));
        }
        if (industriesData && industriesData.data && Array.isArray(industriesData.data)) {
            setIndustryOptions(industriesData.data.map((i: any) => {
                return {
                    value: i.industryId.toLowerCase(),
                    label: i.name
                }
            }));
        }
    }, [industriesData, skillData]);

    useEffect(() => {
        fetchInitialJobs();
    }, []);

    const buildSearchParams = () => {
        return {
            companyId: params.id,
            search: searchText || "",
            searchType: searchType?.value || "",
            skills: selectedSkills.map(s => s.value).join(","),
            industries: selectedIndustries.map(i => i.value).join(","),
            jobType: selectedTimesOption.map(t => t.value).join(","),
            startAt: startTime ? startTime.toISOString() : "",
            endAt: endTime ? endTime.toISOString() : "",
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

                // Fix: Dùng pagination.totalPages
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

    const handleSearch = () => {
        setCurrentPage(1);
        setHasMore(true);
        fetchInitialJobs();
    };

    const handleReset = () => {
        setSearchText("");
        setSearchType(searchTypeOptions[0] ?? null);
        setStartTime(null);
        setEndTime(null);
        setSelectedSkills([]);
        setSelectedIndustries([]);
        setSelectedTimesOption([]);
        setCurrentPage(1);
        setHasMore(true);
        fetchInitialJobs();
    };

    return (
        <div className="p-4 max-w-4xl mx-auto space-y-6">
            {/* Input text + search type */}
            <div className="flex gap-2">
                <input
                    type="text"
                    className="flex-1 border rounded px-3 py-2"
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

            {/* Multi-select filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select
                    isMulti
                    isSearchable={true}
                    options={skillOptions}
                    value={selectedSkills}
                    onChange={(options) => setSelectedSkills(options as OptionType[])}
                    placeholder="Select Skills..."
                />
                <Select
                    isMulti
                    isSearchable={true}
                    options={industryOptions}
                    value={selectedIndustries}
                    onChange={(options) => setSelectedIndustries(options as OptionType[])}
                    placeholder="Select Industries..."
                />
                <Select
                    isMulti
                    options={timeOptions}
                    value={selectedTimesOption}
                    onChange={(options) => setSelectedTimesOption(options as OptionType[])}
                    placeholder="Select Job type..."
                />
            </div>

            {/* Date filters and buttons */}
            <div className="flex items-center justify-between">
                <div className="flex">
                    <div className="mr-10">
                        <label className="mr-2">Start Time</label>
                        <DatePicker
                            selected={startTime}
                            onChange={(date) => setStartTime(date)}
                            showTimeSelect
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select start time"
                            className="border px-2 py-1 rounded w-full"
                        />
                    </div>

                    <div>
                        <label className="mr-2">End Time</label>
                        <DatePicker
                            selected={endTime}
                            onChange={(date) => setEndTime(date)}
                            showTimeSelect
                            dateFormat="yyyy-MM-dd"
                            placeholderText="Select end time"
                            className="border px-2 py-1 rounded w-full"
                        />
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        onClick={handleReset}
                    >
                        Reset
                    </button>
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? "Searching..." : "Search"}
                    </button>
                </div>
            </div>

            {/* Results with Infinite Scroll */}
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
                        <div className="flex flex-col gap-6 p-4">
                            {jobs.map((job, idx) => (
                                <JobCard
                                    key={idx}
                                    {...job}
                                    onReload={fetchInitialJobs}
                                    canUploadCompany={canUploadCompany}
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