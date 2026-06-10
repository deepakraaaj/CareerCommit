'use client'

import { Eye, Download, Trash2 } from 'lucide-react'
import { getStatusColor } from '@/lib/utils'
import type { Resume } from '@/lib/types'

interface ResumeTableProps {
  resumes: Resume[]
}

export function ResumeTable({ resumes }: ResumeTableProps) {
  return (
    <div className="card-premium">
      <div className="border-b border-border p-6">
        <h2 className="text-xl font-semibold">Your Resumes</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-medium">Name</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Versions</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Last Modified</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-6 py-3 text-left text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {resumes.map((resume) => (
              <tr key={resume.id} className="border-b border-border hover:bg-secondary transition-colors">
                <td className="px-6 py-4 font-medium">{resume.name}</td>
                <td className="px-6 py-4 text-muted-foreground">{resume.versions} versions</td>
                <td className="px-6 py-4 text-muted-foreground">{resume.lastModified}</td>
                <td className="px-6 py-4">
                  <span className={`text-xs font-medium px-3 py-1 rounded-full ${getStatusColor(resume.status || 'Draft')}`}>
                    {resume.status || 'Draft'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex gap-2">
                    <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="View">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" title="Download">
                      <Download className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-muted-foreground hover:text-destructive transition-colors" title="Delete">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
