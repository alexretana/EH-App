"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Task } from "@/types/mockData"
import { Edit, XCircle, Play, Pause, CheckCircle, RotateCcw, Clock, Target, Calendar } from "lucide-react"

interface TaskDataTableProps {
  tasks: Task[]
  goals: any[]
  projects: any[]
  onEditTask: (task: Task) => void
  onUpdateTaskStatus: (id: string, status: Task['status']) => void
}

export function TaskDataTable({
  tasks,
  goals,
  projects,
  onEditTask,
  onUpdateTaskStatus,
}: TaskDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})
  
  // Mobile card view component
  const TaskCard = ({ task }: { task: Task }) => {
    const goal = goals.find(g => g.id === task.goal_id);
    const project = goal ? projects.find(p => p.id === goal.project_id) : null;
    
    return (
      <motion.div
        key={task.id}
        className="glass-card p-4 rounded-xl glass-hover-level-1"
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{
          opacity: { duration: 0.2 },
          layout: { type: "spring", stiffness: 300, damping: 30 }
        }}
      >
        <CardHeader className="pb-3 px-0 pt-0">
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg text-glass line-clamp-2">{task.name}</CardTitle>
            <div className="flex gap-1">
              {task.status === 'Not started' && (
                <Button
                  size="sm"
                  onClick={() => onUpdateTaskStatus(task.id, 'Active')}
                  className="glass-button h-8 w-8 p-0"
                >
                  <Play className="h-4 w-4" />
                </Button>
              )}
              
              {task.status === 'Active' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateTaskStatus(task.id, 'Done')}
                    className="glass-button h-8 w-8 p-0"
                  >
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEditTask(task)}
                className="glass-button h-8 w-8 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdateTaskStatus(task.id, 'Cancelled')}
                className="glass-button text-danger hover:text-danger h-8 w-8 p-0"
              >
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
          {task.description && (
            <p className="text-sm text-glass-muted mt-1">{task.description}</p>
          )}
        </CardHeader>
        
        <CardContent className="px-0 pb-3">
          <div className="flex flex-wrap gap-2 mb-3">
            <Badge className={`text-xs ${getTaskTypeColor(task.task_type)}`}>
              {task.task_type}
            </Badge>
            <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
              {task.priority}
            </Badge>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
              {task.status}
            </span>
          </div>
          
          <div className="space-y-2 text-sm text-glass-muted">
            {project && goal && (
              <div>
                <span className="font-medium text-glass">Project/Goal:</span> {project.name} / {goal.name}
              </div>
            )}
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.time_estimate_minutes} min
              </div>
              
              {task.due_date && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(task.due_date).toLocaleDateString()}
                </div>
              )}
            </div>
            
            {task.assignee && (
              <div>
                <span className="font-medium text-glass">Assignee:</span> {task.assignee}
              </div>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="px-0 pt-0">
          <div className="flex gap-2 w-full">
            {task.status === 'Active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateTaskStatus(task.id, 'Not started')}
                className="glass-button flex-1"
              >
                <Pause className="h-3 w-3 mr-1" />
                Pause
              </Button>
            )}
            
            {(task.status === 'Done' || task.status === 'Cancelled') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateTaskStatus(task.id, 'Active')}
                className="glass-button flex-1"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reactivate
              </Button>
            )}
          </div>
        </CardFooter>
      </motion.div>
    );
  };

  const getTaskTypeColor = (taskType: string) => {
    switch (taskType) {
      case 'Network': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Debug': return 'bg-red-100 text-red-800 border-red-200';
      case 'Review': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Develop': return 'bg-green-100 text-green-800 border-green-200';
      case 'Marketing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Provision': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'Research': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-success/20 text-success';
      case 'Not started': return 'bg-warning/20 text-warning';
      case 'Done': return 'bg-info/20 text-info';
      case 'Cancelled': return 'bg-danger/20 text-danger';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const columns: ColumnDef<Task>[] = [
    {
      accessorKey: "name",
      header: "Task",
      cell: ({ row }) => (
        <div className="max-w-[200px]">
          <div className="font-medium text-glass">{row.getValue("name")}</div>
          {row.original.description && (
            <div className="text-sm text-glass-muted truncate">
              {row.original.description}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: "project_goal",
      header: "Project / Goal",
      cell: ({ row }) => {
        const goal = goals.find(g => g.id === row.original.goal_id);
        const project = goal ? projects.find(p => p.id === goal.project_id) : null;
        return (
          <div className="text-sm text-glass-muted">
            {project?.name} / {goal?.name}
          </div>
        );
      },
    },
    {
      accessorKey: "task_type",
      header: "Type",
      cell: ({ row }) => (
        <Badge className={`text-xs ${getTaskTypeColor(row.getValue("task_type"))}`}>
          {row.getValue("task_type")}
        </Badge>
      ),
    },
    {
      accessorKey: "priority",
      header: "Priority",
      cell: ({ row }) => (
        <Badge className={`text-xs ${getPriorityColor(row.getValue("priority"))}`}>
          {row.getValue("priority")}
        </Badge>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(row.getValue("status"))}`}>
          {row.getValue("status")}
        </span>
      ),
    },
    {
      accessorKey: "time_estimate_minutes",
      header: "Estimate",
      cell: ({ row }) => (
        <div className="flex items-center gap-1 text-sm text-glass-muted">
          <Clock className="h-3 w-3" />
          {row.getValue("time_estimate_minutes")} min
        </div>
      ),
    },
    {
      accessorKey: "due_date",
      header: "Due Date",
      cell: ({ row }) => {
        const dueDate = row.getValue("due_date") as string;
        return dueDate ? (
          <div className="flex items-center gap-1 text-sm text-glass-muted">
            <Target className="h-3 w-3" />
            {new Date(dueDate).toLocaleDateString()}
          </div>
        ) : (
          <div className="text-sm text-glass-muted">-</div>
        );
      },
    },
    {
      accessorKey: "assignee",
      header: "Assignee",
      cell: ({ row }) => {
        const assignee = row.getValue("assignee") as string;
        return assignee ? (
          <div className="text-sm text-glass-muted">{assignee}</div>
        ) : (
          <div className="text-sm text-glass-muted">-</div>
        );
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const task = row.original;
        
        return (
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEditTask(task)}
                  className="glass-button h-8 w-8 p-0"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit Task</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onUpdateTaskStatus(task.id, 'Cancelled')}
                  className="glass-button text-danger hover:text-danger h-8 w-8 p-0"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cancel Task</p>
              </TooltipContent>
            </Tooltip>
            
            {task.status === 'Not started' && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={() => onUpdateTaskStatus(task.id, 'Active')}
                    className="glass-button text-glass h-8 w-8 p-0"
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Start Task</p>
                </TooltipContent>
              </Tooltip>
            )}
            
            {task.status === 'Active' && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateTaskStatus(task.id, 'Not started')}
                      className="glass-button h-8 w-8 p-0"
                    >
                      <Pause className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Pause Task</p>
                  </TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onUpdateTaskStatus(task.id, 'Done')}
                      className="glass-button h-8 w-8 p-0"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Complete Task</p>
                  </TooltipContent>
                </Tooltip>
              </>
            )}
            
            {(task.status === 'Done' || task.status === 'Cancelled') && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onUpdateTaskStatus(task.id, 'Active')}
                    className="glass-button h-8 w-8 p-0"
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Reactivate Task</p>
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: tasks,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  return (
    <div className="w-full">
      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className="glass-card rounded-xl overflow-hidden">
          <ScrollArea className="w-full max-h-[600px]">
            <div className="min-w-[800px]">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <TableRow key={headerGroup.id} className="border-glass/20 glass-header">
                      {headerGroup.headers.map((header) => (
                        <TableHead key={header.id} className="text-glass whitespace-nowrap">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </TableHead>
                      ))}
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  <AnimatePresence mode="popLayout">
                    {table.getRowModel().rows?.length ? (
                      table.getRowModel().rows.map((row) => (
                        <motion.tr
                          key={row.original.uniqueKey || row.id}
                          data-state={row.getIsSelected() && "selected"}
                          className="border-glass/10 hover:bg-glass/5"
                          layout
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{
                            opacity: { duration: 0.2 },
                            layout: { type: "spring", stiffness: 300, damping: 30 }
                          }}
                        >
                          {row.getVisibleCells().map((cell) => (
                            <motion.td
                              key={cell.id}
                              className="text-glass p-2 border-t whitespace-nowrap"
                              layout
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </motion.td>
                          ))}
                        </motion.tr>
                      ))
                    ) : (
                      <motion.tr
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                      >
                        <TableCell colSpan={columns.length} className="h-24 text-center text-glass-muted">
                          No results.
                        </TableCell>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </div>
        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
            className="glass-button"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
            className="glass-button"
          >
            Next
          </Button>
        </div>
      </div>
      
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        <AnimatePresence mode="popLayout">
          {tasks.length ? (
            tasks.map((task) => (
              <TaskCard key={task.id} task={task} />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="glass-card p-6 rounded-xl text-center text-glass-muted"
            >
              No results.
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}