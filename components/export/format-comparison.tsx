import { exportFormatComparison } from '@/lib/content'

export function FormatComparison() {
  return (
    <div className="card-premium p-6">
      <h2 className="text-lg font-semibold mb-6">Format Comparison</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary border-b border-border">
            <tr>
              <th className="px-4 py-3 text-left font-medium">Feature</th>
              <th className="px-4 py-3 text-center font-medium">PDF</th>
              <th className="px-4 py-3 text-center font-medium">DOCX</th>
            </tr>
          </thead>
          <tbody>
            {exportFormatComparison.map((row) => (
              <tr key={row.feature} className="border-b border-border hover:bg-secondary">
                <td className="px-4 py-3">{row.feature}</td>
                <td className="px-4 py-3 text-center">{row.pdf}</td>
                <td className="px-4 py-3 text-center">{row.docx}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
