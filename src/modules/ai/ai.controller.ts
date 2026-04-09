import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';
import { InterpretDto } from './dto/ai.dto';
import { InterpretationResult } from './dto/ai.dto';

/**
 * AiController
 * 
 * Este controller expone endpoints relacionados con la IA
 * o interpretación de lenguaje natural.
 * 
 * Ruta base: /ai
 */
@Controller('ai')
export class AiController {

  /**
   * Inyección del servicio que contiene la lógica de interpretación
   */
  constructor(private readonly aiService: AiService) { }

  /**
   * POST /ai/interpret
   * 
   * Este endpoint recibe texto del usuario y lo envía
   * al servicio de IA para ser interpretado.
   * 
   * Flujo:
   * 1. Recibe el body (dto.input)
   * 2. NestJS valida el DTO (class-validator)
   * 3. Llama al AiService
   * 4. Retorna el resultado (InterpretationResult)
   * 
   * Ejemplo de request:
   * {
   *   "input": "Recuérdame mañana llamar a Juan"
   * }
   */
  @Post('interpret')
  async interpret(@Body() dto: InterpretDto): Promise<InterpretationResult> {
    return this.aiService.interpret(dto.input);
  }
}