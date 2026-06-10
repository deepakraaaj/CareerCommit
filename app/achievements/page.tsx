'use client'

import { useState } from 'react'
import {
  Plus,
  Zap,
  Check,
  MoreVertical,
  Wand2,
  Minus,
  Plus as PlusIcon,
  GitCompare,
  Trash2,
} from 'lucide-react'
import { Navbar } from '@/components/navbar'
import { Button } from '@/components/ui/button'
import { mockAchievementNotes, projectList, tagList } from '@/lib/mock-data'
import { getStatusColor } from '@/lib/utils'
import type { AchievementNote } from '@/lib/types'

export default function Achievements() {
  const [notes, setNotes] = useState<AchievementNote[]>(mockAchievementNotes)
  const [newNote, setNewNote] = useState('')
  const [selectedProject, setSelectedProject] = useState('')
  const [selectedDate, setSelectedDate] = useState('2024-06-10')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const handleSaveNote = () => {
    if (newNote.trim()) {
      const note: AchievementNote = {
        id: String(notes.length + 1),
        rawNote: newNote,
        resumeBullet: null,
        project: selectedProject || 'Uncategorized',
        date: selectedDate,
        tags: selectedTags,
        status: 'Draft',
        createdAt: new Date().toISOString(),
      }
      setNotes([note, ...notes])
      setNewNote('')
      setSelectedProject('')
      setSelectedTags([])
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const deleteNote = (id: string) => {
    setNotes(notes.filter((n) => n.id !== id))
  }

  const getTimelineGroup = (date: string) => {
    // Use a fixed reference date to avoid hydration issues
    const referenceDate = new Date('2024-06-10')
    const noteDate = new Date(date)
    const weekAgo = new Date(referenceDate.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(referenceDate.getTime() - 30 * 24 * 60 * 60 * 1000)

    if (noteDate >= weekAgo) return 'This Week'
    if (noteDate >= monthAgo) return 'This Month'
    return 'Older'
  }

  const groupedNotes = notes.reduce(
    (acc, note) => {
      const period = getTimelineGroup(note.date)
      if (!acc[period]) acc[period] = []
      acc[period].push(note)
      return acc
    },
    {} as Record<string, AchievementNote[]>
  )

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="mb-12">
            <h1 className="text-4xl font-bold mb-2">Achievement Notes</h1>
            <p className="text-muted-foreground">
              Stop procrastinating resume updates. Save raw work notes over time and convert them to resume bullets.
            </p>
          </div>

          {/* New Note Input Card */}
          <div className="card-premium p-6 mb-8">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5" />
              What did you work on recently?
            </h2>

            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Example: Fixed unauthorized RFID scan issue, updated issue/return workflow, and gave demo to Kote users."
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none mb-4"
              rows={3}
            />

            <div className="grid sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Project</label>
                <select
                  value={selectedProject}
                  onChange={(e) => setSelectedProject(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="">Select project...</option>
                  {projectList.map((proj) => (
                    <option key={proj} value={proj}>
                      {proj}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1">Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-xs font-medium text-muted-foreground mb-2">Tags</label>
              <div className="flex flex-wrap gap-2">
                {tagList.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`text-xs px-2 py-1 rounded-full transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-muted-foreground hover:bg-secondary/80'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button onClick={handleSaveNote} className="gap-2">
                <Plus className="w-4 h-4" />
                Save Note
              </Button>
            </div>
          </div>

          {/* Empty State */}
          {notes.length === 0 && (
            <div className="card-premium p-12 text-center">
              <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No achievements saved yet</h3>
              <p className="text-muted-foreground">Start by adding one small work update.</p>
            </div>
          )}

          {/* Timeline Grouped Notes */}
          {['This Week', 'This Month', 'Older'].map((period) => {
            const periodNotes = groupedNotes[period]
            if (!periodNotes || periodNotes.length === 0) return null

            return (
              <div key={period} className="mb-12">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-4">
                  {period}
                </h3>
                <div className="space-y-3">
                  {periodNotes.map((note) => (
                    <div key={note.id} className="card-premium p-6">
                      <div className="mb-3 flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span
                              className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(note.status)}`}
                            >
                              {note.status}
                            </span>
                            <span className="text-xs text-muted-foreground">{note.date}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{note.project}</p>
                        </div>
                        <button className="text-muted-foreground hover:text-foreground">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="mb-3">
                        <p className="text-sm mb-3">{note.rawNote}</p>

                        {note.resumeBullet && (
                          <div className="bg-secondary rounded p-3 mb-3">
                            <p className="text-xs font-medium text-muted-foreground mb-1">Resume Bullet</p>
                            <p className="text-sm">{note.resumeBullet}</p>
                          </div>
                        )}
                      </div>

                      {note.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {note.tags.map((tag) => (
                            <span key={tag} className="text-xs px-2 py-1 rounded-full bg-secondary text-muted-foreground">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex flex-wrap gap-2 pt-3 border-t border-border">
                        {!note.resumeBullet && (
                          <>
                            <Button variant="outline" size="sm" className="gap-1 text-xs">
                              <Wand2 className="w-3 h-3" />
                              Improve
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1 text-xs">
                              <Minus className="w-3 h-3" />
                              Shorten
                            </Button>
                          </>
                        )}

                        {note.status !== 'Added to Resume' && (
                          <>
                            <Button variant="outline" size="sm" className="gap-1 text-xs">
                              <PlusIcon className="w-3 h-3" />
                              Add to Current
                            </Button>
                            <Button variant="outline" size="sm" className="gap-1 text-xs">
                              <Check className="w-3 h-3" />
                              New Version
                            </Button>
                          </>
                        )}

                        <Button
                          variant="ghost"
                          size="sm"
                          className="gap-1 text-xs text-destructive hover:text-destructive ml-auto"
                          onClick={() => deleteNote(note.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </>
  )
}
