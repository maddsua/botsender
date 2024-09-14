
type ChatID = string | number;
type ParseMode = 'HTML' | 'MarkdownV2' | 'Markdown';

export interface SenderCredentials {
	chats: ChatID[];
	token: string;
};

export interface SenderProps extends SenderCredentials {
	mode?: ParseMode;
	content: string;
};

export type SenderResult = {
	ok: true;
	errors: null;
} | {
	ok: false;
	errors: SenderError[];
};

export interface SenderError {
	chat: ChatID;
	error: Error;
};

type ApiResponse = {
	ok: true;
} | {
	ok: false;
	error_code: number;
	description: string;
};

export const sendMessage = async (props: SenderProps): Promise<SenderResult> => {

	const endpoint = `https://api.telegram.org/bot${props.token}/sendMessage`;

	const batchResults = await Promise.all(props.chats.map(chat => postMessage({
		chat,
		endpoint,
		content: props.content,
		mode: props.mode || 'HTML',
	})));

	const errorResults: SenderError[] = batchResults.filter(item => !!item) as any;
	if (!errorResults.length) {
		return { ok: true, errors: null };
	}

	return { ok: false, errors: errorResults };
};

interface PostProps {
	endpoint: string;
	chat: ChatID;
	content: string;
	mode: ParseMode;
}

const postMessage = async (props: PostProps): Promise<SenderError | null> => {

	const { endpoint, chat, content, mode } = props;

	const request = new Request(endpoint, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			chat_id: chat,
			text: content,
			parse_mode: mode,
		})
	});

	const response = await fetch(request).catch(() => null);
	if (!response) {
		return { chat, error: new Error('Network error: failed to fetch') };
	}
	
	const result: ApiResponse | null = await response.json().catch(() => null);
	if (!result) {
		return { chat, error: new Error('API error: invalid json response') };
	}
	
	if (!result.ok) {
		return { chat, error: new Error(`${result.description} (${result.error_code})`) };
	}

	return null;
};
