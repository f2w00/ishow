module.exports = {
    extension: {
        activate: () => {},
        beforeClose: () => {
            const { commonEvent } = require('./config/event.bus')
            commonEvent.emit('main:uaclient.close')
        },
    },
}
