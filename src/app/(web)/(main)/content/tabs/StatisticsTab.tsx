/** @format */

"use client";

import { useState, useEffect } from "react";
import { Form } from "antd";
import {
  Save,
  TrendingUp,
  Edit2,
  Award,
  Users,
  BookOpen,
  GraduationCap,
} from "lucide-react";
import Notification from "@/components/Notification";
import { useStatistic, useUpdateStatistic } from "../hook";

export default function StatisticsTab() {
  const [form] = Form.useForm();
  const [formData, setFormData] = useState<any>({});
  const [editingField, setEditingField] = useState<string | null>(null);
  const [tempValue, setTempValue] = useState<string>("");
  const [hasChanges, setHasChanges] = useState(false);

  const { data: statistics, isLoading, refetch } = useStatistic();
  const { mutate: update, isPending } = useUpdateStatistic();

  useEffect(() => {
    if (statistics) {
      form.setFieldsValue(statistics);
      setFormData(statistics);
      setHasChanges(false);
    }
  }, [statistics, form]);

  const handleSubmit = async () => {
    try {
      await form.validateFields();

      update(formData, {
        onSuccess: () => {
          Notification("success", "Statistics updated successfully");
          setHasChanges(false);
          refetch();
        },
        onError: (error: any) => {
          Notification("error", error.message || "Failed to update statistics");
        },
      });
    } catch (error) {
      Notification("error", "Please fill in all required fields");
    }
  };

  const handleEdit = (field: string, value: number) => {
    setEditingField(field);
    setTempValue(value.toString());
  };

  const handleSaveField = (field: string) => {
    const numValue = parseFloat(tempValue) || 0;
    let finalValue = numValue;

    setFormData((prev: any) => ({
      ...prev,
      [field]: finalValue,
    }));
    setHasChanges(true);
    setEditingField(null);
    setTempValue("");
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setTempValue("");
  };

  const statCards = [
    {
      field: "year_experience",
      label: "Years of Experience",
      value: formData.year_experience || 0,
      unit: "Years",
      icon: Award,
      color: "blue",
    },
    {
      field: "total_participant",
      label: "Total Participants",
      value: formData.total_participant || 0,
      unit: "Participants",
      icon: Users,
      color: "green",
    },
    {
      field: "total_topic_class",
      label: "Topic Classes",
      value: formData.total_topic_class || 0,
      unit: "Topics",
      icon: BookOpen,
      color: "purple",
    },
    {
      field: "total_training_completed",
      label: "Training Completed",
      value: formData.total_training_completed || 0,
      unit: "Trainings",
      icon: GraduationCap,
      color: "orange",
    },
  ];

  const getColorClasses = (color: string) => {
    const colors: any = {
      blue: {
        bg: "bg-blue-50",
        border: "border-blue-200",
        text: "text-blue-500",
        hover: "hover:border-blue-300",
        icon: "bg-blue-100",
      },
      green: {
        bg: "bg-green-50",
        border: "border-green-200",
        text: "text-green-600",
        hover: "hover:border-green-300",
        icon: "bg-green-100",
      },
      purple: {
        bg: "bg-purple-50",
        border: "border-purple-200",
        text: "text-purple-600",
        hover: "hover:border-purple-300",
        icon: "bg-purple-100",
      },
      orange: {
        bg: "bg-orange-50",
        border: "border-orange-200",
        text: "text-orange-600",
        hover: "hover:border-orange-300",
        icon: "bg-orange-100",
      },
    };
    return colors[color];
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 bg-gray-100 rounded-xl"></div>
        <div className="h-32 bg-gray-100 rounded-xl"></div>
        <div className="h-32 bg-gray-100 rounded-xl"></div>
        <div className="h-32 bg-gray-100 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 p-4 bg-primary-50 rounded-xl border border-primary-200">
          <TrendingUp className="w-5 h-5 text-primary-600" />
          <h3 className="font-semibold text-primary-700">Company Statistic</h3>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </div>
      {hasChanges && (
        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-yellow-900 mb-1">
                Unsaved Changes
              </h4>
              <p className="text-sm text-yellow-800">
                You have unsaved changes. Click "Save Changes" button to persist
                your modifications.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setFormData(statistics);
                setHasChanges(false);
              }}
              className="text-yellow-600 hover:text-yellow-800 transition-colors text-sm font-medium"
            >
              Discard
            </button>
          </div>
        </div>
      )}
      <Form form={form} layout="vertical" requiredMark={false}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {statCards.map((stat) => {
            const Icon = stat.icon;
            const colors = getColorClasses(stat.color);
            const isEditing = editingField === stat.field;

            return (
              <div
                key={stat.field}
                className={`${colors.bg} ${colors.border} ${colors.hover} border-2 rounded-2xl p-6 transition-all hover:shadow-md`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className={`${colors.icon} p-3 rounded-xl`}>
                    <Icon className={`w-6 h-6 ${colors.text}`} />
                  </div>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => handleEdit(stat.field, stat.value)}
                      className={`p-2 hover:bg-white rounded-lg transition-colors ${colors.text}`}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>

                  {isEditing ? (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={tempValue}
                          onChange={(e) => setTempValue(e.target.value)}
                          className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 text-2xl font-bold"
                          placeholder="0"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleSaveField(stat.field);
                            } else if (e.key === "Escape") {
                              handleCancelEdit();
                            }
                          }}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveField(stat.field)}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-slate-200 text-gray-600 rounded-lg hover:bg-slate-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className={`text-4xl font-bold ${colors.text}`}>
                        {stat.value}
                      </div>
                      <p className="text-sm text-gray-600">{stat.unit}</p>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </Form>
    </div>
  );
}
