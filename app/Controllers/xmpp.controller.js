/**
 * XMPP Stuff
 */
const {client, xml} = require('@xmpp/client')
const id = require('@xmpp/id')
const {User} = require('../../models/index');

const {to, ReE, ReS, Sleep, FilterUser} = require('../../services/util.service');
const UserRepo = require('app/Repositories/UserRepository');

const NotificationHelper = require('app/Services/NotificationHelper');


module.exports.changeXmppPassword = async function (user, userMeta) {
    let newUserPass = 'dLKjinfadioafnansldJN3UONPUONUPUs' + user.id + 'sYasd8awSAz' +
        userMeta.email.substring(0, userMeta.email.search("@")) + 'Q!cfdvf5fSz';

    let newUserName = "User" + user.id;

    let msg2 = xml('iq', {type: 'set', id: 'change1'},
        xml('query', {xmlns: 'jabber:iq:register'},
            xml('username', {}, newUserName),
            xml('password', {}, newUserPass)));

    const xmpp = client({
        service: _config.xmpp.service,
        domain: _config.xmpp.domain,
        resource: _config.xmpp.resource,
        username: _config.xmpp.username,
        password: _config.xmpp.password
    })

    xmpp.on('error', err => {
        return err;
    })

    xmpp.on('stanza', async stanza => {
        console.log("************************************************************");
        console.log(stanza.toString());
        console.log("************************************************************");
        //await xmpp.stop()
    })

    // send register stanza
    xmpp.on('online', async address => {
        await xmpp.send(msg2);
    })

    xmpp.start().catch(console.error)

    await Sleep(200);
    await xmpp.stop();
}

const XMPPRegister = async function (user, userMeta) {
    let newUserPass = 'dLKjinfadioafnansldJN3UONPUONUPUs' + user.id + 'sYasd8awSAz' +
        userMeta.email.substring(0, userMeta.email.search("@")) + 'Q!cfdvf5fSz';

    let newUserName = "User" + user.id;

    let msg2 = xml('iq', {type: 'set', id: 'reg2'},
        xml('query', {xmlns: 'jabber:iq:register'},
            xml('username', {}, newUserName),
            xml('password', {}, newUserPass)));

    const xmpp = client({
        service: _config.xmpp.service,
        domain: _config.xmpp.domain,
        resource: _config.xmpp.resource,
        username: _config.xmpp.username,
        password: _config.xmpp.password
    })

    xmpp.on('error', err => {
        return err;
    })

    xmpp.on('stanza', async stanza => {
        console.log("************************************************************");
        console.log(stanza.toString());
        console.log("************************************************************");
        //await xmpp.stop()
    })

    // send register stanza
    xmpp.on('online', async address => {
        await xmpp.send(msg2);
    })

    xmpp.start().catch(console.error)

    await Sleep(200);
    await xmpp.stop();
}
module.exports.XMPPRegister = XMPPRegister;

/**
 *******************************************************************************
 * closes an open xmpp connection
 *
 * @param {XMPP Object} xmpp an open xmpp connection
 * @returns -
 */
const closeConnection = async function (xmpp) {
    await xmpp.stop();
}

/**
 *******************************************************************************
 * sends an xmpp message
 *
 * @param {html Request Object} req the current html request we are working on
 * @param {json Result Object} res the answer from the html request
 * @returns Message: 200 Successfully send message.
 */
const XMPPSendMessage = async function (req, res) {
    let user = req.user;
    let userMeta = req.userMeta;

    let UserPass = 'dLKjinfadioafnansldJN3UONPUONUPUs' + user.id + 'sYasd8awSAz' +
        userMeta.email.substring(0, userMeta.email.search("@")) + 'Q!cfdvf5fSz';

    let UserName = "User" + user.id;
    let Receiver = "User" + req.body.to + "@" + _config.xmpp.domain;
    let Message = req.body.message;

    const xmpp = client({
        service: _config.xmpp.service,
        domain: _config.xmpp.domain,
        resource: _config.xmpp.resource,
        username: UserName,
        password: UserPass,
    })

    xmpp.on('online', async address => {
        console.log('▶', 'online as', address.toString())

        // Sends a chat message
        const message = xml(
            'message',
            {type: 'chat', to: Receiver, id: id()},
            xml('active', {xmlns: 'http://jabber.org/protocol/chatstates'}),
            xml('body', {}, Message)
        )

        //console.log(message.toString());
        xmpp.send(message);

        NotificationHelper.sendNotification(req.body.to, {title: 'You have a new Message', text: Message});

        await Sleep(100);
        await xmpp.stop();
    })

    xmpp.on('error', err => {
        return ReE(res, err);
    })

    xmpp.start().catch(console.error)

    return ReS(res, {message: 'Successfully sent message.'}, 200);
}
module.exports.XMPPSendMessage = XMPPSendMessage;

/**
 *******************************************************************************
 * receives all offline xmpp messages and the ones from the archive
 *
 * @param {html Request Object} req the current html request we are working on
 * @param {json Result Object} res the answer from the html request
 * @returns - results will be delivered async from ParseStanzas
 */
const XMPPGetMessages = async function (req, res) {
    let stanzalist = [];
    let user = req.user;
    let userMeta = req.userMeta;

    let UserPass = 'dLKjinfadioafnansldJN3UONPUONUPUs' + user.id + 'sYasd8awSAz' +
        userMeta.email.substring(0, userMeta.email.search("@")) + 'Q!cfdvf5fSz';

    let UserName = "User" + user.id;

    const xmpp = client({
        service: _config.xmpp.service,
        domain: _config.xmpp.domain,
        resource: _config.xmpp.resource,
        username: UserName,
        password: UserPass,
    })

    const {iqCaller} = xmpp;

    xmpp.on('stanza', async stanza => {
        //console.log("**********************************************************");
        //console.log(stanza.toString());
        //console.log("**********************************************************");
        if (stanza.is('message')) {
            stanzalist.push(stanza);
        }
        if (stanza.is('iq')) {
            if (stanza.getChild('fin') != null) {
                await xmpp.stop();
                console.log("logoff");
                await ParseStanzas(stanzalist, req, res);
            }
        }
    })

    xmpp.on('online', async address => {
        console.log('▶', 'online as', address.toString())

        // Makes itself available
        await xmpp.send(xml('presence'))

        const QueryID = id();

        // get Archive
        const response = await iqCaller.request(
            xml('iq', {type: 'set', id: UserName},
                xml('query', {xmlns: 'urn:xmpp:mam:2', queryid: QueryID})),
            30 * 1000 // 30 seconds timeout - default
        )

    })

    xmpp.on('error', err => {
        return ReE(res, err);
    })

    xmpp.start().catch(console.error)

}
module.exports.XMPPGetMessages = XMPPGetMessages;

/**
 *******************************************************************************
 * returns the found messages to the user
 *
 * @param {html Request Object} req the current html request we are working on
 * @param {json Result Object} res the answer from the html request
 * @returns offline messages and archive messages
 */
const ParseStanzas = async function (stanzas, req, res) {
    let newmessages = [];
    let messages = [];
    let user = req.user;
    for (let i in stanzas) {
        let stanza = stanzas[i];
        let msgObj = {};
        if (stanza.attrs.type === undefined) {
            // archive message
            // ********************************************************************
            let realmessage =
                stanza.getChild('result').getChild('forwarded').getChild('message');

            //return from user
            let err, user_data;
            let UserID = realmessage.attrs.from.substring(
                4,
                realmessage.attrs.from.indexOf("@")
            );
            [err, user_data] = await to(UserRepo.userDetail({searchParams: {id: UserID}}));
            msgObj.from = FilterUser(user_data.toJSON());

            //return to user
            UserID = realmessage.attrs.to.substring(
                4,
                realmessage.attrs.from.indexOf("@")
            );
            [err, user_data] = await to(UserRepo.userDetail({searchParams: {id: UserID}}));
            if (user_data) {
                msgObj.to = FilterUser(user_data.toJSON());

                msgObj.text = realmessage.getChild('body').text();
                msgObj.date = stanza.getChild('result').getChild('forwarded').getChild('delay').attrs.stamp;

                messages.push(msgObj);
            }
        }
        else {
            // offline message
            // ********************************************************************
            let err, user_data;
            let UserID = stanza.attrs.from.substring(
                4,
                stanza.attrs.from.indexOf("@")
            );
            [err, user_data] = await to(UserRepo.userDetail({searchParams: {id: UserID}}));
            msgObj.from = FilterUser(user_data.toJSON());

            //return to user
            [err, user_data] = await to(UserRepo.userDetail({searchParams: {id: UserID}}));
            msgObj.to = FilterUser(user_data.toJSON());

            msgObj.text = stanza.getChild('body').text();
            msgObj.date = stanza.getChild('delay').attrs.stamp;
            newmessages.push(msgObj);
        }
    }

    return ReS(res,
        {newmessages: newmessages, messages: messages, success: true},
        200);
}

/**
 *******************************************************************************
 * sends automatic messages on invitations
 *
 * @param {html Request Object} req the current html request we are working on
 * @returns -
 */
const XMPPSendMessageInternal = async function (req) {
    let user = req.user;
    let userMeta = req.userMeta;

    let UserPass = 'dLKjinfadioafnansldJN3UONPUONUPUs' + user.id + 'sYasd8awSAz' +
        userMeta.email.substring(0, userMeta.email.search("@")) + 'Q!cfdvf5fSz';

    let UserName = "User" + user.id;
    let Receiver = "User" + req.body.to + "@" + _config.xmpp.domain;
    let Message = req.body.message;

    const xmpp = client({
        service: _config.xmpp.service,
        domain: _config.xmpp.domain,
        resource: _config.xmpp.resource,
        username: UserName,
        password: UserPass,
    });

    xmpp.on('online', async address => {
        console.log('▶', 'online as', address.toString())
        // Sends a chat message

        const message = xml(
            'message',
            {type: 'chat', to: Receiver, id: id()},
            xml('active', {xmlns: 'http://jabber.org/protocol/chatstates'}),
            xml('body', {}, Message)
        )

        xmpp.send(message);

        await Sleep(100);
        await xmpp.stop();
    })

    xmpp.on('error', err => {
        return err;
    })

    xmpp.start().catch(console.error)

    return null;
}
module.exports.XMPPSendMessageInternal = XMPPSendMessageInternal;
