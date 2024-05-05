import markdownStyles from './markdown-styles.module.css'

import 'highlight.js/styles/github.css'

type Props = {
  content: string
}

export function PostBody({ content }: Props) {
  return (
    <div className="mx-auto max-w-3xl">
      <div
        className={markdownStyles['markdown']}
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  )
}
