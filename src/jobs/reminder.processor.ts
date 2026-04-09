import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import { Queue, Worker, Job } from 'bullmq';
import { PrismaService } from '../database/prisma.service';

/**
 * Estructura de los datos que viajarán en la cola (job)
 * 
 * Esto define qué información necesita un recordatorio
 * para ser procesado correctamente.
 */
interface ReminderJob {
  eventId: string;        // ID del evento asociado
  reminderId: string;     // ID del recordatorio en la DB
  minutesBefore: number;  // Cuántos minutos antes se dispara
}

/**
 * ReminderProcessor
 * 
 * Este servicio se encarga de:
 * 
 * 1. Crear una cola de recordatorios (Queue)
 * 2. Escuchar y procesar trabajos (Worker)
 * 3. Programar recordatorios en el tiempo (delayed jobs)
 * 4. Cancelar recordatorios
 * 
 * Tecnologías:
 * - BullMQ → manejo de colas
 * - Redis → almacenamiento de la cola
 * - Prisma → acceso a la base de datos
 */
@Injectable()
export class ReminderProcessor implements OnModuleDestroy {

  /**
   * Logger de NestJS para trazabilidad
   */
  private readonly logger = new Logger(ReminderProcessor.name);

  /**
   * Queue: donde se agregan los recordatorios
   */
  private queue!: Queue;

  /**
   * Worker: quien procesa los recordatorios
   */
  private worker!: Worker;

  /**
   * Constructor
   * 
   * Se ejecuta al crear el servicio.
   * Inicializa la cola y el worker automáticamente.
   */
  constructor(private prisma: PrismaService) {
    this.initQueue();
    this.initWorker();
  }

  /**
   * initQueue()
   * 
   * Inicializa la cola "reminders" en Redis.
   * 
   * Aquí se almacenan los trabajos pendientes.
   */
  private initQueue() {
    this.queue = new Queue('reminders', {
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
    });
  }

  /**
   * initWorker()
   * 
   * El Worker es quien escucha la cola y ejecuta los trabajos.
   * 
   * Cada vez que un job esté listo (delay cumplido),
   * este worker lo procesa automáticamente.
   */
  private initWorker() {
    this.worker = new Worker(
      'reminders',
      async (job: Job<ReminderJob>) => {
        this.logger.log(`Processing reminder for event: ${job.data.eventId}`);

        // Procesa el recordatorio
        await this.processReminder(job.data);
      },
      {
        connection: {
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379'),
        },
      },
    );

    /**
     * Evento: cuando un job se completa correctamente
     */
    this.worker.on('completed', (job) => {
      this.logger.log(`Reminder job ${job.id} completed`);
    });

    /**
     * Evento: cuando un job falla
     */
    this.worker.on('failed', (job, err) => {
      this.logger.error(`Reminder job ${job?.id} failed: ${err.message}`);
    });
  }

  /**
   * processReminder()
   * 
   * Lógica principal del recordatorio.
   * 
   * Flujo:
   * 1. Busca el evento en la base de datos
   * 2. Si no existe → aborta
   * 3. Ejecuta la acción (ej: notificación)
   * 4. Marca el recordatorio como enviado
   */
  private async processReminder(data: ReminderJob): Promise<void> {
    const { eventId, reminderId, minutesBefore } = data;

    // Buscar el evento en la DB
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });

    // Validación: evento eliminado o inexistente
    if (!event) {
      this.logger.warn(`Event ${eventId} not found`);
      return;
    }

    /**
     * Aquí iría la lógica real:
     * - enviar email
     * - push notification
     * - WhatsApp
     * 
     * Actualmente solo imprime en consola
     */
    console.log(`📢 RECORDATORIO: "${event.title}" en ${minutesBefore} minutos`);

    // Marcar como enviado en la base de datos
    await this.prisma.reminder.update({
      where: { id: reminderId },
      data: { sent: true },
    });
  }

  /**
   * scheduleReminder()
   * 
   * Programa un recordatorio en la cola.
   * 
   * Calcula cuánto tiempo falta para ejecutar el job
   * y lo agrega como "delayed job".
   */
  async scheduleReminder(
    eventId: string,
    reminderId: string,
    minutesBefore: number,
    eventDate: Date,
  ): Promise<void> {

    const now = new Date();

    // Momento exacto en que debe ejecutarse el recordatorio
    const reminderTime = new Date(
      eventDate.getTime() - minutesBefore * 60 * 1000
    );

    // Tiempo restante en milisegundos
    const delay = reminderTime.getTime() - now.getTime();

    /**
     * Si el tiempo ya pasó, no tiene sentido programarlo
     */
    if (delay <= 0) {
      this.logger.warn(`Reminder time already passed for event ${eventId}`);
      return;
    }

    /**
     * Se agrega el job a la cola con delay
     * 
     * jobId único permite:
     * - evitar duplicados
     * - cancelar fácilmente
     */
    await this.queue.add(
      'reminder',
      { eventId, reminderId, minutesBefore },
      { delay, jobId: `reminder-${reminderId}` },
    );

    this.logger.log(
      `Scheduled reminder for event ${eventId} in ${minutesBefore} minutes`
    );
  }

  /**
   * cancelReminder()
   * 
   * Cancela un recordatorio previamente programado.
   * 
   * Busca el job en Redis y lo elimina.
   */
  async cancelReminder(reminderId: string): Promise<void> {
    const job = await this.queue.getJob(`reminder-${reminderId}`);

    if (job) {
      await job.remove();
      this.logger.log(`Cancelled reminder ${reminderId}`);
    }
  }

  /**
   * onModuleDestroy()
   * 
   * Se ejecuta cuando la aplicación se apaga.
   * 
   * Cierra:
   * - Worker (procesador)
   * - Queue (conexión a Redis)
   */
  async onModuleDestroy() {
    await this.worker.close();
    await this.queue.close();
  }
}