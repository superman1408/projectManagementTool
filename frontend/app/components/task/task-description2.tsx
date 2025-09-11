import { useUpdateTaskDescriptionMutation } from '@/hooks/use-task';
import React, { useState } from 'react'

export const TaskDescription = ({
    description,
    taskId,
}: {
        description: string;
        taskId: string;
    }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [newDescription, setNewDescription] = useState(description);

    const { mutate, isPending } = useUpdateTaskDescriptionMutation();
  return (
      <div>{description}</div>
  )
}