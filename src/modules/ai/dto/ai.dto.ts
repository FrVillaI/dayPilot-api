import { IsString, IsNotEmpty  } from 'class-validator';

/**
 * InterpretDto

 * DTO (Data Transfer Object) que define la estructura
 * de la petición que llega al backend.
 * 
 * Validación:
 * - input debe ser un string obligatorio
 */
export class InterpretDto {

  /**
   * Texto ingresado por el usuario.
   * 
   * Ejemplos:
   * - "Recuérdame mañana a las 5 llamar a Juan"
   * - "Elimina mi reunión del viernes"
   * - "¿Qué tengo hoy?"
   */
  @IsString()
  @IsNotEmpty()
  input!: string;
}
