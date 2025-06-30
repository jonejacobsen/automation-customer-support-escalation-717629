```javascript
const zapier = require('zapier-platform-core');

const authentication = require('./authentication');
const triggers = require('./triggers');
const actions = require('./actions');
const searches = require('./searches');

const App = {
  version: require('./package.json').version,
  platformVersion: zapier.version,
  authentication: authentication,
  beforeRequest: [
    (request) => {
      request.headers['Content-Type'] = 'application/json';
      return request;
    },
  ],
  afterResponse: [
    (response) => {
      if (response.status >= 400) {
        throw new Error(`Unexpected status code ${response.status}`);
      }
      return response;
    },
  ],
  resources: {},
  triggers: triggers,
  actions: actions,
  searches: searches,
};

module.exports = App;
```

```javascript
// authentication.js
module.exports = {
  type: 'custom',
  fields: [
    {key: 'api_key', label: 'API Key', required: true, type: 'string'},
  ],
  test: (z, bundle) => {
    const promise = z.request({
      url: 'https://api.helpdesk.com/v1/health',
    });
    return promise.then((response) => {
      if (response.status !== 200) {
        throw new Error('Invalid API Key');
      }
    });
  },
};
```

```javascript
// triggers.js
module.exports = {
  newTicket: {
    noun: 'Ticket',
    display: {
      label: 'New Ticket',
      description: 'Triggered when a new high-priority ticket is created.',
    },
    operation: {
      perform: (z, bundle) => {
        const promise = z.request({
          url: 'https://hooks.zapier.com/hooks/catch/123456/abcdef',
          method: 'POST',
          body: JSON.stringify({ticket_priority: 'high'}),
        });
        return promise.then((response) => {
          return z.JSON.parse(response.content);
        });
      },
    },
  },
};
```

```javascript
// actions.js
module.exports = {
  assignTicket: {
    noun: 'Ticket',
    display: {
      label: 'Assign Ticket',
      description: 'Assign the ticket to the next available senior support agent.',
    },
    operation: {
      perform: (z, bundle) => {
        const promise = z.request({
          url: 'https://api.helpdesk.com/v1/tickets/assign',
          method: 'POST',
          body: JSON.stringify({
            ticket_id: bundle.inputData.ticket_id,
            agent_role: 'senior',
          }),
        });
        return promise.then((response) => {
          return z.JSON.parse(response.content);
        });
      },
      inputFields: [
        {key: 'ticket_id', required: true, type: 'string'},
      ],
    },
  },
  // Add other actions here
};
```

```javascript
// searches.js
module.exports = {
  // Add search operations here
};
```
Please note that this is a simplified example and does not include all the steps and actions described in the specification. You would need to add additional actions, triggers, and searches as needed, following the same pattern.