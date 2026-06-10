'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
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
  summary: string
  company: string
  position: string
  duration: string
  bullets: { id: string; text: string }[]
  education: string
  skills: string
}

interface EditorSectionsProps {
  onContentChange?: (content: EditorContent) => void
}

export function EditorSections({ onContentChange }: EditorSectionsProps = {}) {
  const [sections, setSections] = useState<Record<string, Section>>({
    summary: { title: 'Professional Summary', expanded: true },
    experience: { title: 'Experience', expanded: true },
    education: { title: 'Education', expanded: false },
    skills: { title: 'Skills', expanded: false },
  })

  const [editingBullet, setEditingBullet] = useState<string | null>(null)
  const [bullets, setBullets] = useState<Record<string, { id: string; text: string }[]>>({
    experience: [
      {
        id: '1',
        text: 'Led development of microservices architecture serving 100K+ users',
      },
      {
        id: '2',
        text: 'Implemented automated testing pipeline reducing bugs by 45%',
      },
      {
        id: '3',
        text: 'Mentored team of 5 junior developers',
      },
    ],
  })

  const [name, setName] = useState('John Doe')
  const [title, setTitle] = useState('Senior Full Stack Developer')
  const [email, setEmail] = useState('john.doe@example.com')
  const [phone, setPhone] = useState('(555) 123-4567')
  const [summary, setSummary] = useState(
    'Experienced Full Stack Developer with 8 years of expertise in building scalable web applications. Proficient in modern JavaScript frameworks, cloud technologies, and agile methodologies.'
  )
  const [company, setCompany] = useState('TechCorp Inc.')
  const [position, setPosition] = useState('Senior Developer')
  const [duration, setDuration] = useState('2022 - Present')
  const [education, setEducation] = useState('Bachelor of Science in Computer Science | State University | 2019')
  const [skills, setSkills] = useState(
    'Languages: JavaScript, TypeScript, Python, SQL\nFrameworks: React, Next.js, Node.js, Express\nTools: AWS, Docker, PostgreSQL, Git'
  )

  // Emit changes after state updates complete
  useEffect(() => {
    const content: EditorContent = {
      name,
      title,
      email,
      phone,
      summary,
      company,
      position,
      duration,
      bullets: bullets.experience || [],
      education,
      skills,
    }
    onContentChange?.(content)
  }, [name, title, email, phone, summary, company, position, duration, bullets, education, skills, onContentChange])

  const toggleSection = (key: string) => {
    setSections((prev) => ({
      ...prev,
      [key]: { ...prev[key], expanded: !prev[key].expanded },
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

  const SectionHeader = ({ sectionKey }: { sectionKey: string }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between p-4 bg-secondary/50 hover:bg-secondary transition-colors rounded-lg"
    >
      <h3 className="font-semibold">{sections[sectionKey].title}</h3>
      <ChevronDown
        className={`w-5 h-5 transition-transform ${sections[sectionKey].expanded ? 'rotate-180' : ''}`}
      />
    </button>
  )

  return (
    <div className="space-y-4">
      {/* Header Section */}
      <div className="border border-border rounded-lg overflow-hidden bg-secondary/20 p-4">
        <h3 className="font-semibold text-sm mb-3">Personal Info</h3>
        <div className="space-y-2">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 rounded bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <input
            type="text"
            placeholder="Professional Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 rounded bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <div className="grid grid-cols-2 gap-2">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-3 py-2 rounded bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <input
              type="tel"
              placeholder="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="px-3 py-2 rounded bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Summary Section */}
      <div className="border border-border rounded-lg overflow-hidden">
        <SectionHeader sectionKey="summary" />
        {sections.summary.expanded && (
          <div className="p-4 space-y-3 border-t border-border">
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
            />
          </div>
        )}
      </div>

      {/* Experience Section */}
      <div className="border border-border rounded-lg overflow-hidden">
        <SectionHeader sectionKey="experience" />
        {sections.experience.expanded && (
          <div className="p-4 space-y-4 border-t border-border">
            <div className="space-y-4">
              <div className="space-y-3 p-4 bg-secondary/30 rounded-lg">
                <input
                  type="text"
                  placeholder="Company"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Position"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="px-3 py-2 rounded bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <input
                    type="text"
                    placeholder="Duration"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="px-3 py-2 rounded bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                <div className="space-y-2">
                  {bullets.experience.map((bullet, idx) => (
                    <BulletEditor
                      key={bullet.id}
                      bullet={bullet}
                      onEdit={handleEditBullet}
                      onImprove={() => console.log('improve:', bullet.id)}
                      onShorten={() => console.log('shorten:', bullet.id)}
                      onDelete={handleDeleteBullet}
                      onMoveUp={() => handleMoveBullet(bullet.id, 'up')}
                      onMoveDown={() => handleMoveBullet(bullet.id, 'down')}
                      isEditing={editingBullet === bullet.id}
                      canMoveUp={idx > 0}
                      canMoveDown={idx < bullets.experience.length - 1}
                    />
                  ))}
                </div>

                <Button variant="outline" size="sm" className="w-full" onClick={handleAddBullet}>
                  Add bullet point
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Education Section */}
      <div className="border border-border rounded-lg overflow-hidden">
        <SectionHeader sectionKey="education" />
        {sections.education.expanded && (
          <div className="p-4 space-y-3 border-t border-border">
            <textarea
              value={education}
              onChange={(e) => setEducation(e.target.value)}
              className="w-full p-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={2}
            />
          </div>
        )}
      </div>

      {/* Skills Section */}
      <div className="border border-border rounded-lg overflow-hidden">
        <SectionHeader sectionKey="skills" />
        {sections.skills.expanded && (
          <div className="p-4 space-y-3 border-t border-border">
            <textarea
              value={skills}
              onChange={(e) => setSkills(e.target.value)}
              className="w-full p-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              rows={3}
            />
          </div>
        )}
      </div>
    </div>
  )
}
