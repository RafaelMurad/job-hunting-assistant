/**
 * CV Editor Component
 *
 * Multi-section form for editing CV data with validation.
 * Uses controlled components and form state management.
 *
 * @learning React forms, controlled components, form validation
 * @see https://react.dev/reference/react-dom/components/input
 * @see https://zod.dev/ - Schema validation
 */

"use client";

import React, { useState, useCallback } from "react";
import {
  CV,
  Experience,
  Education,
  Skill,
  Certification,
  Project,
  generateId,
} from "../types";

// ===================
// TYPES
// ===================

interface CVEditorProps {
  initialData: CV;
  onSave: (cv: CV) => void;
  onAnalyze?: (cv: CV) => void;
  readOnly?: boolean;
}

type CVSection =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "certifications"
  | "projects";

// ===================
// MAIN COMPONENT
// ===================

/**
 * CV Editor
 *
 * Tabbed interface for editing different CV sections.
 *
 * TODO: Implement full form functionality
 * - Add form validation with Zod
 * - Add auto-save functionality
 * - Add undo/redo support
 */
export function CVEditor({
  initialData,
  onSave,
  onAnalyze,
  readOnly = false,
}: CVEditorProps) {
  const [cv, setCV] = useState<CV>(initialData);
  const [activeSection, setActiveSection] = useState<CVSection>("personal");
  const [isDirty, setIsDirty] = useState(false);

  // Update CV data
  const updateCV = useCallback((updates: Partial<CV>) => {
    setCV((prev) => ({
      ...prev,
      ...updates,
      metadata: {
        ...prev.metadata,
        updatedAt: new Date(),
      },
    }));
    setIsDirty(true);
  }, []);

  // Section tabs
  const sections: { key: CVSection; label: string }[] = [
    { key: "personal", label: "Personal Info" },
    { key: "summary", label: "Summary" },
    { key: "experience", label: "Experience" },
    { key: "education", label: "Education" },
    { key: "skills", label: "Skills" },
    { key: "certifications", label: "Certifications" },
    { key: "projects", label: "Projects" },
  ];

  return (
    <div className="cv-editor">
      {/* Section Navigation */}
      <nav className="cv-editor__nav flex gap-2 border-b border-neutral-200 mb-6">
        {sections.map((section) => (
          <button
            key={section.key}
            onClick={() => setActiveSection(section.key)}
            className={`px-4 py-2 text-sm font-medium transition-colors
              ${
                activeSection === section.key
                  ? "border-b-2 border-fjord-600 text-fjord-600"
                  : "text-neutral-600 hover:text-neutral-900"
              }`}
          >
            {section.label}
          </button>
        ))}
      </nav>

      {/* Section Content */}
      <div className="cv-editor__content">
        {activeSection === "personal" && (
          <PersonalInfoSection
            data={cv.personalInfo}
            onChange={(personalInfo) => updateCV({ personalInfo })}
            readOnly={readOnly}
          />
        )}
        {activeSection === "summary" && (
          <SummarySection
            data={cv.summary}
            onChange={(summary) => updateCV({ summary })}
            readOnly={readOnly}
          />
        )}
        {activeSection === "experience" && (
          <ExperienceSection
            data={cv.experience}
            onChange={(experience) => updateCV({ experience })}
            readOnly={readOnly}
          />
        )}
        {activeSection === "education" && (
          <EducationSection
            data={cv.education}
            onChange={(education) => updateCV({ education })}
            readOnly={readOnly}
          />
        )}
        {activeSection === "skills" && (
          <SkillsSection
            data={cv.skills}
            onChange={(skills) => updateCV({ skills })}
            readOnly={readOnly}
          />
        )}
        {activeSection === "certifications" && (
          <CertificationsSection
            data={cv.certifications}
            onChange={(certifications) => updateCV({ certifications })}
            readOnly={readOnly}
          />
        )}
        {activeSection === "projects" && (
          <ProjectsSection
            data={cv.projects}
            onChange={(projects) => updateCV({ projects })}
            readOnly={readOnly}
          />
        )}
      </div>

      {/* Actions */}
      {!readOnly && (
        <div className="cv-editor__actions flex gap-4 mt-8 pt-6 border-t border-neutral-200">
          <button
            onClick={() => onSave(cv)}
            disabled={!isDirty}
            className="px-6 py-2 bg-fjord-600 text-white rounded-lg
              hover:bg-fjord-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Save Changes
          </button>
          {onAnalyze && (
            <button
              onClick={() => onAnalyze(cv)}
              className="px-6 py-2 border border-fjord-600 text-fjord-600 rounded-lg
                hover:bg-fjord-50"
            >
              Analyze CV
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ===================
// SECTION COMPONENTS
// ===================

/**
 * Personal Info Section
 */
interface PersonalInfoSectionProps {
  data: CV["personalInfo"];
  onChange: (data: CV["personalInfo"]) => void;
  readOnly?: boolean;
}

function PersonalInfoSection({
  data,
  onChange,
  readOnly,
}: PersonalInfoSectionProps) {
  const handleChange = (field: keyof CV["personalInfo"], value: string) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <FormField
        label="First Name"
        value={data.firstName}
        onChange={(v) => handleChange("firstName", v)}
        required
        readOnly={readOnly}
      />
      <FormField
        label="Last Name"
        value={data.lastName}
        onChange={(v) => handleChange("lastName", v)}
        required
        readOnly={readOnly}
      />
      <FormField
        label="Email"
        type="email"
        value={data.email}
        onChange={(v) => handleChange("email", v)}
        required
        readOnly={readOnly}
      />
      <FormField
        label="Phone"
        type="tel"
        value={data.phone}
        onChange={(v) => handleChange("phone", v)}
        readOnly={readOnly}
      />
      <FormField
        label="Location"
        value={data.location}
        onChange={(v) => handleChange("location", v)}
        placeholder="City, Country"
        readOnly={readOnly}
      />
      <FormField
        label="LinkedIn"
        type="url"
        value={data.linkedin || ""}
        onChange={(v) => handleChange("linkedin", v)}
        placeholder="https://linkedin.com/in/..."
        readOnly={readOnly}
      />
      <FormField
        label="GitHub"
        type="url"
        value={data.github || ""}
        onChange={(v) => handleChange("github", v)}
        placeholder="https://github.com/..."
        readOnly={readOnly}
      />
      <FormField
        label="Portfolio"
        type="url"
        value={data.portfolio || ""}
        onChange={(v) => handleChange("portfolio", v)}
        placeholder="https://..."
        readOnly={readOnly}
      />
    </div>
  );
}

/**
 * Summary Section
 */
interface SummarySectionProps {
  data: string;
  onChange: (data: string) => void;
  readOnly?: boolean;
}

function SummarySection({ data, onChange, readOnly }: SummarySectionProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-2">
        Professional Summary
      </label>
      <textarea
        value={data}
        onChange={(e) => onChange(e.target.value)}
        rows={6}
        readOnly={readOnly}
        className="w-full px-4 py-2 border border-neutral-300 rounded-lg
          focus:ring-2 focus:ring-fjord-500 focus:border-transparent
          read-only:bg-neutral-50"
        placeholder="Write a compelling summary of your professional background, key achievements, and career goals..."
      />
      <p className="mt-2 text-sm text-neutral-500">
        Tip: Keep it concise (3-5 sentences) and tailor it to the job you're
        applying for.
      </p>
    </div>
  );
}

/**
 * Experience Section
 *
 * TODO: Implement full experience editor
 * - Add/remove experience entries
 * - Drag-and-drop reordering
 * - Rich text editor for descriptions
 */
interface ExperienceSectionProps {
  data: Experience[];
  onChange: (data: Experience[]) => void;
  readOnly?: boolean;
}

function ExperienceSection({
  data,
  onChange,
  readOnly,
}: ExperienceSectionProps) {
  const addExperience = () => {
    const newExp: Experience = {
      id: generateId(),
      company: "",
      position: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
      achievements: [],
      technologies: [],
    };
    onChange([...data, newExp]);
  };

  const updateExperience = (index: number, updates: Partial<Experience>) => {
    const updated = [...data];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeExperience = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {data.map((exp, index) => (
        <div
          key={exp.id}
          className="p-4 border border-neutral-200 rounded-lg space-y-4"
        >
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-neutral-900">
              {exp.position || "New Position"} at {exp.company || "Company"}
            </h4>
            {!readOnly && (
              <button
                onClick={() => removeExperience(index)}
                className="text-clay-600 hover:text-clay-700 text-sm"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Company"
              value={exp.company}
              onChange={(v) => updateExperience(index, { company: v })}
              required
              readOnly={readOnly}
            />
            <FormField
              label="Position"
              value={exp.position}
              onChange={(v) => updateExperience(index, { position: v })}
              required
              readOnly={readOnly}
            />
            <FormField
              label="Start Date"
              type="month"
              value={exp.startDate}
              onChange={(v) => updateExperience(index, { startDate: v })}
              readOnly={readOnly}
            />
            <FormField
              label="End Date"
              type="month"
              value={exp.endDate || ""}
              onChange={(v) => updateExperience(index, { endDate: v })}
              disabled={exp.current}
              readOnly={readOnly}
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id={`current-${exp.id}`}
              checked={exp.current}
              onChange={(e) =>
                updateExperience(index, { current: e.target.checked })
              }
              disabled={readOnly}
              className="rounded border-neutral-300 text-fjord-600
                focus:ring-fjord-500"
            />
            <label htmlFor={`current-${exp.id}`} className="text-sm">
              I currently work here
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Description & Achievements
            </label>
            <textarea
              value={exp.description}
              onChange={(e) =>
                updateExperience(index, { description: e.target.value })
              }
              rows={4}
              readOnly={readOnly}
              className="w-full px-4 py-2 border border-neutral-300 rounded-lg
                focus:ring-2 focus:ring-fjord-500 focus:border-transparent"
              placeholder="Describe your responsibilities and achievements..."
            />
          </div>
        </div>
      ))}

      {!readOnly && (
        <button
          onClick={addExperience}
          className="w-full py-3 border-2 border-dashed border-neutral-300
            rounded-lg text-neutral-600 hover:border-fjord-400 hover:text-fjord-600
            transition-colors"
        >
          + Add Experience
        </button>
      )}
    </div>
  );
}

/**
 * Education Section
 *
 * TODO: Similar implementation to Experience
 */
interface EducationSectionProps {
  data: Education[];
  onChange: (data: Education[]) => void;
  readOnly?: boolean;
}

function EducationSection({ data, onChange, readOnly }: EducationSectionProps) {
  const addEducation = () => {
    const newEdu: Education = {
      id: generateId(),
      institution: "",
      degree: "",
      field: "",
      location: "",
      startDate: "",
      endDate: "",
      current: false,
      achievements: [],
    };
    onChange([...data, newEdu]);
  };

  const updateEducation = (index: number, updates: Partial<Education>) => {
    const updated = [...data];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const removeEducation = (index: number) => {
    onChange(data.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      {data.map((edu, index) => (
        <div
          key={edu.id}
          className="p-4 border border-neutral-200 rounded-lg space-y-4"
        >
          <div className="flex justify-between items-start">
            <h4 className="font-medium text-neutral-900">
              {edu.degree || "Degree"} in {edu.field || "Field"}
            </h4>
            {!readOnly && (
              <button
                onClick={() => removeEducation(index)}
                className="text-clay-600 hover:text-clay-700 text-sm"
              >
                Remove
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              label="Institution"
              value={edu.institution}
              onChange={(v) => updateEducation(index, { institution: v })}
              required
              readOnly={readOnly}
            />
            <FormField
              label="Degree"
              value={edu.degree}
              onChange={(v) => updateEducation(index, { degree: v })}
              placeholder="Bachelor's, Master's, PhD..."
              readOnly={readOnly}
            />
            <FormField
              label="Field of Study"
              value={edu.field}
              onChange={(v) => updateEducation(index, { field: v })}
              readOnly={readOnly}
            />
            <FormField
              label="GPA (optional)"
              value={edu.gpa || ""}
              onChange={(v) => updateEducation(index, { gpa: v })}
              readOnly={readOnly}
            />
            <FormField
              label="Start Date"
              type="month"
              value={edu.startDate}
              onChange={(v) => updateEducation(index, { startDate: v })}
              readOnly={readOnly}
            />
            <FormField
              label="End Date"
              type="month"
              value={edu.endDate || ""}
              onChange={(v) => updateEducation(index, { endDate: v })}
              disabled={edu.current}
              readOnly={readOnly}
            />
          </div>
        </div>
      ))}

      {!readOnly && (
        <button
          onClick={addEducation}
          className="w-full py-3 border-2 border-dashed border-neutral-300
            rounded-lg text-neutral-600 hover:border-fjord-400 hover:text-fjord-600
            transition-colors"
        >
          + Add Education
        </button>
      )}
    </div>
  );
}

/**
 * Skills Section
 */
interface SkillsSectionProps {
  data: Skill[];
  onChange: (data: Skill[]) => void;
  readOnly?: boolean;
}

function SkillsSection({ data, onChange, readOnly }: SkillsSectionProps) {
  const [newSkill, setNewSkill] = useState("");

  const addSkill = () => {
    if (!newSkill.trim()) return;

    const skill: Skill = {
      id: generateId(),
      name: newSkill.trim(),
      category: "technical",
    };
    onChange([...data, skill]);
    setNewSkill("");
  };

  const removeSkill = (id: string) => {
    onChange(data.filter((s) => s.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {data.map((skill) => (
          <span
            key={skill.id}
            className="inline-flex items-center gap-1 px-3 py-1
              bg-fjord-100 text-fjord-700 rounded-full text-sm"
          >
            {skill.name}
            {!readOnly && (
              <button
                onClick={() => removeSkill(skill.id)}
                className="ml-1 text-fjord-500 hover:text-fjord-700"
              >
                &times;
              </button>
            )}
          </span>
        ))}
      </div>

      {!readOnly && (
        <div className="flex gap-2">
          <input
            type="text"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && addSkill()}
            placeholder="Add a skill..."
            className="flex-1 px-4 py-2 border border-neutral-300 rounded-lg
              focus:ring-2 focus:ring-fjord-500 focus:border-transparent"
          />
          <button
            onClick={addSkill}
            className="px-4 py-2 bg-fjord-600 text-white rounded-lg
              hover:bg-fjord-700"
          >
            Add
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Certifications Section
 */
interface CertificationsSectionProps {
  data: Certification[];
  onChange: (data: Certification[]) => void;
  readOnly?: boolean;
}

function CertificationsSection({
  data,
  onChange,
  readOnly,
}: CertificationsSectionProps) {
  // TODO: Implement certifications editor
  // Similar pattern to Experience/Education
  return (
    <div className="text-neutral-500">
      <p>Certifications section coming soon...</p>
      <p className="text-sm mt-2">
        TODO: Add form for certifications with name, issuer, date, credential
        ID, and URL.
      </p>
    </div>
  );
}

/**
 * Projects Section
 */
interface ProjectsSectionProps {
  data: Project[];
  onChange: (data: Project[]) => void;
  readOnly?: boolean;
}

function ProjectsSection({ data, onChange, readOnly }: ProjectsSectionProps) {
  // TODO: Implement projects editor
  return (
    <div className="text-neutral-500">
      <p>Projects section coming soon...</p>
      <p className="text-sm mt-2">
        TODO: Add form for projects with name, description, URL, and
        technologies.
      </p>
    </div>
  );
}

// ===================
// SHARED COMPONENTS
// ===================

/**
 * Reusable form field component
 */
interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
}

function FormField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
  disabled,
  readOnly,
}: FormFieldProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-neutral-700 mb-1">
        {label}
        {required && <span className="text-clay-500 ml-1">*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className="w-full px-4 py-2 border border-neutral-300 rounded-lg
          focus:ring-2 focus:ring-fjord-500 focus:border-transparent
          disabled:bg-neutral-100 disabled:cursor-not-allowed
          read-only:bg-neutral-50"
      />
    </div>
  );
}

export default CVEditor;
