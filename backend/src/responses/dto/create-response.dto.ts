import { IsString, IsArray, IsNotEmpty, ValidateNested, ArrayMinSize, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

class AnswerDto {
  @IsNumber()
  @IsNotEmpty()
  questionIndex: number;

  @IsString()
  @IsNotEmpty()
  value: string;
}

export class CreateResponseDto {
  @IsString()
  @IsNotEmpty()
  surveyId: string;

  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @Type(() => AnswerDto)
  answers: AnswerDto[];
}
