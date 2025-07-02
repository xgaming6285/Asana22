import { PrismaClient } from '@prisma/client';
import { encryptMessageData } from './src/app/utils/encryption.js';

const prisma = new PrismaClient();

async function encryptExistingMessages() {
  try {
    console.log('Започвам криптиране на съществуващите съобщения...');
    
    // Вземи всички съобщения от базата данни
    const messages = await prisma.message.findMany();
    
    console.log(`Намерени ${messages.length} съобщения за криптиране`);
    
    if (messages.length === 0) {
      console.log('Няма съобщения за криптиране');
      return;
    }
    
    let encryptedCount = 0;
    let skippedCount = 0;
    
    for (const message of messages) {
      try {
        // Проверяваме дали съобщението вече е криптирано
        // Криптираните съобщения съдържат ':' в текста
        if (message.text.includes(':') && message.text.split(':').length === 2) {
          console.log(`Съобщение ${message.id} вече е криптирано, прескачам...`);
          skippedCount++;
          continue;
        }
        
        // Криптираме съобщението
        const encryptedData = encryptMessageData({ text: message.text });
        
        // Обновяваме съобщението в базата данни
        await prisma.message.update({
          where: { id: message.id },
          data: { text: encryptedData.text }
        });
        
        encryptedCount++;
        console.log(`Криптирано съобщение ${message.id}`);
        
      } catch (error) {
        console.error(`Грешка при криптиране на съобщение ${message.id}:`, error);
      }
    }
    
    console.log(`\nЗавършено!`);
    console.log(`Криптирани съобщения: ${encryptedCount}`);
    console.log(`Прескочени съобщения: ${skippedCount}`);
    console.log(`Общо съобщения: ${messages.length}`);
    
  } catch (error) {
    console.error('Грешка при криптиране на съобщенията:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Стартираме скрипта
encryptExistingMessages(); 