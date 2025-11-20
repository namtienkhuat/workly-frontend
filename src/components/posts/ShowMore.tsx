import { useState } from "react";

export default function ShowMore({ text }: { text: string }) {
    const LIMIT = 300;
    const [expanded, setExpanded] = useState(false);

    const shouldTruncate = text.length > LIMIT;

    return (
        <div className="w-full">
            <p className="whitespace-pre-wrap break-words w-full">
                {expanded || !shouldTruncate ? text : text.slice(0, LIMIT) + "..."}
            </p>

            {shouldTruncate && (
                <button
                    onClick={() => setExpanded(!expanded)}
                    className="text-blue-500 font-medium mt-2 hover:underline"
                >
                    {expanded ? "Show less" : "Show more"}
                </button>
            )}
        </div>

    );
}
