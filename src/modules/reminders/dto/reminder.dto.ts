import { IsInt, Min, IsOptional } from 'class-validator';

export class CreateReminderDto {
  @IsInt()
  @Min(1)
  minutesBefore: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  additionalMinutesBefore?: number[];
}
