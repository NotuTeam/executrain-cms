/** @format */

"use client";

import { useEffect, useState } from "react";
import { Form, Tabs } from "antd";
import { X } from "lucide-react";
import InputForm from "@/components/Form";
import Notification from "@/components/Notification";
import {
  useCreateMetadata,
  useUpdateMetadata,
  usePublishMetadata,
} from "../hook";

interface MetadataFormProps {
  metadata?: any;
  onSuccess: () => void;
}

const defaultForm = {
  page: "",
  title: "",
  description: "",
  keywords: [],
  og_title: "",
  og_description: "",
  og_image: "",
  og_type: "website",
  twitter_card: "summary_large_image",
  twitter_title: "",
  twitter_description: "",
  twitter_image: "",
  author: "",
  language: "id",
  canonical_url: "",
  robots: { index: true, follow: true },
  status: "DRAFT",
};

export default function MetadataForm({
  metadata,
  onSuccess,
}: MetadataFormProps) {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<any>(defaultForm);

  const [newKeyword, setNewKeyword] = useState("");
  const { mutate: createMetadata, isPending: isCreating } = useCreateMetadata();
  const { mutate: updateMetadata, isPending: isUpdating } = useUpdateMetadata();
  const { mutate: publishMetadata, isPending: isPublishing } =
    usePublishMetadata();

  useEffect(() => {
    if (metadata) {
      setFormData(metadata);
      form.setFieldsValue(metadata);
    } else {
      setFormData(defaultForm);
      form.resetFields();
    }
  }, [metadata, form]);

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      const keywords = formData.keywords || [];
      setFormData({
        ...formData,
        keywords: [...keywords, newKeyword.trim()],
      });
      setNewKeyword("");
    }
  };

  const handleRemoveKeyword = (index: number) => {
    const keywords = [...(formData.keywords || [])];
    keywords.splice(index, 1);
    setFormData({ ...formData, keywords });
  };

  const handleSubmit = async () => {
    try {
      await form.validateFields();

      if (metadata) {
        updateMetadata(
          { id: metadata._id, data: formData },
          {
            onSuccess: () => {
              Notification("success", "Metadata updated successfully");
              onSuccess();
            },
            onError: (error: any) => {
              Notification(
                "error",
                error.message || "Failed to update metadata"
              );
            },
          }
        );
      } else {
        createMetadata(formData, {
          onSuccess: () => {
            Notification("success", "Metadata created successfully");
            onSuccess();
          },
          onError: (error: any) => {
            Notification("error", error.message || "Failed to create metadata");
          },
        });
      }
    } catch (error) {
      Notification("error", "Please fill in all required fields");
    }
  };

  const handlePublish = async () => {
    try {
      if (!metadata) {
        Notification("error", "Please save metadata first before publishing");
        return;
      }

      publishMetadata(
        { id: metadata._id, status: "PUBLISHED" },
        {
          onSuccess: () => {
            Notification("success", "Metadata published successfully");
            onSuccess();
          },
          onError: (error: any) => {
            Notification(
              "error",
              error.message || "Failed to publish metadata"
            );
          },
        }
      );
    } catch (error) {
      Notification("error", "Failed to publish metadata");
    }
  };

  const isPending = isCreating || isUpdating || isPublishing;

  const tabItems = [
    {
      key: "general",
      label: "General",
      children: (
        <div className="space-y-4">
          <InputForm
            type="select"
            name="page"
            label="Page Name"
            placeholder="Select page"
            required
            form={formData}
            setForm={setFormData}
            options={[
              { label: "Home", value: "home" },
              { label: "About", value: "about" },
              { label: "Contact", value: "contact" },
              { label: "Product", value: "product" },
              { label: "Schedule", value: "schedule" },
              { label: "Service", value: "service" },
            ]}
            disabled={!!metadata}
          />

          <InputForm
            type="text"
            name="title"
            label="Meta Title"
            placeholder="Page title (max 60 chars)"
            required
            form={formData}
            setForm={setFormData}
          />

          <InputForm
            type="textarea"
            name="description"
            label="Meta Description"
            placeholder="Page description (max 160 chars)"
            required
            form={formData}
            setForm={setFormData}
          />

          <div>
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Keywords
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                placeholder="Add a keyword..."
                className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Add
              </button>
            </div>
            {formData.keywords && formData.keywords.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.keywords.map((keyword: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center gap-2 px-3 py-1 bg-primary-950 text-primary-400 rounded-full text-sm"
                  >
                    {keyword}
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(index)}
                      className="hover:text-blue-400"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <InputForm
            type="text"
            name="canonical_url"
            label="Canonical URL"
            placeholder="https://example.com/page"
            form={formData}
            setForm={setFormData}
          />

          <InputForm
            type="text"
            name="author"
            label="Author"
            placeholder="Author name"
            form={formData}
            setForm={setFormData}
          />

          <InputForm
            type="select"
            name="language"
            label="Language"
            placeholder="Select language"
            form={formData}
            setForm={setFormData}
            options={[
              { label: "Indonesian", value: "id" },
              { label: "English", value: "en" },
            ]}
          />
        </div>
      ),
    },
    {
      key: "opengraph",
      label: "Open Graph",
      children: (
        <div className="space-y-4">
          <div className="bg-primary-950 p-3 rounded-lg text-sm text-blue-900 mb-4">
            Use for Facebook, LinkedIn, and other social platforms
          </div>

          <InputForm
            type="text"
            name="og_title"
            label="OG Title"
            placeholder="Title for social sharing"
            form={formData}
            setForm={setFormData}
          />

          <InputForm
            type="textarea"
            name="og_description"
            label="OG Description"
            placeholder="Description for social sharing"
            form={formData}
            setForm={setFormData}
          />

          <InputForm
            type="text"
            name="og_image"
            label="OG Image URL"
            placeholder="https://example.com/image.jpg (1200x630px recommended)"
            form={formData}
            setForm={setFormData}
          />

          {formData.og_image && (
            <div className="mt-4">
              <img
                src={formData.og_image}
                alt="OG Preview"
                className="w-full max-w-sm h-auto rounded-lg border border-gray-200"
                onError={() => {}}
              />
            </div>
          )}

          <InputForm
            type="select"
            name="og_type"
            label="OG Type"
            placeholder="Select type"
            form={formData}
            setForm={setFormData}
            options={[
              { label: "Website", value: "website" },
              { label: "Article", value: "article" },
              { label: "Business", value: "business" },
            ]}
          />
        </div>
      ),
    },
    {
      key: "twitter",
      label: "Twitter Card",
      children: (
        <div className="space-y-4">
          <div className="bg-primary-950 p-3 rounded-lg text-sm text-blue-900 mb-4">
            Configure how your link appears when shared on Twitter/X
          </div>

          <InputForm
            type="select"
            name="twitter_card"
            label="Card Type"
            placeholder="Select card type"
            form={formData}
            setForm={setFormData}
            options={[
              { label: "Summary", value: "summary" },
              { label: "Summary Large Image", value: "summary_large_image" },
              { label: "App", value: "app" },
              { label: "Player", value: "player" },
            ]}
          />

          <InputForm
            type="text"
            name="twitter_title"
            label="Twitter Title"
            placeholder="Title for Twitter"
            form={formData}
            setForm={setFormData}
          />

          <InputForm
            type="textarea"
            name="twitter_description"
            label="Twitter Description"
            placeholder="Description for Twitter"
            form={formData}
            setForm={setFormData}
          />

          <InputForm
            type="text"
            name="twitter_image"
            label="Twitter Image URL"
            placeholder="https://example.com/image.jpg (1200x675px recommended)"
            form={formData}
            setForm={setFormData}
          />
        </div>
      ),
    },
    {
      key: "robots",
      label: "Robots & Settings",
      children: (
        <div className="space-y-4">
          <div className="bg-amber-50 p-3 rounded-lg text-sm text-amber-900 mb-4">
            Control how search engines crawl and index your page
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.robots?.index ?? true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    robots: {
                      ...formData.robots,
                      index: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-600">
                Allow search engines to index this page
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.robots?.follow ?? true}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    robots: {
                      ...formData.robots,
                      follow: e.target.checked,
                    },
                  })
                }
                className="w-4 h-4 rounded"
              />
              <span className="text-sm text-gray-600">
                Allow search engines to follow links on this page
              </span>
            </label>
          </div>

          <InputForm
            type="select"
            name="status"
            label="Status"
            placeholder="Select status"
            form={formData}
            setForm={setFormData}
            options={[
              { label: "Draft", value: "DRAFT" },
              { label: "Published", value: "PUBLISHED" },
            ]}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <Form form={form} layout="vertical" requiredMark={false}>
        <Tabs items={tabItems} className="metadata-tabs" />
      </Form>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onSuccess}
          className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
        >
          Cancel
        </button>

        {metadata && metadata?.status === "DRAFT" && (
          <button
            type="button"
            onClick={handlePublish}
            disabled={isPublishing}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            {isPublishing ? "Publishing..." : "Publish"}
          </button>
        )}

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          {isCreating || isUpdating ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
