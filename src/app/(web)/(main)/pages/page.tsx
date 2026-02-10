/** @format */

"use client";

import { useState, useEffect, useRef } from "react";
import { Plus, Search, Filter, Trash2, Eye, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { usePages, useDeletePage, useTogglePublishPage } from "./hook";
import { useDebounce } from "@/hooks/useDebounce";
import Notification from "@/components/Notification";

export default function PagesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "All" | "Published" | "Draft"
  >("All");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newPageTitle, setNewPageTitle] = useState("");
  const [newPageSlug, setNewPageSlug] = useState("");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selected, setSelected] = useState<any>(null);
  const [showModal, setShowModal] = useState<"NONE" | "PUBLISH" | "DELETE">(
    "NONE",
  );
  const [newPageType, setNewPageType] = useState<string>("Other");
  const router = useRouter();
  const observerTarget = useRef(null);

  // Debounce search
  const debouncedSearch = useDebounce(searchTerm, 500);

  // Fetch pages dengan infinite scroll
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    refetch,
  } = usePages({
    search: debouncedSearch,
    status: statusFilter === "All" ? undefined : statusFilter.toUpperCase(),
  });

  // Delete mutation
  const { mutate: deletePage, isPending: deletePending } = useDeletePage();
  const { mutate: publishPage, isPending: publishPending } =
    useTogglePublishPage();

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Flatten pages dari semua pages
  const allPages = data?.pages.flatMap((page: any) => page.data) || [];

  const handleCreatePage = () => {
    if (!newPageTitle.trim()) return;

    const slug = newPageSlug || newPageTitle.toLowerCase().replace(/\s+/g, "-");

    // Redirect ke canvas editor dengan page baru
    router.push(
      `/pages/editor?title=${encodeURIComponent(
        newPageTitle,
      )}&slug=${slug}&type=${newPageType}&new=true`,
    );

    setShowCreateModal(false);
    setNewPageTitle("");
    setNewPageSlug("");
    setNewPageType("Other");
  };

  const handleEditPage = (page: any) => {
    router.push(`/pages/editor?id=${page._id}`);
  };

  const handleDeletePage = (pageId: string) => {
    deletePage(pageId, {
      onSuccess: () => {
        Notification("success", "Page deleted successfully!");
        refetch();
      },
      onError: (error) => {
        Notification("error", error.message || "Failed to delete page");
      },
    });
  };

  const handlePublishPage = async (pageId: string) => {
    publishPage(pageId, {
      onSuccess: () => {
        Notification("success", "Page publish successfully!");
        refetch();
      },
      onError: (error) => {
        Notification("error", error.message || "Failed to publisg page");
      },
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Pages</h1>
          <p className="text-gray-600 mt-1">
            Add and manage dynamic pages with drag & drop components
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Page
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
            <input
              type="text"
              placeholder="Search pages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-100 text-gray-900 placeholder:text-gray-600"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-100 transition-colors"
            >
              <Filter className="w-5 h-5 text-gray-600" />
              <span className="capitalize">{statusFilter}</span>
            </button>
            {showFilterDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                {["All", "Published", "Draft"].map((status) => (
                  <button
                    key={status}
                    onClick={() => {
                      setStatusFilter(status as any);
                      setShowFilterDropdown(false);
                    }}
                    className={`w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors first:rounded-t-xl last:rounded-b-xl capitalize ${
                      statusFilter === status
                        ? "bg-primary-950 text-primary-500"
                        : ""
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="bg-red-950 border border-red-900 rounded-xl p-6 text-center">
          <p className="text-red-400">
            Failed to load pages. Please try again.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !isError && allPages.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-gray-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {searchTerm ? "No pages found" : "No pages yet"}
            </h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? "Try adjusting your search or filters"
                : "Get started by creating your first page"}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Page
              </button>
            )}
          </div>
        </div>
      )}

      {/* Pages Grid */}
      {!isLoading && !isError && allPages.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {allPages.map((page: any) => (
              <div
                key={page._id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all group"
              >
                {/* Thumbnail */}
                <div className="relative h-48 bg-gradient-to-br from-slate-100 to-slate-200">
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                    <h1 className="font-semibold text-gray-600 px-4 text-center">
                      {page.name}
                    </h1>
                    <button
                      onClick={() => handleEditPage(page)}
                      className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-4 py-2 rounded-lg font-medium transition-all transform scale-95 group-hover:scale-100 absolute"
                    >
                      Edit Page
                    </button>
                    <span
                      className={`top-3 right-3 absolute inline-flex px-2 py-1 rounded-full text-xs font-medium capitalize ${
                        page.status.toUpperCase() === "PUBLISHED"
                          ? "bg-green-100 text-green-400"
                          : "bg-yellow-100 text-yellow-400"
                      }`}
                    >
                      {page.status}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 truncate">
                      /{page.path}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setSelected(page);
                          setShowModal("PUBLISH");
                        }}
                        disabled={publishPending}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Preview"
                      >
                        {publishPending ? (
                          <Loader2 className="w-4 h-4 text-gray-600 animate-spin" />
                        ) : (
                          <Eye className="w-4 h-4 text-gray-600" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          setSelected(page);
                          setShowModal("DELETE");
                        }}
                        disabled={deletePending}
                        className="p-2 hover:bg-red-950 rounded-lg transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deletePending ? (
                          <Loader2 className="w-4 h-4 text-red-500 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-500" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600 mt-2">
                    Updated: {new Date(page.updated_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Infinite Scroll Trigger */}
          <div ref={observerTarget} className="flex justify-center py-8">
            {isFetchingNextPage && (
              <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
            )}
            {!hasNextPage && allPages.length > 0 && (
              <p className="text-gray-600 text-sm">No more pages to load</p>
            )}
          </div>
        </>
      )}

      {/* Add Page Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Add New Page
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Page Title *
                </label>
                <input
                  type="text"
                  value={newPageTitle}
                  onChange={(e) => {
                    setNewPageTitle(e.target.value);
                    if (!newPageSlug) {
                      setNewPageSlug(
                        e.target.value.toLowerCase().replace(/\s+/g, "-"),
                      );
                    }
                  }}
                  placeholder="Enter page title"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  URL Slug
                </label>
                <input
                  type="text"
                  value={newPageSlug}
                  onChange={(e) => setNewPageSlug(e.target.value)}
                  placeholder="page-url-slug"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-600 mt-1">
                  URL: /{newPageSlug || "page-url-slug"}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Page Type *
                </label>
                <select
                  value={newPageType}
                  onChange={(e) => setNewPageType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="Other">Other</option>
                  <option value="Schedule">Schedule</option>
                  <option value="Product">Product</option>
                  <option value="About Us">About Us</option>
                </select>
                <p className="text-xs text-gray-600 mt-1">
                  Select the category for this page. This will affect navbar
                  display.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreatePage}
                disabled={!newPageTitle.trim()}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add & Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {selected && showModal !== "NONE" ? (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {showModal === "DELETE"
                ? "Delete Page"
                : selected.status.toUpperCase() === "DRAFT"
                  ? "Publish Page"
                  : "Unpublish Page"}
            </h2>
            {showModal === "DELETE" ? (
              <p>Are you sure you want to delete this page?</p>
            ) : selected.status.toUpperCase() === "DRAFT" ? (
              <p>Are you sure you want to publish this page?</p>
            ) : (
              <p>Are you sure you want to unpublish this page?</p>
            )}

            <div className="flex gap-5 mt-8 justify-center">
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                }}
                className="px-10 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={deletePending || publishPending}
              >
                No
              </button>
              <button
                className="flex items-center justify-center gap-2 px-10 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                type="button"
                onClick={() => {
                  if (showModal === "DELETE") {
                    handleDeletePage(selected._id);
                    setShowModal("NONE");
                  } else {
                    handlePublishPage(selected._id);
                    setShowModal("NONE");
                  }
                }}
                disabled={deletePending || publishPending}
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
