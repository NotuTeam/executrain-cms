/** @format */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ArrowLeft, Plus, X } from "lucide-react";
import { Form } from "antd";
import InputForm from "@/components/Form";
import QuillEditor from "@/components/QuillEditor";
import Image from "next/image";

import { useCreateArticle, useArticleDetail, useUpdateArticle } from "../hook";
import Notification from "@/components/Notification";

const ARTICLE_CATEGORIES = [
  "GENERAL",
  "IT_TRAINING",
  "IT_CONSULTANT",
  "CAREER_TIPS",
  "INDUSTRY_NEWS",
];

const ARTICLE_STATUS = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export default function ArticleEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const articleId = searchParams.get("id");

  const [form] = Form.useForm();

  const { data: existingArticle } = useArticleDetail(articleId || "");
  const { mutate: createArticle, isPending: isCreating } = useCreateArticle();
  const { mutate: updateArticle, isPending: isUpdating } = useUpdateArticle();

  const [formAction, setFormAction] = useState<any>({
    tags: [],
  });

  const [newTag, setNewTag] = useState({ tag: null });

  useEffect(() => {
    if (existingArticle) {
      form.setFieldsValue(existingArticle);
      setFormAction(existingArticle);
    }
  }, [existingArticle]);

  const handleAddTag = () => {
    if (!newTag?.tag) {
      return;
    }

    // Check if tags already has 5 items (maximum limit)
    if (formAction?.tags && formAction.tags.length >= 5) {
      Notification(
        "error",
        "Maximum 5 tags allowed. Please remove one to add new tag.",
      );
      return;
    }

    setFormAction((prev: any) => ({
      ...prev,
      tags: [...prev?.tags, newTag.tag],
    }));
    setNewTag({ tag: null });
    form.setFieldValue("tag", undefined);
  };

  const handleRemoveTag = (index: number) => {
    setFormAction((prev: any) => ({
      ...prev,
      tags: prev?.tags?.filter((_: string, i: number) => i !== index),
    }));
  };

  const handleSaveArticle = async (status: string) => {
    try {
      const formData = new FormData();

      formData.append("title", formAction.title);
      formData.append("content", formAction.content);
      formData.append(
        "excerpt",
        formAction.excerpt ||
          formAction.content?.replace(/<[^>]*>/g, "")?.substring(0, 150) +
            "...",
      );
      formData.append("author", formAction.author || "Admin");
      formData.append("status", status);

      formAction.tags?.forEach((tag: string) => {
        formData.append("tags", tag);
      });

      formData.append("meta_title", formAction.meta_title || "");
      formData.append("meta_description", formAction.meta_description || "");

      if (formAction.meta_keywords && Array.isArray(formAction.meta_keywords)) {
        formAction.meta_keywords.forEach((keyword: string) => {
          formData.append("meta_keywords", keyword);
        });
      }

      if (formAction?.featured_image?.file) {
        formData.append("file", formAction?.featured_image?.file ?? null);
      } else if (existingArticle?.featured_image) {
        formData.append(
          "featured_image",
          JSON.stringify(existingArticle.featured_image),
        );
      }

      if (articleId) {
        updateArticle(
          { id: articleId, data: formData },
          {
            onSuccess: () => {
              Notification("success", "Success Update Article");
              router.push("/article");
            },
            onError: (error: any) => {
              Notification(
                "error",
                error.message || "Failed to Update Article",
              );
            },
          },
        );
      } else {
        createArticle(formData, {
          onSuccess: () => {
            Notification("success", "Success Add Article");
            router.push("/article");
          },
          onError: (error: any) => {
            Notification("error", error.message || "Failed to Add Article");
          },
        });
      }
    } catch (error) {
      console.log("Validation failed:", error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {articleId ? "Edit Article" : "Add New Article"}
          </h1>
          <p className="text-gray-600 text-sm">
            {articleId
              ? "Update article details"
              : "Fill in the article details"}
          </p>
        </div>
      </div>
      <Form
        requiredMark={false}
        form={form}
        layout="vertical"
        className="space-y-8"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Basic Information
          </h2>
          <div className="space-y-4">
            <InputForm
              type="text"
              name="title"
              label="Article Title"
              placeholder="Enter article title"
              required
              form={formAction}
              setForm={setFormAction}
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Content</h2>
          <QuillEditor
            content={formAction.content || ""}
            onChange={(content) =>
              setFormAction((prev: any) => ({
                ...prev,
                content,
              }))
            }
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Featured Image */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 pt-6 pb-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Featured Image
            </h2>
            {formAction?.featured_image?.data ||
            formAction?.featured_image?.url ? (
              <div className="relative mb-5">
                <Image
                  src={
                    formAction?.featured_image?.data ||
                    formAction?.featured_image?.url
                  }
                  alt="featured image"
                  width={0}
                  height={0}
                  sizes="100vw"
                  style={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "10px",
                  }}
                />
                <button
                  type="button"
                  onClick={() =>
                    setFormAction((prev: any) => ({
                      ...prev,
                      featured_image: undefined,
                    }))
                  }
                  className="p-1 hover:bg-gray-100 hover:text-red-500 rounded text-white transition-colors absolute top-5 right-5"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <InputForm
                type="file"
                name="featured_image"
                label=""
                accept="image/*"
                className="mb-5"
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
            )}
          </div>

          {/* Category & Author */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Article Details
            </h2>
            <div className="space-y-4">
              <InputForm
                type="text"
                name="author"
                label="Author"
                placeholder="Enter author name"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-md text-gray-900">Tags</h2>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    formAction?.tags?.length >= 5
                      ? "bg-red-100 text-red-400"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {formAction?.tags?.length || 0} / 5
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2 items-start">
                  <div className="flex-grow">
                    <InputForm
                      type="text"
                      name="tag"
                      label=""
                      placeholder="Add a tag..."
                      form={newTag}
                      setForm={(e: any) => setNewTag(e)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddTag}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>

                {formAction?.tags?.length > 0 && (
                  <div className="space-y-2 pb-3">
                    {formAction?.tags?.map((tag: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-200"
                      >
                        <span className="text-gray-600">#{tag}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(index)}
                          className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SEO Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">SEO</h2>
            <div className="space-y-4">
              <InputForm
                type="text"
                name="meta_title"
                label="Meta Title"
                placeholder="SEO meta title"
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="textarea"
                name="meta_description"
                label="Meta Description"
                placeholder="SEO meta description"
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              disabled={isCreating || isUpdating}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => handleSaveArticle("PUBLISHED")}
              disabled={isCreating || isUpdating}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isCreating || isUpdating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {articleId ? "Updating..." : "Publishing..."}
                </>
              ) : (
                <>{articleId ? "Update Article" : "Publish Article"}</>
              )}
            </button>
          </div>
        </div>
      </Form>
    </div>
  );
}
