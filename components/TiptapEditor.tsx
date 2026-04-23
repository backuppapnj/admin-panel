'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Link as LinkIcon,
  Link2Off,
} from 'lucide-react';
import { useEffect } from 'react';

interface TiptapEditorProps {
  content?: string;
  onChange?: (html: string) => void;
}

export function TiptapEditor({ content = '', onChange }: TiptapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2],
        },
      }),
      Placeholder.configure({
        placeholder: 'Tulis uraian tugas di sini...',
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
  });

  // Sync external content changes (for edit page)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, { emitUpdate: false });
    }
  }, [content, editor]);

  if (!editor) {
    return (
      <div className="border rounded-lg min-h-[200px] bg-muted/30 animate-pulse" />
    );
  }

  const ToolbarButton = ({
    onClick,
    isActive,
    icon: Icon,
    title,
  }: {
    onClick: () => void;
    isActive: boolean;
    icon: React.ElementType;
    title: string;
  }) => (
    <Button
      type="button"
      variant={isActive ? 'default' : 'ghost'}
      size="sm"
      className="h-8 w-8 p-0"
      onClick={onClick}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  const setLink = () => {
    const url = window.prompt('Masukkan URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="border-b px-2 py-1.5 flex flex-wrap items-center gap-0.5 bg-muted/30">
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={Bold}
          title="Bold"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={Italic}
          title="Italic"
        />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={editor.isActive('heading', { level: 1 })}
          icon={Heading1}
          title="Heading 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={Heading2}
          title="Heading 2"
        />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={List}
          title="Bullet List"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={ListOrdered}
          title="Ordered List"
        />
        <div className="w-px h-5 bg-border mx-1" />
        <ToolbarButton
          onClick={setLink}
          isActive={editor.isActive('link')}
          icon={LinkIcon}
          title="Insert Link"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().unsetLink().run()}
          isActive={false}
          icon={Link2Off}
          title="Remove Link"
        />
      </div>

      {/* Editor Content */}
      <EditorContent
        editor={editor}
        className="prose prose-sm max-w-none px-4 py-3 min-h-[200px] focus:outline-none"
      />
    </div>
  );
}
