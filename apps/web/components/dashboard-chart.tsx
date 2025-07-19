'use client'

import * as React from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui/components/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@repo/ui/components/chart'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui/components/select'
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts'

const chartConfig = {
  author: {
    label: 'Author',
    color: 'var(--chart-1)',
  },
  post: {
    label: 'Post',
    color: 'var(--chart-2)',
  },
  restaurant: {
    label: 'Restaurant',
    color: 'var(--chart-3)',
  },
} satisfies ChartConfig

const processData = <T extends { created_at: Date }>(
  items: T[],
  key: 'author' | 'post' | 'restaurant',
  map: Map<string, { author: number; post: number; restaurant: number }>,
) => {
  items.forEach((item) => {
    const date = new Date(item.created_at).toISOString().split('T')[0]
    const entry = map.get(date) || { author: 0, post: 0, restaurant: 0 }
    entry[key]++
    map.set(date, entry)
  })
}

export function FollowUpChart({
  dataSource,
}: {
  dataSource: Record<string, { created_at: Date }[]>
}) {
  const chartData = React.useMemo(() => {
    const chartDataMap = new Map<
      string,
      { author: number; post: number; restaurant: number }
    >()

    processData(dataSource.authors, 'author', chartDataMap)
    processData(dataSource.posts, 'post', chartDataMap)
    processData(dataSource.restaurants, 'restaurant', chartDataMap)

    return Array.from(chartDataMap.entries())
      .map(([date, counts]) => ({
        date,
        author: counts.author,
        post: counts.post,
        restaurant: counts.restaurant,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .reduce<
        { date: string; author: number; post: number; restaurant: number }[]
      >((acc, current, index) => {
        const prev =
          index > 0 ? acc[index - 1] : { author: 0, post: 0, restaurant: 0 }
        return [
          ...acc,
          {
            ...current,
            author: prev.author + current.author,
            post: prev.post + current.post,
            restaurant: prev.restaurant + current.restaurant,
          },
        ]
      }, [])
  }, [dataSource.authors, dataSource.posts, dataSource.restaurants])

  const [timeRange, setTimeRange] = React.useState('90d')
  const filteredData = chartData.filter((item) => {
    const date = new Date(item.date)
    let daysToSubtract = 90
    if (timeRange === '30d') {
      daysToSubtract = 30
    } else if (timeRange === '7d') {
      daysToSubtract = 7
    }
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - daysToSubtract)
    return date >= startDate
  })

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>餐馆收集统计</CardTitle>
          <CardDescription>
            该图表显示了过去90天内收集的餐馆数据。您可以通过选择不同的时间范围来查看数据变化。
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder="Last 3 months" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              Last 3 months
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              Last 30 days
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              Last 7 days
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={filteredData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="author" fill="var(--color-author)" radius={4} />
            <Bar dataKey="post" fill="var(--color-post)" radius={4} />
            <Bar
              dataKey="restaurant"
              fill="var(--color-restaurant)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
