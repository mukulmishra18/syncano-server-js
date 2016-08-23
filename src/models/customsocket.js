import stampit from 'stampit';
import {Meta, Model} from './base';
import {BaseQuerySet, List, Delete, Update, Create, Get} from '../querySet';
import _ from 'lodash';

const CustomSocketQuerySet = stampit().compose(
  BaseQuerySet,
  List,
  Create,
  Update,
  Delete,
  Get
)
.methods({

  recheck(properties = {}) {
    this.properties = _.assign({}, this.properties, properties);

    this.method = 'POST';
    this.endpoint = 'recheck';
    this.raw();

    return this;
  },

  runEndpoint(properties = {}, method = 'GET', payload = {}) {
    this.properties = _.assign({}, this.properties, properties);

    this.method = method;
    this.endpoint = 'endpoint';
    this.query = payload;
    this.raw();

    return this;
  }

})

const CustomSocketMeta = Meta({
  name: 'customsocket',
  pluralName: 'customsockets',
  endpoints: {
    'detail': {
      'methods': ['get', 'put', 'patch', 'delete'],
      'path': '/v1.1/instances/{instanceName}/sockets/{name}/'
    },
    'recheck': {
      'methods': ['post'],
      'path': '/v1.1/instances/{instanceName}/sockets/{name}/recheck/'
    },
    'list': {
      'methods': ['post', 'get'],
      'path': '/v1.1/instances/{instanceName}/sockets/'
    },
    'endpoint': {
      'methods': ['post', 'get', 'delete', 'patch', 'put'],
      'path': '/v1.1/instances/{instanceName}/endpoints/sockets/{endpoint_name}/'
    }
  }
});

const CostomSocketConstraints = {
  instanceName: {
    presence: true,
    length: {
      minimum: 5
    }
  },
  name: {
    presence: true
  },
  endpoints: {
    object: true
  },
  dependencies: {
    array: true
  }
};

/**
 * OO wrapper around CustomSocket.
 * @constructor
 * @type {CustomSocket}

 */
const CustomSocket = stampit()
  .compose(Model)
  .setQuerySet(CustomSocketQuerySet)
  .setMeta(CustomSocketMeta)
  .props({
    endpoints: {},
    endpointObjects: []
  })
  .methods({

    recheck() {
      const meta = this.getMeta();
      const path = meta.resolveEndpointPath('recheck', this);

      return this.makeRequest('POST', path);
    },

    addEndpoint(endpoint = {}) {
      this.endpoints = _.assign({}, this.endpoints, { [endpoint.name]: { calls: endpoint.scriptCalls }});
      this.endpointObjects = _.concat(this.endpointObjects, endpoint);
    },

    removeEndpoint(name) {
      _.unset(this.endpoints, name);
      this.endpointObjects = _.reject(this.endpointObjects, { name });
    },

    runEndpoint(endpoint_name, method, payload) {
      const meta = this.getMeta();
      const path = meta.resolveEndpointPath('endpoint', _.assign({}, this, {endpoint_name}));

      return this.makeRequest(method, path, {query: payload})
    }

  })
  .setConstraints(CostomSocketConstraints)

export default CustomSocket;
