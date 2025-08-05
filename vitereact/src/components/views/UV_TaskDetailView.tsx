import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import { Link, useParams } from 'react-router-dom';
import { useAppStore } from '@/store/main';
import { taskSchema } from '@schema';
import { z } from 'zod';

const UV_TaskDetailView: React.FC = () => {
  const { task_id } = useParams<{ task_id: string }>();
  const authToken = useAppStore(state => state.authentication_state.auth_token);
  const [taskDetails, setTaskDetails] = useState<z.infer<typeof taskSchema>>({
    task_id: task_id || '',
    board_id: '',
    title: '',
    description: null,
    status: '',
    priority: '',
    due_date: null,
    assigned_user_id: null,
  });

  const fetchTaskDetails = async () => {
    const { data } = await axios.get(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/tasks/${task_id}`,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    return taskSchema.parse(data); // Use Zod parse for type validation
  };

  const updateTaskStatus = async (updatedTask: Partial<z.infer<typeof taskSchema>>) => {
    await axios.patch(
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/tasks/${task_id}`,
      updatedTask,
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
  };

  const { data, error, isLoading } = useQuery({
    queryKey: ['taskDetails', task_id],
    queryFn: fetchTaskDetails,
    enabled: !!task_id
  });

  const mutation = useMutation({
    mutationFn: updateTaskStatus,
    onSuccess: () => {
      // Refresh task details
      if (data) {
        setTaskDetails(current => ({ ...current, ...data }));
      }
    }
  });

  useEffect(() => {
    if (data) {
      setTaskDetails(data);
    }
  }, [data]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    setTaskDetails(prev => ({
      ...prev,
      status: newStatus
    }));
    mutation.mutate({ status: newStatus });
  };

  const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newPriority = e.target.value;
    setTaskDetails(prev => ({
      ...prev,
      priority: newPriority
    }));
    mutation.mutate({ priority: newPriority });
  };

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading task detail</div>;

  return (
    <>
      <div className="min-h-screen bg-white">
        <div className="max-w-2xl mx-auto p-4">
          <h1 className="text-2xl font-bold text-gray-800">
            Task Detail: {taskDetails.title}
          </h1>
          <p className="text-gray-600 mt-4">
            {taskDetails.description}
          </p>
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-gray-700 font-medium">Status</label>
              <select
                className="block w-full p-2 border border-gray-300 rounded mt-1"
                value={taskDetails.status}
                onChange={handleStatusChange}
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="text-gray-700 font-medium">Priority</label>
              <select
                className="block w-full p-2 border border-gray-300 rounded mt-1"
                value={taskDetails.priority}
                onChange={handlePriorityChange}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
            <div>
              <label className="text-gray-700 font-medium">Due Date</label>
              <input
                type="date"
                className="block w-full p-2 border border-gray-300 rounded mt-1"
                value={taskDetails.due_date ? taskDetails.due_date.toISOString().substr(0, 10) : ''}
                disabled
              />
            </div>
            <div>
              <Link to={`/kanban/${taskDetails.board_id}`} className="text-blue-600 hover:underline">
                Back to Kanban Board
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default UV_TaskDetailView;