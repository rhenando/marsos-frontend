// frontend/src/components/admin/AdminStatCard.tsx

import { Card, CardContent } from "@/components/ui/data-display/card";

export default function AdminStatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <Card>
      <CardContent className='p-4'>
        <div className='text-sm text-muted-foreground'>{title}</div>
        <div className='text-2xl font-semibold mt-1'>{value}</div>
      </CardContent>
    </Card>
  );
}
