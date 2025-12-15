import { useState } from "react";

export default function ShowMore({ text }: { text: string }) {
    const LIMIT = 300;
    const [expanded, setExpanded] = useState(false);

    // Check if text contains HTML tags
    const isHTML = /<[^>]+>/.test(text);
    
    // For HTML content, strip tags to get plain text length for truncation
    const plainText = isHTML ? text.replace(/<[^>]*>/g, '') : text;
    const shouldTruncate = plainText.length > LIMIT;

    // For HTML, show full content when expanded, otherwise show truncated plain text preview
    const displayContent = expanded || !shouldTruncate 
        ? text 
        : plainText.slice(0, LIMIT) + "...";

    return (
        <div className="w-full">
            {isHTML ? (
                <div 
                    className="prose prose-sm max-w-none break-words w-full 
                        [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-2 [&_h1]:mt-2
                        [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-2 [&_h2]:mt-2
                        [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:mt-2
                        [&_p]:mb-2 [&_p]:leading-relaxed
                        [&_em]:italic 
                        [&_strong]:font-bold 
                        [&_u]:underline
                        [&_span]:inline"
                    dangerouslySetInnerHTML={{ __html: displayContent }}
                />
            ) : (
                <p className="whitespace-pre-wrap break-words w-full">
                    {displayContent}
                </p>
            )}

            {shouldTruncate && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-primary font-medium mt-2 hover:underline"
                >
                    {expanded ? "Show less" : "Show more"}
                </button>
            )}
        </div>
    );
}
