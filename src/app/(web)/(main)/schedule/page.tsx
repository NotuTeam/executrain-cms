/** @format */

"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  Edit,
  MapPin,
  Clock,
  X,
  Trash2,
  Filter,
} from "lucide-react";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { Tooltip } from "antd";

import Notification from "@/components/Notification";
import { StyledSelect } from "@/components/StyledSelect";

import { useSchedules, useDelete, useCreateBulkSchedule } from "./hook";
import { useProducts } from "../product/hook";

export default function SchedulePage() {
  const router = useRouter();

  const [currentDate, setCurrentDate] = useState(dayjs());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  const [uploadedSchedules, setUploadedSchedules] = useState<any[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<
    string | undefined
  >(undefined);
  const [showProductFilter, setShowProductFilter] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importModalProductId, setImportModalProductId] = useState<
    string | undefined
  >(undefined);
  const [selectedScheduleId, setSelectedScheduleId] = useState<
    string | null
  >(null);
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: schedules = [], refetch } = useSchedules(selectedProductId);
  const { data: productsData } = useProducts();
  const { mutate: createSchedule, isPending: isCreating } =
    useCreateBulkSchedule();
  const { mutate: deleteSchedule, isPending } = useDelete();

  const products = productsData?.pages?.flatMap((page: any) => page.data) || [];

  const generateCalendarDays = () => {
    const startOfMonth = currentDate.startOf("month");
    const endOfMonth = currentDate.endOf("month");
    const startOfCalendar = startOfMonth.startOf("week");
    const endOfCalendar = endOfMonth.endOf("week");

    const days = [];
    let day = startOfCalendar;

    while (day.isBefore(endOfCalendar) || day.isSame(endOfCalendar, "day")) {
      days.push(day);
      day = day.add(1, "day");
    }

    return days;
  };

  const getEventsForDate = useCallback(
    (date: dayjs.Dayjs) => {
      if (!schedules || schedules.length === 0) return [];

      return schedules.filter((schedule: any) => {
        // Ensure schedule_date is valid
        if (!schedule.schedule_date) return false;

        const scheduleDate = dayjs(schedule.schedule_date);
        if (!scheduleDate.isValid()) return false;

        // Compare dates by formatting to YYYY-MM-DD to avoid timezone issues
        return scheduleDate.format("YYYY-MM-DD") === date.format("YYYY-MM-DD");
      });
    },
    [schedules],
  );

  const handleDateClick = useCallback(
    (date: dayjs.Dayjs, e: React.MouseEvent) => {
      // Clear existing timeout if any
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
        popupTimeoutRef.current = null;
      }

      const events = getEventsForDate(date);
      if (events.length > 0) {
        setHoveredDate(date.format("YYYY-MM-DD"));
        const rect = e.currentTarget.getBoundingClientRect();
        const calendarContainer = e.currentTarget.closest(
          ".bg-white",
        ) as HTMLElement;

        if (calendarContainer) {
          const containerRect = calendarContainer.getBoundingClientRect();
          // Adjust position to be closer to the clicked date (add 4px gap)
          setPopupPosition({
            x: rect.left - containerRect.left,
            y: rect.bottom - containerRect.top + 4, // Add 4px gap
          });
        }
      }
    },
    [getEventsForDate],
  );

  const handlePopupMouseLeave = useCallback(() => {
    // Close popup when mouse leaves popup area
    setHoveredDate(null);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, []);

  // Close popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const calendarContainer = target.closest(".bg-white.border");
      const popup = target.closest(".absolute.bg-white.z-50");

      // Close if click is outside both calendar and popup
      if (!calendarContainer && !popup && hoveredDate) {
        setHoveredDate(null);
      }
    };

    if (hoveredDate) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [hoveredDate]);

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
      "is_assestment",
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
      "y/n",
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
      { wch: 15 }, // is_assestment
      { wch: 30 }, // status
    ];
    ws["!cols"] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "SCHEDULE");
    XLSX.writeFile(wb, "SCHEDULE_TEMPLATE.xlsx");

    Notification("success", "Template downloaded successfully");
  };

  const handleOpenImportModal = () => {
    setShowImportModal(true);
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setImportModalProductId(undefined);
    setUploadedSchedules([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!importModalProductId) {
      Notification("error", "Please select a product first");
      return;
    }

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
              "is_assestment",
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
                    } else if (field === "is_assestment") {
                      scheduleData[field] =
                        value.toLowerCase() === "y" ||
                        value.toLowerCase() === "yes";
                    } else if (field === "status") {
                      // Map user-friendly status to enum values
                      const statusStr = value
                        .toString()
                        .toUpperCase()
                        .replace(/\s+/g, "_");
                      if (
                        statusStr === "OPEN_SEAT" ||
                        statusStr === "FULL_BOOKED" ||
                        statusStr === "OPEN SEAT" ||
                        statusStr === "FULL BOOKED"
                      ) {
                        scheduleData[field] = statusStr.replace(/\s+/g, "_");
                      } else {
                        scheduleData[field] = "OPEN_SEAT"; // Default value
                      }
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
              `Successfully imported ${newSchedules.length} schedules for product: ${products.find((p: any) => p._id === importModalProductId)?.product_name}. Please review before importing.`,
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

  const handleConfirmImport = () => {
    if (!importModalProductId) {
      Notification("error", "Please select a product first");
      return;
    }

    createSchedule(
      { payload: uploadedSchedules, product_id: importModalProductId },
      {
        onSuccess: () => {
          Notification("success", "Schedules imported successfully");
          handleCloseImportModal();
          refetch();
        },
        onError: (error: any) => {
          Notification("error", error.message || "Failed to import schedules");
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

  const handleDeleteSchedule = (id: string) => {
    setSelectedScheduleId(id);
  };

  const confirmDeleteSchedule = () => {
    if (!selectedScheduleId) return;

    deleteSchedule(selectedScheduleId, {
      onSuccess: () => {
        Notification("success", "Schedule deleted successfully");
        refetch();
        setSelectedScheduleId(null);
      },
      onError: (error: any) => {
        Notification("error", error.message || "Failed to delete schedule");
        setSelectedScheduleId(null);
      },
    });
  };

  const calendarDays = generateCalendarDays();
  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Schedule</h1>
          <p className="text-gray-600 mt-1">
            Manage training schedules and events
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Product Filter */}
          <div className="relative">
            <button
              onClick={() => setShowProductFilter(!showProductFilter)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">
                {selectedProductId
                  ? products.find((p: any) => p._id === selectedProductId)
                      ?.product_name || "Selected Product"
                  : "All Products"}
              </span>
            </button>

            {showProductFilter && (
              <div className="absolute right-0 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-10">
                <div className="p-3 border-b border-gray-200">
                  <button
                    onClick={() => {
                      setSelectedProductId(undefined);
                      setShowProductFilter(false);
                    }}
                    className="text-sm text-gray-600 hover:text-gray-900 w-full text-left"
                  >
                    All Products
                  </button>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {products.map((product: any) => (
                    <button
                      key={product._id}
                      onClick={() => {
                        setSelectedProductId(product._id);
                        setShowProductFilter(false);
                      }}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-gray-50 transition-colors"
                    >
                      {product.product_name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <button
            onClick={handleExportTemplate}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Template</span>
          </button>

          <button
            onClick={handleOpenImportModal}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Import Excel</span>
          </button>
        </div>
      </div>

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Import Schedules
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Select a product and upload schedule data from Excel file
                </p>
              </div>
              <button
                onClick={handleCloseImportModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Product Selection */}
              <div>
                <StyledSelect
                  label="Select Product"
                  value={importModalProductId || ""}
                  onChange={(value) =>
                    setImportModalProductId(value || undefined)
                  }
                  options={[
                    { value: "", label: "Choose a product..." },
                    ...products.map((product: any) => ({
                      value: product._id,
                      label: product.product_name,
                    })),
                  ]}
                />
                {importModalProductId && (
                  <p className="text-sm text-gray-600 mt-2">
                    Selected:{" "}
                    <strong>
                      {
                        products.find(
                          (p: any) => p._id === importModalProductId,
                        )?.product_name
                      }
                    </strong>
                  </p>
                )}
              </div>

              {/* File Upload */}
              {importModalProductId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload Excel File <span className="text-red-500">*</span>
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">
                      Click to upload Excel file
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      .xlsx or .xls files
                    </p>
                    <input
                      type="file"
                      accept=".xlsx, .xls"
                      onChange={handleImportExcel}
                      className="hidden"
                      ref={fileInputRef}
                    />
                  </label>
                </div>
              )}

              {/* Uploaded Schedules Preview */}
              {uploadedSchedules.length > 0 && (
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                    <h3 className="font-semibold text-gray-900">
                      {uploadedSchedules.length} Schedules Ready to Import
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Product:{" "}
                      {
                        products.find(
                          (p: any) => p._id === importModalProductId,
                        )?.product_name
                      }
                    </p>
                  </div>

                  <div className="max-h-64 overflow-y-auto">
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
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={handleCloseImportModal}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                disabled={isCreating}
              >
                Cancel
              </button>
              {uploadedSchedules.length > 0 && (
                <button
                  onClick={handleCancelImport}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium"
                  disabled={isCreating}
                >
                  Clear File
                </button>
              )}
              <button
                onClick={handleConfirmImport}
                disabled={
                  isCreating ||
                  !importModalProductId ||
                  uploadedSchedules.length === 0
                }
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating ? "Importing..." : "Import Schedules"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Old Uploaded Schedules Preview - Remove this section as it's now in modal */}
      {uploadedSchedules.length > 0 && false && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Review {uploadedSchedules.length} Schedules to Import
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleCancelImport}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmImport}
                disabled={isCreating}
                className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isCreating ? "Importing..." : "Confirm Import"}
              </button>
            </div>
          </div>

          <div className="max-h-96 overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Name
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Date
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                    Location
                  </th>
                  <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
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
                      {dayjs(schedule.schedule_date).format("YYYY-MM-DD")}
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
        </div>
      )}

      {/* Calendar */}
      <div className="bg-white border border-gray-200 rounded-xl p-6 relative">
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => setCurrentDate(currentDate.subtract(1, "month"))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <h2 className="text-xl font-semibold text-gray-900">
            {currentDate.format("MMMM YYYY")}
          </h2>

          <button
            onClick={() => setCurrentDate(currentDate.add(1, "month"))}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-2">
          {/* Weekday Headers */}
          {weekdays.map((day) => (
            <div
              key={day}
              className="text-center text-sm font-medium text-gray-700 py-2"
            >
              {day}
            </div>
          ))}

          {/* Calendar Days */}
          {calendarDays.map((date, index) => {
            const events = getEventsForDate(date);
            const isCurrentMonth = date.isSame(currentDate, "month");
            const isToday = date.isSame(dayjs(), "day");

            return (
              <div
                key={index}
                onClick={(e) => handleDateClick(date, e)}
                className={`
                  relative p-2 min-h-[100px] border border-gray-200 rounded-lg
                  ${isCurrentMonth ? "bg-white" : "bg-gray-50"}
                  ${isToday ? "ring-2 ring-primary-500" : ""}
                  ${events.length > 0 ? "hover:bg-gray-50" : ""}
                  ${events.length > 0 ? "cursor-pointer" : "cursor-default"}
                  transition-colors
                `}
              >
                <div className="text-sm text-gray-700 mb-1">
                  {date.format("D")}
                </div>

                {events.length > 0 && (
                  <div className="space-y-1">
                    {events.slice(0, 2).map((event: any, idx: number) => (
                      <div
                        key={idx}
                        className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded truncate"
                      >
                        {event.schedule_name}
                      </div>
                    ))}
                    {events.length > 2 && (
                      <div className="text-xs text-gray-500 px-2 py-1">
                        +{events.length - 2} more
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Popup for clicked date - INSIDE calendar div */}
        {hoveredDate && (
          <div
            className="absolute bg-white border border-gray-200 rounded-xl shadow-lg z-50 w-80"
            style={{
              left: `${popupPosition.x}px`,
              top: `${popupPosition.y}px`,
            }}
            onMouseLeave={handlePopupMouseLeave}
          >
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900">
                {dayjs(hoveredDate).format("MMMM D, YYYY")}
              </h3>
            </div>
            <div className="max-h-80 overflow-y-auto">
              <div className="p-4 space-y-2">
                {getEventsForDate(dayjs(hoveredDate)).map(
                  (event: any, idx: number) => (
                    <div
                      key={idx}
                      className="p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors group"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {event.schedule_name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-xs text-gray-600">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">
                                {event.schedule_start} - {event.schedule_end}
                              </span>
                            </span>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">
                                {event.location}
                              </span>
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                          <Tooltip title="Edit Schedule" placement="top">
                            <button
                              onClick={() =>
                                router.push(`/schedule/editor?id=${event._id}`)
                              }
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <Edit className="w-3 h-3 text-gray-600" />
                            </button>
                          </Tooltip>
                          <Tooltip title="Delete Schedule" placement="top">
                            <button
                              onClick={() => handleDeleteSchedule(event._id)}
                              className="p-1 hover:bg-red-100 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3 text-red-600" />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ),
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {selectedScheduleId ? (
        <div className="fixed bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 top-0 right-0 left-0 bottom-0 m-0">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md text-center">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Delete Schedule
            </h2>
            <p>Are you sure you want to delete this schedule?</p>
            <div className="flex gap-5 mt-8 justify-center">
              <button
                type="button"
                onClick={() => {
                  setSelectedScheduleId(null);
                }}
                className="flex items-center justify-center gap-2 px-10 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                disabled={isPending}
              >
                No
              </button>
              <button
                type="button"
                onClick={confirmDeleteSchedule}
                className="px-10 py-3 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isPending}
              >
                Yes
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
