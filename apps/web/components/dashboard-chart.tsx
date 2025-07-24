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
  ChartLegend,
  ChartLegendContent,
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
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts'

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

    if (chartDataMap.size === 0) {
      return []
    }

    const sortedDates = Array.from(chartDataMap.keys()).sort()
    const startDate = new Date(sortedDates[0])
    const endDate = new Date()

    const filledIncrements = []
    for (
      let currentDate = new Date(startDate);
      currentDate <= endDate;
      currentDate.setDate(currentDate.getDate() + 1)
    ) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const counts = chartDataMap.get(dateStr) || {
        author: 0,
        post: 0,
        restaurant: 0,
      }
      filledIncrements.push({ date: dateStr, ...counts })
    }

    return filledIncrements.reduce<
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
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillAuthor" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-author)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-author)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillPost" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-post)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-post)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillRestaurant" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-restaurant)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-restaurant)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value)
                return date.toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                    })
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="author"
              type="natural"
              fill="url(#fillAuthor)"
              stroke="var(--color-author)"
              stackId="a"
            />
            <Area
              dataKey="post"
              type="natural"
              fill="url(#fillPost)"
              stroke="var(--color-post)"
              stackId="a"
            />
            <Area
              dataKey="restaurant"
              type="natural"
              fill="url(#fillRestaurant)"
              stroke="var(--color-restaurant)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
