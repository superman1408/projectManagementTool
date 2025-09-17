import { Loader } from '@/components/loader';
import { useGetWorkspaceStatsQuery } from '@/hooks/use-workspace';
import React from 'react';
import { useSearchParams } from 'react-router';

import type {
  Project,
  ProjectStatusData,
  StatsCardProps,
  Task,
  TaskPriorityData,
  TaskTrendsData,
  WorkspaceProductivityData,
} from "@/types";
import { StatsCard } from '@/components/dashboard/stat-card';
import { StatisticsCharts } from '@/components/dashboard/statistics-charts';
import { RecentProjects } from '@/components/dashboard/recent-project';
import { UpcomingTasks } from '@/components/upcoming-tasks';

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const workspaceId = searchParams.get("workspaceId")

  const { data, isPending } = useGetWorkspaceStatsQuery(workspaceId!) as {
    data: {
      stats: StatsCardProps;
      taskTrendsData: TaskTrendsData[];
      projectStatusData: ProjectStatusData[];
      taskPriorityData: TaskPriorityData[];
      workspaceProductivityData: WorkspaceProductivityData[];
      upcomingTasks: Task[];
      recentProjects: Project[];
    };
    isPending: boolean;
  };



  if (!workspaceId || !data) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-center">
        <div className="rounded-xl bg-gray-100 px-6 py-4 shadow-sm">
          <p className="text-lg font-medium text-gray-700">
            No workspace selected
          </p>
          <p className="text-sm text-gray-500">
            Please choose a workspace to view its details.
          </p>
        </div>
      </div>
    );
  }


  if (isPending) {
    return (
      <div>
        <Loader />
      </div>
    )
  }


  return (
    <div className="space-y-8 2xl:space-y-12">
      <div className='flex items-center justify-between'>
        <h1 className="text-2xl font-bold">Dashboard</h1>
      </div>

      <StatsCard data={data.stats} />


      <StatisticsCharts
        stats={data.stats}
        taskTrendsData={data.taskTrendsData}
        projectStatusData={data.projectStatusData}
        taskPriorityData={data.taskPriorityData}
        workspaceProductivityData={data.workspaceProductivityData}
      />


      <div className="grid gap-6 lg:grid-cols-2">
        <RecentProjects data={data.recentProjects} />
        <UpcomingTasks data={data.upcomingTasks} />
      </div>
    </div>
  )
};

export default Dashboard;