'use client';

export default function DocumentViewer({ fileUrl }: { fileUrl: string }) {
    const extension = fileUrl.split('.').pop()?.toLowerCase();

    const isWordFile = extension === 'doc' || extension === 'docx';

    if (isWordFile) {
        return (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500 border rounded">
                <p className="font-medium mb-2">
                    There is no preview for this document.</p>
                <a
                    href={fileUrl}
                    download
                    className="text-blue-600 hover:underline text-sm"
                >
                    Click here to download
                </a>
            </div>
        );
    }

    return (
        <iframe
            src={fileUrl}
            className="w-full h-full border-0"
            title="CV Preview"
            allowFullScreen
        />
    );
}