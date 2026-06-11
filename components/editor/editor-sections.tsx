'use client'

import { useEffect, useState } from 'react'
import { Check, ChevronDown, Edit2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { AISuggestionModal } from './ai-suggestion-modal'
import { BulletEditor } from './bullet-editor'

interface Section {
  title: string
  expanded: boolean
}

interface EditorContent {
  name: string
  title: string
  email: string
  phone: string
  linkedin: string
  github: string
  sectionTitles: Record<'summary' | 'experience' | 'education' | 'skills', string>
  summary: string
  company: string
  position: string
  duration: string
  bullets: { id: string; text: string }[]
  educationEntries: { id: string; school: string; degree: string; duration: string }[]
  skills: { id: string; label: string; items: string[] }[]
  customFields: { id: string; label: string; value: string }[]
}

interface EditorSectionsProps {
  onContentChange?: (content: EditorContent) => void
}

export function EditorSections({ onContentChange }: EditorSectionsProps = {}) {
  const [personalInfoExpanded, setPersonalInfoExpanded] = useState(true)
  const [sections, setSections] = useState<Record<string, Section>>({
    summary: { title: 'Professional Summary', expanded: true },
    experience: { title: 'Experience', expanded: true },
    education: { title: 'Education', expanded: false },
    skills: { title: 'Skills', expanded: false },
  })

  const [editingBullet, setEditingBullet] = useState<string | null>(null)
  const [renamingSection, setRenamingSection] = useState<string | null>(null)
  const [aiModal, setAiModal] = useState<{
    isOpen: boolean
    type: 'improve' | 'shorten' | 'fix_grammar'
    original: string
    bulletId: string | null
  }>({
    isOpen: false,
    type: 'improve',
    original: '',
    bulletId: null,
  })
  const [bullets, setBullets] = useState<Record<string, { id: string; text: string }[]>>({
    experience: [],
  })

  const [name, setName] = useState('')
  const [title, setTitle] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [github, setGithub] = useState('')
  const [summary, setSummary] = useState('')
  const [company, setCompany] = useState('')
  const [position, setPosition] = useState('')
  const [duration, setDuration] = useState('')
  const [educationEntries, setEducationEntries] = useState<
    { id: string; school: string; degree: string; duration: string }[]
  >([
    { id: 'education-1', school: '', degree: '', duration: '' },
  ])
  const [skillInputs, setSkillInputs] = useState<Record<string, string>>({})
  const [skills, setSkills] = useState<{ id: string; label: string; items: string[] }[]>([
    { id: 'skills-1', label: 'Languages', items: [] },
    { id: 'skills-2', label: 'Frameworks', items: [] },
    { id: 'skills-3', label: 'Tools', items: [] },
  ])
  const [customFields, setCustomFields] = useState<{ id: string; label: string; value: string }[]>([])

  // Emit changes after state updates complete
  useEffect(() => {
    const content: EditorContent = {
      name,
      title,
      email,
      phone,
      linkedin,
      github,
      sectionTitles: {
        summary: sections.summary.title,
        experience: sections.experience.title,
        education: sections.education.title,
        skills: sections.skills.title,
      },
      summary,
      company,
      position,
      duration,
      bullets: bullets.experience || [],
      educationEntries,
      skills,
      customFields,
    }
    onContentChange?.(content)
  }, [
    name,
    title,
    email,
    phone,
    linkedin,
    github,
    sections.summary.title,
    sections.experience.title,
    sections.education.title,
    sections.skills.title,
    summary,
    company,
    position,
    duration,
    bullets,
    educationEntries,
    skills,
    customFields,
    onContentChange,
  ])

  const getSuggestedText = (original: string, type: 'improve' | 'shorten' | 'fix_grammar') => {
    const suggestions = {
      improve: `${original} while improving measurable impact, clarity, and team outcomes`,
      shorten: `${original.substring(0, Math.max(20, original.length - 30))}...`,
      fix_grammar: original.replace(/reducing/gi, 'reducing'),
    }

    return suggestions[type]
  }

  const openAiSuggestion = (type: 'improve' | 'shorten' | 'fix_grammar', id: string, text: string) => {
    setAiModal({
      isOpen: true,
      type,
      original: text,
      bulletId: id,
    })
  }

  const applyAiSuggestion = (text: string) => {
    if (!aiModal.bulletId) return

    setBullets((prev) => ({
      ...prev,
      experience: prev.experience.map((bullet) =>
        bullet.id === aiModal.bulletId ? { ...bullet, text } : bullet
      ),
    }))

    setEditingBullet(null)
    setAiModal({
      isOpen: false,
      type: 'improve',
      original: '',
      bulletId: null,
    })
  }

  const toggleSection = (key: string) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], expanded: !prev[key].expanded },
    }))
  }

  const handleSectionTitleChange = (key: string, title: string) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], title },
    }))
  }

  const handleEditBullet = (id: string, text: string) => {
    if (editingBullet === id) {
      setEditingBullet(null)
      setBullets((prev) => ({
        ...prev,
        experience: prev.experience.map((b) => (b.id === id ? { ...b, text } : b)),
      }))
    } else {
      setEditingBullet(id)
    }
  }

  const handleDeleteBullet = (id: string) => {
    if (editingBullet === id) {
      setEditingBullet(null)
    }
    setBullets((prev) => ({
      ...prev,
      experience: prev.experience.filter((b) => b.id !== id),
    }))
  }

  const handleAddBullet = () => {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}`

    setBullets((prev) => ({
      ...prev,
      experience: [...prev.experience, { id, text: '' }],
    }))
    setEditingBullet(id)
  }

  const handleAddCustomField = () => {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}`

    setCustomFields((prev) => [...prev, { id, label: '', value: '' }])
  }

  const handleAddSkillGroup = () => {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}`

    setSkills((prev) => [...prev, { id, label: 'New Category', items: [] }])
    setSkillInputs((prev) => ({ ...prev, [id]: '' }))
  }

  const handleUpdateSkillGroup = (id: string, patch: Partial<{ label: string; items: string[] }>) => {
    setSkills((prev) => prev.map((group) => (group.id === id ? { ...group, ...patch } : group)))
  }

  const handleDeleteSkillGroup = (id: string) => {
    setSkills((prev) => prev.filter((group) => group.id !== id))
    setSkillInputs((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
  }

  const handleAddSkillToGroup = (groupId: string) => {
    const value = (skillInputs[groupId] ?? '').trim()
    if (!value) return

    setSkills((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, items: [...group.items, value] } : group
      )
    )
    setSkillInputs((prev) => ({ ...prev, [groupId]: '' }))
  }

  const handleDeleteSkill = (groupId: string, skill: string) => {
    setSkills((prev) =>
      prev.map((group) =>
        group.id === groupId ? { ...group, items: group.items.filter((item) => item !== skill) } : group
      )
    )
  }

  const handleAddEducationEntry = () => {
    const id =
      typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `${Date.now()}`

    setEducationEntries((prev) => [...prev, { id, school: '', degree: '', duration: '' }])
  }

  const handleUpdateEducationEntry = (
    id: string,
    patch: Partial<{ school: string; degree: string; duration: string }>
  ) => {
    setEducationEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry))
    )
  }

  const handleDeleteEducationEntry = (id: string) => {
    setEducationEntries((prev) => prev.filter((entry) => entry.id !== id))
  }

  const handleUpdateCustomField = (id: string, patch: Partial<{ label: string; value: string }>) => {
    setCustomFields((prev) =>
      prev.map((field) => (field.id === id ? { ...field, ...patch } : field))
    )
  }

  const handleDeleteCustomField = (id: string) => {
    setCustomFields((prev) => prev.filter((field) => field.id !== id))
  }

  const handleMoveBullet = (id: string, direction: 'up' | 'down') => {
    setBullets((prev) => {
      const items = [...prev.experience]
      const idx = items.findIndex((b) => b.id === id)
      if (direction === 'up' && idx > 0) {
        ;[items[idx], items[idx - 1]] = [items[idx - 1], items[idx]]
      } else if (direction === 'down' && idx < items.length - 1) {
        ;[items[idx], items[idx + 1]] = [items[idx + 1], items[idx]]
      }
      return { ...prev, experience: items }
    })
  }

  const SectionHeader = ({ sectionKey }: { sectionKey: string }) =>
    renamingSection === sectionKey ? (
      <div className="w-full flex items-center gap-2.5 p-4 bg-gray-50 border-b border-gray-200">
        <input
          autoFocus
          value={sections[sectionKey].title}
          onChange={(e) => handleSectionTitleChange(sectionKey, e.target.value)}
          className="flex-1 min-w-0 px-3 py-2 rounded-md bg-white border border-gray-300 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setRenamingSection(null)}
          title="Save"
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <Check className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setRenamingSection(null)}
          title="Cancel"
          className="text-gray-600 hover:text-gray-700 hover:bg-gray-100"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    ) : (
      <div className="w-full flex items-center justify-between gap-3 p-4 bg-gray-50 border-b border-gray-200 hover:bg-gray-100 transition-colors">
        <button
          type="button"
          onClick={() => toggleSection(sectionKey)}
          className="flex items-center justify-between flex-1 min-w-0 text-left gap-3 group"
        >
          <h3 className="font-semibold text-gray-900 truncate text-sm">{sections[sectionKey].title}</h3>
          <ChevronDown
            className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 group-hover:text-gray-600 ${sections[sectionKey].expanded ? 'rotate-180' : ''}`}
          />
        </button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={() => setRenamingSection(sectionKey)}
          title="Rename"
          className="text-gray-400 hover:text-gray-600 hover:bg-gray-200"
        >
          <Edit2 className="w-4 h-4" />
        </Button>
      </div>
    )

  return (
    <div className="space-y-6">
      {/* Header Section - Personal Info */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between gap-4 p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 text-sm">Personal Information</h3>
            <p className="text-xs text-gray-500 mt-1">Your core identity and contact details</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setPersonalInfoExpanded((prev) => !prev)}
            title={personalInfoExpanded ? 'Collapse' : 'Expand'}
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-200"
          >
            <ChevronDown
              className={`w-4 h-4 transition-transform ${personalInfoExpanded ? 'rotate-180' : ''}`}
            />
          </Button>
        </div>
        {personalInfoExpanded && (
          <div className="p-6 space-y-5 bg-white">
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-gray-700">Full Name</label>
            <input
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-gray-700">Professional Title</label>
            <input
              type="text"
              placeholder="e.g., Senior Full Stack Developer"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <label className="text-xs font-semibold text-gray-700">Email</label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
              />
            </div>
            <div className="grid gap-2">
              <label className="text-xs font-semibold text-gray-700">Phone</label>
              <input
                type="tel"
                placeholder="+1 555 123 4567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-md bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-gray-700">LinkedIn URL</label>
            <input
              type="url"
              placeholder="https://linkedin.com/in/yourname"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-xs font-semibold text-gray-700">GitHub URL</label>
            <input
              type="url"
              placeholder="https://github.com/yourname"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
            />
          </div>
          </div>
        )}
      </div>

      {/* Summary Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
        <SectionHeader sectionKey="summary" />
        {sections.summary.expanded && (
          <div className="p-5 space-y-4 bg-white">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2.5 rounded-md border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none placeholder:text-gray-400"
              rows={4}
              placeholder="Write a compelling professional summary..."
            />
          </div>
        )}
      </div>

      {/* Experience Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
        <SectionHeader sectionKey="experience" />
        {sections.experience.expanded && (
          <div className="p-5 space-y-5 bg-white">
            <div className="space-y-5">
              <div className="space-y-4 p-5 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-gray-700">Company</label>
                  <input
                    type="text"
                    placeholder="e.g., Tech Corporation"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-md bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-gray-700">Position</label>
                  <input
                    type="text"
                    placeholder="e.g., Senior Software Engineer"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-md bg-white border border-gray-300 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                  />
                </div>
                <div className="grid gap-2">
                  <label className="text-xs font-semibold text-gray-700">Duration</label>
                  <DateRangePicker
                    value={duration}
                    onChange={setDuration}
                    presentLabel="I currently work here"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  {bullets.experience.map((bullet, idx) => (
                    <BulletEditor
                      key={bullet.id}
                      bullet={bullet}
                      onEdit={handleEditBullet}
                      onImprove={() => openAiSuggestion('improve', bullet.id, bullet.text)}
                      onShorten={() => openAiSuggestion('shorten', bullet.id, bullet.text)}
                      onDelete={handleDeleteBullet}
                      onMoveUp={() => handleMoveBullet(bullet.id, 'up')}
                      onMoveDown={() => handleMoveBullet(bullet.id, 'down')}
                      isEditing={editingBullet === bullet.id}
                      canMoveUp={idx > 0}
                      canMoveDown={idx < bullets.experience.length - 1}
                    />
                  ))}
                </div>

                <Button variant="outline" size="sm" className="w-full font-medium" onClick={handleAddBullet}>
                  + Add Bullet Point
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Education Section */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
        <SectionHeader sectionKey="education" />
        {sections.education.expanded && (
          <div className="p-5 space-y-4 bg-white">
            <div className="space-y-4">
              {educationEntries.map((entry, idx) => (
                <div key={entry.id} className="rounded-lg border border-gray-200 bg-gray-50 p-5 space-y-4 hover:shadow-sm hover:border-gray-300 transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-gray-900">Education {idx + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEducationEntry(entry.id)}
                      disabled={educationEntries.length === 1}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 font-medium text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-gray-700">School</label>
                      <input
                        value={entry.school}
                        onChange={(e) =>
                          handleUpdateEducationEntry(entry.id, { school: e.target.value })
                        }
                        placeholder="e.g., State University"
                        className="w-full px-3 py-2.5 rounded-md border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-gray-700">Degree</label>
                      <input
                        value={entry.degree}
                        onChange={(e) =>
                          handleUpdateEducationEntry(entry.id, { degree: e.target.value })
                        }
                        placeholder="e.g., B.S. Computer Science"
                        className="w-full px-3 py-2.5 rounded-md border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                  <div className="grid gap-2">
                    <label className="text-xs font-semibold text-gray-700">Duration</label>
                    <DateRangePicker
                      value={entry.duration}
                      onChange={(value) => handleUpdateEducationEntry(entry.id, { duration: value })}
                      presentLabel="I'm currently studying here"
                    />
                  </div>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={handleAddEducationEntry} className="w-full font-medium text-gray-900 border-gray-300 hover:bg-gray-50">
                + Add Education
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skills Section */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
          <SectionHeader sectionKey="skills" />
          {sections.skills.expanded && (
            <div className="p-5 space-y-4 bg-white">
              <div className="grid gap-4">
                {skills.map((group) => (
                  <div key={group.id} className="rounded-lg border border-gray-200 bg-gray-50 p-5 space-y-4 hover:shadow-sm hover:border-gray-300 transition-all">
                    <div className="flex items-center gap-3">
                      <input
                        value={group.label}
                        onChange={(e) => handleUpdateSkillGroup(group.id, { label: e.target.value })}
                        placeholder="Category name"
                        className="flex-1 min-w-0 px-3 py-2 rounded-md border border-gray-300 bg-white text-gray-900 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      />
                      <span className="text-xs text-gray-600 font-semibold whitespace-nowrap bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md">
                        {group.items.length}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleDeleteSkillGroup(group.id)}
                        title="Remove category"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                    {group.items.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {group.items.map((skill) => (
                          <button
                            key={skill}
                            type="button"
                            onClick={() => handleDeleteSkill(group.id, skill)}
                            className="rounded-full border border-blue-300 bg-blue-100 px-3 py-1 text-xs font-medium text-blue-900 hover:bg-red-100 hover:border-red-300 hover:text-red-900 transition-all"
                            title="Click to remove"
                          >
                            {skill} ×
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        value={skillInputs[group.id] ?? ''}
                        onChange={(e) =>
                          setSkillInputs((prev) => ({ ...prev, [group.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            handleAddSkillToGroup(group.id)
                          }
                        }}
                        placeholder="Add skill and press Enter"
                        className="flex-1 px-3 py-2.5 rounded-md border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddSkillToGroup(group.id)}
                        className="font-medium text-gray-900 border-gray-300 hover:bg-gray-50"
                      >
                        Add
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={handleAddSkillGroup} className="w-full font-medium text-gray-900 border-gray-300 hover:bg-gray-50">
                  + Add Category
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Custom Fields */}
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 text-sm">Custom Fields</h3>
            <p className="text-xs text-gray-500 mt-1">Portfolio, location, awards, certifications, etc.</p>
          </div>
          <div className="p-5 space-y-4 bg-white">
            {customFields.length > 0 ? (
              customFields.map((field, idx) => (
                <div key={field.id} className="rounded-lg border border-gray-200 bg-gray-50 p-5 space-y-4 hover:shadow-sm hover:border-gray-300 transition-all">
                  <div className="flex items-center justify-between gap-3">
                    <h4 className="text-sm font-semibold text-gray-900">Field {idx + 1}</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteCustomField(field.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 font-medium text-xs"
                    >
                      Remove
                    </Button>
                  </div>
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-gray-700">Label</label>
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) => handleUpdateCustomField(field.id, { label: e.target.value })}
                        placeholder="e.g., Certifications"
                        className="w-full px-3 py-2.5 rounded-md border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="text-xs font-semibold text-gray-700">Value</label>
                      <input
                        type="text"
                        value={field.value}
                        onChange={(e) => handleUpdateCustomField(field.id, { value: e.target.value })}
                        placeholder="Enter the value"
                        className="w-full px-3 py-2.5 rounded-md border border-gray-300 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <p className="text-sm text-gray-600">No custom fields yet</p>
                <p className="text-xs text-gray-500 mt-1">Add fields to showcase achievements</p>
              </div>
            )}
            <Button variant="outline" size="sm" onClick={handleAddCustomField} className="w-full font-medium text-gray-900 border-gray-300 hover:bg-gray-50">
              + Add Field
            </Button>
          </div>
        </div>
      </div>

      <AISuggestionModal
        isOpen={aiModal.isOpen}
        originalText={aiModal.original}
        suggestedText={getSuggestedText(aiModal.original, aiModal.type)}
        actionType={aiModal.type}
        onApply={applyAiSuggestion}
        onClose={() =>
          setAiModal({
            isOpen: false,
            type: 'improve',
            original: '',
            bulletId: null,
          })
        }
      />
    </div>
  )
}
