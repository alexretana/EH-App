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
import { Task } from "@/types/mockData"
import { Edit, Trash2, Play, Pause, CheckCircle, RotateCcw, Clock, Target } from "lucide-react"

interface TaskDataTableProps {
  tasks: Task[]
  goals: any[]
  projects: any[]
  onEditTask: (task: Task) => void
  onDeleteTask: (id: string) => void
  onUpdateTaskStatus: (id: string, status: Task['status']) => void
}

export function TaskDataTable({
  tasks,
  goals,
  projects,
  onEditTask,
  onDeleteTask,
  onUpdateTaskStatus,
}: TaskDataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({})
  const [rowSelection, setRowSelection] = React.useState({})

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
              onClick={() => onDeleteTask(task.id)}
              className="glass-button text-danger hover:text-danger h-8 w-8 p-0"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
            
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
                  onClick={() => onUpdateTaskStatus(task.id, 'Not started')}
                  className="glass-button h-8 w-8 p-0"
                >
                  <Pause className="h-4 w-4" />
                </Button>
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
            
            {(task.status === 'Done' || task.status === 'Cancelled') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onUpdateTaskStatus(task.id, 'Active')}
                className="glass-button h-8 w-8 p-0"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
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
      <div className="glass-card rounded-xl overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-glass/20 glass-header">
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id} className="text-glass">
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
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-glass/10 hover:bg-glass/5"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="text-glass">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-glass-muted">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
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
  )
}