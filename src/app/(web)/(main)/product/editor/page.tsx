/** @format */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { ArrowLeft, Plus, X, Download, Upload } from "lucide-react";
import { Form, Row, Col } from "antd";
import InputForm from "@/components/Form";
import * as XLSX from "xlsx";
import dayjs from "dayjs";

import { useCreateProduct, useProductsDetail, useUpdateProduct } from "../hook";
import { useCreateBulkSchedule } from "../../schedule/hook";

import Image from "next/image";
import Notification from "@/components/Notification";
import { servicesToCategories } from "@/lib/utils";
import { useServices } from "../../services/hook";

const SKILL_LEVELS = ["Beginner", "Intermediate", "Expert", "All Level"];

const LANGUAGES = ["Indonesia", "Inggris"];

export default function ProductEditorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const productId = searchParams.get("id");

  const [form] = Form.useForm();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch services untuk categories
  const { data: services = [] } = useServices();
  const CATEGORIES = servicesToCategories(services);

  const { data: existingProduct } = useProductsDetail(productId || "");
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();
  const { mutate: createBulkSchedule, isPending: isImportingSchedules } =
    useCreateBulkSchedule();

  const [formAction, setFormAction] = useState<any>({
    benefits: [],
  });

  const [newBenefit, setNewBenefit] = useState({ benefit: null });
  const [uploadedSchedules, setUploadedSchedules] = useState<any[]>([]);
  const [createdProductId, setCreatedProductId] = useState<string | null>(null);

  useEffect(() => {
    if (existingProduct) {
      form.setFieldsValue(existingProduct);
      setFormAction(existingProduct);
    }
  }, [existingProduct]);

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

  const handleAddProduct = async () => {
    try {
      await form.validateFields();

      const formData = new FormData();

      formData.append("product_name", formAction.product_name);
      formData.append("product_description", formAction.product_description);
      formData.append("skill_level", formAction.skill_level);
      formData.append("product_category", formAction.product_category);
      formData.append("language", formAction.language);
      formData.append("max_participant", formAction.max_participant);
      formData.append("duration", formAction.duration);
      formData.append("link", formAction.link || "");

      formAction.benefits?.forEach((benefit: string) => {
        formData.append("benefits", benefit);
      });

      if (formAction?.banner?.file) {
        formData.append("file", formAction?.banner?.file ?? null);
      }

      createProduct(formData, {
        onSuccess: (response: any) => {
          Notification("success", "Success Add New Product");

          // Store the created product ID for schedule import
          if (response?.data?._id) {
            setCreatedProductId(response.data._id);

            // If there are uploaded schedules, import them
            if (uploadedSchedules.length > 0) {
              handleImportSchedules(response.data._id);
            } else {
              form.resetFields();
              router.back();
            }
          } else {
            form.resetFields();
            router.back();
          }
        },
        onError: (e) => {
          Notification("error", "Failed to Add New Product");
          console.log(e);
        },
      });
    } catch (e) {
      console.log(e);
    }
  };

  const handleUpdateProduct = async () => {
    if (!productId) return;

    try {
      await form.validateFields();

      const formData = new FormData();

      formData.append("product_name", formAction.product_name);
      formData.append("product_description", formAction.product_description);
      formData.append("skill_level", formAction.skill_level);
      formData.append("product_category", formAction.product_category);
      formData.append("language", formAction.language);
      formData.append("max_participant", formAction.max_participant);
      formData.append("duration", formAction.duration);
      formData.append("link", formAction.link || "");

      formAction.benefits?.forEach((benefit: string) => {
        formData.append("benefits", benefit);
      });

      if (formAction?.banner?.file) {
        formData.append("file", formAction?.banner?.file ?? null);
      } else {
        const parsed = JSON.stringify(formAction?.banner);
        formData.append("banner", parsed);
      }

      updateProduct(
        { id: productId, data: formData },
        {
          onSuccess: () => {
            Notification("success", "Success to Update Product");

            // If there are uploaded schedules, import them
            if (uploadedSchedules.length > 0) {
              handleImportSchedules(productId);
            } else {
              form.resetFields();
              router.back();
            }
          },
          onError: (e) => {
            Notification("error", "Failed to Update Product");
            form.resetFields();
            console.log(e);
          },
        },
      );
    } catch (e) {
      console.log(e);
    }
  };

  const handleExportTemplate = () => {
    const wb = XLSX.utils.book_new();

    const headers = [
      "schedule_name",
      "schedule_description",
      "schedule_date",
      "schedule_close_registration_date",
      "schedule_start",
      "schedule_end",
      "location",
      "quota",
      "duration",
      "link",
      "is_assestment",
      "benefits",
      "skill_level",
      "language",
      "status",
    ];

    const sampleData = [
      "Workshop React Advanced [SAMPLE DATA DONT DELETE]",
      "Learn advanced React patterns and best practices",
      "2025/11/15",
      "2025/11/15",
      "09:00",
      "17:00",
      "Jakarta Convention Center",
      "30",
      "480",
      "https://forms.google.com/react-workshop-registration",
      "y/n",
      "Certificate|Lunch|Materials",
      "BEGINNER/INTERMEDIATE/EXPERT",
      "INDONESIA/INGGRIS",
      "OPEN_SEAT/FULL_BOOKED",
    ];

    const wsData = [headers, sampleData];

    const ws = XLSX.utils.aoa_to_sheet(wsData);

    const colWidths = [
      { wch: 35 }, // schedule_name
      { wch: 50 }, // schedule_description
      { wch: 15 }, // schedule_date
      { wch: 15 }, // schedule_close_registration_date
      { wch: 12 }, // schedule_start
      { wch: 12 }, // schedule_end
      { wch: 30 }, // location
      { wch: 10 }, // quota
      { wch: 10 }, // duration
      { wch: 50 }, // link
      { wch: 15 }, // is_assestment
      { wch: 40 }, // benefits
      { wch: 15 }, // skill_level
      { wch: 15 }, // language
      { wch: 15 }, // status
    ];
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "SCHEDULE");
    XLSX.writeFile(wb, "SCHEDULE_TEMPLATE.xlsx");

    Notification("success", "Template downloaded successfully");
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const data = event.target?.result;
            const workbook = XLSX.read(data, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            const jsonData = XLSX.utils.sheet_to_json(worksheet, {
              header: 1,
              range: 2,
            });

            const columnMapping = [
              "schedule_name",
              "schedule_description",
              "schedule_date",
              "schedule_close_registration_date",
              "schedule_start",
              "schedule_end",
              "location",
              "quota",
              "duration",
              "link",
              "is_assestment",
              "benefits",
              "skill_level",
              "language",
              "status",
            ];

            const newSchedules = jsonData
              .filter((row: any) => row && row.length > 0 && row[0])
              .map((row: any) => {
                const scheduleData: any = {};

                columnMapping.forEach((field, colIndex) => {
                  const value = row[colIndex];
                  if (value !== undefined && value !== null && value !== "") {
                    if (
                      (field === "schedule_date" ||
                        field === "schedule_close_registration_date") &&
                      typeof value === "string"
                    ) {
                      const parsedDate = dayjs(value, [
                        "YYYY/M/D",
                        "YYYY-MM-DD",
                        "M/D/YYYY",
                      ]);
                      scheduleData[field] = parsedDate.isValid()
                        ? parsedDate.toDate()
                        : value;
                    } else if (
                      field === "benefits" &&
                      typeof value === "string"
                    ) {
                      scheduleData[field] = value
                        .split("|")
                        .map((b) => b.trim());
                    } else if (field === "is_assestment") {
                      scheduleData[field] =
                        value.toLowerCase() === "y" ||
                        value.toLowerCase() === "yes";
                    } else if (field === "quota" || field === "duration") {
                      scheduleData[field] = parseInt(value) || 0;
                    } else {
                      scheduleData[field] = value;
                    }
                  }
                });

                return scheduleData;
              });

            setUploadedSchedules(newSchedules);
            Notification(
              "success",
              `Successfully imported ${newSchedules.length} schedules`,
            );
          } catch (error) {
            console.error(error);
            Notification("error", "Failed to parse Excel file");
          }
        };
        reader.readAsBinaryString(file);
      } catch (error) {
        console.error(error);
        Notification("error", "Failed to read file");
      }
    }
  };

  const handleImportSchedules = (targetProductId: string) => {
    createBulkSchedule(
      { payload: uploadedSchedules, product_id: targetProductId },
      {
        onSuccess: () => {
          Notification("success", "Schedules imported successfully");
          setUploadedSchedules([]);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          router.back();
        },
        onError: (error: any) => {
          Notification("error", error.message || "Failed to import schedules");
          router.back();
        },
      },
    );
  };

  const handleCancelImport = () => {
    setUploadedSchedules([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileInputClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.accept = ".xlsx,.xls";
      fileInputRef.current.click();
    }
  };

  const isPending = isCreating || isUpdating || isImportingSchedules;

  return (
    <div className="min-h-screen">
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
              {productId ? "Edit Product" : "Add Product"}
            </h1>
            <p className="text-gray-600 mt-1">
              {productId
                ? "Update product information"
                : "Add a new service product"}
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
                type="text"
                name="product_name"
                label="Product Name"
                placeholder="Enter product name"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <InputForm
                type="textarea"
                name="product_description"
                label="Product Overview"
                placeholder="Enter product overview"
                required
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
              <Row gutter={[12, 12]}>
                <Col span={12}>
                  <InputForm
                    type="select"
                    name="product_category"
                    label="Product Category"
                    placeholder="Choose product category"
                    required
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                    options={CATEGORIES}
                  />
                </Col>
                <Col span={12}>
                  <InputForm
                    type="text"
                    name="link"
                    label="Redirect Link (Optional)"
                    placeholder="https://example.com or leave empty"
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                  />
                </Col>
              </Row>
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
              Product Details
            </h2>

            <div className="space-y-4">
              <Row gutter={[12, 12]}>
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
                <Col span={12}>
                  <InputForm
                    type="number"
                    name="max_participant"
                    label="Max Participant"
                    placeholder="Enter max participant"
                    required
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                  />
                  <InputForm
                    type="number"
                    name="duration"
                    label="Session Duration"
                    placeholder="Enter session duration (in minutes, e.g 45 minutes)"
                    required
                    form={formAction}
                    setForm={(e: any) => setFormAction(e)}
                  />
                </Col>
              </Row>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-6 pt-6 pb-3">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Banner</h2>
            {formAction?.banner?.data || formAction?.banner?.url ? (
              <div className="relative mb-5">
                <Image
                  src={formAction?.banner?.data || formAction?.banner?.url}
                  alt="uploaded banner"
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
                      banner: undefined,
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
                name="banner"
                label=""
                accept="image/*"
                className="mb-5"
                form={formAction}
                setForm={(e: any) => setFormAction(e)}
              />
            )}
          </div>
          {/* Bulk Schedule Upload Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Bulk Schedule Upload (Optional)
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Import multiple schedules for this product at once using Excel
              file. Schedules will be created after the product is {productId ? "updated" : "saved"}.
            </p>

              <div className="flex gap-5 mb-4 items-center">
                <button
                  type="button"
                  onClick={handleExportTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  <span className="text-sm font-medium">Download Template</span>
                </button>
                <span>Or</span>
                <button
                  type="button"
                  onClick={handleFileInputClick}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span className="text-sm font-medium">Import Excel</span>
                </button>
                <input
                  type="file"
                  accept=".xlsx, .xls"
                  onChange={handleImportExcel}
                  className="!hidden"
                  ref={fileInputRef}
                />
              </div>

              {/* Uploaded Schedules Preview */}
              {uploadedSchedules.length > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-md font-semibold text-gray-900">
                      {uploadedSchedules.length} Schedules Found
                    </h3>
                    <button
                      type="button"
                      onClick={handleCancelImport}
                      className="text-sm text-red-600 hover:text-red-700"
                    >
                      Clear All
                    </button>
                  </div>

                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Name
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Date
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Location
                          </th>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 uppercase">
                            Quota
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {uploadedSchedules.map((schedule, index) => (
                          <tr key={index}>
                            <td className="px-4 py-2 text-sm text-gray-900">
                              {schedule.schedule_name}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {dayjs(schedule.schedule_date).format(
                                "YYYY-MM-DD",
                              )}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {schedule.location}
                            </td>
                            <td className="px-4 py-2 text-sm text-gray-600">
                              {schedule.quota}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="mt-3 p-3 bg-yellow-50 border border-yellow-400 rounded-lg">
                    <p className="text-sm text-yellow-600">
                      <strong>Note:</strong> These schedules will be
                      automatically created after you click "
                      {productId ? "Update Product" : "Add Product"}".
                    </p>
                  </div>
                </div>
              )}
            </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                form.resetFields();
                router.back();
              }}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() =>
                productId ? handleUpdateProduct() : handleAddProduct()
              }
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {productId
                    ? "Updating..."
                    : isImportingSchedules
                      ? "Importing Schedules..."
                      : "Creating..."}
                </>
              ) : (
                <>{productId ? "Update Product" : "Add Product"}</>
              )}
            </button>
          </div>
        </Form>
      </div>
    </div>
  );
}
