"use client";

import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, GripVertical, Eye, Layers } from "lucide-react";

export const dynamic = "force-dynamic";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import { FIELD_CATALOG, createField, emptySchema, findField } from "@/lib/forms/catalog";
import type { FormSchema, FormField, FormSection } from "@/types/forms";
import { uid } from "@/lib/utils";

function SortableField({ field, onUpdate, onDelete, allFields }: { field: FormField; onUpdate: (fieldId: string, field: FormField) => void; onDelete: () => void; allFields: FormField[] }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-lg p-4 mb-3 shadow-sm">
      <div className="flex items-start gap-3">
        <div {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600">
          <GripVertical className="w-5 h-5" />
        </div>

        <div className="flex-1 space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Field Label</label>
            <input
              type="text"
              value={field.label}
              onChange={(e) => onUpdate(field.id, { ...field, label: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
          </div>

          {field.type !== "heading" && field.type !== "paragraph" && field.type !== "divider" && field.type !== "image" && (
            <>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={field.required}
                    onChange={(e) => onUpdate(field.id, { ...field, required: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Required
                </label>

                <select
                  value={field.width}
                  onChange={(e) => onUpdate(field.id, { ...field, width: e.target.value as "full" | "half" | "third" })}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                >
                  <option value="full">Full Width</option>
                  <option value="half">Half Width</option>
                  <option value="third">Third Width</option>
                </select>
              </div>

              {field.placeholder !== undefined && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Placeholder</label>
                  <input
                    type="text"
                    value={field.placeholder}
                    onChange={(e) => onUpdate(field.id, { ...field, placeholder: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              )}
            </>
          )}

          {field.type === "heading" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Heading Text</label>
              <input
                type="text"
                value={field.label}
                onChange={(e) => onUpdate(field.id, { ...field, label: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
          )}

          {field.type === "paragraph" && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Content</label>
              <textarea
                value={field.content || ""}
                onChange={(e) => onUpdate(field.id, { ...field, content: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                rows={3}
              />
            </div>
          )}
        </div>

        <button
          onClick={onDelete}
          className="text-red-600 hover:text-red-700 p-1"
          title="Delete field"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function FormBuilderPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const [schema, setSchema] = useState<FormSchema>({ sections: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string>("Basic");

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const loadEvent = async () => {
      const { data, error } = await supabase.from("events").select("form_schema").eq("id", params.id as string).single();

      if (error) {
        console.error("Error loading event:", error);
        router.push("/dashboard/events");
      } else {
        setSchema((data as any)?.form_schema || emptySchema());
      }

      setLoading(false);
    };

    loadEvent();
  }, [supabase, params.id, router]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSchema((prev) => {
        const newSections = [...prev.sections];
        const section = newSections[0];
        const oldIndex = section.fields.findIndex((f) => f.id === active.id);
        const newIndex = section.fields.findIndex((f) => f.id === over.id);

        if (oldIndex !== -1 && newIndex !== -1) {
          section.fields = arrayMove(section.fields, oldIndex, newIndex);
        }

        return { sections: newSections };
      });
    }
  };

  const addField = (type: string) => {
    const newField = createField(type as any);
    setSchema((prev) => {
      const newSections = [...prev.sections];
      if (newSections.length === 0) {
        newSections.push({ id: uid("sec"), title: "RSVP Form", fields: [] });
      }
      newSections[0].fields.push(newField);
      return { sections: newSections };
    });
  };

  const updateField = (fieldId: string, updatedField: FormField) => {
    setSchema((prev) => {
      const newSections = [...prev.sections];
      const section = newSections[0];
      section.fields = section.fields.map((f) => (f.id === fieldId ? updatedField : f));
      return { sections: newSections };
    });
  };

  const deleteField = (fieldId: string) => {
    setSchema((prev) => {
      const newSections = [...prev.sections];
      const section = newSections[0];
      section.fields = section.fields.filter((f) => f.id !== fieldId);
      return { sections: newSections };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const { error } = await (supabase as any).from("events").update({ form_schema: schema }).eq("id", params.id as string);

    if (error) {
      console.error("Error saving form:", error);
      alert("Failed to save form");
    }

    setSaving(false);
  };

  const fieldGroups = Array.from(new Set(FIELD_CATALOG.map((item) => item.group)));

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading form builder...</div>
        </div>
      </DashboardLayout>
    );
  }

  const currentFields = schema.sections[0]?.fields || [];

  return (
    <DashboardLayout>
      <div className="flex gap-6 h-[calc(100vh-200px)]">
        <div className="w-80 flex-shrink-0 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-0">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Add Fields
            </h3>

            <div className="space-y-2 mb-4">
              {fieldGroups.map((group) => (
                <button
                  key={group}
                  onClick={() => setSelectedGroup(group)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedGroup === group
                      ? "bg-blue-50 text-blue-700"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {FIELD_CATALOG.filter((item) => item.group === selectedGroup).map((item) => (
                <button
                  key={item.type}
                  onClick={() => addField(item.type)}
                  className="w-full text-left px-3 py-2 border border-gray-200 rounded-lg text-sm hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{item.label}</div>
                  <div className="text-xs text-gray-500">{item.description}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/events/${params.id}`} className="text-gray-600 hover:text-gray-900">
                <ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Form Builder</h1>
                <p className="text-gray-600 text-sm">Customize your RSVP form</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={`/r/${params.id}`}
                target="_blank"
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                <Eye className="w-4 h-4" />
                Preview
              </Link>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? "Saving..." : "Save Form"}
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            {currentFields.length === 0 ? (
              <div className="text-center py-12">
                <Plus className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No fields yet</h3>
                <p className="text-gray-600 mb-4">Add fields from the sidebar to build your form</p>
              </div>
            ) : (
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd} modifiers={[restrictToVerticalAxis]}>
                <SortableContext items={currentFields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  {currentFields.map((field) => (
                    <SortableField
                      key={field.id}
                      field={field}
                      onUpdate={updateField}
                      onDelete={() => deleteField(field.id)}
                      allFields={currentFields}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
