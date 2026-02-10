/** @format */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ArrowLeft, Plus, X } from "lucide-react";
import { Form } from "antd";
import InputForm from "@/components/Form";

import { useCreateCareer, useCareerDetail, useUpdateCareer } from "../hook";
import Notification from "@/components/Notification";

const JOB_TYPES = [
  "FULL_TIME",
  "PART_TIME",
  "CONTRACT",
  "INTERNSHIP",
  "FREELANCE",
];

const EXPERIENCE_LEVELS = ["ENTRY", "MID", "SENIOR", "LEAD", "EXECUTIVE"];

const JOB_STATUS = ["DRAFT", "PUBLISHED", "CLOSED", "ARCHIVED"];

export default function CareerEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const careerId = searchParams.get("id");

  const [form] = Form.useForm();

  const { data: existingCareer } = useCareerDetail(careerId || "");
  const { mutate: createCareer, isPending: isCreating } = useCreateCareer();
  const { mutate: updateCareer, isPending: isUpdating } = useUpdateCareer();

  const [formAction, setFormAction] = useState<any>({
    description: [],
    requirements: [],
    experiance_requirement: [],
    applicant_question: [],
  });

  const [newDescription, setNewDescription] = useState({ description: null });
  const [newRequirement, setNewRequirement] = useState({ requirement: null });
  const [newExperianceRequirement, setNewExperianceRequirement] = useState({
    experiance_requirement: null,
  });
  const [newApplicantQuestion, setNewApplicantQuestion] = useState({
    applicant_question: null,
  });

  useEffect(() => {
    if (existingCareer) {
      form.setFieldsValue(existingCareer);
      setFormAction(existingCareer);
    }
  }, [existingCareer]);

  const handleAddRequirement = () => {
    if (!newRequirement?.requirement) {
      return;
    }

    if (formAction?.requirements && formAction.requirements.length >= 10) {
      Notification("error", "Maximum 10 requirements allowed");
      return;
    }

    setFormAction((prev: any) => ({
      ...prev,
      requirements: [...prev?.requirements, newRequirement.requirement],
    }));
    setNewRequirement({ requirement: null });
    form.setFieldValue("requirement", undefined);
  };

  const handleRemoveRequirement = (index: number) => {
    setFormAction((prev: any) => ({
      ...prev,
      requirements: prev?.requirements?.filter(
        (_: string, i: number) => i !== index,
      ),
    }));
  };

  const handleAddDescription = () => {
    if (!newDescription?.description) {
      return;
    }

    if (formAction?.description && formAction.description.length >= 10) {
      Notification("error", "Maximum 10 description paragraphs allowed");
      return;
    }

    setFormAction((prev: any) => ({
      ...prev,
      description: [...prev?.description, newDescription.description],
    }));
    setNewDescription({ description: null });
    form.setFieldValue("description", undefined);
  };

  const handleRemoveDescription = (index: number) => {
    setFormAction((prev: any) => ({
      ...prev,
      description: prev?.description?.filter(
        (_: string, i: number) => i !== index,
      ),
    }));
  };

  const handleAddExperianceRequirement = () => {
    if (!newExperianceRequirement?.experiance_requirement) {
      return;
    }

    if (
      formAction?.experiance_requirement &&
      formAction.experiance_requirement.length >= 10
    ) {
      Notification("error", "Maximum 10 experience requirements allowed");
      return;
    }

    setFormAction((prev: any) => ({
      ...prev,
      experiance_requirement: [
        ...prev?.experiance_requirement,
        newExperianceRequirement.experiance_requirement,
      ],
    }));
    setNewExperianceRequirement({ experiance_requirement: null });
    form.setFieldValue("experiance_requirement", undefined);
  };

  const handleRemoveExperianceRequirement = (index: number) => {
    setFormAction((prev: any) => ({
      ...prev,
      experiance_requirement: prev?.experiance_requirement?.filter(
        (_: string, i: number) => i !== index,
      ),
    }));
  };

  const handleAddApplicantQuestion = () => {
    if (!newApplicantQuestion?.applicant_question) {
      return;
    }

    if (
      formAction?.applicant_question &&
      formAction.applicant_question.length >= 10
    ) {
      Notification("error", "Maximum 10 applicant questions allowed");
      return;
    }

    setFormAction((prev: any) => ({
      ...prev,
      applicant_question: [
        ...prev?.applicant_question,
        newApplicantQuestion.applicant_question,
      ],
    }));
    setNewApplicantQuestion({ applicant_question: null });
    form.setFieldValue("applicant_question", undefined);
  };

  const handleRemoveApplicantQuestion = (index: number) => {
    setFormAction((prev: any) => ({
      ...prev,
      applicant_question: prev?.applicant_question?.filter(
        (_: string, i: number) => i !== index,
      ),
    }));
  };

  const handleSaveCareer = async (status: string) => {
    try {
      // Validate salary before saving
      if (
        formAction.salary_min !== undefined &&
        formAction.salary_min !== null &&
        formAction.salary_min < 0
      ) {
        Notification("error", "Minimum salary cannot be less than 0");
        return;
      }

      if (
        formAction.salary_max !== undefined &&
        formAction.salary_max !== null &&
        formAction.salary_max < 0
      ) {
        Notification("error", "Maximum salary cannot be less than 0");
        return;
      }

      if (
        formAction.salary_min !== undefined &&
        formAction.salary_min !== null &&
        formAction.salary_max !== undefined &&
        formAction.salary_max !== null &&
        formAction.salary_max < formAction.salary_min
      ) {
        Notification(
          "error",
          "Maximum salary must be greater than minimum salary",
        );
        return;
      }

      const values = await form.validateFields();

      const formData = new FormData();

      formData.append("title", formAction.title);

      // description is now an array of strings (paragraphs)
      if (Array.isArray(formAction.description)) {
        formAction.description.forEach((desc: string) => {
          formData.append("description", desc);
        });
      } else {
        formData.append("description", formAction.description || "");
      }

      formAction.requirements?.forEach((req: string) => {
        formData.append("requirements", req);
      });

      formAction.experiance_requirement?.forEach((exp: string) => {
        formData.append("experiance_requirement", exp);
      });

      formAction.applicant_question?.forEach((q: string) => {
        formData.append("applicant_question", q);
      });

      formData.append("location", formAction.location);
      formData.append("job_type", formAction.job_type);
      formData.append("experience_level", formAction.experience_level);

      if (formAction.salary_min) {
        formData.append("salary_min", formAction.salary_min);
      }
      if (formAction.salary_max) {
        formData.append("salary_max", formAction.salary_max);
      }

      if (formAction.vacancies) {
        formData.append("vacancies", formAction.vacancies);
      }

      formData.append("status", status);

      if (careerId) {
        updateCareer(
          { id: careerId, data: formData },
          {
            onSuccess: () => {
              Notification("success", "Success Update Career");
              router.push("/career");
            },
            onError: (error: any) => {
              Notification("error", error.message || "Failed to Update Career");
            },
          },
        );
      } else {
        createCareer(formData, {
          onSuccess: () => {
            Notification("success", "Success Add Career");
            router.push("/career");
          },
          onError: (error: any) => {
            Notification("error", error.message || "Failed to Add Career");
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
            {careerId ? "Edit Job Posting" : "Add New Job Posting"}
          </h1>
          <p className="text-gray-600 text-sm">
            {careerId
              ? "Update job posting details"
              : "Fill in the job posting details"}
          </p>
        </div>
      </div>

      <Form
        requiredMark={false}
        form={form}
        layout="vertical"
        className="space-y-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Basic Information
              </h2>
              <div className="space-y-4">
                <InputForm
                  type="text"
                  name="title"
                  label="Job Title"
                  placeholder="e.g. Senior Frontend Developer"
                  required
                  form={formAction}
                  setForm={setFormAction}
                />
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 pt-6 pb-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Job Description
                </h2>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    formAction?.description?.length >= 10
                      ? "bg-red-100 text-red-400"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {formAction?.description?.length || 0} / 10
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2 items-start">
                  <div className="flex-grow">
                    <InputForm
                      type="text"
                      name="description"
                      label=""
                      placeholder="Add a description paragraph..."
                      form={newDescription}
                      setForm={(e: any) => setNewDescription(e)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddDescription}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>

                {formAction?.description?.length > 0 && (
                  <div className="space-y-2 pb-3">
                    {formAction?.description?.map(
                      (desc: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-200"
                        >
                          <span className="text-gray-600">{desc}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveDescription(index)}
                            className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 pt-6 pb-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Requirements
                </h2>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    formAction?.requirements?.length >= 10
                      ? "bg-red-100 text-red-400"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {formAction?.requirements?.length || 0} / 10
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2 items-start">
                  <div className="flex-grow">
                    <InputForm
                      type="text"
                      name="requirement"
                      label=""
                      placeholder="Add a requirement..."
                      form={newRequirement}
                      setForm={(e: any) => setNewRequirement(e)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddRequirement}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>

                {formAction?.requirements?.length > 0 && (
                  <div className="space-y-2 pb-3">
                    {formAction?.requirements?.map(
                      (requirement: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-200"
                        >
                          <span className="text-gray-600">{requirement}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(index)}
                            className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Experience Requirements */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 pt-6 pb-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Experience Requirements
                </h2>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    formAction?.experiance_requirement?.length >= 10
                      ? "bg-red-100 text-red-400"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {formAction?.experiance_requirement?.length || 0} / 10
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2 items-start">
                  <div className="flex-grow">
                    <InputForm
                      type="text"
                      name="experiance_requirement"
                      label=""
                      placeholder="Add an experience requirement..."
                      form={newExperianceRequirement}
                      setForm={(e: any) => setNewExperianceRequirement(e)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddExperianceRequirement}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>

                {formAction?.experiance_requirement?.length > 0 && (
                  <div className="space-y-2 pb-3">
                    {formAction?.experiance_requirement?.map(
                      (exp: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-200"
                        >
                          <span className="text-gray-600">{exp}</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleRemoveExperianceRequirement(index)
                            }
                            className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Applicant Questions */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 pt-6 pb-3">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Applicant Questions
                </h2>
                <span
                  className={`text-sm font-medium px-3 py-1 rounded-full ${
                    formAction?.applicant_question?.length >= 10
                      ? "bg-red-100 text-red-400"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {formAction?.applicant_question?.length || 0} / 10
                </span>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2 items-start">
                  <div className="flex-grow">
                    <InputForm
                      type="text"
                      name="applicant_question"
                      label=""
                      placeholder="Add a question for applicants..."
                      form={newApplicantQuestion}
                      setForm={(e: any) => setNewApplicantQuestion(e)}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddApplicantQuestion}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add
                  </button>
                </div>

                {formAction?.applicant_question?.length > 0 && (
                  <div className="space-y-2 pb-3">
                    {formAction?.applicant_question?.map(
                      (question: string, index: number) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-200"
                        >
                          <span className="text-gray-600">{question}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveApplicantQuestion(index)}
                            className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Job Details */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Job Details
              </h2>
              <div className="space-y-4">
                <InputForm
                  type="text"
                  name="location"
                  label="Location"
                  placeholder="e.g. Jakarta, Indonesia"
                  required
                  form={formAction}
                  setForm={(e: any) => setFormAction(e)}
                />
                <InputForm
                  type="select"
                  name="job_type"
                  label="Job Type"
                  placeholder="Choose job type"
                  required
                  form={formAction}
                  setForm={(e: any) => setFormAction(e)}
                  options={JOB_TYPES.map((type) => ({
                    label: type.replace("_", " "),
                    value: type,
                  }))}
                />
                <InputForm
                  type="select"
                  name="experience_level"
                  label="Experience Level"
                  placeholder="Choose experience level"
                  required
                  form={formAction}
                  setForm={(e: any) => setFormAction(e)}
                  options={EXPERIENCE_LEVELS.map((level) => ({
                    label: level,
                    value: level,
                  }))}
                />
              </div>
            </div>

            {/* Salary & Vacancies */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                Compensation
              </h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <InputForm
                    type="number"
                    name="salary_min"
                    label="Min Salary"
                    placeholder="Min"
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                  />
                  <InputForm
                    type="number"
                    name="salary_max"
                    label="Max Salary"
                    placeholder="Max"
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                  />
                </div>
                <InputForm
                  type="number"
                  name="vacancies"
                  label="Number of Vacancies"
                  placeholder="e.g. 1"
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
                onClick={() => handleSaveCareer("PUBLISHED")}
                disabled={isCreating || isUpdating}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating || isUpdating ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {careerId ? "Updating..." : "Publishing..."}
                  </>
                ) : (
                  <>{careerId ? "Update Job" : "Publish Job"}</>
                )}
              </button>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
