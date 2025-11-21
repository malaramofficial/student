'use server';
/**
 * @fileOverview Converts text to speech using the Gemini TTS model.
 *
 * - textToSpeechConversion - A function that converts text to an audio file.
 * - TextToSpeechConversionInput - The input type for the textToSpeechConversion function.
 * - TextToSpeechConversionOutput - The return type for the textToSpeechConversion function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import wav from 'wav';

const TextToSpeechConversionInputSchema = z.object({
  text: z.string().describe('The text to convert to speech (Hindi or English).'),
  voice: z.enum(['male', 'female']).default('female').describe('The voice to use for the speech.'),
});
export type TextToSpeechConversionInput = z.infer<typeof TextToSpeechConversionInputSchema>;

const TextToSpeechConversionOutputSchema = z.object({
  media: z.string().describe('The audio file as a data URI.'),
});
export type TextToSpeechConversionOutput = z.infer<typeof TextToSpeechConversionOutputSchema>;

export async function textToSpeechConversion(input: TextToSpeechConversionInput): Promise<TextToSpeechConversionOutput> {
  return textToSpeechConversionFlow(input);
}

const textToSpeechConversionFlow = ai.defineFlow(
  {
    name: 'textToSpeechConversionFlow',
    inputSchema: TextToSpeechConversionInputSchema,
    outputSchema: TextToSpeechConversionOutputSchema,
  },
  async (input) => {
    const voiceName = input.voice === 'male' ? 'Algenib' : 'Achernar';

    const { media } = await ai.generate({
      model: 'googleai/gemini-2.5-flash-tts-preview',
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName },
          },
        },
      },
      prompt: input.text,
    });
    if (!media) {
      throw new Error('no media returned');
    }
    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );
    return {
      media: 'data:audio/wav;base64,' + (await toWav(audioBuffer)),
    };
  }
);

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}
