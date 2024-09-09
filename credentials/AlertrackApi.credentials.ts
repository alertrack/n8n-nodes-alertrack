import {
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class AlertrackApi implements ICredentialType {
	name = 'alertrackApi';
	displayName = 'Alertrack API';
	properties: INodeProperties[] = [
		{
			displayName: 'Client ID',
			name: 'clientId',
			type: 'string',
			default: '',
		},
		{
			displayName: 'Client Secret',
			name: 'clientSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
		},
	];
}
