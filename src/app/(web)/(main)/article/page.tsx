/** @format */
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  FileText,
  Plus,
  Search,
  Edit,
  Trash2,
  ChevronDown,
  Eye,
} from "lucide-react";
import { Tooltip } from "antd";
import dayjs from "dayjs";

import Notification from "@/components/Notification";
import { useDebounce } from "@/hooks/useDebounce";

import { useArticles, useDeleteArticle } from "./hook";

export default function ArticlePage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [selected, setSelected] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useArticles({
    category: selectedCategory !== "All" ? selectedCategory : undefined,
    search: debouncedSearchTerm || undefined,
    status: selectedStatus !== "All" ? selectedStatus : undefined,
  });

  const { mutate: deleteArticle, isPending } = useDeleteArticle();

  const articles = useMemo(() => {
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

  function ArticleCard({ article }: any) {
    return (
      <div
        key={article._id}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        {article.featured_image?.url ? (
          <div className="h-48 bg-gray-100 overflow-hidden">
            <Image
              src={article.featured_image?.url}
              alt={article.title}
              className="w-full h-full object-cover"
              width={250}
              height={250}
            />
          </div>
        ) : (
          <div className="h-48 bg-gray-100 flex items-center justify-center">
            <FileText className="w-16 h-16 text-gray-700" />
          </div>
        )}

        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <Tooltip placement="top" title={article?.title || "-"}>
              <h3 className="text-lg font-semibold text-gray-900 truncate max-w-[60%]">
                {article.title}
              </h3>
            </Tooltip>
            <span
              className={`px-3 py-1 text-xs font-medium rounded-full ${
                article.status === "PUBLISHED"
                  ? "bg-green-200 text-green-700"
                  : article.status === "DRAFT"
                    ? "bg-yellow-950 text-yellow-400"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {article.status}
            </span>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {article.excerpt || article.content?.replace(/<[^>]*>/g, "")}
          </p>

          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Category:</span>
              <span className="font-medium">{article.category}</span>
            </div>
            <div className="flex justify-between">
              <span>Author:</span>
              <span className="font-medium">{article.author}</span>
            </div>
            <div className="flex justify-between">
              <span>Views:</span>
              <span className="font-medium flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {article.views || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Created:</span>
              <span className="font-medium">
                {dayjs(article.created_at).format("DD MMM YYYY")}
              </span>
            </div>
          </div>

          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {article.tags.slice(0, 3).map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                >
                  #{tag}
                </span>
              ))}
              {article.tags.length > 3 && (
                <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                  +{article.tags.length - 3}
                </span>
              )}
            </div>
          )}

          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => router.push(`/article/editor?id=${article._id}`)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => {
                setSelected(article._id);
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
          <h1 className="text-3xl font-bold text-gray-900">Articles</h1>
          <p className="text-gray-600 mt-1">Manage your blog articles</p>
        </div>
        <button
          onClick={() => router.push("/article/editor")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Article
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
              placeholder="Search articles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-100 text-gray-900 placeholder:text-gray-600"
            />
          </div>
        </div>

        {/* Active Filters Display */}
        {(selectedCategory !== "All" ||
          selectedStatus !== "All" ||
          debouncedSearchTerm) && (
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200">
            <span className="text-sm text-gray-600">Active filters:</span>
            {selectedCategory !== "All" && (
              <span className="px-3 py-1 text-xs font-medium bg-primary-950 text-primary-400 rounded-full flex items-center gap-1">
                {selectedCategory}
                <button
                  onClick={() => setSelectedCategory("All")}
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
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading articles...</p>
        </div>
      ) : articles && articles.length > 0 ? (
        <>
          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article: any) => (
              <ArticleCard key={article._id} article={article} />
            ))}
          </div>

          {/* Pagination Info & Load More Button */}
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Showing {articles.length} of{" "}
              {pagination.total_articles || articles.length} articles
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
          <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No articles found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm ||
            selectedCategory !== "All" ||
            selectedStatus !== "All"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first article"}
          </p>
          <button
            onClick={() => router.push("/article/editor")}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Article
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {selected ? (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Delete Article
            </h2>
            <p>Are you sure you want to delete this article?</p>
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
                  deleteArticle(selected, {
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
