const {expect} = require('chai');
const {ethers} = require('hardhat');
const {BigNumber} = ethers;
const {abs} = require("mathjs");
const assert = require("assert")

const expectRevert = async function (promise, expectedError) {
    promise.catch(() => {
    }); // Avoids uncaught promise rejections in case an input validation causes us to return early

    if (!expectedError) {
        throw Error("No revert reason specified: call expectRevert with the reason string, or use expectRevert.unspecified if your 'require' statement doesn't have one");
    }

    try {
        await promise;
    } catch (error) {
        if (error.message.indexOf(expectedError) === -1) {
            // When the exception was a revert, the resulting string will include only
            // the revert reason, otherwise it will be the type of exception (e.g. 'invalid opcode')
            const actualError = error.message.replace(/VM Exception while processing transaction: (revert )?/, '');

            if (actualError.startsWith("missing revert data in call exception")) {
                // ethers cannot get the correct revert msg, displaying "missing revert data in call exception..." instead
                return;
            }

            expect(actualError).to.equal(expectedError, 'Wrong kind of exception received');
        }
        return;
    }

    expect.fail('Expected an exception but none was received');
}

expectRevert.assertion = (promise) => expectRevert(promise, 'invalid opcode');
expectRevert.outOfGas = (promise) => expectRevert(promise, 'out of gas');
expectRevert.unspecified = (promise) => expectRevert(promise, 'revert');

const expectEvent = async function (promise, expectedEvent, expectedParams = {}) {
    assert(promise && expectedEvent)

    promise.catch(() => {
    }); // Avoids uncaught promise rejections in case an input validation causes us to return early

    return expectEventInReceipt(await promise, expectedEvent, expectedParams)
}

const expectEventInLogs = async function (promise, emitterContractName, expectedEvent, expectedParams = {}) {
    assert(promise && expectedEvent && emitterContractName)

    promise.catch(() => {
    }); // Avoids uncaught promise rejections in case an input validation causes us to return early

    return expectEventInLogsReceipt(await promise, emitterContractName, expectedEvent, expectedParams)
}

const getEventsFromTx = async function(promise) {
    assert(promise)

    promise.catch(() => {
    }); // Avoids uncaught promise rejections in case an input validation causes us to return early

    return getEventsFromTxReceipt(await promise)
}

const getEventsFromTxReceipt = async function(receipt) {
    assert(receipt)

    receipt = await receipt.wait()

    return receipt.events.map((event) => _eventName(event) + "(" + event.args + ")");
}

const expectEventInLogsReceipt = async function (receipt, emitterContractName, expectedEvent, expectedParams = {}) {
    assert(receipt && expectedEvent && emitterContractName)

    receipt = await receipt.wait()
    emitterContractName = await ethers.getContractFactory(emitterContractName)
    let eventPresent = false
    let eventsEmitted = []

    for (let event of receipt.events) {
        let eventLog = event
        try {
            eventLog = emitterContractName.interface.parseLog({topics: event.topics, data: event.data})
        } catch {
        }

        if (_eventName(eventLog) === expectedEvent) {
            if (await _eventArgumentsEquals(eventLog, expectedParams)) {
                eventPresent = true
                break
            } else {
                eventsEmitted.push(_eventName(eventLog) + "(" + eventLog.args + ")")
            }

        } else {
            eventsEmitted.push(_eventName(eventLog))
        }
    }
    expect(eventPresent).to.equal(true, 'Transaction didn\'t emit "' + expectedEvent + '" event. Events emitted: ' + eventsEmitted)
}

const expectEventInReceipt = async function (receipt, expectedEvent, expectedParams = {}) {
    assert(receipt && expectedEvent)

    receipt = await receipt.wait()
    let eventPresent = false
    let eventsEmitted = []

    for (let event of receipt.events) {
        if (_eventName(event) === expectedEvent) {
            if (await _eventArgumentsEquals(event, expectedParams)) {
                eventPresent = true
                break
            } else {
                eventsEmitted.push(_eventName(event) + "(" + event.args + ")")
            }

        } else {
            eventsEmitted.push(_eventName(event))
        }
    }
    expect(eventPresent).to.equal(true, 'Transaction didn\'t emit "' + expectedEvent + '" event. Events emitted: ' + eventsEmitted)
}

const _eventArgumentsEquals = async function (event, expectedParams) {
    for (let y in expectedParams) {
        if (event.args[y].toString() !== expectedParams[y].toString())
            return false;
    }

    return true;
}

const _eventName = function (event) {
    const res = event.event ? event.event : event.name;
    return res ? res.toString() : undefined;
}

const expectNoEvent = async function (promise, expectedEvent) {
    assert(promise && expectedEvent);

    promise.catch(() => {
    }); // Avoids uncaught promise rejections in case an input validation causes us to return early

    const receipt = await (await promise).wait()

    for (let x in receipt.events) {
        expect(_eventName(receipt.events[x])).not.to.equal(expectedEvent.toString(), 'Transaction emitted "' + expectedEvent + '" event (but shouldn\'t)')
    }
}

const expectFractionalAmount = function (amount1, amount2, precision = 10) {
    // 166666666666666666666 == 166666666666666666664
    expect(abs(BigNumber.from(amount1).sub(BigNumber.from(amount2)).toString()).toString().length).to.be.lessThanOrEqual(precision)
}

module.exports = {
    expectEvent,
    expectNoEvent,
    expectEventInReceipt,
    expectRevert,
    expectEventInLogs,
    expectEventInLogsReceipt,
    expectFractionalAmount,
    getEventsFromTx,
    getEventsFromTxReceipt,
}

