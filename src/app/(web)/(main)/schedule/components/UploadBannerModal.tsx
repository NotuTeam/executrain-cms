/** @format */

import { useState } from "react";
import Image from "next/image";
import { X, Upload, Check } from "lucide-react";
import Notification from "@/components/Notification";
import { useUpdateSchedule } from "../hook";
import dayjs from "dayjs";

interface UploadedSchedule {
  _id: string;
  schedule_name: string;
  schedule_description: string;
  schedule_date: string;
  schedule_close_registration_date: string;
  schedule_start: string;
  schedule_end: string;
  location: string;
  quota: number;
  duration: number;
  is_assestment: boolean;
  benefits: string[];
  skill_level: string;
  language: string;
  status: string;
  banner?: {
    url?: string;
  };
}

interface UploadBannerModalProps {
  schedules: UploadedSchedule[];
  onClose: () => void;
  onComplete: () => void;
}

export default function UploadBannerModal({
  schedules,
  onClose,
  onComplete,
}: UploadBannerModalProps) {
  const [uploadedBanners, setUploadedBanners] = useState<{
    [key: string]: { file: File; preview: string };
  }>({});
  const [savedBanners, setSavedBanners] = useState<Set<string>>(new Set());

  const { mutate: updateSchedule, isPending } = useUpdateSchedule();

  const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB in bytes

  const handleFileSelect = (scheduleId: string, file: File) => {
    if (file) {
      if (file.size > MAX_FILE_SIZE) {
        Notification("error", "Ukuran file maksimal 2MB");
        return;
      }
      const preview = URL.createObjectURL(file);
      setUploadedBanners((prev) => ({
        ...prev,
        [scheduleId]: { file, preview },
      }));
    }
  };

  const handleRemoveBanner = (scheduleId: string) => {
    if (uploadedBanners[scheduleId]) {
      URL.revokeObjectURL(uploadedBanners[scheduleId].preview);
    }
    setUploadedBanners((prev) => {
      const newState = { ...prev };
      delete newState[scheduleId];
      return newState;
    });
    setSavedBanners((prev) => {
      const newSet = new Set(prev);
      newSet.delete(scheduleId);
      return newSet;
    });
  };

  const handleSaveBanner = async (schedule: UploadedSchedule) => {
    const bannerData = uploadedBanners[schedule._id];
    if (!bannerData) {
      Notification("error", "Please select a banner first");
      return;
    }

    const formData = new FormData();

    // Add all required fields from schedule
    formData.append("schedule_name", schedule.schedule_name);
    formData.append("schedule_description", schedule.schedule_description);
    formData.append("schedule_date", schedule.schedule_date);
    formData.append(
      "schedule_close_registration_date",
      schedule.schedule_close_registration_date
    );
    formData.append("location", schedule.location);
    formData.append("schedule_start", schedule.schedule_start);
    formData.append("schedule_end", schedule.schedule_end);
    formData.append("skill_level", schedule.skill_level);
    formData.append("status", schedule.status);
    formData.append("language", schedule.language);
    formData.append("quota", String(schedule.quota));
    formData.append("duration", String(schedule.duration));
    formData.append("is_assestment", String(schedule.is_assestment));

    // Add benefits
    if (schedule.benefits && schedule.benefits.length > 0) {
      schedule.benefits.forEach((benefit: string) => {
        formData.append("benefits", benefit);
      });
    }

    // Add banner file
    formData.append("file", bannerData.file);

    updateSchedule(
      { id: schedule._id, data: formData },
      {
        onSuccess: () => {
          Notification(
            "success",
            `Banner uploaded for ${schedule.schedule_name}`
          );
          setSavedBanners((prev) => new Set(prev).add(schedule._id));
        },
        onError: () => {
          Notification("error", "Failed to upload banner");
        },
      }
    );
  };

  const handleComplete = () => {
    // Clean up all preview URLs
    Object.values(uploadedBanners).forEach((banner) => {
      URL.revokeObjectURL(banner.preview);
    });
    onComplete();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Upload Banners for Schedules
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {schedules.length} schedules uploaded successfully. Add banners
              for each schedule (optional).
            </p>
          </div>
          <button
            onClick={handleComplete}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {schedules.map((schedule) => {
              const hasBanner = uploadedBanners[schedule._id];
              const isSaved = savedBanners.has(schedule._id);

              return (
                <div
                  key={schedule._id}
                  className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    {/* Schedule Info */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {schedule.schedule_name}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                            {schedule.schedule_description}
                          </p>
                        </div>
                        {isSaved && (
                          <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                            <Check className="w-3 h-3" />
                            Saved
                          </span>
                        )}
                      </div>

                      {/* Banner Upload Area */}
                      <div className="mt-3">
                        {hasBanner ? (
                          <div className="relative group">
                            <Image
                              src={hasBanner.preview}
                              alt="Banner preview"
                              width={400}
                              height={200}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={() => handleRemoveBanner(schedule._id)}
                              className="absolute top-2 right-2 p-1 bg-red-9500 text-white rounded-full hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                            <Upload className="w-6 h-6 text-gray-600 mb-2" />
                            <span className="text-sm text-gray-600">
                              Click to upload banner
                            </span>
                            <span className="text-xs text-gray-600 mt-1">
                              PNG, JPG maksimal 2MB
                            </span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  handleFileSelect(schedule._id, file);
                                }
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>

                      {/* Save Button */}
                      {hasBanner && !isSaved && (
                        <button
                          onClick={() => handleSaveBanner(schedule)}
                          disabled={isPending}
                          className="mt-3 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isPending ? "Saving..." : "Save Banner"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              {savedBanners.size} of {schedules.length} banners uploaded
            </p>
            <button
              onClick={handleComplete}
              className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
