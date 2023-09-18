module.exports = {
    extension: {
        activate: () => {},
        beforeClose: async () => {
            const { commonEvent } = require('./event.bus')
            commonEvent.emit('main:uaclient.close')
        },
    },
}
