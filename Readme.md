# Connect Mesh Web API - HCL Example Application

This example project demonstrates how to use the Connect Mesh Web API to connect to a mesh network via a gateway and send and receive messages.
The user will be asked to insert a token for the API and will then be able to select a network and a group from their account.

## Preview

https://webapi-example-hcl.cloud.connect-mesh.io/

## Usage

Before you begin, ensure you have met the following requirements:

- You have a mesh network set up with Mesh Connect, including a gateway and at least one group.
- You have an account with [Mesh Connect](https://cloud.connect-mesh.io/developer) and have access to your API token.

## API

Use your token to get the networks of the user. The networkId will be used in all following requests.
This example uses the GET:/api/core/networks endpoint to first get all networks of the user.
After that we list all groups using GET:/api/core/groups?networkId={networkId}.

To finally control the group we use PUT:/api/core/groups/power with the following body:

```js
{
	"networkId": networkId,
	"groupId": groupId,
	"power": "on' // or 'off',
	"acknowledged": false
}
```

We do the same with temperature: PUT:/api/core/groups/temperature

```js
{
	"networkId": networkId,
	"groupId": groupId,
	"temperature": 2700, // number between 2700-5000 K
	"acknowledged": false
}
```
