/** @format */

"use client";

import { useState } from "react";
import { Tag, Modal, Tooltip } from "antd";
import { Edit, Trash2, Plus, Eye } from "lucide-react";

import { useMetadataList, useDeleteMetadata } from "./hook";

import MetadataForm from "./components/MetadataForm";
import Notification from "@/components/Notification";

export default function MetadataPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMetadata, setSelectedMetadata] = useState<any>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);

  const { data, isLoading, refetch } = useMetadataList();
  const { mutate: deleteMetadata, isPending: isDeleting } = useDeleteMetadata();

  const handleEdit = (record: any) => {
    setSelectedMetadata(record);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    deleteMetadata(id, {
      onSuccess: () => {
        Notification("success", "Metadata deleted successfully");
        refetch();
      },
      onError: (error: any) => {
        Notification("error", error.message || "Failed to delete metadata");
      },
    });
  };

  const handlePreview = (record: any) => {
    setPreviewData(record);
    setIsPreviewOpen(true);
  };

  const handleAddNew = () => {
    setSelectedMetadata(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedMetadata(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Metadata Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage SEO metadata for all static pages
          </p>
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Metadata
        </button>
      </div>

      {/* Info Box */}
      <div className="border-primary-300 border bg-primary-100 rounded-xl p-4">
        <p className="text-primary-700  text-sm">
          <span className="font-semibold">Tip:</span> Update metadata to improve
          SEO performance. Published metadata will be visible on the website.
        </p>
      </div>

      {isLoading ? (
        <div className="animate-pulse bg-gray-100 w-full min-h-[30dvh] rounded-xl"></div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">
                    Page
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">
                    Title
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">
                    Description
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">
                    Keywords
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">
                    Status
                  </th>
                  <th className="text-left py-4 px-6 font-medium text-gray-700">
                    Language
                  </th>
                  <th className="text-right py-4 px-6 font-medium text-gray-700">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {data.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-600">
                      No metadata found
                    </td>
                  </tr>
                ) : (
                  data.map((metadata: any) => (
                    <tr
                      key={metadata._id}
                      className="hover:bg-gray-100 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-900 text-[14px]">
                          /{metadata?.page || "-"}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-900 text-[12px]">
                          {metadata?.title || "-"}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-900 text-[12px]">
                          {metadata?.description || "-"}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        {metadata?.keywords && metadata?.keywords.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {metadata?.keywords
                              .slice(0, 2)
                              .map((k: string, i: number) => (
                                <Tag
                                  key={i + 1}
                                  color="red"
                                  className="text-xs"
                                >
                                  {k}
                                </Tag>
                              ))}
                            {metadata?.keywords.length > 2 && (
                              <Tag className="text-xs">
                                +{metadata?.keywords.length - 2}
                              </Tag>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-600">-</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <Tag
                          color={
                            metadata?.status === "PUBLISHED"
                              ? "green"
                              : "orange"
                          }
                          className="text-xs"
                        >
                          {metadata?.status}
                        </Tag>
                      </td>
                      <td className="py-4 px-6">
                        <p className="font-medium text-gray-900">
                          {metadata?.language || "-"}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <Tooltip title="Preview Metadata" placement="top">
                            <button
                              onClick={() => handlePreview(metadata)}
                              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
                            >
                              <Eye className="w-4 h-4 text-blue-400" />
                            </button>
                          </Tooltip>
                          <Tooltip title="Edit Metadata" placement="top">
                            <button
                              onClick={() => handleEdit(metadata)}
                              className="p-2 hover:bg-yellow-100 rounded-lg transition-colors"
                            >
                              <Edit className="w-4 h-4 text-yellow-600" />
                            </button>
                          </Tooltip>
                          <Tooltip title="Delete Metadata" placement="top">
                            <button
                              onClick={() => handleDelete(metadata?._id)}
                              type="button"
                              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal for Form */}
      <Modal
        title={selectedMetadata ? "Edit Metadata" : "Add New Metadata"}
        open={isModalOpen}
        onCancel={handleCloseModal}
        footer={null}
        width={800}
        className="metadata-modal"
      >
        <MetadataForm
          metadata={selectedMetadata}
          onSuccess={() => {
            handleCloseModal();
            refetch();
          }}
        />
      </Modal>

      {/* Preview Modal */}
      <Modal
        title="Metadata Preview"
        open={isPreviewOpen}
        onCancel={() => setIsPreviewOpen(false)}
        footer={null}
        width={800}
      >
        {previewData && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Page
                </label>
                <p className="text-gray-900 font-semibold mt-1">
                  {previewData.page}
                </p>
              </div>
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Status
                </label>
                <p className="mt-1">
                  <Tag
                    color={
                      previewData.status === "PUBLISHED" ? "green" : "orange"
                    }
                  >
                    {previewData.status}
                  </Tag>
                </p>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">
                Title
              </label>
              <p className="text-gray-900 mt-1">{previewData.title}</p>
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-600">
                Description
              </label>
              <p className="text-gray-700 mt-1">{previewData.description}</p>
            </div>

            {previewData.keywords && previewData.keywords.length > 0 && (
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  Keywords
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {previewData.keywords.map((k: string, i: number) => (
                    <Tag key={i} color="red">
                      {k}
                    </Tag>
                  ))}
                </div>
              </div>
            )}

            {previewData.og_image && (
              <div>
                <label className="text-sm font-semibold text-gray-600">
                  OG Image Preview
                </label>
                <img
                  src={previewData.og_image}
                  alt="OG Image"
                  className="mt-2 max-w-full h-auto rounded-lg border border-gray-200"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
              <div>
                <label className="text-sm text-gray-600">OG Title</label>
                <p className="text-gray-700 text-sm mt-1">
                  {previewData.og_title || "-"}
                </p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Language</label>
                <p className="text-gray-700 text-sm mt-1">
                  {previewData.language || "-"}
                </p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
