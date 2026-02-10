/** @format */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronDown,
  Users,
  MapPin,
  Clock,
  DollarSign,
  Eye,
} from "lucide-react";
import { Tooltip } from "antd";
import dayjs from "dayjs";

import Notification from "@/components/Notification";
import { StyledSelect } from "@/components/StyledSelect";
import { useDebounce } from "@/hooks/useDebounce";

import { useCareers, useDeleteCareer } from "./hook";

const JOB_TYPES = [
  { value: "All", label: "All Types" },
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "FREELANCE", label: "Freelance" },
];

const EXPERIENCE_LEVELS = [
  { value: "All", label: "All Levels" },
  { value: "ENTRY", label: "Entry Level" },
  { value: "MID", label: "Mid Level" },
  { value: "SENIOR", label: "Senior Level" },
  { value: "LEAD", label: "Lead" },
  { value: "EXECUTIVE", label: "Executive" },
];

const STATUS_OPTIONS = [
  { value: "All", label: "All Status" },
  { value: "DRAFT", label: "Draft" },
  { value: "PUBLISHED", label: "Published" },
  { value: "CLOSED", label: "Closed" },
  { value: "ARCHIVED", label: "Archived" },
];

const SORT_OPTIONS = [
  { value: "desc", label: "Newest First" },
  { value: "asc", label: "Oldest First" },
];

export default function CareerPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJobType, setSelectedJobType] = useState("All");
  const [selectedExperience, setSelectedExperience] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selected, setSelected] = useState(null);
  const [filterForm, setFilterForm] = useState({
    jobType: selectedJobType,
    experience: selectedExperience,
    status: selectedStatus,
    sort: sortOrder,
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useCareers({
    job_type: selectedJobType !== "All" ? selectedJobType : undefined,
    experience_level: selectedExperience !== "All" ? selectedExperience : undefined,
    status: selectedStatus !== "All" ? selectedStatus : undefined,
    search: debouncedSearchTerm || undefined,
    sort_order: sortOrder,
  });

  const { mutate: deleteCareer, isPending } = useDeleteCareer();

  const careers = useMemo(() => {
    return data?.pages?.flatMap((page: any) => page.data) || [];
  }, [data]);

  const pagination = useMemo(() => {
    return data?.pages?.[data.pages.length - 1]?.pagination || {};
  }, [data]);

  const handleLoadMore = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

  function CareerCard({ career }: any) {
    return (
      <div
        key={career._id}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <Tooltip placement="top" title={career?.title || "-"}>
              <h3 className="text-lg font-semibold text-gray-900 truncate max-w-[60%]">
                {career.title}
              </h3>
            </Tooltip>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                career.status === "PUBLISHED"
                  ? "bg-green-950 text-green-400"
                  : career.status === "DRAFT"
                  ? "bg-yellow-950 text-yellow-400"
                  : career.status === "CLOSED"
                  ? "bg-gray-100 text-gray-600"
                  : "bg-gray-200 text-gray-600"
              }`}
            >
              {career.status?.toLowerCase()}
            </span>
          </div>

          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{career.location}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{career.job_type?.replace("_", " ")}</span>
              <span>•</span>
              <span>{career.experience_level}</span>
            </div>
            {career.salary_min && career.salary_max && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                <span>
                  {career.salary_currency} {career.salary_min.toLocaleString()} -{" "}
                  {career.salary_max.toLocaleString()}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between pt-2 border-t border-gray-200">
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>{career.vacancies || 1} Vacanc{career.vacancies > 1 ? 'ies' : 'y'}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => router.push(`/career/editor?id=${career._id}`)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => router.push(`/career/applicants/${career._id}`)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Users className="w-4 h-4" />
              View Applicants
            </button>
            <button
              onClick={() => {
                setSelected(career._id);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Careers</h1>
          <p className="text-gray-600 mt-1">Manage job postings and applications</p>
        </div>
        <button
          onClick={() => router.push("/career/editor")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Job Posting
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Search job postings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-100 text-gray-900 placeholder:text-gray-600"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors w-full md:w-auto"
            >
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="text-sm font-medium">Filter</span>
              <ChevronDown
                className={`w-4 h-4 text-gray-600 transition-transform ${
                  showFilterDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-300 p-6 z-10 space-y-6 max-h-[80vh] overflow-y-auto">
                <StyledSelect
                  value={filterForm.jobType}
                  onChange={(val) => {
                    setFilterForm((prev) => ({ ...prev, jobType: val }));
                    setSelectedJobType(val);
                  }}
                  options={JOB_TYPES}
                  label="Job Type"
                />

                <StyledSelect
                  value={filterForm.experience}
                  onChange={(val) => {
                    setFilterForm((prev) => ({ ...prev, experience: val }));
                    setSelectedExperience(val);
                  }}
                  options={EXPERIENCE_LEVELS}
                  label="Experience Level"
                />

                <StyledSelect
                  value={filterForm.status}
                  onChange={(val) => {
                    setFilterForm((prev) => ({ ...prev, status: val }));
                    setSelectedStatus(val);
                  }}
                  options={STATUS_OPTIONS}
                  label="Status"
                />

                <StyledSelect
                  value={filterForm.sort}
                  onChange={(val) => {
                    setFilterForm((prev) => ({ ...prev, sort: val }));
                    setSortOrder(val);
                  }}
                  options={SORT_OPTIONS}
                  label="Sort By"
                />

                {/* Reset Button */}
                <button
                  onClick={() => {
                    setSelectedJobType("All");
                    setSelectedExperience("All");
                    setSelectedStatus("All");
                    setSortOrder("desc");
                    setSearchTerm("");
                    setFilterForm({
                      jobType: "All",
                      experience: "All",
                      status: "All",
                      sort: "desc",
                    });
                    setShowFilterDropdown(false);
                  }}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedJobType !== "All" ||
          selectedExperience !== "All" ||
          selectedStatus !== "All" ||
          debouncedSearchTerm) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedJobType !== "All" && (
              <span className="px-3 py-1 text-xs font-medium bg-primary-950 text-primary-400 rounded-full flex items-center gap-1">
                {selectedJobType}
                <button
                  onClick={() => setSelectedJobType("All")}
                  className="ml-1 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {selectedExperience !== "All" && (
              <span className="px-3 py-1 text-xs font-medium bg-primary-950 text-primary-400 rounded-full flex items-center gap-1">
                {selectedExperience}
                <button
                  onClick={() => setSelectedExperience("All")}
                  className="ml-1 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {selectedStatus !== "All" && (
              <span className="px-3 py-1 text-xs font-medium bg-primary-950 text-primary-400 rounded-full flex items-center gap-1">
                {selectedStatus}
                <button
                  onClick={() => setSelectedStatus("All")}
                  className="ml-1 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
            {debouncedSearchTerm && (
              <span className="px-3 py-1 text-xs font-medium bg-primary-950 text-primary-400 rounded-full flex items-center gap-1">
                Search: "{debouncedSearchTerm}"
                <button
                  onClick={() => setSearchTerm("")}
                  className="ml-1 hover:text-blue-900"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading job postings...</p>
        </div>
      ) : careers && careers.length > 0 ? (
        <>
          {/* Careers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {careers.map((career: any) => (
              <CareerCard key={career._id} career={career} />
            ))}
          </div>

          {/* Pagination Info & Load More Button */}
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Showing {careers.length} of{" "}
              {pagination.total_careers || careers.length} job postings
              {pagination.total_pages > 1 &&
                ` • Page ${pagination.current_page || 1} of ${
                  pagination.total_pages
                }`}
            </p>

            {hasNextPage && (
              <button
                onClick={handleLoadMore}
                disabled={isFetchingNextPage}
                className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
              >
                {isFetchingNextPage ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Loading...
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-5 h-5" />
                    Load More
                  </>
                )}
              </button>
            )}
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 flex flex-col items-center">
          <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No job postings found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedJobType !== "All" || selectedExperience !== "All" || selectedStatus !== "All"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first job posting"}
          </p>
          <button
            onClick={() => router.push("/career/editor")}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Job Posting
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {selected ? (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Delete Job Posting
            </h2>
            <p>Are you sure you want to delete this job posting?</p>
            <div className="flex gap-5 mt-8 justify-center">
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                }}
                className="flex items-center justify-center gap-2 px-10 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                disabled={isPending}
              >
                No
              </button>
              <button
                type="button"
                onClick={() => {
                  deleteCareer(selected, {
                    onSuccess: () => {
                      Notification("success", "Success Delete Data");
                      refetch();
                      setSelected(null);
                    },
                    onError: () => {
                      Notification("error", "Failed to Delete Data");
                      setSelected(null);
                    },
                  });
                }}
                className="px-10 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isPending}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
