const express = require('express');
const bodyParser = require('body-parser');
const app = express();

const users = [
	{
		id: 1,
		name: 'John',
		friends: [2, 3, 4]
	},
	{
		id: 2,
		name: 'Mary',
		friends: [1]
	},
	{
		id: 3,
		name: 'Leo',
		friends: [1, 4]
	},
	{
		id: 4,
		name: 'Phill',
		friends: [1, 2, 3, 5]
	},
	{
		id: 5,
		name: 'Charles',
		friends: [4]
	}
];

app.get('/v1/users', bodyParser.json(), (req, res) => {
	let { limit = users.length, offset = 0 } = req.query;
	limit = parseInt(limit);
	offset = parseInt(offset);

	const list = getUsers(limit, offset);
	const next = hasNext(users, limit, offset);
	const last = hasPrevious(limit, offset);

	const data = [
		{
			users: list
		}
	];

	const links = {
		next,
		last
	};

	return res.status(200).send({
		data,
		links
	});
});

app.get('/v1/users/:uid', bodyParser.json(), (req, res) => {
	let { uid } = req.params;

	let user = users.find(user => {
		return user.id == uid;
	});

	if (user) {
		user = getRelationshipsUrls(user);
	} else {
		return res.status(404).send('Sorry, but there is no user with this id.');
	}

	return res.status(200).send({
		data: [user]
	});
});

function getUsers(limit = users.length, offset = 0) {
	const realLimit = limit + offset;
	const list = users.slice(offset, realLimit);
	return getRelationships(list);
}

function getRelationships(array) {
	return array.map(user => {
		return getRelationshipsUrls(user);
	});
}

function getRelationshipsUrls(user) {
	const urls = user.friends.map(id => {
		return `http://localhost:3000/v1/users/${id}`;
	});

	return {
		...user,
		relationships: urls
	};
}

function hasPrevious(limit = users.length, offset = 0) {
	const res = Math.abs(limit - offset);
	return res >= 0 && offset != 0
		? `http://localhost:3000/v1/users/?offset=${res}&limit=${limit}`
		: null;
}

const hasNext = (array, limit = users.length, offset = 0) => {
	const res = offset + limit;
	return res < array.length
		? `http://localhost:3000/v1/users/?offset=${res}&limit=${limit}`
		: null;
};

app.listen(3000, () => {
	console.log('Listen at http://localhost:3000');
});
