/** @format */
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  ChevronDown,
} from "lucide-react";
import { Tooltip } from "antd";

import Notification from "@/components/Notification";
import { StyledSelect } from "@/components/StyledSelect";
import { useDebounce } from "@/hooks/useDebounce";
import { servicesToCategories } from "@/lib/utils";

import { useProducts, useDelete } from "./hook";
import { useServices } from "../services/hook";

const SORT_OPTIONS = [
  { value: "desc", label: "Newest First" },
  { value: "asc", label: "Oldest First" },
];

export default function ProductPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortOrder, setSortOrder] = useState("desc");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [selected, setSelected] = useState(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Fetch services untuk categories
  const { data: services = [] } = useServices();

  // Transform services to categories format
  const CATEGORIES = [
    { value: "All", label: "All Categories" },
    ...servicesToCategories(services),
  ];

  // Form state for filter dropdown
  const [filterForm, setFilterForm] = useState({
    category: selectedCategory,
    sort: sortOrder,
  });

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
  } = useProducts({
    product_category: selectedCategory !== "All" ? selectedCategory : undefined,
    product_name: debouncedSearchTerm || undefined,
    sort_order: sortOrder,
  });

  const { mutate: deleteProduct, isPending } = useDelete();

  const products = useMemo(() => {
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

  function ProductCard({ product }: any) {
    return (
      <div
        key={product._id}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        {product.banner?.url ? (
          <div className="h-48 bg-gray-100 overflow-hidden">
            <Image
              src={product.banner?.url}
              alt={product.banner?.public_id}
              className="w-full h-full object-cover"
              width={250}
              height={250}
            />
          </div>
        ) : null}

        <div className="p-6">
          <div className="flex items-start justify-between mb-3">
            <Tooltip placement="top" title={product?.product_name || "-"}>
              <h3 className="text-lg font-semibold text-gray-900 truncate max-w-[60%]">
                {product.product_name}
              </h3>
            </Tooltip>
            <Tooltip
              placement="top"
              title={product?.product_category.replaceAll("_", " ") || "-"}
            >
              <span className="px-3 py-1 text-xs font-medium bg-primary-200 text-primary-600 rounded-full truncate uppercase">
                {product.product_category?.replaceAll("_", " ") || "-"}
              </span>
            </Tooltip>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-2">
            {product.product_description}
          </p>

          <div className="space-y-2 mb-4 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Skill Level:</span>
              <span className="font-medium capitalize">
                {product.skill_level?.toLowerCase()?.replace("_", " ")}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Duration:</span>
              <span className="font-medium">
                {product.duration} Minutes/Session
              </span>
            </div>
          </div>

          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => router.push(`/product/editor?id=${product._id}`)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => {
                setSelected(product._id);
              }}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
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
          <h1 className="text-3xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-600 mt-1">Manage your service products</p>
        </div>
        <button
          onClick={() => router.push("/product/editor")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Product
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
              placeholder="Search product..."
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
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-gray-300 p-6 z-10 space-y-6">
                {/* Category Filter */}
                <StyledSelect
                  value={filterForm.category}
                  onChange={(val: any) => {
                    setFilterForm((prev) => ({ ...prev, category: val }));
                    setSelectedCategory(val);
                  }}
                  options={CATEGORIES}
                  label="Category"
                />

                {/* Sort Order Filter */}
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
                    setSelectedCategory("All");
                    setSortOrder("desc");
                    setSearchTerm("");
                    setFilterForm({ category: "All", sort: "desc" });
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
        {(selectedCategory !== "All" || debouncedSearchTerm) && (
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
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      ) : products && products.length > 0 ? (
        <>
          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product: any) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination Info & Load More Button */}
          <div className="text-center space-y-4">
            <p className="text-sm text-gray-600">
              Showing {products.length} of{" "}
              {pagination.total_products || products.length} products
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
          <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No products found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm || selectedCategory !== "All"
              ? "Try adjusting your search or filters"
              : "Get started by creating your first product"}
          </p>
          <button
            onClick={() => router.push("/product/editor")}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {selected ? (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Delete Product
            </h2>
            <p>Are you sure you want to delete this product?</p>
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
                  deleteProduct(selected, {
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
