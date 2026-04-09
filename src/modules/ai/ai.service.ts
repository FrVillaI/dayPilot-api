import { Injectable } from '@nestjs/common';
import {
  InterpretationResult, CreateEventData,
  UpdateEventData,
  DeleteEventData,
  QueryEventsData,
} from './types/interpretation.types';

/**
 * AiService
 * 
 * Servicio encargado de interpretar texto en lenguaje natural
 * y convertirlo en acciones del sistema.
 * 
 * Este es un parser básico basado en reglas (keywords).
 */
@Injectable()
export class AiService {

  /**
   * interpret()
   * 
   * Método principal.
   * 
   * Recibe texto del usuario y determina qué acción ejecutar.
   * 
   * Retorna:
   * - action → tipo de operación
   */
   interpret(text: string): InterpretationResult {
    const lowerText = text.toLowerCase();

    // QUERY
    if (
      lowerText.includes('qué tengo') ||
      lowerText.includes('ver') ||
      lowerText.includes('mostrar') ||
      lowerText.includes('mis eventos')
    ) {
      return {
        action: 'query_events',
        data: this.extractDateQuery(text),
      };
    }

    // CREATE
    if (
      lowerText.includes('crea') ||
      lowerText.includes('agenda') ||
      lowerText.includes('recordar') ||
      lowerText.includes('reunión') ||
      lowerText.includes('cita')
    ) {
      return {
        action: 'create_event',
        data: this.extractEventData(text),
      };
    }

    // UPDATE
    if (
      lowerText.includes('actualiza') ||
      lowerText.includes('cambia') ||
      lowerText.includes('modifica')
    ) {
      return {
        action: 'update_event',
        data: this.extractUpdateData(text),
      };
    }

    // DELETE
    if (
      lowerText.includes('elimina') ||
      lowerText.includes('borra') ||
      lowerText.includes('cancela')
    ) {
      return {
        action: 'delete_event',
        data: this.extractDeleteData(text),
      };
    }

    return { action: 'unknown' };
  }

  // -------------------------
  // CREATE EVENT DATA
  // -------------------------
  private extractEventData(text: string): CreateEventData {
    const data: CreateEventData = {
      title: text,
      priority: 'medium',
    };

    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (text.toLowerCase().includes('mañana')) {
      data.startDate = tomorrow.toISOString();
    }

    if (text.toLowerCase().includes('hoy')) {
      data.startDate = now.toISOString();
    }

    const timeMatch = text.match(/(\d{1,2}):(\d{2})/);

    if (timeMatch && data.startDate) {
      const date = new Date(data.startDate);
      date.setHours(+timeMatch[1], +timeMatch[2], 0, 0);
      data.startDate = date.toISOString();
    }

    if (
      text.toLowerCase().includes('urgente') ||
      text.toLowerCase().includes('importante')
    ) {
      data.priority = 'high';
    } else if (text.toLowerCase().includes('bajo')) {
      data.priority = 'low';
    }

    return data;
  }

  // -------------------------
  // UPDATE EVENT DATA
  // -------------------------
  private extractUpdateData(text: string): UpdateEventData {
    return {
      updates: this.extractEventData(text),
    };
  }

  // -------------------------
  // DELETE EVENT DATA
  // -------------------------
  private extractDeleteData(text: string): DeleteEventData {
    return {
      eventId: undefined,
    };
  }

  // -------------------------
  // QUERY EVENTS DATA
  // -------------------------
  private extractDateQuery(text: string): QueryEventsData {
    const query: QueryEventsData = {};

    if (text.toLowerCase().includes('hoy')) {
      const now = new Date();
      query.date = now.toISOString().split('T')[0];
    }

    if (text.toLowerCase().includes('mañana')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.date = tomorrow.toISOString().split('T')[0];
    }

    return query;
  }
}