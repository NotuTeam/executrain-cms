/** @format */

"use client";

import { useState } from "react";
import { Form } from "antd";
import { Plus, Edit, Trash2, MessageSquare, X, User } from "lucide-react";
import Image from "next/image";
import InputForm from "@/components/Form";
import Notification from "@/components/Notification";
import {
  useTestimonial,
  useCreateTestimonial,
  useUpdateTestimonial,
  useDeleteTestimonial,
} from "../hook";

export default function TestimonialsTab() {
  const [showModal, setShowModal] = useState<"NONE" | "INPUT" | "DELETE">(
    "NONE",
  );
  const [formAction, setFormAction] = useState<any>({});
  const [form] = Form.useForm();

  const { data: testimonials = [], isLoading, refetch } = useTestimonial();
  const { mutate: add, isPending: isCreating } = useCreateTestimonial();
  const { mutate: update, isPending: isUpdating } = useUpdateTestimonial();
  const { mutate: deleteTestimonial, isPending: isDeleting } =
    useDeleteTestimonial();

  const handleDelete = (id: string) => {
    deleteTestimonial(id, {
      onSuccess: () => {
        Notification("success", "Testimonial deleted successfully");
        setFormAction({});
        setShowModal("NONE");
        refetch();
      },
      onError: (error: any) => {
        Notification("error", error.message || "Failed to delete testimonial");
      },
    });
  };

  async function addTestimonial() {
    try {
      await form.validateFields();

      const formData = new FormData();
      formData.append("person_name", formAction.person_name);
      formData.append("person_title", formAction.person_title);
      formData.append("testimonial", formAction.testimonial);

      if (formAction?.photo?.file) {
        formData.append("file", formAction?.photo?.file ?? null);
      } else {
        const parsed = JSON.stringify(formAction?.photo);
        formData.append("photo", parsed);
      }

      add(formData, {
        onSuccess: () => {
          Notification("success", "Success to add partner");
          setShowModal("NONE");
          setFormAction({});
          form.resetFields();
          refetch();
        },
        onError: () => {
          Notification("error", "Failed to add partner");
        },
      });
    } catch (e) {
      console.log(e);
    }
  }

  async function updateTestimonial() {
    try {
      await form.validateFields();

      const formData = new FormData();
      formData.append("person_name", formAction.person_name);
      formData.append("person_title", formAction.person_title);
      formData.append("testimonial", formAction.testimonial);

      if (formAction?.photo?.file) {
        formData.append("file", formAction?.photo?.file ?? null);
      } else {
        const parsed = JSON.stringify(formAction?.photo);
        formData.append("photo", parsed);
      }

      update(
        { id: formAction._id, data: formData },
        {
          onSuccess: () => {
            Notification("success", "Success to add partner");
            setShowModal("NONE");
            setFormAction({});
            form.resetFields();
            refetch();
          },
          onError: () => {
            Notification("error", "Failed to add partner");
          },
        },
      );
    } catch (e) {
      console.log(e);
    }
  }

  const isPending = isCreating || isUpdating;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="animate-pulse h-48 bg-gray-100 rounded-xl"
          ></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 p-4 bg-primary-950 rounded-xl border border-blue-200">
          <div>
            <h3 className="font-semibold text-blue-900">
              Testimonial Management
            </h3>
          </div>
        </div>
        <button
          onClick={() => setShowModal("INPUT")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Testimonial
        </button>
      </div>

      {testimonials.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((testimonial: any) => (
            <div
              key={testimonial._id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {testimonial.photo ? (
                    <Image
                      src={testimonial?.photo?.url}
                      alt={testimonial.person_name}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <User className="w-8 h-8 text-gray-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">
                    {testimonial.person_name}
                  </h3>
                  <p className="text-sm text-gray-600 truncate">
                    {testimonial.person_title}
                  </p>
                </div>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {testimonial.testimonial}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setFormAction(testimonial);
                    form.setFieldsValue(testimonial);
                    setShowModal("INPUT");
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-primary-500 hover:bg-primary-950 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => {
                    setShowModal("DELETE");
                    setFormAction(testimonial);
                  }}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-950 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-100 rounded-xl border border-gray-200">
          <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No testimonials yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start by adding your first testimonial
          </p>
          <button
            onClick={() => setShowModal("INPUT")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Testimonial
          </button>
        </div>
      )}

      {showModal === "INPUT" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {formAction?._id ? "Edit Testimonial" : "Add New Testimonial"}
            </h2>

            <Form form={form} layout="vertical" requiredMark={false}>
              <InputForm
                type="text"
                name="person_name"
                label="Name"
                placeholder="Enter person's name"
                required
                form={formAction}
                setForm={setFormAction}
              />

              <InputForm
                type="text"
                name="person_title"
                label="Title / Position"
                placeholder="Enter job title or position"
                required
                form={formAction}
                setForm={setFormAction}
              />

              <InputForm
                type="textarea"
                name="testimonial"
                label="Testimonial Content"
                placeholder="Enter testimonial content"
                required
                form={formAction}
                setForm={setFormAction}
              />

              {formAction?.photo?.data || formAction?.photo?.url ? (
                <div className="mb-4">
                  <span className="block text-sm font-medium text-gray-600 mb-2">
                    Current Photo
                  </span>
                  <div className="relative mb-5 md:col-span-2 flex items-center justify-center">
                    <Image
                      src={formAction?.photo?.data || formAction?.photo?.url}
                      alt={formAction.name}
                      width={0}
                      height={0}
                      sizes="100vw"
                      style={{
                        width: "50%",
                        height: "auto",
                        borderRadius: "10px",
                      }} // optional
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormAction((prev: any) => ({
                          ...prev,
                          photo: undefined,
                        }))
                      }
                      className="absolute top-0 right-0 p-1 bg-white rounded-full shadow-md hover:bg-red-950 text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <InputForm
                  type="file"
                  name="photo"
                  label="Photo (Optional)"
                  accept="image/*"
                  form={formAction}
                  setForm={setFormAction}
                />
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setFormAction({});
                    form.resetFields();
                    setShowModal("NONE");
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    formAction?._id ? updateTestimonial() : addTestimonial()
                  }
                  disabled={isPending}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? "Saving..." : formAction?._id ? "Update" : "Add"}
                </button>
              </div>
            </Form>
          </div>
        </div>
      )}

      {showModal === "DELETE" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Delete Testimonial
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this testimonial? This action
              cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFormAction({});
                  setShowModal("NONE");
                }}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(formAction?._id)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
