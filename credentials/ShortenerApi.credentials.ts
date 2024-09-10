import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class ShortenerApi implements ICredentialType {
	name = 'shortenerApi';
	displayName = 'Shortener API';
	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'A API Key gerada automaticamente ao registrar um usuário no sistema.',
		},
	];
}
