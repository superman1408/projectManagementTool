"use client"
import type { Project } from "@/types";
import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { type ChartConfig } from "@/components/ui/chart";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A multiple line chart";

interface ChartProps {
    project: Project;
}

// const chartData = [
//   { month: "January", desktop: 186, mobile: 80 },
//   { month: "February", desktop: 305, mobile: 200 },
//   { month: "March", desktop: 237, mobile: 120 },
//   { month: "April", desktop: 73, mobile: 190 },
//   { month: "May", desktop: 209, mobile: 130 },
//   { month: "June", desktop: 214, mobile: 140 },
// ]

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

export const CurveRough = ({ project }: ChartProps) => {

    const start = new Date(project.startDate);
    const due = new Date(project.dueDate);
    
    const getMonthName = (date: Date, offset: number) => {
        const d = new Date(date);
        d.setMonth(d.getMonth() + offset);
        return d.toLocaleString("default", { month: "short" });
    };


  // --- Calculate project duration ---
  let projectDuration =
    (due.getFullYear() - start.getFullYear()) * 12 +
    (due.getMonth() - start.getMonth());

  if (due.getDate() > start.getDate()) projectDuration++;

  // --- Current month index ---
  const monthIndex =
    (new Date().getFullYear() - start.getFullYear()) * 12 +
    (new Date().getMonth() - start.getMonth());

  // --- Logistic parameters ---
  const midPoint = projectDuration / 2;
  const numerator = -Math.log(1 / 0.99 - 1);
  const denominator = monthIndex - midPoint || 0.00001;
  // const k = numerator / denominator;
  const k = Math.abs(numerator / denominator);


  // --- Logistic function ---
  const logistic = (t: number) => {
    return 100 / (1 + Math.exp(-k * (t - midPoint)));
  };

  // --- Generate chart data ---
  const chartData = Array.from({ length: projectDuration }, (_, t) => ({
    month: getMonthName(start, t),
    planned: logistic(t),
    actual: 0,
  }));


  console.log(chartData);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Chart - Multiple</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="planned"
              type="monotone"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="actual"
              type="monotone"
              stroke="var(--color-mobile)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="flex w-full items-start gap-2 text-sm">
          <div className="grid gap-2">
            <div className="flex items-center gap-2 leading-none font-medium">
              Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
            </div>
            <div className="text-muted-foreground flex items-center gap-2 leading-none">
              Showing total visitors for the last 6 months
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  )
}
