
"use client";

import type { ActivityItem } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DollarSign, ShoppingCart, Briefcase, UserCheck, Tag } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { useI18n } from "@/locales/client";

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
  const t = useI18n();

  switch (activity.type) {
    case 'sale':
      return <>{t('dashboard_page.recent_activity.sale_part1')} <strong>{activity.product_name}</strong> {t('dashboard_page.recent_activity.sale_part2')} ${activity.amount.toFixed(2)}</>;
    case 'expense':
      return <>{t('dashboard_page.recent_activity.expense_part1')} <strong>{activity.description}</strong> {t('dashboard_page.recent_activity.expense_part2')} ${activity.amount.toFixed(2)}</>;
    case 'task':
      return <>{activity.employee_name} {t('dashboard_page.recent_activity.task_part1')} <strong>{activity.quantity_completed}x {activity.task_name}</strong></>;
    case 'payment':
      return <>{t('dashboard_page.recent_activity.payment_part1')} ${activity.amount.toFixed(2)} {t('dashboard_page.recent_activity.payment_part2')} <strong>{activity.employee_name}</strong> ({activity.payment_type})</>;
    default:
      return <>{t('dashboard_page.recent_activity.unknown')}</>;
  }
};

export default function RecentActivityFeed({ activities }: RecentActivityFeedProps) {
  const t = useI18n();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">{t('dashboard_page.recent_activity.title')}</CardTitle>
        <CardDescription>{t('dashboard_page.recent_activity.description')}</CardDescription>
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
             <p className="text-sm text-muted-foreground text-center py-4">{t('dashboard_page.recent_activity.no_data')}</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
