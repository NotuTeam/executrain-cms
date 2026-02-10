/** @format */

"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import {
  Save,
  MoveLeft,
  Smartphone,
  Tablet,
  Monitor,
  Type,
  Image,
  Square,
  Layout,
  List,
  X,
  Upload,
  AlignLeft,
  AlignCenter,
  AlignRight,
  GripVertical,
  Loader2,
} from "lucide-react";
import { usePageDetail, useCreatePage, useUpdatePage } from "../hook";
import Notification from "@/components/Notification";

// Available components for drag & drop
const availableComponents = [
  {
    id: "text",
    name: "Text",
    icon: Type,
    category: "Basic",
    defaultProps: {
      content: "Sample text content",
      fontSize: 16,
      fontWeight: "normal",
      color: "#000000",
      backgroundColor: "transparent",
      padding: 16,
      textAlign: "left",
      backgroundImage: null,
    },
  },
  {
    id: "heading",
    name: "Heading",
    icon: Type,
    category: "Basic",
    defaultProps: {
      content: "Sample Heading",
      level: "h2",
      fontSize: 32,
      fontWeight: "bold",
      color: "#000000",
      backgroundColor: "transparent",
      padding: 16,
      textAlign: "left",
      backgroundImage: null,
    },
  },
  {
    id: "image",
    name: "Image",
    icon: Image,
    category: "Media",
    defaultProps: {
      src: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=800",
      alt: "Sample image",
      width: "100%",
      height: "auto",
      borderRadius: 0,
      objectFit: "cover",
      backgroundImage: null,
    },
  },
  {
    id: "button",
    name: "Button",
    icon: Square,
    category: "Interactive",
    defaultProps: {
      text: "Click Me",
      backgroundColor: "#3B82F6",
      color: "#FFFFFF",
      padding: "12px 32px",
      borderRadius: 999,
      fontSize: 16,
      fontWeight: "medium",
      border: "none",
      cursor: "pointer",
      textAlign: "center",
      backgroundImage: null,
    },
  },
  {
    id: "container",
    name: "Container",
    icon: Layout,
    category: "Layout",
    defaultProps: {
      backgroundColor: "transparent",
      backgroundImage: null,
      padding: 24,
      borderRadius: 0,
      border: "1px solid #E2E8F0",
      gridColumns: 1,
      gridGap: 16,
      children: [],
    },
  },
  // {
  //   id: "list",
  //   name: "List",
  //   icon: List,
  //   category: "Basic",
  //   defaultProps: {
  //     items: ["Item 1", "Item 2", "Item 3"],
  //     listStyle: "disc",
  //     fontSize: 16,
  //     color: "#000000",
  //     padding: 16,
  //     textAlign: "left",
  //     backgroundImage: null,
  //   },
  // },
];

export default function PageEditor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bgImageInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const pageId = searchParams.get("id");
  const isNew = searchParams.get("new") === "true";
  const titleParam = searchParams.get("title");
  const slugParam = searchParams.get("slug");
  const typeParam = searchParams.get("type");

  // Hooks
  const { data: pageDetailData, isLoading: isLoadingDetail } =
    usePageDetail(pageId);
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();

  const [pageData, setPageData] = useState<any>({
    id: null,
    name: titleParam || "",
    path: slugParam || "",
    type: typeParam || "Other",
    status: "DRAFT",
    template: [],
    uploadedImages: [],
  });

  const [selectedComponent, setSelectedComponent] = useState<string | null>(
    null
  );
  const [draggedComponent, setDraggedComponent] = useState<any>(null);
  const [draggedCanvasComponent, setDraggedCanvasComponent] =
    useState<any>(null);
  const [dragOverComponent, setDragOverComponent] = useState<string | null>(
    null
  );
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">(
    "desktop"
  );
  const [showComponentPanel, setShowComponentPanel] = useState(true);
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(false);
  const [showMetadataPanel, setShowMetadataPanel] = useState(false);
  const [metadata, setMetadata] = useState({
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ogTitle: "",
    ogDescription: "",
    ogImage: "",
    canonicalUrl: "",
    robotsIndex: "index,follow",
  });

  // Load existing page data
  useEffect(() => {
    if (pageDetailData) {
      const processedTemplate = (pageDetailData.template || []).map(
        (comp: any) => {
          const processedComp = { ...comp };

          if (comp.props?.backgroundImage?.url) {
            processedComp.props = {
              ...comp.props,
              backgroundImage: comp.props.backgroundImage.url,
              backgroundImageData: comp.props.backgroundImage,
            };
          }

          return processedComp;
        }
      );

      setPageData({
        id: pageDetailData._id,
        name: pageDetailData.name,
        path: pageDetailData.path,
        type: pageDetailData.type || "Other",
        status: pageDetailData.status,
        template: processedTemplate,
        uploadedImages: [],
      });

      if (pageDetailData.metadata) {
        setMetadata({
          metaTitle: pageDetailData.metadata.metaTitle || "",
          metaDescription: pageDetailData.metadata.metaDescription || "",
          metaKeywords: pageDetailData.metadata.metaKeywords || "",
          ogTitle: pageDetailData.metadata.ogTitle || "",
          ogDescription: pageDetailData.metadata.ogDescription || "",
          ogImage: pageDetailData.metadata.ogImage || "",
          canonicalUrl: pageDetailData.metadata.canonicalUrl || "",
          robotsIndex: pageDetailData.metadata.robotsIndex || "index,follow",
        });
      }
    }
  }, [pageDetailData]);

  // Set initial data for new page
  useEffect(() => {
    if (isNew && titleParam && slugParam) {
      setPageData({
        id: null,
        name: titleParam,
        path: slugParam,
        type: typeParam || "Other",
        status: "DRAFT",
        template: [],
        uploadedImages: [],
      });
    }
  }, [isNew, titleParam, slugParam, typeParam]);

  const getResponsiveColumns = (originalColumns: number) => {
    switch (viewMode) {
      case "mobile":
        return 12; // Always full width on mobile
      case "tablet":
        return originalColumns > 6 ? 12 : originalColumns * 2; // Double columns on tablet, max 12
      default:
        return originalColumns;
    }
  };

  const getViewportClass = () => {
    switch (viewMode) {
      case "mobile":
        return "max-w-sm";
      case "tablet":
        return "max-w-2xl";
      default:
        return "max-w-6xl";
    }
  };

  const handleDragStart = (component: any) => {
    setDraggedComponent(component);
  };

  const handleCanvasDragStart = (e: React.DragEvent, component: any) => {
    e.stopPropagation();
    setDraggedCanvasComponent(component);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverComponent(null);

    if (draggedComponent) {
      const newComponent = {
        id: `comp-${Date.now()}`,
        type: draggedComponent.id,
        gridColumn: 12,
        order: pageData.template.length + 1,
        props: { ...draggedComponent.defaultProps },
      };

      setPageData((prev: any) => ({
        ...prev,
        template: [...prev.template, newComponent],
      }));
      setDraggedComponent(null);
    }
  };

  const handleCanvasDrop = (e: React.DragEvent, targetComponent: any) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverComponent(null);

    if (
      draggedCanvasComponent &&
      draggedCanvasComponent.id !== targetComponent.id
    ) {
      const draggedOrder = draggedCanvasComponent.order;
      const targetOrder = targetComponent.order;

      setPageData((prev: any) => ({
        ...prev,
        template: prev.template.map((comp: any) => {
          if (comp.id === draggedCanvasComponent.id) {
            return { ...comp, order: targetOrder };
          }
          if (comp.id === targetComponent.id) {
            return { ...comp, order: draggedOrder };
          }
          return comp;
        }),
      }));
    }
    setDraggedCanvasComponent(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleCanvasDragOver = (e: React.DragEvent, componentId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedCanvasComponent && draggedCanvasComponent.id !== componentId) {
      setDragOverComponent(componentId);
    }
  };

  const handleDragEnd = () => {
    setDraggedComponent(null);
    setDraggedCanvasComponent(null);
    setDragOverComponent(null);
  };

  const updateComponentProps = (componentId: string, newProps: any) => {
    setPageData((prev: any) => ({
      ...prev,
      template: prev.template.map((comp: any) =>
        comp.id === componentId
          ? { ...comp, props: { ...comp.props, ...newProps } }
          : comp
      ),
    }));
  };

  const updateComponentGrid = (componentId: string, gridColumn: number) => {
    setPageData((prev: any) => ({
      ...prev,
      template: prev.template.map((comp: any) =>
        comp.id === componentId ? { ...comp, gridColumn } : comp
      ),
    }));
  };

  const deleteComponent = (componentId: string) => {
    setPageData((prev: any) => ({
      ...prev,
      template: prev.template.filter((comp: any) => comp.id !== componentId),
    }));
    setSelectedComponent(null);
  };

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isBackground: boolean = false
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = {
          id: `img-${Date.now()}`,
          name: file.name,
          size: file.size,
          type: file.type,
          data: event.target?.result as string,
          file: file,
        };

        setPageData((prev: any) => ({
          ...prev,
          uploadedImages: [...prev.uploadedImages, imageData],
        }));

        if (selectedComponent) {
          if (isBackground) {
            updateComponentProps(selectedComponent, {
              backgroundImage: imageData.data,
            });
          } else {
            updateComponentProps(selectedComponent, {
              src: imageData.data,
            });
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const savePageData = async () => {
    try {
      const formData = new FormData();
      formData.append("name", pageData.name);
      formData.append("path", pageData.path);
      formData.append("type", pageData.type || "Other");
      formData.append("status", pageData.status);

      const cleanTemplate = pageData.template.map((comp: any) => {
        const cleanComp = { ...comp };

        if (comp.props?.backgroundImage?.startsWith?.("data:")) {
          const imageFile = pageData.uploadedImages.find(
            (img: any) => img.data === comp.props.backgroundImage
          )?.file;

          if (imageFile) {
            formData.append(`bg_${comp.id}`, imageFile);
            cleanComp.props = { ...comp.props, backgroundImage: "__UPLOAD__" };
          }
        } else if (comp.props?.backgroundImageData?.url) {
          cleanComp.props = {
            ...comp.props,
            backgroundImage: comp.props.backgroundImageData,
          };
          delete cleanComp.props.backgroundImageData;
        } else if (
          comp.props?.backgroundImage &&
          typeof comp.props.backgroundImage === "string"
        ) {
          cleanComp.props = {
            ...comp.props,
            backgroundImage: comp.props.backgroundImage,
          };
        } else if (comp.props?.backgroundImage === null) {
          cleanComp.props = { ...comp.props, backgroundImage: null };
        }

        if (comp.type === "image" && comp.props?.src?.startsWith?.("data:")) {
          const imageFile = pageData.uploadedImages.find(
            (img: any) => img.data === comp.props.src
          )?.file;

          if (imageFile) {
            formData.append(`img_${comp.id}`, imageFile);
            cleanComp.props = { ...comp.props, src: "__UPLOAD__" };
          }
        } else if (comp.props?.src) {
          cleanComp.props = { ...comp.props, src: comp.props.src };
        }

        return cleanComp;
      });

      formData.append("template", JSON.stringify(cleanTemplate));

      const cleanMetadata = { ...metadata };
      if (metadata.ogImage?.startsWith?.("data:")) {
        const ogImageFile = pageData.uploadedImages.find(
          (img: any) => img.data === metadata.ogImage
        )?.file;

        if (ogImageFile) {
          formData.append("ogImage", ogImageFile);
          cleanMetadata.ogImage = "__UPLOAD__";
        }
      }

      formData.append("metadata", JSON.stringify(cleanMetadata));

      if (pageData.id) {
        const result = await updatePage.mutateAsync({
          id: pageData.id,
          data: formData,
        });
        Notification("success", result.message || "Page updated successfully!");
        router.back();
      } else {
        const result = await createPage.mutateAsync(formData);
        Notification("success", result.message || "Page created successfully!");
        router.back();
      }
    } catch (error: any) {
      Notification("error", error.message || "Failed to save page");
      console.error("Save error:", error);
    }
  };

  const renderComponent = (component: any) => {
    const { type, props } = component;
    const style = {
      fontSize: props.fontSize,
      fontWeight: props.fontWeight,
      color: props.color,
      backgroundColor: props.backgroundImage
        ? "transparent"
        : props.backgroundColor,
      backgroundImage: props.backgroundImage
        ? `url(${props.backgroundImage})`
        : "none",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      padding: props.padding,
      textAlign: props.textAlign,
      borderRadius: props.borderRadius,
      border: props.border,
      width: props.width,
      height: props.height,
      objectFit: props.objectFit,
      cursor: props.cursor,
    };

    switch (type) {
      case "text":
        return <p style={style}>{props.content}</p>;
      case "heading":
        const HeadingTag = props.level || "h2";
        return <HeadingTag style={style}>{props.content}</HeadingTag>;
      case "image":
        return <img src={props.src} alt={props.alt} style={style} />;
      case "button":
        return (
          <div style={{ textAlign: props.textAlign, padding: 0 }}>
            <button
              style={{
                ...style,
                display: "inline-block",
                textAlign: "center",
                padding: props.padding,
              }}
            >
              {props.text}
            </button>
          </div>
        );
      case "list":
        return (
          <ul style={{ ...style, listStyleType: props.listStyle }}>
            {props.items.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        );
      case "container":
        return (
          <div
            style={{
              ...style,
              display: "grid",
              gridTemplateColumns: `repeat(${props.gridColumns || 1}, 1fr)`,
              gap: props.gridGap || 16,
              minHeight: props.children?.length === 0 ? "100px" : "auto",
            }}
          >
            {props.children && props.children.length > 0 ? (
              props.children.map((child: any) => (
                <div key={child.id}>{renderComponent(child)}</div>
              ))
            ) : (
              <div className="col-span-full flex items-center justify-center text-gray-600 text-sm py-8">
                Drop components here
              </div>
            )}
          </div>
        );
      default:
        return <div style={style}>Unknown component</div>;
    }
  };

  const selectedComponentData = selectedComponent
    ? pageData.template.find((comp: any) => comp.id === selectedComponent)
    : null;

  const isSaving = createPage.isPending || updatePage.isPending;

  if (isLoadingDetail && pageId) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100 relative overflow-hidden">
      {/* Component Library Panel */}
      {showComponentPanel && (
        <div className="w-64 lg:w-80 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 z-30">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Components</h2>
            <button
              onClick={() => setShowComponentPanel(false)}
              className="lg:hidden p-1 hover:bg-gray-100 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {["Basic", "Media", "Interactive", "Layout"].map((category) => (
              <div key={category} className="mb-6">
                <h3 className="text-sm font-medium text-gray-600 mb-3">
                  {category}
                </h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                  {availableComponents
                    .filter((comp) => comp.category === category)
                    .map((component) => {
                      const Icon = component.icon;
                      return (
                        <div
                          key={component.id}
                          draggable
                          onDragStart={() => handleDragStart(component)}
                          onDragEnd={handleDragEnd}
                          className="p-3 border border-gray-200 rounded-lg cursor-grab hover:bg-gray-100 transition-colors active:cursor-grabbing hover:border-blue-300"
                        >
                          <Icon className="w-5 h-5 text-gray-600 mb-2" />
                          <p className="text-xs font-medium text-gray-600">
                            {component.name}
                          </p>
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Editor */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className="bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              {!showComponentPanel && (
                <button
                  onClick={() => setShowComponentPanel(true)}
                  className="lg:hidden p-2 bg-gray-100 rounded-lg"
                >
                  <Layout className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => router.back()}
                className="p-2 bg-white border border-gray-200 rounded-lg shadow-sm transition-all duration-300 hover:bg-gray-100"
              >
                <MoveLeft className="w-4 h-4 text-gray-600" />
              </button>
              <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode("desktop")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "desktop"
                      ? "bg-white shadow-sm"
                      : "hover:bg-slate-200"
                  }`}
                  title="Desktop View"
                >
                  <Monitor className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("tablet")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "tablet"
                      ? "bg-white shadow-sm"
                      : "hover:bg-slate-200"
                  }`}
                  title="Tablet View"
                >
                  <Tablet className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("mobile")}
                  className={`p-2 rounded transition-all ${
                    viewMode === "mobile"
                      ? "bg-white shadow-sm"
                      : "hover:bg-slate-200"
                  }`}
                  title="Mobile View"
                >
                  <Smartphone className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h1 className="font-semibold text-gray-900 hidden md:block truncate max-w-xs">
              {pageData.name}
            </h1>

            <div className="flex items-center gap-2">
              <button
                onClick={savePageData}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                <span className="hidden sm:inline">
                  {isSaving ? "Saving..." : "Save"}
                </span>
              </button>
              {/* <button
                onClick={() => setShowMetadataPanel(true)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-300 text-white rounded-lg hover:bg-gray-200 transition-colors"
              >
                <span className="hidden sm:inline">SEO</span>
              </button> */}
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 overflow-auto p-4 lg:p-8 bg-gray-100">
          <div
            className={`mx-auto bg-white rounded-lg shadow-lg min-h-[600px] transition-all duration-300 ${getViewportClass()}`}
          >
            <div
              ref={dropZoneRef}
              className="p-6 min-h-full"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {pageData.template.length === 0 ? (
                <div className="text-center py-20 text-gray-600 border-2 border-dashed border-gray-200 rounded-lg">
                  <Layout className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium mb-2">Empty Canvas</p>
                  <p className="text-sm">
                    Drag components here to start building
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pageData.template
                    .sort((a: any, b: any) => a.order - b.order)
                    .map((component: any) => {
                      const responsiveColumns = getResponsiveColumns(
                        component.gridColumn
                      );
                      const gridColClass = `col-span-${responsiveColumns}`;

                      return (
                        <div
                          key={component.id}
                          draggable
                          onDragStart={(e) =>
                            handleCanvasDragStart(e, component)
                          }
                          onDrop={(e) => handleCanvasDrop(e, component)}
                          onDragOver={(e) =>
                            handleCanvasDragOver(e, component.id)
                          }
                          onDragEnd={handleDragEnd}
                          className={`relative group transition-all duration-200 ${
                            dragOverComponent === component.id
                              ? "border-t-4 border-blue-500 pt-4"
                              : ""
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedComponent(component.id);
                            setShowPropertiesPanel(true);
                          }}
                        >
                          <div
                            className={`relative ${
                              selectedComponent === component.id
                                ? "ring-2 ring-blue-500 ring-offset-2"
                                : "hover:ring-2 hover:ring-slate-300"
                            } rounded-lg transition-all cursor-pointer`}
                            style={{
                              width:
                                viewMode === "desktop"
                                  ? `${(component.gridColumn / 12) * 100}%`
                                  : viewMode === "tablet"
                                  ? `${Math.min(
                                      (component.gridColumn / 12) * 100 * 1.5,
                                      100
                                    )}%`
                                  : "100%",
                            }}
                          >
                            {renderComponent(component)}

                            {/* Drag Handle */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <div className="bg-gray-100 text-white p-1.5 rounded cursor-grab active:cursor-grabbing shadow-lg">
                                <GripVertical className="w-4 h-4" />
                              </div>
                            </div>

                            {/* Component Label */}
                            {selectedComponent === component.id && (
                              <div className="absolute -top-9 left-0 flex items-center gap-2 bg-primary-600 text-white px-3 py-1.5 rounded-lg text-xs z-10 shadow-lg">
                                <span className="capitalize font-medium">
                                  {component.type}
                                </span>
                                <span className="text-blue-200">•</span>
                                <span className="text-blue-200">
                                  {component.gridColumn}/12
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    deleteComponent(component.id);
                                  }}
                                  className="ml-1 hover:bg-primary-700 rounded px-1.5 py-0.5 transition-colors"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Properties Panel - Rest of the code stays the same */}
      {selectedComponentData &&
        (showPropertiesPanel || window.innerWidth >= 1024) && (
          <div className="w-80 bg-white border-l border-gray-200 flex flex-col flex-shrink-0 lg:relative absolute right-0 top-0 h-full z-20 shadow-2xl lg:shadow-none">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="font-semibold text-gray-900">Properties</h2>
              <button
                onClick={() => {
                  setSelectedComponent(null);
                  setShowPropertiesPanel(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Grid Column Control */}
              <div className="bg-gray-100 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-600 mb-3">
                  Width (Grid Columns)
                </label>
                <input
                  type="range"
                  min="1"
                  max="12"
                  value={selectedComponentData.gridColumn}
                  onChange={(e) =>
                    updateComponentGrid(
                      selectedComponentData.id,
                      parseInt(e.target.value)
                    )
                  }
                  className="w-full accent-blue-600 h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-gray-600 mt-2">
                  <span>1 col</span>
                  <span className="font-semibold text-primary-500 text-sm">
                    {selectedComponentData.gridColumn} / 12 (
                    {Math.round((selectedComponentData.gridColumn / 12) * 100)}
                    %)
                  </span>
                  <span>12 col</span>
                </div>
              </div>

              {/* Text Alignment */}
              {(selectedComponentData.type === "text" ||
                selectedComponentData.type === "heading" ||
                selectedComponentData.type === "button") && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Text Alignment
                  </label>
                  <div className="flex gap-2">
                    {[
                      { value: "left", icon: AlignLeft },
                      { value: "center", icon: AlignCenter },
                      { value: "right", icon: AlignRight },
                    ].map(({ value, icon: Icon }) => (
                      <button
                        key={value}
                        onClick={() =>
                          updateComponentProps(selectedComponentData.id, {
                            textAlign: value,
                          })
                        }
                        className={`flex-1 p-2 border rounded-lg transition-colors ${
                          selectedComponentData.props.textAlign === value
                            ? "bg-primary-950 border-blue-200 text-primary-500"
                            : "border-gray-200 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-4 h-4 mx-auto" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Background Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Background Image
                </label>
                <div className="space-y-2">
                  <button
                    onClick={() => bgImageInputRef.current?.click()}
                    className="w-full p-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-primary-500"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Background
                  </button>
                  {selectedComponentData.props.backgroundImage && (
                    <div className="relative">
                      <img
                        src={selectedComponentData.props.backgroundImage}
                        alt="Background preview"
                        className="w-full h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() =>
                          updateComponentProps(selectedComponentData.id, {
                            backgroundImage: null,
                          })
                        }
                        className="absolute top-1 right-1 bg-red-9500 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Text/Heading specific props */}
              {(selectedComponentData.type === "text" ||
                selectedComponentData.type === "heading") && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Content
                    </label>
                    <textarea
                      value={selectedComponentData.props.content}
                      onChange={(e) =>
                        updateComponentProps(selectedComponentData.id, {
                          content: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Font Size
                    </label>
                    <input
                      type="number"
                      min="8"
                      max="72"
                      value={selectedComponentData.props.fontSize}
                      onChange={(e) =>
                        updateComponentProps(selectedComponentData.id, {
                          fontSize: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={selectedComponentData.props.color}
                      onChange={(e) =>
                        updateComponentProps(selectedComponentData.id, {
                          color: e.target.value,
                        })
                      }
                      className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* Image specific props */}
              {selectedComponentData.type === "image" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Image Source
                    </label>
                    <div className="space-y-3">
                      {pageData.uploadedImages.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-600 mb-2">
                            Choose from uploaded:
                          </p>
                          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
                            {pageData.uploadedImages.map((image: any) => (
                              <div key={image.id} className="relative group">
                                <img
                                  src={image.data}
                                  alt={image.name}
                                  className={`w-full h-16 object-cover rounded-lg cursor-pointer transition-all ${
                                    selectedComponentData.props.src ===
                                    image.data
                                      ? "ring-2 ring-blue-500"
                                      : "hover:opacity-75"
                                  }`}
                                  onClick={() =>
                                    updateComponentProps(
                                      selectedComponentData.id,
                                      {
                                        src: image.data,
                                      }
                                    )
                                  }
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full p-3 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-primary-500"
                      >
                        <Upload className="w-4 h-4" />
                        Upload New Image
                      </button>

                      <div>
                        <p className="text-xs text-gray-600 mb-2">
                          Or enter URL:
                        </p>
                        <input
                          type="url"
                          value={selectedComponentData.props.src}
                          onChange={(e) =>
                            updateComponentProps(selectedComponentData.id, {
                              src: e.target.value,
                            })
                          }
                          placeholder="https://example.com/image.jpg"
                          className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Alt Text
                    </label>
                    <input
                      type="text"
                      value={selectedComponentData.props.alt}
                      onChange={(e) =>
                        updateComponentProps(selectedComponentData.id, {
                          alt: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Border Radius
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={selectedComponentData.props.borderRadius}
                      onChange={(e) =>
                        updateComponentProps(selectedComponentData.id, {
                          borderRadius: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </>
              )}

              {/* Button specific props */}
              {selectedComponentData.type === "button" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Button Text
                    </label>
                    <input
                      type="text"
                      value={selectedComponentData.props.text}
                      onChange={(e) =>
                        updateComponentProps(selectedComponentData.id, {
                          text: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Font Size
                    </label>
                    <input
                      type="number"
                      min="8"
                      max="32"
                      value={selectedComponentData.props.fontSize}
                      onChange={(e) =>
                        updateComponentProps(selectedComponentData.id, {
                          fontSize: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Border Radius
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="50"
                      value={selectedComponentData.props.borderRadius}
                      onChange={(e) =>
                        updateComponentProps(selectedComponentData.id, {
                          borderRadius: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={selectedComponentData.props.backgroundColor}
                      onChange={(e) =>
                        updateComponentProps(selectedComponentData.id, {
                          backgroundColor: e.target.value,
                        })
                      }
                      className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={selectedComponentData.props.color}
                      onChange={(e) =>
                        updateComponentProps(selectedComponentData.id, {
                          color: e.target.value,
                        })
                      }
                      className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </>
              )}

              {/* List specific props */}
              {/* {selectedComponentData.type === "list" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      List Items
                    </label>
                    <div className="space-y-2">
                      {selectedComponentData.props.items.map(
                        (item: string, index: number) => (
                          <div key={index} className="flex gap-2">
                            <input
                              type="text"
                              value={item}
                              onChange={(e) => {
                                const newItems = [
                                  ...selectedComponentData.props.items,
                                ];
                                newItems[index] = e.target.value;
                                updateComponentProps(selectedComponentData.id, {
                                  items: newItems,
                                });
                              }}
                              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <button
                              onClick={() => {
                                const newItems =
                                  selectedComponentData.props.items.filter(
                                    (_: any, i: number) => i !== index
                                  );
                                updateComponentProps(selectedComponentData.id, {
                                  items: newItems,
                                });
                              }}
                              className="p-2 text-red-500 hover:bg-red-950 rounded-lg transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        )
                      )}
                      <button
                        onClick={() => {
                          const newItems = [
                            ...selectedComponentData.props.items,
                            `Item ${
                              selectedComponentData.props.items.length + 1
                            }`,
                          ];
                          updateComponentProps(selectedComponentData.id, {
                            items: newItems,
                          });
                        }}
                        className="w-full p-2 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 text-gray-600 hover:text-primary-500 transition-colors"
                      >
                        + Add Item
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      List Style
                    </label>
                    <select
                      value={selectedComponentData.props.listStyle}
                      onChange={(e) =>
                        updateComponentProps(selectedComponentData.id, {
                          listStyle: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="disc">Disc</option>
                      <option value="circle">Circle</option>
                      <option value="square">Square</option>
                      <option value="decimal">Numbers</option>
                      <option value="none">None</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Font Size
                    </label>
                    <input
                      type="number"
                      min="8"
                      max="32"
                      value={selectedComponentData.props.fontSize}
                      onChange={(e) =>
                        updateComponentProps(selectedComponentData.id, {
                          fontSize: parseInt(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={selectedComponentData.props.color}
                      onChange={(e) =>
                        updateComponentProps(selectedComponentData.id, {
                          color: e.target.value,
                        })
                      }
                      className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
                    />
                  </div>
                </>
              )} */}

              {/* Common properties */}
              {!selectedComponentData.props.backgroundImage && (
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">
                    Background Color
                  </label>
                  <input
                    type="color"
                    value={
                      selectedComponentData.props.backgroundColor || "#ffffff"
                    }
                    onChange={(e) =>
                      updateComponentProps(selectedComponentData.id, {
                        backgroundColor: e.target.value,
                      })
                    }
                    className="w-full h-10 border border-gray-200 rounded-lg cursor-pointer"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-2">
                  Padding
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={selectedComponentData.props.padding}
                  onChange={(e) =>
                    updateComponentProps(selectedComponentData.id, {
                      padding: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <div className="text-xs text-gray-600 mt-1">
                  Spacing around content (px)
                </div>
              </div>
            </div>
          </div>
        )}

      {/* SEO Metadata Panel */}
      {showMetadataPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900">SEO Metadata</h2>
              <button
                onClick={() => setShowMetadataPanel(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Basic SEO
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Meta Title
                    </label>
                    <input
                      type="text"
                      value={metadata.metaTitle}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          metaTitle: e.target.value,
                        }))
                      }
                      placeholder="Enter page title for SEO (50-60 characters)"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      {metadata.metaTitle.length}/60 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Meta Description
                    </label>
                    <textarea
                      value={metadata.metaDescription}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          metaDescription: e.target.value,
                        }))
                      }
                      placeholder="Enter page description for search engines (150-160 characters)"
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      {metadata.metaDescription.length}/160 characters
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Meta Keywords
                    </label>
                    <input
                      type="text"
                      value={metadata.metaKeywords}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          metaKeywords: e.target.value,
                        }))
                      }
                      placeholder="Enter keywords separated by commas"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Open Graph (Social Media)
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      OG Title
                    </label>
                    <input
                      type="text"
                      value={metadata.ogTitle}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          ogTitle: e.target.value,
                        }))
                      }
                      placeholder="Title for social media sharing"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      OG Description
                    </label>
                    <textarea
                      value={metadata.ogDescription}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          ogDescription: e.target.value,
                        }))
                      }
                      placeholder="Description for social media sharing"
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      OG Image URL
                    </label>
                    <input
                      type="url"
                      value={metadata.ogImage}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          ogImage: e.target.value,
                        }))
                      }
                      placeholder="Image URL for social media sharing"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Advanced SEO
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Canonical URL
                    </label>
                    <input
                      type="url"
                      value={metadata.canonicalUrl}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          canonicalUrl: e.target.value,
                        }))
                      }
                      placeholder="Canonical URL for this page"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      Robots Meta Tag
                    </label>
                    <select
                      value={metadata.robotsIndex}
                      onChange={(e) =>
                        setMetadata((prev) => ({
                          ...prev,
                          robotsIndex: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                      <option value="index,follow">Index, Follow</option>
                      <option value="noindex,nofollow">
                        No Index, No Follow
                      </option>
                      <option value="index,nofollow">Index, No Follow</option>
                      <option value="noindex,follow">No Index, Follow</option>
                    </select>
                  </div>
                </div>
              </div>
            </div> */}

            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setShowMetadataPanel(false)}
                className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowMetadataPanel(false)}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
              >
                Save Metadata
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleImageUpload(e, false)}
        className="hidden"
      />
      <input
        ref={bgImageInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => handleImageUpload(e, true)}
        className="hidden"
      />

      {/* Mobile overlay for properties panel */}
      {showPropertiesPanel && window.innerWidth < 1024 && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={() => setShowPropertiesPanel(false)}
        />
      )}
    </div>
  );
}
