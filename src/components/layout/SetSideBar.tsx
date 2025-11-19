'use client';

import { useLayout } from '@/context/LayoutContext';
import { useLayoutEffect } from 'react';
import { ReactNode } from 'react';

export const SetSidebar = ({
    position,
    children,
}: {
    position: 'left' | 'right';
    children: ReactNode;
}) => {
    const { setLeftSidebar, setRightSidebar } = useLayout();

    useLayoutEffect(() => {
        const setSidebar = position === 'left' ? setLeftSidebar : setRightSidebar;
        setSidebar(children);

        return () => {
            setSidebar(null);
        };
    }, [children, position, setLeftSidebar, setRightSidebar]);

    return null;
};
