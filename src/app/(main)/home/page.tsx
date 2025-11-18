'use client';

import { logout } from '@/services/apiServices';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function HomePage() {
    const router = useRouter();

    const handleSettingsClick = () => {
        router.push('/settings');
    };

    const handleLogout = async () => {
        const { success, message } = await logout();
        if (success) {
            router.push('/signin');
        } else {
            toast.error('Failed to logout', {
                description: message,
            });
        }
    };

    return (
        <div>
            <h1>Chào mừng trở lại!</h1>
            {/* TODO: Display user info from your auth context */}
            {/* <p>Email của bạn: {user?.email}</p> */}

            <button onClick={handleLogout}>Đăng xuất</button>
            <div></div>
            <button onClick={handleSettingsClick}>Settings</button>
        </div>
    );
}
