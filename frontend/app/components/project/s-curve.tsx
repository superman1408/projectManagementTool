import { TrendingUp } from "lucide-react";
import type { Project } from "@/types";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import { type ChartConfig } from "@/components/ui/chart";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A multiple line chart";


interface ChartProps {
    project: Project;
}

const chartData = [
    { month: "June-2024", planned: 20, actual: 0 },
    { month: "July-2024", planned: 80, actual: 25 },
    { month: "August-2024", planned: 140, actual: 80 },
    { month: "September-2024", planned: 250, actual: 140 },
    { month: "October-2024", planned: 400, actual: 380 },
    { month: "November-2024", planned: 610, actual: 520 },
    { month: "December-2024", planned: 620, actual: 580 },
    { month: "January-2025", planned: 690, actual: 620 },
    { month: "February-2025", planned: 750, actual: 680 },
    { month: "March-2025", planned: 790, actual: 710 },
    { month: "April-2025", planned: 810, actual: 720 },
    { month: "May-2025", planned: 830, actual: 730 },
    { month: "June-2025", planned: 900, actual: 780 },
    { month: "July-2025", planned: 1050, actual: 860 },
    { month: "August-2025", planned: 1100, actual: 895 },
    { month: "September-2025", planned: 1130, actual: 910 },
    { month: "October-2025", planned: 1200, actual: 940 },
    { month: "November-2025", planned: 1270, actual: 1060 },
    { month: "December-2025", planned: 1310, actual: 0 },
]

// My data is this below and above is default data
// (5) [{…}, {…}, {…}, {…}, {…}]
// 0: {month: 0, completion: '0.01'}
// 1: {month: 1, completion: '1.00'}
// 2: {month: 2, completion: '50.00'}
// 3: {month: 3, completion: '99.00'}
// 4: {month: 4, completion: '99.99'}
// length: 5

const chartConfig = {
  planned: {
    label: "Planned",
    color: "var(--chart-1)",
  },
  actual: {
    label: "Actual",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig

// export const SCurve = ({ project }: ChartProps) => {
//     const start = new Date(project.startDate);
//     const due = new Date(project.dueDate);

//     console.log(start);
//     console.log(due);

//     const currentMonthCount = (start: any) => {
//         const currentMonth = new Date().getMonth();
//         const monthCount = currentMonth - start.getMonth();
//         return monthCount;
//     };

//     let projectDuration =
//         (due.getFullYear() - start.getFullYear()) * 12 +
//         (due.getMonth() - start.getMonth());

// // If you want to count partial month when the due-date day is greater:
//     if (due.getDate() > start.getDate()) {
//         projectDuration += 1;
//     }

//     console.log("Duration:", projectDuration, "months");

//     const midPoint = projectDuration / 2;

//     const numerator = -Math.log(1 / 0.99 - 1);
//     const denominator = currentMonthCount(start) - midPoint || 0.00001

//     const k = numerator / denominator


//     // const calculateSteepness = (workCompleted, currentMonthCount, fullDuration) => {
//     //     const midPoint = fullDuration / 2; // Midpoint of the project (t0)
//     //     const numerator = -Math.log(1 / workCompleted - 1); // -ln(1/y - 1)
//     //     const denominator = currentMonthCount - midPoint || 0.0001; // Avoid division by zero
//     //     const k = numerator / denominator;
//     //     return k;
//     // };

//     // ------------------- Generate Sigmoid Data -------------------
//     const generateSigmoidData = (k: any, t0: any, duration: any, startMonth = 0) => {
//         const data = [];
//         for (let t = startMonth; t <= duration; t++) {
//             const progress = 1 / (1 + Math.exp(-k * (t - t0))); // Sigmoid formula
//             data.push({ month: t, completion: (progress * 100).toFixed(2) }); // Convert to percentage
//         }
//         return data;
//     };

//     // ------------------- Case Calculations -------------------
//   // Case 1: Full Project Progress
//     // const case1_k = calculateSteepness(0.99, durationInMonth, durationInMonth);
//     const plannedData = generateSigmoidData(
//         k,
//         midPoint,
//         projectDuration
//     );


//     console.log(plannedData);
    

    
    
    
    
    
//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Performance Tracking (Planned vs Actual)</CardTitle>
//         <CardDescription>In project management,
//             an S-curve is a graphical representation showing how project progress or
//             costs accumulate over time, typically starting slow, rising rapidly during execution,
//             and leveling off as the project nears completion.
//             It is widely used to compare planned vs. actual performance and quickly identify whether
//             a project is ahead or behind schedule.
//         </CardDescription>
//       </CardHeader>
//       <CardContent>
//         <ChartContainer config={chartConfig}>
//           <LineChart
//             accessibilityLayer
//             data={plannedData}
//             margin={{
//               left: 12,
//               right: 12,
//             }}
//           >
//             <CartesianGrid vertical={false} />
//             <XAxis
//               dataKey="month"
//               tickLine={false}
//               axisLine={false}
//               tickMargin={8}
//               tickFormatter={(value) => value.slice(0, 3)}
//             />
//             <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
//             <Line
//               dataKey="completion"
//               type="monotone"
//               stroke="var(--color-planned)"
//               strokeWidth={2}
//               dot={false}
//             />
//             {/* <Line
//               dataKey="actual"
//               type="monotone"
//               stroke="var(--color-actual)"
//               strokeWidth={2}
//               dot={false}
//             /> */}
//           </LineChart>
//         </ChartContainer>
//       </CardContent>
//       <CardFooter>
//         <div className="flex w-full items-start gap-2 text-sm">
//           <div className="grid gap-2">
//             <div className="flex items-center gap-2 leading-none font-medium">
//               Trending up by 5.2% this month <TrendingUp className="h-4 w-4" />
//             </div>
//             <div className="text-muted-foreground flex items-center gap-2 leading-none">
//               If actual progress dips below the planned curve → project is behind schedule.
//             </div>
//           </div>
//         </div>
//       </CardFooter>
//     </Card>
//   )
// }


export const SCurve = ({ project }: ChartProps) => {
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


  

  // cumulative growth = last planned value
  const cumulativeGrowth = chartData[chartData.length - 1].planned.toFixed(2);
  console.log(cumulativeGrowth);

  // Calculate average planned growth per month
  const first = chartData[0].planned; // typically near 0
  const last = chartData[chartData.length - 1].planned; // near 100

  const averagePlannedGrowth = ((last - first) / projectDuration).toFixed(2);


  

  

  return (
    // <Card>
    //   <CardHeader>
    //      <CardTitle>Performance Tracking (Planned)</CardTitle>
    //      <CardDescription>In project management,
    //          an S-curve is a graphical representation showing how project progress or
    //          costs accumulate over time, typically starting slow, rising rapidly during execution,
    //          and leveling off as the project nears completion.
    //          It is widely used to compare planned vs. actual performance and quickly identify whether
    //          a project is ahead or behind schedule.
    //      </CardDescription>
    //    </CardHeader>
    //   <CardContent>
    //     <ChartContainer config={chartConfig}>
    //       <LineChart data={chartData} margin={{left: 12, right: 12}}>
    //         <CartesianGrid vertical={false} />
    //         <XAxis dataKey="month" />
    //         <Line dataKey="planned"  stroke="var(--chart-1)" />
    //         {/* <Line dataKey="actual" stroke="var(--chart-2)" /> */}
    //         <ChartTooltip content={<ChartTooltipContent />} />
    //       </LineChart>
    //     </ChartContainer>
    //   </CardContent>
    //   <CardFooter>
    //      <div className="flex w-full items-start gap-2 text-sm">
    //        <div className="grid gap-2">
    //          <div className="flex items-center gap-2 leading-none font-medium">
    //           Trending up by {averagePlannedGrowth} % every month <TrendingUp className="h-4 w-4" />
    //          </div>
    //          <div className="text-muted-foreground flex items-center gap-2 leading-none">
    //            If actual progress dips below the planned curve → project is behind schedule.
    //          </div>
    //        </div>
    //      </div>
    //    </CardFooter>
    // </Card>

//     <Card className="w-full p-2">
//   <CardHeader className="pt-1 pb-1">
//     <CardTitle className="text-base">Performance Tracking (Planned)</CardTitle>

//     <CardDescription className="text-xs line-clamp-3">
//       In project management, an S-curve shows how progress accumulates over time.
//       It helps compare planned vs actual performance.
//     </CardDescription>
//   </CardHeader>

//   <CardContent className="py-1">
//     <ChartContainer config={chartConfig} className="h-[180px]">
//       <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
//         <CartesianGrid vertical={false} />
//         <XAxis dataKey="month" />
//         <Line dataKey="planned" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
//         <ChartTooltip content={<ChartTooltipContent />} />
//       </LineChart>
//     </ChartContainer>
//   </CardContent>

//   <CardFooter className="py-1">
//     <div className="flex w-full items-start gap-2 text-sm">
//       <div className="grid gap-1">
//         <div className="flex items-center gap-2 leading-none font-medium text-xs">
//           Trending up by {averagePlannedGrowth}% every month
//           <TrendingUp className="h-3 w-3" />
//         </div>

//         <div className="text-muted-foreground text-xs leading-none">
//           Actual progress below the curve means delay.
//         </div>
//       </div>
//     </div>
//   </CardFooter>
    // </Card>
    
    <Card className="w-full max-w-[360px] flex flex-col p-1">
  <CardHeader className="py-2">
    <CardTitle className="text-sm">Performance Tracking (Planned)</CardTitle>

    <CardDescription className="text-xs text-muted-foreground">
      Planned progress trend using S-curve distribution.
    </CardDescription>
  </CardHeader>

  <CardContent className="py-1">
    <ChartContainer config={chartConfig} className="h-[140px]">
      <LineChart data={chartData} margin={{ left: 12, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
        <Line
          dataKey="planned"
          stroke="var(--chart-1)"
          strokeWidth={2}
          dot={false}
        />
        <ChartTooltip content={<ChartTooltipContent />} />
      </LineChart>
    </ChartContainer>
  </CardContent>

  <CardFooter className="py-2">
    <div className="flex w-full items-start gap-2 text-xs">
      <div className="grid gap-1">
        <div className="flex items-center gap-1 font-medium text-green-500">
          Trending up by {averagePlannedGrowth}% every month
          <TrendingUp className="h-3 w-3" />
        </div>
        {/* <div className="text-muted-foreground leading-none">
          Actual progress below curve = behind schedule.
            </div> */}
            <div className="text-orange-300 leading-none">
          If actual growth rate dips below the planned curve → project is behind schedule.
        </div>
      </div>
    </div>
  </CardFooter>
</Card>


  );
};
