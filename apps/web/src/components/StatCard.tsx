"use client";

import { Card } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string;
}

export default function StatCard({ title, value }: StatCardProps) {
  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      <p className="text-2xl font-bold">{value}</p>
    </Card>
  );
}
