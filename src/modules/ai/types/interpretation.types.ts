export type CreateEventData = {
  title: string;
  startDate?: string;
  priority?: 'high' | 'medium' | 'low';
};

export type UpdateEventData = {
  eventId?: string;
  updates?: Partial<CreateEventData>;
};

export type DeleteEventData = {
  eventId?: string;
};

export type QueryEventsData = {
  date?: string;
};

/**
 * Resultado final del parser de IA
 */
export type InterpretationResult =
  | { action: 'create_event'; data: CreateEventData }
  | { action: 'update_event'; data: UpdateEventData }
  | { action: 'delete_event'; data: DeleteEventData }
  | { action: 'query_events'; data: QueryEventsData }
  | { action: 'unknown' };