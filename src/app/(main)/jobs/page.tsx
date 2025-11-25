'use client';
import React from 'react';
import { Briefcase, MapPin, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function JobsPage() {
    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="rounded-lg border bg-card p-6 shadow-sm">
                <h1 className="text-2xl font-bold mb-2">Tìm việc làm</h1>
                <p className="text-muted-foreground mb-4">
                    Khám phá các cơ hội nghề nghiệp phù hợp với bạn
                </p>

                <div className="flex gap-2">
                    <Input
                        placeholder="Tìm kiếm công việc..."
                        className="flex-1"
                    />
                    <Button>Tìm kiếm</Button>
                </div>
            </div>

            {/* Job Listings */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Việc làm được đề xuất</h2>

                {[1, 2, 3].map((item) => (
                    <div
                        key={item}
                        className="rounded-lg border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
                    >
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                <Briefcase className="h-6 w-6 text-primary" />
                            </div>

                            <div className="flex-1 space-y-2">
                                <h3 className="text-lg font-semibold hover:text-primary cursor-pointer">
                                    Senior Frontend Developer
                                </h3>
                                <p className="text-muted-foreground">
                                    Tech Company Inc.
                                </p>

                                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                    <div className="flex items-center gap-1">
                                        <MapPin className="h-4 w-4" />
                                        <span>Hà Nội, Việt Nam</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Clock className="h-4 w-4" />
                                        <span>2 ngày trước</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <Button size="sm">Ứng tuyển</Button>
                                    <Button size="sm" variant="outline">
                                        Lưu
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

