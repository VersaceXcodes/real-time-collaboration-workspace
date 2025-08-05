import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useAppStore } from '@/store/main';
import { Task, KanbanBoard } from '@schema';

const UV_KanbanBoard: React.FC = () => {
  const { board_id } = useParams<{ board_id: string }>();

  // Auth token from global state
  const authToken = useAppStore(state => state.authentication_state.auth_token);

  // Zustand operations or specific selectors can go here
  const [columns, setColumns] = useState<{ [key: string]: Task[] }>({});
  const queryClient = useQueryClient();

  // Fetch tasks for the board
  const { data: tasks, isLoading, isError } = useQuery<Task[], Error>(
    ['kanbanBoardTasks', board_id], 
    async () => {
      const { data } = await axios.get(`\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/kanban_boards/${board_id}/tasks`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      // Assuming data is of type Task[] and needs to be organized by column
      return data;
    },
    {
      enabled: !!authToken && !!board_id, // Only fetches if authToken and board_id are available
    }
  );

  const updateTaskStatus = useMutation(
    async ({ taskId, newStatus }: { taskId: string; newStatus: string }) => {
      await axios.patch(`\${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/tasks/${taskId}`, 
        { status: newStatus }, 
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['kanbanBoardTasks', board_id]);
      },
    }
  );

  useEffect(() => {
    if (tasks) {
      const organizedColumns = tasks.reduce((acc, task) => {
        if (!acc[task.status]) {
          acc[task.status] = [];
        }
        acc[task.status].push(task);
        return acc;
      }, {} as { [key: string]: Task[] });

      setColumns(organizedColumns);
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

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error fetching tasks</div>;

  return (
    <>
      <div className="min-h-screen bg-gray-100 p-4">
        <h1 className="text-2xl font-bold mb-4">Kanban Board</h1>
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
                    <h2 className="font-bold text-lg">{columnId}</h2>
                    {tasks.map((task, index) => (
                      <Draggable key={task.task_id} draggableId={task.task_id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-2 mt-2 bg-blue-100 rounded-md shadow-sm"
                          >
                            <div>{task.title}</div>
                          </div>
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