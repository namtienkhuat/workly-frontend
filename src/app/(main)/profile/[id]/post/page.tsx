'use client';

import Posts from '@/components/posts/Posts';
import React, { useEffect } from 'react';

const CompanyPost = () => {
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
            }
            @keyframes shimmer {
                0% { background-position: -1000px 0; }
                100% { background-position: 1000px 0; }
            }
            @keyframes gradient-shift {
                0%, 100% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
            }
            .animate-float {
                animation: float 3s ease-in-out infinite;
            }
            .animate-shimmer {
                animation: shimmer 3s linear infinite;
                background: linear-gradient(
                    to right,
                    transparent 0%,
                    rgba(255, 255, 255, 0.1) 50%,
                    transparent 100%
                );
                background-size: 1000px 100%;
            }
            .animate-gradient {
                background-size: 200% 200%;
                animation: gradient-shift 5s ease infinite;
            }
        `;
        style.setAttribute('data-post-animations', 'true');
        if (!document.head.querySelector('style[data-post-animations]')) {
            document.head.appendChild(style);
        }
    }, []);

    return (
        <div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
                <Posts type="USER" />
            </div>
        </div>
    );
};

export default CompanyPost;
