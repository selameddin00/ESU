"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import {
  Bold, Italic, Strikethrough, Code, Heading2, Heading3,
  List, ListOrdered, Quote, Minus, Link as LinkIcon,
  Image as ImageIcon, Undo, Redo, Code2,
} from "lucide-react";

const lowlight = createLowlight(common);

interface Props {
  content: string;
  onChange: (html: string) => void;
  onReadTimeChange?: (readTime: string) => void;
  placeholder?: string;
}

function calcReadTime(text: string): string {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / 200))} dk`;
}

export function RichEditor({ content, onChange, onReadTimeChange, placeholder = "Yazmaya başla..." }: Props) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ HTMLAttributes: { style: "max-width:100%;border-radius:8px;" } }),
      Link.configure({ openOnClick: false, HTMLAttributes: { style: "color:var(--accent-primary);text-decoration:underline;" } }),
      Placeholder.configure({ placeholder }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
      onReadTimeChange?.(calcReadTime(editor.getText()));
    },
    editorProps: {
      attributes: {
        style: "min-height:420px;outline:none;font-size:16px;line-height:1.8;color:var(--text-primary);",
      },
    },
  });

  if (!editor) return null;

  const addImage = () => {
    const url = window.prompt("Görsel URL'si:");
    if (url) editor.chain().focus().setImage({ src: url }).run();
  };

  const setLink = () => {
    const url = window.prompt("Link URL'si:");
    if (url) editor.chain().focus().setLink({ href: url }).run();
    else editor.chain().focus().unsetLink().run();
  };

  const tools: Array<{ icon: React.ElementType; action: () => boolean | void; label: string; active?: boolean } | "sep"> = [
    { icon: Undo,          action: () => editor.chain().focus().undo().run(), label: "Geri al" },
    { icon: Redo,          action: () => editor.chain().focus().redo().run(), label: "İleri al" },
    "sep",
    { icon: Bold,          action: () => editor.chain().focus().toggleBold().run(),          label: "Kalın",        active: editor.isActive("bold") },
    { icon: Italic,        action: () => editor.chain().focus().toggleItalic().run(),        label: "İtalik",       active: editor.isActive("italic") },
    { icon: Strikethrough, action: () => editor.chain().focus().toggleStrike().run(),        label: "Üstü çizili",  active: editor.isActive("strike") },
    { icon: Code,          action: () => editor.chain().focus().toggleCode().run(),          label: "Satır içi kod", active: editor.isActive("code") },
    "sep",
    { icon: Heading2,      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), label: "Başlık 2", active: editor.isActive("heading", { level: 2 }) },
    { icon: Heading3,      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), label: "Başlık 3", active: editor.isActive("heading", { level: 3 }) },
    "sep",
    { icon: List,          action: () => editor.chain().focus().toggleBulletList().run(),    label: "Madde listesi",  active: editor.isActive("bulletList") },
    { icon: ListOrdered,   action: () => editor.chain().focus().toggleOrderedList().run(),   label: "Numaralı liste", active: editor.isActive("orderedList") },
    { icon: Quote,         action: () => editor.chain().focus().toggleBlockquote().run(),    label: "Alıntı",         active: editor.isActive("blockquote") },
    { icon: Code2,         action: () => editor.chain().focus().toggleCodeBlock().run(),     label: "Kod bloğu",      active: editor.isActive("codeBlock") },
    { icon: Minus,         action: () => editor.chain().focus().setHorizontalRule().run(),   label: "Yatay çizgi" },
    "sep",
    { icon: LinkIcon,      action: setLink,   label: "Link",   active: editor.isActive("link") },
    { icon: ImageIcon,     action: addImage,  label: "Görsel" },
  ];

  return (
    <div style={{ borderRadius: 14, border: "1px solid var(--border-subtle)", background: "var(--bg-secondary)", overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 2, padding: "10px 12px", borderBottom: "1px solid var(--border-subtle)", background: "var(--bg-tertiary)" }}>
        {tools.map((t, i) =>
          t === "sep" ? (
            <div key={i} style={{ width: 1, height: 24, background: "var(--border-subtle)", margin: "2px 4px", alignSelf: "center" }} />
          ) : (
            <button
              key={i} type="button" title={t.label}
              onClick={() => t.action()}
              style={{
                width: 32, height: 32, borderRadius: 6, border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: t.active ? "rgba(129,140,248,0.2)" : "transparent",
                color: t.active ? "var(--accent-primary)" : "var(--text-muted)",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { if (!t.active) (e.currentTarget as HTMLButtonElement).style.background = "var(--glass-fill)"; }}
              onMouseLeave={(e) => { if (!t.active) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              <t.icon size={16} />
            </button>
          )
        )}
      </div>

      {/* Editor area */}
      <div style={{ padding: "20px 24px" }}>
        <EditorContent editor={editor} />
      </div>

      {/* Word count */}
      <div style={{ padding: "8px 16px", borderTop: "1px solid var(--border-subtle)", fontSize: 12, color: "var(--text-muted)", textAlign: "right" }}>
        {editor.getText().trim().split(/\s+/).filter(Boolean).length} kelime · {calcReadTime(editor.getText())} okuma
      </div>
    </div>
  );
}
