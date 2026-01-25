// src/chatbot/dto/send-message.dto.ts
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';
import { Sanitize } from '../../auth/decorators/sanitize.decorator';

export class SendMessageDto {
  @Sanitize()
  @IsString()
  @IsNotEmpty({ message: 'El mensaje no puede estar vacío' })
  @MaxLength(1000, {
    message: 'El mensaje no puede tener más de 1000 caracteres',
  })
  message: string;
}
