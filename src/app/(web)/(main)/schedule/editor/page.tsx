/** @format */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ArrowLeft, Plus, X } from "lucide-react";
import { Form, Row, Col } from "antd";
import InputForm from "@/components/Form";

import {
  useCreateSchedule,
  useSchedulesDetail,
  useUpdateSchedule,
} from "../hook";
import { useProducts } from "../../product/hook";

import Image from "next/image";
import Notification from "@/components/Notification";

import dayjs from "dayjs";

const AVAILABILITY = ["Full Booked", "Open Seat"];

const SKILL_LEVELS = ["Beginner", "Intermediate", "Expert", "All Level"];

const LANGUAGES = ["Indonesia", "Inggris"];

export default function ScheduleEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const scheduleId = searchParams.get("id");
  const defaultDate = searchParams.get("date");
  const defaultProductId = searchParams.get("product_id");

  const [form] = Form.useForm();

  const { data: existingSchedule } = useSchedulesDetail(scheduleId || "");
  const { mutate: createSchedule, isPending: isCreating } = useCreateSchedule();
  const { mutate: updateSchedule, isPending: isUpdating } = useUpdateSchedule();
  const { data: productsData } = useProducts();

  const products = productsData?.pages?.flatMap((page: any) => page.data) || [];

  const [formAction, setFormAction] = useState<any>({ benefits: [] });

  const [newBenefit, setNewBenefit] = useState({ benefit: null });

  useEffect(() => {
    if (existingSchedule && scheduleId) {
      const initalData = {
        ...existingSchedule,
        schedule_start: dayjs(existingSchedule.schedule_start, "HH:mm"),
        schedule_end: dayjs(existingSchedule.schedule_end, "HH:mm"),
        schedule_date: dayjs(existingSchedule.schedule_date),
        schedule_close_registration_date: dayjs(
          existingSchedule.schedule_close_registration_date,
        ),
        product_id:
          existingSchedule.product_id?._id || existingSchedule.product_id,
      };

      form.setFieldsValue(initalData);
      setFormAction(initalData);
    } else if ((defaultDate || defaultProductId) && !scheduleId) {
      const initialData = {
        benefits: [],
        schedule_date: defaultDate ? dayjs(defaultDate) : undefined,
        product_id: defaultProductId,
      };
      form.setFieldsValue(initialData);
      setFormAction(initialData);
    } else {
      form.resetFields();
      setFormAction({ benefits: [] });
    }
  }, [existingSchedule, defaultDate, defaultProductId, scheduleId]);

  const handleAddBenefit = () => {
    if (!newBenefit?.benefit) {
      return;
    }

    // Check if benefits already has 4 items (maximum limit)
    if (formAction?.benefits && formAction.benefits.length >= 4) {
      Notification(
        "error",
        "Maximum 4 benefits allowed. Please remove one to add new benefit.",
      );
      return;
    }

    setFormAction((prev: any) => ({
      ...prev,
      benefits: [...prev?.benefits, newBenefit.benefit],
    }));
    setNewBenefit({ benefit: null });
    form.setFieldValue("benefit", undefined);
  };

  const handleRemoveBenefit = (index: number) => {
    setFormAction((prev: any) => ({
      ...prev,
      benefits: prev?.benefits?.filter((_: string, i: number) => i !== index),
    }));
  };

  const handleAddSchedule = async () => {
    try {
      await form.validateFields();

      const formData = new FormData();

      formData.append("schedule_name", formAction.schedule_name);
      formData.append("schedule_description", formAction.schedule_description);
      formData.append("schedule_date", formAction.schedule_date);
      formData.append(
        "schedule_close_registration_date",
        formAction.schedule_close_registration_date,
      );
      formData.append("location", formAction.location);
      formData.append("schedule_start", formAction.schedule_start);
      formData.append("schedule_end", formAction.schedule_end);
      formData.append("skill_level", formAction.skill_level);
      formData.append("status", formAction.status);
      formData.append("language", formAction.language);
      formData.append("quota", formAction.quota);
      formData.append("duration", formAction.duration);
      formData.append("link", formAction.link || "");
      formData.append(
        "is_assestment",
        formAction.is_assestment ? "true" : "false",
      );

      formAction.benefits?.forEach((benefit: string) => {
        formData.append("benefits", benefit);
      });

      formData.append("product_id", formAction.product_id);

      createSchedule(formData, {
        onSuccess: () => {
          Notification("success", "Success Add New Schedule");
          router.back();
          form.resetFields();
          setFormAction({ benefits: [] });
        },
        onError: (e) => {
          Notification("error", "Failed to Add New Schedule");
          console.log(e);
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleUpdateSchedule = async () => {
    if (!scheduleId) return;

    try {
      await form.validateFields();

      const formData = new FormData();

      formData.append("schedule_name", formAction.schedule_name);
      formData.append("schedule_description", formAction.schedule_description);
      formData.append("schedule_date", formAction.schedule_date);
      formData.append(
        "schedule_close_registration_date",
        formAction.schedule_close_registration_date,
      );
      formData.append("location", formAction.location);
      formData.append(
        "schedule_start",
        typeof formAction.schedule_start === "string"
          ? formAction.schedule_start
          : dayjs(formAction.schedule_start).format("HH:mm"),
      );
      formData.append(
        "schedule_end",
        typeof formAction.schedule_end === "string"
          ? formAction.schedule_end
          : dayjs(formAction.schedule_end).format("HH:mm"),
      );
      formData.append("skill_level", formAction.skill_level);
      formData.append("status", formAction.status);
      formData.append("language", formAction.language);
      formData.append("quota", formAction.quota);
      formData.append("duration", formAction.duration);
      formData.append("link", formAction.link || "");
      formData.append(
        "is_assestment",
        formAction.is_assestment ? "true" : "false",
      );

      formAction.benefits?.forEach((benefit: string) => {
        formData.append("benefits", benefit);
      });

      formData.append("product_id", formAction.product_id);

      updateSchedule(
        { id: scheduleId, data: formData },
        {
          onSuccess: () => {
            Notification("success", "Success to Update Schedule");
            router.back();
            form.resetFields();
            setFormAction({ benefits: [] });
          },
          onError: (e) => {
            Notification("error", "Failed to Update Schedule");
            console.log(e);
          },
        },
      );
    } catch (e) {
      console.log(e);
    }
  };

  const isPending = isCreating || isUpdating;

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              {scheduleId ? "Edit Schedule" : "Add Schedule"}
            </h1>
            <p className="text-gray-600 mt-1">
              {scheduleId
                ? "Update schedule information"
                : "Add a new schedule or agenda"}
            </p>
          </div>
        </div>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          className="space-y-8"
        >
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Basic Information
            </h2>
            <div className="space-y-4">
              <InputForm
                type="select"
                name="product_id"
                label="Product (Required)"
                placeholder="Select a product for this schedule"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
                options={products.map((product: any) => ({
                  label: product.product_name,
                  value: product._id,
                }))}
              />
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <InputForm
                    type="text"
                    name="schedule_name"
                    label="Schedule Name"
                    placeholder="Enter schedule name"
                    required
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                  />
                </Col>
                <Col span={12}>
                  <InputForm
                    type="text"
                    name="location"
                    label="Location"
                    placeholder="Enter Location"
                    required
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                  />
                </Col>
              </Row>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <InputForm
                    type="date"
                    name="schedule_date"
                    label="Date"
                    placeholder="Enter Date"
                    required
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                  />
                </Col>
                <Col span={12}>
                  <InputForm
                    type="date"
                    name="schedule_close_registration_date"
                    label="Close Registration"
                    placeholder="Enter Date"
                    required
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                  />
                </Col>
              </Row>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <InputForm
                    type="time"
                    name="schedule_start"
                    label="Start"
                    placeholder="Enter time start"
                    required
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                  />
                </Col>
                <Col span={12}>
                  <InputForm
                    type="time"
                    name="schedule_end"
                    label="End"
                    placeholder="Enter time end"
                    required
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                  />
                </Col>
              </Row>
              <InputForm
                type="textarea"
                name="schedule_description"
                label="Schedule Overview"
                placeholder="Enter product overview"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="text"
                name="link"
                label="Redirect Link (Optional)"
                placeholder="https://example.com or leave empty"
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 pt-6 pb-3">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Benefits</h2>
              <span
                className={`text-sm font-medium px-3 py-1 rounded-full ${
                  formAction?.benefits?.length >= 4
                    ? "bg-red-100 text-red-400"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {formAction?.benefits?.length || 0} / 4
              </span>
            </div>
            <div className="space-y-3">
              <div className="flex gap-2 items-start">
                <div className="flex-grow">
                  <InputForm
                    type="text"
                    name="benefit"
                    label=""
                    placeholder="Add a benefit..."
                    form={newBenefit}
                    setForm={(e: any) => setNewBenefit(e)}
                  />
                </div>
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Add
                </button>
              </div>

              {formAction?.benefits?.length > 0 && (
                <div className="space-y-2 pb-3">
                  {formAction?.benefits?.map(
                    (benefit: string, index: number) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-gray-100 rounded-lg border border-gray-200"
                      >
                        <span className="text-gray-600">{benefit}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBenefit(index)}
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

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Schedule Details
            </h2>

            <div className="space-y-4">
              <Row className="pt-5" gutter={[12, 12]}>
                <Col span={12}>
                  <InputForm
                    type="select"
                    name="skill_level"
                    label="Skill Level"
                    placeholder="Choose skill level"
                    required
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                    options={SKILL_LEVELS.map((type: string) => ({
                      label: type,
                      value: type.replace(" ", "_").toUpperCase(),
                    }))}
                  />
                </Col>
                <Col span={12}>
                  <InputForm
                    type="select"
                    name="language"
                    label="Language"
                    placeholder="Choose language"
                    required
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                    options={LANGUAGES.map((type: string) => ({
                      label: type,
                      value: type.replace(" ", "_").toUpperCase(),
                    }))}
                  />
                </Col>
              </Row>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <InputForm
                    type="number"
                    name="quota"
                    label="Max Quota"
                    placeholder="Enter max quota"
                    required
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                  />
                </Col>
                <Col span={12}>
                  <InputForm
                    type="number"
                    name="duration"
                    label="Duration (minutes)"
                    placeholder="Enter duration in minutes"
                    required
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                  />
                </Col>
              </Row>
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <InputForm
                    type="select"
                    name="status"
                    label="Status Availability"
                    placeholder="Choose status availability"
                    required
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                    options={AVAILABILITY.map((type: string) => ({
                      label: type,
                      value: type.replace(" ", "_").toUpperCase(),
                    }))}
                  />
                </Col>
                <Col span={12}>
                  <InputForm
                    type="checkbox"
                    name="is_assestment"
                    label="Assestment"
                    placeholder="Is provide an assestment?"
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                  />
                </Col>
              </Row>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Product Information</h2>
            
            {formAction.product_id ? (
              <div className="space-y-3">
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">
                    This schedule is linked to a product. The product's banner and information will be used.
                  </p>
                  {(() => {
                    const selectedProduct = products.find((p: any) => p._id === formAction.product_id);
                    if (selectedProduct) {
                      return (
                        <div className="mt-3 space-y-2">
                          <div className="flex items-start gap-3">
                            {selectedProduct.banner?.url && (
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <Image
                                  src={selectedProduct.banner.url}
                                  alt={selectedProduct.product_name}
                                  width={64}
                                  height={64}
                                  className="object-cover"
                                />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-900">
                                {selectedProduct.product_name}
                              </p>
                              <p className="text-xs text-gray-600 mt-1">
                                {selectedProduct.product_category}
                              </p>
                              {selectedProduct.skill_level && (
                                <span className="inline-block mt-2 px-2 py-1 text-xs bg-white rounded-md border border-gray-200">
                                  {selectedProduct.skill_level}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>No product selected.</strong> Please select a product to link this schedule.
                </p>
              </div>
            )}
          </div>
          
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                router.back();
                form.resetFields();
                setFormAction({ benefits: [] });
              }}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() =>
                scheduleId ? handleUpdateSchedule() : handleAddSchedule()
              }
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {scheduleId ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{scheduleId ? "Update Schedule" : "Add Schedule"}</>
              )}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
