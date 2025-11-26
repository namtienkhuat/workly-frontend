'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useGetMe } from '@/hooks/useQueryData';
import {
    getAppearanceSettings,
    saveAppearanceSettings,
    applyAppearanceSettings,
    type FontSize,
    type AccentColor,
} from '@/utils/appearance-settings';

const AppearanceSettingsPage = () => {
    const { theme: currentTheme, setTheme: setCurrentTheme, systemTheme } = useTheme();
    const { data: userData, isLoading: isLoadingUser } = useGetMe();
    // Try both possible structures
    const currentUser = userData?.data?.user || userData?.data;
    const [fontSize, setFontSize] = useState<FontSize>('medium');
    const [accentColor, setAccentColor] = useState<AccentColor>('green');
    const [mounted, setMounted] = useState(false);

    // Load user-specific preferences from localStorage on mount
    useEffect(() => {
        setMounted(true);

        if (!currentUser?.userId) return;

        const settings = getAppearanceSettings(currentUser.userId);
        setFontSize(settings.fontSize);
        setAccentColor(settings.accentColor);
    }, [currentUser]);

    // Apply settings to document (for preview)
    useEffect(() => {
        if (!mounted || !currentUser?.userId) return;

        applyAppearanceSettings({ fontSize, accentColor });
    }, [fontSize, accentColor, mounted, currentUser]);

    const handleThemeChange = (value: string) => {
        setCurrentTheme(value);
        toast.success('Theme changed!', {
            description: `Theme set to ${value}`,
        });
    };

    const handleFontSizeChange = (value: string) => {
        setFontSize(value as FontSize);
    };

    const handleAccentColorChange = (value: string) => {
        setAccentColor(value as AccentColor);
    };

    const handleSaveChanges = () => {
        if (!currentUser?.userId) {
            toast.error('Please login to save appearance settings');
            return;
        }

        const settings = { fontSize, accentColor };

        // Save user-specific settings to localStorage
        saveAppearanceSettings(currentUser.userId, settings);

        // Dispatch custom event to notify other components
        const event = new CustomEvent('appearance-settings-changed', {
            detail: { settings },
        });
        window.dispatchEvent(event);

        toast.success('Appearance settings saved!', {
            description: 'Your display preferences have been updated.',
        });
    };

    // Prevent hydration mismatch and show loading while fetching user
    if (!mounted || isLoadingUser) {
        return null;
    }

    // If user is not logged in, show message
    if (!currentUser) {
        return (
            <div className="space-y-6">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Appearance</h2>
                    <p className="text-muted-foreground mt-1">
                        Please login to customize your appearance settings.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Appearance</h2>
                <p className="text-muted-foreground mt-1">
                    Customize how Workly looks on your device.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Theme</CardTitle>
                    <CardDescription>
                        Select your preferred theme or use system settings.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <RadioGroup value={currentTheme} onValueChange={handleThemeChange}>
                        <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors cursor-pointer">
                            <RadioGroupItem value="light" id="light" />
                            <Label htmlFor="light" className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Sun className="h-5 w-5" />
                                    <div>
                                        <div className="font-medium">Light</div>
                                        <div className="text-sm text-muted-foreground">
                                            Bright and clean interface
                                        </div>
                                    </div>
                                </div>
                            </Label>
                        </div>

                        <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors cursor-pointer">
                            <RadioGroupItem value="dark" id="dark" />
                            <Label htmlFor="dark" className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Moon className="h-5 w-5" />
                                    <div>
                                        <div className="font-medium">Dark</div>
                                        <div className="text-sm text-muted-foreground">
                                            Easy on the eyes in low light
                                        </div>
                                    </div>
                                </div>
                            </Label>
                        </div>

                        <div className="flex items-center space-x-3 rounded-lg border p-4 hover:bg-accent transition-colors cursor-pointer">
                            <RadioGroupItem value="system" id="system" />
                            <Label htmlFor="system" className="flex-1 cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <Monitor className="h-5 w-5" />
                                    <div>
                                        <div className="font-medium">System</div>
                                        <div className="text-sm text-muted-foreground">
                                            Use device theme settings{' '}
                                            {systemTheme && `(${systemTheme})`}
                                        </div>
                                    </div>
                                </div>
                            </Label>
                        </div>
                    </RadioGroup>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Display Preferences</CardTitle>
                    <CardDescription>Adjust font size and color scheme.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="font-size">Font Size</Label>
                        <Select value={fontSize} onValueChange={handleFontSizeChange}>
                            <SelectTrigger id="font-size">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium (Default)</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="accent-color">Accent Color</Label>
                        <Select value={accentColor} onValueChange={handleAccentColorChange}>
                            <SelectTrigger id="accent-color">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="blue">Blue</SelectItem>
                                <SelectItem value="green">Green (Default)</SelectItem>
                                <SelectItem value="purple">Purple</SelectItem>
                                <SelectItem value="orange">Orange</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={handleSaveChanges}>Save Changes</Button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default AppearanceSettingsPage;
