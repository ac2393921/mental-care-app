import { Message } from '../types';

export interface LLMProvider {
  name: string;
  generateResponse(messages: Message[], systemPrompt?: string): Promise<string>;
}

class OpenAIProvider implements LLMProvider {
  name = 'OpenAI';
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(messages: Message[], systemPrompt?: string): Promise<string> {
    const openAIMessages = [
      {
        role: 'system',
        content: systemPrompt || this.getDefaultSystemPrompt(),
      },
      ...messages.slice(-10).map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      })),
    ];

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: openAIMessages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || 'すみません、お返事できませんでした。';
  }

  private getDefaultSystemPrompt(): string {
    return `あなたは親身で優しい友人です。ユーザーの悩みや相談に対して、共感的で温かい返答をしてください。

特徴:
- 友人のような親しみやすい口調
- 相手の気持ちに寄り添う
- 「あなたのせいじゃない」「十分頑張っている」などの慰めの言葉
- 簡潔で分かりやすい返答（200文字以内）
- 専門的な医学的アドバイスは避ける
- 前向きな気持ちになれるような言葉かけ

返答は日本語で、敬語は使わず、親しい友人として話しかけてください。`;
  }
}

class ClaudeProvider implements LLMProvider {
  name = 'Claude';
  private apiKey: string;
  private baseUrl = 'https://api.anthropic.com/v1';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generateResponse(messages: Message[], systemPrompt?: string): Promise<string> {
    const claudeMessages = messages.slice(-10).map(msg => ({
      role: msg.role === 'assistant' ? 'assistant' : 'user',
      content: msg.content,
    }));

    const response = await fetch(`${this.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Content-Type': 'application/json',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        system: systemPrompt || this.getDefaultSystemPrompt(),
        messages: claudeMessages,
      }),
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || 'すみません、お返事できませんでした。';
  }

  private getDefaultSystemPrompt(): string {
    return `あなたは親身で優しい友人です。ユーザーの悩みや相談に対して、共感的で温かい返答をしてください。

特徴:
- 友人のような親しみやすい口調
- 相手の気持ちに寄り添う
- 「あなたのせいじゃない」「十分頑張っている」などの慰めの言葉
- 簡潔で分かりやすい返答（200文字以内）
- 専門的な医学的アドバイスは避ける
- 前向きな気持ちになれるような言葉かけ

返答は日本語で、敬語は使わず、親しい友人として話しかけてください。`;
  }
}

class MockLLMProvider implements LLMProvider {
  name = 'Mock';

  async generateResponse(messages: Message[]): Promise<string> {
    const responses = [
      'そうですね、それは大変でしたね。あなたの気持ちがよく分かります。',
      'お疲れさまです。そんな時もありますよね。あなたは十分頑張っていると思います。',
      'つらい気持ちを話してくれてありがとうございます。一人で抱え込まなくて大丈夫ですよ。',
      'そんな風に感じるのも当然だと思います。あなたのせいではありませんよ。',
      'よく話してくれましたね。あなたの頑張りを認めてくれる人は必ずいますよ。',
      '大変な状況ですね。でも、あなたなら乗り越えられると信じています。',
      'その気持ち、とてもよく理解できます。無理をしすぎないでくださいね。',
      'あなたの感じ方は正しいです。自分の気持ちを大切にしてください。',
    ];

    // 簡単な感情分析（キーワードベース）
    const lastMessage = messages[messages.length - 1]?.content.toLowerCase() || '';
    let selectedResponse;

    if (lastMessage.includes('仕事') || lastMessage.includes('会社')) {
      selectedResponse = 'お仕事のこと、本当にお疲れさまです。頑張りすぎていませんか？あなたのペースで大丈夫ですよ。';
    } else if (lastMessage.includes('疲れ') || lastMessage.includes('しんどい')) {
      selectedResponse = 'とても疲れているんですね。ゆっくり休む時間を作ってくださいね。あなたは十分頑張っています。';
    } else if (lastMessage.includes('不安') || lastMessage.includes('心配')) {
      selectedResponse = '不安な気持ち、よく分かります。一人で抱え込まないで、いつでも話してくださいね。';
    } else {
      selectedResponse = responses[Math.floor(Math.random() * responses.length)];
    }

    // リアルな応答時間をシミュレート
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    return selectedResponse;
  }
}

export class LLMService {
  private provider: LLMProvider;

  constructor() {
    // 環境変数に基づいてプロバイダーを選択
    const openaiKey = process.env.OPENAI_API_KEY;
    const claudeKey = process.env.CLAUDE_API_KEY;

    if (openaiKey && openaiKey !== 'your_openai_api_key_here') {
      this.provider = new OpenAIProvider(openaiKey);
    } else if (claudeKey && claudeKey !== 'your_claude_api_key_here') {
      this.provider = new ClaudeProvider(claudeKey);
    } else {
      // デモ用のモックプロバイダー
      this.provider = new MockLLMProvider();
    }
  }

  async generateResponse(messages: Message[]): Promise<string> {
    try {
      return await this.provider.generateResponse(messages);
    } catch (error) {
      console.error('LLM Service Error:', error);
      
      // フォールバックとしてモックプロバイダーを使用
      if (!(this.provider instanceof MockLLMProvider)) {
        const mockProvider = new MockLLMProvider();
        return await mockProvider.generateResponse(messages);
      }
      
      return 'すみません、今お返事できない状態です。少し時間をおいてもう一度お話しかけてください。';
    }
  }

  getProviderName(): string {
    return this.provider.name;
  }
}