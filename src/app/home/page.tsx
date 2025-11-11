'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
    // 1. Dùng useSession() để lấy phiên đăng nhập
    const { data: session, status } = useSession();
    const router = useRouter();

    const handleSettingsClick = () => {
        router.push('/settings');
    };

    // 2. In ra session (chứa user) khi nó được tải
    if (status === 'loading') {
        return <p>Đang tải...</p>;
    }

    if (status === 'authenticated') {
        // --- ĐÂY LÀ NƠI BẠN CONSOLE.LOG ---
        console.log('SESSION OBJECT (chứa user):', session);
        console.log('USER INFO:', session.user);

        // @ts-ignore
        console.log('TOKEN CỦA BACKEND:', session.apiToken);
        // -----------------------------------

        return (
            <div>
                <h1>Chào mừng trở lại, {session.user?.name}!</h1>
                <p>Email của bạn: {session.user?.email}</p>

                <button onClick={() => signOut()}>Đăng xuất</button>
                <div></div>
                <button onClick={handleSettingsClick}>Settings</button>
            </div>
        );
    }

    // Nếu không hiểu sao lại về đây (ví dụ: middleware lỗi)
    return <p>Bạn chưa đăng nhập.</p>;
}
