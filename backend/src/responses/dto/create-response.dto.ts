import { IsString, IsArray, ValidateNested, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class AnswerDto {
  @IsNumber()
  @IsNotEmpty()
  questionIndex: number;

  @IsOptional()
  value: string | number;
}

export class CreateResponseDto {
  @IsString()
  @IsNotEmpty()
  surveyId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
