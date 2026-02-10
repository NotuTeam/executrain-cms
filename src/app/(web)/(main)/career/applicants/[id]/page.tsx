/** @format */
"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Search,
  Filter,
  ChevronDown,
  Mail,
  Phone,
  FileText,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Download,
} from "lucide-react";
import { Tooltip } from "antd";
import dayjs from "dayjs";

import Notification from "@/components/Notification";
import { useDebounce } from "@/hooks/useDebounce";

import { useApplicants, useUpdateApplicantStatus, useDeleteApplicant } from "../../hook";

const APPLICATION_STATUS = [
  { value: "All", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "UNDER_REVIEW", label: "Under Review" },
  { value: "SHORTLISTED", label: "Shortlisted" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "REJECTED", label: "Rejected" },
  { value: "HIRED", label: "Hired" },
];

const STATUS_COLORS = {
  PENDING: "bg-yellow-950 text-yellow-400",
  UNDER_REVIEW: "bg-blue-950 text-blue-400",
  SHORTLISTED: "bg-green-950 text-green-400",
  INTERVIEW: "bg-purple-950 text-purple-400",
  REJECTED: "bg-red-950 text-red-400",
  HIRED: "bg-emerald-950 text-emerald-400",
};

export default function ApplicantsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selectedApplicant, setSelectedApplicant] = useState<any>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [notes, setNotes] = useState("");

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useApplicants(params.id, {
    status: selectedStatus !== "All" ? selectedStatus : undefined,
    search: debouncedSearchTerm || undefined,
  });

  const { mutate: updateStatus, isPending: isUpdating } =
    useUpdateApplicantStatus();
  const { mutate: deleteApplicant, isPending: isDeleting } = useDeleteApplicant();

  const applicants = useMemo(() => {
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

  const handleUpdateStatus = () => {
    if (!selectedApplicant || !newStatus) return;

    updateStatus(
      { id: selectedApplicant._id, status: newStatus, notes },
      {
        onSuccess: () => {
          Notification("success", "Status updated successfully");
          setShowStatusModal(false);
          setSelectedApplicant(null);
          setNewStatus("");
          setNotes("");
          refetch();
        },
        onError: () => {
          Notification("error", "Failed to update status");
        },
      }
    );
  };

  const handleDelete = (applicant: any) => {
    deleteApplicant(applicant._id, {
      onSuccess: () => {
        Notification("success", "Applicant deleted successfully");
        refetch();
      },
      onError: () => {
        Notification("error", "Failed to delete applicant");
      },
    });
  };

  function ApplicantCard({ applicant }: any) {
    return (
      <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden hover:shadow-md transition-shadow">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-slate-100 mb-1">
                {applicant.full_name}
              </h3>
              <p className="text-sm text-slate-400">{applicant.current_position}</p>
              <p className="text-sm text-slate-500">{applicant.current_company}</p>
            </div>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                STATUS_COLORS[applicant.status as keyof typeof STATUS_COLORS]
              }`}
            >
              {applicant.status.replace("_", " ")}
            </span>
          </div>

          <div className="space-y-2 mb-4 text-sm">
            <div className="flex items-center gap-2 text-slate-400">
              <Mail className="w-4 h-4" />
              <span>{applicant.email}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Phone className="w-4 h-4" />
              <span>{applicant.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar className="w-4 h-4" />
              <span>
                Applied: {dayjs(applicant.applied_at).format("DD MMM YYYY")}
              </span>
            </div>
            {applicant.experience_years && (
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-4 h-4" />
                <span>{applicant.experience_years} years experience</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4 border-t border-slate-800">
            <button
              onClick={() => {
                setSelectedApplicant(applicant);
                setShowStatusModal(true);
                setNewStatus(applicant.status);
                setNotes(applicant.notes || "");
              }}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors text-sm"
            >
              <CheckCircle className="w-4 h-4" />
              Update Status
            </button>
            <a
              href={applicant.resume.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors text-sm"
            >
              <FileText className="w-4 h-4" />
              View Resume
            </a>
            <button
              onClick={() => setSelectedApplicant(applicant)}
              className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800 text-slate-400 rounded-lg hover:bg-slate-700 transition-colors text-sm"
            >
              <XCircle className="w-4 h-4" />
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-slate-400" />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-100">Applicants</h1>
          <p className="text-slate-400 mt-1">Manage job applications</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search applicants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-slate-800 text-slate-100 placeholder:text-slate-500"
            />
          </div>

          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setSelectedStatus("All")}
              className="flex items-center gap-2 px-4 py-2 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors"
            >
              <Filter className="w-5 h-5 text-slate-500" />
              <span>Filter</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>

            <div className="absolute right-0 mt-2 w-56 bg-slate-900 rounded-xl shadow-lg border border-slate-800 p-4 z-10">
              <label className="block text-sm font-medium text-slate-500 mb-2">
                Application Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-800 text-slate-100"
              >
                {APPLICATION_STATUS.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedStatus !== "All" || debouncedSearchTerm) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800">
            <span className="text-sm text-slate-400">Active filters:</span>
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
          <p className="mt-4 text-slate-400">Loading applicants...</p>
        </div>
      ) : applicants && applicants.length > 0 ? (
        <>
          {/* Applicants Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {applicants.map((applicant: any) => (
              <ApplicantCard key={applicant._id} applicant={applicant} />
            ))}
          </div>

          {/* Pagination Info & Load More Button */}
          <div className="text-center space-y-4">
            <p className="text-sm text-slate-400">
              Showing {applicants.length} of{" "}
              {pagination.total_applicants || applicants.length} applicants
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
        <div className="text-center py-12 bg-slate-900 rounded-xl border border-slate-800 flex flex-col items-center">
          <Users className="w-16 h-16 text-slate-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-100 mb-2">
            No applicants found
          </h3>
          <p className="text-slate-400 mb-6">
            {searchTerm || selectedStatus !== "All"
              ? "Try adjusting your search or filters"
              : "No applications received yet"}
          </p>
        </div>
      )}

      {/* Update Status Modal */}
      {showStatusModal && selectedApplicant ? (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-slate-100 mb-4">
              Update Application Status
            </h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Applicant
                </label>
                <p className="text-slate-100">{selectedApplicant.full_name}</p>
                <p className="text-sm text-slate-400">
                  {selectedApplicant.current_position} at{" "}
                  {selectedApplicant.current_company}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Status
                </label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-800 text-slate-100"
                >
                  {APPLICATION_STATUS.filter((s) => s.value !== "All").map(
                    (status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  placeholder="Add notes about this applicant..."
                  className="w-full px-3 py-2 border border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-slate-800 text-slate-100"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowStatusModal(false);
                  setSelectedApplicant(null);
                  setNewStatus("");
                  setNotes("");
                }}
                className="flex-1 px-4 py-2 border border-slate-700 text-slate-500 rounded-lg hover:bg-slate-800 transition-colors font-medium"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpdateStatus}
                disabled={isUpdating}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50"
              >
                {isUpdating ? "Updating..." : "Update"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Delete Confirmation Modal */}
      {selectedApplicant && !showStatusModal ? (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-slate-900 rounded-2xl p-6 w-full max-w-md text-center">
            <h2 className="text-xl font-bold text-slate-100 mb-6">
              Delete Applicant
            </h2>
            <p className="mb-2">
              Are you sure you want to delete {selectedApplicant.full_name}'s
              application?
            </p>
            <p className="text-sm text-slate-400 mb-6">
              This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setSelectedApplicant(null)}
                className="flex-1 px-4 py-2 border border-slate-700 text-slate-500 rounded-lg hover:bg-slate-800 transition-colors font-medium"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  handleDelete(selectedApplicant);
                  setSelectedApplicant(null);
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
