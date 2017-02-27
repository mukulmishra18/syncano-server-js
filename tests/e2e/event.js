import {expect} from 'chai'

import server from '../../src'
import {getRandomString, createTestInstance, deleteTestInstance} from '../utils'

describe('Event', function () {
  let event = null
  const testEventName = getRandomString()
  const instanceName = getRandomString()

  before(function (done) {
    createTestInstance(instanceName)
      .then(instanceObj => {
        process.env.SYNCANO_INSTANCE_NAME = instanceObj.name
        process.env.SYNCANO_API_KEY = process.env.E2E_ACCOUNT_KEY
        event = server().event
        done()
      })
      .catch(err => {
        console.log(err)
        err.response.text()
          .then(text => {
            console.log(text)
            done(err)
          })
      })
  })

  after(function (done) {
    deleteTestInstance(instanceName)
      .then(() => {
        done()
      })
  })

  it('can emit event', function (done) {
    event.emit(testEventName, {dummyKey: 'dummy_value'})
      .then(event => {
        expect(event).to.be.empty  // eslint-disable-line no-unused-expressions
        done()
      })
      .catch(err => {
        console.log(err)
        done(err)
      })
  })
})