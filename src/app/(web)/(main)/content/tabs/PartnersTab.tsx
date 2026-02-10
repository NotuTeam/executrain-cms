/** @format */

"use client";

import { useState } from "react";
import { Form } from "antd";
import { Plus, Edit, Trash2, Building2, X } from "lucide-react";
import Image from "next/image";
import InputForm from "@/components/Form";
import Notification from "@/components/Notification";
import {
  usePartner,
  useCreatePartner,
  useUpdatePartner,
  useDeletePartner,
} from "../hook";

export default function PartnersTab() {
  const [showModal, setShowModal] = useState<"NONE" | "DELETE" | "INPUT">(
    "NONE",
  );
  const [formAction, setFormAction] = useState<any>({});
  const [form] = Form.useForm();

  const { data: partners = [], isLoading, refetch } = usePartner();
  const { mutate: add, isPending: isCreating } = useCreatePartner();
  const { mutate: update, isPending: isUpdating } = useUpdatePartner();
  const { mutate: deletePartner, isPending: isDeleting } = useDeletePartner();

  const handleDelete = () => {
    deletePartner(formAction?._id, {
      onSuccess: () => {
        Notification("success", "Partner deleted successfully");
        setShowModal("NONE");
        setFormAction({});
        refetch();
      },
      onError: (error: any) => {
        Notification("error", error.message || "Failed to delete partner");
      },
    });
  };

  async function addPartner() {
    try {
      await form.validateFields();

      const formData = new FormData();
      formData.append("partner_name", formAction.partner_name);

      if (formAction?.logo?.file) {
        formData.append("file", formAction?.logo?.file ?? null);
      } else {
        const parsed = JSON.stringify(formAction?.logo);
        formData.append("logo", parsed);
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

  async function updatePartner() {
    try {
      await form.validateFields();

      const formData = new FormData();
      formData.append("partner_name", formAction.partner_name);

      if (formAction?.logo?.file) {
        formData.append("file", formAction?.logo?.file ?? null);
      } else {
        const parsed = JSON.stringify(formAction?.logo);
        formData.append("logo", parsed);
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
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="animate-pulse h-40 bg-gray-100 rounded-xl"
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
            <h3 className="font-semibold text-blue-900">Partner Management</h3>
          </div>
        </div>
        <button
          onClick={() => setShowModal("INPUT")}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Partner
        </button>
      </div>

      {partners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {partners.map((partner: any) => (
            <div
              key={partner._id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all"
            >
              <div className="relative h-32 bg-gray-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {partner?.logo?.url ? (
                  <Image
                    src={partner?.logo?.url}
                    alt={partner.partner_name}
                    width={120}
                    height={120}
                    className="object-contain max-h-full"
                  />
                ) : (
                  <Building2 className="w-12 h-12 text-gray-600" />
                )}
              </div>
              <h3 className="font-semibold text-gray-900 text-center mb-3 truncate">
                {partner?.partner_name}
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowModal("INPUT");
                    setFormAction(partner);
                    form.setFieldsValue(partner);
                  }}
                  className="flex-1 p-2 text-primary-500 hover:bg-primary-950 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 mx-auto" />
                </button>
                <button
                  onClick={() => {
                    setShowModal("DELETE");
                    setFormAction(partner);
                  }}
                  className="flex-1 p-2 text-red-600 hover:bg-red-950 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4 mx-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-100 rounded-xl border border-gray-200">
          <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No partners yet
          </h3>
          <p className="text-gray-600 mb-6">
            Start by adding your first partner
          </p>
          <button
            onClick={() => setShowModal("INPUT")}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Partner
          </button>
        </div>
      )}

      {showModal === "INPUT" && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              {formAction?._id ? "Edit Partner" : "Add New Partner"}
            </h2>

            <Form form={form} layout="vertical" requiredMark={false}>
              <InputForm
                type="text"
                name="partner_name"
                label="Partner Name"
                placeholder="Enter partner name"
                required
                form={formAction}
                setForm={setFormAction}
              />

              {formAction?.logo?.data || formAction?.logo?.url ? (
                <div className="mb-4">
                  <span className="block text-sm font-medium text-gray-600 mb-2">
                    Current Logo
                  </span>
                  <div className="relative mb-5 md:col-span-2 flex items-center justify-center">
                    <Image
                      src={formAction?.logo?.data || formAction?.logo?.url}
                      alt={formAction.partner_name}
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
                          logo: undefined,
                        }))
                      }
                      className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-red-950 text-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <InputForm
                  type="file"
                  name="logo"
                  label="Partner Logo"
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
                    setShowModal("NONE");
                    form.resetFields();
                  }}
                  className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                  disabled={isPending}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() =>
                    formAction?._id ? updatePartner() : addPartner()
                  }
                  disabled={isPending}
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                >
                  {isPending ? "Saving..." : false ? "Update" : "Add"}
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
              Delete Partner
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this partner? This action cannot
              be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal("NONE");
                  setFormAction({});
                }}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete()}
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
