"use client";

import type { ActivityItem } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, ShoppingCart, Briefcase, UserCheck, Tag } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityFeedProps {
  activities: ActivityItem[];
}

const ActivityIcon = ({ type }: { type: ActivityItem['type'] }) => {
  switch (type) {
    case 'sale': return <ShoppingCart className="h-5 w-5 text-green-500" />;
    case 'expense': return <DollarSign className="h-5 w-5 text-red-500" />;
    case 'task': return <Briefcase className="h-5 w-5 text-blue-500" />;
    case 'payment': return <UserCheck className="h-5 w-5 text-purple-500" />;
    default: return <Tag className="h-5 w-5 text-muted-foreground" />;
  }
};

const ActivityDescription = ({ activity }: { activity: ActivityItem }) => {
  switch (activity.type) {
    case 'sale':
      return <>Sold <strong>{activity.product_name}</strong> for ${activity.amount.toFixed(2)}</>;
    case 'expense':
      return <>Expense: <strong>{activity.description}</strong> for ${activity.amount.toFixed(2)}</>;
    case 'task':
      return <>{activity.employee_name} completed <strong>{activity.quantity_completed}x {activity.task_name}</strong></>;
    case 'payment':
      return <>Paid ${activity.amount.toFixed(2)} to <strong>{activity.employee_name}</strong> ({activity.payment_type})</>;
    default:
      return <>Unknown activity</>;
  }
};

export default function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Recent Activity</CardTitle>
        <CardDescription>Latest transactions and operational updates.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          {activities.length > 0 ? activities.map((activity) => (
            <div key={activity.id} className="mb-4 grid grid-cols-[25px_1fr] items-start pb-4 last:mb-0 last:pb-0">
              <span className="flex h-2 w-2 translate-y-1 rounded-full bg-primary" />
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-sm">
                  <ActivityIcon type={activity.type} />
                  <p className="font-medium leading-none">
                    <ActivityDescription activity={activity} />
                  </p>
                </div>
                <p className="text-xs text-muted-foreground pl-7">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          )) : (
             <p className="text-sm text-muted-foreground text-center py-4">No recent activities.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
