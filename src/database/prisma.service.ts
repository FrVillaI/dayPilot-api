import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * PrismaService
 * 
 * Este servicio extiende PrismaClient para integrarlo correctamente
 * con el ciclo de vida de NestJS.
 * 
 * Funciones principales:
 * - Mantener una única instancia (singleton) de conexión a la base de datos
 * - Conectar automáticamente cuando la aplicación inicia
 * - Desconectar correctamente cuando la aplicación se cierra
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy {

  /**
   * onModuleInit()
   * 
   * Este método se ejecuta automáticamente cuando NestJS
   * inicializa el módulo donde este servicio está registrado.
   * 
   * Aquí forzamos la conexión a la base de datos.
   * 
   * - Evita conexiones "lazy" (tardías)
   * - Detecta errores de conexión desde el inicio
   * - Asegura que la DB esté disponible antes de procesar requests
   */
  async onModuleInit() {
    await this.$connect();
  }

  /**
   * onModuleDestroy()
   * 
   * Este método se ejecuta automáticamente cuando la aplicación
   * se está cerrando (shutdown).
   * 
   * Aquí cerramos la conexión con la base de datos.
   * 
   * - Evita conexiones abiertas innecesarias
   * - Previene memory leaks
   * - Es clave en entornos como Docker o procesos con reinicios
   */
  async onModuleDestroy() {
    await this.$disconnect();
  }
}