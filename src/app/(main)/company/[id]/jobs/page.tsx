
"use client";
import React, { useState } from "react";
import Select from "react-select";
import JobCard from "../../_components/JopCard";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface OptionType {
    value: string;
    label: string;
}

const skillOptions: OptionType[] = [
    { value: "javascript", label: "JavaScript" },
    { value: "react", label: "React" },
    { value: "typescript", label: "TypeScript" },
];

const industryOptions: OptionType[] = [
    { value: "it", label: "IT" },
    { value: "finance", label: "Finance" },
    { value: "education", label: "Education" },
];

const timeOptions: OptionType[] = [
    { value: "PartTime", label: "Part-time" },
    { value: "FullTime", label: "Full-time" },
];


const searchTypeOptions: OptionType[] = [
    { value: "title", label: "Job Title" },
    { value: "location", label: "Location" },
    { value: "keyword", label: "Keyword" },
];

const CompanyJobs = () => {
    const [searchText, setSearchText] = useState("");
    const [searchType, setSearchType] = useState<OptionType | null>(searchTypeOptions[0] ?? null);
    const [startTime, setStartTime] = useState<Date | null>(null);
    const [endTime, setEndTime] = useState<Date | null>(null);
    const [selectedSkills, setSelectedSkills] = useState<OptionType[]>([]);
    const [selectedIndustries, setSelectedIndustries] = useState<OptionType[]>([]);
    const [selectedTimesOption, setSelectedTimesOption] = useState<OptionType[]>([]);

    const fakeJobs = [
        {
            title: "Frontend Developer",
            company: "TechCorp",
            location: "Hanoi, Vietnam",
            type: "Full-time",
            salary: "$1200 - $1500",
            description:
                "We are looking for a skilled Frontend Developer to join our dynamic team. You will work with React, TailwindCSS and contribute to building responsive web applications.",
            postedAt: "2 days ago",
        },
        {
            title: "Backend Engineer",
            company: "InnovateX",
            location: "Ho Chi Minh City, Vietnam",
            type: "Full-time",
            salary: "$1500 - $2000",
            description:
                "Join our backend team to design and implement scalable APIs, work with Node.js, MongoDB, and ensure high performance of our applications.",
            postedAt: "5 days ago",
        },
        {
            title: "UI/UX Designer",
            company: "CreativeStudio",
            location: "Remote",
            type: "Part-time",
            salary: "$800 - $1000",
            description:
                "We are looking for a creative UI/UX designer to design user-friendly interfaces for web and mobile apps. Must have experience with Figma or Adobe XD.",
            postedAt: "1 week ago",
        },
    ];
    const handleSearch = () => {
        console.log({
            searchText,
            searchType: searchType?.value,
            skills: selectedSkills.map(s => s.value),
            industries: selectedIndustries.map(i => i.value),
        });
        // Gọi API tìm kiếm job ở đây
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
                    options={skillOptions}
                    value={selectedSkills}
                    onChange={(options) => setSelectedSkills(options as OptionType[])}
                    placeholder="Select Skills..."
                />
                <Select
                    isMulti
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
            <div className="flex items-center justify-between">
                <div className="flex">
                    <div className="mr-10">
                        <label className="mr-2">Start Time</label>
                        <DatePicker
                            selected={startTime}
                            onChange={(date) => setStartTime(date)}
                            showTimeSelect
                            dateFormat="yyyy-MM-dd HH:mm"
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
                            dateFormat="yyyy-MM-dd HH:mm"
                            placeholderText="Select end time"
                            className="border px-2 py-1 rounded w-full"
                        />
                    </div>
                </div>
                <button
                    className="px-4 py-2 bg-blue-600 text-white rounded"
                    onClick={handleSearch}
                >
                    Search
                </button>
            </div>
            <div className="mt-6">
                <div className="flex flex-col gap-6 p-4">
                    {fakeJobs.map((job, idx) => (
                        <JobCard key={idx} {...job} />
                    ))}
                </div>
            </div>
        </div>
    );
};


export default CompanyJobs;
