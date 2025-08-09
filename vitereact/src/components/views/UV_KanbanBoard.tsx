import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAppStore } from '@/store/main';
import { Task, CreateTaskInput } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from '@/components/ui/drawer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const UV_KanbanBoard: React.FC = () => {
  const { board_id } = useParams<{ board_id: string }>();

  // Auth token from global state
  const authToken = useAppStore(state => state.authentication_state.auth_token);

  // Zustand operations or specific selectors can go here
  const [columns, setColumns] = useState<{ [key: string]: Task[] }>({});
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [newTask, setNewTask] = useState<Partial<CreateTaskInput>>({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    due_date: '',
    assigned_user_id: ''
  });
  const queryClient = useQueryClient();

  // Default columns if no tasks exist
  const defaultColumns = ['To Do', 'In Progress', 'Review', 'Done'];

  // Fetch tasks for the board
  const { data: tasks, isLoading, isError } = useQuery({
    queryKey: ['kanbanBoardTasks', board_id],
    queryFn: async () => {
      const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/kanban_boards/${board_id}/tasks`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      // Assuming data is of type Task[] and needs to be organized by column
      return data;
    },
    enabled: !!authToken && !!board_id, // Only fetches if authToken and board_id are available
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: string }) => {
      await axios.patch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/tasks/${taskId}`, 
        { status: newStatus }, 
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanBoardTasks', board_id] });
    },
  });

  const createTask = useMutation({
    mutationFn: async (taskData: CreateTaskInput) => {
      const { data } = await axios.post(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/tasks`, 
        taskData, 
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanbanBoardTasks', board_id] });
      setIsCreateTaskOpen(false);
      setNewTask({
        title: '',
        description: '',
        status: 'To Do',
        priority: 'Medium',
        due_date: '',
        assigned_user_id: ''
      });
    },
  });

  useEffect(() => {
    if (tasks && Array.isArray(tasks)) {
      const organizedColumns = (tasks as Task[]).reduce((acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
      }, {} as { [key: string]: Task[] });

      // Ensure all default columns exist
      defaultColumns.forEach(column => {
        if (!organizedColumns[column]) {
          organizedColumns[column] = [];
        }
      });

      setColumns(organizedColumns);
    } else {
      // Initialize with empty default columns
      const emptyColumns = defaultColumns.reduce((acc, column) => {
        acc[column] = [];
        return acc;
      }, {} as { [key: string]: Task[] });
      setColumns(emptyColumns);
    }
  }, [tasks]);

  const onDragEnd = (result: any) => {
    const { destination, source, draggableId } = result;

    if (!destination) {
      return;
    }

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const start = columns[source.droppableId];
    const finish = columns[destination.droppableId];

    if (start === finish) {
      const newTaskIds = Array.from(start);
      const [movedTask] = newTaskIds.splice(source.index, 1);
      newTaskIds.splice(destination.index, 0, movedTask);

      const newColumn = {
        ...columns,
        [source.droppableId]: newTaskIds,
      };

      setColumns(newColumn);
      return;
    }

    // Moving from one list to another
    const startTaskIds = Array.from(start);
    const [movedTask] = startTaskIds.splice(source.index, 1);
    const finishTaskIds = Array.from(finish);
    finishTaskIds.splice(destination.index, 0, movedTask);

    const newState = {
      ...columns,
      [source.droppableId]: startTaskIds,
      [destination.droppableId]: finishTaskIds,
    };

    setColumns(newState);

    // Update task status in backend
    updateTaskStatus.mutate({ taskId: draggableId, newStatus: destination.droppableId });
  };

  const handleCreateTask = () => {
    if (!newTask.title || !board_id) return;
    
    const taskData: CreateTaskInput = {
      board_id: board_id === 'default' ? 'default-board-id' : board_id,
      title: newTask.title,
      description: newTask.description || '',
      status: newTask.status || 'To Do',
      priority: newTask.priority || 'Medium',
      due_date: newTask.due_date,
      assigned_user_id: newTask.assigned_user_id
    };
    
    createTask.mutate(taskData);
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (isError) return <div className="min-h-screen flex items-center justify-center">Error fetching tasks</div>;

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Kanban Board</h1>
          <Drawer open={isCreateTaskOpen} onOpenChange={setIsCreateTaskOpen}>
            <DrawerTrigger asChild>
              <Button>Create New Task</Button>
            </DrawerTrigger>
            <DrawerContent className="sm:max-w-[425px]">
              <DrawerHeader>
                <DrawerTitle>Create New Task</DrawerTitle>
              </DrawerHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <label htmlFor="title">Title</label>
                  <Input
                    id="title"
                    value={newTask.title}
                    onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                    placeholder="Enter task title"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="description">Description</label>
                  <Textarea
                    id="description"
                    value={newTask.description || ''}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    placeholder="Enter task description"
                  />
                </div>
                <div className="grid gap-2">
                  <label htmlFor="status">Status</label>
                  <Select value={newTask.status} onValueChange={(value) => setNewTask({ ...newTask, status: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {defaultColumns.map((column) => (
                        <SelectItem key={column} value={column}>{column}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="priority">Priority</label>
                  <Select value={newTask.priority} onValueChange={(value) => setNewTask({ ...newTask, priority: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <label htmlFor="due_date">Due Date</label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newTask.due_date || ''}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateTaskOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTask} disabled={!newTask.title || createTask.isPending}>
                  {createTask.isPending ? 'Creating...' : 'Create Task'}
                </Button>
              </div>
            </DrawerContent>
          </Drawer>
        </div>
        
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex space-x-4 overflow-x-auto">
            {Object.entries(columns).map(([columnId, tasks]) => (
              <Droppable droppableId={columnId} key={columnId}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-white p-4 rounded-md shadow-md min-w-xs w-1/4"
                  >
                    <h2 className="font-bold text-lg mb-3">{columnId}</h2>
                    {tasks.map((task, index) => (
                      <Draggable key={task.task_id} draggableId={task.task_id} index={index}>
                        {(provided) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="mb-2 cursor-move hover:shadow-md transition-shadow"
                          >
                            <CardContent className="p-3">
                              <div className="font-medium text-sm mb-1">{task.title}</div>
                              {task.description && (
                                <div className="text-xs text-gray-600 mb-2">{task.description}</div>
                              )}
                              <div className="flex justify-between items-center text-xs">
                                <span className={`px-2 py-1 rounded text-white ${
                                  task.priority === 'Critical' ? 'bg-red-500' :
                                  task.priority === 'High' ? 'bg-orange-500' :
                                  task.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                                }`}>
                                  {task.priority}
                                </span>
                                {task.due_date && (
                                  <span className="text-gray-500">
                                    {new Date(task.due_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </div>
    </>
  );
};

export default UV_KanbanBoard;