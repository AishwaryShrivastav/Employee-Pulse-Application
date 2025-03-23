import { IsString, IsArray, ValidateNested, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsNumber()
  questionIndex: number;

  @IsString()
  @IsOptional()
  value: string | number;
}

export class CreateResponseDto {
  @IsString()
  surveyId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
} 