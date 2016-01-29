import should from 'should/as-function';
import Promise from 'bluebird';
import _ from 'lodash';
import Syncano from '../../src/syncano';
import {ValidationError} from '../../src/errors';
import {suffix, credentials, createCleaner} from './utils';


describe('User', function() {
  this.timeout(15000);

  const cleaner = createCleaner();
  let connection = null;
  let Model = null;
  let Instance = null;
  const instanceName = suffix.get('instance');
  const data = {
    instanceName,
    username: 'testuser',
    password: 'y5k8Y4&-'
  }
  const data2 = {
    instanceName,
    username: 'testuser2',
    password: 'x5Z2f8*='
  }

  before(function() {
    connection = Syncano(credentials.getCredentials());
    Instance = connection.Instance;
    Model = connection.User;

    return Instance.please().create({name: instanceName});
  });

  afterEach(function() {
    return cleaner.clean();
  });

  after(function() {
    return Instance.please().delete({name: instanceName});
  });

  it('should be validated', function() {
    should(Model().save()).be.rejectedWith(ValidationError);
  });

  it('should require "instanceName"', function() {
    should(Model({username: data.username, password: data.password}).save()).be.rejectedWith(/instanceName/);
  });

  it('should require "password"', function() {
    should(Model({username: data.username, instanceName}).save()).be.rejectedWith(/password/);
  });

  it('should require "username"', function() {
    should(Model({instanceName, password: data.password}).save()).be.rejectedWith(/username/);
  });

it('should be able to save via model instance', function() {
    return Model(data).save()
      .then(cleaner.mark)
      .then((object) => {
        should(object).be.a.Object();
        should(object).have.property('instanceName').which.is.String().equal(instanceName);
        should(object).have.property('profile').which.is.Object();
        should(object).have.property('links').which.is.Object();
        should(object).have.property('groups').which.is.Array();
        should(object).have.property('username').which.is.String().equal(data.username);
        should(object).have.property('user_key').which.is.String();
      });
  });

  it('should be able to delete via model instance', function() {
    return Model(data).save()
      .then((object) => {
        should(object).be.a.Object();
        should(object).have.property('instanceName').which.is.String().equal(instanceName);
        should(object).have.property('profile').which.is.Object();
        should(object).have.property('links').which.is.Object();
        should(object).have.property('groups').which.is.Array();
        should(object).have.property('username').which.is.String().equal(data.username);
        should(object).have.property('user_key').which.is.String();

        return object.delete();
      });
  });

  describe('#please()', function() {

    it('should be able to list objects', function() {
      return Model.please().list({instanceName}).then((objects) => {
        should(objects).be.an.Array();
      });
    });

    it('should be able to create an object', function() {
      return Model.please().create(data)
        .then(cleaner.mark)
        .then((object) => {
          should(object).be.a.Object();
          should(object).have.property('instanceName').which.is.String().equal(instanceName);
          should(object).have.property('profile').which.is.Object();
          should(object).have.property('links').which.is.Object();
          should(object).have.property('groups').which.is.Array();
          should(object).have.property('username').which.is.String().equal(data.username);
          should(object).have.property('user_key').which.is.String();
        });
    });

    it('should be able to get an object', function() {
      return Model.please().create(data)
        .then(cleaner.mark)
        .then((object) => {
          should(object).be.a.Object();
          should(object).have.property('instanceName').which.is.String().equal(instanceName);
          should(object).have.property('profile').which.is.Object();
          should(object).have.property('links').which.is.Object();
          should(object).have.property('groups').which.is.Array();
          should(object).have.property('username').which.is.String().equal(data.username);
          should(object).have.property('user_key').which.is.String();

          return object;
        })
        .then((object) => {
          return Model
            .please()
            .get({ id: object.id, instanceName })
            .request();
        })
        .then((object) => {
          should(object).be.a.Object();
          should(object).have.property('instanceName').which.is.String().equal(instanceName);
          should(object).have.property('profile').which.is.Object();
          should(object).have.property('links').which.is.Object();
          should(object).have.property('groups').which.is.Array();
          should(object).have.property('username').which.is.String().equal(data.username);
          should(object).have.property('user_key').which.is.String();
        });
    });


    it('should be able to get first object (SUCCESS)', function() {
      const users = [
        data,
        data2
      ];

      return Promise
        .all(_.map(users, (user) => Model.please().create(user)))
        .then(cleaner.mark)
        .then(() => {
          return Model.please().first(data);
        })
        .then((object) => {
          should(object).be.an.Object();
        });
    });

    it('should be able to change page size', function() {
      const users = [
        data,
        data2
      ];

      return Promise
        .all(_.map(users, (user) => Model.please().create(user)))
        .then(cleaner.mark)
        .then((objects) => {
          should(objects).be.an.Array().with.length(2);
          return Model.please(data).pageSize(1);
        })
        .then((objects) => {
          should(objects).be.an.Array().with.length(1);
        });
    });

    it('should be able to change ordering', function() {
      const users = [
        data,
        data2
      ];
      let asc = null;

      return Promise
        .all(_.map(users, (user) => Model.please().create(user)))
        .then(cleaner.mark)
        .then((objects) => {
          should(objects).be.an.Array().with.length(2);
          return Model.please(data).ordering('asc');
        })
        .then((objects) => {
          should(objects).be.an.Array().with.length(2);
          asc = objects;
          return Model.please(data).ordering('desc');
        }).then((desc) => {
          const ascNames = _.map(asc, 'username');
          const descNames = _.map(desc, 'username');
          descNames.reverse();

          should(desc).be.an.Array().with.length(2);

          _.forEach(ascNames, (ascName, index) => {
            should(ascName).be.equal(descNames[index]);
          });
        });
    });

    it('should be able to get raw data', function() {
      return Model.please().list(data).raw().then((response) => {
        should(response).be.a.Object();
        should(response).have.property('objects').which.is.Array();
        should(response).have.property('next').which.is.null();
        should(response).have.property('prev').which.is.null();
      });
    });

  });

});