export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 font-sans text-gray-800">
            {children}
        </main>
    );
}
