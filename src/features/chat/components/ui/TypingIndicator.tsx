'use client';

export function TypingIndicator() {
    return (
        <div className="flex justify-start">
            <div className="rounded-lg bg-gray-100 px-4 py-2">
                <div className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500"></span>
                    <span
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
                        style={{ animationDelay: '0.1s' }}
                    ></span>
                    <span
                        className="h-2 w-2 animate-bounce rounded-full bg-gray-500"
                        style={{ animationDelay: '0.2s' }}
                    ></span>
                </div>
            </div>
        </div>
    );
}

