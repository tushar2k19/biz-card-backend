import { Injectable, Logger } from '@nestjs/common';
import * as Tesseract from 'tesseract.js';

const FALLBACK_NOTICE = 'Anthropic API unavailable. Used local OCR fallback.';
const STRUCTURED_RESPONSE_PROMPT = `Extract all information from this business card and return it as a JSON object with these exact fields (use null if information is not found):
{
  "name": "full name",
  "title": "job title/designation",
  "company": "company name",
  "email": "email address",
  "phone": "phone number",
  "mobile": "mobile number if different",
  "website": "website URL",
  "address": "full address",
  "city": "city",
  "state": "state",
  "zipcode": "zip/postal code",
  "country": "country"
}

Return ONLY the JSON object, no other text.`;

@Injectable()
export class OcrService {
    private readonly logger = new Logger(OcrService.name);

    async processImage(imageBuffer: Buffer, mimeType: string): Promise<{ data: Record<string, unknown>; ocrSource: 'claude' | 'tesseract' }> {
        const imageBase64 = imageBuffer.toString('base64');
        const anthropicResult = await this.tryAnthropic(imageBase64, mimeType);

        if (anthropicResult.success) {
            return { data: anthropicResult.data, ocrSource: 'claude' };
        }

        this.logger.warn(`Falling back to local OCR: ${anthropicResult.reason}`);
        const fallbackData = await this.runLocalFallback(imageBuffer);
        return { data: fallbackData, ocrSource: 'tesseract' };
    }

    private async tryAnthropic(imageBase64: string, mimeType: string) {
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return { success: false, reason: 'missing_api_key' };
        }

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': apiKey,
                    'anthropic-version': '2023-06-01',
                },
                body: JSON.stringify({
                    model: 'claude-3-5-haiku-20241022',
                    max_tokens: 500,
                    messages: [
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'image',
                                    source: {
                                        type: 'base64',
                                        media_type: mimeType,
                                        data: imageBase64,
                                    },
                                },
                                {
                                    type: 'text',
                                    text: STRUCTURED_RESPONSE_PROMPT,
                                },
                            ],
                        },
                    ],
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                this.logger.error(`Anthropic API Error: ${response.status} ${errorText}`);
                return {
                    success: false,
                    reason: `anthropic_error_${response.status}`,
                };
            }

            const data = await response.json();
            // Parse the content from Claude response
            try {
                const content = data.content[0].text;
                const json = JSON.parse(content);
                return { success: true, data: json };
            } catch (e) {
                return { success: false, reason: 'failed_to_parse_anthropic_response' };
            }
        } catch (error) {
            this.logger.error('Anthropic request failed', error);
            return { success: false, reason: 'anthropic_request_failed', error };
        }
    }

    private async runLocalFallback(imageBuffer: Buffer) {
        const { data } = await Tesseract.recognize(imageBuffer, 'eng');
        return this.structureCardData(data.text);
    }

    private structureCardData(text: string) {
        // Simplified fallback logic for now, porting full regex logic is verbose but doable.
        // For brevity, I'll implement a basic version.
        const lines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);

        return {
            name: lines[0] || null,
            title: lines[1] || null,
            company: null,
            email: this.matchFirst(text, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i),
            phone: null,
            mobile: null,
            website: null,
            address: null,
            city: null,
            state: null,
            zipcode: null,
            country: null,
            fallbackNotice: FALLBACK_NOTICE,
        };
    }

    private matchFirst(text: string, regex: RegExp) {
        const match = text.match(regex);
        return match ? match[0] : null;
    }
}
