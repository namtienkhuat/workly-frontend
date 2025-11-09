import * as React from 'react';
import TextareaAutosize, { TextareaAutosizeProps } from 'react-textarea-autosize';

import { cn } from '@/lib/utils';

export interface TextareaProps extends React.ComponentProps<'textarea'> {
    autoResize?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, autoResize = false, ...props }, ref) => {
        const baseClassName = cn(
            'flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className
        );

        if (autoResize) {
            return (
                <TextareaAutosize
                    className={baseClassName}
                    ref={ref as React.Ref<HTMLTextAreaElement>}
                    {...(props as TextareaAutosizeProps)}
                />
            );
        }

        return <textarea className={baseClassName} ref={ref} {...props} />;
    }
);
Textarea.displayName = 'Textarea';

export { Textarea };
