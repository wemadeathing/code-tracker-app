"use client"

import * as React from "react"
import { Bar, BarChart as RechartsBarChart, CartesianGrid, Cell, Legend, Line, LineChart as RechartsLineChart, Pie, PieChart as RechartsPieChart, ReferenceLine, ResponsiveContainer, Tooltip, TooltipProps, XAxis, YAxis } from "recharts"

import { cn } from "@/lib/utils"

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: "", dark: ".dark" } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <Chart />")
  }

  return context
}

const Chart = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line-line]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
Chart.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([_, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES).map(
          ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .filter(Boolean)
  .join("\n")}
}
`
        ),
      }}
    />
  )
}

// Custom tooltip component
interface ChartTooltipProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "content"> {
  content?: React.ReactNode
  active?: boolean
  payload?: any[]
  label?: string
  formatter?: (value: number, name: string, props: any) => [string, string]
  labelFormatter?: (label: string) => string
  valueFormatter?: (value: number) => string
}

const ChartTooltip = React.forwardRef<HTMLDivElement, ChartTooltipProps>(
  ({ className, content, active, payload, label, formatter, labelFormatter, valueFormatter, ...props }, ref) => {
    if (!active || !payload?.length) {
      return null
    }

    if (content) {
      return <div ref={ref} className={cn("rounded-lg border bg-background p-2 shadow-sm", className)} {...props}>{content}</div>
    }

    const formattedLabel = labelFormatter ? labelFormatter(label as string) : label

    return (
      <div ref={ref} className={cn("rounded-lg border bg-background p-2 shadow-sm", className)} {...props}>
        {formattedLabel && <div className="mb-1 font-medium">{formattedLabel}</div>}
        <div className="grid gap-2">
          {payload.map((item, index) => {
            let formattedValue = item.value
            if (formatter) {
              const [value] = formatter(item.value, item.name, item)
              formattedValue = value
            } else if (valueFormatter) {
              formattedValue = valueFormatter(item.value)
            }

            return (
              <div key={index} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1">
                  <div className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                </div>
                <div className="text-xs font-medium">{formattedValue}</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltip.displayName = "ChartTooltip"

// Bar Chart Component
interface BarChartProps {
  data: any[]
  index: string
  categories: {
    name: string
    key: string
    color?: string
  }[]
  valueFormatter?: (value: number) => string
  className?: string
  showLegend?: boolean
  showTooltip?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showGrid?: boolean
  stack?: boolean
  horizontal?: boolean
  yAxisWidth?: number
}

const BarChart = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & BarChartProps
>(
  (
    { 
      data, 
      index, 
      categories, 
      valueFormatter = (value) => `${value}`, 
      className, 
      showLegend = true,
      showTooltip = true,
      showXAxis = true,
      showYAxis = true,
      showGrid = true,
      stack = false,
      horizontal = false,
      yAxisWidth = 40,
      ...props 
    },
    ref
  ) => {
    // Create a chart config from categories
    const chartConfig = categories.reduce<ChartConfig>((config, category) => {
      config[category.key] = {
        label: category.name,
        color: category.color,
      }
      return config
    }, {})

    return (
      <Chart ref={ref} className={cn("w-full h-full", className)} config={chartConfig} {...props}>
        <RechartsBarChart 
          data={data} 
          layout={horizontal ? "vertical" : "horizontal"}
          barGap={8}
          barSize={45}
          margin={{ 
            top: 10, 
            right: 0, 
            bottom: showLegend ? 30 : 10, 
            left: 0 
          }}
        >
          {/* Main grid lines */}
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="1 0" 
              horizontal={true} 
              vertical={false} 
              stroke="#e5e5e5" 
              opacity={1}
            />
          )}
          
          {/* Reference lines - only at x=0 and y=0 */}
          <ReferenceLine y={0} stroke="#e5e5e5" strokeWidth={1} />
          <ReferenceLine x={0} stroke="#e5e5e5" strokeWidth={1} />
          
          {/* Border lines - only at x=0 and y=0 */}
          <ReferenceLine y={0} stroke="#000000" strokeWidth={1} isFront={true} />
          <ReferenceLine x={0} stroke="#000000" strokeWidth={1} isFront={true} />
          
          {showXAxis && (
            horizontal ? (
              <YAxis 
                type="category"
                dataKey={index}
                tickLine={false}
                axisLine={true}
                tick={{ fontSize: 12 }}
                width={80}
                stroke="var(--chart-axis)"
                strokeWidth={1}
              />
            ) : (
              <XAxis
                type="category"
                dataKey={index}
                tickLine={false}
                axisLine={true}
                tick={{ fontSize: 12 }}
                height={20}
                stroke="var(--chart-axis)"
                strokeWidth={1}
              />
            )
          )}
          
          {showYAxis && (
            horizontal ? (
              <XAxis
                type="number"
                tickLine={false}
                axisLine={true}
                tick={{ fontSize: 12 }}
                tickFormatter={valueFormatter}
                height={20}
                stroke="var(--chart-axis)"
                strokeWidth={1}
              />
            ) : (
              <YAxis
                type="number"
                tickLine={false}
                axisLine={true}
                tick={{ fontSize: 12 }}
                tickFormatter={valueFormatter}
                width={40}
                stroke="var(--chart-axis)"
                strokeWidth={1}
              />
            )
          )}
          
          {showTooltip && (
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{label}</span>
                          {payload.map((entry, index) => (
                            <span
                              key={`item-${index}`}
                              className="flex items-center text-xs font-medium"
                            >
                              <span
                                className="mr-1 h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    entry.color ||
                                    `var(--color-${entry.dataKey})`,
                                }}
                              />
                              {entry.name}: {valueFormatter(entry.value as number)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
          )}
          
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={20}
              content={({ payload }) => {
                if (!payload?.length) return null

                return (
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-2">
                    {payload.map((item: any, index: number) => (
                      <div key={`${item.value}-${index}`} className="flex items-center gap-1">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )
              }}
            />
          )}
          
          {categories.map((category) => (
            <Bar
              key={category.key}
              dataKey={category.key}
              fill={category.color || `var(--color-${category.key})`}
              radius={0}
              barSize={45}
              stackId={stack ? "stack" : undefined}
            />
          ))}
        </RechartsBarChart>
      </Chart>
    )
  }
)
BarChart.displayName = "BarChart"

// Line Chart Component
interface LineChartProps {
  data: any[]
  index: string
  categories: {
    name: string
    key: string
    color?: string
  }[]
  valueFormatter?: (value: number) => string
  className?: string
  showLegend?: boolean
  showTooltip?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showGrid?: boolean
  yAxisWidth?: number
}

const LineChart = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & LineChartProps
>(
  (
    { 
      data, 
      index, 
      categories, 
      valueFormatter = (value) => `${value}`, 
      className, 
      showLegend = true,
      showTooltip = true,
      showXAxis = true,
      showYAxis = true,
      showGrid = true,
      yAxisWidth = 40,
      ...props 
    },
    ref
  ) => {
    // Create a chart config from categories
    const chartConfig = categories.reduce<ChartConfig>((config, category) => {
      config[category.key] = {
        label: category.name,
        color: category.color,
      }
      return config
    }, {})

    return (
      <Chart ref={ref} className={cn("w-full", className)} config={chartConfig} {...props}>
        <RechartsLineChart 
          data={data}
          margin={{ 
            top: 10, 
            right: 0, 
            bottom: showLegend ? 30 : 10, 
            left: 0 
          }}
        >
          {/* Main grid lines */}
          {showGrid && (
            <CartesianGrid 
              strokeDasharray="1 0" 
              horizontal={true} 
              vertical={false} 
              stroke="#e5e5e5" 
              opacity={1}
            />
          )}
          
          {/* Reference lines - only at x=0 and y=0 */}
          <ReferenceLine y={0} stroke="#e5e5e5" strokeWidth={1} />
          <ReferenceLine x={0} stroke="#e5e5e5" strokeWidth={1} />
          
          {/* Border lines - only at x=0 and y=0 */}
          <ReferenceLine y={0} stroke="#000000" strokeWidth={1} isFront={true} />
          <ReferenceLine x={0} stroke="#000000" strokeWidth={1} isFront={true} />
          
          {showXAxis && (
            <XAxis
              type="category"
              dataKey={index}
              tickLine={false}
              axisLine={true}
              tick={{ fontSize: 12 }}
              height={20}
              stroke="var(--chart-axis)"
              strokeWidth={1}
            />
          )}
          
          {showYAxis && (
            <YAxis
              type="number"
              tickLine={false}
              axisLine={true}
              tick={{ fontSize: 12 }}
              tickFormatter={valueFormatter}
              width={40}
              stroke="var(--chart-axis)"
              strokeWidth={1}
            />
          )}
          
          {showTooltip && (
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          <span className="text-sm font-bold">{label}</span>
                          {payload.map((entry, index) => (
                            <span
                              key={`item-${index}`}
                              className="flex items-center text-xs font-medium"
                            >
                              <span
                                className="mr-1 h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    entry.color ||
                                    `var(--color-${entry.dataKey})`,
                                }}
                              />
                              {entry.name}: {valueFormatter(entry.value as number)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
          )}
          
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={20}
              content={({ payload }) => {
                if (!payload?.length) return null

                return (
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-2">
                    {payload.map((item: any, index: number) => (
                      <div key={`${item.value}-${index}`} className="flex items-center gap-1">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )
              }}
            />
          )}
          
          {categories.map((category) => (
            <Line
              key={category.key}
              type="monotone"
              dataKey={category.key}
              stroke={category.color || `var(--color-${category.key})`}
              strokeWidth={2}
              dot={{ r: 4, strokeWidth: 2 }}
              activeDot={{ r: 6, strokeWidth: 2 }}
            />
          ))}
        </RechartsLineChart>
      </Chart>
    )
  }
)
LineChart.displayName = "LineChart"

// Pie Chart Component
interface PieChartProps {
  data: Array<{ name: string; value: number; color?: string }>
  valueFormatter?: (value: number) => string
  className?: string
  showLegend?: boolean
  showTooltip?: boolean
  innerRadius?: number
  outerRadius?: number
  paddingAngle?: number
}

const PieChart = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & PieChartProps
>(
  (
    { 
      data, 
      valueFormatter = (value) => `${value}`, 
      className, 
      showLegend = true,
      showTooltip = true,
      innerRadius = 0,
      outerRadius = 80,
      paddingAngle = 0,
      ...props 
    },
    ref
  ) => {
    // Create a chart config from data
    const chartConfig = data.reduce<ChartConfig>((config, item, index) => {
      config[`item-${index}`] = {
        label: item.name,
        color: item.color || `hsl(var(--chart-${(index % 10) + 1}))`,
      }
      return config
    }, {})

    return (
      <Chart ref={ref} className={cn("w-full", className)} config={chartConfig} {...props}>
        <RechartsPieChart
          margin={{ 
            top: 10, 
            right: 30, 
            bottom: showLegend ? 30 : 10, 
            left: 30 
          }}
        >
          {/* Pie charts don't use grid or reference lines */}
          {showTooltip && (
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-lg border bg-background p-2 shadow-sm">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col">
                          {payload.map((entry, index) => (
                            <span
                              key={`item-${index}`}
                              className="flex items-center text-xs font-medium"
                            >
                              <span
                                className="mr-1 h-2 w-2 rounded-full"
                                style={{
                                  backgroundColor:
                                    entry.color ||
                                    `var(--color-${entry.dataKey})`,
                                }}
                              />
                              {entry.name}: {valueFormatter(entry.value as number)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )
                }
                return null
              }}
            />
          )}
          
          {showLegend && (
            <Legend
              verticalAlign="bottom"
              height={20}
              content={({ payload }) => {
                if (!payload?.length) return null

                return (
                  <div className="flex flex-wrap items-center justify-center gap-4 text-xs mt-2">
                    {payload.map((item: any, index: number) => (
                      <div key={`${item.value}-${index}`} className="flex items-center gap-1">
                        <div
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="text-muted-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )
              }}
            />
          )}
          
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            innerRadius={innerRadius}
            outerRadius={outerRadius}
            paddingAngle={paddingAngle}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color || `hsl(var(--chart-${(index % 10) + 1}))`} 
              />
            ))}
          </Pie>
        </RechartsPieChart>
      </Chart>
    )
  }
)
PieChart.displayName = "PieChart"

export {
  Chart,
  ChartTooltip,
  BarChart,
  LineChart,
  PieChart,
}
