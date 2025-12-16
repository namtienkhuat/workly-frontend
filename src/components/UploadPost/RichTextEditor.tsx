'use client';

import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TextStyle } from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Underline as UnderlineIcon, Palette, X } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    error?: string;
}

export default function RichTextEditor({
    content,
    onChange,
    placeholder = "What's on your mind?",
    error,
}: RichTextEditorProps) {
    const [showColorPicker, setShowColorPicker] = useState(false);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            TextStyle,
            Color,
            Placeholder.configure({
                placeholder,
                emptyEditorClass:
                    'cursor-text before:content-[attr(data-placeholder)] before:absolute before:top-4 before:left-4 before:text-muted-foreground before:pointer-events-none',
            }),
        ],
        content,
        immediatelyRender: false,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'focus:outline-none min-h-[120px]',
            },
        },
    });

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content);
        }
    }, [content, editor]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (showColorPicker && !target.closest('#color-picker-container')) {
                setShowColorPicker(false);
            }
        };

        if (showColorPicker) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
        return undefined;
    }, [showColorPicker]);

    if (!editor) {
        return (
            <div className="space-y-2">
                <div className="flex items-center gap-1 p-2 border border-input rounded-lg bg-muted/30 flex-wrap">
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                    <div className="h-8 w-8 bg-muted animate-pulse rounded" />
                </div>
                <div className="border border-input rounded-xl bg-background min-h-[120px] p-4">
                    <div className="h-4 w-full bg-muted animate-pulse rounded" />
                </div>
            </div>
        );
    }

    const setColor = (color: string) => {
        editor.chain().focus().setColor(color).run();
        setShowColorPicker(false);
    };

    return (
        <div className="space-y-2">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border border-input rounded-lg bg-muted/30 flex-wrap">
                {/* Text Formatting */}
                <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleBold().run()}
                        disabled={!editor.can().chain().focus().toggleBold().run()}
                        className={cn('h-8 w-8 p-0', editor.isActive('bold') && 'bg-accent')}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                        disabled={!editor.can().chain().focus().toggleItalic().run()}
                        className={cn('h-8 w-8 p-0', editor.isActive('italic') && 'bg-accent')}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                        className={cn('h-8 w-8 p-0', editor.isActive('underline') && 'bg-accent')}
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </Button>
                </div>

                {/* Color Picker */}
                <div className="flex items-center gap-1 border-r border-border pr-2 mr-2">
                    <div id="color-picker-container" className="relative">
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className={cn(
                                'h-8 w-8 p-0 relative',
                                editor.isActive('textStyle') && 'bg-accent',
                                showColorPicker && 'bg-accent'
                            )}
                        >
                            <Palette className="h-4 w-4" />
                        </Button>
                        {showColorPicker && (
                            <div className="absolute top-full left-0 mt-2 p-4 bg-popover border border-border/50 rounded-xl shadow-2xl z-50 animate-in fade-in-0 zoom-in-95 slide-in-from-top-2 duration-200 min-w-[240px] backdrop-blur-sm">
                                {/* Header */}
                                <div className="flex items-center justify-between mb-3 pb-2 border-b border-border/50">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-lg bg-primary/10">
                                            <Palette className="h-3.5 w-3.5 text-primary" />
                                        </div>
                                        <span className="text-sm font-semibold text-foreground">
                                            Text Color
                                        </span>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0 hover:bg-muted rounded-md"
                                        onClick={() => setShowColorPicker(false)}
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </Button>
                                </div>

                                {/* Color Grid */}
                                <div className="grid grid-cols-6 gap-2.5">
                                    {[
                                        { name: 'Black', color: '#000000' },
                                        { name: 'Red', color: '#FF0000' },
                                        { name: 'Green', color: '#00FF00' },
                                        { name: 'Blue', color: '#0000FF' },
                                        { name: 'Yellow', color: '#FFFF00' },
                                        { name: 'Magenta', color: '#FF00FF' },
                                        { name: 'Cyan', color: '#00FFFF' },
                                        { name: 'Orange', color: '#FFA500' },
                                        { name: 'Purple', color: '#800080' },
                                        { name: 'Pink', color: '#FFC0CB' },
                                        { name: 'Brown', color: '#A52A2A' },
                                        { name: 'Gray', color: '#808080' },
                                    ].map(({ name, color }) => (
                                        <button
                                            key={color}
                                            type="button"
                                            className="group relative w-9 h-9 rounded-lg border-2 border-border/60 hover:border-primary hover:scale-110 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-1"
                                            style={{ backgroundColor: color }}
                                            onClick={() => setColor(color)}
                                            title={name}
                                        >
                                            <span className="absolute inset-0 rounded-lg bg-white/0 group-hover:bg-white/10 transition-colors" />
                                            {color === '#000000' && (
                                                <span className="absolute inset-0 flex items-center justify-center">
                                                    <span className="w-3 h-3 rounded-full bg-white/80" />
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>

                                {/* Footer hint */}
                                <div className="mt-3 pt-2 border-t border-border/50">
                                    <p className="text-xs text-muted-foreground text-center">
                                        Select text to change color
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Headings */}
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                        className={cn(
                            'h-8 px-2 text-xs',
                            editor.isActive('heading', { level: 1 }) && 'bg-accent'
                        )}
                    >
                        H1
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                        className={cn(
                            'h-8 px-2 text-xs',
                            editor.isActive('heading', { level: 2 }) && 'bg-accent'
                        )}
                    >
                        H2
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                        className={cn(
                            'h-8 px-2 text-xs',
                            editor.isActive('heading', { level: 3 }) && 'bg-accent'
                        )}
                    >
                        H3
                    </Button>
                </div>
            </div>

            {/* Editor */}
            <div
                className={cn(
                    'border border-input rounded-xl bg-background focus-within:ring-2 focus-within:ring-ring focus-within:border-transparent transition-all relative',
                    error && 'border-destructive'
                )}
            >
                <EditorContent
                    editor={editor}
                    className="min-h-[120px] [&_.ProseMirror]:outline-none [&_.ProseMirror]:p-4 [&_.ProseMirror]:min-h-[120px] [&_.ProseMirror]:text-foreground [&_.ProseMirror]:prose [&_.ProseMirror]:prose-sm [&_.ProseMirror]:max-w-none [&_.ProseMirror_p.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_p.is-editor-empty:first-child::before]:absolute [&_.ProseMirror_p.is-editor-empty:first-child::before]:text-muted-foreground [&_.ProseMirror_p.is-editor-empty:first-child::before]:pointer-events-none"
                />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
