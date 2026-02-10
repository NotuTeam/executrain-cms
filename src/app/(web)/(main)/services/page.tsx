/** @format */
"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import {
  Briefcase,
  Plus,
  Search,
  Edit,
  Trash2,
  X,
  Upload,
  ImageIcon,
} from "lucide-react";
import { Tooltip } from "antd";

import Notification from "@/components/Notification";
import { useDebounce } from "@/hooks/useDebounce";

import {
  useServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from "./hook";

interface ServiceForm {
  service_name: string;
  service_description: string;
  logo?: File | null;
  logo_preview?: string;
  existing_logo?: {
    public_id: string;
    url: string;
  };
}

export default function ServicePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedService, setSelectedService] = useState<any>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [formData, setFormData] = useState<ServiceForm>({
    service_name: "",
    service_description: "",
    logo: null,
    logo_preview: "",
  });

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: services = [], isLoading, refetch } = useServices();
  const { mutate: createService, isPending: isCreating } = useCreateService();
  const { mutate: updateService, isPending: isUpdating } = useUpdateService();
  const { mutate: deleteService, isPending: isDeleting } = useDeleteService();

  const filteredServices = useMemo(() => {
    if (!debouncedSearchTerm) return services;

    return services.filter((service: any) =>
      service.service_name
        ?.toLowerCase()
        .includes(debouncedSearchTerm.toLowerCase()),
    );
  }, [services, debouncedSearchTerm]);

  const handleOpenAddModal = () => {
    setModalMode("add");
    setFormData({
      service_name: "",
      service_description: "",
      logo: null,
      logo_preview: "",
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (service: any) => {
    setModalMode("edit");
    setSelectedService(service);
    setFormData({
      service_name: service.service_name,
      service_description: service.service_description,
      logo: null,
      logo_preview: service.logo?.url || "",
      existing_logo: service.logo,
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedService(null);
    setFormData({
      service_name: "",
      service_description: "",
      logo: null,
      logo_preview: "",
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        logo: file,
        logo_preview: URL.createObjectURL(file),
      });
    }
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      logo: null,
      logo_preview: "",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.service_name.trim()) {
      Notification("error", "Service name is required");
      return;
    }

    if (!formData.service_description.trim()) {
      Notification("error", "Service description is required");
      return;
    }

    const payload = new FormData();
    payload.append("service_name", formData.service_name);
    payload.append("service_description", formData.service_description);

    if (formData.logo) {
      payload.append("file", formData.logo);
    }

    if (modalMode === "add") {
      createService(payload, {
        onSuccess: () => {
          Notification("success", "Service created successfully");
          refetch();
          handleCloseModal();
        },
        onError: (error: any) => {
          Notification("error", error.message || "Failed to create service");
        },
      });
    } else {
      updateService(
        { id: selectedService._id, data: payload },
        {
          onSuccess: () => {
            Notification("success", "Service updated successfully");
            refetch();
            handleCloseModal();
          },
          onError: (error: any) => {
            Notification("error", error.message || "Failed to update service");
          },
        },
      );
    }
  };

  const handleDelete = () => {
    if (!selectedService) return;

    deleteService(selectedService._id, {
      onSuccess: () => {
        Notification("success", "Service deleted successfully");
        refetch();
        setShowDeleteModal(false);
        setSelectedService(null);
      },
      onError: (error: any) => {
        Notification("error", error.message || "Failed to delete service");
      },
    });
  };

  function ServiceCard({ service }: any) {
    return (
      <div
        key={service._id}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      >
        {service.logo?.url ? (
          <div className="h-48 bg-gray-100 overflow-hidden flex items-center justify-center">
            <Image
              src={service.logo?.url}
              alt={service.service_name}
              className="w-full h-full object-contain p-4"
              width={300}
              height={200}
            />
          </div>
        ) : (
          <div className="h-48 bg-gray-100 flex items-center justify-center">
            <ImageIcon className="w-16 h-16 text-gray-700" />
          </div>
        )}

        <div className="p-6">
          <div className="mb-3">
            <Tooltip placement="top" title={service?.service_name || "-"}>
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {service.service_name}
              </h3>
            </Tooltip>
          </div>

          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {service.service_description}
          </p>

          <div className="flex gap-2 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleOpenEditModal(service)}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-950 text-primary-400 rounded-lg hover:bg-primary-900 transition-colors"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={() => {
                setSelectedService(service);
                setShowDeleteModal(true);
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
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-gray-600 mt-1">Manage your company services</p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Service
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-600" />
          <input
            type="text"
            placeholder="Search service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-100 text-gray-900 placeholder:text-gray-600"
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading ? (
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      ) : filteredServices && filteredServices.length > 0 ? (
        <>
          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.map((service: any) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              Showing {filteredServices.length} service
              {filteredServices.length !== 1 ? "s" : ""}
            </p>
          </div>
        </>
      ) : (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 flex flex-col items-center">
          <Briefcase className="w-16 h-16 text-gray-700 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No services found
          </h3>
          <p className="text-gray-600 mb-6">
            {searchTerm
              ? "Try adjusting your search"
              : "Get started by creating your first service"}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Service
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                {modalMode === "add" ? "Add New Service" : "Edit Service"}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-gray-600 hover:text-gray-800"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Service Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.service_name}
                  onChange={(e) =>
                    setFormData({ ...formData, service_name: e.target.value })
                  }
                  placeholder="e.g., Web Development"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-100 text-gray-900 placeholder:text-gray-600"
                  required
                />
              </div>

              {/* Service Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.service_description}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      service_description: e.target.value,
                    })
                  }
                  placeholder="Describe your service..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-gray-100 text-gray-900 placeholder:text-gray-600 resize-none"
                  required
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Logo
                </label>

                {formData.logo_preview ? (
                  <div className="relative w-full h-48 border-2 border-gray-300 rounded-lg overflow-hidden">
                    <Image
                      src={formData.logo_preview}
                      alt="Preview"
                      className="w-full h-full object-contain"
                      width={400}
                      height={200}
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
                    <Upload className="w-8 h-8 text-gray-600 mb-2" />
                    <span className="text-sm text-gray-600">
                      Click to upload logo
                    </span>
                    <span className="text-xs text-gray-600 mt-1">
                      PNG, JPG up to 5MB
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                  disabled={isCreating || isUpdating}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isCreating || isUpdating}
                >
                  {isCreating || isUpdating
                    ? "Saving..."
                    : modalMode === "add"
                      ? "Add Service"
                      : "Update Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
            <div className="w-12 h-12 bg-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-primary-600 hover:bg-primary-700" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Delete Service
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "
              <span className="font-semibold">
                {selectedService?.service_name}
              </span>
              "? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedService(null);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="flex-1 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isDeleting}
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
