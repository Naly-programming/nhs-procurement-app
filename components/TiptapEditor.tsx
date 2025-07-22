import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { useEffect } from 'react'

interface Props {
  content: string
  onUpdate: (html: string) => void
}

export default function TiptapEditor({ content, onUpdate }: Props) {
  const editor = useEditor({
    extensions: [StarterKit],
    content,
    onUpdate({ editor }) {
      onUpdate(editor.getHTML())
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  return (
    <div className="border p-2 rounded">
      <EditorContent editor={editor} className="prose" />
    </div>
  )
}
