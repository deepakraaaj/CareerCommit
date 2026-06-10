export function EditorTips() {
  const tips = [
    {
      title: 'ATS Optimization',
      description: 'Use simple formatting and standard fonts. Avoid images and complex layouts.',
    },
    {
      title: 'Word Count',
      description: 'Aim for 250-500 words. Include relevant keywords from job descriptions.',
    },
    {
      title: 'Save Often',
      description: 'Each save creates a new version. You can always restore previous versions.',
    },
  ]

  return (
    <div className="grid md:grid-cols-3 gap-6 mt-8">
      {tips.map((tip) => (
        <div key={tip.title} className="card-premium p-6">
          <div className="font-semibold mb-2">{tip.title}</div>
          <p className="text-sm text-muted-foreground">{tip.description}</p>
        </div>
      ))}
    </div>
  )
}
