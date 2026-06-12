import type { ParsedResumeDocument, ParsedExperience, ParsedEducation } from './resume-parser-shared'

interface ParserConfidence {
  overallScore: number
  hasEmail: boolean
  hasPhone: boolean
  hasExperience: boolean
  hasEducation: boolean
  hasName: boolean
}

export function parseResumeLocally(text: string): { parsed: ParsedResumeDocument; confidence: ParserConfidence } {
  if (!text || text.length < 10) {
    console.warn('[Parser] Text too short:', text.length)
  }

  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean)
  console.log('[Parser] Total lines:', lines.length, 'First 5:', lines.slice(0, 5))

  // Extract contact info from top of resume
  const contactInfo = extractContactInfo(text)
  console.log('[Parser] Contact info found:', contactInfo)

  const name = extractName(lines, text)
  const title = extractTitle(lines, contactInfo)
  console.log('[Parser] Name:', name, 'Title:', title)

  // Find section boundaries
  const sections = identifySections(lines)
  console.log('[Parser] Sections found:', sections)

  // Parse sections
  const summary = extractSummary(lines, sections)
  const experiences = extractExperiences(lines, sections)
  const education = extractEducation(lines, sections)
  const skills = extractSkills(lines, sections)
  console.log('[Parser] Parsed - exp:', experiences.length, 'edu:', education.length, 'skills:', skills.length)

  const confidence: ParserConfidence = {
    overallScore: calculateConfidence(contactInfo, name, experiences, education),
    hasEmail: !!contactInfo.email,
    hasPhone: !!contactInfo.phone,
    hasExperience: experiences.length > 0,
    hasEducation: education.length > 0,
    hasName: !!name,
  }

  return {
    parsed: {
      name,
      title,
      email: contactInfo.email,
      phone: contactInfo.phone,
      location: contactInfo.location,
      linkedin: contactInfo.linkedin,
      github: contactInfo.github,
      summary,
      skills,
      experiences,
      education,
      projects: [],
    },
    confidence,
  }
}

function extractContactInfo(text: string) {
  const result = {
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    github: '',
  }

  // Email pattern
  const emailMatch = text.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i)
  if (emailMatch) result.email = emailMatch[1]

  // Phone patterns (more flexible, handles (555) 123-4567 format)
  const phoneMatch = text.match(/\(?(\d{3})\)?[\s\-.]?(\d{3})[\s\-.]?(\d{4})/g)
  if (phoneMatch) result.phone = phoneMatch[0].replace(/\s+/g, ' ').trim()

  // LinkedIn (look for URL or username after keyword)
  const linkedinMatch = text.match(/(?:linkedin\.com\/in\/([a-zA-Z0-9\-]+)|linkedin\s*[:|–\-]\s*([a-zA-Z0-9\-]+))/i)
  if (linkedinMatch) result.linkedin = linkedinMatch[1] || linkedinMatch[2] || ''

  // GitHub (look for URL or username after keyword)
  const githubMatch = text.match(/(?:github\.com\/([a-zA-Z0-9\-]+)|github\s*[:|–\-]\s*([a-zA-Z0-9\-]+))/i)
  if (githubMatch) result.github = githubMatch[1] || githubMatch[2] || ''

  // Location (match 2+ word city names like "New York")
  const locationMatch = text.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*),?\s+([A-Z]{2})\b/)
  if (locationMatch) result.location = `${locationMatch[1]}, ${locationMatch[2]}`

  return result
}

function extractName(lines: string[], text: string): string {
  // Usually the first non-empty, short line without special chars
  for (let i = 0; i < Math.min(15, lines.length); i++) {
    const line = lines[i]
    const cleaned = line.replace(/[:,|–\-]/g, ' ').trim()

    if (cleaned.length > 2 && cleaned.length < 80 && !cleaned.includes('@')) {
      // Check if it looks like a name:
      // - Not mostly numbers
      // - 1-5 words (handles middle initials)
      // - Mostly letters and spaces/hyphens
      const wordCount = cleaned.split(/\s+/).filter(Boolean).length
      const hasEmail = cleaned.includes('@')
      const numCount = (cleaned.match(/\d/g) || []).length
      const nonAlphaCount = (cleaned.match(/[^\w\s\-']/g) || []).length

      // Accept if: not email, has 1-5 words, not too many special chars/numbers
      if (!hasEmail && wordCount >= 1 && wordCount <= 5 && numCount <= 1 && nonAlphaCount <= 2) {
        return cleaned
      }
    }
  }
  return ''
}

function extractTitle(lines: string[], contactInfo: ReturnType<typeof extractContactInfo>): string {
  // Look for a line after name that could be a title (shorter than summary)
  const titlePatterns = /\b(engineer|developer|designer|manager|analyst|architect|specialist|lead|director|coordinator|consultant)\b/i

  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i]
    if (line.length > 5 && line.length < 100 && titlePatterns.test(line)) {
      return line
    }
  }
  return ''
}

function identifySections(lines: string[]): Record<string, number> {
  const sectionKeywords = {
    summary: ['summary', 'overview', 'objective', 'profile', 'about', 'introduction'],
    experience: ['experience', 'professional experience', 'work experience', 'employment', 'career', 'roles', 'work history'],
    education: ['education', 'academic', 'qualifications', 'school', 'university', 'degree'],
    skills: ['skills', 'technical skills', 'competencies', 'expertise', 'abilities', 'talents', 'technical'],
    projects: ['projects', 'portfolio', 'achievements', 'accomplishments', 'work samples'],
  }

  const sections: Record<string, number> = {}

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase().trim().replace(/[:\-\|]/g, ' ').trim()

    // Look for section headers (typically short lines)
    const isLikelyHeader = line.length < 80 && line.length > 2 && !line.includes('@')

    for (const [section, keywords] of Object.entries(sectionKeywords)) {
      // Match full keywords as word boundaries
      const matches = keywords.some((kw) => {
        const pattern = new RegExp(`\\b${kw}\\b`, 'i')
        return pattern.test(line)
      })

      if (matches && isLikelyHeader) {
        sections[section] = i
        break
      }
    }
  }

  return sections
}

function extractSummary(lines: string[], sections: Record<string, number>): string {
  const summaryIdx = sections.summary
  if (summaryIdx === undefined) return ''

  const nextSection = Object.values(sections)
    .filter((idx) => idx > summaryIdx)
    .sort()[0]

  const endIdx = nextSection || Math.min(summaryIdx + 5, lines.length)
  const summaryLines = lines.slice(summaryIdx + 1, endIdx).filter((line) => line.length > 0)

  return summaryLines.join(' ').substring(0, 500)
}

function extractExperiences(lines: string[], sections: Record<string, number>): ParsedExperience[] {
  const expIdx = sections.experience
  if (expIdx === undefined) return []

  const nextSection = Object.values(sections)
    .filter((idx) => idx > expIdx)
    .sort()[0] ?? lines.length

  const expLines = lines.slice(expIdx + 1, nextSection)
  const experiences: ParsedExperience[] = []

  let currentExp: Partial<ParsedExperience> | null = null

  for (let i = 0; i < expLines.length; i++) {
    const line = expLines[i]
    const nextLine = i + 1 < expLines.length ? expLines[i + 1] : ''

    // Detect position line (contains job title keywords)
    const titleMatch = /\b(engineer|developer|manager|designer|analyst|architect|specialist|lead|director|coordinator|consultant|director|officer|manager)\b/i.test(line)
    const atMatch = line.match(/\s+at\s+/i)
    const isPosLine = titleMatch && line.length < 120 && !line.startsWith('•')

    if (isPosLine) {
      if (currentExp && (currentExp.company || currentExp.position)) {
        experiences.push({
          company: currentExp.company || '',
          position: currentExp.position || '',
          duration: currentExp.duration || '',
          bullets: currentExp.bullets || [],
        })
      }

      let position = ''
      let company = ''

      if (atMatch) {
        const parts = line.split(/\s+at\s+/i)
        position = parts[0].trim()
        company = parts[1].trim()
      } else {
        position = line
      }

      // Check next line for duration
      let duration = ''
      if (nextLine) {
        const dateMatch = nextLine.match(/(\d{1,2}\/\d{1,2}\/\d{2,4}|\d{4}\s*[-–]\s*\d{4}|\w+\s+\d{4}\s*[-–]\s*(?:\w+\s+)?\d{4}|\w+\s+\d{4}\s*[-–]\s*(?:present|current|now)|present|current)/i)
        if (dateMatch) {
          duration = dateMatch[0]
        }
      }

      currentExp = {
        position,
        company,
        duration,
        bullets: [],
      }
    } else if (currentExp && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))) {
      // Bullet point
      currentExp.bullets = currentExp.bullets || []
      currentExp.bullets.push(line.replace(/^[•\-*]\s*/, ''))
    }
  }

  if (currentExp && (currentExp.company || currentExp.position)) {
    experiences.push({
      company: currentExp.company || '',
      position: currentExp.position || '',
      duration: currentExp.duration || '',
      bullets: currentExp.bullets || [],
    })
  }

  return experiences
}

function extractEducation(lines: string[], sections: Record<string, number>): ParsedEducation[] {
  const eduIdx = sections.education
  if (eduIdx === undefined) return []

  const nextSection = Object.values(sections)
    .filter((idx) => idx > eduIdx)
    .sort()[0] ?? lines.length

  const eduLines = lines.slice(eduIdx + 1, nextSection).filter((l) => l.length > 5)
  const education: ParsedEducation[] = []
  const processed = new Set<string>()

  for (const line of eduLines) {
    if (processed.has(line)) continue

    // Extract degree
    const degreeMatch = line.match(/\b(bachelor|master|phd|associate|diploma|degree|b\.s\.|m\.s\.|b\.a\.|m\.a\.|bs|ms|ba|ma|be|mtech|b\.tech)\b/i)
    let degree = ''
    let field = ''

    if (degreeMatch) {
      degree = degreeMatch[1]
      // Extract field (usually after "in" keyword)
      const fieldMatch = line.match(/(?:in|of)\s+([a-zA-Z\s&]+?)(?:[,]|$)/i)
      if (fieldMatch) {
        field = fieldMatch[1].trim()
      }
    }

    // Extract school name (usually on same line or has university/college keywords)
    const schoolMatch = line.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*)\s+(?:University|College|Institute|School|Academy|State|Tech)\b/i)
    let school = ''
    if (schoolMatch) {
      school = schoolMatch[0].trim()
    } else if (!degreeMatch) {
      // If no degree found, the line might be just a school name
      school = line.trim()
    }

    // Extract graduation year
    let graduation = ''
    const yearMatch = line.match(/(?:graduated?|graduation|class of|expected)\s*(?:in\s+)?(\d{4})|(\d{4})/i)
    if (yearMatch) {
      graduation = yearMatch[1] || yearMatch[2]
    }

    if (school || degree) {
      education.push({
        school,
        degree,
        field,
        graduation,
        duration: '',
      })
      processed.add(line)
    }
  }

  return education
}

function extractField(line: string): string {
  const fieldMatch = line.match(/(?:in|of)\s+([a-zA-Z\s&]+?)(?:[,|–\-]|$)/i)
  return fieldMatch ? fieldMatch[1].trim() : ''
}

function extractSkills(lines: string[], sections: Record<string, number>): string[] {
  const skillsIdx = sections.skills
  if (skillsIdx === undefined) return []

  const nextSection = Object.values(sections)
    .filter((idx) => idx > skillsIdx)
    .sort()[0] ?? lines.length

  const skillLines = lines.slice(skillsIdx + 1, nextSection).filter((l) => l.length > 0)

  if (skillLines.length === 0) return []

  const allSkills: string[] = []

  for (const line of skillLines) {
    // Check if line has a category (contains ":" and isn't just a bullet point)
    if (line.includes(':') && !line.startsWith('•') && !line.startsWith('-')) {
      // Format: "Category: item1, item2, item3"
      const [category, items] = line.split(':').map(s => s.trim())
      if (items) {
        // Split by comma or other delimiters
        const itemList = items.split(/[,;|]/).map(s => s.replace(/^[•\-*]\s*/, '').trim()).filter(Boolean)
        allSkills.push(`${category}: ${itemList.join(', ')}`)
      }
    } else {
      // Just a plain skill item (bullet point or comma-separated)
      const cleaned = line.replace(/^[•\-*]\s*/, '').trim()
      if (cleaned && cleaned.length > 0) {
        allSkills.push(cleaned)
      }
    }
  }

  return allSkills.filter((s) => s.length > 0 && s.length < 200).slice(0, 50)
}

function calculateConfidence(
  contactInfo: ReturnType<typeof extractContactInfo>,
  name: string,
  experiences: ParsedExperience[],
  education: ParsedEducation[],
): number {
  let score = 0

  if (name) score += 15
  if (contactInfo.email) score += 20
  if (contactInfo.phone) score += 15
  if (experiences.length > 0) score += 25
  if (education.length > 0) score += 15
  if (contactInfo.linkedin || contactInfo.github) score += 10

  return Math.min(100, score)
}

export function shouldFallbackToAI(confidence: ParserConfidence): boolean {
  // Fallback if:
  // 1. Missing basic contact info entirely, OR
  // 2. Have contact info but missing BOTH experiences AND education (incomplete parse)

  const hasSomeContact = confidence.hasEmail || confidence.hasPhone || confidence.hasName
  const hasMissingContent = !confidence.hasExperience && !confidence.hasEducation

  // Fallback if missing basic contact, OR have contact but no experience/education
  return !hasSomeContact || (hasSomeContact && hasMissingContent)
}
