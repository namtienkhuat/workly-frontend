'use client';
import React from 'react';

export default function MyNetworkPage() {
    return (
        <div className="space-y-6">
            <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h1 className="text-2xl font-bold mb-2">My Network</h1>
                <p className="text-muted-foreground">
                    Quản lý mạng lưới kết nối của bạn
                </p>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Lời mời kết nối</h2>
                    <p className="text-sm text-muted-foreground">
                        Không có lời mời kết nối nào
                    </p>
                </div>
                
                <div className="rounded-lg border bg-card p-6 shadow-sm">
                    <h2 className="text-lg font-semibold mb-4">Gợi ý kết nối</h2>
                    <p className="text-sm text-muted-foreground">
                        Đang tải gợi ý...
                    </p>
                </div>
            </div>
        </div>
    );
}

