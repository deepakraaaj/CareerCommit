/**
 * Helper functions for version control
 * Generates smart descriptions and change summaries
 */

export type EditorContent = {
  name: string
  title: string
  email: string
  phone: string
  linkedin: string
  github: string
  sectionTitles: Record<'summary' | 'experience' | 'education' | 'skills', string>
  summary: string
  experiences: Array<{
    id: string
    company: string
    position: string
    duration: string
    bullets: Array<{ id: string; text: string }>
    expanded?: boolean
  }>
  educationEntries: Array<{
    id: string
    school: string
    degree: string
    duration: string
    expanded?: boolean
  }>
  skills: Array<{ id: string; label: string; items: string[] }>
  customFields: Array<{ id: string; label: string; value: string }>
  accentColor: string
  density: 'airy' | 'normal' | 'compact' | 'auto'
  fontFamily: 'sans' | 'serif' | 'mono'
}

/**
 * Detects changes between two resume versions
 * Returns a human-readable summary of what changed
 */
export function detectChanges(current: EditorContent, previous?: EditorContent): {
  summary: string
  hasChanges: boolean
  changes: string[]
} {
  if (!previous) {
    return {
      summary: 'Initial resume version',
      hasChanges: true,
      changes: ['Complete resume created'],
    }
  }

  const changes: string[] = []

  // Check contact info changes
  if (current.name !== previous.name && current.name.trim()) {
    changes.push(`Updated name to "${current.name}"`)
  }

  if (current.title !== previous.title && current.title.trim()) {
    changes.push(`Changed title to "${current.title}"`)
  }

  if (current.email !== previous.email && current.email.trim()) {
    changes.push('Updated email')
  }

  if (current.phone !== previous.phone && current.phone.trim()) {
    changes.push('Updated phone')
  }

  // Check summary changes
  const summaryChanged = current.summary !== previous.summary
  const summaryAdded = current.summary.trim() && !previous.summary.trim()
  const summaryLength = current.summary.trim().length
  const previousSummaryLength = (previous.summary || '').trim().length

  if (summaryChanged) {
    if (summaryAdded) {
      changes.push('Added professional summary')
    } else if (!current.summary.trim() && previous.summary.trim()) {
      changes.push('Removed professional summary')
    } else if (summaryLength > previousSummaryLength + 50) {
      changes.push('Expanded professional summary')
    } else if (summaryLength < previousSummaryLength - 50) {
      changes.push('Shortened professional summary')
    } else {
      changes.push('Updated professional summary')
    }
  }

  // Check experience changes
  const currentExpCount = current.experiences.filter((e) => e.company.trim() || e.position.trim()).length
  const previousExpCount = previous.experiences.filter((e) => e.company.trim() || e.position.trim()).length

  if (currentExpCount > previousExpCount) {
    changes.push(`Added ${currentExpCount - previousExpCount} experience entries`)
  } else if (currentExpCount < previousExpCount) {
    changes.push(`Removed ${previousExpCount - currentExpCount} experience entries`)
  } else if (JSON.stringify(current.experiences) !== JSON.stringify(previous.experiences)) {
    // Count bullet changes
    let bulletsAdded = 0
    let bulletsRemoved = 0

    current.experiences.forEach((exp, idx) => {
      const prevExp = previous.experiences[idx]
      if (prevExp) {
        const currBullets = exp.bullets.filter((b) => b.text.trim()).length
        const prevBullets = prevExp.bullets.filter((b) => b.text.trim()).length

        if (currBullets > prevBullets) {
          bulletsAdded += currBullets - prevBullets
        } else if (currBullets < prevBullets) {
          bulletsRemoved += currBullets - prevBullets
        }
      }
    })

    if (bulletsAdded > 0) {
      changes.push(`Added ${bulletsAdded} bullet point${bulletsAdded > 1 ? 's' : ''} to experience`)
    }
    if (bulletsRemoved > 0) {
      changes.push(`Removed ${bulletsRemoved} bullet point${bulletsRemoved > 1 ? 's' : ''} from experience`)
    }
    if (bulletsAdded === 0 && bulletsRemoved === 0) {
      changes.push('Updated experience section')
    }
  }

  // Check education changes
  const currentEduCount = current.educationEntries.filter((e) => e.school.trim() || e.degree.trim()).length
  const previousEduCount = previous.educationEntries.filter((e) => e.school.trim() || e.degree.trim()).length

  if (currentEduCount > previousEduCount) {
    changes.push(`Added ${currentEduCount - previousEduCount} education entries`)
  } else if (currentEduCount < previousEduCount) {
    changes.push(`Removed ${previousEduCount - currentEduCount} education entries`)
  } else if (JSON.stringify(current.educationEntries) !== JSON.stringify(previous.educationEntries)) {
    changes.push('Updated education section')
  }

  // Check skills changes
  const currentSkillCount = current.skills.reduce((sum, s) => sum + s.items.length, 0)
  const previousSkillCount = previous.skills.reduce((sum, s) => sum + s.items.length, 0)

  if (currentSkillCount > previousSkillCount) {
    changes.push(`Added ${currentSkillCount - previousSkillCount} skill${currentSkillCount - previousSkillCount > 1 ? 's' : ''}`)
  } else if (currentSkillCount < previousSkillCount) {
    changes.push(`Removed ${previousSkillCount - currentSkillCount} skill${previousSkillCount - currentSkillCount > 1 ? 's' : ''}`)
  } else if (JSON.stringify(current.skills) !== JSON.stringify(previous.skills)) {
    changes.push('Updated skills section')
  }

  // Check custom fields
  const currentCustomCount = current.customFields.filter((f) => f.label.trim() && f.value.trim()).length
  const previousCustomCount = previous.customFields.filter((f) => f.label.trim() && f.value.trim()).length

  if (currentCustomCount > previousCustomCount) {
    const added = currentCustomCount - previousCustomCount
    const newFields = current.customFields
      .filter((f) => f.label.trim() && f.value.trim())
      .map((f) => f.label)
      .slice(-added)
      .join(', ')
    changes.push(`Added ${newFields}`)
  } else if (currentCustomCount < previousCustomCount) {
    changes.push(`Removed custom field${previousCustomCount - currentCustomCount > 1 ? 's' : ''}`)
  } else if (JSON.stringify(current.customFields) !== JSON.stringify(previous.customFields)) {
    changes.push('Updated custom fields')
  }

  // Check formatting changes
  const formattingChanged =
    current.accentColor !== previous.accentColor ||
    current.density !== previous.density ||
    current.fontFamily !== previous.fontFamily

  if (formattingChanged) {
    const formatChanges = []
    if (current.accentColor !== previous.accentColor) formatChanges.push('color')
    if (current.density !== previous.density) formatChanges.push('spacing')
    if (current.fontFamily !== previous.fontFamily) formatChanges.push('font')
    changes.push(`Updated ${formatChanges.join(', ')}`)
  }

  // Generate summary
  let summary = ''
  if (changes.length === 0) {
    summary = 'No significant changes detected'
  } else if (changes.length === 1) {
    summary = changes[0]
  } else if (changes.length <= 3) {
    summary = changes.join(', ')
  } else {
    summary = changes.slice(0, 2).join(', ') + `, and ${changes.length - 2} more change${changes.length - 2 > 1 ? 's' : ''}`
  }

  return {
    summary,
    hasChanges: changes.length > 0,
    changes,
  }
}

/**
 * Generates a default version title based on changes
 */
export function generateVersionTitle(changes: string[]): string {
  if (changes.length === 0) return 'Minor updates'

  // Take the first change and use it as title
  const firstChange = changes[0]

  // Truncate if too long
  if (firstChange.length > 40) {
    return firstChange.substring(0, 37) + '...'
  }

  return firstChange
}

/**
 * Formats section changes for display
 */
export function formatSectionChanges(
  sectionChanges: Record<string, 'added' | 'modified' | 'removed' | 'unchanged'>
): string[] {
  const changed = Object.entries(sectionChanges)
    .filter(([_, status]) => status !== 'unchanged')
    .map(([section, status]) => {
      const icons: Record<string, string> = {
        added: '✨',
        modified: '✏️',
        removed: '❌',
      }
      const names: Record<string, string> = {
        name: 'Name',
        title: 'Title',
        summary: 'Summary',
        experiences: 'Experience',
        educationEntries: 'Education',
        skills: 'Skills',
        customFields: 'Custom Fields',
      }

      return `${icons[status] || '•'} ${names[section] || section}`
    })

  return changed
}
