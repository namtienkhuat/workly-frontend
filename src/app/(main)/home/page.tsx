'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Navigation } from '@/components/layout/Navigation';

export default function HomePage() {
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleSettingsClick = () => {
        router.push('/settings');
    };

    if (status === 'loading') {
        return <p>Loading...</p>;
    }

    if (status === 'authenticated') {
        return (
            <div className="flex h-screen flex-col bg-gray-100">
                {/* Header - Full Width */}
                {/* <div className="bg-white px-6 py-4 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">
                                Chào mừng trở lại, {session.user?.name}!
                            </h1>
                            <p className="mt-1 text-sm text-gray-600">{session.user?.email}</p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSettingsClick}
                                className="rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600"
                            >
                                Cài đặt
                            </button>
                            <button
                                onClick={() => signOut()}
                                className="rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div> */}

                {/* Main Layout with Navigation and Content */}
                <div className="flex flex-1 gap-4 overflow-hidden p-4">
                    {/* Left Navigation - fixed width 320px */}
                    <Navigation />

                    {/* Main Content Area */}
                    <div className="flex-1 overflow-y-auto rounded-lg bg-white p-6 shadow-sm">
                        <div className="mx-auto max-w-5xl">
                            <div className="space-y-6">
                                <div className="rounded-lg border bg-white p-6">
                                    <h2 className="mb-4 text-xl font-semibold text-gray-900">
                                        Trang chủ
                                    </h2>
                                    <p className="text-gray-600">
                                        Nội dung chính của trang chủ sẽ hiển thị ở đây. Bạn có thể
                                        thêm các component và tính năng khác vào khu vực này.
                                    </p>
                                    <p className="mt-4 text-gray-600">
                                        Sử dụng navigation bên trái để di chuyển giữa các trang!
                                    </p>
                                </div>

                                <div className="rounded-lg border bg-gray-50 p-6">
                                    <h3 className="mb-2 font-semibold text-gray-900">
                                        Gợi ý cho bạn
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Khám phá các tính năng mới và kết nối với bạn bè
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return <p>Bạn chưa đăng nhập.</p>;
}
